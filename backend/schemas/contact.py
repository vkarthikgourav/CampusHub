from pydantic import BaseModel

class ContactCreate(BaseModel):
    name: str 
    role: str
    department: str 
    email: str | None = None
    phone: str | None = None


class ContactResponse(BaseModel):
    id: int
    name: str 
    role: str
    department: str 
    email: str | None = None
    phone: str | None = None

    class Config: 
        from_attributes=True