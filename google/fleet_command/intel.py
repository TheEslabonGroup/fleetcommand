# The two intel lenses, ported from functions/_lib/market.js and domains.js,
# reshaped as ADK tools. Same promises as the originals:
#
#   ON-SWITCH (fleet pattern). Real calls run only when the credential is set in
#   the environment (SERPAPI_KEY for search, NAMECOM_USER + NAMECOM_TOKEN for
#   the registrar). Until then the tool returns a clearly labelled SAMPLE in the
#   same fictional world as the target, and the prompts forbid presenting it as
#   real. Arm the keys and the same code path goes live.
#
#   QUOTA DISCIPLINE. The query and candidate list are fixed, and results cache
#   for 12 hours. On Cloudflare the cache was KV; here it is process memory,
#   which on Cloud Run means per-instance. That is a weaker guarantee, and it is
#   good enough on purpose: min-instances stays 0 or 1 for a demo, so the cache
#   holds real usage to a handful of upstream calls a day, and losing it on a
#   cold start costs one search, not the mission.
#
#   NEVER BLOCK THE MISSION. If an upstream is down, times out, or answers with
#   an error, the tool falls back to the labelled sample with a note saying why.
#   A missing lens is a degraded mission, not a dead one.

import base64
import os
import time

import requests

TIMEOUT_S = 8
CACHE_TTL_S = 43200  # 12 hours, same as the KV TTL on the Cloudflare side
_cache: dict[str, tuple[float, dict]] = {}


def _cached(key: str):
    hit = _cache.get(key)
    if hit and (time.monotonic() - hit[0]) < CACHE_TTL_S:
        return {**hit[1], "cached": True}
    return None


def _store(key: str, value: dict):
    _cache[key] = (time.monotonic(), value)


# --- SCOUT's market lens -----------------------------------------------------

# Derived from the target's own trade, not hardcoded trivia: Harbor Lane is a
# bakery whose order route is broken, so the market question that matters is
# who is winning bakery ordering.
MARKET_QUERY = "bakery online ordering"

# Sample, not a recording. Fictional competitors to match the fictional target,
# so nothing invented can ever be mistaken for real search data.
MARKET_SAMPLE = {
    "query": MARKET_QUERY,
    "competitors": [
        {"position": 1, "title": "Stonemill Bread Co. - Order ahead, pick up in 20 minutes", "snippet": "Order online for pickup or local delivery. Live order tracking and same day slots."},
        {"position": 2, "title": "Corner Loaf - Online Bakery Ordering", "snippet": "Skip the line. Pay in the browser, collect at the counter. Open Sundays."},
        {"position": 3, "title": "How small bakeries take orders online in 2026", "snippet": "A guide to order forms, payment links and pickup scheduling for independent shops."},
    ],
    "questions": [
        "How do I set up online ordering for a small bakery?",
        "Do customers abandon bakery order forms?",
        "What hours should a bakery publish online?",
    ],
}


def _market_sample(note: str | None = None) -> dict:
    out = {"source": "sample", **MARKET_SAMPLE}
    if note:
        out["note"] = note
    return out


def _shape_market(data: dict) -> dict:
    competitors = []
    for i, r in enumerate((data.get("organic_results") or [])[:3]):
        competitors.append({
            "position": r.get("position") if isinstance(r.get("position"), int) else i + 1,
            "title": str(r.get("title") or "untitled")[:120],
            "snippet": str(r.get("snippet") or "")[:160],
        })
    questions = [
        str(q.get("question"))[:140]
        for q in (data.get("related_questions") or [])
        if isinstance(q, dict) and q.get("question")
    ][:3]
    return {"query": MARKET_QUERY, "competitors": competitors, "questions": questions}


