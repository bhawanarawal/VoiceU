from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from typing import List, Optional
from datetime import datetime

from database import get_session
from models.voter import Voter
from models.user import User
from models.organization import Organization
from models.group import Group
from models.voter_group import VoterGroup
from schemas.voter_schema import VoterCreate, VoterRead, GroupMembershipRead
from auth import get_current_active_user

router = APIRouter(prefix="/voters", tags=["Voters"])


@router.post("/", response_model=VoterRead)
def register_voter(
    data: VoterCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    voter = session.exec(
        select(Voter).where(Voter.user_id == current_user.user_id)
    ).first()

    org = session.get(Organization, data.org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    if not voter:
        voter = Voter(user_id=current_user.user_id, org_id=data.org_id)
        session.add(voter)
        session.commit()
        session.refresh(voter)
    else:
        if voter.org_id != data.org_id:
            voter.org_id = data.org_id
            session.add(voter)
            session.commit()
            session.refresh(voter)

    for group_id in data.group_ids:
        group = session.get(Group, group_id)
        if not group:
            raise HTTPException(status_code=404, detail=f"Group {group_id} not found")

        existing = session.exec(
            select(VoterGroup).where(
                (VoterGroup.voter_id == voter.voter_id)
                & (VoterGroup.group_id == group_id)
            )
        ).first()

        if not existing:
            vg = VoterGroup(voter_id=voter.voter_id, group_id=group_id)
            session.add(vg)

    session.commit()
    session.refresh(voter)

    voter_groups = session.exec(
        select(VoterGroup).where(VoterGroup.voter_id == voter.voter_id)
    ).all()

    groups_list: List[GroupMembershipRead] = []
    for vg in voter_groups:
        group = session.get(Group, vg.group_id)
        groups_list.append(
            GroupMembershipRead(
                voter_group_id=vg.voter_group_id,
                group_id=vg.group_id,
                group_name=group.group_name if group else "",
                status=vg.status,
                joined_at=vg.joined_at,
            )
        )

    first_group = groups_list[0] if groups_list else None

    return VoterRead(
        voter_id=voter.voter_id,
        user_id=current_user.user_id,
        username=current_user.username,
        full_name=current_user.full_name,
        org_id=org.org_id,
        org_name=org.name,
        group_id=first_group.group_id if first_group else 0,
        group_name=first_group.group_name if first_group else "",
        group_status=first_group.status if first_group else "PENDING",
        registered_at=voter.registered_at,
        groups=groups_list,
    )


@router.get("/me", response_model=VoterRead)
def get_my_voter_info(
    current_user: User = Depends(get_current_active_user),
    session: Session = Depends(get_session),
):
    voter = session.exec(
        select(Voter).where(Voter.user_id == current_user.user_id)
    ).first()

    if not voter:
        return VoterRead(
            voter_id=0,
            user_id=current_user.user_id,
            username=current_user.username,
            full_name=current_user.full_name,
            org_id=0,
            org_name="",
            group_id=0,
            group_name="",
            group_status="",
            registered_at=None,
            groups=[],
        )

    org = session.get(Organization, voter.org_id)
    voter_groups = session.exec(
        select(VoterGroup).where(VoterGroup.voter_id == voter.voter_id)
    ).all()

    groups_list: List[GroupMembershipRead] = []
    for vg in voter_groups:
        group = session.get(Group, vg.group_id)
        groups_list.append(
            GroupMembershipRead(
                voter_group_id=vg.voter_group_id,
                group_id=vg.group_id,
                group_name=group.group_name if group else "",
                status=vg.status,
                joined_at=vg.joined_at,
            )
        )

    first_group = groups_list[0] if groups_list else None

    return VoterRead(
        voter_id=voter.voter_id,
        user_id=current_user.user_id,
        username=current_user.username,
        full_name=current_user.full_name,
        org_id=org.org_id if org else 0,
        org_name=org.name if org else "",
        group_id=first_group.group_id if first_group else 0,
        group_name=first_group.group_name if first_group else "",
        group_status=first_group.status if first_group else "PENDING",
        registered_at=voter.registered_at,
        groups=groups_list,
    )


@router.get("/", response_model=List[VoterRead])
def list_all_voters(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    voters = session.exec(select(Voter)).all()
    result: List[VoterRead] = []

    for voter in voters:
        user = session.get(User, voter.user_id)
        org = session.get(Organization, voter.org_id)
        voter_groups = session.exec(
            select(VoterGroup).where(VoterGroup.voter_id == voter.voter_id)
        ).all()

        groups_list: List[GroupMembershipRead] = []
        for vg in voter_groups:
            group = session.get(Group, vg.group_id)
            groups_list.append(
                GroupMembershipRead(
                    voter_group_id=vg.voter_group_id,
                    group_id=vg.group_id,
                    group_name=group.group_name if group else "",
                    status=vg.status,
                    joined_at=vg.joined_at,
                )
            )

        first_group = groups_list[0] if groups_list else None

        result.append(
            VoterRead(
                voter_id=voter.voter_id,
                user_id=user.user_id,
                username=user.username,
                full_name=user.full_name,
                org_id=org.org_id if org else 0,
                org_name=org.name if org else "",
                group_id=first_group.group_id if first_group else 0,
                group_name=first_group.group_name if first_group else "",
                group_status=first_group.status if first_group else "PENDING",
                registered_at=voter.registered_at,
                groups=groups_list,
            )
        )

    return result


@router.put("/group/{voter_group_id}/approve")
def approve_voter_group(
    voter_group_id: int,
    db: Session = Depends(get_session),
):
    vg = (
        db.query(VoterGroup).filter(VoterGroup.voter_group_id == voter_group_id).first()
    )
    if not vg:
        raise HTTPException(status_code=404, detail="Voter group not found")

    vg.status = "APPROVED"
    db.commit()
    db.refresh(vg)
    return {"message": "Group approved successfully"}


@router.put("/group/{voter_group_id}/reject")
def reject_voter_group(
    voter_group_id: int,
    db: Session = Depends(get_session),
):
    vg = (
        db.query(VoterGroup).filter(VoterGroup.voter_group_id == voter_group_id).first()
    )
    if not vg:
        raise HTTPException(status_code=404, detail="Voter group not found")

    vg.status = "REJECTED"
    db.commit()
    db.refresh(vg)
    return {"message": "Group rejected successfully"}


@router.delete("/{voter_id}/")
def delete_voter(voter_id: int, session: Session = Depends(get_session)):
    voter = session.get(Voter, voter_id)
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")

    voter_groups = session.exec(
        select(VoterGroup).where(VoterGroup.voter_id == voter_id)
    ).all()
    for vg in voter_groups:
        session.delete(vg)

    session.delete(voter)
    session.commit()

    return {"detail": "Voter deleted successfully"}
