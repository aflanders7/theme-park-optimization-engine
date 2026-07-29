# backend/app/services/hotel_matcher.py
from typing import List, Dict, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import and_, func, or_, String

from app.models.hotel import Hotel, Room, RoomPricing
from app.schemas.hotel_search import HotelSearchRequest, RoomRecommendation


class HotelRecommendationEngine:
    def __init__(self, db: Session):
        self.db = db
    
    def find_best_hotels(self, search: HotelSearchRequest) -> List[RoomRecommendation]:
        """Main recommendation logic with multi-factor scoring"""
        
        candidate_rooms = self._get_candidate_rooms(search)
        
        if not candidate_rooms:
            return []
        
        if search.date_type == "exact":
            price_map = self._batch_fetch_exact_pricing(candidate_rooms, search)
        elif search.date_type == "flexible_days":
            price_map = self._batch_fetch_monthly_pricing(candidate_rooms, search)
        else:
            raise ValueError(f"Unknown date_type: {search.date_type}")
        
        scored_rooms = []

        for room_data in candidate_rooms:
            room, hotel = room_data['room'], room_data['hotel']
            key = (room.room_id, room.hotel_id)
            avg_price = price_map.get(key)

            # Room got filtered out already
            if avg_price is None:
                continue

            total_price = avg_price * search.num_nights
            
            score, breakdown, reasons = self._calculate_match_score(
                room, hotel, avg_price, search
            )

            # Weight price slightly less since it’s approximate
            if getattr(search, "date_type", None) == "flexible_days":
                breakdown["price"] *= 0.7
            
            scored_rooms.append({
                'room': room,
                'hotel': hotel,
                'avg_price': avg_price,
                'total_price': total_price,
                'score': score,
                'breakdown': breakdown,
                'reasons': reasons
            })

        # Sort by score
        scored_rooms.sort(key=lambda x: x['score'], reverse=True)
        recommendations = []

        #different_hotels = len({room['hotel'].id for room in scored_rooms})

        for r in scored_rooms:
            # Stop once we have 5 recommendations total
            if len(recommendations) >= 5:
                break

            hotel_id = r['hotel'].id
            occupancy = r['room'].occupancy

            # Check if this hotel is already in the list with the same occupancy
            same_hotel_same_occ = any(
                rec.hotel_id == hotel_id and rec.occupancy == occupancy
                for rec in recommendations
            )

            # Only add if we don’t already have this exact combo
            if not same_hotel_same_occ or len(scored_rooms) <= 5:
                recommendations.append(self._format_recommendation(r, search.num_nights))

        return recommendations
  

    def _get_candidate_rooms(self, search: HotelSearchRequest) -> List[Dict]:
        """Query database for rooms that meet multiple criteria"""
        if search.infants >= 1:
            search.infants -= 1

        total_guests = search.adults + search.children + search.infants
        
        query = self.db.query(Room, Hotel).join(
            Hotel, Room.hotel_id == Hotel.id
        ).filter(
            Room.occupancy >= total_guests  
        )
        
        if search.budget_per_night:
            query = query.filter(Room.min_price <= search.budget_per_night)
        
        results = query.all()
        return [{'room': room, 'hotel': hotel} for room, hotel in results]

    
    def _batch_fetch_exact_pricing(self, candidate_rooms, search: HotelSearchRequest) -> Dict[Tuple[str, str], float]:
        """Fetch all exact-date average prices in one query."""
        room_ids = [r["room"].room_id for r in candidate_rooms]
        hotel_ids = [r["hotel"].id for r in candidate_rooms]

        results = (
            self.db.query(
                RoomPricing.room_id,
                RoomPricing.hotel_id,
                func.avg(RoomPricing.price).label("avg_price"),
            )
            .filter(
                RoomPricing.room_id.in_(room_ids),
                RoomPricing.hotel_id.in_(hotel_ids),
                RoomPricing.date >= search.check_in,
                RoomPricing.date < search.check_out,
            )
            .group_by(RoomPricing.room_id, RoomPricing.hotel_id)
            .having(func.avg(RoomPricing.price) <= search.budget_per_night)
            .all()
        )

        return {(r.room_id, r.hotel_id): float(r.avg_price) for r in results}
    

    def _batch_fetch_monthly_pricing(self, candidate_rooms, search: HotelSearchRequest) -> Dict[Tuple[str, str], float]:
        """Fetch all average monthly prices in one query."""
        room_ids = [r["room"].room_id for r in candidate_rooms]
        hotel_ids = [r["hotel"].id for r in candidate_rooms]

        results = (
            self.db.query(
                RoomPricing.room_id,
                RoomPricing.hotel_id,
                func.avg(RoomPricing.price).label("avg_price"),
            )
            .filter(
                RoomPricing.room_id.in_(room_ids),
                RoomPricing.hotel_id.in_(hotel_ids),
                func.extract("year", RoomPricing.date) == search.flexible_year,
                func.extract("month", RoomPricing.date) == search.flexible_month,
            )
            .group_by(RoomPricing.room_id, RoomPricing.hotel_id)
            .having(func.avg(RoomPricing.price) <= search.budget_per_night)
            .all()
        )

        return {(r.room_id, r.hotel_id): float(r.avg_price) for r in results}

    
    def _calculate_match_score(
        self, room: Room, hotel: Hotel, avg_price: float, search: HotelSearchRequest
    ) -> Tuple[float, Dict, List[str]]:
        """Multi-factor scoring algorithm (improved variability + dynamic weighting)"""
        
        scores = {}
        reasons = []
        
        # Weights dynamically based on declared importance (features/transportation)
        weights = {
            "price": 0.30,
            "transportation": 0.20 * (search.transportation_importance / 3),
            "features": 0.20 * (search.features_importance / 3),
            "occupancy": 0.10,
            "category": 0.10,
            "location": 0.10,
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

        # --- LOCATION SCORE ---
        if search.location_pref and search.location_pref.lower() == hotel.location.lower():
                scores["location"] = 100 * weights["location"]
                reasons.append(f"Located in the {hotel.location}")
        else:
            scores["location"] = 0

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
            location=hotel.location or "",
            match_score=round(scored_room['score'], 1),
            score_breakdown=scored_room['breakdown'],
            why_recommended=scored_room['reasons']
        )