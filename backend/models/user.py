from typing import List, Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship

from models.user_role_link import UserRoleLink  

if TYPE_CHECKING:
    from models.role import Role


class User(SQLModel, table=True):
    user_id: Optional[int] = Field(default=None, primary_key=True)
    username: str
    email: str
    full_name: Optional[str] = None
    hashed_password: str
    is_active: bool = True

    roles: List["Role"] = Relationship(
        back_populates="users",
        link_model=UserRoleLink
    )
