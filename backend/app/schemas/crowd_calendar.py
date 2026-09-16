# backend/app/schemas/crowd_calendar.py
from datetime import date
from typing import List, Optional

from pydantic import BaseModel, Field


class ParkCrowdLevels(BaseModel):
    """Predicted crowd score (0-10, higher = busier) for each WDW park.

    A field is None when no prediction exists yet for that park/date -
    the frontend renders that as "no data" rather than treating it as 0.
    """

    magic_kingdom: Optional[float] = Field(None, ge=1, le=10)
    epcot: Optional[float] = Field(None, ge=1, le=10)
    hollywood_studios: Optional[float] = Field(None, ge=1, le=10)
    animal_kingdom: Optional[float] = Field(None, ge=1, le=10)


class CrowdCalendarDay(BaseModel):
    date: date
    parks: ParkCrowdLevels


class CrowdCalendarResponse(BaseModel):
    year: int
    month: int
    # False when the crowd_calendar table has zero rows for this month at
    # all, so the frontend can show a "predictions not published yet"
    # message instead of a calendar that just looks broken/empty.
    has_data: bool
    days: List[CrowdCalendarDay]