from pydantic import BaseModel
from typing import Optional

class OrganizationCreate(BaseModel):
    name: str
    address: Optional[str] = None
    description: Optional[str] = None

class OrganizationRead(BaseModel):
    id: int
    name: str
    address: Optional[str] = None
    description: Optional[str] = None

    model_config = {
        "from_attributes": True
    }
