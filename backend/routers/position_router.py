from fastapi import APIRouter, Depends
from sqlmodel import Session, select
from models.position import Position
from database import get_session

router = APIRouter(prefix="/positions", tags=["Positions"])

@router.post("/")
def create_position(position: Position, session: Session = Depends(get_session)):
    session.add(position)
    session.commit()
    session.refresh(position)
    return position


@router.get("/")
def read_positions(session: Session = Depends(get_session)):
    return session.exec(select(Position)).all()


@router.get("/{position_id}")
def get_position(position_id: int, session: Session = Depends(get_session)):
    position = session.get(Position, position_id)
    if not position:
        return "Position not found"
    return position


@router.put("/{position_id}")
def update_position(position_id: int, updated_position: Position, session: Session = Depends(get_session)):
    position = session.get(Position, position_id)
    if not position:
        return "Position not found"
    
    position.position_name = updated_position.position_name
    position.description = updated_position.description
    position.max_candidates = updated_position.max_candidates
    session.add(position)
    session.commit()
    session.refresh(position)
    return position


@router.delete("/{position_id}")
def delete_position(position_id: int, session: Session = Depends(get_session)):
    position = session.get(Position, position_id)
    if not position:
        return "Position not found"

    session.delete(position)
    session.commit()
    return "Position deleted successfully"
