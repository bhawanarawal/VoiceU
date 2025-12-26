from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime, timezone
from enum import Enum

if TYPE_CHECKING:
    from models.program import Program


def utc_now():
    return datetime.now(timezone.utc)


class ElectionStatus(str, Enum):
    UPCOMING = "upcoming"
    ONGOING = "ongoing"
    PAST = "past"


class Election(SQLModel, table=True):
    election_id: Optional[int] = Field(default=None, primary_key=True)

    program_id: int = Field(
        foreign_key="program.program_id", nullable=False, index=True
    )

    election_name: str = Field(nullable=False, index=True)
    start_date: datetime = Field(nullable=False)
    end_date: datetime = Field(nullable=False)
    status: ElectionStatus = Field(default=ElectionStatus.UPCOMING, nullable=False)
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=utc_now, nullable=False)
    updated_at: datetime = Field(default_factory=utc_now, nullable=False)

    program: Optional["Program"] = Relationship(back_populates="elections")
