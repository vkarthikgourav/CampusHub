from sqlalchemy import Column, Integer, String, DateTime, Text
from database import Base
from datetime import datetime

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    event_date = Column(String, nullable=False)
    event_time = Column(String, nullable=True)
    location = Column(String, nullable=True)
    category = Column(String, nullable=False, default="general")  # general, academic, cultural, sports
    created_by = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
