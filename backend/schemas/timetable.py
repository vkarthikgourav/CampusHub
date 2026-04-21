from pydantic import BaseModel


class TimetableCreate(BaseModel):
    subject: str
    day: str
    time_slot: str
    teacher_name: str
    class_id: int
    professor_id: int | None = None
    room: str | None = None


class TimetableUpdate(BaseModel):
    subject: str | None = None
    day: str | None = None
    time_slot: str | None = None
    teacher_name: str | None = None
    class_id: int | None = None
    professor_id: int | None = None
    room: str | None = None


class ClassMini(BaseModel):
    id: int
    name: str
    department: str
    semester: int

    class Config:
        from_attributes = True


class TimetableResponse(BaseModel):
    id: int
    subject: str
    day: str
    time_slot: str
    teacher_name: str
    class_id: int | None = None
    professor_id: int | None = None
    room: str | None = None
    academic_class: ClassMini | None = None

    class Config:
        from_attributes = True