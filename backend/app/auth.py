import firebase_admin
from firebase_admin import credentials, auth as firebase_auth
from fastapi import Depends, HTTPException, Request, status
import os
from .config import FIREBASE_CREDENTIALS_JSON, FIRESTORE_PROJECT

# Initialize Firebase Admin SDK (only once)
def initialize_firebase():
    if not firebase_admin._apps:
        try:
            if os.path.exists(FIREBASE_CREDENTIALS_JSON):
                cred = credentials.Certificate(FIREBASE_CREDENTIALS_JSON)
                firebase_admin.initialize_app(cred)
                print(f"[INFO] Firebase initialized with credentials: {FIREBASE_CREDENTIALS_JSON}")
                if FIRESTORE_PROJECT:
                    print(f"[INFO] Using Firestore project: {FIRESTORE_PROJECT}")
            else:
                raise FileNotFoundError(f"Firebase credentials not found at: {FIREBASE_CREDENTIALS_JSON}")
        except Exception as e:
            print(f"[ERROR] Failed to initialize Firebase: {e}")
            raise

# Initialize Firebase when module is imported
initialize_firebase()

async def verify_firebase_token(request: Request):
    """
    FastAPI dependency to verify Firebase ID token from Authorization header.
    Returns the decoded token containing user info (uid, email, etc.)
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Missing Authorization header"
        )
    
    parts = auth_header.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid Authorization header format. Expected: Bearer <token>"
        )
    
    id_token = parts[1]
    try:
        decoded = firebase_auth.verify_id_token(id_token)
        # decoded contains 'uid', 'email', 'email_verified', 'exp', 'iat' etc.
        return decoded
    except Exception as e:
        # Log error for debugging but don't expose internals to client
        print(f"[ERROR] Token verification failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Invalid or expired token"
        )

# Convenience function for endpoints that need user info
async def get_current_user(token_data: dict = Depends(verify_firebase_token)):
    """
    Returns user information from verified Firebase token.
    Use this as a dependency in protected endpoints.
    """
    return {
        "uid": token_data.get("uid"),
        "email": token_data.get("email"),
        "name": token_data.get("name"),
        "picture": token_data.get("picture"),
        "email_verified": token_data.get("email_verified", False)
    }
