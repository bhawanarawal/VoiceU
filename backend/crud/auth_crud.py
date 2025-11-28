from sqlmodel import Session, select
from passlib.context import CryptContext
from models.user import User
from models.role import Role
from schemas.user_schema import UserCreate

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def get_user_by_username(db: Session, username: str):
    return db.exec(select(User).where(User.username == username)).first()

def get_user_by_email(db: Session, email: str):
    return db.exec(select(User).where(User.email == email)).first()

def create_user(db: Session, user: UserCreate):
    hashed_password = pwd_context.hash(user.password)
    db_user = User(
        username=user.email,
        email=user.email,
        full_name=user.full_name,
        hashed_password=hashed_password
    )
    default_role = db.exec(select(Role).where(Role.name == "user")).first()
    if default_role:
        db_user.roles.append(default_role)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, username: str, password: str):
    user = get_user_by_username(db, username)
    if not user or not pwd_context.verify(password, user.hashed_password):
        return False
    return user

def create_role(db: Session, name: str, description: str = ""):
    """Create a new role."""
    db_role = Role(name=name, description=description)
    db.add(db_role)
    db.commit()
    db.refresh(db_role)
    return db_role

def get_role_by_name(db: Session, name: str):
    return db.exec(select(Role).where(Role.name == name)).first()
