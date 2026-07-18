from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import User, LoginAttempt
from app.config import LOCKOUT_DURATION_MINUTES


def check_login_attempts(db: Session, user_id: str) -> tuple[bool, str]:
    """
    Check if user account is locked due to failed login attempts.
    Returns (is_locked, message)
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return False, ""

    # Check if user is locked
    if user.is_locked:
        if user.locked_until and datetime.utcnow() < user.locked_until:
            wait_minutes = int((user.locked_until - datetime.utcnow()).total_seconds() / 60)
            return True, f"Account locked. Please try again in {wait_minutes} minutes"
        else:
            # Lock period has expired, unlock the user
            user.is_locked = False
            user.locked_until = None
            db.commit()
            return False, ""

    return False, ""


def increment_failed_attempts(db: Session, user_id: str, ip_address: str = None) -> None:
    """
    Increment failed login attempts and lock account if threshold reached (3 attempts).
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if not user:
        return

    # Record the failed attempt
    failed_attempt = LoginAttempt(
        user_id=user_id,
        success=False,
        ip_address=ip_address
    )
    db.add(failed_attempt)

    # Count failed attempts in the last 30 minutes
    thirty_min_ago = datetime.utcnow() - timedelta(minutes=30)
    recent_failures = db.query(LoginAttempt).filter(
        LoginAttempt.user_id == user_id,
        LoginAttempt.success == False,
        LoginAttempt.attempt_timestamp >= thirty_min_ago
    ).count()

    # If 3 or more failures, lock the account
    if recent_failures >= 3:
        user.is_locked = True
        user.locked_until = datetime.utcnow() + timedelta(minutes=LOCKOUT_DURATION_MINUTES)
        db.commit()
    else:
        db.commit()


def record_successful_login(db: Session, user_id: str, ip_address: str = None) -> None:
    """
    Record successful login and reset failed attempt counter.
    """
    # Record the successful attempt
    successful_attempt = LoginAttempt(
        user_id=user_id,
        success=True,
        ip_address=ip_address
    )
    db.add(successful_attempt)

    # Reset lock if it exists
    user = db.query(User).filter(User.user_id == user_id).first()
    if user and user.is_locked:
        user.is_locked = False
        user.locked_until = None

    db.commit()


def unlock_user_manually(db: Session, user_id: str) -> bool:
    """
    Manually unlock a user account (for admin purposes).
    """
    user = db.query(User).filter(User.user_id == user_id).first()
    if user:
        user.is_locked = False
        user.locked_until = None
        db.commit()
        return True
    return False
