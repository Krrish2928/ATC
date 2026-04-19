"""
Database module for Supabase connection.
NOTE: supabase-py is a synchronous client — wrap calls in run_in_executor
if needed from async context.
"""
from __future__ import annotations

import logging
from typing import Optional

from supabase import create_client, Client
from config import settings

logger = logging.getLogger(__name__)

_supabase: Optional[Client] = None


def get_supabase() -> Client:
    """
    Returns the initialized Supabase client.
    Safe to call from any context — raises RuntimeError if not yet initialized.
    """
    if _supabase is None:
        raise RuntimeError("Database not initialized. Ensure init_db() ran at startup.")
    return _supabase


async def init_db() -> None:
    """
    Initializes the Supabase client.
    Connectivity is tested lazily during actual requests to prevent startup hangs.
    """
    global _supabase
    try:
        _supabase = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)
        logger.info("Supabase client initialized.")
    except Exception as e:
        logger.error(f"Supabase client initialization failed: {e}")
