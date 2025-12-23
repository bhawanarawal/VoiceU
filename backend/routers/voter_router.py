from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone
from models.voter import Voter
from models.user import User
from models.organization import Organization
from models.affiliation import Affiliation
from schemas.voter_schema import VoterCreate, VoterRead, VoterUpdate
from database import get_session

router = APIRouter(prefix="/voters", tags=["Voters"])


@router.post("/", response_model=VoterRead)
def create_voter(data: VoterCreate, session: Session = Depends(get_session)):
    voter = Voter.model_validate(data)
    voter.created_at = datetime.now(timezone.utc)
    voter.updated_at = datetime.now(timezone.utc)

    try:
        session.add(voter)
        session.commit()
        session.refresh(voter)

        user = session.get(User, voter.user_id)
        org = session.get(Organization, voter.org_id)
        aff = session.get(Affiliation, voter.affiliation_id)

        return VoterRead(
            voter_id=voter.voter_id,
            user_id=voter.user_id,
            username=user.username,
            full_name=user.full_name,
            org_id=voter.org_id,
            org_name=org.name,
            affiliation_id=voter.affiliation_id,
            affiliation_name=aff.affiliation_name,
            affiliation_level=voter.affiliation_level,
            created_at=voter.created_at,
            updated_at=voter.updated_at,
        )
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400, detail="Foreign key constraint failed or duplicate voter"
        )


@router.get("/", response_model=list[VoterRead])
def get_all_voters(session: Session = Depends(get_session)):
    voters = session.exec(select(Voter)).all()
    result = []
    for voter in voters:
        user = session.get(User, voter.user_id)
        org = session.get(Organization, voter.org_id)
        aff = session.get(Affiliation, voter.affiliation_id)
        result.append(
            VoterRead(
                voter_id=voter.voter_id,
                user_id=voter.user_id,
                username=user.username,
                full_name=user.full_name,
                org_id=voter.org_id,
                org_name=org.name,
                affiliation_id=voter.affiliation_id,
                affiliation_name=aff.affiliation_name,
                affiliation_level=voter.affiliation_level,
                created_at=voter.created_at,
                updated_at=voter.updated_at,
            )
        )
    return result


@router.get("/{voter_id}", response_model=VoterRead)
def get_voter(voter_id: int, session: Session = Depends(get_session)):
    voter = session.get(Voter, voter_id)
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")

    user = session.get(User, voter.user_id)
    org = session.get(Organization, voter.org_id)
    aff = session.get(Affiliation, voter.affiliation_id)

    return VoterRead(
        voter_id=voter.voter_id,
        user_id=voter.user_id,
        username=user.username,
        full_name=user.full_name,
        org_id=voter.org_id,
        org_name=org.name,
        affiliation_id=voter.affiliation_id,
        affiliation_name=aff.affiliation_name,
        affiliation_level=voter.affiliation_level,
        created_at=voter.created_at,
        updated_at=voter.updated_at,
    )


@router.put("/{voter_id}", response_model=VoterRead)
def update_voter(
    voter_id: int, data: VoterUpdate, session: Session = Depends(get_session)
):
    voter = session.get(Voter, voter_id)
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")

    if data.affiliation_id is not None:
        voter.affiliation_id = data.affiliation_id
    if data.affiliation_level is not None:
        voter.affiliation_level = data.affiliation_level

    voter.updated_at = datetime.now(timezone.utc)

    try:
        session.add(voter)
        session.commit()
        session.refresh(voter)

        user = session.get(User, voter.user_id)
        org = session.get(Organization, voter.org_id)
        aff = session.get(Affiliation, voter.affiliation_id)

        return VoterRead(
            voter_id=voter.voter_id,
            user_id=voter.user_id,
            username=user.username,
            full_name=user.full_name,
            org_id=voter.org_id,
            org_name=org.name,
            affiliation_id=voter.affiliation_id,
            affiliation_name=aff.affiliation_name,
            affiliation_level=voter.affiliation_level,
            created_at=voter.created_at,
            updated_at=voter.updated_at,
        )
    except IntegrityError:
        session.rollback()
        raise HTTPException(
            status_code=400, detail="Foreign key constraint failed or duplicate voter"
        )


@router.delete("/{voter_id}")
def delete_voter(voter_id: int, session: Session = Depends(get_session)):
    voter = session.get(Voter, voter_id)
    if not voter:
        raise HTTPException(status_code=404, detail="Voter not found")

    session.delete(voter)
    session.commit()
    return {"message": "Voter deleted successfully"}
