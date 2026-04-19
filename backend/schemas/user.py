"""
Pydantic schemas for User request/response validation.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for creating a new user."""
    email: EmailStr
    name: Optional[str] = None
    badge_id: Optional[str] = None
    role: str = "controller"
    zone: Optional[str] = None
    shift: Optional[str] = None


class UserUpdate(BaseModel):
    """Schema for updating an existing user profile."""
    name: Optional[str] = None
    badge_id: Optional[str] = None
    role: Optional[str] = None
    zone: Optional[str] = None
    shift: Optional[str] = None


class UserResponse(BaseModel):
    """Schema for returning user data in API responses."""
    id: str
    email: str
    name: Optional[str] = None
    badge_id: Optional[str] = None
    role: str
    zone: Optional[str] = None
    shift: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class TokenVerifyRequest(BaseModel):
    """Schema for Firebase token verification requests."""
    firebase_token: str
