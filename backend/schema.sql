-- ============================================================
-- ATC Backend — Supabase Schema Migrations
-- Run this entire file in the Supabase SQL Editor:
--   Dashboard → SQL Editor → New Query → Paste → Run
-- ============================================================

-- ── 1. Extensions ────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";   -- for gen_random_uuid()

-- ── 2. Users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id          TEXT PRIMARY KEY,            -- Firebase UID
    email       TEXT UNIQUE NOT NULL,
    name        TEXT,
    badge_id    TEXT UNIQUE,
    role        TEXT NOT NULL DEFAULT 'controller',
    zone        TEXT,
    shift       TEXT,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ── 3. Flights ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS flights (
    id              SERIAL PRIMARY KEY,
    flight_number   TEXT UNIQUE NOT NULL,
    airline         TEXT NOT NULL,
    origin          TEXT,
    destination     TEXT,
    lat             DOUBLE PRECISION NOT NULL,
    lng             DOUBLE PRECISION NOT NULL,
    altitude        INTEGER,
    speed           INTEGER,
    heading         INTEGER,
    status          TEXT NOT NULL DEFAULT 'normal'
                        CHECK (status IN ('normal', 'low-fuel', 'emergency')),
    fuel_level      INTEGER,
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_flights_status      ON flights(status);
CREATE INDEX IF NOT EXISTS idx_flights_updated_at  ON flights(updated_at DESC);

-- ── 4. Alerts ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS alerts (
    id          SERIAL PRIMARY KEY,
    type        TEXT NOT NULL
                    CHECK (type IN ('proximity', 'emergency', 'low-fuel')),
    message     TEXT NOT NULL,
    flight_ref  TEXT,
    resolved    BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_alerts_resolved    ON alerts(resolved);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at  ON alerts(created_at DESC);

-- ── 5. Runways ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS runways (
    id               SERIAL PRIMARY KEY,
    airport_name     TEXT NOT NULL,
    runway_id        TEXT NOT NULL,
    status           TEXT NOT NULL DEFAULT 'active'
                         CHECK (status IN ('active', 'busy', 'maintenance', 'closed')),
    assigned_flight  TEXT,
    queue            JSONB NOT NULL DEFAULT '[]',
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (airport_name, runway_id)
);

CREATE INDEX IF NOT EXISTS idx_runways_airport ON runways(airport_name);

-- ── 6. Tracking History ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS tracking_history (
    id             SERIAL PRIMARY KEY,
    user_id        TEXT NOT NULL,
    flight_number  TEXT NOT NULL,
    airline        TEXT,
    origin         TEXT,
    destination    TEXT,
    lat            DOUBLE PRECISION,
    lng            DOUBLE PRECISION,
    status         TEXT,
    searched_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_history_user_id     ON tracking_history(user_id);
CREATE INDEX IF NOT EXISTS idx_history_searched_at ON tracking_history(searched_at DESC);

-- ── 7. Seed: Default Runways ─────────────────────────────────
-- Adds default runways for the 5 major airports used in the sim.
INSERT INTO runways (airport_name, runway_id, status, queue) VALUES
    ('New York JFK',        '04R', 'active',      '[]'),
    ('New York JFK',        '31L', 'active',      '[]'),
    ('London Heathrow',     '09R', 'active',      '[]'),
    ('London Heathrow',     '27L', 'busy',        '[]'),
    ('Dubai Int.',          '12L', 'active',      '[]'),
    ('Dubai Int.',          '30R', 'active',      '[]'),
    ('Delhi Indira Gandhi', '10',  'active',      '[]'),
    ('Delhi Indira Gandhi', '28',  'maintenance', '[]'),
    ('Singapore Changi',    '02C', 'active',      '[]'),
    ('Singapore Changi',    '20C', 'active',      '[]')
ON CONFLICT (airport_name, runway_id) DO NOTHING;

-- ── Done ─────────────────────────────────────────────────────
-- All tables are ready. Start the backend with:
--   cd backend && uvicorn main:app --reload --port 8000
