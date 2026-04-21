from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from database import Base


class AcademicClass(Base):
    __tablename__ = "academic_classes"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    department = Column(String, nullable=False)
    semester = Column(Integer, nullable=False)

    enrollments = relationship("StudentEnrollment", back_populates="academic_class")
    timetable_entries = relationship("Timetable", back_populates="academic_class")