from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from database import get_session
from models.group import Group
from models.organization import Organization
from schemas.group_schema import (
    GroupCreate,
    GroupRead,
    GroupUpdate,
    GroupReadWithOrganization,
)
from schemas.voter_schema import GroupMembershipRead
from models.user import User

router = APIRouter(prefix="/groups", tags=["groups"])


@router.post("/", response_model=GroupRead)
def create_group(group: GroupCreate, session: Session = Depends(get_session)):
    org = session.get(Organization, group.org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    existing = session.exec(
        select(Group).where(
            Group.org_id == group.org_id,
            Group.group_name == group.group_name,
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=400,
            detail=f"group '{group.group_name}' already exists for this organization",
        )

    db_group = Group(
        group_name=group.group_name,
        org_id=group.org_id,
        description=group.description,
    )
    session.add(db_group)
    session.commit()
    session.refresh(db_group)
    return db_group


@router.get("/", response_model=List[GroupRead])
def read_groups(
    org_id: Optional[int] = Query(None, description="Filter groups by organization"),
    session: Session = Depends(get_session),
):
    query = select(Group)
    if org_id:
        query = query.where(Group.org_id == org_id)
    return session.exec(query).all()


@router.get("/{group_id}", response_model=GroupReadWithOrganization)
def get_group(group_id: int, session: Session = Depends(get_session)):
    group = session.get(Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    org_name = group.organization.organization_name if group.organization else None
    return GroupReadWithOrganization(
        group_id=group.group_id,
        group_name=group.group_name,
        org_id=group.org_id,
        description=group.description,
        is_active=group.is_active,
        organization_name=org_name,
    )


@router.put("/{group_id}", response_model=GroupRead)
def update_group(
    group_id: int,
    updated_group: GroupUpdate,
    session: Session = Depends(get_session),
):
    group = session.get(Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    if updated_group.group_name is not None:
        existing = session.exec(
            select(Group).where(
                Group.org_id == (updated_group.org_id or group.org_id),
                Group.group_name == updated_group.group_name,
                Group.group_id != group_id,
            )
        ).first()
        if existing:
            raise HTTPException(
                status_code=400,
                detail=f"group '{updated_group.group_name}' already exists for this organization",
            )
        group.group_name = updated_group.group_name

    if updated_group.org_id is not None:
        org = session.get(Organization, updated_group.org_id)
        if not org:
            raise HTTPException(status_code=404, detail="Organization not found")
        group.org_id = updated_group.org_id

    if updated_group.description is not None:
        group.description = updated_group.description

    if updated_group.is_active is not None:
        group.is_active = updated_group.is_active

    session.add(group)
    session.commit()
    session.refresh(group)
    return group


@router.delete("/{group_id}")
def delete_group(group_id: int, session: Session = Depends(get_session)):
    group = session.get(Group, group_id)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")

    session.delete(group)
    session.commit()
    return {"message": "Group deleted successfully"}
