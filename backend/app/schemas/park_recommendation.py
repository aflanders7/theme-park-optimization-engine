# backend/app/schemas/park_recommendation.py
"""
NOTE: This file was reconstructed from how `ParkRecommendationRequest` /
`ParkRecommendationResponse` / `DailyParkPlan` are used elsewhere in the
codebase (the original schema file wasn't part of the provided files). Field
names and defaults match existing usage exactly so nothing else breaks; the
only additions are new, optional/defaulted fields called out below. If your
real schema file differs, port these additions into it rather than replacing
it wholesale.

Additions vs. the inferred original:
- `max_park_days` on the request (used as a hard cap, see engine).
- `crowd_data_available` and `is_must_visit` on `DailyParkPlan` (lets the
  frontend show "estimated" crowd badges and must-visit badges).
- `rest_days` is now `List[RestDayPlan]` (date + a short note) instead of
  `List[date]`, so the UI can explain *why* a day is a rest day instead of
  just marking it empty.
"""

from __future__ import annotations

from datetime import date
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field


class ThrillLevel(str, Enum):
    LOW = "low"
    MODERATE = "moderate"
    HIGH = "high"


class ParkPreference(str, Enum):
    THRILLS = "thrills"
    FOOD_DRINKS = "food_drinks"
    ANIMALS_NATURE = "animals_nature"
    THEMES = "themes"
    CULTURAL = "cultural"


class ParkRecommendationRequest(BaseModel):
    start_date: date
    end_date: date
    park_days: int = Field(..., ge=0, description="Exact number of park days to schedule.")
    max_park_days: Optional[int] = Field(
        None, ge=0, description="Optional hard cap on park_days (e.g. imposed by a ticket type)."
    )

    adults: int = Field(1, ge=0)
    children: int = Field(0, ge=0)
    infants: int = Field(0, ge=0)
    child_ages: List[int] = Field(default_factory=list)

    park_preferences: List[ParkPreference] = Field(default_factory=list)
    thrill_level: ThrillLevel = ThrillLevel.MODERATE

    must_visit_parks: List[str] = Field(default_factory=list)
    avoid_parks: List[str] = Field(default_factory=list)

    park_on_arrival: bool = False
    park_on_departure: bool = False

    # Retained for backward compatibility with existing callers. The engine
    # now derives the real trip length from start_date/end_date rather than
    # trusting this value (see the "total_days" bug fix in the engine).
    num_nights: Optional[int] = None


class DailyParkPlan(BaseModel):
    date: date
    park: str
    park_display_name: str
    crowd_level: int = Field(
        ..., ge=1, le=10, description="User-facing 1-10 crowd level (see to_user_crowd_level)."
    )
    crowd_data_available: bool = Field(
        True, description="False if no crowd prediction existed for this park/date and a neutral estimate was used instead."
    )
    is_must_visit: bool = False
    reasons: List[str]
    tips: List[str]


class RestDayPlan(BaseModel):
    date: date
    note: str


class ParkRecommendationResponse(BaseModel):
    daily_plans: List[DailyParkPlan]
    rest_days: List[RestDayPlan]
    summary: dict
    optimization_notes: List[str]