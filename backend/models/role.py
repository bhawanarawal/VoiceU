from typing import List, Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

from models.user_role_link import UserRoleLink  

if TYPE_CHECKING:
    from models.user import User


class Role(SQLModel, table=True):
    role_id: Optional[int] = Field(default=None, primary_key=True)
    name: str

    users: List["User"] = Relationship(
        back_populates="roles",
        link_model=UserRoleLink
    )
