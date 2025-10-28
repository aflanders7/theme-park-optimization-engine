# backend/test_recommendations.py
from datetime import date, timedelta
from app.database import SessionLocal
from app.services.hotel_matcher import HotelRecommendationEngine
from app.schemas.hotel_search import (
    HotelSearchRequest, 
    DateFlexibility, 
    TransportationType,
    RoomFeature
)

def test_basic_search():
    """Test 1: Basic search with exact dates"""
    print("=" * 60)
    print("TEST 1: Basic Search - Family of 4, $5000 budget")
    print("=" * 60)
    
    db = SessionLocal()
    engine = HotelRecommendationEngine(db)
    
    # Create search request
    search = HotelSearchRequest(
        date_type=DateFlexibility.EXACT,
        check_in=date(2025, 3, 15),
        check_out=date(2025, 3, 20),
        num_nights=5,
        
        adults=2,
        children=2,
        infants=0,
        
        total_budget=5000,
        budget_per_night=350,  # ~$350/night for hotel
        
        prefer_budget=True,
        transportation_importance=3,
        pool_importance=4
    )
    
    # Get recommendations
    results = engine.find_best_hotels(search)
    
    # Display results
    if results:
        print(f"\n✅ Found {len(results)} recommendations\n")
        
        for i, rec in enumerate(results[:3], 1):
            print(f"{i}. {rec.hotel_name}")
            print(f"   Room: {rec.room_name}")
            print(f"   Price: ${rec.avg_price_per_night:.2f}/night (Total: ${rec.total_price:.2f})")
            print(f"   Match Score: {rec.match_score:.1f}/100")
            print(f"   Transportation: {', '.join(rec.transportation)}")
            print(f"   Sleeps: {rec.occupancy}")
            print(f"   Why recommended:")
            for reason in rec.why_recommended:
                print(f"      • {reason}")
            print()
    else:
        print("❌ No results found")
    
    db.close()
    return len(results) > 0


def test_flexible_dates():
    """Test 2: Flexible date search"""
    print("=" * 60)
    print("TEST 2: Flexible Dates - Find best prices in March")
    print("=" * 60)
    
    db = SessionLocal()
    engine = HotelRecommendationEngine(db)
    
    search = HotelSearchRequest(
        date_type=DateFlexibility.FLEXIBLE_DAYS,
        flexible_month=3,
        flexible_year=2025,
        num_nights=5,
        
        adults=2,
        children=0,
        infants=0,
        
        total_budget=3000,
        
        transportation_prefs=[TransportationType.SKYLINER],
        transportation_importance=5,
        
        prefer_budget=True
    )
    
    results = engine.find_best_hotels(search)
    
    if results:
        print(f"\n✅ Found {len(results)} recommendations\n")
        print("Top 3 best value options:")
        
        for i, rec in enumerate(results[:3], 1):
            print(f"{i}. {rec.hotel_name} - {rec.room_name}")
            print(f"   ${rec.avg_price_per_night:.2f}/night")
            print(f"   Score: {rec.match_score:.1f}")
            print()
    else:
        print("❌ No results found")
    
    db.close()
    return len(results) > 0


def test_luxury_search():
    """Test 3: Luxury search with features"""
    print("=" * 60)
    print("TEST 3: Luxury Search - High budget, specific features")
    print("=" * 60)
    
    db = SessionLocal()
    engine = HotelRecommendationEngine(db)
    
    search = HotelSearchRequest(
        date_type=DateFlexibility.EXACT,
        check_in=date(2025, 4, 1),
        check_out=date(2025, 4, 6),
        num_nights=5,
        
        adults=2,
        children=2,
        infants=0,
        
        total_budget=8000,
        
        transportation_prefs=[TransportationType.MONORAIL],
        transportation_importance=4,
        
        room_features=[RoomFeature.BALCONY, RoomFeature.THEME_PARK_VIEW],
        features_importance=4,
        
        prefer_budget=False,  # Want luxury
        pool_importance=5
    )
    
    results = engine.find_best_hotels(search)
    
    if results:
        print(f"\n✅ Found {len(results)} recommendations\n")
        
        for i, rec in enumerate(results[:3], 1):
            print(f"{i}. {rec.hotel_name}")
            print(f"   Category: {rec.hotel_category}")
            print(f"   Room: {rec.room_name}")
            print(f"   Price: ${rec.total_price:.2f} total")
            print(f"   Features: {', '.join(rec.features)}")
            print(f"   Score Breakdown: {rec.score_breakdown}")
            print()
    else:
        print("❌ No results found")
    
    db.close()
    return len(results) > 0


