from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.event import Event
from schemas.event import EventCreate, EventResponse
from core.dependencies import get_current_user

router = APIRouter(prefix="/events", tags=["events"])

@router.post("/", response_model=EventResponse)
def create_event(
    event: EventCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create events")

    new_event = Event(
        **event.dict(),
        created_by=current_user.get("name", "Admin")
    )
    db.add(new_event)
    db.commit()
    db.refresh(new_event)
    return new_event

@router.get("/", response_model=list[EventResponse])
def get_all_events(db: Session = Depends(get_db)):
    return db.query(Event).order_by(Event.event_date.desc()).all()

@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete events")
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    return {"msg": "Event deleted"}
