from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
import uuid
from .config import CORS_ORIGINS
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
)
from .llm import evaluate_answer as llm_evaluate_answer
from .llm import generate_next_question as llm_generate_next_question
from .llm import answer_question as llm_answer_question
from .llm import generate_career_paths as llm_generate_career_paths

app = FastAPI(title="MentorMate Backend", version="0.1.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models for request/response
class UserProfile(BaseModel):
    name: str
    age: str
    education_level: str
    stream_of_interest: str = ""

class SessionStart(BaseModel):
    domain: str
    metadata: Optional[Dict[str, Any]] = None

class SubmitAnswer(BaseModel):
    session_id: str
    interaction_id: str
    answer_text: str

class InteractionCreate(BaseModel):
    interaction_id: str
    question_text: str
    question_meta: Optional[Dict[str, Any]] = None
    answer_text: Optional[str] = None
    evaluator_result: Optional[Dict[str, Any]] = None
    model_prompts: Optional[Dict[str, Any]] = None

class NextQuestionRequest(BaseModel):
    session_id: str
    topic: Optional[str] = None

class AskRequest(BaseModel):
    query: str
    session_id: Optional[str] = None

class AskFollowupRequest(BaseModel):
    session_id: str
    query: str

class CounsellingResult(BaseModel):
    session_id: Optional[str] = None
    interests: Optional[list[str]] = None
    preferred_skills: Optional[list[str]] = None
    personality_traits: Optional[list[str]] = None
    chosen_domain: Optional[str] = None
    difficulty_preference: Optional[str] = None

class CounsellingRequest(BaseModel):
    user_message: str
    session_id: Optional[str] = None
    conversation_history: Optional[list] = None
    user_profile: Optional[Dict[str, Any]] = None

# Public endpoints
@app.get("/")
def root():
    return {"status": "ok", "message": "MentorMate backend running."}

@app.get("/health")
async def health():
    return {"status": "ok"}

# Legacy endpoint for frontend compatibility
@app.get("/verify-token")
async def verify_token_legacy(user_data: dict = Depends(verify_firebase_token)):
    return {
        "uid": user_data.get("uid"),
        "email": user_data.get("email"),
        "name": user_data.get("name"),
        "picture": user_data.get("picture"),
    }

# Protected endpoints - User Profile Management
@app.post("/profile")
async def create_or_update_profile(
    profile_data: UserProfile,
    user: dict = Depends(get_current_user)
):
    """Create or update user profile in users/{uid}"""
    try:
        profile_dict = profile_data.dict()
        profile_dict.update({
            "email": user["email"],
            "name": user["name"],
            "picture": user.get("picture")
        })
        
        result = create_user_profile(user["uid"], profile_dict)
        return {"success": True, "profile": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save profile: {str(e)}")

@app.get("/profile")
async def get_profile(user: dict = Depends(get_current_user)):
    """Get user profile from users/{uid}"""
    try:
        profile = get_user_profile(user["uid"])
        if not profile:
            raise HTTPException(status_code=404, detail="Profile not found")
        return profile
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get profile: {str(e)}")

# Session Management Endpoints
@app.post("/start-session")
async def start_session(
    session_data: SessionStart,
    user: dict = Depends(get_current_user)
):
    """Create a new session in sessions/{sessionId}"""
    try:
        session_id = str(uuid.uuid4())
        
        # Create session document
        session_doc = create_session(
            session_id=session_id,
            user_id=user["uid"],
            domain=session_data.domain,
            metadata=session_data.metadata
        )
        
        return {
            "success": True,
            "session_id": session_id,
            "session": session_doc
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create session: {str(e)}")

@app.get("/sessions")
async def get_sessions(user: dict = Depends(get_current_user)):
    """Get all sessions for the current user"""
    try:
        sessions = get_user_sessions(user["uid"])
        return {"sessions": sessions}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get sessions: {str(e)}")

@app.get("/sessions/{session_id}")
async def get_session_detail(
    session_id: str,
    user: dict = Depends(get_current_user)
):
    """Get specific session details"""
    try:
        session = get_session(session_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Verify user owns this session
        if session.get("userId") != user["uid"]:
            raise HTTPException(status_code=403, detail="Access denied")
        
        return session
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get session: {str(e)}")

# Interaction Management Endpoints
@app.post("/submit-answer")
async def submit_answer(
    answer_data: SubmitAnswer,
    user: dict = Depends(get_current_user)
):
    """Submit answer for evaluation and store interaction"""
    try:
        # Verify session belongs to user
        session = get_session(answer_data.session_id)
        if not session or session.get("userId") != user["uid"]:
            raise HTTPException(status_code=403, detail="Access denied to session")
        
        # TODO: Add LLM evaluation logic here
        # For now, create a placeholder evaluator result
        evaluator_result = {
            "label": "pending",
            "score": 0.0,
            "feedback": "Answer submitted for evaluation"
        }
        
        # Store the interaction
        interaction_payload = {
            "interactionId": answer_data.interaction_id,
            "answer_text": answer_data.answer_text,
            "evaluator_result": evaluator_result,
            "model_prompts": {
                "eval_prompt": "TODO: Add evaluation prompt",
                "eval_response": "TODO: Add LLM response"
            }
        }
        
        store_interaction(answer_data.session_id, answer_data.interaction_id, interaction_payload)
        
        return {
            "success": True,
            "interaction_id": answer_data.interaction_id,
            "evaluator_result": evaluator_result
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to submit answer: {str(e)}")

# New: Evaluate answer using Gemini and persist results
@app.post("/evaluate-answer")
async def evaluate_answer_endpoint(
    answer_data: SubmitAnswer,
    user: dict = Depends(get_current_user)
):
    """
    Fetch the original question from Firestore, call Gemini to evaluate the user's answer,
    then store the evaluation result under responses/ and update the corresponding interaction.
    """
    try:
        # Validate session ownership
        session = get_session(answer_data.session_id)
        if not session or session.get("userId") != user["uid"]:
            raise HTTPException(status_code=403, detail="Access denied to session")

        # Fetch original interaction (question)
        interaction = get_interaction(answer_data.session_id, answer_data.interaction_id)
        if not interaction:
            raise HTTPException(status_code=404, detail="Interaction not found")

        question_text = interaction.get("question_text") or interaction.get("question") or ""
        if not question_text:
            raise HTTPException(status_code=400, detail="Interaction does not contain a question_text")

        # Derive metadata
        qmeta = interaction.get("question_meta", {}) or {}
        difficulty = qmeta.get("difficulty")
        domain = session.get("domain")
        topic = qmeta.get("topic") or (session.get("metadata", {}) or {}).get("topic")

        # Call LLM for evaluation
        eval_result = llm_evaluate_answer(
            question_text=question_text,
            user_answer=answer_data.answer_text,
            difficulty=difficulty,
            domain=domain,
            topic=topic,
        )

        # Persist response in a top-level responses collection and update interaction
        response_id = str(uuid.uuid4())
        response_payload = {
            "responseId": response_id,
            "sessionId": answer_data.session_id,
            "interactionId": answer_data.interaction_id,
            "uid": user["uid"],
            "evaluation": eval_result,
        }
        store_response(response_id, response_payload)

        # Update interaction with the evaluation and the student's answer
        update_interaction(
            answer_data.session_id,
            answer_data.interaction_id,
            {
                "answer_text": answer_data.answer_text,
                "evaluator_result": eval_result,
            },
        )

        # ----- Adaptive Engine Logic -----
        # 1) Proficiency update via Exponential Moving Average (EMA)
        old_prof = get_session_proficiency(answer_data.session_id)
        score = float(eval_result.get("score", 0.0))
        alpha = 0.3  # smoothing factor
        new_prof = max(0.0, min(1.0, alpha * score + (1 - alpha) * old_prof))
        set_session_proficiency(answer_data.session_id, new_prof)

        # 2) Difficulty adjustment based on score
        # Increase difficulty if strong performance; decrease if weak
        cur_diff = get_session_difficulty(answer_data.session_id)
        next_diff = cur_diff
        if score >= 0.85:
            next_diff = min(5, cur_diff + 1)
        elif score <= 0.40:
            next_diff = max(1, cur_diff - 1)
        # Otherwise keep the same
        if next_diff != cur_diff:
            set_session_difficulty(answer_data.session_id, next_diff)

        # 3) Session state tracking (history)
        append_session_history(answer_data.session_id, "scores", {"interactionId": answer_data.interaction_id, "score": score})
        append_session_history(answer_data.session_id, "questions", {"interactionId": answer_data.interaction_id, "text": question_text})
        append_session_history(answer_data.session_id, "answers", {"interactionId": answer_data.interaction_id, "text": answer_data.answer_text})
        append_session_history(answer_data.session_id, "difficulty_progression", {"from": cur_diff, "to": next_diff})

        return {
            "success": True,
            "response_id": response_id,
            "evaluation": eval_result,
            "proficiency": new_prof,
            "difficulty_level": next_diff,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to evaluate answer: {str(e)}")

@app.post("/ask")
async def ask_endpoint(payload: AskRequest, user: dict = Depends(get_current_user)):
    """
    Answer arbitrary user queries via Gemini. If session_id is provided, include
    lightweight context (domain/topic and last feedback) to ground the response.
    """
    try:
        context = None
        domain = None
        topic = None
        if payload.session_id:
            session = get_session(payload.session_id)
            if not session or session.get("userId") != user["uid"]:
                raise HTTPException(status_code=403, detail="Access denied to session")
            domain = session.get("domain")
            topic = (session.get("metadata", {}) or {}).get("topic")
            interactions = get_session_interactions(payload.session_id, limit=1)
            if interactions:
                last = interactions[-1]
                fb = ((last.get("evaluator_result") or {}).get("feedback"))
                if fb:
                    context = f"Last feedback: {fb}"

        result = llm_answer_question(query=payload.query, context=context, domain=domain, topic=topic)
        return {"success": True, "answer": result.get("answer", ""), "raw": result.get("raw")}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to answer query: {str(e)}")

@app.post("/counselling/save")
async def save_counselling(result: CounsellingResult, user: dict = Depends(get_current_user)):
    """
    Save counselling outcomes under users/{uid}/counselling_sessions/{sessionId}.
    """
    try:
        payload = {k: v for k, v in result.dict().items() if v is not None}
        sid = save_counselling_session(user["uid"], payload)
        return {"success": True, "session_id": sid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save counselling: {str(e)}")

@app.get("/career-paths")
async def get_career_paths(session_id: Optional[str] = None, user: dict = Depends(get_current_user)):
    """
    Generate AI career paths using latest (or specified) saved counselling session as context.
    """
    try:
        context = None
        if session_id:
            # fetch that specific counselling session under user
            # simple scan; if not found, fall back to latest
            latest = get_latest_counselling_session(user["uid"]) or {}
            if latest and latest.get("sessionId") == session_id:
                context = latest
        if context is None:
            context = get_latest_counselling_session(user["uid"]) or {}

        interests = context.get("interests")
        preferred_skills = context.get("preferred_skills")
        personality_traits = context.get("personality_traits")
        chosen_domain = context.get("chosen_domain")
        difficulty_preference = context.get("difficulty_preference")

        data = llm_generate_career_paths(
            interests=interests,
            preferred_skills=preferred_skills,
            personality_traits=personality_traits,
            chosen_domain=chosen_domain,
            difficulty_preference=difficulty_preference,
        )
        return {"success": True, **data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate career paths: {str(e)}")

@app.post("/ask-followup")
async def ask_followup(payload: AskFollowupRequest, user: dict = Depends(get_current_user)):
    """
    Answers the user's free-form question with the LLM, persists both the user's question
    and the LLM answer as interactions, then generates a related follow-up question and persists it.
    No fixed question set is used.
    """
    try:
        # Validate session and ownership
        session = get_session(payload.session_id)
        if not session or session.get("userId") != user["uid"]:
            raise HTTPException(status_code=403, detail="Access denied to session")

        domain = session.get("domain") or "general"
        topic = (session.get("metadata", {}) or {}).get("topic")
        difficulty = int(session.get("difficulty_level", 3))
        proficiency = float(session.get("proficiency", 0.5))

        # 1) Persist the user's question as an interaction
        user_q_interaction_id = str(uuid.uuid4())
        create_question_interaction(
            payload.session_id,
            user_q_interaction_id,
            {
                "question_text": payload.query,
                "question_meta": {"source": "user", "domain": domain, "topic": topic},
            },
        )

        # 2) Answer user's question via LLM
        answer_obj = llm_answer_question(query=payload.query, context=None, domain=domain, topic=topic)
        answer_text = answer_obj.get("answer", "")

        # 3) Persist LLM answer as an interaction
        llm_a_interaction_id = str(uuid.uuid4())
        create_answer_interaction(
            payload.session_id,
            llm_a_interaction_id,
            {"answer_text": answer_text, "source": "llm"},
        )

        # 4) Generate a related follow-up question using the LLM answer as context
        interactions = get_session_interactions(payload.session_id, limit=10)
        history = []
        last_feedback = None
        for it in interactions:
            item = {
                "interactionId": it.get("id"),
                "question_text": it.get("question_text") or it.get("question"),
                "answer_text": it.get("answer_text"),
                "score": ((it.get("evaluator_result") or {}).get("score")),
            }
            history.append(item)

        qdata = llm_generate_next_question(
            domain=domain,
            topic=topic,
            difficulty=difficulty,
            proficiency=proficiency,
            history=history,
            last_feedback=last_feedback,
            last_answer=answer_text,
        )

        # 5) Persist the follow-up question
        followup_interaction_id = str(uuid.uuid4())
        followup_question_id = str(uuid.uuid4())
        followup_payload = {
            "question_text": qdata.get("question", ""),
            "question_meta": {
                "difficulty": qdata.get("difficulty", difficulty),
                "topic": topic,
                "domain": domain,
                "generated_by": "gemini",
                "related_to": llm_a_interaction_id,
            },
        }
        if "options" in qdata:
            followup_payload["options"] = qdata.get("options")
        if "expected_answer" in qdata:
            followup_payload["expected_answer"] = qdata.get("expected_answer")
        if "hint" in qdata:
            followup_payload["hint"] = qdata.get("hint")

        store_generated_question(
            followup_question_id,
            {
                **followup_payload,
                "questionId": followup_question_id,
                "sessionId": payload.session_id,
                "uid": user["uid"],
                "answer_index": qdata.get("answer_index"),
            },
        )
        create_question_interaction(payload.session_id, followup_interaction_id, followup_payload)

        return {
            "success": True,
            "user_question_interaction_id": user_q_interaction_id,
            "llm_answer_interaction_id": llm_a_interaction_id,
            "followup_interaction_id": followup_interaction_id,
            "followup_question_id": followup_question_id,
            "answer": answer_text,
            "followup_question": followup_payload,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process ask-followup: {str(e)}")

@app.post("/next-question")
async def next_question(
    payload: NextQuestionRequest,
    user: dict = Depends(get_current_user)
):
    """
    Generate the next question based on session difficulty, proficiency, and recent history.
    Persist to questions_generated and also create a new interaction in the session.
    """
    try:
        # Validate session and ownership
        session = get_session(payload.session_id)
        if not session or session.get("userId") != user["uid"]:
            raise HTTPException(status_code=403, detail="Access denied to session")

        # Gather context
        difficulty = int(session.get("difficulty_level", 3))
        proficiency = float(session.get("proficiency", 0.5))
        domain = session.get("domain") or "general"
        topic = payload.topic or (session.get("metadata", {}) or {}).get("topic")

        interactions = get_session_interactions(payload.session_id, limit=10)
        # Build simple history entries
        history = []
        last_feedback = None
        for it in interactions:
            item = {
                "interactionId": it.get("id"),
                "question_text": it.get("question_text") or it.get("question"),
                "answer_text": it.get("answer_text"),
                "score": ((it.get("evaluator_result") or {}).get("score")),
            }
            history.append(item)
        if interactions:
            last = interactions[-1]
            last_feedback = ((last.get("evaluator_result") or {}).get("feedback"))

        # Call LLM to generate next question
        qdata = llm_generate_next_question(
            domain=domain,
            topic=topic,
            difficulty=difficulty,
            proficiency=proficiency,
            history=history,
            last_feedback=last_feedback,
        )

        # Normalize to our interaction schema
        interaction_id = str(uuid.uuid4())
        question_id = str(uuid.uuid4())

        question_payload = {
            "question_text": qdata.get("question", ""),
            "question_meta": {
                "difficulty": qdata.get("difficulty", difficulty),
                "topic": topic,
                "domain": domain,
                "generated_by": "gemini",
            },
        }
        # Optional fields
        if "options" in qdata:
            question_payload["options"] = qdata.get("options")
            # Store correct answer marker privately in questions_generated
        if "expected_answer" in qdata:
            question_payload["expected_answer"] = qdata.get("expected_answer")
        if "hint" in qdata:
            question_payload["hint"] = qdata.get("hint")

        # Persist generated question (with answer key if provided)
        store_generated_question(
            question_id,
            {
                **question_payload,
                "questionId": question_id,
                "sessionId": payload.session_id,
                "uid": user["uid"],
                "answer_index": qdata.get("answer_index"),
            },
        )

        # Create interaction in the session (without exposing answer_index)
        create_question_interaction(payload.session_id, interaction_id, question_payload)

        return {
            "success": True,
            "interaction_id": interaction_id,
            "question_id": question_id,
            "question": question_payload,
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate next question: {str(e)}")

@app.post("/sessions/{session_id}/interactions")
async def create_interaction(
    session_id: str,
    interaction_data: InteractionCreate,
    user: dict = Depends(get_current_user)
):
    """Create a new interaction (question) in a session"""
    try:
        # Verify session belongs to user
        session = get_session(session_id)
        if not session or session.get("userId") != user["uid"]:
            raise HTTPException(status_code=403, detail="Access denied to session")
        
        # Store the interaction
        interaction_payload = interaction_data.dict()
        store_interaction(session_id, interaction_data.interaction_id, interaction_payload)
        
        return {
            "success": True,
            "interaction_id": interaction_data.interaction_id
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create interaction: {str(e)}")

@app.get("/sessions/{session_id}/interactions")
async def get_interactions(
    session_id: str,
    user: dict = Depends(get_current_user),
    limit: int = 50
):
    """Get all interactions for a session"""
    try:
        # Verify session belongs to user
        session = get_session(session_id)
        if not session or session.get("userId") != user["uid"]:
            raise HTTPException(status_code=403, detail="Access denied to session")
        
        interactions = get_session_interactions(session_id, limit)
        return {"interactions": interactions}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get interactions: {str(e)}")

@app.get("/sessions/{session_id}/last-interaction")
async def get_last_interaction_endpoint(
    session_id: str,
    user: dict = Depends(get_current_user)
):
    """Get the last interaction for a session"""
    try:
        # Verify session belongs to user
        session = get_session(session_id)
        if not session or session.get("userId") != user["uid"]:
            raise HTTPException(status_code=403, detail="Access denied to session")
        
        last_interaction = get_last_interaction(session_id)
        return {"last_interaction": last_interaction}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get last interaction: {str(e)}")

# Skill State Management
@app.post("/skills/{skill}/update")
async def update_skill(
    skill: str,
    proficiency: float,
    user: dict = Depends(get_current_user)
):
    """Update skill proficiency for user"""
    try:
        if not (0.0 <= proficiency <= 1.0):
            raise HTTPException(status_code=400, detail="Proficiency must be between 0.0 and 1.0")
        
        result = update_skill_state(user["uid"], skill, proficiency)
        return {"success": True, "skill_state": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update skill: {str(e)}")

@app.get("/skills")
async def get_skills(user: dict = Depends(get_current_user)):
    """Get all skills for user"""
    try:
        skills = get_skill_state(user["uid"])
        return {"skills": skills}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get skills: {str(e)}")

@app.get("/skills/{skill}")
async def get_skill(
    skill: str,
    user: dict = Depends(get_current_user)
):
    """Get specific skill state for user"""
    try:
        skill_state = get_skill_state(user["uid"], skill)
        if not skill_state:
            raise HTTPException(status_code=404, detail="Skill state not found")
        return skill_state
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get skill: {str(e)}")

# Counselling Assistant Endpoint
@app.post("/counselling")
async def counselling_assistant(
    counselling_data: CounsellingRequest,
    user: dict = Depends(get_current_user)
):
    """
    Adaptive counselling assistant that provides supportive responses and generates
    relevant follow-up questions. Returns JSON with 'answer' and 'follow_up_question' fields.
    """
    try:
        from .llm import counselling_response
        
        # Get user profile if available
        user_profile = counselling_data.user_profile
        if not user_profile:
            try:
                profile = get_user_profile(user["uid"])
                user_profile = profile if profile else {}
            except:
                user_profile = {}
        
        # Get session context if session_id provided
        session_context = None
        if counselling_data.session_id:
            try:
                session = get_session(counselling_data.session_id)
                if session and session.get("userId") == user["uid"]:
                    session_context = {
                        "domain": session.get("domain"),
                        "topic": session.get("metadata", {}).get("topic") if session.get("metadata") else None,
                        "difficulty": session.get("difficulty_level"),
                        "proficiency": session.get("proficiency")
                    }
            except:
                session_context = None
        
        # Generate counselling response using LLM
        response = counselling_response(
            user_message=counselling_data.user_message,
            conversation_history=counselling_data.conversation_history or [],
            user_profile=user_profile,
            session_context=session_context
        )
        
        # If the LLM answer is a JSON blob (sometimes Gemini returns JSON as a string), parse and pretty-print
        import json
        answer_txt = (response.get("answer", "") or "").strip()
        followup_txt = (response.get("follow_up_question", "") or "").strip()
        key_points = response.get("key_points") or []

        # If answer_txt looks like JSON, parse it
        if answer_txt.startswith("{") and answer_txt.endswith("}"):
            try:
                parsed = json.loads(answer_txt)
                answer_txt = parsed.get("answer", "")
                followup_txt = parsed.get("follow_up_question", followup_txt)
                key_points = parsed.get("key_points") or key_points
            except Exception:
                pass

        # Ensure paragraphs are separated by blank lines
        def normalize_paragraphs(text: str) -> str:
            cleaned = "\n".join([p.strip() for p in text.replace("\r", "").split("\n\n")])
            return "\n\n".join(filter(None, [s.strip() for s in cleaned.split("\n") if s.strip()]))

        body_text = normalize_paragraphs(answer_txt) if answer_txt else ""

        bullet_block = ""
        if isinstance(key_points, list) and len(key_points) > 0:
            bullets = [f"• {str(pt).strip()}" for pt in key_points if str(pt).strip()]
            if bullets:
                bullet_block = "\n\nKey points:\n" + "\n".join(bullets)

        next_step_block = f"\n\nNext step: {followup_txt}" if followup_txt else ""

        combined_text = (body_text + bullet_block + next_step_block).strip()


        return {
            "success": True,
            "text": combined_text,              # Preferred: ready-to-display plain text
            "answer": answer_txt,               # Structured fields kept for flexibility
            "follow_up_question": followup_txt,
            "raw": response.get("raw")
        }
        
    except Exception as e:
        # Log full stack for debugging and return a graceful fallback so the UI doesn't break
        import traceback, sys
        traceback.print_exc(file=sys.stderr)
        fallback = (
            "I'm here to support you. Based on what you've shared, here are a few next steps you might consider:\n\n"
            "• Write down your top 2–3 goals for the next 3 months.\n"
            "• Identify one small task you can complete this week toward each goal.\n"
            "• Reflect on what resources or support you need to move forward.\n\n"
            "Next step: Would you like to focus on skills, opportunities, or planning your next actions?"
        )
        return {
            "success": True,
            "text": fallback,
            "answer": fallback,
            "follow_up_question": "Would you like to focus on skills, opportunities, or planning your next actions?",
            "raw": {"error": str(e)}
        }

# Test route to verify DB write functionality
@app.post("/test-create-session")
async def test_create_session(payload: dict, user = Depends(verify_firebase_token)):
    """Test route to verify Firestore write operations work correctly"""
    try:
        session_id = str(uuid.uuid4())
        session_doc = create_session(session_id, user["uid"], payload.get("domain", "test"))
        return {
            "success": True,
            "session_id": session_id,
            "session": session_doc,
            "message": "Test session created successfully"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create test session: {str(e)}")
