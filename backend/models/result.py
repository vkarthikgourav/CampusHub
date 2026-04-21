from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime

class Result(Base):
    __tablename__ = "results"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    semester = Column(String, nullable=False)
    pdf_url = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    student = relationship("User")
