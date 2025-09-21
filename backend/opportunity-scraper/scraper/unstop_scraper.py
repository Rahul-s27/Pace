import os
import logging
from pathlib import Path
import hashlib
from datetime import datetime, timezone
from typing import Dict, Any, Optional

import requests
import certifi

import firebase_admin
from firebase_admin import credentials, firestore

# -----------------------------
# Environment & Firestore init
# -----------------------------
# Load .env if present (local dev convenience)
try:
    from dotenv import load_dotenv  # type: ignore
    # Try current dir and up to two parents
    cur = Path(__file__).resolve().parent
    for env_path in [cur / ".env", cur.parent / ".env", cur.parent.parent / ".env"]:
        try:
            if env_path.exists():
                load_dotenv(env_path)  # do not override existing env
                break
        except Exception:
            continue
except Exception:
    pass

PROJECT_ID = os.getenv("FIRESTORE_PROJECT")
_sa_env = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "").strip()
BASE_DIR = Path(__file__).resolve().parent
_candidate_paths = [
    _sa_env or None,
    str(BASE_DIR / "serviceAccountKey.json"),
    str((BASE_DIR.parent) / "serviceAccountKey.json"),
    str((BASE_DIR.parent.parent) / "serviceAccountKey.json"),
]
SA_PATH = None
for p in _candidate_paths:
    if not p:
        continue
    if Path(p).exists():
        SA_PATH = p
        break

def _env_float(name: str, default: float) -> float:
    try:
        raw = os.getenv(name)
        if not raw:
            return default
        return float(str(raw).strip().split()[0])
    except Exception:
        return default

def _env_int(name: str, default: int) -> int:
    try:
        raw = os.getenv(name)
        if not raw:
            return default
        return int(str(raw).strip().split()[0])
    except Exception:
        return default

MIN_DELAY = _env_float("SCRAPER_MIN_DELAY", 1.0)
MAX_DELAY = _env_float("SCRAPER_MAX_DELAY", 3.0)
MAX_PAGES = _env_int("UNSTOP_MAX_PAGES", 3)

if not firebase_admin._apps:
    if not SA_PATH:
        searched = [p for p in _candidate_paths if p]
        raise RuntimeError(
            "Service account JSON not found. Set GOOGLE_APPLICATION_CREDENTIALS or place serviceAccountKey.json in one of: "
            + ", ".join(searched)
        )
    cred = credentials.Certificate(SA_PATH)
    firebase_admin.initialize_app(cred, {"projectId": PROJECT_ID} if PROJECT_ID else None)

db = firestore.client()

API_URL = "https://unstop.com/api/public/opportunity/search-result"

# Logger
logger = logging.getLogger(__name__)

# Map our categories to Unstop 'opportunity' query param
OPPORTUNITY_PARAM = {
    "HACKATHON": "hackathons",
    "COMPETITION": "competitions",
    "INTERNSHIP": "internships",
    "JOB": "jobs",
    "SCHOLARSHIP": "scholarships",
}

# Minimal browser-like headers recommended for Unstop API
BASE_HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
        "AppleWebKit/537.36 (KHTML, like Gecko) "
        "Chrome/120.0.0.0 Safari/537.36"
    ),
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br, zstd",
    "Content-Type": "application/json;charset=UTF-8",
    "Origin": "https://unstop.com",
    "Sec-Fetch-Site": "same-origin",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Dest": "empty",
    "Connection": "keep-alive",
}

# -----------------------------
# Helpers
# -----------------------------

def _sleep_jitter():
    # Legacy stub (no-op)
    return


def _parse_date_from_text(text: str) -> Optional[str]:
    # Legacy stub (no-op)
    return None


def _now_ts():
    return firestore.SERVER_TIMESTAMP


def generate_id(url: str) -> str:
    """Generate deterministic ID from URL using SHA256."""
    return hashlib.sha256(url.encode("utf-8")).hexdigest()


def _deterministic_id_from_unstop(title: str, company: Optional[str], location: str, apply_link: str) -> str:
    # Legacy stub
    return generate_id(apply_link or "")


def _upsert_opportunity(doc: Dict[str, Any]):
    # Legacy stub (no-op)
    return


def _log_source(payload: Dict[str, Any]) -> str:
    # Legacy stub (no-op)
    return "log:disabled"


# -----------------------------
# Unstop API Scraper
# -----------------------------

def generate_id(url: str) -> str:
    return hashlib.sha256(url.encode("utf-8")).hexdigest()

