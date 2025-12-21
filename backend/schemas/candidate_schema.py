from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import datetime, timezone, timedelta
from enum import Enum

NPT = timezone(timedelta(hours=5, minutes=45))


class ApprovalStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class CandidateCreate(BaseModel):
    user_id: int
    election_id: int
    position_id: int
    manifesto: Optional[str] = None


class CandidateUpdate(BaseModel):
    position_id: Optional[int] = None
    manifesto: Optional[str] = None


class CandidateApprovalUpdate(BaseModel):
    approval_status: ApprovalStatus


class CandidateRead(BaseModel):
    candidate_id: int
    user_id: int
    username: Optional[str] = None
    election_id: int
    election_name: Optional[str] = None
    position_id: int
    position_name: Optional[str] = None
    organization_name: Optional[str] = None
    affiliation_name: Optional[str] = None
    approval_status: ApprovalStatus
    manifesto: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_serializer("created_at", "updated_at")
    def format_datetime(self, dt: datetime, _info):
        return dt.astimezone(NPT).strftime("%Y-%m-%d %H:%M:%S")


class CandidateListRead(BaseModel):
    candidate_id: int

    user_id: int
    username: str

    election_id: int
    election_name: str

    position_id: int
    position_name: str

    org_id: int
    name: str

    affiliation_id: int
    affiliation_name: str

    approval_status: ApprovalStatus
    manifesto: Optional[str] = None
    photo_url: Optional[str] = None

    model_config = {"from_attributes": True}
