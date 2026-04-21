from pydantic import BaseModel

class ClassCreate(BaseModel):
    name: str
    department: str
    semester: int


class ClassResponse(BaseModel):
    id: int
    name: str
    department: str
    semester: int

    class Config:
        from_attributes = True