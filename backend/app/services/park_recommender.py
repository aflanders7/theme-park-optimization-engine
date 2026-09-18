# backend/app/services/park_recommender.py
"""
Disney World park recommendation engine.

Given a trip window, party composition, preferences and hard constraints,
produces a day-by-day plan where every day is either "visit park X" or an
intentional rest day.

Scheduling approach
--------------------
The whole trip is optimized together with a small dynamic program instead of
greedily filling park days first and fitting rest days around what's left.
The DP walks the trip day by day and tracks just enough state to enforce the
hard constraints and score the soft goals:

    state = (day_index, last_park, parks_visited_so_far, park_days_used, streak)

- `last_park`      lets us penalize/avoid back-to-back repeats.
- `parks_visited`  a small bitmask, used for variety bonuses and to check
                   must-visit parks got scheduled.
- `park_days_used` lets us enforce the exact park_days count.
- `streak`         consecutive park days immediately before this point
                   (capped at STREAK_CAP), used to value rest days by how much
                   they actually break up the trip rather than just picking
                   the two lowest-scoring dates.

At each day the DP considers every legal action (rest, or visit any
available park) and keeps whichever leads to the highest total score over
the rest of the trip. Hard constraints (exact park_days, must-visit parks,
arrival/departure park-day eligibility, avoided parks) are enforced structurally
-- illegal states simply aren't reachable / are pruned -- rather than being
scoring bonuses that could be outbid by other preferences.

The number of trip days is small (the frontend caps ranges at 12 days), so
the full state space is a few tens of thousands of entries at most and a
plain memoized recursion is fast and easy to reason about; no external
solver or ML is involved.
"""

from __future__ import annotations

from datetime import date, timedelta
from typing import Dict, List, Optional, Tuple

from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.crowd import CrowdCalendar
from app.schemas.park_recommendation import (
    DailyParkPlan,
    ParkPreference,
    ParkRecommendationRequest,
    RestDayPlan,
    ThrillLevel,
)

PARKS: Tuple[str, ...] = ("magic_kingdom", "epcot", "hollywood_studios", "animal_kingdom")

PARK_ATTRIBUTES: Dict[str, Dict] = {
    "magic_kingdom": {
        "display_name": "Magic Kingdom",
        "thrill_score": 6,
        "food_score": 7,
        "cultural_score": 3,
        "nature_score": 4,
        "theme_score": 10,
        "toddler_score": 10,
        "preschool_score": 10,
        "grade_school_score": 9,
        "teen_score": 7,
        "infant_friendly": 10,
        "walking_intensity": 8,
    },
    "epcot": {
        "display_name": "Epcot",
        "thrill_score": 7,
        "food_score": 10,
        "cultural_score": 10,
        "nature_score": 6,
        "theme_score": 6,
        "toddler_score": 5,
        "preschool_score": 6,
        "grade_school_score": 7,
        "teen_score": 9,
        "infant_friendly": 7,
        "walking_intensity": 10,
    },
    "hollywood_studios": {
        "display_name": "Hollywood Studios",
        "thrill_score": 9,
        "food_score": 6,
        "cultural_score": 5,
        "nature_score": 3,
        "theme_score": 8,
        "toddler_score": 4,
        "preschool_score": 6,
        "grade_school_score": 9,
        "teen_score": 10,
        "infant_friendly": 6,
        "walking_intensity": 6,
    },
    "animal_kingdom": {
        "display_name": "Animal Kingdom",
        "thrill_score": 5,
        "food_score": 4,
        "cultural_score": 8,
        "nature_score": 10,
        "theme_score": 6,
        "toddler_score": 7,
        "preschool_score": 9,
        "grade_school_score": 9,
        "teen_score": 7,
        "infant_friendly": 8,
        "walking_intensity": 9,
    },
}

# --- Scoring weights (soft goals). Kept simple, deterministic and additive so
# the influence of each factor stays easy to reason about. ---
W_CROWD = 0.35
W_INTEREST = 0.30
W_FAMILY = 0.20
W_THRILL = 0.15

CROWD_EXPONENT = 1.6          # >1 => progressively punishes higher crowd levels
NEUTRAL_CROWD_ESTIMATE = 5.0  # used only when no crowd row exists for a park/date

