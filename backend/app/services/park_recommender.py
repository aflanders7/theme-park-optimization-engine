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
    
    # Park attributes for matching preferences
    PARK_ATTRIBUTES = {
        "magic_kingdom": {
            "display_name": "Magic Kingdom",
            "thrill_score": 7,  # 0-10, higher = more thrills
            "food_score": 6,
            "kid_friendly_score": 10,
            "toddler_score": 10,
            "cultural_score": 5,
            "nature_score": 3,
            "tags": ["classic_disney", "thrills", "family"],
        },
        "epcot": {
            "display_name": "Epcot",
            "thrill_score": 6,
            "food_score": 10,
            "kid_friendly_score": 7,
            "toddler_score": 6,
            "cultural_score": 10,
            "nature_score": 4,
            "tags": ["food_drinks", "cultural", "adults"],
        },
        "hollywood_studios": {
            "display_name": "Hollywood Studios",
            "thrill_score": 9,
            "food_score": 7,
            "kid_friendly_score": 8,
            "toddler_score": 7,
            "cultural_score": 6,
            "nature_score": 3,
            "tags": ["thrills", "shows", "teens"],
        },
        "animal_kingdom": {
            "display_name": "Animal Kingdom",
            "thrill_score": 4,
            "food_score": 4,
            "kid_friendly_score": 9,
            "toddler_score": 7,
            "cultural_score": 7,
            "nature_score": 10,
            "tags": ["animals_nature", "family", "adventure"],
        },
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    def recommend_parks(self, request: ParkRecommendationRequest) -> Dict:
        """
        Main recommendation logic
        """
        
        # 1. Get all available dates
        all_dates = self._get_date_range(request.start_date, request.end_date)
        
        # 2. Load crowd data for date range
        crowd_data = self._load_crowd_data(request.start_date, request.end_date)
        
        if crowd_data.empty:
            raise ValueError("No crowd data available for selected dates")
        
        # 3. Determine optimal number of park days
        num_park_days = self._calculate_park_days(request, len(all_dates))
        
        # 4. Score each park for each day
        park_scores = self._score_parks_by_date(
            crowd_data, request, all_dates
        )
        
        # 5. Optimize park schedule
        schedule = self._optimize_schedule(
            park_scores, num_park_days, request, all_dates
        )
        
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
        while current < end:
            dates.append(current)
            current += timedelta(days=1)
        return dates
    
    def _load_crowd_data(self, start: date, end: date) -> pd.DataFrame:
        """Load crowd calendar data from database"""
        
        crowd_records = self.db.query(CrowdCalendar).filter(
            and_(
                CrowdCalendar.date >= start,
                CrowdCalendar.date < end
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
    
    def _calculate_park_days(self, request: ParkRecommendationRequest, total_days: int) -> int:
        """Determine optimal number of park days"""
        
        if request.max_park_days:
            return min(request.max_park_days, total_days)
        
        # Default heuristics based on trip length
        if total_days <= 2:
            return total_days
        elif total_days == 3:
            return 2  # 2 park days, 1 rest
        elif total_days == 4:
            return 3  # 3 park days, 1 rest
        elif total_days <= 6:
            return total_days - 1  # Leave one rest day
        else:
            # For longer trips, do 4-5 park days with rest days interspersed
            return min(5, total_days - 2)
    
    def _score_parks_by_date(
        self, 
        crowd_data: pd.DataFrame, 
        request: ParkRecommendationRequest,
        dates: List[date]
    ) -> pd.DataFrame:
        """
        Score each park for each date based on:
        - Crowd levels (lower is better)
        - User preferences
        - Party composition
        """
        
        scores = []
        
        for date_val in dates:
            # Get crowd levels for this date
            day_crowds = crowd_data[crowd_data['date'] == date_val]
            
            for park in self.PARK_ATTRIBUTES.keys():
                # Skip if user wants to avoid this park
                if park in request.avoid_parks:
                    continue
                
                park_crowd = day_crowds[day_crowds['park'] == park]['crowd'].values
                crowd_level = park_crowd[0] if len(park_crowd) > 0 else 5.0
                
                # Calculate score (higher is better)
                score = self._calculate_park_score(
                    park, crowd_level, request, date_val
                )
                
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
        """
        Calculate score for a park on a specific date
        Higher score = better match
        """
        
        score = 0.0
        park_attrs = self.PARK_ATTRIBUTES[park]
        
        # 1. CROWD SCORE (0-40 points) - Lower crowds = higher score
        crowd_score = (10 - crowd_level) * 4  # Invert so low crowds = high score
        score += crowd_score
        
        # 2. PREFERENCE MATCH (0-30 points)
        if request.park_preferences:
            pref_score = 0
            for pref in request.park_preferences:
                if pref.value == "thrills" and park_attrs["thrill_score"] >= 7:
                    pref_score += 10
                elif pref.value == "food_drinks" and park_attrs["food_score"] >= 8:
                    pref_score += 10
                elif pref.value == "animals_nature" and park == "animal_kingdom":
                    pref_score += 10
                elif pref.value == "classic_disney" and park == "magic_kingdom":
                    pref_score += 10
                elif pref.value == "cultural" and park == "epcot":
                    pref_score += 10
            
            score += min(pref_score, 30)  # Cap at 30
        
        # 3. THRILL LEVEL MATCH (0-20 points)
        if request.thrill_level == ThrillLevel.LOW:
            # Prefer parks with lower thrill scores
            thrill_match = (10 - park_attrs["thrill_score"]) * 2
        elif request.thrill_level == ThrillLevel.HIGH:
            # Prefer parks with higher thrill scores
            thrill_match = park_attrs["thrill_score"] * 2
        else:  # MODERATE
            thrill_match = 15  # Neutral score
        
        score += thrill_match
        
        # 4. KID-FRIENDLY SCORE (0-20 points)
        if request.children > 0:
            avg_child_age = sum(request.child_ages) / len(request.child_ages) if request.child_ages else 8
            
            if avg_child_age < 5:
                # Toddlers - prioritize toddler-friendly parks
                score += park_attrs["toddler_score"] * 2
            elif avg_child_age < 10:
                # Young kids - prioritize kid-friendly parks
                score += park_attrs["kid_friendly_score"] * 2
            else:
                # Older kids - thrills matter more
                score += park_attrs["thrill_score"] * 1.5
        
        # 6. MUST-VISIT BONUS (0-20 points)
        if park in request.must_visit_parks:
            score += 20
        
        return score
    
    def _optimize_schedule(
        self,
        park_scores: pd.DataFrame,
        num_park_days: int,
        request: ParkRecommendationRequest,
        all_dates: List[date]
    ) -> List[Tuple[date, str]]:
        """
        Optimize park schedule to:
        - Visit parks on their best days
        - Ensure variety (don't visit same park back-to-back)
        - Honor must-visit constraints
        """
        
        schedule = []
        used_dates = set()
        used_parks = set()
        last_park = None
        
        # First, handle must-visit parks
        if request.must_visit_parks:
            for park in request.must_visit_parks:
                # Find best date for this park
                park_options = park_scores[
                    (park_scores['park'] == park) & 
                    (~park_scores['date'].isin(used_dates))
                ].sort_values('score', ascending=False)
                
                if not park_options.empty:
                    best_date = park_options.iloc[0]['date']
                    schedule.append((best_date, park))
                    used_dates.add(best_date)
                    used_parks.add(park)
        
        # Fill remaining days with best options
        remaining_days = num_park_days - len(schedule)
        
        for _ in range(remaining_days):
            # Get best park/date combo that we haven't used
            available = park_scores[
                (~park_scores['date'].isin(used_dates)) &
                (park_scores['park'] != last_park)  # Avoid back-to-back same park
            ].sort_values('score', ascending=False)
            
            if available.empty:
                break
            
            best = available.iloc[0]
            schedule.append((best['date'], best['park']))
            used_dates.add(best['date'])
            last_park = best['park']
        
        # Sort by date
        schedule.sort(key=lambda x: x[0])
        
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
            
            # Get crowd level
            crowd_row = crowd_data[
                (crowd_data['date'] == date_val) & 
                (crowd_data['park'] == park)
            ]
            crowd_level = crowd_row['crowd'].values[0] if not crowd_row.empty else 5.0
            
            # Generate reasons for this choice
            reasons = self._generate_reasons(park, crowd_level, request, date_val)
            
            # Generate tips
            tips = self._generate_tips(park, crowd_level, request)
            
            # Arrival time recommendation
            arrival_time = self._recommend_arrival_time(crowd_level)
            
            # Wait time estimate
            wait_times = self._estimate_wait_times(crowd_level)
            
            plan = DailyParkPlan(
                date=date_val,
                park=park,
                park_display_name=park_attrs["display_name"],
                crowd_level=round(crowd_level, 1),
                reasons=reasons,
                tips=tips,
                recommended_arrival_time=arrival_time,
                estimated_wait_times=wait_times
            )
            
            daily_plans.append(plan)
        
        return daily_plans
    
    def _generate_reasons(
        self, park: str, crowd_level: float, request: ParkRecommendationRequest, date_val: date
    ) -> List[str]:
        """Generate human-readable reasons for park selection"""
        
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
        
        # Preference match
        for pref in request.park_preferences:
            if pref.value == "food_drinks" and park == "epcot":
                reasons.append("Perfect for food lovers - World Showcase has 11 countries")
            elif pref.value == "thrills" and park_attrs["thrill_score"] >= 8:
                reasons.append("Great thrill rides for your party")
            elif pref.value == "animals_nature" and park == "animal_kingdom":
                reasons.append("Amazing animal experiences and Pandora")
            elif pref.value == "classic_disney" and park == "magic_kingdom":
                reasons.append("The classic Disney experience with iconic attractions")
        
        # Kid-specific
        if request.children > 0:
            avg_age = sum(request.child_ages) / len(request.child_ages) if request.child_ages else 8
            if avg_age < 5 and park_attrs["toddler_score"] >= 8:
                reasons.append("Excellent for toddlers with gentle rides and character meets")
            elif park == "magic_kingdom" and request.children > 0:
                reasons.append("Most kid-friendly park with rides for all ages")
        
        # Day of week
        if date_val.weekday() < 5 and crowd_level < 6:
            reasons.append("Weekday visit helps avoid weekend crowds")
        
        return reasons[:3]  # Top 3 reasons
    
    def _generate_tips(
        self, park: str, crowd_level: float, request: ParkRecommendationRequest
    ) -> List[str]:
        """Generate tips for visiting this park"""
        
        tips = []
        
        # Crowd-based tips
        if crowd_level >= 7:
            tips.append("Use Lightning Lane/Genie+ for popular attractions")
            tips.append("Take a midday break to avoid peak crowds (11am-3pm)")
        elif crowd_level <= 3:
            tips.append("Great day for standby lines - may not need Genie+")
        
        # Park-specific tips
        if park == "magic_kingdom":
            tips.append("Arrive before rope drop for shortest wait at Seven Dwarfs Mine Train")
            if request.children > 0:
                tips.append("Don't miss character meets at Princess Fairytale Hall")
        elif park == "epcot":
            tips.append("Start at World Showcase if visiting for food")
            tips.append("Test Track and Frozen are most popular - get there early")
        elif park == "hollywood_studios":
            tips.append("Rise of the Resistance sells out fast - join virtual queue at 7am")
            tips.append("Tower of Terror and Rock 'n' Roller Coaster have longest waits")
        elif park == "animal_kingdom":
            tips.append("See animals early morning when they're most active")
            tips.append("Flight of Passage has longest wait - ride first or use Lightning Lane")
        
        return tips[:4]  # Top 4 tips
    
    def _recommend_arrival_time(self, crowd_level: float) -> str:
        """Recommend park arrival time based on crowds"""
        
        if crowd_level <= 3:
            return "9:00 AM (normal opening)"
        elif crowd_level <= 5:
            return "8:30 AM (30 min before opening)"
        elif crowd_level <= 7:
            return "8:00 AM (1 hour before opening for rope drop)"
        else:
            return "7:30 AM (arrive early for best experience)"
    
    def _estimate_wait_times(self, crowd_level: float) -> str:
        """Estimate typical wait times"""
        
        if crowd_level <= 3:
            return "5-20 minutes for most attractions"
        elif crowd_level <= 5:
            return "15-45 minutes for popular rides"
        elif crowd_level <= 7:
            return "45-90 minutes for top attractions"
        else:
            return "60-120+ minutes for headliners"
    
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
        """Generate notes about the optimization"""
        
        notes = []
        
        if len(daily_plans) >= 4:
            notes.append("Schedule includes rest days to avoid burnout")
        
        parks = [plan.park for plan in daily_plans]
        if len(set(parks)) == len(parks):
            notes.append("Each park visited once for maximum variety")
        
        avg_crowd = sum(plan.crowd_level for plan in daily_plans) / len(daily_plans)
        if avg_crowd < 5:
            notes.append("Great timing! Your dates have below-average crowds")
        elif avg_crowd > 7:
            notes.append("Higher crowd levels expected - consider Genie+ for efficiency")
        
        weekday_parks = sum(1 for plan in daily_plans if plan.date.weekday() < 5)
        if weekday_parks >= len(daily_plans) * 0.7:
            notes.append("Weekday visits help minimize crowds")
        
        return notes