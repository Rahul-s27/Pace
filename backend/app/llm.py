import os
from typing import Dict, Any
from dotenv import load_dotenv

# Load env for local dev
load_dotenv()

# Prefer Google Gemini (google-generativeai)
# Fallback plan could be added later for HF, etc.
try:
    import google.generativeai as genai
except ImportError as e:
    genai = None

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
DEFAULT_MODEL = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

class LLMNotConfigured(Exception):
    pass


def _get_model():
    if genai is None:
        raise LLMNotConfigured("google-generativeai is not installed. Add it to requirements.txt")
    if not GOOGLE_API_KEY:
        raise LLMNotConfigured("GOOGLE_API_KEY (or GEMINI_API_KEY) is not set in environment")
    genai.configure(api_key=GOOGLE_API_KEY)
    return genai.GenerativeModel(DEFAULT_MODEL)


def evaluate_answer(
    *,
    question_text: str,
    user_answer: str,
    difficulty: str | int | None = None,
    domain: str | None = None,
    topic: str | None = None,
) -> Dict[str, Any]:
    """
    Calls Gemini to evaluate a user's answer against a question.
    Returns a dict with keys: score (0..1), feedback (str), understood_concept (bool)
    """
    model = _get_model()

    system_instruction = (
        "You are an educational evaluator. Given a question and a student's answer, "
        "analyze correctness, provide concise constructive feedback, and decide whether the student "
        "has understood the core concept. Output valid JSON only with keys: score (0..1), feedback (string), understood_concept (boolean)."
    )

    meta = []
    if difficulty is not None:
        meta.append(f"difficulty: {difficulty}")
    if domain:
        meta.append(f"domain: {domain}")
    if topic:
        meta.append(f"topic: {topic}")
    meta_str = ", ".join(meta)

    prompt = f"""
{system_instruction}

Context: {meta_str}

Question:
{question_text}

Student Answer:
{user_answer}

Respond with JSON only, like:
{{
  "score": 0.85,
  "feedback": "Your steps are correct; minor arithmetic slip in the last step.",
  "understood_concept": true
}}
"""

    generation_config = {
        "max_output_tokens": 1024,
        "temperature": 0.1,
    }
    completion = model.generate_content(prompt, generation_config=generation_config)
    text = completion.text.strip() if completion and completion.text else "{}"

    # Attempt to parse JSON result
    import json
    try:
        data = json.loads(text)
        # Normalize/validate
        score = float(data.get("score", 0.0))
        feedback = str(data.get("feedback", ""))
        understood = bool(data.get("understood_concept", False))
        return {
            "score": max(0.0, min(1.0, score)),
            "feedback": feedback,
            "understood_concept": understood,
            "raw": data,
        }
    except Exception:
        # Fallback if model didn't output clean JSON
        return {
            "score": 0.0,
            "feedback": text[:2000],
            "understood_concept": False,
            "raw_text": text,
        }


