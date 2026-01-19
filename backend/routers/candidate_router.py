from fastapi import APIRouter, Depends, HTTPException, Form, UploadFile, File
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
import os, shutil
from auth import require_roles, get_current_active_user
from database import get_session
from models.candidate import Candidate, ApprovalStatus
from models.user import User
from models.voter import Voter
from models.election import Election
from models.position import Position
from models.voter_group import VoterGroup
from models.group import Group
from models.organization import Organization
from schemas.candidate_schema import (
    CandidateRead,
    CandidateApprovalUpdate,
    CandidateBase,
)

router = APIRouter(prefix="/candidates", tags=["Candidates"])

UPLOAD_DIR = "static/uploads/candidates"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/", response_model=CandidateBase)
def apply_candidate(
    election_id: int = Form(...),
    position_id: int = Form(...),
    manifesto: str | None = Form(None),
    photo: UploadFile | None = File(None),
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):

    voter = session.exec(
        select(Voter).where(Voter.user_id == current_user.user_id)
    ).first()
    if not voter:
        raise HTTPException(status_code=403, detail="Only voters can apply")

    election = session.get(Election, election_id)
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")

    voter_groups = session.exec(
        select(VoterGroup.group_id).where(VoterGroup.voter_id == voter.voter_id)
    ).all()
    if election.group_id not in voter_groups:
        raise HTTPException(
            status_code=403,
            detail="You can only apply to elections of your own group",
        )

    exists = session.exec(
        select(Candidate)
        .where(Candidate.voter_id == voter.voter_id)
        .where(Candidate.election_id == election_id)
        .where(Candidate.is_active == True)
    ).first()
    if exists:
        raise HTTPException(
            status_code=400,
            detail="You have already applied for this election",
        )

    photo_path = None
    if photo:
        filename = f"{int(datetime.now().timestamp())}_{photo.filename}"
        path = os.path.join(UPLOAD_DIR, filename)
        with open(path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        photo_path = f"/static/uploads/candidates/{filename}".replace("\\", "/")

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
def get_all_candidates(
    session: Session = Depends(get_session),
    current_user: User = Depends(require_roles(["admin", "superadmin"])),
):
    stmt = (
        select(
            Candidate,
            User.username,
            User.full_name,
            Election.election_name,
            Position.position_name,
            Group.group_name,
            Organization.name.label("organization_name"),
        )
        .join(Voter, Voter.voter_id == Candidate.voter_id)
        .join(User, User.user_id == Voter.user_id)
        .join(Election, Election.election_id == Candidate.election_id)
        .join(Position, Position.position_id == Candidate.position_id)
        .join(Group, Group.group_id == Election.group_id)
        .join(Organization, Organization.org_id == Group.org_id, isouter=True)
    )

    results = session.exec(stmt).all()

    return [
        CandidateRead(
            candidate_id=c.candidate_id,
            voter_id=c.voter_id,
            username=username,
            full_name=full_name,
            election_id=c.election_id,
            election_name=election_name,
            position_id=c.position_id,
            position_name=position_name,
            group_name=group_name,
            organization_name=organization_name,
            approval_status=c.approval_status,
            manifesto=c.manifesto,
            photo_url=c.photo_url,
            created_at=c.created_at,
            updated_at=c.updated_at,
        )
        for (
            c,
            username,
            full_name,
            election_name,
            position_name,
            group_name,
            organization_name,
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
            User.full_name,
            Candidate.photo_url,
            Candidate.manifesto,
            Election.election_name,
            Group.group_name,
            Position.position_name,
            Organization.name.label("organization_name"),
        )
        .join(Voter, Voter.voter_id == Candidate.voter_id)
        .join(User, User.user_id == Voter.user_id)
        .join(Election, Election.election_id == Candidate.election_id)
        .join(Group, Group.group_id == Election.group_id)
        .join(Position, Position.position_id == Candidate.position_id)
        .join(Organization, Organization.org_id == Group.org_id, isouter=True)
        .where(Candidate.approval_status == ApprovalStatus.APPROVED)
        .where(Candidate.election_id == election_id)
        .where(Candidate.is_active == True)
    )

    results = session.exec(stmt).all()

    return [
        {
            "candidate_id": r[0],
            "username": r[1],
            "full_name": r[2],
            "photo_url": r[3],
            "manifesto": r[4],
            "election_name": r[5],
            "group_name": r[6],
            "position_name": r[7],
            "organization_name": r[8],
        }
        for r in results
    ]


@router.get("/{candidate_id}", response_model=CandidateRead)
def get_candidate(
    candidate_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_roles(["admin", "superadmin"])),
):
    stmt = (
        select(
            Candidate,
            User.username,
            User.full_name,
            Election.election_name,
            Position.position_name,
            Group.group_name,
            Organization.name.label("organization_name"),
        )
        .join(Voter, Voter.voter_id == Candidate.voter_id)
        .join(User, User.user_id == Voter.user_id)
        .join(Election, Election.election_id == Candidate.election_id)
        .join(Position, Position.position_id == Candidate.position_id)
        .join(Group, Group.group_id == Election.group_id)
        .join(Organization, Organization.org_id == Group.org_id, isouter=True)
        .where(Candidate.candidate_id == candidate_id)
        .where(Candidate.is_active == True)
    )

    result = session.exec(stmt).first()
    if not result:
        raise HTTPException(status_code=404, detail="Candidate not found")

    (
        c,
        username,
        full_name,
        election_name,
        position_name,
        group_name,
        organization_name,
    ) = result

    return CandidateRead(
        candidate_id=c.candidate_id,
        voter_id=c.voter_id,
        username=username,
        full_name=full_name,
        election_id=c.election_id,
        election_name=election_name,
        position_id=c.position_id,
        position_name=position_name,
        group_name=group_name,
        organization_name=organization_name,
        approval_status=c.approval_status,
        manifesto=c.manifesto,
        photo_url=c.photo_url,
        created_at=c.created_at,
        updated_at=c.updated_at,
    )


