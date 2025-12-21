from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
import os
import shutil
from database import get_session
from models.candidate import Candidate, ApprovalStatus
from models.user import User
from models.election import Election
from models.position import Position
from models.organization import Organization
from models.affiliation import Affiliation
from schemas.candidate_schema import CandidateRead, CandidateApprovalUpdate

router = APIRouter(prefix="/candidates", tags=["Candidates"])


UPLOAD_DIR = "static/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=CandidateRead)
def create_candidate(
    user_id: int = Form(...),
    election_id: int = Form(...),
    position_id: int = Form(...),
    manifesto: str | None = Form(None),
    photo: UploadFile | None = File(None),
    session: Session = Depends(get_session),
):
    photo_path = None
    if photo:
        filename = f"{int(datetime.now().timestamp())}_{photo.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        photo_path = file_path

    candidate = Candidate(
        user_id=user_id,
        election_id=election_id,
        position_id=position_id,
        manifesto=manifesto,
        photo_url=photo_path,
        approval_status=ApprovalStatus.PENDING,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )

    try:
        session.add(candidate)
        session.commit()
        session.refresh(candidate)
        return candidate
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400,
            detail="Invalid user_id, election_id, or position_id",
        )


@router.get("/", response_model=list[CandidateRead])
def get_all_candidates(session: Session = Depends(get_session)):
    query = (
        select(
            Candidate,
            User.username,
            Election.election_name,
            Position.position_name,
            Organization.name.label("organization_name"),
            Affiliation.affiliation_name,
        )
        .join(User, User.user_id == Candidate.user_id)
        .join(Position, Position.position_id == Candidate.position_id)
        .join(Election, Election.election_id == Candidate.election_id)
        .join(
            Affiliation,
            Affiliation.affiliation_id == Election.affiliation_id,
            isouter=True,
        )
        .join(Organization, Organization.org_id == Affiliation.org_id, isouter=True)
        .where(Candidate.is_active == True)
    )

    results = session.exec(query).all()
    candidates = []

    for (
        candidate,
        username,
        election_name,
        position_name,
        organization_name,
        affiliation_name,
    ) in results:
        candidates.append(
            CandidateRead(
                candidate_id=candidate.candidate_id,
                user_id=candidate.user_id,
                username=username,
                election_id=candidate.election_id,
                election_name=election_name,
                position_id=candidate.position_id,
                position_name=position_name,
                organization_name=organization_name,
                affiliation_name=affiliation_name,
                approval_status=candidate.approval_status,
                manifesto=candidate.manifesto,
                photo_url=candidate.photo_url,
                created_at=candidate.created_at,
                updated_at=candidate.updated_at,
            )
        )

    return candidates


@router.get("/{candidate_id}", response_model=CandidateRead)
def get_candidate(candidate_id: int, session: Session = Depends(get_session)):
    candidate = session.get(Candidate, candidate_id)
    if not candidate or not candidate.is_active:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.put("/{candidate_id}", response_model=CandidateRead)
def update_candidate(
    candidate_id: int,
    position_id: int | None = Form(None),
    manifesto: str | None = Form(None),
    photo: UploadFile | None = File(None),
    session: Session = Depends(get_session),
):
    candidate = session.get(Candidate, candidate_id)
    if not candidate or not candidate.is_active:
        raise HTTPException(status_code=404, detail="Candidate not found")

    if position_id is not None:
        candidate.position_id = position_id
    if manifesto is not None:
        candidate.manifesto = manifesto
    if photo:
        filename = f"{int(datetime.now().timestamp())}_{photo.filename}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        candidate.photo_url = file_path

    candidate.updated_at = datetime.now(timezone.utc)
    session.commit()
    session.refresh(candidate)
    return candidate


@router.patch("/{candidate_id}/approval", response_model=CandidateRead)
def approve_candidate(
    candidate_id: int,
    data: CandidateApprovalUpdate,
    session: Session = Depends(get_session),
):
    candidate = session.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    candidate.approval_status = data.approval_status
    candidate.updated_at = datetime.now(timezone.utc)
    session.commit()
    session.refresh(candidate)
    return candidate


@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: int, session: Session = Depends(get_session)):
    candidate = session.get(Candidate, candidate_id)
    if not candidate or not candidate.is_active:
        raise HTTPException(status_code=404, detail="Candidate not found")

    candidate.is_active = False
    candidate.updated_at = datetime.now(timezone.utc)
    session.commit()
    return {"message": "Candidate deactivated successfully"}
