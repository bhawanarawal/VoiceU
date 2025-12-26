from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from database import get_session
from models.program import Program
from models.organization import Organization
from schemas.program_schema import (
    ProgramCreate,
    ProgramRead,
    ProgramUpdate,
    ProgramReadWithOrganization,
)
from services.semester_service import sync_semesters

router = APIRouter(prefix="/programs", tags=["Programs"])


@router.post("/", response_model=ProgramRead)
def create_program(program: ProgramCreate, session: Session = Depends(get_session)):
    org = session.get(Organization, program.org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    existing = session.exec(
        select(Program).where(
            Program.org_id == program.org_id,
            Program.program_name == program.program_name,
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"Program '{program.program_name}' already exists for this organization",
        )

    db_program = Program(
        program_name=program.program_name,
        total_semesters=program.total_semesters,
        org_id=program.org_id,
    )
    session.add(db_program)
    session.flush()

    sync_semesters(session, db_program.program_id, db_program.total_semesters)

    session.commit()
    session.refresh(db_program)
    return db_program


# Corrected GET endpoint: supports optional org_id filter
@router.get("/", response_model=List[ProgramRead])
def read_programs(
    org_id: Optional[int] = Query(None, description="Filter programs by organization"),
    session: Session = Depends(get_session),
):
    query = select(Program)
    if org_id:
        query = query.where(Program.org_id == org_id)
    return session.exec(query).all()


@router.get("/{program_id}", response_model=ProgramReadWithOrganization)
def get_program(program_id: int, session: Session = Depends(get_session)):
    program = session.get(Program, program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    org_name = program.organization.name if program.organization else None
    return ProgramReadWithOrganization(
        program_id=program.program_id,
        program_name=program.program_name,
        total_semesters=program.total_semesters,
        is_active=program.is_active,
        org_id=program.org_id,
        organization_name=org_name,
    )


@router.put("/{program_id}", response_model=ProgramRead)
def update_program(
    program_id: int,
    updated_program: ProgramUpdate,
    session: Session = Depends(get_session),
):
    program = session.get(Program, program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    if updated_program.program_name is not None:
        existing = session.exec(
            select(Program).where(
                Program.org_id == (updated_program.org_id or program.org_id),
                Program.program_name == updated_program.program_name,
                Program.program_id != program_id,
            )
        ).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"Program '{updated_program.program_name}' already exists for this organization",
            )
        program.program_name = updated_program.program_name

    if updated_program.total_semesters is not None:
        program.total_semesters = updated_program.total_semesters

    if updated_program.is_active is not None:
        program.is_active = updated_program.is_active

    if updated_program.org_id is not None:
        org = session.get(Organization, updated_program.org_id)
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
        program.org_id = updated_program.org_id

    session.add(program)
    session.flush()

    if updated_program.total_semesters is not None:
        sync_semesters(session, program.program_id, program.total_semesters)

    session.commit()
    session.refresh(program)
    return program


@router.delete("/{program_id}")
def delete_program(program_id: int, session: Session = Depends(get_session)):
    program = session.get(Program, program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    session.delete(program)
    session.commit()
    return {"message": "Program deleted successfully"}
