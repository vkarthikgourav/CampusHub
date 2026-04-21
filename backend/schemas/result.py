from pydantic import BaseModel
from datetime import datetime

class ResultBase(BaseModel):
    title: str
    semester: str

class ResultCreate(ResultBase):
    student_id: int

class ResultResponse(ResultBase):
    id: int
    student_id: int
    pdf_url: str
    created_at: datetime

    class Config:
        from_attributes = True