def market_search() -> dict:
    """Search the open market around the target: who ranks for its trade and
    what buyers are asking. Returns competitors, buyer questions, and a source
    field that is "live" (real Google results via SerpApi) or "sample"
    (illustrative data, no search key armed). Call it once per mission."""
    key = os.environ.get("SERPAPI_KEY")
    if not key:
        return _market_sample()

    hit = _cached("market")
    if hit:
        return hit

    try:
        res = requests.get(
            "https://serpapi.com/search.json",
            params={"engine": "google", "q": MARKET_QUERY, "hl": "en", "gl": "us", "api_key": key},
            timeout=TIMEOUT_S,
        )
        if res.status_code != 200:
            return _market_sample(f"serpapi returned {res.status_code}, sample served")
        data = res.json()
    except Exception:
        return _market_sample("serpapi unreachable, sample served")

    # SerpApi reports quota exhaustion and bad keys in the body with HTTP 200.
    if isinstance(data, dict) and data.get("error"):
        return _market_sample("serpapi: " + str(data["error"])[:120])

    out = _shape_market(data if isinstance(data, dict) else {})
    if not out["competitors"]:
        return _market_sample("serpapi returned no results, sample served")

    live = {"source": "live", **out}
    _store("market", live)
    return live


# --- SHIP's registrar check --------------------------------------------------

# Derived from the target's own trading name. The crew is shipping an order
# flow for Harbor Lane Bakery, so the question is whether Harbor Lane Bakery
# owns Harbor Lane Bakery.
CANDIDATES = ["harborlanebakery.com", "harborlane.bakery", "harborlanebakery.shop"]

# Sample, not a recording. Fictional target, fictional posture, never presented
# as a real registrar answer.
DOMAIN_SAMPLE = {
    "candidates": [
        {"domainName": "harborlanebakery.com", "purchasable": True, "premium": False, "purchasePrice": 12.99},
        {"domainName": "harborlane.bakery", "purchasable": True, "premium": False, "purchasePrice": 34.99},
        {"domainName": "harborlanebakery.shop", "purchasable": False, "premium": False},
    ],
    "caveat": "Available means registrable, NOT cleared for use. Trademark is a separate question this crew does not answer.",
}


def _domain_sample(note: str | None = None) -> dict:
    out = {"source": "sample", **DOMAIN_SAMPLE}
    if note:
        out["note"] = note
    return out


def _shape_domains(data: dict) -> dict:
    rows = []
    for r in (data.get("results") or [])[: len(CANDIDATES)]:
        row = {
            "domainName": str(r.get("domainName") or "")[:100],
            "purchasable": bool(r.get("purchasable")),
            "premium": bool(r.get("premium")),
        }
        # purchasePrice only comes back for purchasable names, so only carry it
        # when it is really there instead of printing a confident zero.
        if isinstance(r.get("purchasePrice"), (int, float)):
            row["purchasePrice"] = r["purchasePrice"]
        if row["domainName"]:
            rows.append(row)
    return {"candidates": rows, "caveat": DOMAIN_SAMPLE["caveat"]}


def registrar_check() -> dict:
    """Ask the name.com registrar whether the deploy target's own domain names
    are held or still open. Returns candidates with availability, and a source
    field that is "live" (real registrar lookup) or "sample" (illustrative
    data, no registrar credential armed). Available means registrable, never
    cleared for use. Call it once, right before staging."""
    user = os.environ.get("NAMECOM_USER")
    token = os.environ.get("NAMECOM_TOKEN")
    # Both halves of the credential or nothing. A half-armed integration that
    # 401s on every mission is worse than an honestly labelled sample.
    if not user or not token:
        return _domain_sample()

    hit = _cached("domains")
    if hit:
        return hit

    host = "https://api.dev.name.com" if os.environ.get("NAMECOM_ENV") == "dev" else "https://api.name.com"
    auth = base64.b64encode(f"{user}:{token}".encode()).decode()

    try:
        res = requests.post(
            host + "/core/v1/domains:checkAvailability",
            json={"domainNames": CANDIDATES, "purchaseType": "registration"},
            headers={"authorization": "Basic " + auth},
            timeout=TIMEOUT_S,
        )
        if res.status_code != 200:
            return _domain_sample(f"name.com returned {res.status_code}, sample served")
        data = res.json()
    except Exception:
        return _domain_sample("name.com unreachable, sample served")

    out = _shape_domains(data if isinstance(data, dict) else {})
    if not out["candidates"]:
        return _domain_sample("name.com returned no results, sample served")

    live = {"source": "live", **out}
    _store("domains", live)
    return live
