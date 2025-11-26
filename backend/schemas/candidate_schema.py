from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
from pydantic import field_serializer, model_validator

NPT = timezone(timedelta(hours=5, minutes=45))

class CandidateCreate(BaseModel):
    user_id: int
    election_id: int
    position_id: int
    approval_status: str
    manifesto: Optional[str] = None
    photo_url: Optional[str] = None


class CandidateRead(BaseModel):
    candidate_id: int
    user_id: int
    election_id: int
    position_id: int
    approval_status: str
    manifesto: Optional[str] = None
    photo_url: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_serializer("created_at", "updated_at")
    def format_date(self, dt: datetime, _info):
        return dt.astimezone(NPT).strftime("%Y-%m-%d %H:%M:%S")
