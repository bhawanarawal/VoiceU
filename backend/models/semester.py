from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from models.program import Program


class Semester(SQLModel, table=True):
    semester_id: Optional[int] = Field(default=None, primary_key=True)
    program_id: int = Field(foreign_key="program.program_id", index=True)
    semester_number: int = Field(gt=0)

    program: Optional["Program"] = Relationship(back_populates="semesters")
