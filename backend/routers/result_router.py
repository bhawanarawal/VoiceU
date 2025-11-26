from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select
from models.result import Result
from schemas.result_schema import ResultRead
from database import get_session

router = APIRouter(prefix="/results", tags=["Results"])


@router.get("/", response_model=list[ResultRead])
def get_all_results(session: Session = Depends(get_session)):
    """Get all results"""
    return session.exec(select(Result)).all()


@router.get("/{result_id}", response_model=ResultRead)
def get_result(result_id: int, session: Session = Depends(get_session)):
    """Get result by ID"""
    result = session.get(Result, result_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result