def test_large_group():
    """Test 4: Large group needing multiple rooms"""
    print("=" * 60)
    print("TEST 4: Large Group - 6 people")
    print("=" * 60)
    
    db = SessionLocal()
    engine = HotelRecommendationEngine(db)
    
    search = HotelSearchRequest(
        date_type=DateFlexibility.EXACT,
        check_in=date(2025, 6, 10),
        check_out=date(2025, 6, 15),
        num_nights=5,
        
        adults=4,
        children=2,
        infants=0,
        
        total_budget=6000,
        
        prefer_budget=True
    )
    
    results = engine.find_best_hotels(search)
    
    if results:
        print(f"\n✅ Found {len(results)} recommendations\n")
        
        for i, rec in enumerate(results[:3], 1):
            print(f"{i}. {rec.hotel_name}")
            print(f"   Room: {rec.room_name}")
            print(f"   Sleeps: {rec.occupancy} people")
            print(f"   Beds: {rec.beds}")
            print(f"   Price: ${rec.avg_price_per_night:.2f}/night")
            print()
    else:
        print("❌ No results found")
    
    db.close()
    return len(results) > 0


def test_budget_constraint():
    """Test 5: Very tight budget"""
    print("=" * 60)
    print("TEST 5: Budget Constraint - $2000 total")
    print("=" * 60)
    
    db = SessionLocal()
    engine = HotelRecommendationEngine(db)
    
    search = HotelSearchRequest(
        date_type=DateFlexibility.FLEXIBLE_DAYS,
        flexible_month=9,  # September usually cheaper
        flexible_year=2025,
        num_nights=3,
        
        adults=2,
        children=0,
        infants=0,
        
        total_budget=2000,
        
        prefer_budget=True
    )
    
    results = engine.find_best_hotels(search)
    
    if results:
        print(f"\n✅ Found {len(results)} recommendations\n")
        print("Best budget options:")
        
        for i, rec in enumerate(results[:3], 1):
            budget_used = (rec.total_price / 2000) * 100
            print(f"{i}. {rec.hotel_name}")
            print(f"   ${rec.total_price:.2f} total ({budget_used:.1f}% of budget)")
            print(f"   Category: {rec.hotel_category}")
            print()
    else:
        print("❌ No results found - budget may be too low")
    
    db.close()
    return len(results) > 0


def run_all_tests():
    """Run all tests"""
    print("\n" + "🧪" * 30)
    print("DISNEY PLANNER RECOMMENDATION ENGINE TESTS")
    print("🧪" * 30 + "\n")
    
    tests = [
        ("Basic Search", test_basic_search),
        ("Flexible Dates", test_flexible_dates),
        ("Luxury Search", test_luxury_search),
        ("Large Group", test_large_group),
        ("Budget Constraint", test_budget_constraint)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            passed = test_func()
            results.append((test_name, passed))
        except Exception as e:
            print(f"❌ Test failed with error: {e}")
            import traceback
            traceback.print_exc()
            results.append((test_name, False))
        
        print("\n" + "-" * 60 + "\n")
    
    # Summary
    print("=" * 60)
    print("TEST SUMMARY")
    print("=" * 60)
    
    passed_count = sum(1 for _, passed in results if passed)
    total_count = len(results)
    
    for test_name, passed in results:
        status = "✅ PASSED" if passed else "❌ FAILED"
        print(f"{status}: {test_name}")
    
    print(f"\n{passed_count}/{total_count} tests passed")
    
    if passed_count == total_count:
        print("\n🎉 All tests passed! Recommendation engine is working!")
    else:
        print("\n⚠️  Some tests failed. Check the output above for details.")


if __name__ == "__main__":
    run_all_tests()