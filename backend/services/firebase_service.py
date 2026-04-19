"""
Firebase Admin SDK service for token verification and user management.
"""
from __future__ import annotations

import logging
from typing import Optional

import firebase_admin
from firebase_admin import credentials, auth
from config import settings

logger = logging.getLogger(__name__)
_firebase_initialized = False


def init_firebase() -> None:
    """
    Initializes the Firebase Admin SDK using the service account credentials file.
    Safe to call multiple times — skips if already initialized.
    """
    global _firebase_initialized
    if _firebase_initialized:
        return
    try:
        cred = credentials.Certificate(settings.FIREBASE_CREDENTIALS_PATH)
        firebase_admin.initialize_app(cred)
        _firebase_initialized = True
        logger.info("Firebase Admin SDK initialized successfully.")
    except Exception as e:
        logger.error(f"Firebase Admin SDK init failed: {e}")
        # Don't raise — backend still works without Firebase (auth endpoints will return 503)


async def verify_firebase_token(token: str) -> Optional[dict]:
    """
    Verifies a Firebase ID token and returns the decoded claims dict.

    Returns:
        Decoded token dict with uid, email etc., or None if invalid/expired.
    """
    if not _firebase_initialized:
        logger.warning("Firebase not initialized — cannot verify token.")
        return None
    try:
        decoded = auth.verify_id_token(token)
        return decoded
    except auth.ExpiredIdTokenError:
        logger.warning("Firebase token expired.")
        return None
    except auth.InvalidIdTokenError:
        logger.warning("Invalid Firebase token.")
        return None
    except Exception as e:
        logger.error(f"Firebase token verification error: {e}")
        return None


async def get_firebase_user(uid: str) -> Optional[dict]:
    """
    Retrieves a Firebase UserRecord by UID.

    Returns:
        User data dict, or None if not found.
    """
    if not _firebase_initialized:
        return None
    try:
        user = auth.get_user(uid)
        return {
            "uid": user.uid,
            "email": user.email,
            "display_name": user.display_name,
            "photo_url": user.photo_url,
            "disabled": user.disabled,
        }
    except auth.UserNotFoundError:
        logger.warning(f"Firebase user {uid} not found.")
        return None
    except Exception as e:
        logger.error(f"Error fetching Firebase user {uid}: {e}")
        return None
