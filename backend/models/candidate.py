from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone

class Candidate(SQLModel, table=True):
    candidate_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.user_id")
    election_id: int = Field(foreign_key="election.election_id")
    position_id: int = Field(foreign_key="position.position_id")
    approval_status: str
    manifesto: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
