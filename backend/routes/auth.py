"""
Authentication routes for user registration, login, and profile management.
Uses Firebase Admin SDK for token verification and Supabase for persistence.
"""
from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from datetime import datetime

from database import get_supabase
from schemas.user import UserCreate, UserUpdate, UserResponse, TokenVerifyRequest
from services.firebase_service import verify_firebase_token

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=201)
async def register_user(payload: UserCreate, authorization: Optional[str] = Header(None)):
    """
    Register a new ATC controller.
    Verifies the Firebase token and creates a user record in Supabase.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")

    token = authorization.split(" ")[1]
    decoded = await verify_firebase_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid Firebase token.")

    db = get_supabase()
    uid = decoded["uid"]

    # Check if user already exists
    existing = db.table("users").select("*").eq("id", uid).execute()
    if existing.data:
        raise HTTPException(status_code=409, detail="User already registered.")

    user_data = {
        "id": uid,
        "email": payload.email,
        "name": payload.name,
        "badge_id": payload.badge_id,
        "role": payload.role,
        "zone": payload.zone,
        "shift": payload.shift,
        "created_at": datetime.utcnow().isoformat(),
    }

    result = db.table("users").insert(user_data).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create user record.")

    return result.data[0]


@router.post("/login", response_model=UserResponse)
async def login_user(authorization: Optional[str] = Header(None)):
    """
    Login endpoint — verifies Firebase token and returns user data from Supabase.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")

    token = authorization.split(" ")[1]
    decoded = await verify_firebase_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid Firebase token.")

    db = get_supabase()
    uid = decoded["uid"]

    result = db.table("users").select("*").eq("id", uid).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found. Please register first.")

    return result.data[0]


@router.get("/me", response_model=UserResponse)
async def get_profile(authorization: Optional[str] = Header(None)):
    """
    Returns the profile of the currently authenticated user.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")

    token = authorization.split(" ")[1]
    decoded = await verify_firebase_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid Firebase token.")

    db = get_supabase()
    result = db.table("users").select("*").eq("id", decoded["uid"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found.")

    return result.data[0]


@router.put("/me", response_model=UserResponse)
async def update_profile(payload: UserUpdate, authorization: Optional[str] = Header(None)):
    """
    Update the authenticated user's profile fields.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header.")

    token = authorization.split(" ")[1]
    decoded = await verify_firebase_token(token)
    if not decoded:
        raise HTTPException(status_code=401, detail="Invalid Firebase token.")

    db = get_supabase()
    uid = decoded["uid"]

    update_data = {k: v for k, v in payload.dict().items() if v is not None}
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields provided for update.")

    result = db.table("users").update(update_data).eq("id", uid).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found.")

    return result.data[0]
