from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.academic_class import AcademicClass
from models.student_enrollment import StudentEnrollment
from models.user import User
from schemas.academic_class import ClassCreate, ClassResponse
from core.dependencies import require_role, get_current_user

router = APIRouter()


# Admin creates class
@router.post("/class/add", response_model=ClassResponse)
def create_class(
    new_class: ClassCreate,
    user=Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    obj = AcademicClass(**new_class.dict())
    db.add(obj)
    db.commit()
    db.refresh(obj)
    return obj


# View all classes
@router.get("/classes", response_model=list[ClassResponse])
def view_classes(db: Session = Depends(get_db)):
    return db.query(AcademicClass).all()


# Student's enrolled classes
@router.get("/classes/my", response_model=list[ClassResponse])
def my_classes(
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_user = db.query(User).filter(User.email == user["sub"]).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    enrollments = (
        db.query(StudentEnrollment)
        .filter(StudentEnrollment.student_id == db_user.id)
        .all()
    )
    class_ids = [e.class_id for e in enrollments]
    if not class_ids:
        return []
    return db.query(AcademicClass).filter(AcademicClass.id.in_(class_ids)).all()


# Admin updates a class
@router.put("/class/{class_id}", response_model=ClassResponse)
def update_class(
    class_id: int,
    data: ClassCreate,
    user=Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    obj = db.query(AcademicClass).filter(AcademicClass.id == class_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Class not found")
    obj.name = data.name
    obj.department = data.department
    obj.semester = data.semester
    db.commit()
    db.refresh(obj)
    return obj


# Admin deletes a class
@router.delete("/class/{class_id}")
def delete_class(
    class_id: int,
    user=Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    obj = db.query(AcademicClass).filter(AcademicClass.id == class_id).first()
    if not obj:
        raise HTTPException(status_code=404, detail="Class not found")
    # Also remove related enrollments
    db.query(StudentEnrollment).filter(StudentEnrollment.class_id == class_id).delete()
    db.delete(obj)
    db.commit()
    return {"msg": "Class deleted"}