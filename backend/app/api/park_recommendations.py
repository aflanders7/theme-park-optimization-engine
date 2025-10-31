# backend/app/api/park_recommendations.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.park_recommendation import (
    ParkRecommendationRequest,
    ParkRecommendationResponse
)
from app.services.park_recommender import ParkRecommendationEngine

router = APIRouter(prefix="/api/parks", tags=["parks"])


@router.post("/recommend", response_model=ParkRecommendationResponse)
async def recommend_parks(
    request: ParkRecommendationRequest,
    db: Session = Depends(get_db)
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
        result = engine.recommend_parks(request)
        return ParkRecommendationResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")


@router.get("/crowd-levels")
async def get_crowd_levels(
    start_date: str,
    end_date: str,
    db: Session = Depends(get_db)
):
    """Get crowd levels for all parks in date range"""
    from datetime import datetime
    from app.models.crowd import CrowdCalendar
    from sqlalchemy import and_
    
    start = datetime.strptime(start_date, "%Y-%m-%d").date()
    end = datetime.strptime(end_date, "%Y-%m-%d").date()
    
    crowds = db.query(CrowdCalendar).filter(
        and_(
            CrowdCalendar.date >= start,
            CrowdCalendar.date <= end
        )
    ).all()
    
    return {
        "crowds": [
            {
                "park": c.park,
                "date": c.date,
                "crowd_level": c.crowd
            }
            for c in crowds
        ]
    }