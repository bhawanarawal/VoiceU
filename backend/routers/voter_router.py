from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from typing import List
from database import get_session
from models.voter import Voter
from models.user import User
from models.organization import Organization
from models.group import Group
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

    group = session.get(group, data.group_id)
    if not group:
        raise HTTPException(status_code=404, detail="group not found")

    voter = Voter(
        user_id=data.user_id,
        org_id=data.org_id,
        group_id=data.group_id,
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
            group_id=group.group_id,
            group_name=group.group_name,
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
    group = session.get(Group, voter.group_id) if voter else None

    return VoterRead(
        voter_id=voter.voter_id if voter else 0,
        user_id=current_user.user_id,
        username=current_user.username,
        full_name=current_user.full_name,
        org_id=org.org_id if org else 0,
        org_name=org.name if org else "",
        group_id=group.group_id if group else 0,
        group_name=group.group_name if group else "",
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
        group = session.get(Group, voter.group_id)

        result.append(
            VoterRead(
                voter_id=voter.voter_id,
                user_id=user.user_id,
                username=user.username,
                full_name=user.full_name,
                org_id=org.org_id,
                org_name=org.name,
                group_id=group.group_id,
                group_name=group.group_name,
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
