from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from database import get_db
from models.result import Result
from models.user import User
from schemas.result import ResultCreate, ResultResponse
from core.dependencies import get_current_user
import os
import shutil
from datetime import datetime

router = APIRouter(prefix="/results", tags=["results"])

UPLOAD_DIR = "uploads/results"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload", response_model=ResultResponse)
async def upload_result(
    student_id: int = Form(...),
    title: str = Form(...),
    semester: str = Form(...),
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Only admins can upload results")
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # Verify student exists
    student = db.query(User).filter(User.id == student_id, User.role == "student").first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    file_path = os.path.join(UPLOAD_DIR, f"{student.roll_number}_{datetime.now().timestamp()}_{file.filename}")
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    new_result = Result(student_id=student_id, title=title, semester=semester, pdf_url=file_path)
    db.add(new_result)
    db.commit()
    db.refresh(new_result)
    return new_result

@router.get("/student/{student_id}", response_model=list[ResultResponse])
def get_student_results(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "admin" and current_user.get("user_id") != student_id:
        raise HTTPException(status_code=403, detail="Not authorized to view these results")
    results = db.query(Result).filter(Result.student_id == student_id).all()
    return results

@router.get("/my", response_model=list[ResultResponse])
def get_my_results(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    user_id = current_user.get("user_id")
    results = db.query(Result).filter(Result.student_id == user_id).all()
    return results

@router.get("/all")
def get_all_results(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin only")
    results = db.query(Result, User).join(User, Result.student_id == User.id).all()
    return [
        {
            "id": r.id, "title": r.title, "semester": r.semester,
            "pdf_url": r.pdf_url, "created_at": str(r.created_at),
            "student_id": r.student_id,
            "student_name": u.name, "roll_number": u.roll_number or "N/A"
        }
        for r, u in results
    ]
