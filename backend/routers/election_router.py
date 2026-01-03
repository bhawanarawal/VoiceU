from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from sqlalchemy import delete
from sqlalchemy.exc import IntegrityError
from datetime import datetime, timezone, timedelta
from typing import List, Optional
from database import get_session
from auth import get_current_active_user
from models.election import Election
from models.program import Program
from models.organization import Organization
from models.candidate import Candidate
from models.affiliation import Affiliation
from models.user import User
from models.position import Position
from models.election_position import ElectionPosition

from schemas.election_schema import (
    ElectionCreate,
    ElectionRead,
    ElectionListItem,
    ElectionDetail,
    ElectionStatus,
)


def compute_phase(start: datetime, end: datetime) -> ElectionStatus:
    now = datetime.now()
    if now < start:
        return ElectionStatus.upcoming
    elif start <= now <= end:
        return ElectionStatus.ongoing
    return ElectionStatus.past


router = APIRouter(prefix="/elections", tags=["Elections"])


@router.post("/", response_model=ElectionRead)
def create_election(
    data: ElectionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    program = session.get(Program, data.program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    election = Election(
        program_id=data.program_id,
        election_name=data.election_name,
        start_date=data.start_date,
        end_date=data.end_date,
        status=data.status.value,
        description=data.description,
        created_at=datetime.now(),
        updated_at=datetime.now(),
    )

    try:
        session.add(election)
        session.commit()
        session.refresh(election)

        for pid in data.position_ids or []:
            if pid:
                ep = ElectionPosition(election_id=election.election_id, position_id=pid)
                session.add(ep)
        session.commit()

        return election
    except IntegrityError:
        session.rollback()
        raise HTTPException(status_code=400, detail="Failed to create election")


@router.put("/{election_id}", response_model=ElectionRead)
def update_election(
    election_id: int,
    data: ElectionCreate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    election = session.get(Election, election_id)
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")

    program = session.get(Program, data.program_id)
    if not program:
        raise HTTPException(status_code=404, detail="Program not found")

    election.program_id = data.program_id
    election.election_name = data.election_name
    election.start_date = data.start_date
    election.end_date = data.end_date
    election.status = data.status.value
    election.description = data.description
    election.updated_at = datetime.now()

    session.add(election)

    stmt = delete(ElectionPosition).where(ElectionPosition.election_id == election_id)
    session.exec(stmt)

    for pid in data.position_ids or []:
        if pid:
            session.add(ElectionPosition(election_id=election_id, position_id=pid))

    session.commit()
    session.refresh(election)
    return election


@router.get("/", response_model=List[ElectionListItem])
def get_all_elections(session: Session = Depends(get_session)):
    query = (
        select(
            Election.election_id,
            Election.election_name,
            Program.program_name,
            Organization.name.label("organization_name"),
            Affiliation.affiliation_name,
            Election.start_date,
            Election.end_date,
            Election.status,
            Election.description,
            Election.created_at,
            Election.updated_at,
        )
        .join(Program, Program.program_id == Election.program_id)
        .join(Organization, Organization.org_id == Program.org_id)
        .join(Affiliation, Affiliation.affiliation_id == Organization.affiliation_id)
    )
    results = session.exec(query).all()

    elections: List[ElectionListItem] = []
    for r in results:
        positions = session.exec(
            select(Position.position_name)
            .join(
                ElectionPosition,
                Position.position_id == ElectionPosition.position_id,
            )
            .where(ElectionPosition.election_id == r.election_id)
        ).all()

        elections.append(
            ElectionListItem(
                election_id=r.election_id,
                election_name=r.election_name,
                start_date=r.start_date,
                end_date=r.end_date,
                status=compute_phase(r.start_date, r.end_date),
                description=r.description,
                program_name=r.program_name,
                organization_name=r.organization_name,
                affiliation_name=r.affiliation_name,
                positions=", ".join(positions) if positions else "",
                created_at=r.created_at,
                updated_at=r.updated_at,
            )
        )
    return elections


@router.get("/{election_id}", response_model=ElectionDetail)
def get_election(election_id: int, session: Session = Depends(get_session)):
    result = session.exec(
        select(
            Election.election_id,
            Election.election_name,
            Election.program_id,
            Program.org_id.label("organization_id"),
            Organization.name.label("organization_name"),
            Affiliation.affiliation_name,
            Election.start_date,
            Election.end_date,
            Election.status,
            Election.description,
            Election.created_at,
            Election.updated_at,
        )
        .join(Program, Program.program_id == Election.program_id)
        .join(Organization, Organization.org_id == Program.org_id)
        .join(Affiliation, Affiliation.affiliation_id == Organization.affiliation_id)
        .where(Election.election_id == election_id)
    ).first()

    if not result:
        raise HTTPException(status_code=404, detail="Election not found")

    positions = session.exec(
        select(Position.position_id, Position.position_name)
        .join(ElectionPosition, Position.position_id == ElectionPosition.position_id)
        .where(ElectionPosition.election_id == election_id)
    ).all()

    return {
        **dict(result._mapping),
        "status": compute_phase(result.start_date, result.end_date),
        "positions": [{"position_id": p[0], "position_name": p[1]} for p in positions],
    }


@router.get("/{election_id}/positions-with-count")
def get_positions_with_candidate_count(
    election_id: int, session: Session = Depends(get_session)
):

    election_positions = session.exec(
        select(ElectionPosition).where(ElectionPosition.election_id == election_id)
    ).all()

    if not election_positions:
        raise HTTPException(
            status_code=404, detail="No positions found for this election"
        )

    result = []

    for ep in election_positions:
        position = session.get(Position, ep.position_id)
        candidate_count = session.exec(
            select(Candidate)
            .where(Candidate.election_id == election_id)
            .where(Candidate.position_id == ep.position_id)
        ).count()

        result.append(
            {
                "position_id": position.position_id,
                "position_name": position.position_name,
                "candidate_count": candidate_count,
            }
        )

    return {"positions": result}


@router.delete("/{election_id}")
def delete_election(
    election_id: int,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_active_user),
):
    election = session.get(Election, election_id)
    if not election:
        raise HTTPException(status_code=404, detail="Election not found")

    stmt = delete(ElectionPosition).where(ElectionPosition.election_id == election_id)
    session.exec(stmt)

    session.delete(election)
    session.commit()

    return {"message": "Election and related positions deleted successfully"}


@router.get("/{election_id}/positions")
def get_election_positions(election_id: int, session: Session = Depends(get_session)):
    all_positions = session.exec(select(Position)).all()
    selected = session.exec(
        select(ElectionPosition.position_id).where(
            ElectionPosition.election_id == election_id
        )
    ).all()
    return {"all_positions": all_positions, "selected_ids": [s[0] for s in selected]}
