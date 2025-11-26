from sqlmodel import SQLModel, Field
from typing import Optional

class Organization(SQLModel, table=True):
    org_id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    address: Optional[str] = None
    description: Optional[str] = None
