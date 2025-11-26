from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
from pydantic import field_serializer

NPT = timezone(timedelta(hours=5, minutes=45))


class VoterCreate(BaseModel):
    user_id: int
    org_id: int
    affiliation_id: int
    affiliation_level: str


class VoterRead(BaseModel):
    voter_id: int
    user_id: int
    org_id: int
    affiliation_id: int
    affiliation_level: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_serializer("created_at", "updated_at")
    def format_date(self, dt: datetime, _info):
        return dt.astimezone(NPT).strftime("%Y-%m-%d %H:%M:%S")
