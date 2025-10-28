# backend/app/models/hotel.py
from sqlalchemy import Column, Integer, String, Float, JSON, Date, ForeignKey, Index
from sqlalchemy.orm import relationship
from app.database import Base

class Hotel(Base):
    __tablename__ = "hotels"
    
    id = Column(String, primary_key=True)
    name = Column(String(200), nullable=False)
    category = Column(String(50))
    location = Column(String(200))
    transportation = Column(JSON)
    
    # Relationships
    rooms = relationship("Room", back_populates="hotel", cascade="all, delete-orphan")
    pricing = relationship("RoomPricing", back_populates="hotel", cascade="all, delete-orphan")


class Room(Base):
    __tablename__ = "rooms"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    hotel_id = Column(String, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(String)  # "deluxe-studio---preferred-view"
    room_name = Column(String(200))
    description = Column(String(1000))
    min_price = Column(Float, nullable=False)
    
    # Store occupancy as simple integer
    occupancy = Column(Integer)

    # Add property for backward compatibility
    @property
    def max_total(self):
        return self.occupancy
    
    # Store complex data as JSON
    beds = Column(JSON)
    features = Column(JSON)
    
    # Relationships
    hotel = relationship("Hotel", back_populates="rooms")
    #pricing = relationship("RoomPricing", back_populates="room", cascade="all, delete-orphan")
    
    __table_args__ = (
        Index('idx_room_hotel', 'hotel_id'),
        Index('idx_room_occupancy', 'occupancy'),
    )


class RoomPricing(Base):
    __tablename__ = "room_pricing"
    
    id = Column(Integer, primary_key=True, autoincrement=True)
    hotel_id = Column(String, ForeignKey("hotels.id", ondelete="CASCADE"), nullable=False)
    room_id = Column(String)  # "deluxe-studio---preferred-view"
    room_name = Column(String(200))  # For easier querying
    date = Column(Date, nullable=False)
    price = Column(Float, nullable=False)
    
    # Relationships
    hotel = relationship("Hotel", back_populates="pricing")
    #room = relationship("Room", back_populates="pricing")
    
    __table_args__ = (
        Index('idx_pricing_date', 'date'),
        Index('idx_pricing_hotel_date', 'hotel_id', 'date'),
        Index('idx_pricing_room_date', 'room_id', 'date'),
    )