from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from models.voter_election import VoterElection
from schemas.voter_election_schema import VoterElectionCreate, VoterElectionRead
from database import get_session

router = APIRouter(prefix="/voter-elections", tags=["Voter-Elections"])


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


@router.get("/", response_model=list[VoterElectionRead])
def get_all_assignments(session: Session = Depends(get_session)):
    return session.exec(select(VoterElection)).all()


@router.get("/voter/{voter_id}", response_model=list[VoterElectionRead])
def get_assignments_by_voter(voter_id: int, session: Session = Depends(get_session)):
    statement = select(VoterElection).where(VoterElection.voter_id == voter_id)
    return session.exec(statement).all()


@router.get("/status")
def get_voter_election_status(
    voter_id: int, election_id: int, session: Session = Depends(get_session)
):
    assignment = session.exec(
        select(VoterElection).where(
            VoterElection.voter_id == voter_id, VoterElection.election_id == election_id
        )
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=404, detail="Voter not assigned to this election"
        )

    return {"has_voted": assignment.has_voted}
