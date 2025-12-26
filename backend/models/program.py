from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from models.semester import Semester
    from models.organization import Organization
    from models.election import Election


class Program(SQLModel, table=True):
    program_id: Optional[int] = Field(default=None, primary_key=True)
    program_name: str = Field(index=True)
    org_id: int = Field(foreign_key="organization.org_id", index=True)
    total_semesters: int = Field(gt=0)
    is_active: bool = Field(default=True)

    semesters: List["Semester"] = Relationship(back_populates="program")
    organization: Optional["Organization"] = Relationship(back_populates="programs")
    elections: List["Election"] = Relationship(back_populates="program")
