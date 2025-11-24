from pydantic import BaseModel, model_validator, field_serializer
from datetime import datetime, timezone, timedelta
from typing import Optional

NPT = timezone(timedelta(hours=5, minutes=45))

class ElectionCreate(BaseModel):
    user_id: int
    affiliation_id: int
    election_name: str
    start_date: datetime
    end_date: datetime
    status: str
    description: Optional[str] = None

    @model_validator(mode="before")
    def check_dates(cls, values):
        start = values.get("start_date")
        end = values.get("end_date")
        if start and end and end <= start:
            raise ValueError("end_date must be after start_date")
        return values


class ElectionRead(BaseModel):
    election_id: int
    user_id: int
    affiliation_id: int
    election_name: str
    start_date: datetime
    end_date: datetime
    status: str
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
    @field_serializer("start_date", "end_date", "created_at","updated_at")
    def format_date(self, dt: datetime, _info):
        return dt.astimezone(NPT).strftime("%Y-%m-%d %H:%M:%S")