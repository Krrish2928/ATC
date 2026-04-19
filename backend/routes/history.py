"""
History routes for managing per-user flight tracking history.
"""
import asyncio
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from database import get_supabase

router = APIRouter(prefix="/history", tags=["Tracking History"])

# Helper: run a blocking Supabase call in a thread with a timeout
async def _run_query(fn, timeout: float = 5.0):
    loop = asyncio.get_event_loop()
    return await asyncio.wait_for(
        loop.run_in_executor(None, fn),
        timeout=timeout
    )


class HistoryCreate(BaseModel):
    """Schema for adding an item to tracking history."""
    user_id: str
    flight_number: str
    airline: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    status: Optional[str] = None


class HistoryResponse(BaseModel):
    """Schema for returning a history entry."""
    id: int
    user_id: str
    flight_number: str
    airline: Optional[str] = None
    origin: Optional[str] = None
    destination: Optional[str] = None
    lat: Optional[float] = None
    lng: Optional[float] = None
    status: Optional[str] = None
    searched_at: Optional[datetime] = None


@router.get("/guest", response_model=List[HistoryResponse])
async def get_guest_history():
    """Returns an empty history list for unauthenticated guests."""
    return []


@router.get("/{user_id}", response_model=List[HistoryResponse])
async def get_user_history(user_id: str):
    """
    Returns the last 8 flight tracking history items for a specific user,
    sorted by most recent first.
    """
    try:
        db = get_supabase()
        result = await _run_query(lambda: (
            db.table("tracking_history")
            .select("*")
            .eq("user_id", user_id)
            .order("searched_at", desc=True)
            .limit(8)
            .execute()
        ))
        return result.data or []
    except Exception as e:
        print(f"History fetch error for user {user_id}: {e}")
        return []


@router.post("/", response_model=HistoryResponse, status_code=201)
async def add_history_item(payload: HistoryCreate):
    """
    Adds a flight to the user's tracking history.
    Enforces a max of 8 items — removes oldest if limit exceeded.
    """
    try:
        db = get_supabase()

        # Enforce max 8 items per user
        existing = await _run_query(lambda: (
            db.table("tracking_history")
            .select("id, searched_at")
            .eq("user_id", payload.user_id)
            .order("searched_at", desc=True)
            .execute()
        ))
        if existing.data and len(existing.data) >= 8:
            oldest_id = existing.data[-1]["id"]
            await _run_query(lambda: db.table("tracking_history").delete().eq("id", oldest_id).execute())
    except Exception as e:
        print(f"History management error for user {payload.user_id}: {e}")
        # Non-fatal for management, but we'll try to insert anyway

    record = {
        "user_id": payload.user_id,
        "flight_number": payload.flight_number,
        "airline": payload.airline,
        "origin": payload.origin,
        "destination": payload.destination,
        "lat": payload.lat,
        "lng": payload.lng,
        "status": payload.status,
        "searched_at": datetime.utcnow().isoformat(),
    }

    try:
        db = get_supabase()
        result = await _run_query(lambda: db.table("tracking_history").insert(record).execute())
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to save tracking history.")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        print(f"History insert error: {e}")
        raise HTTPException(status_code=503, detail="Database unavailable. Could not save history.")


@router.delete("/{user_id}", status_code=204)
async def clear_user_history(user_id: str):
    """
    Clears all tracking history entries for a given user.
    """
    try:
        db = get_supabase()
        await _run_query(lambda: db.table("tracking_history").delete().eq("user_id", user_id).execute())
    except Exception as e:
        print(f"History clear error for user {user_id}: {e}")
        raise HTTPException(status_code=503, detail="Database unavailable. Could not clear history.")
