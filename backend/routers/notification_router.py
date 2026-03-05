from fastapi import FastAPI, Depends,APIRouter,HTTPException;
from database import get_session
from sqlmodel import Session, select
from models.notification import Notification
from models.user import User
from typing import List
from auth import require_roles
from schemas.notification_schema import NotificationRead
from models.candidate import Candidate
from models.voter import Voter

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("/", response_model=List[NotificationRead])
def get_admin_notification(
        session: Session=Depends(get_session),
        current_user:User = Depends(require_roles(["admin", "superadmin"]))

   ):
       statement = select(Notification).order_by(Notification.created_at.desc())
       results = session.exec(statement).all()

       return results


@router.post("/{notification_id}/read")
def mark_as_read(
      notification_id:int,
      session:Session=Depends(get_session),
      current_user: User = Depends(require_roles(["admin"]))


   ):
        notif = session.get(Notification,notification_id)
        if not notif :
         raise HTTPException(status_code=404, detail="notification not found")
     
        notif.is_read=True
        session.add(notif)
        session.commit()
        session.refresh(notif)
        return {"message":"mark as read"}










    
    