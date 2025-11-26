from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy.engine import Engine
from sqlalchemy import event

sqlite_file_name = "voiceU.db"  
sqlite_url = f"sqlite:///{sqlite_file_name}"

engine = create_engine(sqlite_url, echo=True)

@event.listens_for(Engine, "connect")
def disable_foreign_keys(dbapi_connection, connection_record):
    cursor = dbapi_connection.cursor()
    cursor.execute("PRAGMA foreign_keys=OFF;")
    cursor.close()

def create_db_and_tables():
    from models.affiliation import Affiliation
    from models.organization import Organization
    from models.position import Position
    from models.election import Election
    from models.candidate import Candidate
    from models.voter import Voter
    from models.vote import Vote
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
