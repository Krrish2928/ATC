"""
Configuration module using pydantic-settings.
Loads all environment variables from .env file.
"""
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""

    SUPABASE_URL: str
    SUPABASE_KEY: str
    FIREBASE_CREDENTIALS_PATH: str = "./firebase-credentials.json"
    GROQ_API_KEY: str
    SECRET_KEY: str = "atc-secret-key-2024"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


settings = Settings()