def generate_next_question(
    *,
    domain: str,
    topic: str | None,
    difficulty: int,
    proficiency: float,
    history: list[dict] | None,
    last_feedback: str | None,
    last_answer: str | None = None,
) -> Dict[str, Any]:
    """
    Ask Gemini to generate the next question tailored to the learner.
    Enforce structured JSON output with one of the two shapes:
    - {"question": str, "options": [str, ...], "answer_index": int, "difficulty": int, "hint": str}
    - {"question": str, "expected_answer": str, "difficulty": int, "hint": str}
    """
    model = _get_model()

    sys_inst = (
        "You are a tutoring question generator. Using the provided context and learner state, "
        "generate the NEXT question that is pedagogically sound and appropriately difficult. "
        "Use the learner's mistakes to craft helpful hints. "
        "Respond with strict JSON only."
    )

    hist_snippets = []
    if history:
        for h in history[-5:]:  # include last few interactions
            q = h.get("question_text") or h.get("question") or ""
            a = h.get("answer_text") or ""
            s = h.get("score")
            hist_snippets.append(f"Q: {q}\nA: {a}\nscore: {s}")
    hist_block = "\n\n".join(hist_snippets)

    prompt = f"""
{sys_inst}

Domain: {domain}
Topic: {topic or 'general'}
Current difficulty level (1..5): {difficulty}
Learner proficiency (0..1): {proficiency}
Last feedback: {last_feedback or 'n/a'}
Last answer summary: { (last_answer[:500] if last_answer else 'n/a') }

Recent history (most recent last):
{hist_block}

Output JSON ONLY. Choose ONE of the two formats:
MCQ format:
{{
  "question": "...",
  "options": ["...", "...", "...", "..."],
  "answer_index": 1,
  "difficulty": {difficulty},
  "hint": "..."  // optional
}}

Open-ended format:
{{
  "question": "...",
  "expected_answer": "...",
  "difficulty": {difficulty},
  "hint": "..."  // optional
}}
"""

    completion = model.generate_content(prompt)
    out = completion.text.strip() if completion and completion.text else "{}"
    import json
    try:
        data = json.loads(out)
        # normalize
        data["difficulty"] = int(data.get("difficulty", difficulty))
        return data
    except Exception:
        # fallback minimal question
        return {
            "question": "Describe your approach to the last problem and correct any mistakes.",
            "expected_answer": "A brief explanation focusing on the core concept.",
            "difficulty": difficulty,
            "hint": last_feedback or "Review the previous feedback.",
            "raw_text": out,
        }


def answer_question(*, query: str, context: str | None = None, domain: str | None = None, topic: str | None = None) -> Dict[str, Any]:
    """
    General-purpose Q&A using Gemini. Returns a dict with 'answer' (string) and 'raw' metadata.
    """
    model = _get_model()
    sys_inst = (
        "You are a helpful, precise tutor. Provide a clear, concise answer."
    )
    prefix = []
    if domain:
        prefix.append(f"Domain: {domain}")
    if topic:
        prefix.append(f"Topic: {topic}")
    if context:
        prefix.append(f"Context: {context}")
    header = "\n".join(prefix)

    prompt = f"""
{sys_inst}
{header}

Question:
{query}
"""
    completion = model.generate_content(prompt)
    answer_text = completion.text.strip() if completion and completion.text else ""
    return {"answer": answer_text, "raw": getattr(completion, "candidates", None)}


def generate_career_paths(
    *,
    interests: list[str] | None,
    preferred_skills: list[str] | None,
    personality_traits: list[str] | None,
    chosen_domain: str | None,
    difficulty_preference: str | None,
) -> Dict[str, Any]:
    """
    Ask Gemini to return JSON with an array of career options based on user counselling context.
    Output JSON shape:
    {
      "careers": [
        {
          "title": str,
          "why_fit": str,
          "required_skills": [str, ...],
          "learning_roadmap": [str, ...],
          "future_growth": str,
          "related_roles": [str, ...]
        }, ...
      ]
    }
    """
    model = _get_model()
    sys_inst = (
        "You are an AI career advisor. Return STRICT JSON only."
    )
    prompt = f"""
{sys_inst}

User profile:
- Interests: {interests or []}
- Preferred skills: {preferred_skills or []}
- Chosen domain: {chosen_domain or 'unspecified'}
- Difficulty preference: {difficulty_preference or 'unspecified'}

Task:
Based on the profile and current job market trends, suggest suitable career paths.
For each career, include:
- title
- why_fit
- required_skills (array)
- learning_roadmap (array of short actionable steps)
- future_growth
- related_roles (array)

Return JSON ONLY:
{{
  "careers": [
    {{
      "title": "...",
      "why_fit": "...",
      "required_skills": ["..."],
      "learning_roadmap": ["...", "..."],
      "future_growth": "...",
      "related_roles": ["...", "..."]
    }}
  ]
}}
"""
    completion = model.generate_content(prompt)
    text = completion.text.strip() if completion and completion.text else "{}"
    import json
    try:
        data = json.loads(text)
        if not isinstance(data.get("careers"), list):
            data["careers"] = []
        return data
    except Exception:
        # Fallback minimal JSON
        return {
            "careers": []
        }


