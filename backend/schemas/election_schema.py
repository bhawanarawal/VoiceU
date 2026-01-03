from pydantic import BaseModel, model_validator
from datetime import datetime
from typing import Optional, List
from enum import Enum


class ElectionStatus(str, Enum):
    upcoming = "upcoming"
    ongoing = "ongoing"
    past = "past"


class ElectionCreate(BaseModel):
    program_id: int
    election_name: str
    start_date: datetime
    end_date: datetime
    status: ElectionStatus
    description: Optional[str] = None
    position_ids: Optional[List[int]] = []

    @model_validator(mode="before")
    def check_dates(cls, values):
        start = values.get("start_date")
        end = values.get("end_date")
        if start and end and end <= start:
            raise ValueError("end_date must be after start_date")

        return values


class ElectionRead(BaseModel):
    election_id: int
    program_id: int
    election_name: str
    start_date: datetime
    end_date: datetime
    status: ElectionStatus
    description: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ElectionListItem(BaseModel):
    election_id: int
    election_name: str
    start_date: datetime
    end_date: datetime
    status: ElectionStatus
    description: Optional[str] = None
    program_name: str
    organization_name: str
    affiliation_name: str
    positions: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class ElectionDetail(BaseModel):
    election_id: int
    election_name: str
    program_id: int
    organization_id: int
    organization_name: str
    affiliation_name: str
    start_date: datetime
    end_date: datetime
    status: ElectionStatus
    description: Optional[str] = None
    positions: Optional[List[dict]] = []

    model_config = {"from_attributes": True}
