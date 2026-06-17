from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.models.user import User


DEMO_USER_EMAIL = "ahmedsaber@example.com"
DEMO_USER_PASSWORD = "SecurePassword123!"
DEMO_USER_NAME = "Ahmed Saber"


def ensure_demo_user(db: Session) -> None:
    existing = db.query(User).filter(User.email == DEMO_USER_EMAIL).first()
    if existing:
        return

    user = User(
        name=DEMO_USER_NAME,
        email=DEMO_USER_EMAIL,
        hashed_password=hash_password(DEMO_USER_PASSWORD),
    )
    db.add(user)
    db.commit()