def counselling_response(
    *,
    user_message: str,
    conversation_history: list = None,
    user_profile: dict = None,
    session_context: dict = None,
) -> Dict[str, Any]:
    """
    Adaptive counselling assistant that provides supportive responses and generates
    relevant follow-up questions. Returns JSON with 'answer' and 'follow_up_question' fields.
    """
    model = _get_model()
    
    # Build context from user profile
    profile_context = ""
    if user_profile:
        profile_parts = []
        if user_profile.get("name"):
            profile_parts.append(f"Name: {user_profile['name']}")
        if user_profile.get("age"):
            profile_parts.append(f"Age: {user_profile['age']}")
        if user_profile.get("education_level"):
            profile_parts.append(f"Education Level: {user_profile['education_level']}")
        if user_profile.get("stream_of_interest"):
            profile_parts.append(f"Stream of Interest: {user_profile['stream_of_interest']}")
        if profile_parts:
            profile_context = f"User Profile: {', '.join(profile_parts)}\n"
    
    # Build session context
    session_info = ""
    if session_context:
        session_parts = []
        if session_context.get("domain"):
            session_parts.append(f"Domain: {session_context['domain']}")
        if session_context.get("topic"):
            session_parts.append(f"Topic: {session_context['topic']}")
        if session_context.get("difficulty"):
            session_parts.append(f"Difficulty Level: {session_context['difficulty']}")
        if session_context.get("proficiency"):
            session_parts.append(f"Proficiency: {session_context['proficiency']}")
        if session_parts:
            session_info = f"Session Context: {', '.join(session_parts)}\n"
    
    # Build conversation history
    history_text = ""
    if conversation_history:
        history_parts = []
        for i, msg in enumerate(conversation_history[-5:]):  # Last 5 messages
            sender = msg.get("sender", "unknown")
            content = msg.get("content", "")
            history_parts.append(f"{sender}: {content}")
        if history_parts:
            history_text = f"Recent Conversation:\n" + "\n".join(history_parts) + "\n"
    
    system_instruction = """
You are an adaptive counselling assistant specializing in career guidance and personal development. Your role is to:

1. Provide clear, supportive, and detailed answers to the user's questions or concerns
2. Structure your reply as:
   - 1-2 short introductory paragraphs
   - 3-7 concise bullet points (use bullets, not dashes or numbers)
   - 1 unique, context-aware follow-up question (never generic)
3. Never use JSON, code blocks, or any markup—output only plain text suitable for direct display in a chat UI.
4. Maintain a professional yet empathetic counselling tone
5. Guide the user step-by-step toward deeper understanding

Important guidelines:
- Be empathetic and non-judgmental
- Ask open-ended questions that encourage self-reflection
- Build on previous conversation context
- Focus on career guidance, personal development, and educational pathways
- Keep responses conversational yet professional
- Aim for a thorough response (8-12 sentences + bullets) with concrete, actionable suggestions where appropriate
- Do NOT use any generic or repeated follow-up questions. Every follow-up must be tailored to the user's message and your answer, and always appear as the last paragraph prefixed with 'Next step:'
"""

    generation_config = {
        "max_output_tokens": 1536,
        "temperature": 0.45,
    }
    prompt = f"""{system_instruction}

{profile_context}{session_info}{history_text}User's current message: {user_message}

Reply in plain text ONLY (no JSON, no code blocks). Use:
- 1-2 short introductory paragraphs
- 3-7 concise bullet points (use bullets, not dashes or numbers)
- End with a unique, context-aware follow-up question as the last paragraph, prefixed with 'Next step:'
"""
    completion = model.generate_content(prompt, generation_config=generation_config)
    response_text = completion.text.strip() if completion and completion.text else ""
    return {
        "answer": response_text,
        "raw": response_text
    }
