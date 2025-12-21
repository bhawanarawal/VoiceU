from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from models.affiliation import Affiliation
from schemas.affiliation_schema import AffiliationCreate, AffiliationRead
from database import get_session

router = APIRouter(prefix="/affiliations", tags=["Affiliations"])


@router.post("/", response_model=AffiliationRead)
def create_affiliation(aff: AffiliationCreate, session: Session = Depends(get_session)):
    db_aff = Affiliation.model_validate(aff)
    try:
        session.add(db_aff)
        session.commit()
        session.refresh(db_aff)
        return db_aff
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400, detail="Organization does not exist (invalid org_id)"
        )


@router.get("/", response_model=list[AffiliationRead])
def read_affiliations(session: Session = Depends(get_session)):
    return session.exec(select(Affiliation)).all()


@router.get("/{affiliation_id}", response_model=AffiliationRead)
def get_affiliation(affiliation_id: int, session: Session = Depends(get_session)):
    aff = session.get(Affiliation, affiliation_id)
    if not aff:
        raise HTTPException(status_code=404, detail="Affiliation not found")
    return aff


@router.put("/{affiliation_id}", response_model=AffiliationRead)
def update_affiliation(
    affiliation_id: int,
    updated_aff: AffiliationCreate,
    session: Session = Depends(get_session),
):
    aff = session.get(Affiliation, affiliation_id)
    if not aff:
        raise HTTPException(status_code=404, detail="Affiliation not found")

    aff.affiliation_name = updated_aff.affiliation_name
    aff.description = updated_aff.description
    aff.org_id = updated_aff.org_id

    try:
        session.add(aff)
        session.commit()
        session.refresh(aff)
        return aff
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400, detail="Organization does not exist (invalid org_id)"
        )


@router.delete("/{affiliation_id}")
def delete_affiliation(affiliation_id: int, session: Session = Depends(get_session)):
    aff = session.get(Affiliation, affiliation_id)
    if not aff:
        raise HTTPException(status_code=404, detail="Affiliation not found")

    session.delete(aff)
    session.commit()
    return {"message": "Affiliation deleted successfully"}
