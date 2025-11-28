from typing import Optional, List
from pydantic import BaseModel

class UserCreate(BaseModel):
    email: str
    full_name: str
    password: str

class UserRead(BaseModel):
    user_id: int
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None
    roles: List[str] = []
