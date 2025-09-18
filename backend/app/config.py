import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Firebase Configuration
FIREBASE_CREDENTIALS_JSON = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "./serviceAccountKey.json")
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
