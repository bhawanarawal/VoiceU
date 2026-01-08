from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone
from sqlalchemy import UniqueConstraint


def utc_now():
    return datetime.now(timezone.utc)


class Vote(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("voter_id", "election_id", "position_id"),)

    vote_id: Optional[int] = Field(default=None, primary_key=True)
    voter_id: int = Field(foreign_key="voter.voter_id")
    candidate_id: int = Field(foreign_key="candidate.candidate_id")
    election_id: int = Field(foreign_key="election.election_id")
    position_id: int = Field(foreign_key="position.position_id")
    created_at: datetime = Field(default_factory=utc_now)
