from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session, select
from database import get_session
from crud.auth_crud import (
    get_user_by_email,
    create_user,
    authenticate_user,
    get_all_users,
    create_role,
    get_role_by_name,
    get_all_roles,
)
from models.user import User
from models.voter_group import VoterGroup
from sqlmodel import select
from models.role import Role
from schemas.user_schema import UserCreate, UserRead
from schemas.role_schema import RoleCreate, AssignRole, RoleRead
from auth import (
    create_access_token,
    get_current_active_user,
    require_roles,
    ACCESS_TOKEN_EXPIRE_MINUTES,
)
from datetime import timedelta
from typing import List


from models.voter import Voter

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserRead)
def register_user(user: UserCreate, db: Session = Depends(get_session)):
    if get_user_by_email(db, user.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    db_user = create_user(db, user)
    return UserRead(
        user_id=db_user.user_id,
        username=db_user.username,
        email=db_user.email,
        full_name=db_user.full_name,
        roles=[role.name for role in db_user.roles],
    )


@router.get("/users", response_model=List[UserRead])
def read_all_users(
    db: Session = Depends(get_session),
    current_user: User = Depends(require_roles(["admin", "superadmin"])),
):
    users = get_all_users(db)
    return [
        UserRead(
            user_id=user.user_id,
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            roles=[role.name for role in user.roles],
        )
        for user in users
    ]


@router.post("/token")
def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_session)
):
    user = authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}


@router.post("/roles", response_model=RoleRead)
def add_role(
    role: RoleCreate,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_roles(["superadmin"])),
):
    existing_role = get_role_by_name(db, role.name)
    if existing_role:
        raise HTTPException(status_code=400, detail="Role already exists")
    new_role = create_role(db, role.name)
    return RoleRead(role_id=new_role.role_id, name=new_role.name)


@router.get("/roles", response_model=List[RoleRead])
def read_all_roles(
    db: Session = Depends(get_session),
    current_user: User = Depends(require_roles(["admin", "superadmin"])),
):
    roles = get_all_roles(db)
    return [RoleRead(role_id=role.role_id, name=role.name) for role in roles]


@router.post("/assign-role")
def assign_roles(
    assign: AssignRole,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_roles(["superadmin"])),
):
    user = db.get(User, assign.user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user.roles = []

    for role_name in assign.role_names:
        role = get_role_by_name(db, role_name)
        if not role:
            raise HTTPException(status_code=404, detail=f"Role '{role_name}' not found")
        user.roles.append(role)

    db.add(user)
    db.commit()
    db.refresh(user)

    return {
        "message": "Roles updated successfully",
        "roles": [r.name for r in user.roles],
    }


@router.delete("/roles/{role_id}", status_code=204)
def delete_role(
    role_id: int,
    db: Session = Depends(get_session),
    current_user: User = Depends(require_roles(["superadmin"])),
):
    role = db.get(Role, role_id)
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")
    db.delete(role)
    db.commit()
    return {"detail": f"Role '{role.name}' deleted successfully."}


@router.get("/users/me")
def read_users_me(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_session),
):
    voter = db.exec(select(Voter).where(Voter.user_id == current_user.user_id)).first()

    voter_groups = []
    if voter:
        groups = db.exec(
            select(VoterGroup).where(VoterGroup.voter_id == voter.voter_id)
        ).all()
        voter_groups = [{"group_id": vg.group_id, "status": vg.status} for vg in groups]

    user_data = {
        "user_id": current_user.user_id,
        "username": current_user.username,
        "email": current_user.email,
        "full_name": current_user.full_name,
        "roles": [role.name for role in current_user.roles],
        "org_id": voter.org_id if voter else None,
        "groups": voter_groups,
    }
    return user_data
