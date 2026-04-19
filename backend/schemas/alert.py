"""
Pydantic schemas for Alert request/response validation.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class AlertCreate(BaseModel):
    """Schema for creating a new operational alert."""
    type: str           # proximity | emergency | low-fuel
    message: str
    flight_ref: Optional[str] = None


class AlertResponse(BaseModel):
    """Schema for returning alert data in API responses."""
    id: int
    type: str
    message: str
    flight_ref: Optional[str] = None
    resolved: bool
    created_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AlertResolveRequest(BaseModel):
    """Schema for resolving an alert with an action description."""
    action: str         # e.g. 'Reroute Flight 1', 'Assign Priority Runway'
