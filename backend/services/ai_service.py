"""
AI Service using Groq LLM via LangChain for ATC-specific chatbot functionality.
Handles flight queries, emergency protocols, runway status, and navigation.
"""
from __future__ import annotations

import asyncio
import logging
from typing import Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import re

from config import settings

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["AI Chatbot"])

# ── Groq + LangChain Setup ─────────────────────────────────────────────────────
_llm = None
_llm_available = False

try:
    from langchain_groq import ChatGroq
    from langchain.schema import HumanMessage, SystemMessage

    # Try Primary Model
    try:
        _llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=512,
        )
        _llm_available = True
        logger.info("Groq LLM (llama-3.3-70b-versatile) initialized successfully.")
    except Exception as primary_e:
        logger.warning(f"Primary Groq model failed, trying fallback: {primary_e}")
        # Try Fallback Model
        _llm = ChatGroq(
            api_key=settings.GROQ_API_KEY,
            model_name="llama-3.1-8b-instant",
            temperature=0.3,
            max_tokens=512,
        )
        _llm_available = True
        logger.info("Groq LLM (llama-3.1-8b-instant) initialized successfully.")
except Exception as e:
    _llm_available = False
    logger.error(f"Groq LLM initialization failed entirely: {e}")


# ── Intent Detection ───────────────────────────────────────────────────────────

def _detect_intent(message: str) -> dict:
    message_lower = message.lower()
    
    # Flight tracking intent
    track_triggers = ["track", "show", "follow", "monitor", "find", "locate", "where is"]
    flight_pattern = re.compile(r'\b([A-Z]{2,3}-?\d{2,4})\b', re.IGNORECASE)
    flight_match = flight_pattern.search(message)
    
    has_track_trigger = any(t in message_lower for t in track_triggers)
    
    if has_track_trigger and flight_match:
        return {
            "intent": "track_flight",
            "flight_number": flight_match.group(1).upper()
        }
    
    # Navigation intent
    nav_triggers = ["go to", "fly to", "show me", "take me to", "navigate to"]
    if any(t in message_lower for t in nav_triggers):
        return {"intent": "navigate", "flight_number": None}
    
    # Emergency intent
    if any(t in message_lower for t in ["emergency", "mayday", "critical"]):
        return {"intent": "emergency", "flight_number": None}

    # Fuel intent
    if any(k in message_lower for k in ["fuel", "low fuel", "bingo", "reserve"]):
        return {"intent": "low_fuel", "flight_number": None}

    # Runway intent
    if any(k in message_lower for k in ["runway", "land", "depart", "clear", "queue"]):
        return {"intent": "runway", "flight_number": None}
    
    return {"intent": "general", "flight_number": None}


def _build_system_prompt(flight_count: int, alert_count: int, context: str, user_name: Optional[str] = None) -> str:
    name_str = f"The controller's name is {user_name}. Address them by name occasionally in responses to make it feel personal.\n" if user_name else ""
    return (
        "You are ARIA, the ATC AI Assistant. You are friendly and professional.\n"
        f"{name_str}"
        "For greetings, respond warmly and introduce yourself.\n"
        "For flight queries, use the real flight data provided.\n"
        "Never give the same response twice — vary your language naturally.\n"
        "Answer questions about flights, runways, and emergencies professionally.\n"
        "Use ATC-standard terminology. Keep responses under 150 words.\n\n"
        f"Current active flights: {flight_count}\n"
        f"Current alerts: {alert_count}\n\n"
        f"Live Context:\n{context}"
    )


# ── Schemas ────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    user_id: Optional[str] = None
    user_name: Optional[str] = None


class ChatResponse(BaseModel):
    reply: str
    intent: str
    flight_number: Optional[str] = None
    flight_count: int
    alert_count: int


# ── Chat Endpoint ──────────────────────────────────────────────────────────────

