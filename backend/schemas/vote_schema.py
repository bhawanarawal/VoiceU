from pydantic import BaseModel, field_serializer
from datetime import datetime, timezone, timedelta


NPT = timezone(timedelta(hours=5, minutes=45))


class VoteCreate(BaseModel):
    candidate_id: int
    election_id: int


class VoteRead(BaseModel):
    vote_id: int
    voter_id: int
    candidate_id: int
    election_id: int
    position_id: int
    created_at: datetime

    model_config = {"from_attributes": True}

    @field_serializer("created_at")
    def format_created_at(self, dt: datetime, _info):
        return dt.astimezone(NPT).strftime("%Y-%m-%d %H:%M:%S")
