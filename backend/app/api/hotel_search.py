# backend/app/api/hotel_search.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.hotel_search import HotelSearchRequest, HotelSearchResponse, RoomRecommendation
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
    
    # Split into top recommendations and alternatives
    top_picks = recommendations[:3]
    alternatives = recommendations[3:10]
    
    # Calculate budget summary
    if top_picks:
        avg_price = sum(r.total_price for r in top_picks) / len(top_picks)
        budget_summary = {
            "recommended_budget": round(avg_price, 2),
            "cheapest_option": round(min(r.total_price for r in recommendations), 2),
            "most_expensive": round(max(r.total_price for r in recommendations), 2),
            "your_budget": round(search_request.total_budget, 2),
            "under_budget": avg_price < search_request.total_budget
        }
    else:
        budget_summary = {}
    
    return HotelSearchResponse(
        total_results=len(recommendations),
        recommendations=top_picks,
        alternatives=alternatives,
        budget_summary=budget_summary
    )


@router.get("/options")
async def get_search_options():
    """Get available search options (transportation types, features, etc.)"""
    from app.schemas.hotel_search import TransportationType, RoomFeature, LocationType
    
    return {
        "transportation_types": [t.value for t in TransportationType],
        "room_features": [f.value for f in RoomFeature],
        "date_flexibility_options": ["exact", "flexible_days", "flexible_month"],
        "location_types": [l.value for l in LocationType],
    }


@router.get("/{hotel_id}")
async def get_hotel_details(hotel_id: str, db: Session = Depends(get_db)):
    """Get detailed information about a specific hotel"""
    from app.models.hotel import Hotel
    
    hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
    
    if not hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    
    return {
        "id": hotel.id,
        "name": hotel.name,
        "category": hotel.category,
        "location": hotel.location,
        "transportation": hotel.transportation,
        "rooms": [
            {
                #"id": room.id,
                "room_id": room.room_id,
                "name": room.room_name,
                "description": room.description,
                "occupancy": room.occupancy,
                "min_price": room.min_price,
                "beds": room.beds,
                "features": room.features
            }
            for room in hotel.rooms
        ]
    }