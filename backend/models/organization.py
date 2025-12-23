from typing import Optional, TYPE_CHECKING, List
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from models.affiliation import Affiliation


class Organization(SQLModel, table=True):
    org_id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    address: Optional[str] = None
    description: Optional[str] = None
    affiliation_id: Optional[int] = Field(
        foreign_key="affiliation.affiliation_id", default=None
    )

    affiliation: Optional["Affiliation"] = Relationship(back_populates="organizations")
