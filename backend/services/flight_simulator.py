"""
Flight Simulator Service.
Maintains 150 in-memory flights, simulates position updates every 5 seconds,
syncs a batch to Supabase, and broadcasts via WebSocket.
"""
from __future__ import annotations

import asyncio
import random
import math
import logging
from datetime import datetime
from typing import List, Dict, Optional

logger = logging.getLogger(__name__)

# ── Seed data ──────────────────────────────────────────────────────────────────

AIRLINES = [
    "Air India", "British Airways", "Emirates", "United", "Delta",
    "Lufthansa", "Singapore Airlines", "Qatar Airways", "Turkish Airlines",
    "Air France", "Etihad", "IndiGo", "SpiceJet", "American Airlines", "Qantas",
]
AIRLINE_CODES: Dict[str, str] = {
    "Air India": "AI", "British Airways": "BA", "Emirates": "EK",
    "United": "UA", "Delta": "DL", "Lufthansa": "LH",
    "Singapore Airlines": "SQ", "Qatar Airways": "QR", "Turkish Airlines": "TK",
    "Air France": "AF", "Etihad": "EY", "IndiGo": "6E",
    "SpiceJet": "SG", "American Airlines": "AA", "Qantas": "QF",
}

AIRPORTS = {
    # India
    "DEL": {"name": "Indira Gandhi Intl", "city": "Delhi", "lat": 28.5665, "lng": 77.1031},
    "BOM": {"name": "Chhatrapati Shivaji Intl", "city": "Mumbai", "lat": 19.0896, "lng": 72.8656},
    "BLR": {"name": "Kempegowda Intl", "city": "Bangalore", "lat": 13.1986, "lng": 77.7066},
    "HYD": {"name": "Rajiv Gandhi Intl", "city": "Hyderabad", "lat": 17.2403, "lng": 78.4294},
    "CCU": {"name": "Netaji Subhas Chandra Bose Intl", "city": "Kolkata", "lat": 22.6520, "lng": 88.4463},
    "MAA": {"name": "Chennai Intl", "city": "Chennai", "lat": 12.9941, "lng": 80.1709},
    "AMD": {"name": "Sardar Vallabhbhai Patel Intl", "city": "Ahmedabad", "lat": 23.0769, "lng": 72.6347},
    "GOI": {"name": "Goa Intl", "city": "Goa", "lat": 15.3808, "lng": 73.8314},
    # Middle East
    "DXB": {"name": "Dubai Intl", "city": "Dubai", "lat": 25.2532, "lng": 55.3657},
    "AUH": {"name": "Abu Dhabi Intl", "city": "Abu Dhabi", "lat": 24.4330, "lng": 54.6511},
    "DOH": {"name": "Hamad Intl", "city": "Doha", "lat": 25.2731, "lng": 51.6080},
    "RUH": {"name": "King Khalid Intl", "city": "Riyadh", "lat": 24.9578, "lng": 46.6989},
    # Europe
    "LHR": {"name": "Heathrow", "city": "London", "lat": 51.4700, "lng": -0.4543},
    "CDG": {"name": "Charles de Gaulle", "city": "Paris", "lat": 49.0097, "lng": 2.5479},
    "FRA": {"name": "Frankfurt Intl", "city": "Frankfurt", "lat": 50.0379, "lng": 8.5622},
    "AMS": {"name": "Amsterdam Schiphol", "city": "Amsterdam", "lat": 52.3086, "lng": 4.7639},
    "MUC": {"name": "Munich Intl", "city": "Munich", "lat": 48.3537, "lng": 11.7750},
    "MAD": {"name": "Adolfo Suárez Madrid-Barajas", "city": "Madrid", "lat": 40.4719, "lng": -3.5626},
    "FCO": {"name": "Leonardo da Vinci Intl", "city": "Rome", "lat": 41.8003, "lng": 12.2389},
    "IST": {"name": "Istanbul Intl", "city": "Istanbul", "lat": 41.2608, "lng": 28.7418},
    "ZRH": {"name": "Zurich Intl", "city": "Zurich", "lat": 47.4582, "lng": 8.5555},
    # USA
    "JFK": {"name": "John F Kennedy Intl", "city": "New York", "lat": 40.6413, "lng": -73.7781},
    "LAX": {"name": "Los Angeles Intl", "city": "Los Angeles", "lat": 33.9425, "lng": -118.4081},
    "ORD": {"name": "O'Hare Intl", "city": "Chicago", "lat": 41.9742, "lng": -87.9073},
    "ATL": {"name": "Hartsfield-Jackson Intl", "city": "Atlanta", "lat": 33.6407, "lng": -84.4277},
    "MIA": {"name": "Miami Intl", "city": "Miami", "lat": 25.7959, "lng": -80.2870},
    "SFO": {"name": "San Francisco Intl", "city": "San Francisco", "lat": 37.6213, "lng": -122.3790},
    "DFW": {"name": "Dallas Fort Worth Intl", "city": "Dallas", "lat": 32.8998, "lng": -97.0403},
    # Asia Pacific
    "SIN": {"name": "Changi Intl", "city": "Singapore", "lat": 1.3644, "lng": 103.9915},
    "HKG": {"name": "Hong Kong Intl", "city": "Hong Kong", "lat": 22.3080, "lng": 113.9185},
    "NRT": {"name": "Narita Intl", "city": "Tokyo", "lat": 35.7720, "lng": 140.3929},
    "ICN": {"name": "Incheon Intl", "city": "Seoul", "lat": 37.4602, "lng": 126.4407},
    "PEK": {"name": "Beijing Capital Intl", "city": "Beijing", "lat": 40.0799, "lng": 116.6031},
    "SYD": {"name": "Sydney Kingsford Smith", "city": "Sydney", "lat": -33.9399, "lng": 151.1753},
    "KUL": {"name": "Kuala Lumpur Intl", "city": "Kuala Lumpur", "lat": 2.7456, "lng": 101.7072},
    "BKK": {"name": "Suvarnabhumi Intl", "city": "Bangkok", "lat": 13.6900, "lng": 100.7501},
}

