from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone

def utc_now():
    return datetime.now(timezone.utc)

class Election(SQLModel, table=True):
    election_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int #= Field(foreign_key="user.user_id")
    affiliation_id: int = Field(foreign_key="affiliation.affiliation_id")
    election_name: str
    start_date: datetime
    end_date: datetime
    status: str
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
