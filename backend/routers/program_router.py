# backend/routers/program_router.py
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from database import get_session
from models.program import Program
from models.semester import Semester
from schemas.program_schema import ProgramCreate, ProgramRead, ProgramWithSemesters

router = APIRouter(prefix="/programs", tags=["Programs"])


@router.post("/", response_model=ProgramRead)
def create_program(data: ProgramCreate, session: Session = Depends(get_session)):
    program = Program(
        program_name=data.program_name,
        affiliation_id=data.affiliation_id,
        total_semesters=data.total_semesters,
    )

    session.add(program)
    session.commit()
    session.refresh(program)

    for i in range(1, data.total_semesters + 1):
        semester = Semester(program_id=program.program_id, semester_number=i)
        session.add(semester)
    session.commit()

    return program


@router.get("/", response_model=List[ProgramRead])
def read_programs(session: Session = Depends(get_session)):
    return session.exec(select(Program).where(Program.is_active == True)).all()


@router.get("/{program_id}", response_model=ProgramWithSemesters)
def get_program(program_id: int, session: Session = Depends(get_session)):
    program = session.get(Program, program_id)
    if not program or not program.is_active:
        raise HTTPException(status_code=404, detail="Program not found")

    semesters = session.exec(
        select(Semester.semester_number).where(Semester.program_id == program_id)
    ).all()

    return ProgramWithSemesters(
        program_id=program.program_id,
        program_name=program.program_name,
        total_semesters=program.total_semesters,
        semesters=semesters,
    )


@router.put("/{program_id}", response_model=ProgramRead)
def update_program(
    program_id: int, data: ProgramCreate, session: Session = Depends(get_session)
):
    program = session.get(Program, program_id)
    if not program or not program.is_active:
        raise HTTPException(status_code=404, detail="Program not found")

    program.program_name = data.program_name
    program.affiliation_id = data.affiliation_id
    program.total_semesters = data.total_semesters

    session.add(program)
    session.commit()
    session.refresh(program)
    return program


@router.delete("/{program_id}")
def delete_program(program_id: int, session: Session = Depends(get_session)):
    program = session.get(Program, program_id)
    if not program or not program.is_active:
        raise HTTPException(status_code=404, detail="Program not found")

    program.is_active = False
    session.add(program)
    session.commit()
    return {"message": "Program deactivated successfully"}
