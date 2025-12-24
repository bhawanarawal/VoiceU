from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List

from database import get_session
from models.semester import Semester
from models.program import Program
from schemas.semester_schema import SemesterRead

router = APIRouter(prefix="/semesters", tags=["Semesters"])


@router.get("/", response_model=List[SemesterRead])
def get_all_semesters(session: Session = Depends(get_session)):

    return session.exec(select(Semester)).all()


@router.get("/program/{program_id}", response_model=List[SemesterRead])
def get_semesters_by_program(program_id: int, session: Session = Depends(get_session)):

    program = session.get(Program, program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    return session.exec(select(Semester).where(Semester.program_id == program_id)).all()


@router.delete("/{semester_id}")
def delete_semester(semester_id: int, session: Session = Depends(get_session)):

    semester = session.get(Semester, semester_id)
    if not semester:
        raise HTTPException(status_code=404, detail="Semester not found")

    session.delete(semester)
    session.commit()
    return {"message": "Semester deleted successfully"}
