# from sqlalchemy import Column, Integer, String, ForeignKey
# from sqlalchemy.orm import relationship
# from database import Base 

# class Complaint(Base):
#     __tablename__="complaints"
    
#     id=Column(Integer, primary_key=True, index=True)
#     description=Column(String, nullable=False)
#     status=Column(String, default="submitted")

    
#     student_id=Column(Integer, ForeignKey("users.id"))
#     student=relationship("User")
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from database import Base
import datetime

class Complaint(Base):
    __tablename__ = "complaints"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String, default="General")
    subject = Column(String, default="No Subject")
    description = Column(String)
    status = Column(String, default="Submitted")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    student_email = Column(String)