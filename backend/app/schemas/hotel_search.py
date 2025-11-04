# backend/app/schemas/hotel_search.py
from pydantic import BaseModel, Field, validator
from datetime import date
from typing import Optional, List
from enum import Enum


class TransportationType(str, Enum):
    BUS = "Bus"
    SKYLINER = "Skyliner"
    MONORAIL = "Monorail"
    BOAT = "Boat"
    WALKING = "Walking"

class LocationType(str, Enum):
    MAGIC_KINGDOM = "Magic Kingdom Resort Area"
    EPCOT = "Epcot Resort Area"
    ANIMAL_KINGDOM = "Animal Kingdom Resort Area"
    DISNEY_SPRINGS = "Disney Springs Resort Area"


class RoomFeature(str, Enum):
    BALCONY = "Balcony"
    CLUB_LEVEL = "Club Level"
    FULL_KITCHEN = "Full Kitchen"
    THEME_PARK_VIEW = "Theme Park View"
    FIFTH_SLEEPER = "5th Sleeper"
    VILLA = "Villa"
    WD = "Washer and Dryer"


class DateFlexibility(str, Enum):
    EXACT = "exact"  # Specific dates
    FLEXIBLE_DAYS = "flexible_days"  # X days within a month
    FLEXIBLE_MONTH = "flexible_month"  # Any time in month


class HotelSearchRequest(BaseModel):
    # Dates
    date_type: DateFlexibility
    check_in: Optional[date] = None
    check_out: Optional[date] = None
    flexible_month: Optional[int] = None  # 1-12
    flexible_year: Optional[int] = None
    num_nights: Optional[int] = Field(None, ge=1, le=14)
    
    # Party
    adults: int = Field(ge=1, le=20)
    children: int = Field(ge=0, le=20)
    infants: int = Field(ge=0, le=10)
    
    # Budget
    total_budget: float = Field(gt=0)
    budget_per_night: Optional[float] = None  # Auto-calculated if not provided
    
    # Preferences (weighted by importance)
    num_rooms: Optional[int] = Field(None, ge=1, le=10)  # Auto-suggest if None
    transportation_prefs: List[TransportationType] = []
    transportation_importance: int = Field(3, ge=1, le=5)  # 1=low, 5=critical
    
    room_features: List[RoomFeature] = []
    features_importance: int = Field(3, ge=1, le=5)
    
    prefer_budget: bool = True  # Optimize for lowest price vs luxury

    location_pref: Optional[str] = None  # "Magic Kingdom Area", etc.
    
    @validator("num_nights", always=True)
    def calculate_num_nights(cls, v, values):
        date_type = values.get("date_type")
        check_in = values.get("check_in")
        check_out = values.get("check_out")

        if date_type == "exact":
            if not (check_in and check_out):
                raise ValueError("Both check_in and check_out required for exact date searches")
            v = (check_out - check_in).days
            if v <= 0:
                raise ValueError("check_out must be after check_in")

        elif date_type in {"flexible_days", "flexible_month"} and v is None:
            raise ValueError("num_nights is required for flexible date searches")

        return v

    @validator("budget_per_night", always=True)
    def calculate_budget_per_night(cls, v, values):
        num_nights = values.get("num_nights")
        total_budget = values.get("total_budget")

        if v is None and num_nights and total_budget:
            v = total_budget / num_nights

        return v



class RoomRecommendation(BaseModel):
    hotel_id: str
    hotel_name: str
    hotel_category: str
    room_id: str
    room_name: str
    room_description: str
    location: str
    
    avg_price_per_night: float
    total_price: float
    
    occupancy: int
    beds: List[dict]
    features: List[str]
    transportation: List[str]
    
    match_score: float
    score_breakdown: dict
    
    why_recommended: List[str]  # Human-readable reasons


class HotelSearchResponse(BaseModel):
    total_results: int
    recommendations: List[RoomRecommendation]