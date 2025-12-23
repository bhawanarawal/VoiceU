from pydantic import BaseModel
from typing import Optional, List


class ProgramCreate(BaseModel):
    program_name: str
    affiliation_id: int
    total_semesters: int


class ProgramRead(BaseModel):
    program_id: int
    program_name: str
    affiliation_id: int
    affiliation_name: Optional[str] = None
    total_semesters: int
    is_active: bool

    model_config = {"from_attributes": True}


class ProgramWithSemesters(BaseModel):
    program_id: int
    program_name: str
    total_semesters: int
    affiliation_name: Optional[str] = None
    semesters: List[int]
    is_active: bool

    model_config = {"from_attributes": True}
