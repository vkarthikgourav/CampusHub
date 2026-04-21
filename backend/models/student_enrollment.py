from sqlalchemy import Column, Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from database import Base


class StudentEnrollment(Base):
    __tablename__ = "student_enrollments"

    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    class_id = Column(Integer, ForeignKey("academic_classes.id"), nullable=False)

    student = relationship("User", back_populates="enrollments")
    academic_class = relationship("AcademicClass", back_populates="enrollments")

    __table_args__ = (
        UniqueConstraint("student_id", "class_id", name="uq_student_class"),
    )
