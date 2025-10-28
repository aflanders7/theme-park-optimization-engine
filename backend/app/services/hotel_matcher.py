# backend/app/services/hotel_matcher.py
import pandas as pd
import numpy as np
import calendar
from datetime import datetime, timedelta, date
from typing import List, Dict, Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, or_, String

from app.models.hotel import Hotel, Room, RoomPricing
from app.schemas.hotel_search import HotelSearchRequest, RoomRecommendation


class HotelRecommendationEngine:
    def __init__(self, db: Session):
        self.db = db
    
    def find_best_hotels(self, search: HotelSearchRequest) -> List[RoomRecommendation]:
        """Main recommendation logic with multi-factor scoring"""
        
        # 1. Generate date ranges to check
        date_ranges = self._generate_date_ranges(search)
        
        # 2. Find all potentially suitable rooms
        candidate_rooms = self._get_candidate_rooms(search)
        
        if not candidate_rooms:
            return []
        
        # 3. Calculate pricing for each room across date ranges
        scored_rooms = []

        for room_data in candidate_rooms:
            room, hotel = room_data['room'], room_data['hotel']
            
            # Find best pricing across date ranges
            best_dates, avg_price = self._find_best_pricing(
                room.room_id, room.hotel_id, date_ranges, search.num_nights
            )
            
            if not best_dates or avg_price is None:
                continue
            
            total_price = avg_price * search.num_nights
            
            # Check if within budget
            if search.budget_per_night and avg_price > search.budget_per_night:
                continue
            
            # 4. Score this room
            score, breakdown, reasons = self._calculate_match_score(
                room, hotel, avg_price, search
            )
            
            scored_rooms.append({
                'room': room,
                'hotel': hotel,
                'avg_price': avg_price,
                'total_price': total_price,
                'score': score,
                'breakdown': breakdown,
                'reasons': reasons,
                'best_dates': best_dates
            })

        # 5. Sort by score
        scored_rooms.sort(key=lambda x: x['score'], reverse=True)

        # 6. Convert to response format
        recommendations = [
            self._format_recommendation(r, search.num_nights) 
            for r in scored_rooms[:10]
        ]
        
        return recommendations
    
    def _generate_date_ranges(self, search: HotelSearchRequest) -> List[Tuple[date, date]]:
        """Generate all possible date ranges to check based on flexibility"""
        
        if search.date_type == "exact" and search.check_in and search.check_out:
            return [(search.check_in, search.check_out)]
        
        elif search.date_type == "flexible_days" and search.flexible_month:
            year = search.flexible_year or datetime.now().year
            month = search.flexible_month
            nights = search.num_nights

            days_in_month = calendar.monthrange(year, month)[1]
            
            ranges = []
            start_date = date(year, month, 1)
            
            for day_offset in range(days_in_month):
                check_in = start_date + timedelta(days=day_offset)
                check_out = check_in + timedelta(days=nights)
                
                if check_in.month == month:
                    ranges.append((check_in, check_out))
            
            return ranges
        
        elif search.date_type == "flexible_month":
            year = search.flexible_year or datetime.now().year
            month = search.flexible_month or datetime.now().month
            nights = search.num_nights
            
            sample_starts = [1, 5, 10, 15, 20, 25]
            ranges = []
            
            for day in sample_starts:
                try:
                    check_in = date(year, month, day)
                    check_out = check_in + timedelta(days=nights)
                    ranges.append((check_in, check_out))
                except ValueError:
                    continue
            
            return ranges
        
        else:
            print(f"⚠️ Unknown date_type: {search.date_type}")
            return []
    
