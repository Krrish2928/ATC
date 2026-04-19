"""
Runway routes for managing runway assignments, queues, and clearances.
"""
import asyncio
from fastapi import APIRouter, HTTPException
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
import json

from database import get_supabase

router = APIRouter(prefix="/runways", tags=["Runways"])

# Helper: run a blocking Supabase call in a thread with a timeout
async def _run_query(fn, timeout: float = 5.0):
    loop = asyncio.get_event_loop()
    return await asyncio.wait_for(
        loop.run_in_executor(None, fn),
        timeout=timeout
    )


class RunwayAssignRequest(BaseModel):
    """Schema for assigning a flight to a runway."""
    airport_name: str
    runway_id: str
    flight_number: str
    priority: Optional[str] = "normal"   # normal | low-fuel | emergency


class RunwayResponse(BaseModel):
    """Schema for returning runway data."""
    id: int
    airport_name: str
    runway_id: str
    status: str
    assigned_flight: Optional[str] = None
    queue: list
    updated_at: Optional[datetime] = None


@router.get("/", response_model=List[RunwayResponse])
async def get_runways():
    """
    Returns the status of all runways across all airports.
    """
    try:
        db = get_supabase()
        result = await _run_query(
            lambda: db.table("runways").select("*").order("airport_name").execute()
        )
        return result.data if result.data else []
    except Exception as e:
        print(f"Runways fetch error: {e}")
        return []


@router.post("/assign", response_model=RunwayResponse)
async def assign_runway(payload: RunwayAssignRequest):
    """
    Assigns a flight to a specific runway. If the runway is busy,
    adds the flight to the queue sorted by priority.
    """
    try:
        db = get_supabase()

        result = await _run_query(
            lambda: db.table("runways").select("*")
                .eq("airport_name", payload.airport_name)
                .eq("runway_id", payload.runway_id)
                .execute()
        )

        if not result.data:
            raise HTTPException(status_code=404, detail=f"Runway {payload.runway_id} at {payload.airport_name} not found.")

        runway = result.data[0]

        if runway["status"] in ("maintenance", "closed"):
            raise HTTPException(status_code=409, detail=f"Runway {payload.runway_id} is {runway['status']} and unavailable.")

        now = datetime.utcnow().isoformat()

        if runway["status"] == "active" and not runway["assigned_flight"]:
            update_data = {"assigned_flight": payload.flight_number, "status": "busy", "updated_at": now}
            updated = await _run_query(
                lambda: db.table("runways").update(update_data).eq("id", runway["id"]).execute()
            )
        else:
            queue = runway["queue"] if isinstance(runway["queue"], list) else json.loads(runway["queue"])
            queue.append({"flight_number": payload.flight_number, "priority": payload.priority, "queued_at": now})
            queue_data = {"queue": json.dumps(queue), "updated_at": now}
            updated = await _run_query(
                lambda: db.table("runways").update(queue_data).eq("id", runway["id"]).execute()
            )

        if not updated.data:
            raise HTTPException(status_code=500, detail="Failed to assign runway.")
        return updated.data[0]
    except HTTPException:
        raise
    except Exception as e:
        print(f"Runway assignment error: {e}")
        raise HTTPException(status_code=503, detail="Database unavailable. Could not assign runway.")


@router.put("/{runway_id}/clear", response_model=RunwayResponse)
async def clear_runway(runway_id: int):
    """
    Clears the current flight from a runway and promotes the next in queue.
    """
    try:
        db = get_supabase()

        result = await _run_query(lambda: db.table("runways").select("*").eq("id", runway_id).execute())
        if not result.data:
            raise HTTPException(status_code=404, detail=f"Runway ID {runway_id} not found.")

        runway = result.data[0]
        queue = runway["queue"] if isinstance(runway["queue"], list) else json.loads(runway.get("queue", "[]"))
        now = datetime.utcnow().isoformat()

        if queue:
            next_flight = queue.pop(0)
            updated = await _run_query(lambda: db.table("runways").update({
                "assigned_flight": next_flight["flight_number"],
                "status": "busy",
                "queue": json.dumps(queue),
                "updated_at": now,
            }).eq("id", runway_id).execute())
        else:
            updated = await _run_query(lambda: db.table("runways").update({
                "assigned_flight": None,
                "status": "active",
                "queue": json.dumps([]),
                "updated_at": now,
            }).eq("id", runway_id).execute())

        if not updated.data:
            raise HTTPException(status_code=500, detail="Failed to clear runway.")
        return updated.data[0]
    except HTTPException:
        raise
    except Exception as e:
        print(f"Runway clearing error for ID {runway_id}: {e}")
        raise HTTPException(status_code=503, detail="Database unavailable. Could not clear runway.")


@router.get("/queue/{airport}", response_model=List[RunwayResponse])
async def get_airport_queue(airport: str):
    """
    Returns all runway statuses and queues for a specific airport.
    """
    try:
        db = get_supabase()
        result = await _run_query(lambda: db.table("runways").select("*").eq("airport_name", airport).execute())
        if not result.data:
            return []
        return result.data
    except Exception as e:
        print(f"Airport queue fetch error for {airport}: {e}")
        return []
