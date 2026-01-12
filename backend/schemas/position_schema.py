from typing import Optional
from pydantic import BaseModel


class PositionCreate(BaseModel):
    position_name: str
    description: Optional[str] = None
    max_candidates: Optional[int] = None


class PositionUpdate(BaseModel):
    position_name: Optional[str] = None
    description: Optional[str] = None
    max_candidates: Optional[int] = None


class PositionRead(BaseModel):
    position_id: int
    position_name: str
    description: Optional[str] = None
    max_candidates: Optional[int] = None

    model_config = {"from_attributes": True}
