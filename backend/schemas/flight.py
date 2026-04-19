"""
Pydantic schemas for Flight request/response validation.
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class Flight(BaseModel):
    """Schema for returning flight data in API responses."""
    id: int
    flight_number: str
    airline: str
    origin: str
    destination: str
    lat: float
    lng: float
    altitude: int
    speed: int
    heading: int
    status: str
    fuel_level: int
    updated_at: str
    
    # New airport fields
    origin_name: Optional[str] = None
    origin_city: Optional[str] = None
    origin_lat: Optional[float] = None
    origin_lng: Optional[float] = None
    dest_name: Optional[str] = None
    dest_city: Optional[str] = None
    dest_lat: Optional[float] = None
    dest_lng: Optional[float] = None

    class Config:
        from_attributes = True


class FlightStatusUpdate(BaseModel):
    """Schema for updating a flight's operational status."""
    status: str     # normal | low-fuel | emergency


class FlightCreate(BaseModel):
    """Schema for creating a new flight entry."""
    flight_number: str
    airline: str
    origin: str
    destination: str
    lat: float
    lng: float
    altitude: int
    speed: int
    heading: int
    status: str = "normal"
    fuel_level: int = 80
