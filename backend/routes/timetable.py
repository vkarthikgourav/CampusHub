from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from database import get_db
from models.timetable import Timetable
from models.student_enrollment import StudentEnrollment
from models.user import User
from schemas.timetable import TimetableCreate, TimetableUpdate, TimetableResponse
from core.dependencies import require_role, require_roles, get_current_user

router = APIRouter()


@router.post("/timetable/add", response_model=TimetableResponse)
def add_entry(
    entry: TimetableCreate,
    user=Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    new = Timetable(**entry.dict())
    db.add(new)
    db.commit()
    db.refresh(new)
    return new


@router.get("/timetable/view", response_model=list[TimetableResponse])
def view_timetable(
    class_id: int | None = None,
    user=Depends(require_roles(["admin", "professor", "teacher"])),
    db: Session = Depends(get_db),
):
    query = db.query(Timetable).options(joinedload(Timetable.academic_class))
    if class_id:
        query = query.filter(Timetable.class_id == class_id)
    return query.all()


# User's timetable — filtered by enrolled classes (students) or assigned classes (professors)
@router.get("/timetable/my", response_model=list[TimetableResponse])
def my_timetable(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_user = db.query(User).filter(User.email == user["sub"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    if db_user.role in ("professor", "teacher"):
        # Professors can see every timetable (simple requirement)
        return (
            db.query(Timetable)
            .options(joinedload(Timetable.academic_class))
            .all()
        )

    # For students
    enrollments = (
        db.query(StudentEnrollment)
        .filter(StudentEnrollment.student_id == db_user.id)
        .all()
    )
    class_ids = [e.class_id for e in enrollments]
    if not class_ids:
        return []
    return db.query(Timetable).options(joinedload(Timetable.academic_class)).filter(Timetable.class_id.in_(class_ids)).all()


# Admin updates a timetable entry
@router.put("/timetable/update/{entry_id}", response_model=TimetableResponse)
def update_entry(
    entry_id: int,
    data: TimetableUpdate,
    user=Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    entry = db.query(Timetable).filter(Timetable.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")

    update_data = data.dict(exclude_unset=True)
    for key, value in update_data.items():
        if value is not None:
            setattr(entry, key, value)

    db.commit()
    db.refresh(entry)
    return entry


# Admin deletes a timetable entry
@router.delete("/timetable/delete/{entry_id}")
def delete_entry(
    entry_id: int,
    user=Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    entry = db.query(Timetable).filter(Timetable.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"msg": "Entry deleted"}