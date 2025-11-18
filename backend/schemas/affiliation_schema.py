from pydantic import BaseModel
from typing import Optional

class AffiliationCreate(BaseModel):
    affiliation_name: str
    description: Optional[str] = None
    org_id: int

class AffiliationRead(BaseModel):
    affiliation_id: int
    affiliation_name: str
    description: Optional[str] = None
    org_id: int

    model_config = {
        "from_attributes": True 
    }
