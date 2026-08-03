from datetime import date
import pytest

from app.database import SessionLocal
from app.services.park_recommender import ParkRecommendationEngine
from app.schemas.park_recommendation import (
    ParkRecommendationRequest,
    ThrillLevel,
    ParkPreference,
    ParkName,
)
from app.models.crowd import CrowdCalendar


@pytest.fixture
def recommendation_engine():
    db = SessionLocal()
    try:
        yield ParkRecommendationEngine(db)
    finally:
        db.close()


def test_generates_family_recommendation(recommendation_engine):
    """Generates a valid itinerary for a family trip."""

    request = ParkRecommendationRequest(
        start_date=date(2025, 3, 15),
        end_date=date(2025, 3, 20),
        park_days=4,
        adults=2,
        children=2,
        child_ages=[7, 4],
        infants=0,
        thrill_level=ThrillLevel.MODERATE,
        park_preferences=[ParkPreference.THEMES],
    )

    result = recommendation_engine.recommend_parks(request)

    assert result
    assert len(result["daily_plans"]) == 4
    assert result["summary"]["park_days"] == len(result["daily_plans"])

    for plan in result["daily_plans"]:
        assert plan.park
        assert plan.crowd_level >= 0
        assert plan.reasons


def test_must_visit_park_is_included(recommendation_engine):
    """Must-visit constraints should be respected."""

    request = ParkRecommendationRequest(
        start_date=date(2025, 4, 1),
        end_date=date(2025, 4, 5),
        park_days=3,
        adults=2,
        children=2,
        child_ages=[14, 12],
        infants=0,
        thrill_level=ThrillLevel.HIGH,
        park_preferences=[ParkPreference.THRILLS],
        must_visit_parks=[ParkName.HOLLYWOOD_STUDIOS],
    )

    result = recommendation_engine.recommend_parks(request)

    parks = [plan.park for plan in result["daily_plans"]]

    assert ParkName.HOLLYWOOD_STUDIOS.value in parks


def test_toddler_preferences_prioritize_family_parks(recommendation_engine):
    """Young children should influence recommendations."""

    request = ParkRecommendationRequest(
        start_date=date(2025, 5, 10),
        end_date=date(2025, 5, 15),
        park_days=3,
        adults=2,
        children=2,
        child_ages=[3, 2],
        infants=1,
        thrill_level=ThrillLevel.LOW,
        park_preferences=[ParkPreference.THEMES],
    )

    result = recommendation_engine.recommend_parks(request)

    parks = [
        plan.park
        for plan in result["daily_plans"]
    ]

    assert len(parks) > 0
    assert "magic_kingdom" in parks


def test_food_preferences_include_epcot(recommendation_engine):
    """Food-focused trips should consider Epcot."""

    request = ParkRecommendationRequest(
        start_date=date(2025, 6, 1),
        end_date=date(2025, 6, 4),
        park_days=2,
        adults=4,
        children=0,
        child_ages=[],
        infants=0,
        thrill_level=ThrillLevel.MODERATE,
        park_preferences=[
            ParkPreference.FOOD_DRINKS,
            ParkPreference.CULTURAL,
        ],
        must_visit_parks=[ParkName.EPCOT],
    )

    result = recommendation_engine.recommend_parks(request)

    parks = [
        plan.park
        for plan in result["daily_plans"]
    ]

    assert ParkName.EPCOT.value in parks


def test_short_trip_creates_correct_schedule(recommendation_engine):
    """Rest days and park days calculate correctly for short trips."""

    request = ParkRecommendationRequest(
        start_date=date(2025, 7, 15),
        end_date=date(2025, 7, 17),
        park_days=2,
        park_on_arrival=True,
        adults=2,
        children=1,
        child_ages=[10],
        infants=0,
        thrill_level=ThrillLevel.MODERATE,
        park_preferences=[],
    )

    result = recommendation_engine.recommend_parks(request)

    assert len(result["daily_plans"]) == 2
    assert len(result["rest_days"]) == 1


def test_long_trip_includes_rest_days(recommendation_engine):
    """Rest days should be generated based on park days."""

    request = ParkRecommendationRequest(
        start_date=date(2025, 8, 1),
        end_date=date(2025, 8, 8),
        park_days=5,
        adults=2,
        children=2,
        child_ages=[8, 6],
        infants=0,
        thrill_level=ThrillLevel.MODERATE,
        park_preferences=[],
    )

    result = recommendation_engine.recommend_parks(request)

    assert len(result["daily_plans"]) == 5
    assert len(result["rest_days"]) == 3


def test_trip_includes_no_rest_days(recommendation_engine):
    """If park days == the length of the trip, there should be no rest days."""

    request = ParkRecommendationRequest(
        start_date=date(2025, 4, 1),
        end_date=date(2025, 4, 6),
        park_days=6,
        adults=2,
        children=2,
        child_ages=[8, 6],
        infants=0,
        thrill_level=ThrillLevel.MODERATE,
        park_preferences=[],
    )

    result = recommendation_engine.recommend_parks(request)

    assert len(result["daily_plans"]) == 6
    assert len(result["rest_days"]) == 0


def test_avoids_excluded_parks(recommendation_engine):
    """Avoid park constraints should be respected."""

    request = ParkRecommendationRequest(
        start_date=date(2025, 9, 1),
        end_date=date(2025, 9, 5),
        park_days=4,
        adults=2,
        children=0,
        child_ages=[],
        infants=0,
        thrill_level=ThrillLevel.HIGH,
        park_preferences=[],
        avoid_parks=[
            ParkName.ANIMAL_KINGDOM,
            ParkName.MAGIC_KINGDOM,
        ],
    )

    result = recommendation_engine.recommend_parks(request)

    parks = [
        plan.park
        for plan in result["daily_plans"]
    ]

    assert ParkName.ANIMAL_KINGDOM.value not in parks
    assert ParkName.MAGIC_KINGDOM.value not in parks


def test_prioritizes_park_variety(recommendation_engine):
    """Four park days should include all four parks when there are no avoided parks."""

    request = ParkRecommendationRequest(
        start_date=date(2025, 9, 1),
        end_date=date(2025, 9, 5),
        park_days=4,
        park_on_departure=True,
        adults=2,
        children=0,
        child_ages=[],
        infants=0,
        park_preferences=[],
        avoid_parks=[],
    )

    result = recommendation_engine.recommend_parks(request)

    parks = {
        plan.park
        for plan in result["daily_plans"]
    }

    assert parks == {
        ParkName.MAGIC_KINGDOM.value,
        ParkName.EPCOT.value,
        ParkName.HOLLYWOOD_STUDIOS.value,
        ParkName.ANIMAL_KINGDOM.value,
    }


def test_crowd_data_exists():
    """Database should contain required crowd data."""

    db = SessionLocal()

    try:
        assert db.query(CrowdCalendar).count() > 0

        parks = {
            row[0]
            for row in db.query(CrowdCalendar.park).distinct()
        }

        expected = {
            "magic_kingdom",
            "epcot",
            "hollywood_studios",
            "animal_kingdom",
        }

        assert expected.issubset(parks)

    finally:
        db.close()


def test_missing_crowd_data_raises_error(recommendation_engine):
    """Future dates without crowd data should fail gracefully."""

    request = ParkRecommendationRequest(
        start_date=date(2030, 1, 1),
        end_date=date(2030, 1, 5),
        park_days=4,
        adults=2,
        children=0,
        child_ages=[],
        infants=0,
        thrill_level=ThrillLevel.MODERATE,
        park_preferences=[],
    )

    with pytest.raises(ValueError, match="No crowd data available"):
        recommendation_engine.recommend_parks(request)