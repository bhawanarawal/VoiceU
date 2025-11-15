from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from models.organization import Organization
from database import get_session

router = APIRouter(prefix="/organizations", tags=["Organizations"])

@router.post("/")
def create_organization(org: Organization, session: Session = Depends(get_session)):
    session.add(org)
    session.commit()
    session.refresh(org)
    return org

@router.get("/")
def read_organizations(session: Session = Depends(get_session)):
    return session.exec(select(Organization)).all()

@router.get("/{org_id}")
def get_organization(org_id: int, session: Session = Depends(get_session)):
    org = session.get(Organization, org_id)
    if not org:
        return "Organization not found"
    return org

@router.put("/{org_id}")
def update_organization(org_id: int, updated_org: Organization, session: Session = Depends(get_session)):
    org = session.get(Organization, org_id)
    if not org:
        return "Organization not found"
    org.name = updated_org.name
    org.address = updated_org.address
    org.description = updated_org.description
    session.add(org)
    session.commit()
    session.refresh(org)
    return org

@router.delete("/{org_id}")
def delete_organization(org_id: int, session: Session = Depends(get_session)):
    org = session.get(Organization, org_id)

    if not org:
        return "Organization not found"

    session.delete(org)
    session.commit()
    return "Organization deleted successfully"
