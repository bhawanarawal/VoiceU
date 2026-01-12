from typing import Optional, List, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from models.organization import Organization
    from models.election import Election


class Group(SQLModel, table=True):
    group_id: Optional[int] = Field(default=None, primary_key=True)
    group_name: str = Field(index=True)
    org_id: int = Field(foreign_key="organization.org_id", index=True)
    description: Optional[str] = None
    is_active: bool = Field(default=True)

    organization: Optional["Organization"] = Relationship(back_populates="groups")
    elections: List["Election"] = Relationship(back_populates="group")
