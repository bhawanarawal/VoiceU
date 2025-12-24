from pydantic import BaseModel
from typing import List, Optional
from schemas.organization_schema import OrganizationRead
from schemas.program_schema import ProgramRead


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
    programs: List[ProgramRead]
    organizations: List[OrganizationRead]

    model_config = {"from_attributes": True}
