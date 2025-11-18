from contextlib import asynccontextmanager
from fastapi import FastAPI
from database import create_db_and_tables
from routers.organization_router import router as organization_router
from routers.position_router import router as position_router
from routers.affiliation_router import router as affiliation_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    create_db_and_tables()
    yield
    

app = FastAPI(lifespan=lifespan, title="VoiceU Api")


app.include_router(organization_router)
app.include_router(position_router)
app.include_router(affiliation_router)


@app.get("/")
def root():
    return {"message": "Welcome to the VoiceU!"}