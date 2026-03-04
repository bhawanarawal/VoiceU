from typing import Optional, TYPE_CHECKING, List
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

class Notification(SQLModel, table=True):
    __tablename__="notification_v2"
    notification_id:Optional[int]= Field(default=None, primary_key=True)
    message:str
    category:str
    is_read:bool=Field(default=False)
    created_at:datetime=Field(default_factory=datetime.now)

