from typing import Optional
from sqlmodel import SQLModel, Field

class Affiliation(SQLModel, table=True):
    affiliation_id: Optional[int] = Field(default=None, primary_key=True)
    affiliation_name: str = Field(index=True)
    description: Optional[str] = Field(default=None)
    org_id: int = Field(index=True, foreign_key="organization.org_id",nullable=False)
