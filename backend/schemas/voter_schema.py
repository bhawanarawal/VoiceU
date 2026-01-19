from pydantic import BaseModel, field_serializer
from typing import Optional, List
from datetime import datetime, timezone, timedelta

NPT = timezone(timedelta(hours=5, minutes=45))


class VoterCreate(BaseModel):
    org_id: int
    group_ids: List[int]


class GroupMembershipRead(BaseModel):
    voter_group_id: int
    group_id: int
    group_name: str
    status: str
    joined_at: Optional[datetime]

    model_config = {"from_attributes": True}

    @field_serializer("joined_at")
    def format_joined_at(self, value: Optional[datetime]):
        if value is None:
            return None
        return value.astimezone(NPT).isoformat()


class VoterRead(BaseModel):
    voter_id: int
    user_id: int
    username: str
    full_name: str
    org_id: int
    org_name: str
    group_id: int
    group_name: str
    group_status: str
    registered_at: Optional[datetime]
    groups: List[GroupMembershipRead] = []
    is_voter: Optional[bool] = None

    model_config = {"from_attributes": True}

    @field_serializer("registered_at")
    def format_registered_at(self, value: Optional[datetime]):
        if value is None:
            return None
        return value.astimezone(NPT).isoformat()
