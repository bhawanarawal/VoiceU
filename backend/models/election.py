from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone
from enum import Enum

if TYPE_CHECKING:
    from models.election_position import ElectionPosition
    from models.program import Program


def utc_now():
    return datetime.now(timezone.utc)


class ElectionStatus(str, Enum):
    UPCOMING = "upcoming"
    ONGOING = "ongoing"
    PAST = "past"


class Election(SQLModel, table=True):
    election_id: Optional[int] = Field(default=None, primary_key=True)
    program_id: int = Field(foreign_key="program.program_id", nullable=False)
    election_name: str = Field(nullable=False)
    start_date: datetime = Field(nullable=False)
    end_date: datetime = Field(nullable=False)
    status: ElectionStatus = Field(default=ElectionStatus.UPCOMING)
    description: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

    program: Optional["Program"] = Relationship(back_populates="elections")
    election_positions: List["ElectionPosition"] = Relationship(
        back_populates="election"
    )
