from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone
from enum import Enum


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Candidate(SQLModel, table=True):
    candidate_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.user_id", index=True)
    election_id: int = Field(foreign_key="election.election_id", index=True)
    position_id: int = Field(foreign_key="position.position_id", index=True)

    approval_status: ApprovalStatus = Field(default=ApprovalStatus.PENDING)

    manifesto: Optional[str] = Field(default=None)
    photo_url: Optional[str] = Field(default=None, max_length=255)

    is_active: bool = Field(default=True)

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
