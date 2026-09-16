# backend/app/api/crowd_calendar.py
import calendar
from datetime import date
from typing import Dict

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.crowd import CrowdCalendar  # adjust import path if crowd.py lives elsewhere
from app.schemas.crowd_calendar import (
    CrowdCalendarDay,
    CrowdCalendarResponse,
    ParkCrowdLevels,
)

def to_user_crowd_level(raw_occupancy: float) -> int:
    raw_occupancy = max(0, min(10, raw_occupancy))
    level = 1 + 9 * (raw_occupancy / 10) ** .85
    return max(1, min(10, round(level)))

router = APIRouter(prefix="/api/crowd-calendar", tags=["crowd-calendar"])

@router.get("", response_model=CrowdCalendarResponse)
def get_crowd_calendar(
    year: int = Query(..., ge=2020, le=2100),
    month: int = Query(..., ge=1, le=12),
    db: Session = Depends(get_db),
):
    """
    Return predicted crowd levels for all four parks for every day in the
    requested month.

    Every calendar day in the month is included in the response, even if
    there's no prediction for it yet (parks come back as null in that
    case) - this keeps the frontend calendar grid complete instead of
    having gaps.
    """
    today = date.today()
    if (year, month) < (today.year, today.month):
        raise HTTPException(status_code=400, detail="Cannot fetch crowd data for a past month.")

    first_day = date(year, month, 1)
    days_in_month = calendar.monthrange(year, month)[1]
    last_day = date(year, month, days_in_month)

    rows = (
        db.query(CrowdCalendar)
        .filter(CrowdCalendar.date >= first_day, CrowdCalendar.date <= last_day)
        .all()
    )

    by_date: Dict[date, Dict[str, float]] = {}
    for row in rows:
        field = row.park
        crowd = to_user_crowd_level(row.crowd)

        if field is None:
            continue

        by_date.setdefault(row.date, {})[field] = crowd

    days = [
        CrowdCalendarDay(
            date=(current := date(year, month, day_num)),
            parks=ParkCrowdLevels(**by_date.get(current, {})),
        )
        for day_num in range(1, days_in_month + 1)
    ]

    return CrowdCalendarResponse(
        year=year,
        month=month,
        has_data=len(rows) > 0,
        days=days,
    )