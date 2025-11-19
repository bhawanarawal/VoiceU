from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from models.position import Position
from schemas.position_schema import PositionCreate, PositionRead
from database import get_session

router = APIRouter(prefix="/positions", tags=["Positions"])

# Create
@router.post("/", response_model=PositionRead)
def create_position(pos: PositionCreate, session: Session = Depends(get_session)):
    db_pos = Position.model_validate(pos)
    session.add(db_pos)
    session.commit()
    session.refresh(db_pos)
    return db_pos

# Read all
@router.get("/", response_model=list[PositionRead])
def read_positions(session: Session = Depends(get_session)):
    return session.exec(select(Position)).all()

# Read single
@router.get("/{position_id}", response_model=PositionRead)
def get_position(position_id: int, session: Session = Depends(get_session)):
    pos = session.get(Position, position_id)
    if not pos:
        raise HTTPException(status_code=404, detail="Position not found")
    return pos

# Update
@router.put("/{position_id}", response_model=PositionRead)
def update_position(position_id: int, updated_pos: PositionCreate, session: Session = Depends(get_session)):
    pos = session.get(Position, position_id)
    if not pos:
        raise HTTPException(status_code=404, detail="Position not found")

    pos.position_name = updated_pos.position_name
    pos.description = updated_pos.description
    pos.max_candidates = updated_pos.max_candidates

    session.add(pos)
    session.commit()
    session.refresh(pos)
    return pos

# Delete
@router.delete("/{position_id}")
def delete_position(position_id: int, session: Session = Depends(get_session)):
    pos = session.get(Position, position_id)
    if not pos:
        raise HTTPException(status_code=404, detail="Position not found")

    session.delete(pos)
    session.commit()
    return {"message": "Position deleted successfully"}
