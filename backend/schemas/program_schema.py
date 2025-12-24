from pydantic import BaseModel
from typing import Optional, List


class ProgramCreate(BaseModel):
    program_name: str
    total_semesters: int
    org_id: int


class ProgramUpdate(BaseModel):
    program_name: Optional[str] = None
    total_semesters: Optional[int] = None
    is_active: Optional[bool] = None
    org_id: Optional[int] = None


class ProgramRead(BaseModel):
    program_id: int
    program_name: str
    total_semesters: int
    is_active: bool
    org_id: int

    model_config = {"from_attributes": True}


class ProgramReadWithOrganization(BaseModel):
    program_id: int
    program_name: str
    total_semesters: int
    is_active: bool

    org_id: int
    organization_name: Optional[str] = None

    model_config = {"from_attributes": True}
