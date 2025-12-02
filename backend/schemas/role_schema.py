
from pydantic import BaseModel
from typing import List

class RoleCreate(BaseModel):
    name: str

class RoleRead(BaseModel):
    role_id: int
    name: str

class AssignRole(BaseModel):
    user_id: int
    role_names: List[str]