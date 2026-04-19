"""
Flight routes for querying and updating active flight records.
Returns data from the in-memory flight simulator and Supabase.
"""
from fastapi import APIRouter, HTTPException
from typing import List
from datetime import datetime

from database import get_supabase
from schemas.flight import Flight, FlightStatusUpdate
from services.flight_simulator import flight_simulator

router = APIRouter(prefix="/flights", tags=["Flights"])

# Region bounding boxes [lng_min, lat_min, lng_max, lat_max]
REGION_BOUNDS = {
    "NA":  (-170, 15, -50, 75),
    "EU":  (-15, 35, 45, 72),
    "AP":  (60, -50, 180, 55),
    "ME":  (25, 10, 65, 42),
    "SA":  (60, 5, 100, 40),
    "AF":  (-20, -40, 55, 40),
    "SAM": (-85, -60, -30, 15),
}


@router.get("/", response_model=List[Flight])
async def get_all_flights():
    """
    Returns all 150 active flights from the in-memory simulator state.
    Falls back to Supabase if simulator not populated.
    """
    flights = flight_simulator.get_all_flights()
    if flights:
        return flights

    # Fallback: fetch from Supabase
    db = get_supabase()
    result = db.table("flights").select("*").order("id").execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="No active flights found.")
    return result.data


@router.get("/{flight_number}", response_model=Flight)
async def get_flight(flight_number: str):
    """
    Returns detailed data for a specific flight by its flight number.
    """
    # Check in-memory simulator first
    flight = flight_simulator.get_flight(flight_number)
    if flight:
        return flight

    db = get_supabase()
    result = db.table("flights").select("*").eq("flight_number", flight_number.upper()).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail=f"Flight {flight_number} not found.")
    return result.data[0]


@router.get("/region/{region}", response_model=List[Flight])
async def get_flights_by_region(region: str):
    """
    Returns all flights within a given geographic region code.
    Supported: NA, EU, AP, ME, SA, AF, SAM
    """
    region = region.upper()
    if region not in REGION_BOUNDS:
        raise HTTPException(
            status_code=400,
            detail=f"Unknown region '{region}'. Valid: {list(REGION_BOUNDS.keys())}"
        )

    bounds = REGION_BOUNDS[region]
    lng_min, lat_min, lng_max, lat_max = bounds

    flights = flight_simulator.get_all_flights()
    regional = [
        f for f in flights
        if lng_min <= f["lng"] <= lng_max and lat_min <= f["lat"] <= lat_max
    ]
    return regional


@router.put("/{flight_id}/status", response_model=Flight)
async def update_flight_status(flight_id: int, payload: FlightStatusUpdate):
    """
    Updates the operational status of a flight (normal/low-fuel/emergency).
    Persists change to Supabase and updates the in-memory simulator.
    """
    valid_statuses = {"normal", "low-fuel", "emergency"}
    if payload.status not in valid_statuses:
        raise HTTPException(status_code=400, detail=f"Invalid status. Must be one of: {valid_statuses}")

    db = get_supabase()
    result = db.table("flights").update({
        "status": payload.status,
        "updated_at": datetime.utcnow().isoformat()
    }).eq("id", flight_id).execute()

    if not result.data:
        raise HTTPException(status_code=404, detail=f"Flight ID {flight_id} not found.")

    # Sync with in-memory simulator
    flight_simulator.update_status(flight_id, payload.status)
    return result.data[0]
