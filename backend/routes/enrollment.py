from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.student_enrollment import StudentEnrollment
from models.user import User
from models.academic_class import AcademicClass
from schemas.student_enrollment import EnrollRequest, EnrollmentResponse
from core.dependencies import require_role, get_current_user

router = APIRouter()


@router.post("/enroll", response_model=EnrollmentResponse)
def enroll_student(
    req: EnrollRequest,
    user=Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    student = db.query(User).filter(User.id == req.student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    ac = db.query(AcademicClass).filter(AcademicClass.id == req.class_id).first()
    if not ac:
        raise HTTPException(status_code=404, detail="Class not found")

    existing = (
        db.query(StudentEnrollment)
        .filter(StudentEnrollment.student_id == req.student_id, StudentEnrollment.class_id == req.class_id)
        .first()
    )
    if existing:
        raise HTTPException(status_code=400, detail="Already enrolled")

    enrollment = StudentEnrollment(student_id=req.student_id, class_id=req.class_id)
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.delete("/unenroll")
def unenroll_student(
    req: EnrollRequest,
    user=Depends(require_role("admin")),
    db: Session = Depends(get_db),
):
    enrollment = (
        db.query(StudentEnrollment)
        .filter(StudentEnrollment.student_id == req.student_id, StudentEnrollment.class_id == req.class_id)
        .first()
    )
    if not enrollment:
        raise HTTPException(status_code=404, detail="Enrollment not found")
    db.delete(enrollment)
    db.commit()
    return {"msg": "Unenrolled successfully"}


@router.get("/enrollments/{student_id}", response_model=list[EnrollmentResponse])
def get_student_enrollments(
    student_id: int,
    user=Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return db.query(StudentEnrollment).filter(StudentEnrollment.student_id == student_id).all()
