from typing import Optional, TYPE_CHECKING, List
from sqlmodel import SQLModel, Field, Relationship


if TYPE_CHECKING:
    from backend.models.group import Group


class Organization(SQLModel, table=True):
    org_id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True)
    address: Optional[str] = None
    description: Optional[str] = None

    groups: list["Group"] = Relationship(back_populates="organization")
