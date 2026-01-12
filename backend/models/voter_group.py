from typing import Optional
from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from models.voter import Voter
from models.group import Group


class VoterGroup(SQLModel, table=True):
    voter_group_id: Optional[int] = Field(default=None, primary_key=True)
    voter_id: int = Field(foreign_key="voter.voter_id", index=True)
    group_id: int = Field(foreign_key="group.group_id", index=True)
    status: str = Field(default="PENDING")
    joined_at: datetime = Field(default_factory=datetime.now)

    voter: Optional["Voter"] = Relationship(back_populates="groups")
    group: Optional["Group"] = Relationship(back_populates="voters")
