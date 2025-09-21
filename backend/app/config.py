import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Firebase Configuration
BASE_DIR = Path(__file__).resolve().parent.parent  # backend/

def _resolve_credentials() -> str:
    env_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "").strip()
    candidates = []
    if env_path:
        p = Path(env_path)
        if not p.is_absolute():
            p = (BASE_DIR / p).resolve()
        candidates.append(p)
    # Also try common locations
    candidates.extend([
        BASE_DIR / "serviceAccountKey.json",
        (BASE_DIR.parent) / "serviceAccountKey.json",
    ])
    for c in candidates:
        try:
            if c and Path(c).exists():
                return str(Path(c).resolve())
        except Exception:
            continue
    # Fallback to default relative (may fail later with clear error)
    return str((BASE_DIR / "serviceAccountKey.json").resolve())

FIREBASE_CREDENTIALS_JSON = _resolve_credentials()
FIRESTORE_PROJECT = os.getenv("FIRESTORE_PROJECT", "pace-36576")

# API Configuration
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")

# CORS Configuration
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:8080")

# LLM Configuration (for future use)
HF_API_KEY = os.getenv("HF_API_KEY", "")
LLM_MODEL = os.getenv("LLM_MODEL", "microsoft/DialoGPT-medium")

# CORS Origins
CORS_ORIGINS = [
    FRONTEND_URL,
    "http://localhost:8080",
    "http://127.0.0.1:8080",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

# Firestore client is initialized in modules that require it using
# firebase_admin.firestore.client() after Firebase Admin is initialized
# See app/auth.py for initialization

# Path to scraper project (backend/opportunity-scraper)
SCRAPER_DIR = str((BASE_DIR / "opportunity-scraper").resolve())
