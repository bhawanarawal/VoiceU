from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select, func
from models.vote import Vote
from models.result import Result
from schemas.result_schema import ResultRead
from database import get_session

router = APIRouter(prefix="/results", tags=["Results"])


# Calculate and update results for an election
@router.post("/calculate/{election_id}", response_model=list[ResultRead])
def calculate_results(election_id: int, session: Session = Depends(get_session)):

    # 1️⃣ Aggregate votes per candidate
    statement = (
        select(Vote.candidate_id, func.count(Vote.vote_id).label("total_votes"))
        .where(Vote.election_id == election_id)
        .group_by(Vote.candidate_id)
    )

    vote_counts = session.exec(statement).all()
    if not vote_counts:
        raise HTTPException(status_code=404, detail="No votes found for this election")

    # 2️⃣ Determine max votes for winner_flag
    max_votes = max(vc.total_votes for vc in vote_counts)

    results_list = []
    for vc in vote_counts:
        winner_flag = vc.total_votes == max_votes

        # Check if result already exists
        existing_result = session.exec(
            select(Result).where(
                (Result.candidate_id == vc.candidate_id)
                & (Result.election_id == election_id)
            )
        ).first()

        if existing_result:
            existing_result.total_votes = vc.total_votes
            existing_result.winner_flag = winner_flag
            session.add(existing_result)
            results_list.append(existing_result)
        else:
            # Create new result
            result = Result(
                candidate_id=vc.candidate_id,
                election_id=election_id,
                total_votes=vc.total_votes,
                winner_flag=winner_flag,
            )
            session.add(result)
            results_list.append(result)

    session.commit()
    for r in results_list:
        session.refresh(r)

    return results_list


# Get all results
@router.get("/", response_model=list[ResultRead])
def get_all_results(session: Session = Depends(get_session)):
    return session.exec(select(Result)).all()


# Get result by ID
@router.get("/{result_id}", response_model=ResultRead)
def get_result(result_id: int, session: Session = Depends(get_session)):
    result = session.get(Result, result_id)
    if not result:
        raise HTTPException(status_code=404, detail="Result not found")
    return result


# Get results for a specific election
@router.get("/election/{election_id}", response_model=list[ResultRead])
def get_results_by_election(election_id: int, session: Session = Depends(get_session)):
    results = session.exec(
        select(Result).where(Result.election_id == election_id)
    ).all()
    if not results:
        raise HTTPException(
            status_code=404, detail="No results found for this election"
        )
    return results
