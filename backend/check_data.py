# check_missing_rooms.py
import json
from pathlib import Path
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.hotel import Room

# Paths
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "scrapers" / "output"
FLAT_JSON_PATH = DATA_DIR / "hotel_room_prices_2026_flat.json"

def check_missing_rooms(db: Session, flat_json_path: Path):
    """Check which rooms in the flat JSON do not exist in the database and vice versa."""
    print("Checking rooms consistency between flat JSON and database...\n")
    
    with open(flat_json_path) as f:
        pricing_data = json.load(f)
    
    # Build a room lookup from DB: {hotel_id: set(room_name)}
    room_lookup = {}
    rooms = db.query(Room).all()
    for room in rooms:
        room_lookup.setdefault(room.hotel_id, set()).add(room.room_name)
    
    # Build a lookup from flat JSON: {hotel_id: set(room_name)}
    json_lookup = {}
    for hotel_id, dates_dict in pricing_data.items():
        for date_str, rooms_prices in dates_dict.items():
            json_lookup.setdefault(hotel_id, set()).update(rooms_prices.keys())
    
    # 1️⃣ Rooms in JSON but missing in DB
    missing_in_db = {}
    for hotel_id, room_names in json_lookup.items():
        for room_name in room_names:
            if room_name not in room_lookup.get(hotel_id, set()):
                missing_in_db.setdefault(hotel_id, set()).add(room_name)
    
    if missing_in_db:
        print("⚠️ Rooms in JSON but missing in DB:")
        for hotel_id, rooms in missing_in_db.items():
            print(f"\nHotel {hotel_id}:")
            for room_name in rooms:
                print(f"  - {room_name}")
    else:
        print("✅ No rooms missing in DB from JSON")
    
    # 2️⃣ Rooms in DB but missing in JSON
    missing_in_json = {}
    for hotel_id, room_names in room_lookup.items():
        for room_name in room_names:
            if room_name not in json_lookup.get(hotel_id, set()):
                missing_in_json.setdefault(hotel_id, set()).add(room_name)
    
    if missing_in_json:
        print("\n⚠️ Rooms in DB but missing in JSON:")
        for hotel_id, rooms in missing_in_json.items():
            print(f"\nHotel {hotel_id}:")
            for room_name in rooms:
                print(f"  - {room_name}")
    else:
        print("\n✅ No rooms missing in JSON from DB")

if __name__ == "__main__":
    db = SessionLocal()
    try:
        check_missing_rooms(db, FLAT_JSON_PATH)
    finally:
        db.close()
