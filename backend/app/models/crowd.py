from sqlalchemy import Column, Integer, String, Float, Date, Index
from app.database import Base

class CrowdCalendar(Base):
    __tablename__ = "crowd_calendar"

    id = Column(Integer, primary_key=True, index=True)
    park = Column(String, index=True)
    date = Column(Date, index=True)
    crowd = Column(Float)

    __table_args__ = (
        Index('idx_park_date', 'park', 'date'),
    )