from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
from typing import List

from database import get_session
from auth import get_current_active_user

from models.election import Election
from models.program import Program
from models.organization import Organization
from models.affiliation import Affiliation
from models.user import User

from schemas.election_schema import (
    ElectionCreate,
    ElectionRead,
    ElectionListItem,
    ElectionDetail,
    ElectionStatus,
)

router = APIRouter(prefix="/elections", tags=["Elections"])


# ============================
# CREATE ELECTION
# ============================
@router.post("/", response_model=ElectionRead)
def create_election(
    data: ElectionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    program = session.get(Program, data.program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    election = Election(
        user_id=current_user.user_id,
        program_id=data.program_id,
        election_name=data.election_name,
        start_date=data.start_date,
        end_date=data.end_date,
        status=data.status.value,
        description=data.description,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    try:
        session.add(election)
        session.commit()
        session.refresh(election)
        return election
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=400, detail="Failed to create election")


# ============================
# GET ALL ELECTIONS (LIST)
# ============================
@router.get("/", response_model=List[ElectionListItem])
def get_all_elections(session: Session = Depends(get_session)):
    query = (
        select(
            Election.election_id,
            Election.election_name,
            Election.start_date,
            Election.end_date,
            Election.status,
            Election.description,
            Election.created_at,
            Election.updated_at,
            Program.program_name,
            Organization.name.label("organization_name"),
            Affiliation.affiliation_name,
        )
        .join(Program, Program.program_id == Election.program_id)
        .join(Organization, Organization.org_id == Program.org_id)
        .join(Affiliation, Affiliation.affiliation_id == Organization.affiliation_id)
    )

    results = session.exec(query).all()

    return [
        ElectionListItem(
            election_id=r.election_id,
            election_name=r.election_name,
            start_date=r.start_date,
            end_date=r.end_date,
            status=r.status,
            description=r.description,
            program_name=r.program_name,
            organization_name=r.organization_name,
            affiliation_name=r.affiliation_name,
            created_at=r.created_at,
            updated_at=r.updated_at,
        )
        for r in results
    ]


# ============================
# GET SINGLE ELECTION (EDIT FORM)
# ============================
@router.get("/{election_id}", response_model=ElectionDetail)
def get_election(election_id: int, session: Session = Depends(get_session)):
    query = (
        select(
            Election.election_id,
            Election.election_name,
            Election.program_id,
            Organization.org_id.label("organization_id"),
            Organization.name.label("organization_name"),
            Affiliation.affiliation_name,
            Election.start_date,
            Election.end_date,
            Election.status,
            Election.description,
        )
        .join(Program, Program.program_id == Election.program_id)
        .join(Organization, Organization.org_id == Program.org_id)
        .join(Affiliation, Affiliation.affiliation_id == Organization.affiliation_id)
        .where(Election.election_id == election_id)
    )

    result = session.exec(query).first()

    if not result:
        raise HTTPException(status_code=404, detail="Election not found")

    return result


# ============================
# UPDATE ELECTION
# ============================
@router.put("/{election_id}", response_model=ElectionRead)
def update_election(
    election_id: int,
    data: ElectionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    election = session.get(Election, election_id)
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")

    if election.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not allowed")

    program = session.get(Program, data.program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    election.program_id = data.program_id
    election.election_name = data.election_name
    election.start_date = data.start_date
    election.end_date = data.end_date
    election.status = data.status.value
    election.description = data.description
    election.updated_at = datetime.now(timezone.utc)

    session.add(election)
    session.commit()
    session.refresh(election)
    return election


# ============================
# DELETE ELECTION
# ============================
@router.delete("/{election_id}")
def delete_election(
    election_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    election = session.get(Election, election_id)
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")

    if election.user_id != current_user.user_id:
        raise HTTPException(status_code=403, detail="Not allowed")

    session.delete(election)
    session.commit()
    return {"message": "Election deleted successfully"}
