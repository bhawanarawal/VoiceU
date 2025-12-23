from pydantic import BaseModel
from typing import List, Optional
from schemas.program_schema import ProgramWithSemesters
from schemas.organization_schema import OrganizationRead


class AffiliationCreate(BaseModel):
    affiliation_name: str
    description: Optional[str] = None


class AffiliationRead(BaseModel):
    affiliation_id: int
    affiliation_name: str
    description: Optional[str] = None

    model_config = {"from_attributes": True}


class AffiliationReadWithPrograms(BaseModel):
    affiliation_id: int
    affiliation_name: str
    description: Optional[str] = None
    programs: List[ProgramWithSemesters]
    organizations: List[OrganizationRead]
