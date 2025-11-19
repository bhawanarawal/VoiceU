from pydantic import BaseModel, field_serializer
from datetime import datetime, timezone, timedelta
from typing import Optional

NPT = timezone(timedelta(hours=5, minutes=45))

class ElectionCreate(BaseModel):
    org_id: int
    election_name: str
    start_date: datetime
    end_date: datetime
    status: str
    description: Optional[str] = None
    type: Optional[str] = None

class ElectionRead(BaseModel):
    id: int
    org_id: int
    election_name: str
    start_date: datetime
    end_date: datetime
    status: str
    description: Optional[str] = None
    type: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {
        "from_attributes": True
    }
    @field_serializer("start_date", "end_date", "created_at","updated_at")
    def format_date(self, dt: datetime, _info):
        return dt.astimezone(NPT).strftime("%Y-%m-%d %H:%M:%S")