from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from models.election_position import ElectionPosition


class Position(SQLModel, table=True):
    position_id: Optional[int] = Field(default=None, primary_key=True)
    position_name: str = Field(nullable=False)
    description: Optional[str] = None
    max_candidates: Optional[int] = None

    election_positions: List["ElectionPosition"] = Relationship(
        back_populates="position"
    )
