from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from models.voter_election import VoterElection
from schemas.voter_election_schema import VoterElectionCreate, VoterElectionRead
from database import get_session

router = APIRouter(prefix="/voter-elections", tags=["Voter-Elections"])


# Assign a voter to an election
@router.post("/", response_model=VoterElectionRead)
def assign_voter_to_election(
    data: VoterElectionCreate, session: Session = Depends(get_session)
):
    assignment = VoterElection.model_validate(data)

    try:
        session.add(assignment)
        session.commit()
        session.refresh(assignment)
        return assignment
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail="Voter already assigned to this election or invalid IDs",
        )


# List all assignments (optionally you can filter by election)
@router.get("/", response_model=list[VoterElectionRead])
def get_all_assignments(session: Session = Depends(get_session)):
    return session.exec(select(VoterElection)).all()


# Optional: Get assignments for a specific voter
@router.get("/voter/{voter_id}", response_model=list[VoterElectionRead])
def get_assignments_by_voter(voter_id: int, session: Session = Depends(get_session)):
    statement = select(VoterElection).where(VoterElection.voter_id == voter_id)
    return session.exec(statement).all()
