from fastapi import APIRouter, Query
from typing import Optional, List
import datetime
from app.services.hotel_search import find_matching_rooms

router = APIRouter()

@router.get("/search")
def search_hotels(
    check_in: str,
    check_out: str,
    guest_count: int,
    max_price: Optional[float] = None,
    features: Optional[List[str]] = Query(None)
):
    check_in_date = datetime.datetime.strptime(check_in, "%Y-%m-%d").date()
    check_out_date = datetime.datetime.strptime(check_out, "%Y-%m-%d").date()

    results = find_matching_rooms(
        guest_count=guest_count,
        features=features,
        max_price=max_price,
        check_in=check_in_date,
        check_out=check_out_date
    )

    return results.to_dict(orient="records")
