# backend/app/services/park_recommender.py
import pandas as pd
from datetime import datetime, timedelta, date
from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.models.crowd import CrowdCalendar
from app.schemas.park_recommendation import (
    ParkRecommendationRequest, 
    DailyParkPlan,
    ThrillLevel,
    ParkPreference
)


class ParkRecommendationEngine:
    
    # Enhanced park attributes for better matching
    PARK_ATTRIBUTES = {
        "magic_kingdom": {
            "display_name": "Magic Kingdom",
            "thrill_score": 6,
            "food_score": 7,
            "kid_friendly_score": 10,
            "toddler_score": 10,  # Ages 0-3
            "preschool_score": 10,  # Ages 4-6
            "grade_school_score": 9,  # Ages 7-12
            "teen_score": 7,  # Ages 13+
            "infant_friendly": 10,  # Baby care centers, quiet areas
            "cultural_score": 3,
            "nature_score": 4,
            "walking_intensity": 8,  # Higher = more walking
            "shade_availability": 6,  # Important for hot days with babies
            "tags": ["themes", "thrills", "family", "characters"],
        },
        "epcot": {
            "display_name": "Epcot",
            "thrill_score": 7,
            "food_score": 10,
            "kid_friendly_score": 6,
            "toddler_score": 5,
            "preschool_score": 6,
            "grade_school_score": 7,
            "teen_score": 9,
            "infant_friendly": 7,
            "cultural_score": 10,
            "nature_score": 6,
            "walking_intensity": 10,  # Most walking
            "shade_availability": 7,
            "tags": ["food_drinks", "cultural", "adults", "educational"],
        },
        "hollywood_studios": {
            "display_name": "Hollywood Studios",
            "thrill_score": 9,
            "food_score": 6,
            "kid_friendly_score": 8,
            "toddler_score": 4,
            "preschool_score": 6,
            "grade_school_score": 9,
            "teen_score": 10,
            "infant_friendly": 6,
            "cultural_score": 5,
            "nature_score": 3,
            "walking_intensity": 6,
            "shade_availability": 5,
            "tags": ["thrills", "shows", "teens", "star_wars"],
        },
        "animal_kingdom": {
            "display_name": "Animal Kingdom",
            "thrill_score": 5,
            "food_score": 4,
            "kid_friendly_score": 9,
            "toddler_score": 7,
            "preschool_score": 9,
            "grade_school_score": 9,
            "teen_score": 7,
            "infant_friendly": 8,
            "cultural_score": 8,
            "nature_score": 10,
            "walking_intensity": 9,
            "shade_availability": 8,
            "tags": ["animals_nature", "family", "adventure", "educational"],
        },
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    def recommend_parks(self, request: ParkRecommendationRequest) -> Dict:
        """Main recommendation logic"""
        
        # 1. Get all available dates
        all_dates = self._get_date_range(request.start_date, request.end_date)
        
        # 2. Load crowd data for date range
        crowd_data = self._load_crowd_data(request.start_date, request.end_date)
        
        if crowd_data.empty:
            raise ValueError("No crowd data available for selected dates")
        
        # 3. Use the park_days from request
        num_park_days = request.park_days
        
        # 4. Score each park for each day with enhanced logic
        park_scores = self._score_parks_by_date(crowd_data, request, all_dates)
        
        # 5. Optimize park schedule
        schedule = self._optimize_schedule(park_scores, num_park_days, request, all_dates)
        
        # 6. Build daily plans with details
        daily_plans = self._build_daily_plans(schedule, crowd_data, request)
        
        # 7. Identify rest days
        park_dates = [plan.date for plan in daily_plans]
        rest_days = [d for d in all_dates if d not in park_dates]
        
        # 8. Generate summary and notes
        summary = self._generate_summary(daily_plans, rest_days, request)
        optimization_notes = self._generate_optimization_notes(daily_plans, request)
        
        return {
            "daily_plans": daily_plans,
            "rest_days": rest_days,
            "summary": summary,
            "optimization_notes": optimization_notes
        }
    
    def _get_date_range(self, start: date, end: date) -> List[date]:
        """Generate list of all dates in range"""
        dates = []
        current = start
        while current <= end:
            dates.append(current)
            current += timedelta(days=1)
        return dates
    
    def _load_crowd_data(self, start: date, end: date) -> pd.DataFrame:
        """Load crowd calendar data from database"""
        
        crowd_records = self.db.query(CrowdCalendar).filter(
            and_(
                CrowdCalendar.date >= start,
                CrowdCalendar.date <= end
            )
        ).all()
        
        if not crowd_records:
            return pd.DataFrame()
        
        data = [{
            'park': record.park,
            'date': record.date,
            'crowd': record.crowd
        } for record in crowd_records]
        
        return pd.DataFrame(data)
    
    def _score_parks_by_date(
        self, 
        crowd_data: pd.DataFrame, 
        request: ParkRecommendationRequest,
        dates: List[date]
    ) -> pd.DataFrame:
        """Score each park for each date with enhanced preference matching"""
        
        scores = []
        
        for date_val in dates:
            day_crowds = crowd_data[crowd_data['date'] == date_val]
            
            for park in self.PARK_ATTRIBUTES.keys():
                if park in request.avoid_parks:
                    continue
                
                park_crowd = day_crowds[day_crowds['park'] == park]['crowd'].values
                crowd_level = park_crowd[0] if len(park_crowd) > 0 else 5.0
                
                score = self._calculate_park_score(park, crowd_level, request, date_val)
                
                scores.append({
                    'date': date_val,
                    'park': park,
                    'crowd_level': crowd_level,
                    'score': score
                })
        
        return pd.DataFrame(scores)
    
    def _calculate_park_score(
        self,
        park: str,
        crowd_level: float,
        request: ParkRecommendationRequest,
        date_val: date
    ) -> float:
        """Enhanced scoring with better preference and age matching"""
        
        score = 0.0
        park_attrs = self.PARK_ATTRIBUTES[park]
        
        # 1. CROWD SCORE (0-35 points) - Lower crowds = higher score
        crowd_score = (10 - crowd_level) * 3.5
        score += crowd_score
        
        # 2. PREFERENCE MATCH (0-25 points) - Weight based on number of preferences
        if request.park_preferences:
            pref_score = 0
            pref_weight = 25 / len(request.park_preferences)  # Distribute points
            
            for pref in request.park_preferences:
                if pref == ParkPreference.THRILLS and park_attrs["thrill_score"]:
                    pref_score += pref_weight * (park_attrs["thrill_score"] / 10)
                elif pref == ParkPreference.FOOD_DRINKS and park_attrs["food_score"]:
                    pref_score += pref_weight * (park_attrs["food_score"] / 10)
                elif pref == ParkPreference.ANIMALS_NATURE and park == "animal_kingdom":
                    pref_score += pref_weight
                elif pref == ParkPreference.THEMES and park == "magic_kingdom":
                    pref_score += pref_weight
                elif pref == ParkPreference.CULTURAL and park == "epcot":
                    pref_score += pref_weight
            
            score += pref_score
        
        # 3. THRILL LEVEL MATCH (0-15 points)
        if request.thrill_level == ThrillLevel.LOW:
            thrill_match = (10 - park_attrs["thrill_score"]) * 1.5
        elif request.thrill_level == ThrillLevel.HIGH:
            thrill_match = park_attrs["thrill_score"] * 1.5
        else:  # MODERATE
            thrill_match = 12
        
        score += thrill_match
        
        # 4. ENHANCED AGE-APPROPRIATE SCORING (0-25 points)
        age_score = self._calculate_age_appropriateness(park_attrs, request)
        score += age_score
        
        # 5. INFANT CONSIDERATIONS (0-15 points)
        if request.infants > 0:
            infant_score = park_attrs["infant_friendly"] * 1.5
            # Penalize high walking intensity parks with infants
            if park_attrs["walking_intensity"] >= 9:
                infant_score -= 5
            # Bonus for good shade (important for babies)
            if park_attrs["shade_availability"] >= 7:
                infant_score += 3
            score += max(0, infant_score)
        
        # 6. MUST-VISIT BONUS (0-20 points)
        if park in request.must_visit_parks:
            score += 20
        
        # 7. WEEKDAY BONUS (0-5 points)
        if date_val.weekday() < 5 and crowd_level < 7:
            score += 5
        
        return score
    
    def _calculate_age_appropriateness(
        self, park_attrs: Dict, request: ParkRecommendationRequest
    ) -> float:
        """Calculate how appropriate park is for party's age distribution"""
        
        if request.children == 0 and request.infants == 0:
            # Adult-only group
            return 15  # Neutral, all parks work
        
        age_score = 0.0
        total_kids = request.children + request.infants
        
        if request.infants > 0:
            # Weight infant friendliness
            infant_weight = request.infants / (request.adults + total_kids)
            age_score += park_attrs["infant_friendly"] * infant_weight * 10
        
        if request.child_ages:
            # Calculate score based on actual child ages
            for age in request.child_ages:
                if age <= 3:
                    age_score += park_attrs["toddler_score"] * 0.5
                elif age <= 6:
                    age_score += park_attrs["preschool_score"] * 0.5
                elif age <= 12:
                    age_score += park_attrs["grade_school_score"] * 0.5
                else:
                    age_score += park_attrs["teen_score"] * 0.5
            
            # Average out the child scores
            age_score = age_score / len(request.child_ages)
        else:
            # Default to kid_friendly_score if no ages provided
            age_score = park_attrs["kid_friendly_score"]
        
        # Normalize to 0-25 range
        return min(25, age_score * 2.5)
    
    def _pick_best_park_for_date(
        self,
        date: date,
        park_candidates: dict,
        park_scores: pd.DataFrame,
        park_visit_count: dict,
        repeat_priority: dict,
        last_park: str = None,
        avoid_last: bool = True
    ) -> str:
        """
        Pick the best park for a given date considering:
        - Park scores for the date
        - Repeat penalty / priority
        - Avoid back-to-back visits
        - Balance visit counts
        """
        candidates = []

        print(park_candidates)
        for park, dates in park_candidates.items():
            if date in dates:
                visits = park_visit_count.get(park, 0)
                # Calculate adjusted score
                score = park_scores[(park_scores['park'] == park) & (park_scores['date'] == date)]['score'].values[0]
                adjusted_score = score - visits * 15 + (repeat_priority.get(park, 1) * 5 if visits > 0 else 0)
                candidates.append((adjusted_score, park))

        # Sort candidates by adjusted score descending
        candidates.sort(key=lambda x: x[0], reverse=True)

        for _, park in candidates:
            if avoid_last and park == last_park:
                continue
            min_visits = min(park_visit_count.values(), default=0)
            if park_visit_count.get(park, 0) > min_visits + 1:
                continue
            return park

        # fallback: allow last_park if no other option
        if candidates:
            return candidates[0][1]

        return None

    def _optimize_schedule(
        self,
        park_scores: pd.DataFrame,
        num_park_days: int,
        request: ParkRecommendationRequest,
        all_dates: List[date]
    ) -> List[Tuple[date, str]]:
        """Optimized park schedule with greedy approach, variety, balanced visits, and best dates."""

        REPEAT_PRIORITY = self._get_repeat_priority(request)

        schedule = []
        used_dates = set()
        park_visit_count = {}
        last_park = None

        available_parks = [p for p in self.PARK_ATTRIBUTES.keys() if p not in request.avoid_parks]

        # Compute rest days
        rest_day_count = len(all_dates) - num_park_days
        preferred_rest_positions = self._calculate_preferred_rest_positions(
            len(all_dates), rest_day_count, request.park_on_arrival, request.park_on_departure
        )
        reserved_rest_dates = set(sorted(all_dates)[pos] for pos in preferred_rest_positions)

        # Precompute park candidates: for each park, sorted dates by score
        park_candidates = {}
        for park in available_parks:
            candidates = park_scores[
                (park_scores['park'] == park) & (~park_scores['date'].isin(reserved_rest_dates))
            ].sort_values('score', ascending=False)['date'].tolist()
            park_candidates[park] = candidates

        # Phase 0: assign must-visit parks first
        for park in getattr(request, "must_visit_parks", []):
            candidates = park_candidates.get(park, [])
            for date in candidates:
                if date not in used_dates:
                    schedule.append((date, park))
                    used_dates.add(date)
                    park_visit_count[park] = park_visit_count.get(park, 0) + 1
                    last_park = park
                    break

        # Phase 1: assign each park at least once
        for park in available_parks:
            if park_visit_count.get(park, 0) > 0:
                continue
            candidates = park_candidates.get(park, [])
            for date in candidates:
                if date not in used_dates:
                    if last_park == park:
                        continue
                    schedule.append((date, park))
                    used_dates.add(date)
                    park_visit_count[park] = park_visit_count.get(park, 0) + 1
                    last_park = park
                    break

        # Phase 2: fill remaining park days
        unscheduled_dates = [d for d in all_dates if d not in used_dates and d not in reserved_rest_dates]

        for date in unscheduled_dates:
            park = self._pick_best_park_for_date(date, park_candidates, park_scores, park_visit_count, REPEAT_PRIORITY, last_park)
            print(park)
            if park:
                schedule.append((date, park))
                used_dates.add(date)
                park_visit_count[park] = park_visit_count.get(park, 0) + 1
                last_park = park

        # Optional balancing if any park exceeds others by more than 1
        max_visits = max(park_visit_count.values(), default=0)
        min_visits = min(park_visit_count.values(), default=0)
        if max_visits - min_visits > 1:
            schedule = self._rebalance_schedule(schedule, park_scores, park_visit_count, REPEAT_PRIORITY)

        schedule.sort(key=lambda x: x[0])
        return schedule

    
    def _get_repeat_priority(self, request) -> dict:
        """
        Calculate dynamic repeat priority for parks based on user preferences and must-visit parks.
        Higher score = better candidate for repeats.
        """
        REPEAT_PRIORITY = {}
        pref_weight = 2  # Tweakable weight for preference influence
        base_repeat_score = 1  

        for park, park_attrs in self.PARK_ATTRIBUTES.items():
            score = base_repeat_score

            # Must-visit parks get a strong boost
            if park in getattr(request, "must_visit_parks", []):
                score += 10

            # Preferences influence repeat priority
            for pref in getattr(request, "park_preferences", []):
                if pref == ParkPreference.THRILLS:
                    score += pref_weight * (park_attrs["thrill_score"] / 10)
                elif pref == ParkPreference.FOOD_DRINKS:
                    score += pref_weight * (park_attrs["food_score"] / 10)
                elif pref == ParkPreference.ANIMALS_NATURE and park == "animal_kingdom":
                    score += pref_weight
                elif pref == ParkPreference.THEMES and park == "magic_kingdom":
                    score += pref_weight
                elif pref == ParkPreference.CULTURAL and park == "epcot":
                    score += pref_weight

            REPEAT_PRIORITY[park] = score

        return REPEAT_PRIORITY


    def _calculate_preferred_rest_positions(
        self,
        total_days: int,
        rest_day_count: int,
        park_on_arrival: bool,
        park_on_departure: bool
    ) -> List[int]:
        """
        Calculate optimal positions for rest days in trip.

        Rules:
        - Days where park is not desired are automatically rest days
        - Remaining rest days are spaced evenly
        - Avoid clustering rest days
        """
        if rest_day_count <= 0:
            return []

        if rest_day_count >= total_days:
            return list(range(total_days))

        preferred_positions = []

        # Force first/last day as rest if park is not desired
        if not park_on_arrival:
            preferred_positions.append(0)
        if not park_on_departure and (total_days - 1) not in preferred_positions:
            preferred_positions.append(total_days - 1)

        remaining_rest_count = rest_day_count - len(preferred_positions)
        if remaining_rest_count <= 0:
            return sorted(preferred_positions)

        # Build candidate positions excluding already assigned rest days
        available_positions = [i for i in range(total_days) if i not in preferred_positions]

        # Evenly space remaining rest days
        step = len(available_positions) / (remaining_rest_count + 1)

        for i in range(remaining_rest_count):
            pos_index = int((i + 1) * step) - 1
            pos_index = max(0, min(pos_index, len(available_positions) - 1))
            pos = available_positions[pos_index]

            # Avoid clustering: move forward if adjacent to existing rest day
            while any(abs(pos - r) <= 1 for r in preferred_positions):
                pos_index += 1
                if pos_index >= len(available_positions):
                    pos = available_positions[-1]
                    break
                pos = available_positions[pos_index]

            preferred_positions.append(pos)

        return sorted(preferred_positions)

    
    def _rebalance_schedule(
        self,
        schedule: List[Tuple[date, str]],
        park_scores: pd.DataFrame,
        park_visit_count: Dict[str, int],
        repeat_priority: Dict[str, int]
    ) -> List[Tuple[date, str]]:
        """
        Rebalance park visits to reduce over-representation while:
        - Considering park_scores
        - Avoiding back-to-back visits
        - Respecting repeat priority
        """
        # Compute max/min visits
        max_visits = max(park_visit_count.values())
        min_visits = min(park_visit_count.values())
        
        if max_visits - min_visits <= 1:
            return schedule  # Already balanced

        over_visited = [p for p, count in park_visit_count.items() if count == max_visits]
        under_visited = [p for p, count in park_visit_count.items() if count == min_visits]

        for over_park in over_visited:
            for under_park in under_visited:
                # Skip high-priority repeat parks if they’re allowed extra visits
                if repeat_priority.get(over_park, 0) >= 3 and max_visits <= min_visits + 1:
                    continue

                # Look for swap opportunities
                for i, (date_val, park) in enumerate(schedule):
                    if park != over_park:
                        continue

                    # Avoid creating back-to-back visits
                    prev_park = schedule[i-1][1] if i > 0 else None
                    next_park = schedule[i+1][1] if i < len(schedule)-1 else None
                    if under_park in (prev_park, next_park):
                        continue

                    # Check if under_park is feasible for this date
                    alt_score_row = park_scores[
                        (park_scores['date'] == date_val) & 
                        (park_scores['park'] == under_park)
                    ]
                    if alt_score_row.empty:
                        continue

                    original_score = park_scores[
                        (park_scores['date'] == date_val) & 
                        (park_scores['park'] == over_park)
                    ]['score'].values[0]
                    alt_score = alt_score_row['score'].values[0]

                    # Swap if reasonable (within 20 points)
                    if alt_score >= original_score - 20:
                        schedule[i] = (date_val, under_park)
                        park_visit_count[over_park] -= 1
                        park_visit_count[under_park] += 1
                        return schedule  # Apply one swap at a time

        return schedule

    
    def _build_daily_plans(
        self,
        schedule: List[Tuple[date, str]],
        crowd_data: pd.DataFrame,
        request: ParkRecommendationRequest
    ) -> List[DailyParkPlan]:
        """Build detailed daily plan for each park day"""
        
        daily_plans = []
        
        for date_val, park in schedule:
            park_attrs = self.PARK_ATTRIBUTES[park]
            
            crowd_row = crowd_data[
                (crowd_data['date'] == date_val) & 
                (crowd_data['park'] == park)
            ]
            crowd_level = crowd_row['crowd'].values[0] if not crowd_row.empty else 5.0
            
            reasons = self._generate_reasons(park, crowd_level, request, date_val)
            tips = self._generate_tips(park, crowd_level, request)
            
            plan = DailyParkPlan(
                date=date_val,
                park=park,
                park_display_name=park_attrs["display_name"],
                crowd_level=round(crowd_level, 1),
                reasons=reasons,
                tips=tips,
            )
            
            daily_plans.append(plan)
        
        return daily_plans
    
    def _generate_reasons(
        self, park: str, crowd_level: float, request: ParkRecommendationRequest, date_val: date
    ) -> List[str]:
        """Generate human-readable reasons with enhanced age awareness"""
        
        reasons = []
        park_attrs = self.PARK_ATTRIBUTES[park]
        
        # Crowd reason
        if crowd_level <= 3:
            reasons.append(f"Very low crowds - great day to visit!")
        elif crowd_level <= 5:
            reasons.append(f"Moderate crowds - expect long waits mid-day")
        elif crowd_level <= 7:
            reasons.append(f"Busy day - arrive early for the best experience")
        else:
            reasons.append(f"Peak crowds - this was the best available day")
        
        # Preference-based reasons
        for pref in request.park_preferences:
            if pref == ParkPreference.FOOD_DRINKS and park == "epcot":
                reasons.append("The World Showcase is perfect for food and drink lovers")
            elif pref == ParkPreference.THRILLS and park_attrs["thrill_score"] >= 8:
                reasons.append("Great thrill rides for adventure seekers")
            elif pref == ParkPreference.ANIMALS_NATURE and park == "animal_kingdom":
                reasons.append("Amazing animal experiences")
            elif pref == ParkPreference.THEMES and park == "magic_kingdom":
                reasons.append("The classic Disney experience with iconic attractions")
            elif pref == ParkPreference.CULTURAL and park == "epcot":
                reasons.append("Rich cultural experiences across the World Showcase")
        
        # Age-specific reasons
        if request.infants > 0 and park_attrs["infant_friendly"] >= 8:
            reasons.append("Excellent baby care centers and quiet areas for infants")
        
        if request.child_ages:
            avg_age = sum(request.child_ages) / len(request.child_ages)
            if avg_age < 4 and park_attrs["toddler_score"] >= 9:
                reasons.append("Perfect for toddlers with gentle rides and character experiences")
            elif avg_age < 7 and park == "magic_kingdom":
                reasons.append("Best park for young children with magical experiences")
            elif avg_age >= 10 and park_attrs["thrill_score"] >= 8:
                reasons.append("Great thrill rides for older kids and teens")
        
        # Walking consideration with infants
        #if request.infants > 0 and park_attrs["walking_intensity"] <= 7:
            #reasons.append("More compact layout - easier with strollers")
        
        return reasons[:3]
    
    def _generate_tips(
        self, park: str, crowd_level: float, request: ParkRecommendationRequest
    ) -> List[str]:
        """Generate tips with infant/family considerations"""

        tips = []
        park_attrs = self.PARK_ATTRIBUTES[park]
        
        # Infant-specific tips
        if request.infants > 0 and park_attrs["walking_intensity"] >= 9:
            tips.append("This park requires a lot of walking - bring a comfortable stroller")
        
        # Crowd-based tips
        if crowd_level >= 7 and (request.children > 0 or request.infants > 0):
            tips.append("Take a midday break to rest when it's the hottest (11am-3pm)")
        elif crowd_level <= 3:
            tips.append("Great day for standby lines")
        
        # Park-specific tips
        if park == "magic_kingdom":
            tips.append("Arrive early for the shortest waits on popular rides")
            if any(age < 8 for age in request.child_ages) if request.child_ages else False:
                tips.append("Don't miss character meets")

        elif park == "epcot":
            tips.append("Check to see if your dates correspond with a festival")

        elif park == "hollywood_studios":
            if request.thrill_level == ThrillLevel.HIGH:
                tips.append("Several rides perfect for thrill seekers")
        elif park == "animal_kingdom":
            tips.append("See animals in the early morning when they're most active")

        return tips[:4]
    
    def _generate_summary(
        self, daily_plans: List[DailyParkPlan], rest_days: List[date], request: ParkRecommendationRequest
    ) -> Dict:
        """Generate trip summary statistics"""
        
        parks_visited = {}
        for plan in daily_plans:
            parks_visited[plan.park_display_name] = parks_visited.get(plan.park_display_name, 0) + 1
        
        avg_crowd = sum(plan.crowd_level for plan in daily_plans) / len(daily_plans) if daily_plans else 0

        return {
            "total_days": request.num_nights,
            "park_days": len(daily_plans),
            "rest_days": len(rest_days),
            "parks_visited": parks_visited,
            "average_crowd_level": round(avg_crowd, 1),
            "busiest_day": max(daily_plans, key=lambda x: x.crowd_level).date if daily_plans else None,
            "quietest_day": min(daily_plans, key=lambda x: x.crowd_level).date if daily_plans else None
        }
    
    def _generate_optimization_notes(
        self, daily_plans: List[DailyParkPlan], request: ParkRecommendationRequest
    ) -> List[str]:
        """Generate optimization notes with family-specific insights"""
        
        notes = []
        print("here10")
        # Rest day recommendations
        if len(daily_plans) >= 4 and request.num_nights - len(daily_plans) >= 1:
            notes.append("Schedule includes rest days - important for avoiding burnout, especially with children")
        elif len(daily_plans) >= 5 and request.num_nights == len(daily_plans):
            if request.children > 0 or request.infants > 0:
                notes.append("Consider adding a rest day - consecutive park days can be exhausting for families")

        # Variety
        parks = [plan.park for plan in daily_plans]
        unique_parks = len(set(parks))
        if unique_parks == len(parks):
            notes.append("Each park visited once for maximum variety")
        elif unique_parks >= 3:
            notes.append(f"Visiting {unique_parks} different parks for a well-rounded experience")
        
        # Crowd insights
        avg_crowd = sum(plan.crowd_level for plan in daily_plans) / len(daily_plans)
        if avg_crowd < 3:
            notes.append("Great timing! Below-average crowd levels expected")
        if avg_crowd < 7:
            notes.append("Average crowd levels expected")
        elif avg_crowd > 7:
            notes.append("High crowd levels expected - consider using a skip-the-line service for shorter waits")

        # Fast Pass
        if len(request.must_visit_parks) > len(daily_plans) or len(daily_plans) > 4:
            notes.append("Consider a ticket that allows you to visit multiple parks per day")
        
        # Weekday optimization
        weekday_parks = sum(1 for plan in daily_plans if plan.date.weekday() < 5)
        if weekday_parks >= len(daily_plans) * 0.7:
            notes.append("Weekday visits can help minimize crowds")
        
        # Infant-specific
        if request.infants > 0:
            high_walking_days = sum(
                1 for plan in daily_plans 
                if self.PARK_ATTRIBUTES[plan.park]["walking_intensity"] >= 9
            )
            if high_walking_days >= 2:
                notes.append("A lot of walking is expected - bring or rent a stroller")

            notes.append("Baby Care Centers are available within parks with changing tables, nursing rooms, and supplies")
        
        # Age-specific
        if request.child_ages:
            avg_age = sum(request.child_ages) / len(request.child_ages)
            if avg_age < 5:
                magic_kingdom_count = sum(1 for plan in daily_plans if plan.park == "magic_kingdom")
                if magic_kingdom_count == 1:
                    notes.append("Consider adding Magic Kingdom - it's the popular with young children")
        
        return notes