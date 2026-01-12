from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from models.position import Position
from schemas.position_schema import PositionCreate, PositionRead, PositionUpdate
from database import get_session

router = APIRouter(prefix="/positions", tags=["Positions"])


@router.post("/", response_model=PositionRead)
def create_position(pos: PositionCreate, session: Session = Depends(get_session)):
    db_pos = Position.model_validate(pos)
    session.add(db_pos)
    session.commit()
    session.refresh(db_pos)
    return db_pos


@router.get("/", response_model=list[PositionRead])
def read_positions(session: Session = Depends(get_session)):
    return session.exec(select(Position)).all()


@router.get("/{position_id}", response_model=PositionRead)
def get_position(position_id: int, session: Session = Depends(get_session)):
    pos = session.get(Position, position_id)
    if not pos:
        raise HTTPException(status_code=404, detail="Position not found")
    return pos


@router.put("/{position_id}", response_model=PositionRead)
def update_position(
    position_id: int,
    updated_position: PositionUpdate,
    session: Session = Depends(get_session),
):
    position = session.get(Position, position_id)
    if not position:
        raise HTTPException(status_code=404, detail="Position not found")

    if updated_position.position_name is not None:
        position.position_name = updated_position.position_name
    if updated_position.description is not None:
        position.description = updated_position.description
    if updated_position.max_candidates is not None:
        position.max_candidates = updated_position.max_candidates

    session.add(position)
    session.commit()
    session.refresh(position)
    return position


@router.delete("/{position_id}")
def delete_position(position_id: int, session: Session = Depends(get_session)):
    pos = session.get(Position, position_id)
    if not pos:
        raise HTTPException(status_code=404, detail="Position not found")

    session.delete(pos)
    session.commit()
    return {"message": "Position deleted successfully"}
