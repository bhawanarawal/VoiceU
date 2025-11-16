from fastapi import FastAPI
from database import create_db_and_tables
from routers.organization_router import router as organization_router
from routers.position_router import router as position_router

app = FastAPI()

@app.on_event("startup")
def on_startup():
    create_db_and_tables()

app.include_router(organization_router)
app.include_router(position_router)

