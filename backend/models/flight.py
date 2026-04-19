"""
Flight model representing the flights table in Supabase.
"""
from dataclasses import dataclass, field
from typing import Optional
from datetime import datetime


@dataclass
class Flight:
    """Represents an active flight in the simulation."""
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
    status: str = "normal"          # normal | low-fuel | emergency
    fuel_level: int = 80
    updated_at: Optional[datetime] = None
