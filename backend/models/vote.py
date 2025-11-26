from sqlmodel import SQLModel, Field, UniqueConstraint
from typing import Optional
from datetime import datetime, timezone

def utc_now():
    return datetime.now(timezone.utc)


class Vote(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("voter_id", "election_id"),)  

    vote_id: Optional[int] = Field(default=None, primary_key=True)
    voter_id: int = Field(foreign_key="voter.voter_id")
    candidate_id: int = Field(foreign_key="candidate.candidate_id")
    election_id: int = Field(foreign_key="election.election_id")
    vote_time: datetime = Field(default_factory=utc_now)
