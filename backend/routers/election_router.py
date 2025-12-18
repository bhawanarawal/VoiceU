from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
from typing import List

from models.election import Election
from schemas.election_schema import ElectionCreate, ElectionRead, ElectionListItem
from database import get_session
from auth import get_current_active_user
from models.user import User
from models.affiliation import Affiliation
from models.organization import Organization



router = APIRouter(prefix="/elections", tags=["Elections"])


@router.post("/", response_model=ElectionRead)
def create_election(
    data: ElectionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    election = Election(
        user_id=current_user.user_id,   
        affiliation_id=data.affiliation_id,
        election_name=data.election_name,
        start_date=data.start_date,
        end_date=data.end_date,
        status=data.status,
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
        raise HTTPException(
            status_code=400,
            detail="Invalid affiliation_id"
        )



@router.get("/", response_model=List[ElectionListItem])
def get_all_elections(session: Session = Depends(get_session)):

    # Join Election -> Affiliation -> Organization
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
            Affiliation.affiliation_name,
            Organization.name.label("organization_name")
        )
        .join(Affiliation, Affiliation.affiliation_id == Election.affiliation_id)
        .join(Organization, Organization.org_id == Affiliation.org_id)
    )

    results = session.exec(query).all()

    # Map results into ElectionListItem
    elections = [
        ElectionListItem(
            election_id=r.election_id,
            election_name=r.election_name,
            start_date=r.start_date,   # Keep as datetime
            end_date=r.end_date,       # Keep as datetime
            status=r.status,
            description=r.description,
            affiliation_name=r.affiliation_name,
            organization_name=r.organization_name,
            created_at=r.created_at,
            updated_at=r.updated_at
        )
        for r in results
    ]

    return elections

@router.get("/{election_id}", response_model=ElectionRead)
def get_election(election_id: int, session: Session = Depends(get_session)):
    election = session.get(Election, election_id)
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    return election


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

    election.affiliation_id = data.affiliation_id
    election.election_name = data.election_name
    election.start_date = data.start_date
    election.end_date = data.end_date
    election.status = data.status
    election.description = data.description
    election.updated_at = datetime.now(timezone.utc)

    session.add(election)
    session.commit()
    session.refresh(election)
    return election


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
