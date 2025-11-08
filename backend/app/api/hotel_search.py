# backend/app/api/hotel_search.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.hotel_search import HotelSearchRequest, HotelSearchResponse
from app.services.hotel_matcher import HotelRecommendationEngine

router = APIRouter(prefix="/api/hotels", tags=["hotels"])


@router.post("/search", response_model=HotelSearchResponse)
async def search_hotels(
    search_request: HotelSearchRequest,
    db: Session = Depends(get_db)
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