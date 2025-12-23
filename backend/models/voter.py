from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy import UniqueConstraint


class Voter(SQLModel, table=True):
    voter_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.user_id")
    org_id: int = Field(foreign_key="organization.org_id")
    affiliation_id: int = Field(foreign_key="affiliation.affiliation_id")
    affiliation_level: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    __table_args__ = (UniqueConstraint("user_id", "org_id"),)
