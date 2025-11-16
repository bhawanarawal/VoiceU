from typing import Optional

from sqlmodel import Field, SQLModel

class Position(SQLModel, table=True):
    position_id: Optional[int] = Field(default=None, primary_key=True)
    position_name: str = Field(index=True)
    description: Optional[str] = Field(default=None)
    max_candidates: Optional[int] = Field(default=None)
