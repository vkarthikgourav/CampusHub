from pydantic import BaseModel

class HostelApply(BaseModel):
    pass

class HostelResponse(BaseModel):
    id: int
    student_email: str 
    status: str 
    room_no: str | None 

    class Config: 
        from_attributes=True 

class RoomResponse(BaseModel):
    id: int
    room_no: str
    status: str

    class Config:
        from_attributes = True