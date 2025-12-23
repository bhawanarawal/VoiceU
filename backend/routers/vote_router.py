from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
from models.vote import Vote
from models.voter_election import VoterElection
from schemas.vote_schema import VoteCreate, VoteRead
from database import get_session

router = APIRouter(prefix="/votes", tags=["Votes"])


@router.post("/", response_model=VoteRead)
def cast_vote(data: VoteCreate, session: Session = Depends(get_session)):

    assignment = session.exec(
        select(VoterElection).where(
            (VoterElection.voter_id == data.voter_id)
            & (VoterElection.election_id == data.election_id)
        )
    ).first()

    if not assignment:
        raise HTTPException(
            status_code=400, detail="Voter not assigned to this election"
        )

    if assignment.has_voted:
        raise HTTPException(
            status_code=400, detail="Voter has already voted in this election"
        )

    vote = Vote(
        voter_id=data.voter_id,
        candidate_id=data.candidate_id,
        election_id=data.election_id,
        vote_time=datetime.now(timezone.utc),
    )

    try:
        session.add(vote)
        assignment.has_voted = True
        session.add(assignment)

        session.commit()
        session.refresh(vote)
        return vote

    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=400, detail="Duplicate vote or invalid data")


@router.get("/", response_model=list[VoteRead])
def get_all_votes(session: Session = Depends(get_session)):
    return session.exec(select(Vote)).all()


@router.get("/{vote_id}", response_model=VoteRead)
def get_vote(vote_id: int, session: Session = Depends(get_session)):
    vote = session.get(Vote, vote_id)
    if not vote:
        raise HTTPException(status_code=404, detail="Vote not found")
    return vote


@router.get("/election/{election_id}", response_model=list[VoteRead])
def get_votes_by_election(election_id: int, session: Session = Depends(get_session)):
    return session.exec(select(Vote).where(Vote.election_id == election_id)).all()
