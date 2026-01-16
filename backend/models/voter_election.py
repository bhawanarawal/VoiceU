from sqlmodel import SQLModel, Field
from typing import Optional
from sqlalchemy import UniqueConstraint


class VoterElection(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    voter_id: int = Field(foreign_key="voter.voter_id")
    election_id: int = Field(foreign_key="election.election_id")
    position_id: Optional[int] = Field(foreign_key="position.position_id")
    has_voted: bool = Field(default=False)

    __table_args__ = (UniqueConstraint("voter_id", "election_id", "position_id"),)
