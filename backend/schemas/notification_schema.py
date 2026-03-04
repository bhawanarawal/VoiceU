from datetime import datetime
from pydantic import BaseModel
from typing import Optional

class NotificationCreate(BaseModel):
    message:str
    category:str

class NotificationUpdate(BaseModel):
    message:Optional[str] =None
    category: Optional[str]= None
    is_read:Optional[bool]=None

class NotificationRead(BaseModel):
    notification_id:int
    message:str
    category:str
    is_read:bool
    created_at:datetime