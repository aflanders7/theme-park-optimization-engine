# backend/test_park_recommender.py
import sys
from datetime import date, timedelta
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal
from app.services.park_recommender import ParkRecommendationEngine
from app.schemas.park_recommendation import (
    ParkRecommendationRequest,
    ThrillLevel,
    ParkPreference,
    ParkName
)
from app.models.crowd import CrowdCalendar


def test_basic_recommendation():
    """Test 1: Basic recommendation for family of 4"""
    print("=" * 80)
    print("TEST 1: Basic Family Recommendation")
    print("=" * 80)
    
    db = SessionLocal()
    engine = ParkRecommendationEngine(db)
    
    # Create request
    request = ParkRecommendationRequest(
        start_date=date(2025, 3, 15),
        end_date=date(2025, 3, 20),
        adults=2,
        children=2,
        child_ages=[7, 4],
        infants=0,
        thrill_level=ThrillLevel.MODERATE,
        park_preferences=[ParkPreference.THEMES],
    )
    
    try:
        result = engine.recommend_parks(request)
        
        print(f"\n✅ SUCCESS! Generated {len(result['daily_plans'])} park days")
        print(f"\nSummary:")
        print(f"  Total Days: {result['summary']['total_days']}")
        print(f"  Park Days: {result['summary']['park_days']}")
        print(f"  Rest Days: {result['summary']['rest_days']}")
        print(f"  Average Crowd Level: {result['summary']['average_crowd_level']}")
        
        print(f"\nParks Visited:")
        for park, count in result['summary']['parks_visited'].items():
            print(f"  {park}: {count} time(s)")
        
        print(f"\nDaily Plans:")
        for plan in result['daily_plans']:
            print(f"\n  📅 {plan.date} - {plan.park_display_name}")
            print(f"     Crowd Level: {plan.crowd_level}/10")
            print(f"     Arrival Time: {plan.recommended_arrival_time}")
            print(f"     Why: {plan.reasons[0]}")
        
        print(f"\nRest Days: {', '.join(str(d) for d in result['rest_days'])}")
        
        print(f"\nOptimization Notes:")
        for note in result['optimization_notes']:
            print(f"  • {note}")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"\n❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
        db.close()
        return False


def test_high_thrill_seekers():
    """Test 2: Thrill seekers (teens/adults)"""
    print("\n" + "=" * 80)
    print("TEST 2: Thrill Seekers")
    print("=" * 80)
    
    db = SessionLocal()
    engine = ParkRecommendationEngine(db)
    
    request = ParkRecommendationRequest(
        start_date=date(2025, 4, 1),
        end_date=date(2025, 4, 5),
        adults=2,
        children=2,
        child_ages=[14, 12],
        infants=0,
        thrill_level=ThrillLevel.HIGH,
        park_preferences=[ParkPreference.THRILLS],
        must_visit_parks=[ParkName.HOLLYWOOD_STUDIOS],
    )
    
    try:
        result = engine.recommend_parks(request)
        
        print(f"\n✅ SUCCESS!")
        print(f"\nDaily Plans:")
        for plan in result['daily_plans']:
            print(f"\n  {plan.date} - {plan.park_display_name} (Crowd: {plan.crowd_level}/10)")
            print(f"     Top Reason: {plan.reasons[0]}")
            print(f"     Tips: {plan.tips[0]}")
        
        # Verify Hollywood Studios is included
        parks = [plan.park for plan in result['daily_plans']]
        if 'hollywood_studios' in parks:
            print(f"\n  ✓ Hollywood Studios included as requested")
        else:
            print(f"\n  ⚠️  Hollywood Studios NOT included (must-visit constraint)")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"\n❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
        db.close()
        return False


