from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.academic_class import AcademicClass
from models.student_enrollment import StudentEnrollment
from schemas.user import UserCreate, UserLogin
from services.auth_service import hash_password, verify_password
from core.security import create_access_token

router = APIRouter()


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    if user.role != "student":
        user.roll_number = None
        user.department = None

    hashed = hash_password(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        role=user.role,
        password=hashed,
        roll_number=user.roll_number,
        department=user.department,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Auto-enroll student into classes matching their department
    if user.role == "student" and user.department:
        matching_classes = (
            db.query(AcademicClass)
            .filter(AcademicClass.department == user.department)
            .all()
        )
        for ac in matching_classes:
            enrollment = StudentEnrollment(student_id=new_user.id, class_id=ac.id)
            db.add(enrollment)
        if matching_classes:
            db.commit()

    return {"msg": "User Created"}


@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": db_user.email,
        "role": db_user.role,
        "name": db_user.name,
        "department": db_user.department,
        "user_id": db_user.id,
        "roll_number": db_user.roll_number,
    })

    return {"access_token": token}