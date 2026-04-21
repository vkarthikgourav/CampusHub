from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session 
from database import get_db
from models.user import User 
from schemas.user import UserCreate, UserResponse
from core.dependencies import require_role
from services.auth_service import hash_password

router= APIRouter()

@router.post("/users", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
    admin = Depends(require_role("admin"))
):
    if user.role != "student":
        user.roll_number = None
    hashed = hash_password(user.password)

    new_user = User(
        name=user.name,
        email=user.email,
        role=user.role,
        password=hashed,
        roll_number=user.roll_number,
        department=user.department
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return new_user


# Admin can see all users
@router.get("/admin/users/{role}", response_model=list[UserResponse])
def get_users_by_role(
    role: str,
    admin = Depends(require_role("admin")),
    db: Session = Depends(get_db)
):
    users = db.query(User).filter(User.role == role).all()
    return users