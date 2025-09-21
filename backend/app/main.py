from fastapi import FastAPI, Depends, HTTPException
import subprocess, sys
import os
from fastapi.middleware.cors import CORSMiddleware
from .config import CORS_ORIGINS, SCRAPER_DIR
from .api_routes import router
import uuid
import json
from typing import Optional, Dict, Any
from pydantic import BaseModel
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
    save_counselling_session,
)
from .llm import evaluate_answer as llm_evaluate_answer
from .llm import generate_next_question as llm_generate_next_question
from .llm import answer_question as llm_answer_question
from .llm import generate_career_paths as llm_generate_career_paths

# Optional Redis cache
try:
    import redis  # type: ignore
    REDIS_URL = os.getenv("REDIS_URL")
    _redis = redis.from_url(REDIS_URL) if REDIS_URL else None
except Exception:
    _redis = None

app = FastAPI(title="MentorMate Backend", version="0.1.0")

# --- Pydantic models (temporarily kept here until api_routes refactor is complete) ---
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

class OpportunityCreate(BaseModel):
    title: str
    type: str  # Internship | Competition | Job | Scholarship | Fellowship
    education_level: Optional[list[str]] = None
    domain: Optional[list[str]] = None
    skills_required: Optional[list[str]] = None
    location: Optional[str] = None
    description: Optional[str] = None
    eligibility: Optional[str] = None
    deadline: Optional[str] = None  # ISO date string
    link: Optional[str] = None
    id: Optional[str] = None  # allow client-supplied id

class OpportunitySearchRequest(BaseModel):
    q: Optional[str] = None
    type: Optional[str] = "All"  # Internship|Job|Competition|All
    education_level: Optional[str] = "Auto"  # School|College|Graduate|Auto
    domain: Optional[str] = "All"
    location: Optional[str] = "All"  # Remote|City|CountryCode|All
    deadline_before: Optional[str] = None  # YYYY-MM-DD
    sort: Optional[str] = "relevance"  # relevance|deadline_soon|newest
    page: int = 1
    page_size: int = 20
    source: Optional[str] = None  # e.g., 'unstop'

class SaveOpportunityRequest(BaseModel):
    opportunityId: str

class CounsellingRequest(BaseModel):
    user_message: str
    session_id: Optional[str] = None
    conversation_history: Optional[list] = None
    user_profile: Optional[Dict[str, Any]] = None

# Kick off scraper once on startup so fresh opportunities are available
@app.on_event("startup")
async def _run_scraper_startup():
    try:
        env = os.environ.copy()
        # Limit pages on startup; can be overridden via env
        env.setdefault("UNSTOP_MAX_PAGES", "1")
        print(f"[INFO] Starting scraper in background from {SCRAPER_DIR} ...")
        subprocess.Popen([sys.executable, "-m", "scraper.unstop_scraper"], cwd=SCRAPER_DIR, env=env)
    except Exception as e:
        print(f"[WARN] Failed to start scraper on startup: {e}")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Kick off scraper once on startup so fresh opportunities are available
@app.on_event("startup")
async def _run_scraper_startup():
    try:
        env = os.environ.copy()
        env.setdefault("UNSTOP_MAX_PAGES", "1")
        print(f"[INFO] Starting scraper in background from {SCRAPER_DIR} ...")
        subprocess.Popen([sys.executable, "-m", "scraper.unstop_scraper"], cwd=SCRAPER_DIR, env=env)
    except Exception as e:
        print(f"[WARN] Failed to start scraper on startup: {e}")

# Include all API/business logic routes
app.include_router(router)

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

# ----- Opportunity Finder API -----
@app.post("/opportunities")
async def create_opportunity_endpoint(payload: OpportunityCreate, user: dict = Depends(get_current_user)):
    """Create or update an opportunity document (for admin/editor workflows)."""
    try:
        # Minimal authorization: any authenticated user can create; tighten if needed
        oid = create_opportunity(payload.id, payload.dict())
        return {"success": True, "id": oid}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create opportunity: {str(e)}")

