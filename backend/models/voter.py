from typing import Optional
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime, timezone
from models.user import User
from models.program import Program
from models.semester import Semester
from models.organization import Organization


class Voter(SQLModel, table=True):
    voter_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.user_id", unique=True)
    org_id: int = Field(foreign_key="organization.org_id")
    program_id: int = Field(foreign_key="program.program_id")
    semester_id: int = Field(foreign_key="semester.semester_id")
    affiliation_id: int
    registered_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    user: Optional[User] = Relationship()
    organization: Optional[Organization] = Relationship()
    program: Optional[Program] = Relationship()
    semester: Optional[Semester] = Relationship()
