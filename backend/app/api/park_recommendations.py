# backend/app/api/park_recommendations.py
from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.park_recommendation import ParkRecommendationRequest, ParkRecommendationResponse
from app.services.park_recommender import ParkRecommendationEngine
from app.core.app import limiter, app
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

router = APIRouter(prefix="/api/parks", tags=["parks"])
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

@router.post("/recommend", response_model=ParkRecommendationResponse)
@limiter.limit("2/minute")
@limiter.limit("20/hour")
async def recommend_parks(
    request: Request,
    search_request: ParkRecommendationRequest,
    db: Session = Depends(get_db),
):
    """
    Generate optimized park schedule based on crowd levels and preferences
    
    Takes into account:
    - Crowd calendar data
    - Party composition (adults, children, ages)
    - User preferences (thrills, food, culture, etc.)
    - Trip constraints (must-visit parks, avoid parks)
    
    Returns day-by-day park recommendations with reasons and tips
    """
    
    engine = ParkRecommendationEngine(db)
    
    try:
        result = engine.recommend_parks(search_request)
        return ParkRecommendationResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")
