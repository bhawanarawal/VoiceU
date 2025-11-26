from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timezone, timedelta
from pydantic import field_serializer

NPT = timezone(timedelta(hours=5, minutes=45))


class VoteCreate(BaseModel):
    voter_id: int
    candidate_id: int
    election_id: int  


class VoteRead(BaseModel):
    vote_id: int
    voter_id: int
    candidate_id: int
    election_id: int
    vote_time: datetime

    model_config = {"from_attributes": True}

    @field_serializer("vote_time")
    def format_vote_time(self, dt: datetime, _info):
        return dt.astimezone(NPT).strftime("%Y-%m-%d %H:%M:%S")
