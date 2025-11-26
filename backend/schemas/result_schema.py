from pydantic import BaseModel
from datetime import datetime, timezone, timedelta
from pydantic import field_serializer

NPT = timezone(timedelta(hours=5, minutes=45))


class ResultRead(BaseModel):
    result_id: int
    candidate_id: int
    total_votes: int
    winner_flag: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}

    @field_serializer("created_at", "updated_at")
    def format_datetime(self, dt: datetime, _info):
        return dt.astimezone(NPT).strftime("%Y-%m-%d %H:%M:%S")
