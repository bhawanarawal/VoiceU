from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship


if TYPE_CHECKING:
    from models.organization import Organization
    from models.program import Program


class Affiliation(SQLModel, table=True):
    affiliation_id: Optional[int] = Field(default=None, primary_key=True)
    affiliation_name: str = Field(index=True)
    description: Optional[str] = Field(default=None)

    organizations: List["Organization"] = Relationship(back_populates="affiliation")
