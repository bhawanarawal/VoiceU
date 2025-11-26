from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
from models.candidate import Candidate
from schemas.candidate_schema import CandidateCreate, CandidateRead
from database import get_session

router = APIRouter(prefix="/candidates", tags=["Candidates"])


@router.post("/", response_model=CandidateRead)
def create_candidate(data: CandidateCreate, session: Session = Depends(get_session)):
    candidate = Candidate.model_validate(data)
    candidate.created_at = datetime.now(timezone.utc)
    candidate.updated_at = datetime.now(timezone.utc)

    try:
        session.add(candidate)
        session.commit()
        session.refresh(candidate)
        return candidate
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail="Invalid user_id, election_id, or position_id"
        )


@router.get("/", response_model=list[CandidateRead])
def get_all_candidates(session: Session = Depends(get_session)):
    return session.exec(select(Candidate)).all()


@router.get("/{candidate_id}", response_model=CandidateRead)
def get_candidate(candidate_id: int, session: Session = Depends(get_session)):
    candidate = session.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.put("/{candidate_id}", response_model=CandidateRead)
def update_candidate(candidate_id: int, data: CandidateCreate, session: Session = Depends(get_session)):
    candidate = session.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    candidate.user_id = data.user_id
    candidate.election_id = data.election_id
    candidate.position_id = data.position_id
    candidate.approval_status = data.approval_status
    candidate.manifesto = data.manifesto
    candidate.photo_url = data.photo_url
    candidate.updated_at = datetime.now(timezone.utc)

    try:
        session.add(candidate)
        session.commit()
        session.refresh(candidate)
        return candidate

    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail="Invalid user_id, election_id, or position_id"
        )


@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: int, session: Session = Depends(get_session)):
    candidate = session.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    session.delete(candidate)
    session.commit()
    return {"message": "Candidate deleted successfully"}
