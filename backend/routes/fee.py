from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.fee import Fee
from models.user import User
from schemas.fee import FeeUpdate, FeeResponse
from core.dependencies import require_role, get_current_user

router = APIRouter()


# Student views their fee
@router.get("/fees/status", response_model=FeeResponse)
def view_fee(user = Depends(get_current_user),
             db: Session = Depends(get_db)):

    db_user = db.query(User).filter(User.email == user["sub"]).first()

    fee = db.query(Fee).filter(Fee.student_id == db_user.id).first()

    if not fee:
        raise HTTPException(status_code=404, detail="Fee record not found")

    return fee


# Admin views all fees
@router.get("/fees/all", response_model=list[FeeResponse])
def view_all_fees(user = Depends(require_role("admin")),
                  db: Session = Depends(get_db)):
    return db.query(Fee).all()


# Admin updates fee
@router.post("/fees/update", response_model=FeeResponse)
def update_fee(data: FeeUpdate,
               user = Depends(require_role("admin")),
               db: Session = Depends(get_db)):

    fee = db.query(Fee).filter(Fee.student_id == data.student_id).first()

    if not fee:
        fee = Fee(student_id=data.student_id, status=data.status)
        db.add(fee)
    else:
        fee.status = data.status

    db.commit()
    db.refresh(fee)

    return fee