from pydantic import BaseModel
from typing import Optional


class OrganizationCreate(BaseModel):
    name: str
    address: Optional[str] = None
    description: Optional[str] = None
    affiliation_id: Optional[int] = None


class OrganizationRead(BaseModel):
    org_id: int
    name: str
    address: Optional[str] = None
    description: Optional[str] = None
    affiliation_id: Optional[int] = None
    affiliation_name: Optional[str] = None

    model_config = {"from_attributes": True}
