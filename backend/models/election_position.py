from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from models.election import Election
    from models.position import Position


class ElectionPosition(SQLModel, table=True):
    election_position_id: Optional[int] = Field(default=None, primary_key=True)
    election_id: int = Field(foreign_key="election.election_id", nullable=False)
    position_id: int = Field(foreign_key="position.position_id", nullable=False)

    election: "Election" = Relationship(back_populates="election_positions")
    position: "Position" = Relationship(back_populates="election_positions")
