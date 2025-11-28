# backend/app/api/hotel_search.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.hotel_search import HotelSearchRequest, HotelSearchResponse
from app.services.hotel_matcher import HotelRecommendationEngine
from app.core.app import limiter, app
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

router = APIRouter(prefix="/api/hotels", tags=["hotels"])
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@router.post("/search", response_model=HotelSearchResponse)
#@limiter.limit("5/minute")
#@limiter.limit("20/hour")
async def search_hotels(
    request: Request,
    search_request: HotelSearchRequest,
    db: Session = Depends(get_db),
):
    """
    Find best hotel rooms based on detailed preferences
    
    Supports:
    - Flexible date searching
    - Multi-factor scoring (price, transportation, features, etc.)
    - Budget optimization
    """
    
    engine = HotelRecommendationEngine(db)
    recommendations = engine.find_best_hotels(search_request)
    
    if not recommendations:
        raise HTTPException(
            status_code=404,
            detail="No hotels found matching your criteria. Try adjusting your budget or dates."
        )
    
    return HotelSearchResponse(
        total_results=len(recommendations),
        recommendations=recommendations,
    )