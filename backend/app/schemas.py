from pydantic import BaseModel, EmailStr, Field, field_validator
from datetime import datetime
from typing import Optional


class SignUpSchema(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    user_id: str = Field(..., min_length=3, max_length=50, pattern="^[a-zA-Z0-9_-]+$")
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    confirm_password: str = Field(..., min_length=8, max_length=128)
    profile_picture_base64: Optional[str] = None

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v):
        """Validate password has uppercase, number, and special char"""
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        if not any(c in "!@#$%^&*()_+-=[]{}|;:,.<>?" for c in v):
            raise ValueError("Password must contain at least one special character")
        return v

    @field_validator("confirm_password")
    @classmethod
    def validate_confirm_password(cls, v, info):
        """Ensure passwords match"""
        if "password" in info.data and v != info.data["password"]:
            raise ValueError("Passwords do not match")
        return v


class LoginSchema(BaseModel):
    user_id: str = Field(..., min_length=1, max_length=255)  # Can be user_id or email
    password: str = Field(..., min_length=1, max_length=128)


class UserResponseSchema(BaseModel):
    user_id: str
    first_name: str
    last_name: str
    user_id_field: str
    email: str
    profile_picture_base64: Optional[str]
    is_verified: bool
    is_locked: bool
    created_at: datetime

    class Config:
        from_attributes = True


class TokenResponseSchema(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    email: str


class VerificationResponseSchema(BaseModel):
    status: str
    message: str
    email: Optional[str] = None


class ErrorResponseSchema(BaseModel):
    detail: str
    error_code: Optional[str] = None