@app.get("/opportunities")
async def list_opportunities_endpoint(
    type: Optional[str] = None,
    education_level: Optional[str] = None,
    domain: Optional[str] = None,
    location: Optional[str] = None,
    deadline_from: Optional[str] = None,
    skill: Optional[str] = None,
    limit: int = 50,
    user: dict = Depends(get_current_user),
):
    """List opportunities with optional filters. Filters map to Firestore queries."""
    try:
        filters = {}
        if type: filters["type"] = type
        if education_level: filters["education_level"] = education_level
        if domain: filters["domain"] = domain
        if location: filters["location"] = location
        if deadline_from: filters["deadline_from"] = deadline_from
        if skill: filters["skills_required"] = skill
        items = list_opportunities(filters, min(max(limit, 1), 100))
        return {"success": True, "items": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list opportunities: {str(e)}")

@app.post("/opportunities/{opportunity_id}/save")
async def save_opportunity_endpoint(opportunity_id: str, status: Optional[str] = "saved", user: dict = Depends(get_current_user)):
    try:
        doc = save_opportunity_for_user(user["uid"], opportunity_id, status or "saved")
        return {"success": True, "saved": doc}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save opportunity: {str(e)}")

@app.delete("/opportunities/{opportunity_id}/save")
async def unsave_opportunity_endpoint(opportunity_id: str, user: dict = Depends(get_current_user)):
    try:
        unsave_opportunity_for_user(user["uid"], opportunity_id)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to unsave opportunity: {str(e)}")

@app.get("/opportunities/saved")
async def list_saved_opportunities_endpoint(user: dict = Depends(get_current_user)):
    try:
        items = list_saved_opportunities(user["uid"])
        return {"success": True, "items": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list saved opportunities: {str(e)}")

@app.post("/opportunities/{opportunity_id}/applied")
async def mark_applied_opportunity_endpoint(opportunity_id: str, notes: Optional[str] = None, user: dict = Depends(get_current_user)):
    try:
        doc = mark_applied_opportunity(user["uid"], opportunity_id, notes)
        return {"success": True, "applied": doc}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to mark applied: {str(e)}")

@app.get("/opportunities/applied")
async def list_applied_opportunities_endpoint(user: dict = Depends(get_current_user)):
    try:
        items = list_applied_opportunities(user["uid"])
        return {"success": True, "items": items}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to list applied opportunities: {str(e)}")

# ----- API: Opportunities Search -----

def _score_relevance(item: Dict[str, Any], q: str) -> int:
    try:
        ql = (q or "").strip().lower()
        if not ql:
            return 0
        title = str(item.get("title", "")).lower()
        company = str(item.get("company", "")).lower()
        desc = str(item.get("description", "")).lower() + " " + str(item.get("full_description", "")).lower()
        score = 0
        for token in ql.split():
            if token in title:
                score += 5
            if token in company:
                score += 2
            if token in desc:
                score += 1
        return score
    except Exception:
        return 0

def _personalized_score(item: Dict[str, Any], user_ctx: Dict[str, Any]) -> float:
    """Compute simple personalized score per spec and return 0..100.
    base=10, +30 domain intersects interests, +20 skills intersects, +10 location match, -20 if deadline in <=24h.
    """
    try:
        score = 10.0
        interests = set([str(x).lower() for x in (user_ctx.get("interests") or [])])
        if not interests and isinstance(user_ctx.get("chosen_domain"), str):
            interests = {user_ctx.get("chosen_domain").lower()}
        domains = set([str(x).lower() for x in (item.get("domain") or [])])
        if interests and domains and interests.intersection(domains):
            score += 30

        user_skills = set([str(x).lower() for x in (user_ctx.get("skills") or [])])
        skills_required = set([str(x).lower() for x in (item.get("skills_required") or [])])
        if user_skills and skills_required and user_skills.intersection(skills_required):
            score += 20

        pref_loc = (user_ctx.get("preferred_location") or user_ctx.get("location") or "").strip().lower()
        item_loc = (item.get("location") or "").strip().lower()
        if pref_loc and item_loc and (pref_loc == item_loc or pref_loc in item_loc or item_loc in pref_loc):
            score += 10

        # Deadline penalty if within 24h
        from datetime import datetime, timezone
        dl = item.get("deadline")
        if dl:
            try:
                # Accept YYYY-MM-DD or ISO
                if len(dl) == 10:
                    dt = datetime.strptime(dl, "%Y-%m-%d").replace(tzinfo=timezone.utc)
                else:
                    dt = datetime.fromisoformat(dl.replace("Z", "+00:00"))
                now = datetime.now(timezone.utc)
                if (dt - now).total_seconds() <= 86400:
                    score -= 20
            except Exception:
                pass
        # Clamp 0..100
        score = max(0.0, min(100.0, score))
        return score
    except Exception:
        return 0.0


def _cache_get(key: str):
    if not _redis:
        return None
    try:
        data = _redis.get(key)
        return json.loads(data) if data else None
    except Exception:
        return None


def _cache_set(key: str, value: dict, ttl_seconds: int = 600):
    if not _redis:
        return
    try:
        _redis.setex(key, ttl_seconds, json.dumps(value))
    except Exception:
        pass


@app.post("/api/opportunities/search")
async def search_opportunities(payload: OpportunitySearchRequest, user: dict = Depends(get_current_user)):
    try:
        # Cache key: user + query
        cache_key = None
        try:
            cache_key = f"search:{user['uid']}:{json.dumps(payload.dict(), sort_keys=True)}"
        except Exception:
            pass
        if cache_key:
            cached = _cache_get(cache_key)
            if cached:
                cached["cached"] = True
                return cached

        # Build filters
        filters: Dict[str, Any] = {}
        if payload.type and payload.type != "All":
            filters["type"] = payload.type
        # Education level
        edu = payload.education_level or "Auto"
        if edu == "Auto":
            latest = get_latest_counselling_session(user["uid"]) or {}
            auto_edu = latest.get("education_level")
            if isinstance(auto_edu, str) and auto_edu:
                filters["education_level"] = auto_edu
        elif edu and edu != "All":
            filters["education_level"] = edu
        # Domain
        if payload.domain and payload.domain != "All":
            filters["domain"] = payload.domain
        # Location
        if payload.location and payload.location != "All":
            filters["location"] = payload.location
        # Source filter
        if payload.source:
            filters["source"] = payload.source
        # Deadline range
        from datetime import datetime
        if payload.deadline_before:
            try:
                filters["deadline_to"] = payload.deadline_before
            except Exception:
                pass

        # Sorting
        order_by = None
        descending = False
        if payload.sort == "deadline_soon":
            order_by = "deadline"
            descending = False
        elif payload.sort == "newest":
            order_by = "fetched_at"
            descending = True

        # Pagination
        page_size = max(1, min(payload.page_size or 20, 50))
        page = max(1, payload.page or 1)
        offset = (page - 1) * page_size

        # Query Firestore
        items = list_opportunities(filters=filters, limit=page_size, order_by=order_by, descending=descending, offset=offset)

        # Naive full-text scoring on current page if q provided
        q = (payload.q or "").strip()
        if q:
            items.sort(key=lambda it: _score_relevance(it, q), reverse=True)

        # Personalized scoring when sort=relevance
        if (payload.sort or "relevance") == "relevance":
            latest = get_latest_counselling_session(user["uid"]) or {}
            for it in items:
                it["score_cache"] = _personalized_score(it, latest)
            items.sort(key=lambda it: it.get("score_cache", 0), reverse=True)

        response = {
            "total": -1,
            "page": page,
            "page_size": page_size,
            "items": items,
            "partial": True,
            "cached": False,
        }

        # Cache the response (approximate) for 10 minutes
        if cache_key:
            _cache_set(cache_key, response, ttl_seconds=int(os.getenv("SEARCH_CACHE_TTL", "600")))
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Search failed: {str(e)}")


@app.get("/api/opportunities/{opportunity_id}")
async def get_opportunity(opportunity_id: str, user: dict = Depends(get_current_user)):
    try:
        data = get_opportunity_by_id(opportunity_id)
        if not data:
            raise HTTPException(status_code=404, detail="Not found")
        return data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch opportunity: {str(e)}")


@app.post("/api/users/{uid}/saved_opportunities")
async def save_user_opportunity(uid: str, payload: SaveOpportunityRequest, user: dict = Depends(get_current_user)):
    try:
        if uid != user["uid"]:
            raise HTTPException(status_code=403, detail="Forbidden")
        saved = save_opportunity_for_user(uid, payload.opportunityId, status="saved")
        return {"success": True, "saved": saved}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save: {str(e)}")


@app.get("/api/users/{uid}/recommended")
async def recommended_for_user(uid: str, user: dict = Depends(get_current_user)):
    try:
        if uid != user["uid"]:
            raise HTTPException(status_code=403, detail="Forbidden")
        latest = get_latest_counselling_session(uid) or {}
        filters: Dict[str, Any] = {"archived": False}
        if latest.get("education_level"):
            filters["education_level"] = latest["education_level"]
        # Use chosen_domain or interests as domain filter if present
        domain = latest.get("chosen_domain")
        if isinstance(domain, str) and domain:
            filters["domain"] = domain
        # Prefer future deadlines
        from datetime import datetime, timezone
        today_iso = datetime.now(timezone.utc).strftime("%Y-%m-%d")
        filters["deadline_from"] = today_iso
        items = list_opportunities(filters=filters, limit=20, order_by="deadline", descending=False)
        return {"success": True, "items": items}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load recommendations: {str(e)}")

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




