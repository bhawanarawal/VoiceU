from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone
from enum import Enum
from sqlalchemy import UniqueConstraint


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Candidate(SQLModel, table=True):
    __table_args__ = (
        UniqueConstraint(
            "voter_id",
            "election_id",
            "position_id",
            name="uq_candidate_once_per_position",
        ),
    )

    candidate_id: Optional[int] = Field(default=None, primary_key=True)

    voter_id: int = Field(foreign_key="voter.voter_id", index=True)
    election_id: int = Field(foreign_key="election.election_id", index=True)
    position_id: int = Field(foreign_key="position.position_id", index=True)

    manifesto: Optional[str] = Field(default=None)
    photo_url: Optional[str] = Field(default=None)

    approval_status: ApprovalStatus = Field(default=ApprovalStatus.PENDING)
    is_active: bool = Field(default=True)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
