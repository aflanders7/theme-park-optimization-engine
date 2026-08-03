from datetime import date
import pytest

from app.database import SessionLocal
from app.services.hotel_matcher import HotelRecommendationEngine
from app.schemas.hotel_search import (
    HotelSearchRequest,
    DateFlexibility,
    TransportationType,
    RoomFeature,
)


@pytest.fixture
def recommendation_engine():
    db = SessionLocal()
    try:
        yield HotelRecommendationEngine(db)
    finally:
        db.close()


def test_returns_recommendations_for_valid_search(recommendation_engine):
    """Returns ranked hotels for a valid family trip search."""

    request = HotelSearchRequest(
        date_type=DateFlexibility.EXACT,
        check_in=date(2025, 3, 15),
        check_out=date(2025, 3, 20),
        num_nights=5,
        adults=2,
        children=2,
        infants=0,
        total_budget=5000,
        budget_per_night=350,
        prefer_budget=True,
    )

    results = recommendation_engine.find_best_hotels(request)

    assert results
    assert all(result.match_score >= 0 for result in results)

    # Verify results are ranked
    scores = [result.match_score for result in results]
    assert scores == sorted(scores, reverse=True)


def test_respects_budget_constraint(recommendation_engine):
    """Recommendations should not exceed requested budget when possible."""

    request = HotelSearchRequest(
        date_type=DateFlexibility.FLEXIBLE_DAYS,
        flexible_month=9,
        flexible_year=2025,
        num_nights=3,
        adults=2,
        children=0,
        infants=0,
        total_budget=2000,
        prefer_budget=True,
    )

    results = recommendation_engine.find_best_hotels(request)

    assert results

    for hotel in results:
        assert hotel.total_price <= request.total_budget


def test_matches_transportation_preferences(recommendation_engine):
    """Higher transportation importance should influence ranking."""

    request = HotelSearchRequest(
        date_type=DateFlexibility.EXACT,
        check_in=date(2025, 4, 1),
        check_out=date(2025, 4, 6),
        num_nights=5,
        adults=2,
        children=2,
        infants=0,
        total_budget=8000,
        transportation_prefs=[
            TransportationType.MONORAIL
        ],
        transportation_importance=5,
    )

    results = recommendation_engine.find_best_hotels(request)

    assert results

    top_result = results[0]

    assert TransportationType.MONORAIL.value in top_result.transportation


def test_matches_room_features(recommendation_engine):
    """Recommendations should consider requested room features."""

    request = HotelSearchRequest(
        date_type=DateFlexibility.EXACT,
        check_in=date(2025, 4, 1),
        check_out=date(2025, 4, 6),
        num_nights=5,
        adults=2,
        children=2,
        infants=0,
        total_budget=8000,
        room_features=[
            RoomFeature.BALCONY,
            RoomFeature.THEME_PARK_VIEW,
        ],
        features_importance=5,
    )

    results = recommendation_engine.find_best_hotels(request)

    assert results

    top_result = results[0]

    assert "Balcony" in top_result.features or \
           "Theme Park View" in top_result.features


def test_handles_large_groups(recommendation_engine):
    """Large parties should receive rooms that fit occupancy."""

    request = HotelSearchRequest(
        date_type=DateFlexibility.EXACT,
        check_in=date(2025, 6, 10),
        check_out=date(2025, 6, 15),
        num_nights=5,
        adults=4,
        children=2,
        infants=0,
        total_budget=6000,
    )

    results = recommendation_engine.find_best_hotels(request)

    assert results

    for hotel in results:
        assert hotel.occupancy >= 6