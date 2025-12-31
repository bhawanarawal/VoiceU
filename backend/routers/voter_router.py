from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from typing import List
from database import get_session
from models.voter import Voter
from models.user import User
from models.organization import Organization
from models.affiliation import Affiliation
from models.program import Program
from models.semester import Semester
from schemas.voter_schema import VoterCreate, VoterRead
from auth import get_current_active_user

router = APIRouter(prefix="/voters", tags=["Voters"])


@router.post("/", response_model=VoterRead)
def register_voter(
    data: VoterCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):

    existing = session.exec(select(Voter).where(Voter.user_id == data.user_id)).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="User is already registered as a voter"
        )

    org = session.get(Organization, data.org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    program = session.get(Program, data.program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    semester = session.get(Semester, data.semester_id)
    if not semester or semester.program_id != program.program_id:
        raise HTTPException(
            status_code=404,
            detail="Semester not found or does not belong to selected program",
        )

    voter = Voter(
        user_id=data.user_id,
        org_id=data.org_id,
        program_id=data.program_id,
        semester_id=data.semester_id,
        affiliation_id=data.affiliation_id,
    )

    try:
        session.add(voter)
        session.commit()
        session.refresh(voter)
        return VoterRead(
            voter_id=voter.voter_id,
            user_id=current_user.user_id,
            username=current_user.username,
            full_name=current_user.full_name,
            org_id=org.org_id,
            org_name=org.name,
            program_id=program.program_id,
            program_name=program.program_name,
            semester_id=semester.semester_id,
            semester_number=semester.semester_number,
            registered_at=voter.registered_at,
        )
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=400, detail="Failed to register voter")


@router.get("/me", response_model=VoterRead)
def get_my_voter_info(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    voter = session.exec(
        select(Voter).where(Voter.user_id == current_user.user_id)
    ).first()

    org = session.get(Organization, voter.org_id) if voter else None
    program = session.get(Program, voter.program_id) if voter else None
    semester = session.get(Semester, voter.semester_id) if voter else None
    affiliation = session.get(Affiliation, voter.affiliation_id) if voter else None

    return VoterRead(
        voter_id=voter.voter_id if voter else 0,
        user_id=current_user.user_id,
        username=current_user.username,
        full_name=current_user.full_name,
        org_id=org.org_id if org else 0,
        org_name=org.name if org else "",
        program_id=program.program_id if program else 0,
        program_name=program.program_name if program else "",
        semester_id=semester.semester_id if semester else 0,
        semester_number=semester.semester_number if semester else 0,
        affiliation_id=affiliation.affiliation_id if affiliation else 0,
        affiliation_name=affiliation.affiliation_name if affiliation else "",
        registered_at=voter.registered_at if voter else None,
    )


@router.get("/", response_model=List[VoterRead])
def list_all_voters(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    voters = session.exec(select(Voter)).all()
    result = []

    for voter in voters:
        user = session.get(User, voter.user_id)
        org = session.get(Organization, voter.org_id)
        program = session.get(Program, voter.program_id)
        semester = session.get(Semester, voter.semester_id)
        affiliation = session.get(Affiliation, voter.affiliation_id)

        result.append(
            VoterRead(
                voter_id=voter.voter_id,
                user_id=user.user_id,
                username=user.username,
                full_name=user.full_name,
                org_id=org.org_id,
                org_name=org.name,
                program_id=program.program_id,
                program_name=program.program_name,
                semester_id=semester.semester_id,
                semester_number=semester.semester_number,
                affiliation_id=affiliation.affiliation_id if affiliation else 0,
                affiliation_name=affiliation.affiliation_name if affiliation else "",
                registered_at=voter.registered_at,
            )
        )

    return result


@router.delete("/{voter_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_voter(
    voter_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    voter = session.get(Voter, voter_id)
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")

    session.delete(voter)
    session.commit()
    return None
