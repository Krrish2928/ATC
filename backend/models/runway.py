"""
Runway model representing the runways table in Supabase.
"""
from dataclasses import dataclass, field
from typing import Optional, List, Any
from datetime import datetime


@dataclass
class Runway:
    """Represents a physical runway at an airport."""
    id: int
    airport_name: str
    runway_id: str
    status: str = "active"           # active | busy | maintenance | closed
    assigned_flight: Optional[str] = None
    queue: List[Any] = field(default_factory=list)
    updated_at: Optional[datetime] = None
