from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from sqlmodel import Session
import models
from database import create_db_and_tables, get_session
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from routers.organization_router import router as organization_router
from routers.position_router import router as position_router
from routers.election_router import router as election_router
from routers.candidate_router import router as candidate_router
from routers.voter_router import router as voter_router
from routers.vote_router import router as vote_router
from routers.result_router import router as result_router
from routers.auth_router import router as auth_router
from routers.group_router import router as group_router
from routers.voter_election_router import router as voter_election_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan, title="VoiceU API")

origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static", StaticFiles(directory="static"), name="static")

app.include_router(organization_router)
app.include_router(position_router)
app.include_router(election_router)
app.include_router(candidate_router)
app.include_router(voter_router)
app.include_router(vote_router)
app.include_router(result_router)
app.include_router(auth_router)
app.include_router(group_router)
app.include_router(voter_election_router)


@app.get("/")
def root():
    return {"message": "Welcome to the VoiceU!"}
