"""
ATC Backend — FastAPI Application Entry Point.
"""
from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager
from typing import Optional

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

# ── Logging ────────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-8s  %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
logger = logging.getLogger("atc.main")

# ── Deferred heavy imports (prevent startup errors if creds missing) ───────────
from config import settings                              # noqa: E402
from database import init_db                             # noqa: E402
from services.firebase_service import init_firebase      # noqa: E402
from services.flight_simulator import flight_simulator   # noqa: E402
from websocket.manager import ws_manager                 # noqa: E402

from routes.auth     import router as auth_router        # noqa: E402
from routes.flights  import router as flights_router     # noqa: E402
from routes.alerts   import router as alerts_router      # noqa: E402
from routes.runways  import router as runways_router     # noqa: E402
from routes.history  import router as history_router     # noqa: E402
from services.ai_service import router as chat_router    # noqa: E402

# ── Background task handle ─────────────────────────────────────────────────────
_sim_task: Optional[asyncio.Task] = None


# ── Lifespan ───────────────────────────────────────────────────────────────────
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and graceful shutdown sequence."""
    global _sim_task

    logger.info("═══ ATC Backend — startup ═══")

    # 1. Firebase (non-fatal)
    try:
        init_firebase()
    except Exception as e:
        logger.warning(f"Firebase unavailable: {e}")

    # 2. Supabase (non-fatal — backend works without it)
    try:
        await init_db()
    except Exception as e:
        logger.warning(f"Supabase unavailable: {e}")

    # 3. Bootstrap 150 in-memory flights
    flight_simulator.bootstrap()

    # 4. Wire WebSocket manager into simulator
    flight_simulator.inject_ws_manager(ws_manager)

    # 5. Start simulation loop as background task
    _sim_task = asyncio.create_task(flight_simulator.run())
    logger.info("═══ ATC Backend — ready on :8000 ═══")

    yield

    # ── Shutdown ──────────────────────────────────────────────────────────────
    logger.info("Shutting down…")
    flight_simulator.stop()
    if _sim_task and not _sim_task.done():
        _sim_task.cancel()
        try:
            await _sim_task
        except asyncio.CancelledError:
            pass
    logger.info("Shutdown complete.")


# ── App ────────────────────────────────────────────────────────────────────────
app = FastAPI(
    title="ATC — Air Traffic Control API",
    description="Real-time ATC backend: 150-flight sim · Firebase auth · Supabase · Groq AI · WebSocket",
    version="1.0.0",
    lifespan=lifespan,
    redirect_slashes=True,
)

# ── CORS ───────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Health ─────────────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def health_check():
    """Returns backend status and live counters."""
    return {
        "status":         "ATC Backend Online",
        "active_flights": len(flight_simulator.get_all_flights()),
        "ws_clients":     ws_manager.client_count,
        "version":        "1.0.0",
    }


# ── WebSocket ──────────────────────────────────────────────────────────────────
@app.websocket("/ws/flights")
async def websocket_flights(websocket: WebSocket):
    """
    Real-time flight position stream.
    Sends initial snapshot on connect; simulator broadcasts every 5 s thereafter.
    Includes explicit keep-alive ping loop to prevent connection timeout.
    """
    from datetime import datetime
    await ws_manager.connect(websocket)
    logger.info(f"WS connect — clients: {ws_manager.client_count}")

    try:
        # 1. Immediate state snapshot on entry
        await ws_manager.send_personal(websocket, {
            "type":      "flight_update",
            "flights":   flight_simulator.get_all_flights(),
            "timestamp": datetime.utcnow().isoformat(),
        })

        # 2. Main Keep-Alive / Receive Loop
        while True:
            try:
                # Use wait_for to create a non-blocking check for incoming messages
                # This allows us to send periodic pings to keep the connection alive
                try:
                    await asyncio.wait_for(websocket.receive_text(), timeout=30.0)
                except asyncio.TimeoutError:
                    # No message received in 30s, send a heartbeat ping
                    await ws_manager.send_personal(websocket, {
                        "type": "ping",
                        "timestamp": datetime.utcnow().isoformat()
                    })
            except WebSocketDisconnect:
                # Explicitly re-raise to be handled by the outer disconnect logic
                raise
            except Exception as loop_err:
                # Log minor loop errors but stay alive
                logger.warning(f"WS non-fatal loop error: {loop_err}")
                continue

    except WebSocketDisconnect:
        ws_manager.disconnect(websocket)
        logger.info(f"WS disconnect — clients: {ws_manager.client_count}")
    except Exception as e:
        logger.error(f"WS fatal exception: {e}")
        ws_manager.disconnect(websocket)


# ── Routers ────────────────────────────────────────────────────────────────────
app.include_router(auth_router,    prefix="/api")
app.include_router(flights_router, prefix="/api")
app.include_router(alerts_router,  prefix="/api")
app.include_router(runways_router, prefix="/api")
app.include_router(history_router, prefix="/api")
app.include_router(chat_router,    prefix="/api")


# ── Dev entry ──────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
