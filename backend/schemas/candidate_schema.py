from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import datetime, timezone, timedelta
from enum import Enum

NPT = timezone(timedelta(hours=5, minutes=45))


class ApprovalStatus(str, Enum):
    pending = "pending"
    approved = "approved"
    rejected = "rejected"


class CandidateCreate(BaseModel):
    election_id: int
    position_id: int
    manifesto: Optional[str] = None


class CandidateBase(BaseModel):
    candidate_id: int
    voter_id: int
    election_id: int
    position_id: int
    manifesto: Optional[str]
    photo_url: Optional[str]
    approval_status: ApprovalStatus
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class CandidateApprovalUpdate(BaseModel):
    approval_status: ApprovalStatus


class CandidateRead(BaseModel):
    candidate_id: int

    voter_id: int
    username: str
    full_name: str

    election_id: int
    election_name: str

    position_id: int
    position_name: str

    program_name: str
    organization_name: str
    affiliation_name: str

    approval_status: ApprovalStatus
    manifesto: Optional[str]
    photo_url: Optional[str]

    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_serializer("created_at", "updated_at")
    def format_time(self, dt: datetime, _):
        return dt.astimezone(NPT).strftime("%Y-%m-%d %I:%M %p")
