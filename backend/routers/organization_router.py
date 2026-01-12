from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from models.organization import Organization

from models.group import Group
from schemas.organization_schema import OrganizationCreate, OrganizationRead
from database import get_session

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.post("/", response_model=OrganizationRead)
def create_organization(
    org: OrganizationCreate, session: Session = Depends(get_session)
):
    db_org = Organization(
        name=org.name,
        address=org.address,
        description=org.description,
    )
    try:
        session.add(db_org)
        session.commit()
        session.refresh(db_org)

        return OrganizationRead(
            org_id=db_org.org_id,
            name=db_org.name,
            address=db_org.address,
            description=db_org.description,
        )
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400, detail="Organization with this name already exists"
        )


@router.get("/", response_model=list[OrganizationRead])
def read_organizations(session: Session = Depends(get_session)):
    orgs = session.exec(select(Organization)).all()
    org_list = []
    for org in orgs:
        org_list.append(
            OrganizationRead(
                org_id=org.org_id,
                name=org.name,
                address=org.address,
                description=org.description,
            )
        )
    return org_list


@router.get("/{org_id}", response_model=OrganizationRead)
def get_organization(org_id: int, session: Session = Depends(get_session)):
    org = session.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    return OrganizationRead(
        org_id=org.org_id,
        name=org.name,
        address=org.address,
        description=org.description,
    )


@router.put("/{org_id}", response_model=OrganizationRead)
def update_organization(
    org_id: int,
    updated_org: OrganizationCreate,
    session: Session = Depends(get_session),
):
    org = session.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    org.name = updated_org.name
    org.address = updated_org.address
    org.description = updated_org.description

    try:
        session.add(org)
        session.commit()
        session.refresh(org)

        return OrganizationRead(
            org_id=org.org_id,
            name=org.name,
            address=org.address,
            description=org.description,
        )
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400, detail="Organization with this name already exists"
        )


@router.delete("/{org_id}")
def delete_organization(org_id: int, session: Session = Depends(get_session)):
    org = session.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")

    session.delete(org)
    session.commit()
    return {"message": "Organization deleted successfully"}
