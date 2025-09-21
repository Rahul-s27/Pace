# backend/app/api_routes.py
"""
All FastAPI route and business logic, split from main.py for clarity.
Import and include this in main.py for a clean entrypoint.
"""
from fastapi import APIRouter, Depends, HTTPException
import os
import json
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uuid
from .config import CORS_ORIGINS, SCRAPER_DIR
from .auth import verify_firebase_token, get_current_user
from .db import (
    create_session, get_session, update_session,
    store_interaction, get_last_interaction, get_session_interactions,
    update_skill_state, get_skill_state,
    create_user_profile, get_user_profile, get_user_sessions,
    get_interaction, update_interaction, store_response,
    get_session_proficiency, set_session_proficiency,
    get_session_difficulty, set_session_difficulty,
    append_session_history,
    store_generated_question, create_question_interaction, create_answer_interaction,
    create_opportunity, list_opportunities,
    save_opportunity_for_user, unsave_opportunity_for_user, list_saved_opportunities,
    mark_applied_opportunity, list_applied_opportunities,
    get_latest_counselling_session,
    get_opportunity_by_id,
)
from .llm import evaluate_answer as llm_evaluate_answer
from .llm import generate_next_question as llm_generate_next_question
from .llm import answer_question as llm_answer_question
from .llm import generate_career_paths as llm_generate_career_paths

router = APIRouter()

# Legacy endpoint for frontend compatibility
from .auth import verify_firebase_token
from fastapi import Depends

@router.get("/verify-token")
async def verify_token_legacy(user_data: dict = Depends(verify_firebase_token)):
    return {
        "uid": user_data.get("uid"),
        "email": user_data.get("email"),
        "name": user_data.get("name"),
        "picture": user_data.get("picture"),
    }





