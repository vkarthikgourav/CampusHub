from pydantic import BaseModel


class EnrollRequest(BaseModel):
    student_id: int
    class_id: int


class ClassMini(BaseModel):
    id: int
    name: str
    department: str
    semester: int

    class Config:
        from_attributes = True


class StudentMini(BaseModel):
    id: int
    name: str
    email: str
    roll_number: str | None = None

    class Config:
        from_attributes = True


class EnrollmentResponse(BaseModel):
    id: int
    student_id: int
    class_id: int
    academic_class: ClassMini

    class Config:
        from_attributes = True
