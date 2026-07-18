from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas import SignUpSchema, LoginSchema, UserResponseSchema, TokenResponseSchema, VerificationResponseSchema
from app.models import User, EmailVerification
from app.utils.security import hash_password, verify_password, create_access_token, create_refresh_token, validate_password_strength
from app.utils.lockout import check_login_attempts, increment_failed_attempts, record_successful_login
from app.utils.email import send_verification_email
from app.config import VERIFICATION_TOKEN_EXPIRE_MINUTES, FRONTEND_URL
from datetime import datetime, timedelta
import uuid
import secrets

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/signup", response_model=VerificationResponseSchema)
async def signup(data: SignUpSchema, db: Session = Depends(get_db)):
    """
    Register a new user. Sends verification email.
    """
    # Validate password strength
    is_valid, message = validate_password_strength(data.password)
    if not is_valid:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=message)

    # Check if user_id already exists
    existing_user = db.query(User).filter(User.user_id_field == data.user_id).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User ID already exists"
        )

    # Check if email already exists
    existing_email = db.query(User).filter(User.email == data.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    new_user = User(
        first_name=data.first_name,
        last_name=data.last_name,
        user_id_field=data.user_id,
        email=data.email,
        password_hash=hash_password(data.password),
        profile_picture_base64=data.profile_picture_base64,
        is_verified=False
    )
    db.add(new_user)
    db.flush()  # Get the user_id

    # Create verification token
    verification_token = secrets.token_urlsafe(32)
    token_expiry = datetime.utcnow() + timedelta(minutes=VERIFICATION_TOKEN_EXPIRE_MINUTES)

    email_verification = EmailVerification(
        user_id=new_user.user_id,
        token=verification_token,
        expires_at=token_expiry
    )
    db.add(email_verification)
    db.commit()

    # Send verification email
    verification_link = f"{FRONTEND_URL}/verify-email?token={verification_token}"
    success = await send_verification_email(data.email, verification_link)

    if not success:
        # Delete the user and verification token if email send failed
        db.delete(email_verification)
        db.delete(new_user)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to send verification email. Please try again."
        )

    return {
        "status": "verification_sent",
        "message": "Verification email sent. Please check your email.",
        "email": data.email
    }


@router.post("/verify-email/{token}", response_model=VerificationResponseSchema)
async def verify_email(token: str, db: Session = Depends(get_db)):
    """
    Verify user email using verification token.
    """
    print(f"DEBUG: Verify email called with token: {token[:20]}...")

    # Find verification token
    verification = db.query(EmailVerification).filter(
        EmailVerification.token == token
    ).first()

    if not verification:
        print(f"DEBUG: Token not found in database")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid verification token"
        )

    print(f"DEBUG: Token found. is_used={verification.is_used}, expires_at={verification.expires_at}")

    # Check if token is expired
    if datetime.utcnow() > verification.expires_at:
        print(f"DEBUG: Token expired")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has expired"
        )

    # Check if token was already used
    if verification.is_used:
        # Token already used - check if user is verified
        user = db.query(User).filter(User.user_id == verification.user_id).first()
        if user and user.is_verified:
            print(f"DEBUG: Token already used but user already verified - returning success")
            return {
                "status": "verified",
                "message": "Email verified successfully. You can now log in."
            }
        print(f"DEBUG: Token already used")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Verification token has already been used"
        )

    # Mark user as verified
    user = db.query(User).filter(User.user_id == verification.user_id).first()
    print(f"DEBUG: Marking user {user.user_id_field} as verified")
    user.is_verified = True
    verification.is_used = True
    db.commit()

    print(f"DEBUG: Verification successful")
    return {
        "status": "verified",
        "message": "Email verified successfully. You can now log in."
    }


@router.post("/login", response_model=TokenResponseSchema)
async def login(data: LoginSchema, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT tokens.
    Implements 3-strike lockout on failed attempts.
    """
    # Find user by user_id or email
    user = db.query(User).filter(
        (User.user_id_field == data.user_id) | (User.email == data.user_id)
    ).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Check if user is locked due to failed attempts
    is_locked, lock_message = check_login_attempts(db, user.user_id)
    if is_locked:
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=lock_message
        )

    # Check if email is verified
    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Email not verified. Please check your email for verification link."
        )

    # Verify password
    if not verify_password(data.password, user.password_hash):
        increment_failed_attempts(db, user.user_id)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Record successful login
    record_successful_login(db, user.user_id)

    # Create tokens
    access_token = create_access_token({"sub": user.user_id, "email": user.email})
    refresh_token = create_refresh_token({"sub": user.user_id})

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_id": user.user_id,
        "email": user.email
    }


@router.post("/logout")
async def logout():
    """
    Logout endpoint (token is invalidated on client side by clearing localStorage).
    """
    return {"message": "Logged out successfully"}


@router.get("/me", response_model=UserResponseSchema)
async def get_current_user(db: Session = Depends(get_db), token: str = None):
    """
    Get current logged-in user profile.
    Note: In production, implement proper JWT validation as middleware.
    """
    from fastapi import Header
    from app.utils.security import verify_token

    # Get token from Authorization header
    auth_header = Header(None)
    if not auth_header and token:
        auth_header = token

    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated"
        )

    # Extract token from "Bearer <token>"
    try:
        if isinstance(auth_header, str) and auth_header.startswith("Bearer "):
            token_str = auth_header[7:]
        else:
            token_str = auth_header
    except:
        token_str = auth_header

    # Verify token
    payload = verify_token(token_str)
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user_id = payload.get("sub")
    user = db.query(User).filter(User.user_id == user_id).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user
