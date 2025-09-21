import os
import logging
import asyncio
from typing import Any, Dict, List, Optional, Tuple
from urllib.parse import urlsplit, urlunsplit

from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type
from rapidfuzz import fuzz

import firebase_admin
from firebase_admin import credentials, firestore

# Local imports (same package)
from .unstop_scraper import BASES, scrape_category, scrape_unstop

# -------------
# Env & Firestore
# -------------
PROJECT_ID = os.getenv("FIRESTORE_PROJECT")
SA_PATH = os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "./serviceAccountKey.json")
FUZZY_LIMIT = int(os.getenv("INGEST_FUZZY_LIMIT", "100"))  # number of recent docs to scan for fuzzy dupes
FUZZY_THRESHOLD = int(os.getenv("INGEST_FUZZY_THRESHOLD", "85"))  # 0..100 similarity threshold

if not firebase_admin._apps:
    if not os.path.exists(SA_PATH):
        raise RuntimeError(f"Service account JSON not found at {SA_PATH}")
    cred = credentials.Certificate(SA_PATH)
    firebase_admin.initialize_app(cred, {"projectId": PROJECT_ID} if PROJECT_ID else None)
_db = firestore.client()

# -------------
# Helpers
# -------------

def normalize_url(url: str) -> str:
    """Normalize URL by removing fragments and normalizing scheme/host casing."""
    try:
        parts = urlsplit(url)
        normalized = urlunsplit((parts.scheme.lower(), parts.netloc.lower(), parts.path, parts.query, ""))
        return normalized
    except Exception:
        return url


def _unique_merge_list(a: List[Any], b: List[Any]) -> List[Any]:
    seen = set()
    out: List[Any] = []
    for item in (a or []) + (b or []):
        if item is None:
            continue
        key = str(item).strip()
        if key and key not in seen:
            seen.add(key)
            out.append(item)
    return out


def _similar_title_company(t1: str, c1: Optional[str], t2: str, c2: Optional[str]) -> int:
    base = fuzz.token_sort_ratio(t1 or "", t2 or "")
    comp = fuzz.token_sort_ratio(c1 or "", c2 or "") if (c1 or c2) else 0
    # weight title more than company
    return int(0.75 * base + 0.25 * comp)


def _find_existing_by_apply_link(apply_link: str) -> Optional[Tuple[str, Dict[str, Any]]]:
    link = normalize_url(apply_link)
    q = _db.collection("opportunities").where("apply_link", "==", link).limit(1).stream()
    for d in q:
        return d.id, d.to_dict() or {}
    return None


def _find_potential_duplicate(title: str, company: Optional[str]) -> Optional[Tuple[str, Dict[str, Any]]]:
    # scan recent docs; requires index if combined with other filters; here we use order_by fetched_at
    docs = (
        _db.collection("opportunities")
        .order_by("fetched_at", direction=firestore.Query.DESCENDING)
        .limit(FUZZY_LIMIT)
        .stream()
    )
    best: Tuple[int, Optional[str], Optional[Dict[str, Any]]] = (0, None, None)
    for d in docs:
        data = d.to_dict() or {}
        score = _similar_title_company(title, company, data.get("title", ""), data.get("company"))
        if score > best[0]:
            best = (score, d.id, data)
    if best[0] >= FUZZY_THRESHOLD and best[1] and best[2]:
        return best[1], best[2]
    return None


def _merge_sources(existing: Dict[str, Any], incoming: Dict[str, Any]) -> List[Dict[str, Any]]:
    ex = existing.get("merged_sources") or []
    inc = incoming.get("merged_sources") or []
    # Merge with simple de-dup based on (source, source_id)
    seen = set()
    out: List[Dict[str, Any]] = []
    for s in ex + inc:
        key = (s.get("source"), s.get("source_id"))
        if key not in seen:
            seen.add(key)
            out.append(s)
    return out


def _merge_doc(existing: Dict[str, Any], incoming: Dict[str, Any]) -> Dict[str, Any]:
    updated = {**existing}
    # Core fields (prefer existing non-empty; fill from incoming if missing)
    for field in [
        "title",
        "company",
        "type",
        "location",
        "country",
        "apply_link",
        "deadline",
        "posted_at",
    ]:
        if not updated.get(field) and incoming.get(field):
            updated[field] = incoming[field]

    # Text fields: choose the longer (assuming more content is better)
    for text_field in ["description", "full_description"]:
        a = (existing.get(text_field) or "").strip()
        b = (incoming.get(text_field) or "").strip()
        updated[text_field] = b if len(b) > len(a) else a

    # Arrays: union unique
    for arr_field in ["education_level", "domain", "skills_required", "tags"]:
        updated[arr_field] = _unique_merge_list(existing.get(arr_field) or [], incoming.get(arr_field) or [])

    # Sources
    updated["merged_sources"] = _merge_sources(existing, incoming)

    # Flags and counters
    updated["archived"] = False

    # Always bump fetched_at to latest (server timestamp on write)
    return updated


@retry(wait=wait_exponential(multiplier=0.5, min=1, max=30), stop=stop_after_attempt(5), reraise=True,
       retry=retry_if_exception_type(Exception))
def upsert_opportunity(candidate: Dict[str, Any]) -> str:
    """Deduplicate and upsert candidate into opportunities. Returns the document ID."""
    link = normalize_url(candidate.get("apply_link", ""))
    if link:
        candidate["apply_link"] = link

    # Dedup by exact link first
    existing = _find_existing_by_apply_link(link) if link else None
    if not existing:
        # Fuzzy fallback on recent docs
        existing = _find_potential_duplicate(candidate.get("title", ""), candidate.get("company"))

    if existing:
        doc_id, cur = existing
        merged = _merge_doc(cur, candidate)
        merged["fetched_at"] = firestore.SERVER_TIMESTAMP
        _db.collection("opportunities").document(doc_id).set(merged, merge=True)
        return doc_id
    else:
        # New doc
        doc_id = candidate.get("id")
        if not doc_id:
            raise ValueError("Candidate must include a deterministic 'id'")
        body = {**candidate}
        body["fetched_at"] = firestore.SERVER_TIMESTAMP
        _db.collection("opportunities").document(doc_id).set(body, merge=True)
        return doc_id


def run_unstop_ingestion() -> None:
    """Run Unstop scraping and upsert through the worker."""
    # Use the improved async scraper
    logging.info("[INGEST] Running improved Unstop scraper")
    asyncio.run(scrape_unstop())


def run_unstop_ingestion_legacy() -> None:
    """Run legacy Unstop scraping (for backward compatibility)."""
    # scrape_category already upserts; to keep idempotency, we could refactor it to yield docs.
    # For now, call scrape_category to ensure content; worker can be used by future scrapers that yield docs.
    for cat, url in BASES.items():
        logging.info("[INGEST] Scraping %s", cat)
        scrape_category(cat, url)


def main():
    logging.basicConfig(level=logging.INFO)
    run_unstop_ingestion()
    logging.info("Ingestion completed.")


if __name__ == "__main__":
    main()
