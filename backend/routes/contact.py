from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from models.contact import Contact
from schemas.contact import ContactCreate, ContactResponse
from core.dependencies import require_role

router = APIRouter()

@router.get("/contacts", response_model=list[ContactResponse])
def get_contacts(db: Session = Depends(get_db)):
    return db.query(Contact).all()

@router.post("/contacts/add", response_model=ContactResponse)
def add_contact(
    data: ContactCreate,
    admin = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    new = Contact(**data.dict())
    db.add(new)
    db.commit()
    db.refresh(new)
    return new


@router.delete("/contacts/{id}")
def delete_contact(
    id: int,
    admin = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    contact = db.query(Contact).filter(Contact.id == id).first()
    db.delete(contact)
    db.commit()
    return {"msg": "Contact deleted"}