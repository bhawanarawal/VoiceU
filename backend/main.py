from contextlib import asynccontextmanager
from fastapi import FastAPI
from database import create_db_and_tables
from routers.organization_router import router as organization_router
from routers.position_router import router as position_router
from routers.affiliation_router import router as affiliation_router
from routers.election_router import router as election_router
from routers.candidate_router import router as candidate_router
from routers.voter_router import router as voter_router
from routers.vote_router import router as vote_router
from routers.result_router import router as result_router




@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield
    

app = FastAPI(lifespan=lifespan, title="VoiceU Api")


app.include_router(organization_router)
app.include_router(position_router)
app.include_router(affiliation_router)
app.include_router(election_router)
app.include_router(candidate_router)
app.include_router(voter_router)
app.include_router(vote_router)
app.include_router(result_router)


@app.get("/")
def root():
    return {"message": "Welcome to the VoiceU!"}