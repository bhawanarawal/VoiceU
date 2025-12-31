from pydantic import BaseModel, field_serializer
from typing import Optional
from datetime import datetime, timezone, timedelta

NPT = timezone(timedelta(hours=5, minutes=45))


class VoterCreate(BaseModel):
    user_id: int
    org_id: int
    program_id: int
    semester_id: int
    affiliation_id: int


class VoterUpdate(BaseModel):
    org_id: Optional[int] = None
    program_id: Optional[int] = None
    semester_id: Optional[int] = None


class VoterRead(BaseModel):
    voter_id: int
    user_id: int
    username: str
    full_name: str
    org_id: int
    org_name: str
    program_id: int
    program_name: str
    semester_id: int
    semester_number: int
    affiliation_id: Optional[int] = None
    affiliation_name: Optional[str] = None
    registered_at: Optional[datetime]

    model_config = {"from_attributes": True}

    @field_serializer("registered_at")
    def format_date(self, value: Optional[datetime]):
        if value is None:
            return None
        return value.astimezone().isoformat()
