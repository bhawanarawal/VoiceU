from sqlmodel import SQLModel, Field
from typing import Optional

class UserRoleLink(SQLModel, table=True):
    user_id: Optional[int] = Field(
        default=None, foreign_key="user.user_id", primary_key=True
    )
    role_id: Optional[int] = Field(
        default=None, foreign_key="role.role_id", primary_key=True
    )
