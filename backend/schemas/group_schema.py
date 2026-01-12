from pydantic import BaseModel
from typing import Optional


class GroupCreate(BaseModel):
    group_name: str
    org_id: int
    description: Optional[str] = None


class GroupUpdate(BaseModel):
    group_name: Optional[str] = None
    org_id: Optional[int] = None
    description: Optional[str] = None
    is_active: Optional[bool] = None


class GroupRead(BaseModel):
    group_id: int
    group_name: str
    org_id: int
    description: Optional[str] = None
    is_active: bool

    model_config = {"from_attributes": True}


class GroupReadWithOrganization(BaseModel):
    group_id: int
    group_name: str
    org_id: int
    description: Optional[str] = None
    is_active: bool
    organization_name: Optional[str] = None

    model_config = {"from_attributes": True}
