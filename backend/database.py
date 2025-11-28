
from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.engine import Engine
from sqlalchemy import event
from crud.auth_crud import get_role_by_name, create_role 

sqlite_file_name = "voiceU.db"  
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)

@event.listens_for(Engine, "connect")
def enable_foreign_keys(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=ON;")
    cursor.close()

def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    init_db()


def get_session():
    with Session(engine) as session:
        yield session

def init_db():
    db =  Session(engine)

    # Create roles if they don't exist
    if not get_role_by_name(db, "user"):
        create_role(db, "user", "Regular user")

    if not get_role_by_name(db, "admin"):
        create_role(db, "admin", "Administrator")

    if not get_role_by_name(db, "voter"):
        create_role(db, "voter", "voter")

    db.close()
    print("Database initialized successfully!")