@router.patch("/{candidate_id}/approval", response_model=CandidateRead)
def approve_candidate(
    candidate_id: int,
    data: CandidateApprovalUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_roles(["admin", "superadmin"])),
):
    candidate = session.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    candidate.approval_status = data.approval_status
    candidate.updated_at = datetime.now(timezone.utc)
    session.commit()

    return get_candidate(candidate_id, session)


@router.put("/{candidate_id}", response_model=CandidateRead)
def update_candidate(
    candidate_id: int,
    position_id: int | None = Form(None),
    manifesto: str | None = Form(None),
    photo: UploadFile | None = File(None),
    session: Session = Depends(get_session),
    current_user: User = Depends(require_roles(["admin", "superadmin"])),
):
    candidate = session.get(Candidate, candidate_id)
    if not candidate or not candidate.is_active:
        raise HTTPException(status_code=404, detail="Candidate not found")

    if position_id:
        candidate.position_id = position_id
    if manifesto:
        candidate.manifesto = manifesto

    if photo:
        filename = f"{int(datetime.now().timestamp())}_{photo.filename}"
        path = os.path.join(UPLOAD_DIR, filename)
        with open(path, "wb") as buffer:
            shutil.copyfileobj(photo.file, buffer)
        candidate.photo_url = f"/static/uploads/candidates/{filename}".replace(
            "\\", "/"
        )

    candidate.updated_at = datetime.now(timezone.utc)
    session.commit()

    return get_candidate(candidate_id, session)


@router.delete("/{candidate_id}")
def delete_candidate(
    candidate_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(require_roles(["admin", "superadmin"])),
):
    candidate = session.get(Candidate, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    if not candidate.is_active:
        return {"message": "Candidate is already deleted"}

    candidate.is_active = False
    candidate.updated_at = datetime.now(timezone.utc)

    session.add(candidate)
    session.commit()
    session.refresh(candidate)

    return {"message": "Candidate deleted successfully"}
