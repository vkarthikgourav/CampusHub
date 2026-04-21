from pydantic import BaseModel

class ComplaintCreate(BaseModel):
    category: str
    subject: str
    description: str 


class ComplaintResponse(BaseModel):
    id: int 
    category: str
    subject: str
    description: str
    status: str 
    student_email: str
    created_at: getattr(__import__('datetime'), 'datetime')

    class Config:
        from_attributes = True