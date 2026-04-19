"""
User model representing the users table in Supabase.
"""
from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class User:
    """Represents a registered ATC controller."""
    id: str
    email: str
    name: Optional[str] = None
    badge_id: Optional[str] = None
    role: str = "controller"
    zone: Optional[str] = None
    shift: Optional[str] = None
    created_at: Optional[datetime] = None
