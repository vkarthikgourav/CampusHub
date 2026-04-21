from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from database import Base


class Timetable(Base):
    __tablename__ = "timetable"

    id = Column(Integer, primary_key=True, index=True)
    subject = Column(String, nullable=False)
    day = Column(String, nullable=False)
    time_slot = Column(String, nullable=False)
    teacher_name = Column(String, nullable=False)
    room = Column(String, nullable=True)

    class_id = Column(Integer, ForeignKey("academic_classes.id"))
    professor_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    academic_class = relationship("AcademicClass", back_populates="timetable_entries")
    professor = relationship("User")