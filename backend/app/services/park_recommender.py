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
            "tags": ["classic_disney", "thrills", "family", "characters"],
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
                if pref == ParkPreference.THRILLS and park_attrs["thrill_score"] >= 7:
                    pref_score += pref_weight * (park_attrs["thrill_score"] / 10)
                elif pref == ParkPreference.FOOD_DRINKS and park_attrs["food_score"] >= 7:
                    pref_score += pref_weight * (park_attrs["food_score"] / 10)
                elif pref == ParkPreference.ANIMALS_NATURE and park == "animal_kingdom":
                    pref_score += pref_weight
                elif pref == ParkPreference.CLASSIC_DISNEY and park == "magic_kingdom":
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
    
    def _optimize_schedule(
        self,
        park_scores: pd.DataFrame,
        num_park_days: int,
        request: ParkRecommendationRequest,
        all_dates: List[date]
    ) -> List[Tuple[date, str]]:
        """Optimize park schedule with strong variety preference and strategic repeats"""
        
        # Park repeat priority (higher = better for repeats)
        REPEAT_PRIORITY = {
            "magic_kingdom": 4,  # Best for repeats
            "epcot": 3,
            "hollywood_studios": 2,
            "animal_kingdom": 1  # Least ideal for repeats
        }
        
        schedule = []
        used_dates = set()
        park_visit_count = {}
        last_park = None
        
        # Get available parks (not in avoid list)
        available_parks = [p for p in self.PARK_ATTRIBUTES.keys() if p not in request.avoid_parks]
        
        # Calculate preferred rest day positions (middle/end of trip, not first/last, spread out)
        rest_day_count = len(all_dates) - num_park_days
        preferred_rest_positions = self._calculate_preferred_rest_positions(
            len(all_dates), rest_day_count
        )
        
        # Reserve preferred rest day dates
        reserved_rest_dates = set()
        if rest_day_count > 0:
            # Sort dates and pick preferred positions for rest days
            sorted_dates = sorted(all_dates)
            for pos in preferred_rest_positions:
                if pos < len(sorted_dates):
                    reserved_rest_dates.add(sorted_dates[pos])
        
        # First, handle must-visit parks (but avoid reserved rest dates when possible)
        if request.must_visit_parks:
            for park in request.must_visit_parks:
                park_options = park_scores[
                    (park_scores['park'] == park) & 
                    (~park_scores['date'].isin(used_dates))
                ].copy()
                
                # Prefer non-rest dates
                non_rest_options = park_options[~park_options['date'].isin(reserved_rest_dates)]
                if not non_rest_options.empty:
                    park_options = non_rest_options
                
                park_options = park_options.sort_values('score', ascending=False)
                
                if not park_options.empty:
                    best_date = park_options.iloc[0]['date']
                    schedule.append((best_date, park))
                    used_dates.add(best_date)
                    # Remove from reserved rest dates if we had to use it
                    reserved_rest_dates.discard(best_date)
                    park_visit_count[park] = park_visit_count.get(park, 0) + 1
        
        # Strategy: First ensure variety (visit each park once)
        remaining_days = num_park_days - len(schedule)
        
        # Phase 1: Visit each available park once
        for park in available_parks:
            if remaining_days <= 0:
                break
            
            # Skip if already visited via must-visit
            if park_visit_count.get(park, 0) > 0:
                continue
            
            # Find best date for this park (avoid reserved rest dates)
            park_options = park_scores[
                (park_scores['park'] == park) & 
                (~park_scores['date'].isin(used_dates)) &
                (park_scores['park'] != last_park)  # Avoid back-to-back
            ].copy()
            
            # Prefer non-rest dates
            non_rest_options = park_options[~park_options['date'].isin(reserved_rest_dates)]
            if not non_rest_options.empty:
                park_options = non_rest_options
            
            park_options = park_options.sort_values('score', ascending=False)
            
            if not park_options.empty:
                best_date = park_options.iloc[0]['date']
                schedule.append((best_date, park))
                used_dates.add(best_date)
                reserved_rest_dates.discard(best_date)
                last_park = park
                park_visit_count[park] = park_visit_count.get(park, 0) + 1
                remaining_days -= 1
        
        # Phase 2: If we still have days left, add strategic repeats
        while remaining_days > 0:
            available = park_scores[
                (~park_scores['date'].isin(used_dates)) &
                (park_scores['park'] != last_park)  # Avoid back-to-back
            ].copy()
            
            if available.empty:
                break
            
            # Prefer non-rest dates
            non_rest_available = available[~available['date'].isin(reserved_rest_dates)]
            if not non_rest_available.empty:
                available = non_rest_available
            
            # Calculate adjusted score with heavy variety penalty and repeat priority
            def calculate_adjusted_score(row):
                base_score = row['score']
                park = row['park']
                visits = park_visit_count.get(park, 0)
                
                # Heavy penalty for parks already visited (promotes variety)
                variety_penalty = visits * 15
                
                # If we must repeat, use repeat priority
                repeat_bonus = REPEAT_PRIORITY.get(park, 1) * 5 if visits > 0 else 0
                
                return base_score - variety_penalty + repeat_bonus
            
            available['adjusted_score'] = available.apply(calculate_adjusted_score, axis=1)
            available = available.sort_values('adjusted_score', ascending=False)
            
            best = available.iloc[0]
            schedule.append((best['date'], best['park']))
            used_dates.add(best['date'])
            reserved_rest_dates.discard(best['date'])
            last_park = best['park']
            park_visit_count[best['park']] = park_visit_count.get(best['park'], 0) + 1
            remaining_days -= 1
        
        # Phase 3: Try to balance repeat visits if multiple parks need repeats
        # If we have 6+ days and uneven distribution, consider rebalancing
        if num_park_days >= 6:
            max_visits = max(park_visit_count.values()) if park_visit_count else 0
            min_visits = min(park_visit_count.values()) if park_visit_count else 0
            
            # If distribution is very uneven (difference > 2), try to rebalance
            if max_visits - min_visits > 2:
                schedule = self._rebalance_schedule(schedule, park_scores, park_visit_count, REPEAT_PRIORITY)
        
        # Sort by date
        schedule.sort(key=lambda x: x[0])
        
        return schedule
    
    def _calculate_preferred_rest_positions(self, total_days: int, rest_day_count: int) -> List[int]:
        """
        Calculate optimal positions for rest days in trip
        - Avoid first and last day when possible
        - Space out rest days evenly
        - Prefer middle/later part of trip
        """
        if rest_day_count == 0:
            return []
        
        if rest_day_count >= total_days:
            return list(range(total_days))
        
        preferred_positions = []
        
        # If only one rest day, place it around 60% through the trip (not first or last)
        if rest_day_count == 1:
            if total_days <= 3:
                # For very short trips, put it in the middle
                preferred_positions.append(total_days // 2)
            else:
                # Place around 60% through (e.g., day 4 of 6-day trip)
                preferred_positions.append(max(1, min(total_days - 2, int(total_days * 0.6))))
        
        # If two rest days, space them out in middle/later sections
        elif rest_day_count == 2:
            if total_days <= 4:
                # Short trip - middle positions
                preferred_positions = [1, 2]
            else:
                # Place at ~40% and ~70% through trip
                pos1 = max(1, min(total_days - 3, int(total_days * 0.4)))
                pos2 = max(pos1 + 2, min(total_days - 2, int(total_days * 0.7)))
                preferred_positions = [pos1, pos2]
        
        # Three or more rest days - distribute through middle/end, avoid clustering
        else:
            # Avoid first and last day
            available_positions = list(range(1, total_days - 1))
            
            if rest_day_count >= len(available_positions):
                # Need to use almost all days as rest
                preferred_positions = available_positions
            else:
                # Distribute evenly through available positions
                # Slightly favor later positions
                step = len(available_positions) / rest_day_count
                for i in range(rest_day_count):
                    pos = int(1 + (i * step) + (step * 0.3))  # Bias toward later
                    pos = min(pos, total_days - 2)
                    
                    # Ensure no adjacent rest days
                    while pos in preferred_positions or (pos - 1) in preferred_positions:
                        pos += 1
                        if pos >= total_days - 1:
                            pos = total_days - 2
                            break
                    
                    preferred_positions.append(pos)
        
        return sorted(set(preferred_positions))
    
    def _rebalance_schedule(
        self,
        schedule: List[Tuple[date, str]],
        park_scores: pd.DataFrame,
        park_visit_count: Dict[str, int],
        repeat_priority: Dict[str, int]
    ) -> List[Tuple[date, str]]:
        """Attempt to rebalance park visits for better distribution"""
        
        # Find parks with most and least visits
        max_visits = max(park_visit_count.values())
        min_visits = min(park_visit_count.values())
        
        if max_visits - min_visits <= 1:
            return schedule  # Already balanced
        
        # Find parks that are over-represented
        over_visited = [p for p, count in park_visit_count.items() if count == max_visits]
        under_visited = [p for p, count in park_visit_count.items() if count == min_visits]
        
        # Only rebalance if we're not favoring high-priority repeat parks
        for over_park in over_visited:
            for under_park in under_visited:
                # Don't swap if over_park is Magic Kingdom or Epcot and has good reason to be visited more
                if repeat_priority.get(over_park, 0) >= 3 and max_visits <= min_visits + 1:
                    continue
                
                # Try to find a swap opportunity
                for i, (date_val, park) in enumerate(schedule):
                    if park == over_park:
                        # Check if under_park has decent score on this date
                        alternative = park_scores[
                            (park_scores['date'] == date_val) & 
                            (park_scores['park'] == under_park)
                        ]
                        
                        if not alternative.empty:
                            original_score = park_scores[
                                (park_scores['date'] == date_val) & 
                                (park_scores['park'] == over_park)
                            ]['score'].values[0]
                            
                            alt_score = alternative['score'].values[0]
                            
                            # Swap if alternative is within 20 points (reasonable trade-off)
                            if alt_score >= original_score - 20:
                                schedule[i] = (date_val, under_park)
                                park_visit_count[over_park] -= 1
                                park_visit_count[under_park] += 1
                                return schedule  # Make one swap at a time
        
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
            reasons.append(f"Very low crowds ({crowd_level}/10) - great day to visit!")
        elif crowd_level <= 5:
            reasons.append(f"Moderate crowds ({crowd_level}/10) - good touring conditions")
        elif crowd_level <= 7:
            reasons.append(f"Busy day ({crowd_level}/10) - arrive early for best experience")
        else:
            reasons.append(f"Peak crowds ({crowd_level}/10) - this was the best available day")
        
        # Preference-based reasons
        for pref in request.park_preferences:
            if pref == ParkPreference.FOOD_DRINKS and park == "epcot":
                reasons.append("Perfect for food lovers - World Showcase has 11 countries")
            elif pref == ParkPreference.THRILLS and park_attrs["thrill_score"] >= 8:
                reasons.append("Great thrill rides for adventure seekers")
            elif pref == ParkPreference.ANIMALS_NATURE and park == "animal_kingdom":
                reasons.append("Amazing animal experiences and Pandora - World of Avatar")
            elif pref == ParkPreference.CLASSIC_DISNEY and park == "magic_kingdom":
                reasons.append("The classic Disney experience with iconic attractions")
            elif pref == ParkPreference.CULTURAL and park == "epcot":
                reasons.append("Rich cultural experiences across World Showcase")
        
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
        if request.infants > 0 and park_attrs["walking_intensity"] <= 7:
            reasons.append("More compact layout - easier with strollers")
        
        return reasons[:3]
    
    def _generate_tips(
        self, park: str, crowd_level: float, request: ParkRecommendationRequest
    ) -> List[str]:
        """Generate tips with infant/family considerations"""
        
        tips = []
        park_attrs = self.PARK_ATTRIBUTES[park]
        
        # Infant-specific tips
        if request.infants > 0:
            tips.append("Baby Care Centers available with changing tables, nursing rooms, and supplies")
            if park_attrs["walking_intensity"] >= 9:
                tips.append("This park requires lots of walking - bring a comfortable stroller")
        
        # Crowd-based tips
        if crowd_level >= 7:
            tips.append("Use Lightning Lane for popular attractions to maximize your time")
            if request.children > 0 or request.infants > 0:
                tips.append("Take a midday break - important for kids to rest (11am-3pm)")
        elif crowd_level <= 3:
            tips.append("Great day for standby lines - may not need Lightning Lane")
        
        # Park-specific tips
        if park == "magic_kingdom":
            tips.append("Arrive before rope drop for shortest waits on popular rides")
            if any(age < 8 for age in request.child_ages) if request.child_ages else False:
                tips.append("Don't miss character meets at Princess Fairytale Hall and Town Square Theater")
        elif park == "epcot":
            if ParkPreference.FOOD_DRINKS in request.park_preferences:
                tips.append("Try the food festival offerings if visiting during a festival")
            tips.append("Test Track and Frozen are most popular - get there early")
        elif park == "hollywood_studios":
            tips.append("Join virtual queue for Rise of the Resistance at park opening (7am)")
            if request.thrill_level == ThrillLevel.HIGH:
                tips.append("Tower of Terror and Rock 'n' Roller Coaster are must-dos for thrill seekers")
        elif park == "animal_kingdom":
            tips.append("See animals early morning when they're most active")
            tips.append("Flight of Passage has longest waits - ride first or use Lightning Lane")
            if request.infants > 0:
                tips.append("Shaded walkways and plenty of spots to rest with little ones")
        
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
        
        # Rest day recommendations
        if len(daily_plans) >= 4 and request.num_nights - len(daily_plans) >= 1:
            notes.append("Schedule includes rest days - important for avoiding burnout, especially with kids")
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
        if avg_crowd < 5:
            notes.append("Great timing! Your dates have below-average crowds")
        elif avg_crowd > 7:
            notes.append("Higher crowd levels expected - strongly consider Lightning Lane/Genie+")
        
        # Weekday optimization
        weekday_parks = sum(1 for plan in daily_plans if plan.date.weekday() < 5)
        if weekday_parks >= len(daily_plans) * 0.7:
            notes.append("Weekday visits scheduled to help minimize crowds")
        
        # Infant-specific
        if request.infants > 0:
            high_walking_days = sum(
                1 for plan in daily_plans 
                if self.PARK_ATTRIBUTES[plan.park]["walking_intensity"] >= 9
            )
            if high_walking_days >= 2:
                notes.append("Multiple high-walking parks scheduled - stroller highly recommended")
        
        # Age-specific
        if request.child_ages:
            avg_age = sum(request.child_ages) / len(request.child_ages)
            if avg_age < 5:
                magic_kingdom_count = sum(1 for plan in daily_plans if plan.park == "magic_kingdom")
                if magic_kingdom_count == 0:
                    notes.append("Consider adding Magic Kingdom - it's the most popular with young children")
        
        return notes