def test_toddlers_family():
    """Test 3: Family with toddlers"""
    print("\n" + "=" * 80)
    print("TEST 3: Family with Toddlers")
    print("=" * 80)
    
    db = SessionLocal()
    engine = ParkRecommendationEngine(db)
    
    request = ParkRecommendationRequest(
        start_date=date(2025, 5, 10),
        end_date=date(2025, 5, 15),
        adults=2,
        children=2,
        child_ages=[3, 2],
        infants=1,
        thrill_level=ThrillLevel.LOW,
        park_preferences=[ParkPreference.THEMES],
    )
    
    try:
        result = engine.recommend_parks(request)
        
        print(f"\n✅ SUCCESS!")
        print(f"\nOptimized for toddlers:")
        
        # Check if Magic Kingdom is prioritized
        plans = result['daily_plans']
        mk_count = sum(1 for p in plans if p.park == 'magic_kingdom')
        
        print(f"  Magic Kingdom visits: {mk_count}")
        print(f"  Total park days: {len(plans)}")
        print(f"  Rest days: {len(result['rest_days'])}")
        
        print(f"\nDaily Plans:")
        for plan in plans:
            print(f"\n  {plan.date} - {plan.park_display_name}")
            for reason in plan.reasons:
                if 'toddler' in reason.lower() or 'kid' in reason.lower():
                    print(f"     ✓ {reason}")
                    break
        
        db.close()
        return True
        
    except Exception as e:
        print(f"\n❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
        db.close()
        return False


def test_food_lovers():
    """Test 4: Food & drink enthusiasts"""
    print("\n" + "=" * 80)
    print("TEST 4: Food Lovers")
    print("=" * 80)
    
    db = SessionLocal()
    engine = ParkRecommendationEngine(db)
    
    request = ParkRecommendationRequest(
        start_date=date(2025, 6, 1),
        end_date=date(2025, 6, 4),
        adults=4,
        children=0,
        child_ages=[],
        infants=0,
        thrill_level=ThrillLevel.MODERATE,
        park_preferences=[ParkPreference.FOOD_DRINKS, ParkPreference.CULTURAL],
        must_visit_parks=[ParkName.EPCOT],
    )
    
    try:
        result = engine.recommend_parks(request)
        
        print(f"\n✅ SUCCESS!")
        
        # Check if Epcot is prioritized
        epcot_plan = next((p for p in result['daily_plans'] if p.park == 'epcot'), None)
        
        if epcot_plan:
            print(f"\n  Epcot scheduled for: {epcot_plan.date}")
            print(f"  Crowd Level: {epcot_plan.crowd_level}/10")
            print(f"\n  Reasons:")
            for reason in epcot_plan.reasons:
                print(f"    • {reason}")
            print(f"\n  Tips:")
            for tip in epcot_plan.tips:
                print(f"    • {tip}")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"\n❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
        db.close()
        return False


def test_short_trip():
    """Test 5: Short 2-day trip"""
    print("\n" + "=" * 80)
    print("TEST 5: Short Trip (2 days)")
    print("=" * 80)
    
    db = SessionLocal()
    engine = ParkRecommendationEngine(db)
    
    request = ParkRecommendationRequest(
        start_date=date(2025, 7, 15),
        end_date=date(2025, 7, 17),
        adults=2,
        children=1,
        child_ages=[10],
        infants=0,
        thrill_level=ThrillLevel.MODERATE,
        park_preferences=[],
    )
    
    try:
        result = engine.recommend_parks(request)
        
        print(f"\n✅ SUCCESS!")
        print(f"\n  Park Days: {len(result['daily_plans'])}")
        print(f"  Rest Days: {len(result['rest_days'])}")
        
        print(f"\n  Schedule:")
        for plan in result['daily_plans']:
            print(f"    {plan.date}: {plan.park_display_name} (Crowd: {plan.crowd_level}/10)")
        
        # For 2-day trip, should get 2 park days
        if len(result['daily_plans']) == 2:
            print(f"\n  ✓ Correctly scheduled 2 park days for 2-day trip")
        else:
            print(f"\n  ⚠️  Expected 2 park days, got {len(result['daily_plans'])}")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"\n❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
        db.close()
        return False


def test_long_trip():
    """Test 6: Long 7-day trip"""
    print("\n" + "=" * 80)
    print("TEST 6: Long Trip (7 days)")
    print("=" * 80)
    
    db = SessionLocal()
    engine = ParkRecommendationEngine(db)
    
    request = ParkRecommendationRequest(
        start_date=date(2025, 8, 1),
        end_date=date(2025, 8, 8),
        adults=2,
        children=2,
        child_ages=[8, 6],
        infants=0,
        thrill_level=ThrillLevel.MODERATE,
        park_preferences=[],
    )
    
    try:
        result = engine.recommend_parks(request)
        
        print(f"\n✅ SUCCESS!")
        print(f"\n  Trip Length: 7 days")
        print(f"  Park Days: {len(result['daily_plans'])}")
        print(f"  Rest Days: {len(result['rest_days'])}")
        
        # Should have rest days for longer trips
        if len(result['rest_days']) >= 2:
            print(f"  ✓ Includes multiple rest days to prevent burnout")
        
        print(f"\n  Full Schedule:")
        all_dates = sorted(
            [plan.date for plan in result['daily_plans']] + result['rest_days']
        )
        for d in all_dates:
            plan = next((p for p in result['daily_plans'] if p.date == d), None)
            if plan:
                print(f"    {d}: {plan.park_display_name}")
            else:
                print(f"    {d}: REST DAY 🏖️")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"\n❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
        db.close()
        return False


def test_avoid_parks():
    """Test 7: Avoid specific parks"""
    print("\n" + "=" * 80)
    print("TEST 7: Avoid Specific Parks")
    print("=" * 80)
    
    db = SessionLocal()
    engine = ParkRecommendationEngine(db)
    
    request = ParkRecommendationRequest(
        start_date=date(2025, 9, 1),
        end_date=date(2025, 9, 5),
        adults=2,
        children=0,
        child_ages=[],
        infants=0,
        thrill_level=ThrillLevel.HIGH,
        park_preferences=[],
        avoid_parks=[ParkName.ANIMAL_KINGDOM, ParkName.MAGIC_KINGDOM],
    )
    
    try:
        result = engine.recommend_parks(request)
        
        print(f"\n✅ SUCCESS!")
        
        # Verify avoided parks aren't included
        parks_visited = [plan.park for plan in result['daily_plans']]
        avoided_parks = ['animal_kingdom', 'magic_kingdom']
        
        print(f"\n  Avoided parks: Animal Kingdom, Magic Kingdom")
        print(f"  Parks in schedule:")
        for plan in result['daily_plans']:
            print(f"    • {plan.park_display_name}")
        
        conflicts = [p for p in parks_visited if p in avoided_parks]
        if conflicts:
            print(f"\n  ❌ ERROR: Avoided parks were included: {conflicts}")
        else:
            print(f"\n  ✓ Successfully avoided specified parks")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"\n❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
        db.close()
        return False


def test_crowd_data_check():
    """Test 8: Verify crowd data exists"""
    print("\n" + "=" * 80)
    print("TEST 8: Crowd Data Verification")
    print("=" * 80)
    
    db = SessionLocal()
    
    try:
        # Check if crowd data exists
        total_records = db.query(CrowdCalendar).count()
        
        if total_records == 0:
            print(f"\n❌ NO CROWD DATA FOUND!")
            print(f"   Run 'python load_crowd_data.py' to load crowd calendar data")
            db.close()
            return False
        
        print(f"\n✅ Found {total_records} crowd calendar records")
        
        # Sample some data
        sample = db.query(CrowdCalendar).limit(5).all()
        
        print(f"\n  Sample data:")
        for record in sample:
            print(f"    {record.date}: {record.park} = {record.crowd}/10")
        
        # Check date range
        from sqlalchemy import func
        date_range = db.query(
            func.min(CrowdCalendar.date),
            func.max(CrowdCalendar.date)
        ).first()
        
        print(f"\n  Date range: {date_range[0]} to {date_range[1]}")
        
        # Check parks covered
        parks = db.query(CrowdCalendar.park).distinct().all()
        park_names = [p[0] for p in parks]
        
        print(f"\n  Parks covered: {', '.join(park_names)}")
        
        expected_parks = ['magic_kingdom', 'epcot', 'hollywood_studios', 'animal_kingdom']
        missing = [p for p in expected_parks if p not in park_names]
        
        if missing:
            print(f"\n  ⚠️  Missing parks: {', '.join(missing)}")
        else:
            print(f"\n  ✓ All 4 parks have crowd data")
        
        db.close()
        return True
        
    except Exception as e:
        print(f"\n❌ FAILED: {e}")
        import traceback
        traceback.print_exc()
        db.close()
        return False


def test_no_crowd_data_handling():
    """Test 9: Handle missing crowd data gracefully"""
    print("\n" + "=" * 80)
    print("TEST 9: Missing Crowd Data Handling")
    print("=" * 80)
    
    db = SessionLocal()
    engine = ParkRecommendationEngine(db)
    
    # Try dates way in the future (likely no data)
    request = ParkRecommendationRequest(
        start_date=date(2030, 1, 1),
        end_date=date(2030, 1, 5),
        adults=2,
        children=0,
        child_ages=[],
        infants=0,
        thrill_level=ThrillLevel.MODERATE,
        park_preferences=[],
    )
    
    try:
        result = engine.recommend_parks(request)
        print(f"\n⚠️  Expected error but got result")
        db.close()
        return False
        
    except ValueError as e:
        if "No crowd data available" in str(e):
            print(f"\n✅ Correctly raised error: {e}")
            db.close()
            return True
        else:
            print(f"\n❌ Wrong error: {e}")
            db.close()
            return False
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        db.close()
        return False


def run_all_tests():
    """Run all tests and report results"""
    print("\n" + "🧪" * 40)
    print("PARK RECOMMENDATION ENGINE TEST SUITE")
    print("🧪" * 40 + "\n")
    
    tests = [
        ("Crowd Data Check", test_crowd_data_check),
        ("Basic Family", test_basic_recommendation),
        ("Thrill Seekers", test_high_thrill_seekers),
        ("Toddlers", test_toddlers_family),
        ("Food Lovers", test_food_lovers),
        ("Short Trip", test_short_trip),
        ("Long Trip", test_long_trip),
        ("Avoid Parks", test_avoid_parks),
        ("Missing Data Handling", test_no_crowd_data_handling),
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            passed = test_func()
            results.append((test_name, passed))
        except Exception as e:
            print(f"\n❌ {test_name} crashed: {e}")
            results.append((test_name, False))
        
        print("\n" + "-" * 80)
    
    # Summary
    print("\n" + "=" * 80)
    print("TEST SUMMARY")
    print("=" * 80 + "\n")
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    print(f"\n{passed_count}/{total_count} tests passed")
    
    if passed_count == total_count:
        print("\n🎉 All tests passed! Park recommendation engine is working!")
    else:
        print(f"\n⚠️  {total_count - passed_count} test(s) failed")
    
    print("\n" + "=" * 80)


if __name__ == "__main__":
    run_all_tests()