ROUTE_PAIRS = [
    ("DEL", "DXB"), ("DEL", "BOM"), ("DEL", "LHR"), ("DEL", "SIN"),
    ("BOM", "DXB"), ("BOM", "LHR"), ("BOM", "SIN"), ("BOM", "BLR"),
    ("DXB", "LHR"), ("DXB", "JFK"), ("DXB", "SIN"), ("DXB", "BOM"),
    ("LHR", "JFK"), ("LHR", "DXB"), ("LHR", "SIN"), ("LHR", "HKG"),
    ("JFK", "LHR"), ("JFK", "LAX"), ("JFK", "CDG"), ("JFK", "FRA"),
    ("LAX", "JFK"), ("LAX", "NRT"), ("LAX", "SIN"), ("LAX", "SYD"),
    ("SIN", "HKG"), ("SIN", "NRT"), ("SIN", "SYD"), ("SIN", "DEL"),
    ("HKG", "NRT"), ("HKG", "SIN"), ("HKG", "LHR"), ("HKG", "JFK"),
    ("CDG", "DXB"), ("CDG", "JFK"), ("CDG", "SIN"), ("FRA", "DXB"),
    ("NRT", "LAX"), ("NRT", "SIN"), ("NRT", "ICN"), ("ICN", "NRT"),
    ("AUH", "LHR"), ("DOH", "LHR"), ("DOH", "JFK"), ("BLR", "DXB"),
    ("CCU", "DEL"), ("MAA", "DXB"), ("HYD", "BOM"), ("AMD", "DEL"),
]


def _clamp(value: float, lo: float, hi: float) -> float:
    return max(lo, min(hi, value))


def _generate_flights() -> List[Dict]:
    """Generates the initial 150 flights with realistic coordinates and statuses."""
    flights: List[Dict] = []
    fid = 1
    
    # We generate a total of 150 flights
    for _ in range(150):
        # Determine status distribution
        if fid <= 8:
            status = "emergency"
        elif fid <= 20:
            status = "low-fuel"
        else:
            status = "normal"

        airline = random.choice(AIRLINES)
        code = AIRLINE_CODES[airline]
        flight_number = f"{code}-{100 + random.randint(0, 899)}"
        
        origin_code, dest_code = random.choice(ROUTE_PAIRS)
        origin = AIRPORTS[origin_code]
        dest = AIRPORTS[dest_code]
        
        # Position the flight somewhere between origin and destination
        progress = random.uniform(0.1, 0.9)  # how far along the route
        lat = origin["lat"] + (dest["lat"] - origin["lat"]) * progress
        lng = origin["lng"] + (dest["lng"] - origin["lng"]) * progress
        
        # Heading from origin toward destination
        dlng = dest["lng"] - origin["lng"]
        dlat = dest["lat"] - origin["lat"]
        heading = (math.degrees(math.atan2(dlng, dlat)) + 360) % 360

        fuel = (
            random.randint(5, 12)  if status == "emergency" else
            random.randint(12, 20) if status == "low-fuel"  else
            random.randint(40, 95)
        )

        flights.append({
            "id":            fid,
            "flight_number": flight_number,
            "airline":       airline,
            "origin":        origin_code,
            "destination":   dest_code,
            "origin_name":   origin["name"],
            "origin_city":   origin["city"],
            "origin_lat":    origin["lat"],
            "origin_lng":    origin["lng"],
            "dest_name":     dest["name"],
            "dest_city":     dest["city"],
            "dest_lat":      dest["lat"],
            "dest_lng":      dest["lng"],
            "lat":           round(lat, 5),
            "lng":           round(lng, 5),
            "altitude":      random.randint(28000, 41000),
            "speed":         random.randint(400, 520),
            "heading":       round(heading),
            "status":        status,
            "fuel_level":    fuel,
            "updated_at":    datetime.utcnow().isoformat(),
        })
        fid += 1

    random.shuffle(flights)
    return flights


