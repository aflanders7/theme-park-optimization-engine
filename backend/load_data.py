# backend/load_data.py
import json
import sys
from pathlib import Path
from datetime import datetime
from sqlalchemy.orm import Session
from app.database import engine, SessionLocal, Base
from app.models.hotel import Hotel, Room, RoomPricing

# Paths to your scraped data
BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "scrapers" / "output"

def parse_date(date_str):
    """Convert '2025-01-Jan 1' → datetime.date(2025, 1, 1)"""
    try:
        # Remove extra spaces and parse
        parts = date_str.replace("  ", " ").split("-")
        year = int(parts[0])
        month = int(parts[1])
        day_part = parts[2].split(" ")[-1]
        day = int(day_part)
        return datetime(year, month, day).date()
    except Exception as e:
        print(f"Error parsing date '{date_str}': {e}")
        return None


def load_hotels(db: Session):
    """Load hotels from hotels.json (without rooms)"""
    print("Loading hotels...")
    
    with open(DATA_DIR / "hotels.json") as f:
        hotels_data = json.load(f)
    
    # Clear existing data
    db.query(Hotel).delete()
    db.commit()
    
    loaded_count = 0
    
    for hotel_data in hotels_data:
        hotel = Hotel(
            id=hotel_data['id'],
            name=hotel_data['name'],
            category=hotel_data['category'],
            location=hotel_data['location'],
            transportation=hotel_data['transportation'],
        )
        db.add(hotel)
        loaded_count += 1
    
    db.commit()
    print(f"✅ Loaded {loaded_count} hotels")


def load_rooms(db: Session):
    """Load rooms from rooms.json"""
    print("Loading rooms...")
    
    with open(DATA_DIR / "rooms.json") as f:
        rooms_data = json.load(f)
    
    # Clear existing rooms
    db.query(Room).delete()
    db.commit()
    
    loaded_count = 0
    skipped_count = 0
    
    for room_data in rooms_data:
        # Check if hotel exists
        hotel = db.query(Hotel).filter(Hotel.id == room_data['hotel_id']).first()
        if not hotel:
            print(f"⚠️  Skipping room - hotel not found: {room_data['hotel_id']}")
            skipped_count += 1
            continue
        
        room = Room(
            hotel_id=room_data['hotel_id'],
            room_id=room_data['room_id'],
            room_name=room_data['room_name'],
            description=room_data.get('description', ''),
            occupancy=room_data['occupancy'],
            beds=room_data.get('beds', []),
            features=room_data.get('features', [])
        )
        db.add(room)
        loaded_count += 1
    
    db.commit()
    print(f"✅ Loaded {loaded_count} rooms")
    if skipped_count > 0:
        print(f"⚠️  Skipped {skipped_count} rooms (hotel not found)")


def load_pricing(db: Session):
    """Load pricing from hotel_room_prices.json"""
    print("Loading pricing data...")
    
    with open(DATA_DIR / "hotel_room_prices.json") as f:
        pricing_data = json.load(f)
    
    # Clear existing pricing
    db.query(RoomPricing).delete()
    db.commit()
    
    loaded_count = 0
    skipped_count = 0
    
    # Build a room lookup: {hotel_id: {room_name: room_id}}
    room_lookup = {}
    rooms = db.query(Room).all()
    for room in rooms:
        if room.hotel_id not in room_lookup:
            room_lookup[room.hotel_id] = {}
        room_lookup[room.hotel_id][room.room_name] = room.id
    
    # Process pricing data
    for hotel_id, dates_dict in pricing_data.items():
        # Check if hotel exists
        hotel = db.query(Hotel).filter(Hotel.id == hotel_id).first()
        if not hotel:
            print(f"⚠️  Skipping pricing - hotel not found: {hotel_id}")
            skipped_count += 1
            continue
        
        for date_str, rooms_prices in dates_dict.items():
            date = parse_date(date_str)
            if not date:
                continue
            
            for room_name, price in rooms_prices.items():
                # Find corresponding room_id
                room_id = room_lookup.get(hotel_id, {}).get(room_name)
                
                if not room_id:
                    # Room not in database, skip
                    continue
                
                pricing = RoomPricing(
                    hotel_id=hotel_id,
                    room_id=room_id,
                    room_name=room_name,
                    date=date,
                    price=float(price)
                )
                db.add(pricing)
                loaded_count += 1
                
                # Commit in batches for performance
                if loaded_count % 1000 == 0:
                    db.commit()
                    print(f"  Processed {loaded_count} pricing records...")
    
    db.commit()
    print(f"✅ Loaded {loaded_count} pricing records")


def main():
    """Main loader function"""
    print("=" * 60)
    print("Disney Planner Database Loader")
    print("=" * 60)
    
    # Create all tables
    print("\nCreating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Tables created")
    
    # Create database session
    db = SessionLocal()
    
    try:
        # Load data in order (hotels → rooms → pricing)
        load_hotels(db)
        load_rooms(db)
        load_pricing(db)
        
        # Print summary
        print("\n" + "=" * 60)
        print("DATABASE SUMMARY")
        print("=" * 60)
        print(f"Hotels:        {db.query(Hotel).count()}")
        print(f"Rooms:         {db.query(Room).count()}")
        print(f"Pricing rows:  {db.query(RoomPricing).count()}")
        print("\n✅ All data loaded successfully!")
        
    except Exception as e:
        print(f"\n❌ Error loading data: {e}")
        db.rollback()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    main()