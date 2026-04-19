import asyncio
import websockets
import json
import logging
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S"
)
logger = logging.getLogger("ws_test")

async def test_atc_websocket():
    url = "ws://localhost:8000/ws/flights"
    logger.info(f"Connecting to {url}...")
    
    try:
        async with websockets.connect(url) as ws:
            logger.info("Connected successfully!")
            
            # 1. Wait for initial snapshot
            logger.info("Waiting for initial flight snapshot...")
            initial_msg = await ws.recv()
            data = json.loads(initial_msg)
            
            if data.get("type") == "flight_update":
                flights = data.get("flights", [])
                logger.info(f"Received initial state: {len(flights)} flights active.")
                if flights:
                    f = flights[0]
                    logger.info(f"Sample Flight: {f['flight_number']} ({f['airline']}) @ {f['lat']}, {f['lng']}")
            
            # 2. Monitor for simulation ticks (every 5 seconds)
            logger.info("Monitoring for real-time updates (Simulation Ticks)...")
            count = 0
            while count < 3:
                update_msg = await ws.recv()
                update_data = json.loads(update_msg)
                timestamp = update_data.get("timestamp", "N/A")
                logger.info(f"Update received at {timestamp} — Broadcast successful.")
                count += 1
                
            logger.info("✓ WebSocket verification complete — Connection is stable and receiving ticks.")
            
    except ConnectionRefusedError:
        logger.error("Connection Refused. Make sure the backend is running on port 8000.")
    except Exception as e:
        logger.error(f"WebSocket Error: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(test_atc_websocket())
    except KeyboardInterrupt:
        logger.info("Test stopped by user.")