# ── Simulator ──────────────────────────────────────────────────────────────────

class FlightSimulator:
    """
    In-memory flight position simulator.
    Ticks every 5 seconds, broadcasts via WebSocket, and batches to Supabase.
    """

    def __init__(self) -> None:
        self._flights: Dict[int, Dict] = {}
        self._running = False
        self._ws_manager: Optional[object] = None

    # ── Setup ──────────────────────────────────────────────────────────────────

    def bootstrap(self) -> None:
        """Generates the initial 150 flights and stores them in memory."""
        for f in _generate_flights():
            self._flights[f["id"]] = f
        logger.info(f"Simulator bootstrapped: {len(self._flights)} flights.")

    def inject_ws_manager(self, manager: object) -> None:
        """Injects the WebSocket manager post-startup to avoid circular imports."""
        self._ws_manager = manager

    # ── Read API ───────────────────────────────────────────────────────────────

    def get_all_flights(self) -> List[Dict]:
        """Returns all current flights as a list."""
        return list(self._flights.values())

    def get_flight(self, flight_number: str) -> Optional[Dict]:
        """Returns a single flight dict by flight number, or None."""
        fn = flight_number.upper()
        return next((f for f in self._flights.values() if f["flight_number"] == fn), None)

    # ── Write API ──────────────────────────────────────────────────────────────

    def update_status(self, flight_id: int, status: str) -> None:
        """Manually overrides the status of a flight by its numeric ID."""
        if flight_id in self._flights:
            self._flights[flight_id]["status"] = status

    # ── Simulation ─────────────────────────────────────────────────────────────

    def _tick(self) -> None:
        """Advances all flight positions and drains fuel by one simulation step."""
        for fid, f in self._flights.items():
            rad = math.radians(f["heading"])
            new_lat = _clamp(f["lat"] + math.sin(rad) * 0.04, -85, 85)
            new_lng = _clamp(f["lng"] + math.cos(rad) * 0.04, -175, 175)
            heading = (f["heading"] + random.randint(-2, 2)) % 360
            fuel    = max(0, f["fuel_level"] - random.randint(0, 1))

            # Auto-escalate status based on fuel
            status = f["status"]
            if status == "normal"   and fuel < 15: status = "low-fuel"
            if status == "low-fuel" and fuel < 8:  status = "emergency"

            self._flights[fid] = {
                **f,
                "lat":        round(new_lat, 5),
                "lng":        round(new_lng, 5),
                "heading":    heading,
                "fuel_level": fuel,
                "status":     status,
                "updated_at": datetime.utcnow().isoformat(),
            }

    async def run(self) -> None:
        """
        Main simulation loop — ticks every 5 seconds.
        Broadcasts updates to WebSocket clients and syncs a batch to Supabase.
        """
        self._running = True
        logger.info("Simulation loop running.")

        while self._running:
            await asyncio.sleep(5)
            self._tick()

            # WebSocket broadcast
            if self._ws_manager is not None:
                await self._ws_manager.broadcast({
                    "type":      "flight_update",
                    "flights":   self.get_all_flights(),
                    "timestamp": datetime.utcnow().isoformat(),
                })

                # Supabase sync — upsert first 50 rows to stay within rate limits
            try:
                from database import get_supabase
                db = get_supabase()
                batch = list(self._flights.values())[:50]
                # Run synchronous DB call in a separate thread to avoid blocking the event loop
                def do_upsert():
                    # Filter for only columns that exist in the DB schema
                    db_columns = {
                        "flight_number", "airline", "origin", "destination", 
                        "lat", "lng", "altitude", "speed", "heading", 
                        "status", "fuel_level", "updated_at"
                    }
                    clean_batch = [
                        {k: v for k, v in f.items() if k in db_columns} 
                        for f in batch
                    ]
                    return db.table("flights").upsert(
                        clean_batch, on_conflict="flight_number"
                    ).execute()

                await asyncio.to_thread(do_upsert)
            except Exception as e:
                logger.debug(f"Supabase sync skipped: {e}")

    def stop(self) -> None:
        """Signals the simulation loop to stop after the current tick."""
        self._running = False
        logger.info("Simulation loop stopped.")


# ── Singleton ──────────────────────────────────────────────────────────────────
flight_simulator = FlightSimulator()