@router.post("/", response_model=ChatResponse)
async def chat(payload: ChatRequest):
    """
    Processes a user ATC query and returns an AI-generated response
    with live flight/alert context injected into the prompt.
    """
    if not payload.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty.")

    # Import here to avoid circular imports at module level
    from services.flight_simulator import flight_simulator

    flights = flight_simulator.get_all_flights()
    flight_count = len(flights)
    alerts = []
    alert_count = 0

    try:
        from database import get_supabase
        db = get_supabase()
        loop = asyncio.get_event_loop()
        res = await asyncio.wait_for(
            loop.run_in_executor(None, lambda: db.table("alerts").select("*").eq("resolved", False).execute()),
            timeout=5.0
        )
        alerts = res.data or []
        alert_count = len(alerts)
    except Exception:
        pass

    intent_data = _detect_intent(payload.message)
    intent = intent_data["intent"]
    context_lines: list[str] = []

    if intent == "emergency":
        for f in [f for f in flights if f["status"] == "emergency"][:5]:
            context_lines.append(
                f"EMERGENCY: {f['flight_number']} ({f['airline']}) "
                f"lat={f['lat']:.2f} lng={f['lng']:.2f} fuel={f['fuel_level']}%"
            )
    elif intent == "low_fuel":
        for f in [f for f in flights if f["status"] == "low-fuel"][:5]:
            context_lines.append(f"LOW FUEL: {f['flight_number']} fuel={f['fuel_level']}%")
    elif intent == "track_flight":
        flight_num = intent_data.get("flight_number")
        matched = next(
            (f for f in flights if f["flight_number"] == flight_num), None
        ) if flight_num else None
        
        if not matched:
            # Fallback to keyword search if regex missed or no exact match
            words = payload.message.upper().split()
            matched = next(
                (f for f in flights for w in words if f["flight_number"] in w), None
            )

        if matched:
            context_lines.append(
                f"{matched['flight_number']} ({matched['airline']}): "
                f"lat={matched['lat']:.2f} lng={matched['lng']:.2f} "
                f"alt={matched['altitude']}ft spd={matched['speed']}kts "
                f"hdg={matched['heading']}° status={matched['status']} fuel={matched['fuel_level']}%"
            )
        else:
            context_lines.append("No matching flight found in active roster.")
    elif intent == "runway":
        try:
            from database import get_supabase
            db = get_supabase()
            rw = db.table("runways").select("*").limit(6).execute().data or []
            for r in rw:
                context_lines.append(
                    f"Runway {r['runway_id']} @ {r['airport_name']}: "
                    f"status={r['status']} assigned={r.get('assigned_flight') or 'none'}"
                )
        except Exception:
            context_lines.append("Runway data temporarily unavailable.")
    else:
        context_lines.append(f"Active flights: {flight_count}, Active alerts: {alert_count}")
        for a in alerts[:3]:
            context_lines.append(f"Alert [{a['type'].upper()}]: {a['message']}")

    context = "\n".join(context_lines) or "No specific context available."

    if _llm_available and _llm is not None:
        try:
            from langchain.schema import HumanMessage, SystemMessage
            messages = [
                SystemMessage(content=_build_system_prompt(flight_count, alert_count, context, payload.user_name)),
                HumanMessage(content=payload.message),
            ]
            ai_response = _llm.invoke(messages)
            response_text = ai_response.content
            if not response_text:
                raise ValueError("Groq returned empty response.")
        except Exception as e:
            logger.error(f"Groq query failed: {e}")
            print(f"Groq error: {e}")
            response_text = _fallback_response(intent, context)
    else:
        logger.warning("Groq LLM not available, using fallback.")
        response_text = _fallback_response(intent, context)

    return ChatResponse(
        reply=response_text,
        intent=intent,
        flight_number=intent_data.get("flight_number"),
        flight_count=flight_count,
        alert_count=alert_count,
    )


def _fallback_response(intent: str, context: str) -> str:
    responses = {
        "emergency":     f"⚠️ EMERGENCY PROTOCOL ACTIVE\n{context}\nDeclare MAYDAY. Assign priority runway immediately.",
        "low_fuel":      f"⛽ LOW FUEL ALERT\n{context}\nVector for immediate priority approach.",
        "track_flight":  f"✈️ FLIGHT DATA\n{context}",
        "runway":        f"🛬 RUNWAY STATUS\n{context}",
        "navigation":    f"🧭 NAVIGATION ADVISORY\n{context}",
        "general":       f"📡 ATC SYSTEM STATUS\n{context}",
    }
    return responses.get(intent, f"ATC: {context}")
