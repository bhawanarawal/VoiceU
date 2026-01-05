from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
import os, shutil
from database import get_session
from models.candidate import Candidate, ApprovalStatus
from models.user import User
from models.voter import Voter
from models.election import Election
from models.position import Position
from models.organization import Organization
from models.affiliation import Affiliation
from schemas.candidate_schema import (
    CandidateRead,
    CandidateApprovalUpdate,
    CandidateBase,
)
from models.program import Program


router = APIRouter(prefix="/candidates", tags=["Candidates"])


UPLOAD_DIR = "static/uploads/candidates"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=CandidateBase)
def apply_candidate(
    user_id: int = Form(...),
    election_id: int = Form(...),
    position_id: int = Form(...),
    manifesto: str | None = Form(None),
    photo: UploadFile | None = File(None),
    session: Session = Depends(get_session),
):
    # voters validation
    voter = session.exec(select(Voter).where(Voter.user_id == user_id)).first()
    if not voter:
        raise HTTPException(status_code=403, detail="Only voters can apply")

    election = session.get(Election, election_id)
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")

    if election.program_id != voter.program_id:
        raise HTTPException(
            status_code=403,
            detail="You can only apply to elections of your own program",
        )

    if hasattr(election, "organization_id") and voter.org_id != getattr(
        election, "organization_id", None
    ):
        raise HTTPException(
            status_code=403,
            detail="You can only apply to elections in your own organization",
        )

    exists = session.exec(
        select(Candidate)
        .where(Candidate.voter_id == voter.voter_id)
        .where(Candidate.election_id == election_id)
        .where(Candidate.is_active == True)
    ).first()
    if exists:
        raise HTTPException(
            status_code=400, detail="You have already applied for this election"
        )

    photo_path = None
    if photo:
        filename = f"{int(datetime.now().timestamp())}_{photo.filename}"
        photo_path = os.path.join(UPLOAD_DIR, filename)
        with open(photo_path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)

    candidate = Candidate(
        voter_id=voter.voter_id,
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
        raise HTTPException(status_code=400, detail="Invalid data")


@router.get("/", response_model=list[CandidateRead])
def get_all_candidates(session: Session = Depends(get_session)):

    stmt = (
        select(
            Candidate,
            User.username,
            Election.election_name,
            Position.position_name,
            Program.program_name,
            Organization.name.label("organization_name"),
            Affiliation.affiliation_name,
        )
        .join(Voter, Voter.voter_id == Candidate.voter_id)
        .join(User, User.user_id == Voter.user_id)
        .join(Election, Election.election_id == Candidate.election_id)
        .join(Position, Position.position_id == Candidate.position_id)
        .join(Program, Program.program_id == Election.program_id)
        .join(Organization, Organization.org_id == Program.org_id, isouter=True)
        .join(
            Affiliation,
            Affiliation.affiliation_id == Organization.affiliation_id,
            isouter=True,
        )
        .where(Candidate.is_active == True)
    )

    results = session.exec(stmt).all()

    return [
        CandidateRead(
            candidate_id=c.candidate_id,
            voter_id=c.voter_id,
            username=username,
            election_id=c.election_id,
            election_name=election_name,
            position_id=c.position_id,
            position_name=position_name,
            program_name=program_name,
            organization_name=organization_name,
            affiliation_name=affiliation_name,
            approval_status=c.approval_status,
            manifesto=c.manifesto,
            photo_url=c.photo_url,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for (
            c,
            username,
            election_name,
            position_name,
            program_name,
            organization_name,
            affiliation_name,
        ) in results
    ]


@router.get("/approved/by-election/{election_id}")
def get_approved_candidates_by_election(
    election_id: int,
    session: Session = Depends(get_session),
):
    stmt = (
        select(
            Candidate.candidate_id,
            User.username,
            Candidate.photo_url,
            Candidate.manifesto,
            Election.election_name,
            Program.program_name,
            Position.position_name,
            Organization.name.label("organization_name"),
            Affiliation.affiliation_name,
        )
        .join(Voter, Voter.voter_id == Candidate.voter_id)
        .join(User, User.user_id == Voter.user_id)
        .join(Election, Election.election_id == Candidate.election_id)
        .join(Program, Program.program_id == Election.program_id)
        .join(Position, Position.position_id == Candidate.position_id)
        .join(
            Affiliation,
            Affiliation.affiliation_id == Voter.affiliation_id,
            isouter=True,
        )
        .join(
            Organization,
            Organization.affiliation_id == Affiliation.affiliation_id,
            isouter=True,
        )
        .where(Candidate.approval_status == ApprovalStatus.APPROVED)
        .where(Candidate.election_id == election_id)
        .where(Candidate.is_active == True)
    )

    results = session.exec(stmt).all()

    return [
        {
            "candidate_id": r[0],
            "username": r[1],
            "photo_url": r[2],
            "manifesto": r[3],
            "election_name": r[4],
            "program_name": r[5],
            "position_name": r[6],
            "organization_name": r[7],
            "affiliation_name": r[8],
        }
        for r in results
    ]


@router.get("/{candidate_id}", response_model=CandidateRead)
def get_candidate(candidate_id: int, session: Session = Depends(get_session)):
    candidate = session.get(Candidate, candidate_id)
    if not candidate or not candidate.is_active:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.get("/approved")
def get_approved_candidates(session: Session = Depends(get_session)):
    statement = (
        select(
            Candidate.candidate_id,
            User.username,
            Candidate.photo_url,
            Candidate.manifesto,
            Election.election_name,
            Position.position_name,
            Organization.name.label("organization_name"),
            Affiliation.affiliation_name,
        )
        .join(Voter, Voter.voter_id == Candidate.voter_id)
        .join(User, User.user_id == Voter.user_id)
        .join(Election, Election.election_id == Candidate.election_id)
        .join(Position, Position.position_id == Candidate.position_id)
        .join(Affiliation, Affiliation.affiliation_id == Voter.affiliation_id)
        .join(Organization, Organization.org_id == Affiliation.org_id)
        .where(Candidate.approval_status == ApprovalStatus.APPROVED)
        .where(Candidate.is_active == True)
    )

    results = session.exec(statement).all()

    return [
        {
            "candidate_id": r[0],
            "username": r[1],
            "photo_url": r[2],
            "manifesto": r[3],
            "election_name": r[4],
            "position_name": r[5],
            "organization_name": r[6],
            "affiliation_name": r[7],
        }
        for r in results
    ]


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
        path = os.path.join(UPLOAD_DIR, filename)
        with open(path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        candidate.photo_url = path

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
