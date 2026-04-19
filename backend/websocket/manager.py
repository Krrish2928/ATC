"""
WebSocket Connection Manager.
Handles all client connections, disconnections, and broadcast of flight updates.
"""
import json
import logging
import asyncio
from typing import Set
from fastapi import WebSocket, WebSocketDisconnect

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Manages active WebSocket connections for real-time flight data streaming.
    Supports concurrent clients with graceful connect/disconnect handling.
    """

    def __init__(self):
        self._active: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        """
        Accepts a new WebSocket connection and registers it.

        Args:
            websocket: The incoming WebSocket client.
        """
        await websocket.accept()
        self._active.add(websocket)
        logger.info(f"WebSocket client connected. Total: {len(self._active)}")

    def disconnect(self, websocket: WebSocket):
        """
        Removes a disconnected WebSocket client from the active set.

        Args:
            websocket: The WebSocket client to remove.
        """
        self._active.discard(websocket)
        logger.info(f"WebSocket client disconnected. Total: {len(self._active)}")

    async def broadcast(self, payload: dict):
        """
        Broadcasts a JSON payload to all connected clients.
        Automatically removes dead connections.

        Args:
            payload: The dictionary to serialize and send.
        """
        if not self._active:
            return

        message = json.dumps(payload, default=str)
        dead: Set[WebSocket] = set()

        for ws in self._active.copy():
            try:
                await ws.send_text(message)
            except Exception as e:
                logger.warning(f"Failed to send to client, marking dead: {e}")
                dead.add(ws)

        # Clean up dead connections
        for ws in dead:
            self._active.discard(ws)

    async def send_personal(self, websocket: WebSocket, payload: dict):
        """
        Sends a JSON payload to a single specific client.

        Args:
            websocket: The target WebSocket client.
            payload: The dictionary to serialize and send.
        """
        try:
            await websocket.send_text(json.dumps(payload, default=str))
        except Exception as e:
            logger.warning(f"Failed to send personal message: {e}")
            self.disconnect(websocket)

    @property
    def client_count(self) -> int:
        """Returns the number of currently active WebSocket connections."""
        return len(self._active)


# Singleton connection manager
ws_manager = ConnectionManager()
