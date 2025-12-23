from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import datetime, timezone, timedelta

NPT = timezone(timedelta(hours=5, minutes=45))


class VoterCreate(BaseModel):
    user_id: int
    org_id: int
    affiliation_id: int
    affiliation_level: Optional[str] = None


class VoterUpdate(BaseModel):
    affiliation_id: Optional[int] = None
    affiliation_level: Optional[str] = None


class VoterRead(BaseModel):
    voter_id: int
    user_id: int
    username: str
    full_name: str
    org_id: int
    org_name: str
    affiliation_id: int
    affiliation_name: str
    affiliation_level: Optional[str]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_serializer("created_at", "updated_at")
    def format_date(self, dt: datetime, _info):
        return dt.astimezone(NPT).strftime("%Y-%m-%d %H:%M:%S")