REPEAT_PENALTY = 18.0   # same park as the immediately preceding park day
NEW_PARK_BONUS = 9.0    # first time this park is visited on the trip

STREAK_CAP = 3
# Value of taking a rest day, keyed by how many consecutive park days
# immediately preceded it (capped). A rest day right after a long park
# streak is worth much more than one that isn't breaking anything up.
REST_VALUE_BY_STREAK = {0: -6.0, 1: -1.0, 2: 9.0, 3: 18.0}
FAMILY_REST_MULTIPLIER = 1.25  # rest days matter more with young kids/infants along

THRILL_TARGET = {
    ThrillLevel.LOW: 2.0,
    ThrillLevel.MODERATE: 5.5,
    ThrillLevel.HIGH: 9.0,
}


def to_user_crowd_level(raw_occupancy: float) -> int:
    """Map a raw 0-10 predicted occupancy value to the 1-10 level shown to users."""
    raw_occupancy = max(0, min(10, raw_occupancy))
    level = 1 + 9 * (raw_occupancy / 10) ** 0.85
    return max(1, min(10, round(level)))


class ParkRecommendationEngine:
    def __init__(self, db: Session):
        self.db = db

    # ------------------------------------------------------------------ #
    # Entry point
    # ------------------------------------------------------------------ #
    def recommend_parks(self, request: ParkRecommendationRequest) -> Dict:
        all_dates = self._get_date_range(request.start_date, request.end_date)
        available_parks = self._validate_and_get_available_parks(request, all_dates)

        crowd_lookup, crowd_available = self._load_crowd_lookup(all_dates, available_parks)

        schedule, day_meta = self._optimize_schedule(
            request, all_dates, available_parks, crowd_lookup, crowd_available
        )

        daily_plans = self._build_daily_plans(schedule, day_meta, request)
        rest_days = self._build_rest_days(schedule, all_dates, day_meta, request)

        summary = self._generate_summary(daily_plans, rest_days, all_dates)
        optimization_notes = self._generate_optimization_notes(daily_plans, rest_days, request, all_dates)

        return {
            "daily_plans": daily_plans,
            "rest_days": rest_days,
            "summary": summary,
            "optimization_notes": optimization_notes,
        }

    # ------------------------------------------------------------------ #
    # Validation
    # ------------------------------------------------------------------ #
    def _validate_and_get_available_parks(
        self, request: ParkRecommendationRequest, all_dates: List[date]
    ) -> List[str]:
        if request.end_date < request.start_date:
            raise ValueError("end_date cannot be before start_date.")

        trip_days = len(all_dates)

        unknown = [p for p in (*request.must_visit_parks, *request.avoid_parks) if p not in PARKS]
        if unknown:
            raise ValueError(f"Unknown park name(s): {', '.join(sorted(set(unknown)))}.")

        conflict = set(request.must_visit_parks) & set(request.avoid_parks)
        if conflict:
            raise ValueError(
                f"These parks are both must-visit and avoided, which is impossible: {', '.join(sorted(conflict))}."
            )

        available_parks = [p for p in PARKS if p not in request.avoid_parks]
        if not available_parks:
            raise ValueError("Every park has been excluded via avoid_parks; at least one park must remain available.")

        if request.park_days > trip_days:
            raise ValueError(
                f"Requested {request.park_days} park day(s), but the trip is only {trip_days} day(s) long."
            )

        if request.max_park_days is not None and request.max_park_days < request.park_days:
            raise ValueError(
                f"park_days ({request.park_days}) exceeds the max_park_days limit ({request.max_park_days})."
            )

        if len(request.must_visit_parks) > request.park_days:
            raise ValueError(
                f"{len(request.must_visit_parks)} must-visit park(s) requested but only "
                f"{request.park_days} park day(s) are scheduled."
            )

        if request.child_ages and len(request.child_ages) != request.children:
            raise ValueError(
                f"Received {len(request.child_ages)} child age(s) but children={request.children}."
            )

        return available_parks

    # ------------------------------------------------------------------ #
    # Data loading
    # ------------------------------------------------------------------ #
    def _get_date_range(self, start: date, end: date) -> List[date]:
        dates = []
        current = start
        while current <= end:
            dates.append(current)
            current += timedelta(days=1)
        return dates

    def _load_crowd_lookup(
        self, all_dates: List[date], available_parks: List[str]
    ) -> Tuple[Dict[Tuple[date, str], float], Dict[Tuple[date, str], bool]]:
        """Returns (raw crowd value per (date, park), whether real data existed)."""
        if not all_dates:
            return {}, {}

        records = (
            self.db.query(CrowdCalendar)
            .filter(and_(CrowdCalendar.date >= all_dates[0], CrowdCalendar.date <= all_dates[-1]))
            .all()
        )

        crowd_lookup: Dict[Tuple[date, str], float] = {}
        for record in records:
            crowd_lookup[(record.date, record.park)] = record.crowd

        available = {}
        for d in all_dates:
            for p in available_parks:
                available[(d, p)] = (d, p) in crowd_lookup

        # Missing data is never treated as an authoritative prediction: fall
        # back to a neutral midpoint value and let callers know via `available`.
        for d in all_dates:
            for p in available_parks:
                if (d, p) not in crowd_lookup:
                    crowd_lookup[(d, p)] = NEUTRAL_CROWD_ESTIMATE

        return crowd_lookup, available

    # ------------------------------------------------------------------ #
    # Scoring
    # ------------------------------------------------------------------ #
    def _crowd_component(self, raw_crowd: float) -> float:
        raw_crowd = max(0.0, min(10.0, raw_crowd))
        return 1.0 - (raw_crowd / 10.0) ** CROWD_EXPONENT

    def _interest_component(self, park: str, preferences: List[ParkPreference]) -> float:
        if not preferences:
            return 0.6  # mildly positive default so crowd/family still dominate
        attrs = PARK_ATTRIBUTES[park]
        values = []
        for pref in preferences:
            if pref == ParkPreference.THRILLS:
                values.append(attrs["thrill_score"] / 10)
            elif pref == ParkPreference.FOOD_DRINKS:
                values.append(attrs["food_score"] / 10)
            elif pref == ParkPreference.ANIMALS_NATURE:
                values.append(attrs["nature_score"] / 10)
            elif pref == ParkPreference.THEMES:
                values.append(attrs["theme_score"] / 10)
            elif pref == ParkPreference.CULTURAL:
                values.append(attrs["cultural_score"] / 10)
        return sum(values) / len(values) if values else 0.6

    def _family_component(self, park: str, request: ParkRecommendationRequest) -> float:
        attrs = PARK_ATTRIBUTES[park]
        if request.children == 0 and request.infants == 0:
            return 0.75  # neutral: every park works fine for an adults-only party

        values = []
        if request.infants > 0:
            values.append(attrs["infant_friendly"] / 10)
        for age in request.child_ages:
            if age <= 3:
                values.append(attrs["toddler_score"] / 10)
            elif age <= 6:
                values.append(attrs["preschool_score"] / 10)
            elif age <= 12:
                values.append(attrs["grade_school_score"] / 10)
            else:
                values.append(attrs["teen_score"] / 10)

        family_score = sum(values) / len(values) if values else 0.7
        if request.infants > 0 and attrs["walking_intensity"] >= 9:
            family_score = max(0.0, family_score - 0.1)
        return family_score

    def _thrill_component(self, park: str, thrill_level: ThrillLevel) -> float:
        target = THRILL_TARGET[thrill_level]
        attrs = PARK_ATTRIBUTES[park]
        return max(0.0, 1.0 - abs(target - attrs["thrill_score"]) / 10)

    def _day_park_score(
        self, park: str, raw_crowd: float, request: ParkRecommendationRequest
    ) -> float:
        crowd = self._crowd_component(raw_crowd)
        interest = self._interest_component(park, request.park_preferences)
        family = self._family_component(park, request)
        thrill = self._thrill_component(park, request.thrill_level)
        return 100 * (W_CROWD * crowd + W_INTEREST * interest + W_FAMILY * family + W_THRILL * thrill)

    def _rest_value(self, streak_before: int, request: ParkRecommendationRequest) -> float:
        value = REST_VALUE_BY_STREAK.get(streak_before, REST_VALUE_BY_STREAK[STREAK_CAP])
        if request.infants > 0 or (request.child_ages and min(request.child_ages) <= 6):
            value *= FAMILY_REST_MULTIPLIER
        return value

    # ------------------------------------------------------------------ #
    # Dynamic program
    # ------------------------------------------------------------------ #
    def _optimize_schedule(
        self,
        request: ParkRecommendationRequest,
        all_dates: List[date],
        available_parks: List[str],
        crowd_lookup: Dict[Tuple[date, str], float],
        crowd_available: Dict[Tuple[date, str], bool],
    ) -> Tuple[List[Tuple[date, Optional[str]]], Dict[date, Dict]]:
        n = len(all_dates)
        park_days = request.park_days
        park_index = {p: i for i, p in enumerate(available_parks)}
        must_bits = 0
        for p in request.must_visit_parks:
            must_bits |= 1 << park_index[p]

        # Precompute each park's raw score contribution per day (state-independent part).
        base_score = {
            (day, p): self._day_park_score(p, crowd_lookup[(all_dates[day], p)], request)
            for day in range(n)
            for p in available_parks
        }

        memo: Dict[Tuple[int, int, int, int, int], float] = {}
        choice: Dict[Tuple[int, int, int, int, int], Tuple] = {}

        def rec(day: int, last_park: int, visited: int, used: int, streak: int) -> float:
            if day == n:
                if used == park_days and (visited & must_bits) == must_bits:
                    return 0.0
                return float("-inf")

            key = (day, last_park, visited, used, streak)
            if key in memo:
                return memo[key]

            best = float("-inf")
            best_choice: Optional[Tuple] = None

            # Rest is always a legal action - park_on_arrival/park_on_departure
            # never force a park visit, they only gate whether a park visit is
            # allowed at all on that specific day (see park_allowed_today below).
            if used <= park_days:
                gain = self._rest_value(streak, request)
                total = gain + rec(day + 1, last_park, visited, used, 0)
                if total > best:
                    best, best_choice = total, ("rest",)

            # A park visit is only considered on the arrival day if
            # park_on_arrival is enabled, and on the departure day only if
            # park_on_departure is enabled. If disabled, that day must be a
            # rest day. If enabled, the optimizer is free to choose either a
            # park visit or a rest day based on overall itinerary score - it
            # is an allowance, not a requirement.
            park_allowed_today = True
            if day == 0 and not request.park_on_arrival:
                park_allowed_today = False
            if day == n - 1 and not request.park_on_departure:
                park_allowed_today = False

            if park_allowed_today and used < park_days:
                for p in available_parks:
                    pi = park_index[p]
                    gain = base_score[(day, p)]
                    if last_park == pi:
                        gain -= REPEAT_PENALTY
                    if not (visited >> pi) & 1:
                        gain += NEW_PARK_BONUS
                    new_streak = min(streak + 1, STREAK_CAP)
                    total = gain + rec(day + 1, pi, visited | (1 << pi), used + 1, new_streak)
                    if total > best:
                        best, best_choice = total, ("park", p, pi)

            memo[key] = best
            choice[key] = best_choice
            return best

        result = rec(0, -1, 0, 0, 0)
        if result == float("-inf"):
            raise ValueError(
                "No valid itinerary satisfies these constraints together "
                "(check must-visit parks, avoided parks, and arrival/departure requirements)."
            )

        schedule: List[Tuple[date, Optional[str]]] = []
        day_meta: Dict[date, Dict] = {}
        day, last_park, visited, used, streak = 0, -1, 0, 0, 0
        while day < n:
            key = (day, last_park, visited, used, streak)
            action = choice[key]
            the_date = all_dates[day]
            if action[0] == "rest":
                schedule.append((the_date, None))
                day_meta[the_date] = {"streak_before": streak}
                streak = 0
            else:
                _, p, pi = action
                is_new = not (visited >> pi) & 1
                schedule.append((the_date, p))
                day_meta[the_date] = {
                    "is_new_park": is_new,
                    "was_repeat": last_park == pi,
                    "crowd_raw": crowd_lookup[(the_date, p)],
                    "crowd_available": crowd_available.get((the_date, p), False),
                }
                visited |= 1 << pi
                last_park = pi
                streak = min(streak + 1, STREAK_CAP)
                used += 1
            day += 1

        return schedule, day_meta

    # ------------------------------------------------------------------ #
    # Response assembly
    # ------------------------------------------------------------------ #
    def _build_daily_plans(
        self,
        schedule: List[Tuple[date, Optional[str]]],
        day_meta: Dict[date, Dict],
        request: ParkRecommendationRequest,
    ) -> List[DailyParkPlan]:
        plans = []
        for the_date, park in schedule:
            if park is None:
                continue
            meta = day_meta[the_date]
            attrs = PARK_ATTRIBUTES[park]
            crowd_level = to_user_crowd_level(meta["crowd_raw"])

            plans.append(
                DailyParkPlan(
                    date=the_date,
                    park=park,
                    park_display_name=attrs["display_name"],
                    crowd_level=crowd_level,
                    crowd_data_available=meta["crowd_available"],
                    is_must_visit=park in request.must_visit_parks,
                    reasons=self._generate_reasons(park, crowd_level, meta, request),
                    tips=self._generate_tips(park, crowd_level, meta, request),
                )
            )
        return plans

    def _build_rest_days(
        self,
        schedule: List[Tuple[date, Optional[str]]],
        all_dates: List[date],
        day_meta: Dict[date, Dict],
        request: ParkRecommendationRequest,
    ) -> List[RestDayPlan]:
        rest_days = []
        for the_date, park in schedule:
            if park is not None:
                continue
            streak_before = day_meta[the_date]["streak_before"]
            if the_date == all_dates[0]:
                note = "Kept your arrival day open to check in and settle in before hitting the parks."
            elif the_date == all_dates[-1]:
                note = "Left your departure day free for packing and travel instead of rushing from a park."
            elif streak_before >= 2:
                note = f"Placed after {streak_before} park days in a row to avoid burnout before the next one."
            else:
                note = "A breather day worked into the schedule between park days."
            rest_days.append(RestDayPlan(date=the_date, note=note))
        return rest_days

    def _generate_reasons(
        self, park: str, crowd_level: int, meta: Dict, request: ParkRecommendationRequest
    ) -> List[str]:
        reasons = []
        attrs = PARK_ATTRIBUTES[park]

        if not meta["crowd_available"]:
            reasons.append("No crowd forecast was available for this date, so this reflects your other preferences.")
        elif crowd_level <= 3:
            reasons.append("Predicted crowds are low here - one of the best days on your trip to visit.")
        elif crowd_level <= 6:
            reasons.append("Moderate predicted crowds - a solid, balanced day at this park.")
        else:
            reasons.append("This was the best day available for this park despite higher predicted crowds.")

        if park in request.must_visit_parks:
            reasons.append("You marked this park as a must-visit, so it's guaranteed a spot in your plan.")

        for pref in request.park_preferences:
            if pref == ParkPreference.FOOD_DRINKS and park == "epcot":
                reasons.append("Matches your interest in food and drinks - the World Showcase is unmatched for this.")
            elif pref == ParkPreference.THRILLS and attrs["thrill_score"] >= 8:
                reasons.append("Matches your interest in thrill rides.")
            elif pref == ParkPreference.ANIMALS_NATURE and attrs["nature_score"] >= 8:
                reasons.append("Matches your interest in animals and nature.")
            elif pref == ParkPreference.THEMES and attrs["theme_score"] >= 8:
                reasons.append("Matches your interest in classic Disney theming.")
            elif pref == ParkPreference.CULTURAL and attrs["cultural_score"] >= 8:
                reasons.append("Matches your interest in cultural experiences.")

        if request.infants > 0 and attrs["infant_friendly"] >= 8:
            reasons.append("Strong baby care facilities and quieter areas for your infant.")

        if request.child_ages:
            avg_age = sum(request.child_ages) / len(request.child_ages)
            if avg_age <= 6 and attrs["toddler_score"] >= 9:
                reasons.append("Well suited to young children in your group.")
            elif avg_age >= 10 and attrs["thrill_score"] >= 8:
                reasons.append("Good fit for older kids/teens looking for bigger rides.")

        if meta.get("is_new_park"):
            reasons.append(f"Adds {attrs['display_name']} to your trip for variety across the four parks.")
        elif meta.get("was_repeat"):
            reasons.append("A repeat visit - your other constraints made this the best remaining option.")

        return reasons[:4]

    def _generate_tips(
        self, park: str, crowd_level: int, meta: Dict, request: ParkRecommendationRequest
    ) -> List[str]:
        tips = []
        attrs = PARK_ATTRIBUTES[park]

        if request.infants > 0 and attrs["walking_intensity"] >= 9:
            tips.append("This park involves a lot of walking - bring a comfortable stroller.")

        if crowd_level >= 7 and (request.children > 0 or request.infants > 0):
            tips.append("Plan a midday break during the hottest, busiest stretch (roughly 11am-3pm).")
        elif crowd_level <= 3:
            tips.append("Standby lines should be short most of the day - a good day to be flexible.")

        if park == "magic_kingdom":
            tips.append("Arrive at rope drop for the shortest waits on the most popular rides.")
            if any(age < 8 for age in request.child_ages):
                tips.append("Build in time for character meet-and-greets.")
        elif park == "epcot":
            tips.append("Check whether your date falls during a festival - it changes food options significantly.")
        elif park == "hollywood_studios":
            if request.thrill_level == ThrillLevel.HIGH:
                tips.append("Prioritize the headline thrill rides early before lines build.")
        elif park == "animal_kingdom":
            tips.append("Visit animal habitats in the early morning when animals are most active.")

        return tips[:4]

    def _generate_summary(
        self, daily_plans: List[DailyParkPlan], rest_days: List[RestDayPlan], all_dates: List[date]
    ) -> Dict:
        parks_visited: Dict[str, int] = {}
        for plan in daily_plans:
            parks_visited[plan.park_display_name] = parks_visited.get(plan.park_display_name, 0) + 1

        avg_crowd = sum(p.crowd_level for p in daily_plans) / len(daily_plans) if daily_plans else 0

        return {
            "total_days": len(all_dates),
            "park_days": len(daily_plans),
            "rest_days": len(rest_days),
            "parks_visited": parks_visited,
            "average_crowd_level": round(avg_crowd, 1),
            "busiest_day": max(daily_plans, key=lambda x: x.crowd_level).date if daily_plans else None,
            "quietest_day": min(daily_plans, key=lambda x: x.crowd_level).date if daily_plans else None,
        }

    def _generate_optimization_notes(
        self,
        daily_plans: List[DailyParkPlan],
        rest_days: List[RestDayPlan],
        request: ParkRecommendationRequest,
        all_dates: List[date],
    ) -> List[str]:
        notes = []

        if rest_days and (request.children > 0 or request.infants > 0):
            notes.append("Rest days were placed to break up park-day streaks, which matters most with kids along.")
        elif not rest_days and len(all_dates) >= 4:
            notes.append("Every day of your trip is a park day - pace yourselves, especially later in the trip.")

        parks_used = [p.park for p in daily_plans]
        unique_parks = len(set(parks_used))
        if daily_plans and unique_parks == len(parks_used):
            notes.append("Each park is visited once for maximum variety.")
        elif unique_parks >= 3:
            notes.append(f"You'll visit {unique_parks} different parks across the trip.")

        estimated_days = sum(1 for p in daily_plans if not p.crowd_data_available)
        if estimated_days:
            notes.append(
                f"Crowd predictions weren't available for {estimated_days} day(s) in your plan; "
                "those days were scheduled based on your other preferences instead."
            )

        if daily_plans:
            avg_crowd = sum(p.crowd_level for p in daily_plans) / len(daily_plans)
            if avg_crowd <= 4:
                notes.append("Great timing overall - below-average crowds are predicted across your park days.")
            elif avg_crowd >= 7:
                notes.append("Higher crowds are predicted overall - consider a skip-the-line option if it's in budget.")

        if request.infants > 0:
            notes.append("Baby Care Centers with changing tables and nursing rooms are available in every park.")

        return notes