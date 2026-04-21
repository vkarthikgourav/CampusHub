from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Fee(Base):
    __tablename__="fees"

    id=Column(Integer,primary_key=True,index=True)
    status=Column(String, default="pending")

    student_id=Column(Integer,ForeignKey("users.id"))
    student=relationship("User")