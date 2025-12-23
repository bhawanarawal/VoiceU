from pydantic import BaseModel


class SemesterRead(BaseModel):
    semester_id: int
    program_id: int
    semester_number: int


class SemesterCreate(BaseModel):
    program_id: int
    semester_number: int

    model_config = {"from_attributes": True}
