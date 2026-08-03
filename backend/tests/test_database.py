from app.database import SessionLocal
from app.models.hotel import Hotel, Room, RoomPricing

def test_database_connection():
    """Database connects and contains hotel data."""

    db = SessionLocal()

    try:
        assert db.query(Hotel).count() > 0
        assert db.query(Room).count() > 0
        assert db.query(RoomPricing).count() > 0

    finally:
        db.close()


def test_hotel_room_relationship():
    """Hotels should have associated rooms."""

    db = SessionLocal()

    try:
        hotel = db.query(Hotel).first()

        assert hotel is not None
        assert len(hotel.rooms) > 0

    finally:
        db.close()


def test_room_has_pricing():
    """Rooms should have pricing records."""

    db = SessionLocal()

    try:
        room = db.query(Room).first()

        assert room is not None

        prices = (
            db.query(RoomPricing)
            .filter(RoomPricing.room_id == room.room_id)
            .all()
        )

        assert len(prices) > 0

    finally:
        db.close()