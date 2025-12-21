from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from models.organization import Organization
from schemas.organization_schema import OrganizationCreate, OrganizationRead
from database import get_session

router = APIRouter(prefix="/organizations", tags=["Organizations"])


@router.post("/", response_model=OrganizationRead)
def create_organization(
    org: OrganizationCreate, session: Session = Depends(get_session)
):
    db_org = Organization.model_validate(org)
    try:
        session.add(db_org)
        session.commit()
        session.refresh(db_org)
        return db_org
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400, detail="Organization with this name already exists"
        )


@router.get("/", response_model=list[OrganizationRead])
def read_organizations(session: Session = Depends(get_session)):
    return session.exec(select(Organization)).all()


@router.get("/{org_id}", response_model=OrganizationRead)
def get_organization(org_id: int, session: Session = Depends(get_session)):
    org = session.get(Organization, org_id)
    if not org:
        raise HTTPException(status_code=404, detail="Organization not found")
    return org


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
        return org
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
