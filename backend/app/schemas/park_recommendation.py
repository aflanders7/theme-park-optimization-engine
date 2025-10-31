# backend/app/schemas/park_recommendation.py
from pydantic import BaseModel, Field, validator
from datetime import date
from typing import Optional, List
from enum import Enum


class ParkName(str, Enum):
    MAGIC_KINGDOM = "magic_kingdom"
    EPCOT = "epcot"
    ANIMAL_KINGDOM = "animal_kingdom"
    HOLLYWOOD_STUDIOS = "hollywood_studios"


class ThrillLevel(str, Enum):
    LOW = "low"  # Mostly mild rides, shows
    MODERATE = "moderate"  # Mix of everything
    HIGH = "high"  # Love thrill rides


class ParkPreference(str, Enum):
    THRILLS = "thrills"  # Hollywood Studios, Magic Kingdom
    FOOD_DRINKS = "food_drinks"  # Epcot
    ANIMALS_NATURE = "animals_nature"  # Animal Kingdom
    CLASSIC_DISNEY = "classic_disney"  # Magic Kingdom
    CULTURAL = "cultural"  # Epcot


class ParkRecommendationRequest(BaseModel):
    # Dates
    start_date: date
    end_date: date
    
    # Party info
    adults: int = Field(ge=1)
    children: int = Field(ge=0)
    child_ages: List[int] = []
    infants: int = Field(ge=0)
    
    # Preferences
    thrill_level: ThrillLevel = ThrillLevel.MODERATE
    park_preferences: List[ParkPreference] = []
    
    # Optional constraints
    must_visit_parks: List[ParkName] = []  # Parks they definitely want to visit
    avoid_parks: List[ParkName] = []  # Parks to skip
    max_park_days: Optional[int] = None  # Limit number of park days
    
    @validator('child_ages')
    def validate_child_ages(cls, v, values):
        if 'children' in values and len(v) != values['children']:
            raise ValueError('Number of child ages must match number of children')
        return v
    
    @property
    def num_nights(self):
        return (self.end_date - self.start_date).days
    
    @property
    def total_people(self):
        return self.adults + self.children + self.infants


class DailyParkPlan(BaseModel):
    date: date
    park: str
    park_display_name: str
    crowd_level: float
    reasons: List[str]
    tips: List[str]
    recommended_arrival_time: str
    estimated_wait_times: str


class ParkRecommendationResponse(BaseModel):
    daily_plans: List[DailyParkPlan]
    rest_days: List[date]
    summary: dict
    optimization_notes: List[str]