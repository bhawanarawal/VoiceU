from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone

def utc_now():
    return datetime.now(timezone.utc)


class Result(SQLModel, table=True):
    result_id: Optional[int] = Field(default=None, primary_key=True)
    candidate_id: int = Field(foreign_key="candidate.candidate_id")
    total_votes: int = Field(default=0)
    winner_flag: bool = Field(default=False)
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