def fetch_and_store(category: str, page: int = 1, per_page: int = 24) -> int:
    """Fetch a single page for the given category and store. Returns number of items stored."""
    logger.info("🔎 Fetching %s page %s", category, page)
    # Minimal headers per Unstop's frontend usage
    headers = {
        "User-Agent": BASE_HEADERS["User-Agent"],
        "Accept": "application/json, text/plain, */*",
        "Referer": f"https://unstop.com/{OPPORTUNITY_PARAM.get(category, '').strip()}",
    }
    params = {
        "opportunity": OPPORTUNITY_PARAM.get(category, ""),
        "page": page,
        "per_page": per_page,
        "oppstatus": "open",
    }
    try:
        resp = requests.get(API_URL, params=params, headers=headers, timeout=20, verify=certifi.where(), proxies={})
    except Exception as e:
        logger.warning("[REQUEST] Failed: %s", e)
        return 0
    if resp.status_code != 200:
        logger.warning("[REQUEST] Status %s: %s", resp.status_code, resp.text[:800])
        return 0
    try:
        data = resp.json()
    except Exception:
        logger.warning("[PARSER] Response is not JSON; raw (first 800 chars): %s", resp.text[:800])
        return 0

    # Try common shapes
    items = []
    if isinstance(data, list):
        items = data
    elif isinstance(data, dict):
        # Some responses are like {data: [...]} or {results: [...]} or nested
        if isinstance(data.get("data"), list):
            items = data.get("data", [])
        elif isinstance(data.get("data"), dict) and isinstance(data["data"].get("data"), list):
            items = data["data"].get("data", [])
        elif isinstance(data.get("results"), list):
            items = data.get("results", [])

    logger.info("👉 Found %s %s (page %s)", len(items), category.lower() + "s", page)

    # Optional debug: show keys of the first item to help mapping if needed
    try:
        if os.getenv("UNSTOP_DEBUG", "").strip():
            if items:
                logger.debug("[DEBUG] First item keys: %s", list(items[0].keys()))
    except Exception:
        pass

    stored = 0
    for item in items:
        # Title fallbacks
        title = (
            item.get("title")
            or item.get("name")
            or item.get("opportunity_title")
            or item.get("opportunity_name")
        )
        # Organization fallbacks (handle nested org dict too)
        org = (
            item.get("organization_name")
            or item.get("organizationName")
            or item.get("org_name")
            or item.get("company_name")
        )
        if not org and isinstance(item.get("organization"), dict):
            org = item["organization"].get("name") or item["organization"].get("title")

        # URL/slug fallbacks
        url = (
            item.get("url")
            or item.get("link")
            or item.get("public_url")
            or item.get("share_url")
            or item.get("seo_link")
            or item.get("seo_url")
        )
        slug = (
            item.get("slug")
            or item.get("opportunity_slug")
            or item.get("opportunity_url_slug")
        )
        link = None
        if url:
            try:
                u = str(url)
                if u.startswith("http"):
                    link = u
                else:
                    link = "https://unstop.com" + (u if u.startswith("/") else f"/{u}")
            except Exception:
                link = None
        if not link and slug:
            path = OPPORTUNITY_PARAM.get(category, "")
            link = f"https://unstop.com/{path}/{slug}"

        # Deadline fallbacks
        deadline = (
            item.get("submissionDeadline")
            or item.get("deadline")
            or item.get("end_date")
            or item.get("endDate")
            or item.get("application_end_date")
        )

        # Ensure minimum fields present
        if not (title and link):
            continue

        try:
            doc_id = generate_id(link)
            db.collection("opportunities").document(doc_id).set({
                "id": doc_id,
                "title": title,
                "organization": org,
                "apply_link": link,
                "deadline": deadline,
                "type": category,
                "source": "unstop",
                "status": "open" if deadline else "unknown",
                "fetched_at": datetime.now(timezone.utc)
            }, merge=True)
            stored += 1
        except Exception as e:
            logger.warning("[UPSERT] Failed to upsert item: %s", e)
    return stored


def fetch_page(url: str) -> Optional[str]:
    # Legacy stub (no-op)
    return None


def parse_list(html: str, base_url: str):
    # Legacy stub (no-op)
    return []


def map_card_to_doc(card: Dict[str, Any], category: str) -> Dict[str, Any]:
    # Legacy stub (no-op)
    return {}


def scrape_category(category: str, base_url: str):
    # Legacy stub (no-op)
    return


async def _extract_cards_playwright(page, category: str, base_url: str):
    # Legacy stub (no-op)
    return []


async def scrape_category_playwright(page, category: str, base_url: str):
    # Legacy stub (no-op)
    return


async def scrape_unstop():
    # Legacy stub (no-op)
    return


if __name__ == "__main__":
    # Default logging level WARNING to suppress INFO unless explicitly enabled
    logging.basicConfig(level=logging.WARNING)
    # Simple pagination over first few pages per category
    for cat, path in OPPORTUNITY_PARAM.items():
        total = 0
        for page in range(1, MAX_PAGES + 1):
            count = fetch_and_store(cat, page=page, per_page=24)
            total += count
            if count == 0:
                break
        logger.info("✅ %s: stored %s items", cat, total)

