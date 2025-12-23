from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from database import get_session
from models.semester import Semester
from schemas.semester_schema import SemesterCreate, SemesterRead

router = APIRouter(prefix="/semesters", tags=["Semesters"])


@router.post("/", response_model=SemesterRead)
def create_semester(data: SemesterCreate, session: Session = Depends(get_session)):
    semester = Semester(
        program_id=data.program_id, semester_number=data.semester_number
    )
    session.add(semester)
    session.commit()
    session.refresh(semester)
    return semester


@router.get("/", response_model=List[SemesterRead])
def read_semesters(session: Session = Depends(get_session)):
    return session.exec(select(Semester)).all()


@router.get("/program/{program_id}", response_model=List[SemesterRead])
def read_semesters_by_program(program_id: int, session: Session = Depends(get_session)):
    return session.exec(select(Semester).where(Semester.program_id == program_id)).all()


@router.put("/{semester_id}", response_model=SemesterRead)
def update_semester(
    semester_id: int, data: SemesterCreate, session: Session = Depends(get_session)
):
    semester = session.get(Semester, semester_id)
    if not semester:
        raise HTTPException(status_code=404, detail="Semester not found")
    semester.program_id = data.program_id
    semester.semester_number = data.semester_number
    session.add(semester)
    session.commit()
    session.refresh(semester)
    return semester


@router.delete("/{semester_id}")
def delete_semester(semester_id: int, session: Session = Depends(get_session)):
    semester = session.get(Semester, semester_id)
    if not semester:
        raise HTTPException(status_code=404, detail="Semester not found")
    session.delete(semester)
    session.commit()
    return {"message": "Semester deleted successfully"}
