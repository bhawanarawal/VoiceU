from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone

from models.election import Election
from schemas.election_schema import ElectionCreate, ElectionRead
from database import get_session

router = APIRouter(prefix="/elections", tags=["Elections"])


@router.post("/", response_model=ElectionRead)
def create_election(data: ElectionCreate, session: Session = Depends(get_session)):
    election = Election.model_validate(data)
    election.created_at = datetime.now(timezone.utc)
    election.updated_at = datetime.now(timezone.utc)

    try:
        session.add(election)
        session.commit()
        session.refresh(election)
        return election
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail="Organization does not exist (invalid org_id)"
        )


@router.get("/", response_model=list[ElectionRead])
def get_all_elections(session: Session = Depends(get_session)):
    return session.exec(select(Election)).all()


@router.get("/{election_id}", response_model=ElectionRead)
def get_election(election_id: int, session: Session = Depends(get_session)):
    election = session.get(Election, election_id)
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")
    return election


@router.put("/{election_id}", response_model=ElectionRead)
def update_election(election_id: int, data: ElectionCreate, session: Session = Depends(get_session)):
    election = session.get(Election, election_id)
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")

    election.user_id = data.user_id
    election.affiliation_id = data.affiliation_id
    election.election_name = data.election_name
    election.start_date = data.start_date
    election.end_date = data.end_date
    election.status = data.status
    election.description = data.description
    election.updated_at = datetime.now(timezone.utc)
    try:
        session.add(election)
        session.commit()
        session.refresh(election)
        return election
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=400,  detail="Invalid user_id or affiliation_id")


@router.delete("/{election_id}")
def delete_election(election_id: int, session: Session = Depends(get_session)):
    election = session.get(Election, election_id)
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")

    session.delete(election)
    session.commit()
    return {"message": "Election deleted successfully"}
