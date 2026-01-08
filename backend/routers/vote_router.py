from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select, func
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone

from models.vote import Vote
from models.candidate import Candidate
from models.position import Position
from models.user import User
from models.voter import Voter
from schemas.vote_schema import VoteCreate, VoteRead
from database import get_session
from auth import get_current_active_user

router = APIRouter(prefix="/votes", tags=["Votes"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def cast_vote(
    data: VoteCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):

    voter = session.exec(
        select(Voter).where(Voter.user_id == current_user.user_id)
    ).first()

    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")

    candidate = session.get(Candidate, data.candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    if candidate.election_id != data.election_id:
        raise HTTPException(status_code=400, detail="Invalid election")

    existing_vote = session.exec(
        select(Vote).where(
            Vote.voter_id == voter.voter_id,
            Vote.election_id == data.election_id,
            Vote.position_id == candidate.position_id,
        )
    ).first()

    if existing_vote:
        raise HTTPException(
            status_code=400,
            detail="You have already voted for this position",
        )

    vote = Vote(
        voter_id=voter.voter_id,
        election_id=data.election_id,
        position_id=candidate.position_id,
        candidate_id=candidate.candidate_id,
    )

    session.add(vote)
    session.commit()
    session.refresh(vote)

    return {"message": "Vote cast successfully"}


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


@router.get("/election/{election_id}/counts")
def get_vote_counts(election_id: int, session: Session = Depends(get_session)):
    results = session.exec(
        select(
            Vote.candidate_id,
            Position.position_id,
            Position.position_name,
            func.count(Vote.vote_id).label("count"),
        )
        .join(Candidate, Candidate.candidate_id == Vote.candidate_id)
        .join(Position, Position.position_id == Candidate.position_id)
        .where(Vote.election_id == election_id)
        .group_by(Vote.candidate_id, Position.position_id)
    ).all()

    return results
