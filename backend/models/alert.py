"""
Alert model representing the alerts table in Supabase.
"""
from dataclasses import dataclass
from typing import Optional
from datetime import datetime


@dataclass
class Alert:
    """Represents an operational alert in the ATC system."""
    id: int
    type: str                        # proximity | emergency | low-fuel
    message: str
    flight_ref: Optional[str] = None
    resolved: bool = False
    created_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
