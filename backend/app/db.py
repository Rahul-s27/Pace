# app/db.py
import uuid
from firebase_admin import firestore as admin_fs
from google.cloud import firestore
from google.cloud.firestore_v1 import SERVER_TIMESTAMP

# Use Firebase Admin Firestore client (initialized via app/auth.py)
def _db():
    return admin_fs.client()

# Session helpers
def create_session(session_id: str, user_id: str, domain: str, metadata: dict = None):
    doc = {
        "sessionId": session_id,
        "userId": user_id,
        "domain": domain,
        "status": "active",
        "difficulty_level": 3,  # 1..5 scale (1 easy, 5 hard)
        "proficiency": 0.5,     # 0..1 initial proficiency
        "history": {
            "scores": [],
            "questions": [],
            "answers": [],
            "difficulty_progression": [],
        },
        "createdAt": SERVER_TIMESTAMP,
        "updatedAt": SERVER_TIMESTAMP,
        "metadata": metadata or {}
    }
    _db().collection("sessions").document(session_id).set(doc)
    return doc

def get_session(session_id: str):
    doc = _db().collection("sessions").document(session_id).get()
    return doc.to_dict() if doc.exists else None

def update_session(session_id: str, updates: dict):
    updates["updatedAt"] = SERVER_TIMESTAMP
    _db().collection("sessions").document(session_id).update(updates)

# Interactions (Q/A round)
def store_interaction(session_id: str, interaction_id: str, payload: dict):
    payload = {**payload, "createdAt": SERVER_TIMESTAMP}
    _db().collection("sessions").document(session_id).collection("interactions").document(interaction_id).set(payload)

def get_interaction(session_id: str, interaction_id: str):
    doc = _db().collection("sessions").document(session_id).collection("interactions").document(interaction_id).get()
    return doc.to_dict() if doc.exists else None

def update_interaction(session_id: str, interaction_id: str, updates: dict):
    updates["updatedAt"] = SERVER_TIMESTAMP
    _db().collection("sessions").document(session_id).collection("interactions").document(interaction_id).set(updates, merge=True)

def get_last_interaction(session_id: str):
    col = _db().collection("sessions").document(session_id).collection("interactions")
    docs = col.order_by("createdAt", direction=firestore.Query.DESCENDING).limit(1).stream()
    for d in docs:
        return d.to_dict()
    return None

# ----- Session adaptive fields helpers -----
def get_session_proficiency(session_id: str) -> float:
    s = get_session(session_id)
    if not s:
        return 0.5
    try:
        return float(s.get("proficiency", 0.5))
    except Exception:
        return 0.5

def set_session_proficiency(session_id: str, value: float):
    _db().collection("sessions").document(session_id).update({
        "proficiency": float(value),
        "updatedAt": SERVER_TIMESTAMP,
    })

def get_session_difficulty(session_id: str) -> int:
    s = get_session(session_id)
    if not s:
        return 3
    try:
        return int(s.get("difficulty_level", 3))
    except Exception:
        return 3

def set_session_difficulty(session_id: str, level: int):
    _db().collection("sessions").document(session_id).update({
        "difficulty_level": int(level),
        "updatedAt": SERVER_TIMESTAMP,
    })

def append_session_history(session_id: str, field: str, entry):
    # field is one of: scores, questions, answers, difficulty_progression
    path = f"history.{field}"
    _db().collection("sessions").document(session_id).update({
        path: firestore.ArrayUnion([entry]),
        "updatedAt": SERVER_TIMESTAMP,
    })

# Skill state
def update_skill_state(user_id: str, skill: str, new_proficiency: float):
    key = f"{user_id}_{skill}"
    doc = {
        "userId": user_id,
        "skill": skill,
        "proficiency": float(new_proficiency),
        "updatedAt": SERVER_TIMESTAMP
    }
    _db().collection("skill_state").document(key).set(doc)
    return doc