# backend/app/services/hotel_matcher.py

    def _get_candidate_rooms(self, search: HotelSearchRequest) -> List[Dict]:
        """Query database for rooms that meet multiple criteria"""
        
        total_guests = search.adults + search.children + search.infants
        
        # Start base query
        query = self.db.query(Room, Hotel).join(
            Hotel, Room.hotel_id == Hotel.id
        ).filter(
            Room.occupancy >= total_guests  # occupancy filter
        )
        
        # Filter by min_price if budget_per_night is provided
        if search.budget_per_night:
            query = query.filter(
                Room.min_price <= search.budget_per_night
            )
        
        # Optional: filter by location preference
        if search.location_preference:
            query = query.filter(
                Hotel.location.ilike(f"%{search.location_preference}%")
            )
        
        results = query.all()
        return [{'room': room, 'hotel': hotel} for room, hotel in results]

    
    def _find_best_pricing(
        self, room_id: str, hotel_id: str, date_ranges: List[Tuple[date, date]], nights: int
    ) -> Tuple[Optional[Tuple[date, date]], Optional[float]]:
        """Find the date range with best average pricing for this room"""
        
        best_dates = None
        best_avg_price = None

        for check_in, check_out in date_ranges:
            prices = self.db.query(RoomPricing.price).filter(
                and_(
                    RoomPricing.room_id == room_id,
                    RoomPricing.hotel_id == hotel_id,
                    RoomPricing.date >= check_in,
                    RoomPricing.date < check_out
                )
            ).all()
            
            if len(prices) < nights:
                print("ERROR: prices < nights")
                continue
            
            avg_price = sum(p[0] for p in prices) / len(prices)
            
            if best_avg_price is None or avg_price < best_avg_price:
                best_avg_price = avg_price
                best_dates = (check_in, check_out)
        
        return best_dates, best_avg_price
    
    def _calculate_match_score(
        self, room: Room, hotel: Hotel, avg_price: float, search: HotelSearchRequest
    ) -> Tuple[float, Dict, List[str]]:
        """Multi-factor scoring algorithm (improved variability + dynamic weighting)"""
        
        scores = {}
        reasons = []
        
        # Weights dynamically based on declared importance (pool/features/transportation)
        weights = {
            "price": 0.30,
            "transportation": 0.20 * (search.transportation_importance / 3),
            "features": 0.20 * (search.features_importance / 3),
            "occupancy": 0.10,
            "category": 0.10,
        }

        # Normalize total weights to 1.0
        total_weight = sum(weights.values())
        for k in weights:
            weights[k] /= total_weight

        # --- 1. PRICE SCORE (0–30 points) ---
        if search.budget_per_night and search.budget_per_night > 0:
            price_ratio = avg_price / search.budget_per_night  # e.g. 0.8 = 20% under, 1.2 = 20% over

            prefer_budget = getattr(search, "prefer_budget", False)

            # 1️⃣ Define ideal ratio target
            target_ratio = 0.85 if prefer_budget else 1.0  # budget users prefer slightly under, others near equal

            # 2️⃣ Compute a smooth decay from the ideal ratio
            # This makes the score drop as the price gets further from the target
            # The denominator (spread) controls sensitivity: higher = gentler curve
            spread = 0.5  # tweak if needed
            price_score = max(0.0, 1.0 - abs(price_ratio - target_ratio) / spread)
            price_score = price_score ** 1.3  # slight curvature to emphasize "close to ideal" range

            # 3️⃣ Explain result
            if price_ratio <= 0.6:
                reasons.append(f"Much cheaper than expected (${int(avg_price)}/night)")
            elif price_ratio <= 0.8:
                reasons.append(f"Below budget (${int(avg_price)}/night)")
            elif price_ratio <= 1.1:
                reasons.append(f"Near your budget (${int(avg_price)}/night)")
            elif price_ratio <= 1.3:
                reasons.append(f"Slightly over budget (${int(avg_price)}/night)")
            else:
                reasons.append(f"Well above budget (${int(avg_price)}/night)")

            # 4️⃣ Scale to 0–30
            scores["price"] = round(price_score * 30, 2)

        else:
            # No budget given — neutral baseline
            scores["price"] = 15.0

        # --- 2. TRANSPORTATION SCORE ---
        if search.transportation_prefs:
            matches = sum(1 for t in search.transportation_prefs if t.value in hotel.transportation)
            transport_ratio = matches / len(search.transportation_prefs)
            transport_score = transport_ratio
            scores["transportation"] = transport_score * 100 * weights["transportation"]
            if matches:
                matched_types = [t.value for t in search.transportation_prefs if t.value in hotel.transportation]
                reasons.append(f"Includes {', '.join(matched_types)} transport options")
        else:
            scores["transportation"] = 0

        # --- 3. ROOM FEATURES SCORE ---
        if search.room_features:
            room_features = room.features or []
            matches = sum(
                1 for f in search.room_features
                if any(f.value.lower() in str(rf).lower() for rf in room_features)
            )
            feature_ratio = matches / len(search.room_features)
            feature_score = feature_ratio
            scores["features"] = feature_score * 100 * weights["features"]
            if matches:
                reasons.append(f"Matches {matches} of your preferred amenities")
        else:
            scores["features"] = 0

        # --- 4. OCCUPANCY FIT ---
        total_guests = search.adults + search.children + search.infants
        occupancy_ratio = total_guests / room.occupancy
        if 0.7 <= occupancy_ratio <= 1.0:
            occ_score = 1.0
            reasons.append(f"Perfect fit for {total_guests} guests")
        elif 0.5 <= occupancy_ratio < 0.7:
            occ_score = 0.7
            reasons.append(f"Comfortable fit for {total_guests} guests")
        else:
            occ_score = 0.4
        scores["occupancy"] = occ_score * 100 * weights["occupancy"]

        # --- 5. CATEGORY (Dynamic based on prefer_budget) ---
        category_map_budget = {"Value": 1.0, "Moderate": 0.6, "Deluxe": 0.3, "Deluxe Villa": 0.2}
        category_map_luxury = {"Value": 0.2, "Moderate": 0.5, "Deluxe": 0.9, "Deluxe Villa": 1.0}

        if search.prefer_budget:
            category_score = category_map_budget.get(hotel.category, 0.5)
        else:
            category_score = category_map_luxury.get(hotel.category, 0.5)

        scores["category"] = category_score * 100 * weights["category"]
        if hotel.category:
            reasons.append(f"{hotel.category} tier hotel")

        # --- Total Score ---
        total_score = sum(scores.values())
        normalized_score = round(total_score, 1)

        return normalized_score, {k: round(v, 1) for k, v in scores.items()}, reasons[:4]
    
    def _format_recommendation(
        self, scored_room: Dict, nights: int
    ) -> RoomRecommendation:
        """Convert internal format to API response format"""
        
        room = scored_room['room']
        hotel = scored_room['hotel']

        return RoomRecommendation(
            hotel_id=hotel.id,
            hotel_name=hotel.name,
            hotel_category=hotel.category,
            room_id=room.room_id,
            room_name=room.room_name,
            room_description=room.description or "",
            avg_price_per_night=round(scored_room['avg_price'], 2),
            total_price=round(scored_room['total_price'], 2),
            occupancy=room.occupancy,
            beds=room.beds or [],
            features=room.features or [],
            transportation=hotel.transportation or [],
            match_score=round(scored_room['score'], 1),
            score_breakdown=scored_room['breakdown'],
            why_recommended=scored_room['reasons']
        )