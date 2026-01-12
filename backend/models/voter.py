from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
from models.user import User
from models.group import Group

from models.organization import Organization
from models.voter_group import VoterGroup


class Voter(SQLModel, table=True):
    voter_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.user_id", unique=True)
    org_id: int = Field(foreign_key="organization.org_id")
    group_id: int = Field(foreign_key="group.group_id")
    semester_id: int = Field(foreign_key="semester.semester_id")
    registered_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: Optional[User] = Relationship()
    organization: Optional[Organization] = Relationship()
    group: Optional[Group] = Relationship()
    groups: List["VoterGroup"] = Relationship(back_populates="voter")