# User profile helpers (for users collection)
def create_user_profile(user_id: str, profile_data: dict):
    """Create or update user profile in users/{uid}"""
    profile_data["updatedAt"] = SERVER_TIMESTAMP
    if "createdAt" not in profile_data:
        profile_data["createdAt"] = SERVER_TIMESTAMP
    
    _db().collection("users").document(user_id).set(profile_data, merge=True)
    return profile_data

def get_user_profile(user_id: str):
    """Get user profile from users/{uid}"""
    doc = _db().collection("users").document(user_id).get()
    return doc.to_dict() if doc.exists else None

# Additional helper functions
def get_session_interactions(session_id: str, limit: int = 50):
    """Get all interactions for a session, ordered by creation time"""
    col = _db().collection("sessions").document(session_id).collection("interactions")
    docs = col.order_by("createdAt").limit(limit).stream()
    interactions = []
    for doc in docs:
        interaction_data = doc.to_dict()
        interaction_data['id'] = doc.id
        interactions.append(interaction_data)
    return interactions

def get_user_sessions(user_id: str):
    """Get all sessions for a user"""
    sessions_ref = _db().collection("sessions").where("userId", "==", user_id)
    docs = sessions_ref.order_by("createdAt", direction=firestore.Query.DESCENDING).stream()
    sessions = []
    for doc in docs:
        session_data = doc.to_dict()
        session_data['id'] = doc.id
        sessions.append(session_data)
    return sessions

def get_skill_state(user_id: str, skill: str = None):
    """Get skill state for user. If skill is None, get all skills for user"""
    if skill:
        key = f"{user_id}_{skill}"
        doc = _db().collection("skill_state").document(key).get()
        return doc.to_dict() if doc.exists else None
    else:
        # Get all skills for user
        skills_ref = _db().collection("skill_state").where("userId", "==", user_id)
        docs = skills_ref.stream()
        skills = []
        for doc in docs:
            skill_data = doc.to_dict()
            skill_data['id'] = doc.id
            skills.append(skill_data)
        return skills

# Responses collection for evaluations
def store_response(response_id: str, payload: dict):
    payload = {**payload, "createdAt": SERVER_TIMESTAMP}
    _db().collection("responses").document(response_id).set(payload)
    return payload

# Questions generated storage
def store_generated_question(question_id: str, payload: dict):
    payload = {**payload, "createdAt": SERVER_TIMESTAMP}
    _db().collection("questions_generated").document(question_id).set(payload)
    return payload

def create_question_interaction(session_id: str, interaction_id: str, question_payload: dict):
    # question_payload should include fields like: question_text, options/expected_answer, question_meta
    body = {
        **question_payload,
        "createdAt": SERVER_TIMESTAMP,
        "type": "question",
    }
    _db().collection("sessions").document(session_id).collection("interactions").document(interaction_id).set(body)
    return body

# ----- Counselling sessions (per user) -----
def save_counselling_session(user_id: str, payload: dict) -> str:
    """Create a new counselling session document under users/{uid}/counselling_sessions/{sessionId}."""
    import uuid as _uuid
    session_id = payload.get("sessionId") or str(_uuid.uuid4())
    doc = {
        **payload,
        "userId": user_id,
        "createdAt": SERVER_TIMESTAMP,
        "updatedAt": SERVER_TIMESTAMP,
    }
    _db().collection("users").document(user_id).collection("counselling_sessions").document(session_id).set(doc)
    return session_id

def get_latest_counselling_session(user_id: str) -> dict | None:
    """Fetch the most recent counselling session for a user."""
    col = _db().collection("users").document(user_id).collection("counselling_sessions")
    docs = col.order_by("createdAt", direction=firestore.Query.DESCENDING).limit(1).stream()
    for d in docs:
        data = d.to_dict()
        data["sessionId"] = d.id
        return data
    return None
 
def create_answer_interaction(session_id: str, interaction_id: str, answer_payload: dict):
    # answer_payload should include fields like: answer_text (LLM answer), source: 'llm' | 'user'
    body = {
        **answer_payload,
        "createdAt": SERVER_TIMESTAMP,
        "type": "answer",
    }
    _db().collection("sessions").document(session_id).collection("interactions").document(interaction_id).set(body)
    return body
