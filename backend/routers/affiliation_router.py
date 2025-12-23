from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List
from models.affiliation import Affiliation
from models.program import Program
from models.semester import Semester
from models.organization import Organization

from schemas.affiliation_schema import (
    AffiliationCreate,
    AffiliationRead,
    AffiliationReadWithPrograms,
)
from schemas.program_schema import ProgramWithSemesters
from schemas.organization_schema import OrganizationRead

from database import get_session

router = APIRouter(prefix="/affiliations", tags=["Affiliations"])


@router.post("/", response_model=AffiliationRead)
def create_affiliation(
    aff: AffiliationCreate,
    session: Session = Depends(get_session),
):
    db_aff = Affiliation(
        affiliation_name=aff.affiliation_name,
        description=aff.description,
    )
    session.add(db_aff)
    session.commit()
    session.refresh(db_aff)
    return db_aff


@router.get("/", response_model=List[AffiliationRead])
def read_affiliations(session: Session = Depends(get_session)):
    return session.exec(select(Affiliation)).all()


@router.get("/{affiliation_id}", response_model=AffiliationRead)
def get_affiliation(
    affiliation_id: int,
    session: Session = Depends(get_session),
):
    aff = session.get(Affiliation, affiliation_id)
    if not aff:
        raise HTTPException(status_code=404, detail="Affiliation not found")
    return aff


@router.get(
    "/{affiliation_id}/with-details",
    response_model=AffiliationReadWithPrograms,
)
def get_affiliation_with_details(
    affiliation_id: int,
    session: Session = Depends(get_session),
):
    aff = session.get(Affiliation, affiliation_id)
    if not aff:
        raise HTTPException(status_code=404, detail="Affiliation not found")

    programs = session.exec(
        select(Program).where(Program.affiliation_id == affiliation_id)
    ).all()

    programs_with_semesters = []
    for program in programs:
        semesters = session.exec(
            select(Semester.semester_number).where(
                Semester.program_id == program.program_id
            )
        ).all()

        programs_with_semesters.append(
            ProgramWithSemesters(
                program_id=program.program_id,
                program_name=program.program_name,
                total_semesters=program.total_semesters,
                semesters=semesters,
                is_active=program.is_active,
            )
        )

    organizations = session.exec(
        select(Organization).where(Organization.affiliation_id == affiliation_id)
    ).all()

    orgs_read = [OrganizationRead.from_orm(org) for org in organizations]

    return AffiliationReadWithPrograms(
        affiliation_id=aff.affiliation_id,
        affiliation_name=aff.affiliation_name,
        description=aff.description,
        programs=programs_with_semesters,
        organizations=orgs_read,
    )


@router.put("/{affiliation_id}", response_model=AffiliationRead)
def update_affiliation(
    affiliation_id: int,
    updated_aff: AffiliationCreate,
    session: Session = Depends(get_session),
):
    aff = session.get(Affiliation, affiliation_id)
    if not aff:
        raise HTTPException(status_code=404, detail="Affiliation not found")

    aff.affiliation_name = updated_aff.affiliation_name
    aff.description = updated_aff.description

    session.commit()
    session.refresh(aff)
    return aff


@router.delete("/{affiliation_id}")
def delete_affiliation(
    affiliation_id: int,
    session: Session = Depends(get_session),
):
    aff = session.get(Affiliation, affiliation_id)
    if not aff:
        raise HTTPException(status_code=404, detail="Affiliation not found")

    session.delete(aff)
    session.commit()
    return {"message": "Affiliation deleted successfully"}
