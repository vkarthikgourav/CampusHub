from pydantic import BaseModel

class FeeUpdate(BaseModel):
    student_id: int
    status: str


class FeeResponse(BaseModel):
    id: int
    status: str
    student_id: int

    class Config:
        from_attributes=True