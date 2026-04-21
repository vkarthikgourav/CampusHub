from pydantic import BaseModel
from datetime import datetime

class EventCreate(BaseModel):
    title: str
    description: str
    event_date: str
    event_time: str | None = None
    location: str | None = None
    category: str = "general"

class EventResponse(EventCreate):
    id: int
    created_by: str
    created_at: datetime

    class Config:
        from_attributes = True
