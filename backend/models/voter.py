from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone


class Voter(SQLModel, table=True):
    voter_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int #= Field(foreign_key="user.user_id")
    org_id: int = Field(foreign_key="organization.org_id")
    affiliation_id: int = Field(foreign_key="affiliation.affiliation_id")
    affiliation_level: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
