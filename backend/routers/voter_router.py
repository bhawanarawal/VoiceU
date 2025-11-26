from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
from models.voter import Voter
from schemas.voter_schema import VoterCreate, VoterRead
from database import get_session

router = APIRouter(prefix="/voters", tags=["Voters"])


@router.post("/", response_model=VoterRead)
def create_voter(data: VoterCreate, session: Session = Depends(get_session)):
    voter = Voter.model_validate(data)
    voter.created_at = datetime.now(timezone.utc)
    voter.updated_at = datetime.now(timezone.utc)

    try:
        session.add(voter)
        session.commit()
        session.refresh(voter)
        return voter
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail="Invalid user_id, org_id, or affiliation_id"
        )


@router.get("/", response_model=list[VoterRead])
def get_all_voters(session: Session = Depends(get_session)):
    return session.exec(select(Voter)).all()


@router.get("/{voter_id}", response_model=VoterRead)
def get_voter(voter_id: int, session: Session = Depends(get_session)):
    voter = session.get(Voter, voter_id)
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")
    return voter


@router.put("/{voter_id}", response_model=VoterRead)
def update_voter(voter_id: int, data: VoterCreate, session: Session = Depends(get_session)):
    voter = session.get(Voter, voter_id)
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")

    voter.user_id = data.user_id
    voter.org_id = data.org_id
    voter.affiliation_id = data.affiliation_id
    voter.affiliation_level = data.affiliation_level
    voter.updated_at = datetime.now(timezone.utc)

    try:
        session.add(voter)
        session.commit()
        session.refresh(voter)
        return voter
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail="Invalid user_id, org_id, or affiliation_id"
        )


@router.delete("/{voter_id}")
def delete_voter(voter_id: int, session: Session = Depends(get_session)):
    voter = session.get(Voter, voter_id)
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")

    session.delete(voter)
    session.commit()
    return {"message": "Voter deleted successfully"}
