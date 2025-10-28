# backend/test_db.py
from app.database import SessionLocal
from app.models.hotel import Hotel, Room, RoomPricing

db = SessionLocal()

# Test 1: Count records
print(f"Hotels: {db.query(Hotel).count()}")
print(f"Rooms: {db.query(Room).count()}")
print(f"Pricing: {db.query(RoomPricing).count()}")

# Test 2: Get a hotel with rooms
hotel = db.query(Hotel).first()
print(f"\nSample Hotel: {hotel.name}")
print(f"Rooms at this hotel: {len(hotel.rooms)}")
for room in hotel.rooms[:3]:
    print(f"  - {room.room_name} (sleeps {room.occupancy})")

# Test 3: Get pricing for a room
room = db.query(Room).first()
prices = db.query(RoomPricing).filter(
    RoomPricing.room_id == room.id
).limit(5).all()
print(f"\nSample prices for {room.room_name}:")
for p in prices:
    print(f"  {p.date}: ${p.price}")

db.close()