from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, ForeignKey, LargeBinary
from sqlalchemy.dialects.mysql import TEXT
from app.database import Base
import uuid


class User(Base):
    __tablename__ = "users"

    user_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    user_id_field = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    profile_picture_base64 = Column(TEXT, nullable=True)
    is_verified = Column(Boolean, default=False, nullable=False)
    is_locked = Column(Boolean, default=False, nullable=False)
    locked_until = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def __repr__(self):
        return f"<User {self.user_id_field}>"


class LoginAttempt(Base):
    __tablename__ = "login_attempts"

    attempt_id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False, index=True)
    attempt_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    success = Column(Boolean, nullable=False)
    ip_address = Column(String(50), nullable=True)

    def __repr__(self):
        return f"<LoginAttempt {self.user_id} - {self.success}>"


class EmailVerification(Base):
    __tablename__ = "email_verifications"

    verification_id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.user_id"), nullable=False, index=True)
    token = Column(String(255), unique=True, nullable=False, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)

    def __repr__(self):
        return f"<EmailVerification {self.user_id}>"
