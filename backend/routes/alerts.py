"""
Alert routes for creating, resolving, and dismissing operational ATC alerts.
"""
import asyncio
from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from database import get_supabase
from schemas.alert import AlertCreate, AlertResponse, AlertResolveRequest

router = APIRouter(prefix="/alerts", tags=["Alerts"])

# Helper: run a blocking Supabase call in a thread with a timeout
async def _run_query(fn, timeout: float = 5.0):
    loop = asyncio.get_event_loop()
    return await asyncio.wait_for(
        loop.run_in_executor(None, fn),
        timeout=timeout
    )


@router.get("/", response_model=List[AlertResponse])
async def get_alerts():
    """
    Returns all unresolved operational alerts, sorted by creation time descending.
    """
    try:
        db = get_supabase()
        result = await _run_query(
            lambda: db.table("alerts").select("*").eq("resolved", False).order("created_at", desc=True).execute()
        )
        return result.data if result.data else []
    except Exception as e:
        print(f"Alerts fetch error: {e}")
        return []


@router.post("/", response_model=AlertResponse, status_code=201)
async def create_alert(payload: AlertCreate):
    """
    Creates a new operational alert in the system (e.g., proximity, emergency, low-fuel).
    """
    valid_types = {"proximity", "emergency", "low-fuel"}
    if payload.type not in valid_types:
        raise HTTPException(status_code=400, detail=f"Invalid alert type. Must be one of: {valid_types}")

    try:
        db = get_supabase()
        alert_data = {
            "type": payload.type,
            "message": payload.message,
            "flight_ref": payload.flight_ref,
            "resolved": False,
            "created_at": datetime.utcnow().isoformat(),
        }

        result = await _run_query(lambda: db.table("alerts").insert(alert_data).execute())
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create alert.")
        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        print(f"Alert creation error: {e}")
        raise HTTPException(status_code=503, detail="Database unavailable. Could not create alert.")


@router.put("/{alert_id}/resolve", response_model=AlertResponse)
async def resolve_alert(alert_id: int, payload: AlertResolveRequest):
    """
    Marks an alert as resolved with a timestamped resolution action.
    """
    try:
        db = get_supabase()

        existing = await _run_query(lambda: db.table("alerts").select("*").eq("id", alert_id).execute())
        if not existing.data:
            raise HTTPException(status_code=404, detail=f"Alert ID {alert_id} not found.")
        if existing.data[0]["resolved"]:
            raise HTTPException(status_code=409, detail="Alert is already resolved.")

        result = await _run_query(lambda: db.table("alerts").update({
            "resolved": True,
            "resolved_at": datetime.utcnow().isoformat(),
        }).eq("id", alert_id).execute())

        return result.data[0]
    except HTTPException:
        raise
    except Exception as e:
        print(f"Alert resolution error for ID {alert_id}: {e}")
        raise HTTPException(status_code=503, detail="Database unavailable. Could not resolve alert.")


@router.delete("/{alert_id}", status_code=204)
async def dismiss_alert(alert_id: int):
    """
    Permanently deletes (dismisses) an alert from the system.
    """
    try:
        db = get_supabase()

        existing = await _run_query(lambda: db.table("alerts").select("id").eq("id", alert_id).execute())
        if not existing.data:
            raise HTTPException(status_code=404, detail=f"Alert ID {alert_id} not found.")

        await _run_query(lambda: db.table("alerts").delete().eq("id", alert_id).execute())
    except HTTPException:
        raise
    except Exception as e:
        print(f"Alert dismissal error for ID {alert_id}: {e}")
        raise HTTPException(status_code=503, detail="Database unavailable. Could not dismiss alert.")
