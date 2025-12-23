from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from models.affiliation import Affiliation
    from models.semester import Semester


class Program(SQLModel, table=True):
    program_id: Optional[int] = Field(default=None, primary_key=True)
    program_name: str = Field(index=True)
    affiliation_id: int = Field(foreign_key="affiliation.affiliation_id", index=True)
    org_id: int = Field(foreign_key="organization.org_id", index=True)
    total_semesters: int = Field(gt=0)
    is_active: bool = Field(default=True)

    affiliation: Optional["Affiliation"] = Relationship(back_populates="programs")
    semesters: List["Semester"] = Relationship(back_populates="program")
