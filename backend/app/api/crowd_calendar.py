# backend/app/api/crowd_calendar.py
import calendar
import hashlib
import os
import secrets
import threading
import time
from dataclasses import dataclass
from datetime import date
from typing import Dict, Optional, Tuple

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.crowd import CrowdCalendar  # adjust import path if crowd.py lives elsewhere
from app.schemas.crowd_calendar import (
    CrowdCalendarDay,
    CrowdCalendarResponse,
    ParkCrowdLevels,
)

# ---------------------------------------------------------------------------
# Cache tuning
# ---------------------------------------------------------------------------
# Layer 1: in-process cache (skips the DB + JSON serialization entirely)
SERVER_TTL_WITH_DATA = 24 * 60 * 60  # 24 hours
SERVER_TTL_NO_DATA = 10 * 60         # 10 minutes

# Layer 2: HTTP caching headers (browser + Vercel edge / any CDN)
CACHE_CONTROL_WITH_DATA = (
    "public, max-age=3600, s-maxage=21600, stale-while-revalidate=86400"
)
CACHE_CONTROL_NO_DATA = "public, max-age=300, s-maxage=600"


def to_user_crowd_level(raw_occupancy: float) -> int:
    raw_occupancy = max(0, min(10, raw_occupancy))
    level = 1 + 9 * (raw_occupancy / 10) ** .85
    return max(1, min(10, round(level)))


router = APIRouter(prefix="/api/crowd-calendar", tags=["crowd-calendar"])


@dataclass(frozen=True)
class _CacheEntry:
    body: bytes            # pre-serialized JSON
    etag: str
    cache_control: str
    expires_at: float      # time.monotonic() deadline


# Bounded by the query validation (years 2020-2100 x 12 months, ~4KB each),
# so this can never grow without limit.
_cache: Dict[Tuple[int, int], _CacheEntry] = {}
_lock = threading.Lock()


def _get_fresh(key: Tuple[int, int]) -> Optional[_CacheEntry]:
    entry = _cache.get(key)
    if entry and entry.expires_at > time.monotonic():
        return entry
    return None


def _to_json(model) -> bytes:
    # Works on both Pydantic v2 (model_dump_json) and v1 (json)
    dump = getattr(model, "model_dump_json", None) or model.json
    return dump().encode("utf-8")


def _build_entry(db: Session, year: int, month: int) -> _CacheEntry:
    first_day = date(year, month, 1)
    days_in_month = calendar.monthrange(year, month)[1]
    last_day = date(year, month, days_in_month)

    # Only pull the three columns we need instead of full ORM objects
    rows = (
        db.query(CrowdCalendar.date, CrowdCalendar.park, CrowdCalendar.crowd)
        .filter(CrowdCalendar.date >= first_day, CrowdCalendar.date <= last_day)
        .all()
    )

    by_date: Dict[date, Dict[str, int]] = {}
    for row in rows:
        if row.park is None or row.crowd is None:
            continue
        by_date.setdefault(row.date, {})[row.park] = to_user_crowd_level(row.crowd)

    days = [
        CrowdCalendarDay(
            date=(current := date(year, month, day_num)),
            parks=ParkCrowdLevels(**by_date.get(current, {})),
        )
        for day_num in range(1, days_in_month + 1)
    ]

    payload = CrowdCalendarResponse(
        year=year,
        month=month,
        has_data=len(rows) > 0,
        days=days,
    )

    body = _to_json(payload)
    has_data = payload.has_data
    return _CacheEntry(
        body=body,
        etag='"' + hashlib.sha256(body).hexdigest()[:32] + '"',
        cache_control=CACHE_CONTROL_WITH_DATA if has_data else CACHE_CONTROL_NO_DATA,
        expires_at=time.monotonic()
        + (SERVER_TTL_WITH_DATA if has_data else SERVER_TTL_NO_DATA),
    )


def _etag_matches(if_none_match: Optional[str], etag: str) -> bool:
    if not if_none_match:
        return False
    if if_none_match.strip() == "*":
        return True
    # CDNs may re-compress and turn a strong ETag into a weak one (W/"...")
    strip = lambda v: v.strip().removeprefix("W/")
    return strip(etag) in {strip(v) for v in if_none_match.split(",")}


def clear_crowd_calendar_cache() -> None:
    """Call this from your data import/update script after new predictions land."""
    with _lock:
        _cache.clear()


@router.get("", response_model=CrowdCalendarResponse)
def get_crowd_calendar(
    request: Request,
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

    Cached in three places: this process's memory, the browser, and any CDN
    in front of the API. Supports ETag / If-None-Match (304) revalidation.
    """
    today = date.today()
    if (year, month) < (today.year, today.month):
        raise HTTPException(status_code=400, detail="Cannot fetch crowd data for a past month.")

    key = (year, month)
    entry = _get_fresh(key)
    if entry is None:
        # Lock so a burst of requests after expiry causes one DB query, not N
        with _lock:
            entry = _get_fresh(key)
            if entry is None:
                entry = _build_entry(db, year, month)
                _cache[key] = entry

    headers = {"ETag": entry.etag, "Cache-Control": entry.cache_control}

    if _etag_matches(request.headers.get("if-none-match"), entry.etag):
        return Response(status_code=304, headers=headers)

    return Response(content=entry.body, media_type="application/json", headers=headers)


@router.post("/cache/clear", include_in_schema=False)
def clear_cache_endpoint(x_admin_token: Optional[str] = Header(None)):
    """Optional: flush the in-process cache after loading new data.
    Disabled unless the ADMIN_TOKEN env var is set on Railway."""
    expected = os.getenv("ADMIN_TOKEN")
    if not expected or not x_admin_token or not secrets.compare_digest(x_admin_token, expected):
        raise HTTPException(status_code=404)
    clear_crowd_calendar_cache()
    return {"cleared": True}