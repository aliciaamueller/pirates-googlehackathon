from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import os
import json
import time
import hashlib
import math
from datetime import datetime
from agent import get_agent_response, CREW

load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)
app = Flask(__name__)
CORS(app)

MAPS_KEY = os.getenv("MAPS_API_KEY")
print(f"[startup] MAPS_KEY loaded: {bool(MAPS_KEY)} | value prefix: {(MAPS_KEY or '')[:8]}")
_cache = {}

def cache_key(*args):
    raw = json.dumps(args, sort_keys=True)
    return hashlib.md5(raw.encode()).hexdigest()

def call_gemini_with_retry(prompt, temperature=0.8, max_retries=4):
    api_key = os.getenv("GEMINI_API_KEY")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    payload = {"contents": [{"parts": [{"text": prompt}]}], "generationConfig": {"temperature": temperature}}
    delays = [5, 15, 30, 60]
    last_error = None
    for attempt in range(max_retries):
        try:
            resp = requests.post(url, json=payload, timeout=30)
            if resp.status_code != 200:
                raise Exception(f"{resp.status_code}: {resp.text}")
            return resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
        except Exception as e:
            last_error = e
            err_str = str(e).lower()
            is_quota = "429" in err_str or "quota" in err_str
            if is_quota and attempt < max_retries - 1:
                wait = delays[attempt]
                print(f"[Gemini] 429 on attempt {attempt + 1}, waiting {wait}s...")
                time.sleep(wait)
            else:
                raise
    raise last_error

def clean_json(text):
    return text.strip().replace("```json", "").replace("```", "").strip()

def extract_preferences(description, roles=None, spend_per_person=None):
    roles_context = ""
    if roles and len(roles) > 0:
        roles_context = f"\nThe crew has these roles: {', '.join(roles)}. Factor each role's needs into the vibe and budget."
    spend_context = ""
    if spend_per_person:
        spend_context = f"\nEach person plans to spend around €{spend_per_person}. Use this to determine budget tier."

    prompt = f"""You are extracting venue preferences from a group description for a Madrid nightlife app.
Description: "{description}"{roles_context}{spend_context}

Crew role meanings:
- "The Broke One": needs cheap options, price_level 1 max
- "The Foodie": prioritize food quality, restaurant or tapas bar
- "The Night Owl": wants late night, bars/clubs, lively atmosphere
- "The Explorer": wants something unique, avoid chains and tourist spots
- "The Romantic": intimate setting, quiet enough to talk
- "The Culture Vulture": interested in history, art, local character

If multiple roles conflict (e.g. Broke One + Foodie), find a vibe that satisfies the majority.

Return ONLY a JSON object, no extra text, no markdown:
{{
  "vibe": one of: "wild" (bars/clubs/dancing/drinks), "romantic" (date night/intimate), "cultural" (art/museums/history), "foodie" (restaurants/tapas/eating), "adventure" (outdoor/active), "chill" (cafe/relaxed/coffee),
  "budget": one of: "broke" (cheap/student/budget), "splurge" (fancy/expensive), "medium" (normal),
  "avoid": array of zero or more: "chains", "tourists", "loud", "crowded",
  "group_size": integer,
  "special_context": "one sentence about any special occasion or event mentioned, or empty string"
}}

Be smart about intent: "beers" and "drinks" = wild, "something different" implies avoid tourists/chains, "students" = broke.
If spend_per_person is under 15 = broke, 15-30 = medium, over 30 = splurge."""

    try:
        raw = call_gemini_with_retry(prompt, temperature=0.2)
        result = json.loads(clean_json(raw))
        if "avoid" not in result or not result["avoid"]:
            result["avoid"] = ["chains", "tourists"]
        return result
    except Exception:
        return {"vibe": "chill", "budget": "medium", "group_size": 4, "avoid": ["chains", "tourists"], "special_context": ""}

VIBE_TO_TYPE = {
    "chill": "cafe", "wild": "bar", "romantic": "restaurant",
    "cultural": "museum", "foodie": "restaurant", "adventure": "park",
}

CATEGORY_CONFIG = {
    "restaurants_bars": {"type": "restaurant", "keyword": "tapas bar local restaurant madrid"},
    "museums": {"type": "museum", "keyword": "museum gallery exhibition cultural madrid"},
    "clubs": {"type": "night_club", "keyword": "night club discoteca madrid"},
}

CLUB_DAY_HINTS = {
    "monday": "afterwork local chill club",
    "tuesday": "student night local club",
    "wednesday": "midweek music event club",
    "thursday": "pre-weekend lively club",
    "friday": "peak nightlife popular club",
    "saturday": "peak nightlife energetic dance club",
    "sunday": "soft nightlife rooftop lounge music",
}

def normalize_day(day_of_week):
    if not day_of_week:
        return datetime.now().strftime("%A").lower()
    return str(day_of_week).strip().lower()

def normalize_category(category):
    raw = (category or "restaurants_bars").strip().lower()
    aliases = {
        "food_bars": "restaurants_bars",
        "culture_tourism": "museums",
        "restaurant": "restaurants_bars",
        "restaurants": "restaurants_bars",
        "museum": "museums",
        "clubs": "clubs",
    }
    return aliases.get(raw, raw if raw in CATEGORY_CONFIG else "restaurants_bars")

def rank_places(places, sort_mode, lat, lng, budget):
    mode = (sort_mode or "popularity").strip().lower()
    budget_target = {"broke": 1, "medium": 2, "splurge": 3}.get((budget or "medium").lower(), 2)

    def score_place(place):
        rating = float(place.get("rating") or 0.0)
        reviews = int(place.get("user_ratings_total") or 0)
        price_level = place.get("price_level")
        if price_level is None:
            price_level = 2
        place_loc = (place.get("geometry") or {}).get("location") or {}
        plat = float(place_loc.get("lat") or lat)
        plng = float(place_loc.get("lng") or lng)
        dist = math.sqrt((plat - lat) ** 2 + (plng - lng) ** 2)

        if mode == "price":
            # Prioritize closer budget match and avoid very expensive options for broke crews.
            budget_fit = 1.8 - abs(price_level - budget_target)
            broke_penalty = -1.0 if budget_target == 1 and price_level >= 3 else 0.0
            return budget_fit + broke_penalty + (rating * 0.08)
        if mode == "location":
            return -dist + (rating * 0.02)
        # Default popularity mode: rating + social proof.
        return (rating * 1.7) + math.log1p(reviews)

    return sorted(places, key=score_place, reverse=True)

def search_places(vibe, lat=40.4168, lng=-3.7038, radius=2500, category=None, day_of_week=None):
    day_norm = normalize_day(day_of_week)
    ck = cache_key("places", vibe, category, day_norm, round(lat, 3), round(lng, 3))
    if ck in _cache:
        return _cache[ck]
    category_key = (category or "").strip().lower()
    cfg = CATEGORY_CONFIG.get(category_key)
    place_type = cfg["type"] if cfg else VIBE_TO_TYPE.get(vibe, "bar")
    keyword = cfg["keyword"] if cfg else None
    if category_key == "clubs":
        day_hint = CLUB_DAY_HINTS.get(day_norm, "nightlife madrid")
        keyword = f"{keyword} {day_hint}"
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {"location": f"{lat},{lng}", "radius": radius, "type": place_type, "key": MAPS_KEY}
    if keyword:
        params["keyword"] = keyword
    resp = requests.get(url, params=params, timeout=8)
    data = resp.json()
    status = data.get("status", "UNKNOWN")
    print(f"[Places API] status={status} vibe={vibe} category={category_key or 'auto'} day={day_norm} lat={lat} lng={lng} key_set={bool(MAPS_KEY)}")
    if status not in ("OK", "ZERO_RESULTS"):
        raise Exception(f"Places API error: {status} — {data.get('error_message', '')}")
    results = data.get("results", [])[:15]
    if results:
        _cache[ck] = results
    return results

def generate_dossiers(places, preferences, exclude_ids=None, count=3, category="auto", sort_mode="popularity", day_of_week=None, age_group=None):
    if exclude_ids is None:
        exclude_ids = []
    places_summary = [
        {"name": p.get("name"), "rating": p.get("rating"), "user_ratings_total": p.get("user_ratings_total"),
         "vicinity": p.get("vicinity"), "price_level": p.get("price_level"), "place_id": p.get("place_id")}
        for p in places if p.get("place_id") not in exclude_ids
    ]

    special = preferences.get("special_context", "")
    special_line = f"\nSpecial occasion context: {special}" if special else ""
    day_line = ""
    if category == "clubs":
        age_line = f" Target age group: {age_group}." if age_group else ""
        day_line = f"\nToday is {normalize_day(day_of_week)}.{age_line} Prioritize clubs that fit that day's nightlife energy."

    prompt = f"""You are a grizzled pirate navigator helping a crew find their next destination in Madrid, Spain.
The crew vibe is: {preferences['vibe']}, budget: {preferences['budget']}.
Chosen chest category: {category}. Sort priority: {sort_mode}.
Things to avoid: {preferences['avoid']}.{special_line}{day_line}
From this list of real places, pick the {count} best hidden gems.
Rules:
- Reject any chains or franchises (McDonalds, Starbucks, VIPS, etc)
- Reject places with more than 500 reviews (too popular = not hidden)
- Pick places that match the vibe and budget
- If budget is broke, avoid places with price_level 3 or 4
- If there is a special occasion, factor it into the hook
Return ONLY a JSON array, no extra text, no markdown:
[{{"name":"exact original place name","pirate_name":"dramatic pirate nickname max 4 words","hook":"one sentence pirate voice max 15 words","send_off":"short pirate encouragement max 8 words","place_id":"exact place_id from input"}}]
Places to choose from:
{json.dumps(places_summary, indent=2)}"""

    ck = cache_key("dossier", preferences["vibe"], preferences["budget"], category, sort_mode, normalize_day(day_of_week), [p["place_id"] for p in places_summary], tuple(exclude_ids))
    if ck in _cache:
        return _cache[ck]
    raw = call_gemini_with_retry(prompt, temperature=0.8)
    result = json.loads(clean_json(raw))
    _cache[ck] = result
    return result

def build_bounties(dossiers, places):
    bounties = []
    for d in dossiers:
        match = next((p for p in places if p.get("place_id") == d.get("place_id")), None)
        if match:
            photo_ref = match.get("photos", [{}])[0].get("photo_reference")
            photo_url = f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference={photo_ref}&key={MAPS_KEY}" if photo_ref else None
            bounties.append({
                "name": d.get("name"),
                "pirate_name": d.get("pirate_name"),
                "hook": d.get("hook"),
                "send_off": d.get("send_off"),
                "place_id": d.get("place_id"),
                "address": match.get("vicinity"),
                "rating": match.get("rating"),
                "lat": match["geometry"]["location"]["lat"],
                "lng": match["geometry"]["location"]["lng"],
                "maps_url": f"https://www.google.com/maps/place/?q=place_id:{d.get('place_id')}",
                "photo_url": photo_url,
                "price_level": match.get("price_level"),
            })
    return bounties

@app.route("/api/hunt", methods=["POST"])
def hunt():
    data = request.json or {}
    crew_description = data.get("description", "").strip()
    lat = float(data.get("lat", 40.4168))
    lng = float(data.get("lng", -3.7038))
    roles = data.get("roles", [])
    spend_per_person = data.get("spend_per_person", None)
    category = normalize_category(data.get("category"))
    sort_mode = (data.get("sort_mode") or "popularity").strip().lower()
    day_of_week = normalize_day(data.get("day_of_week"))
    age_group = (data.get("age_group") or "").strip().lower()

    if not crew_description:
        return jsonify({"error": "No description provided"}), 400

    preferences = extract_preferences(crew_description, roles=roles, spend_per_person=spend_per_person)
    preferences["category"] = category
    preferences["sort_mode"] = sort_mode
    if category == "clubs":
        if not data.get("day_of_week"):
            return jsonify({"error": "For clubs, day selection is required."}), 400
        if not age_group:
            return jsonify({"error": "For clubs, age selection is required."}), 400
        preferences["club_day"] = day_of_week
        preferences["age_group"] = age_group
    try:
        places = search_places(preferences["vibe"], lat, lng, category=category, day_of_week=day_of_week)
    except Exception as e:
        return jsonify({"error": str(e)}), 502
    if not places:
        return jsonify({"error": "No places found nearby (ZERO_RESULTS) — try a different neighbourhood or vibe"}), 404
    ranked_places = rank_places(places, sort_mode, lat, lng, preferences.get("budget", "medium"))

    try:
        dossiers = generate_dossiers(
            ranked_places, preferences, category=category, sort_mode=sort_mode, day_of_week=day_of_week, age_group=age_group
        )
    except Exception as e:
        err = str(e)
        if "429" in err or "quota" in err.lower():
            return jsonify({"error": "Gemini quota limit. Try again in a minute.", "quota_error": True}), 429
        return jsonify({"error": f"Could not generate dossiers: {err}"}), 500

    bounties = build_bounties(dossiers, ranked_places)

    session_key = cache_key("session", lat, lng, crew_description, category, sort_mode, day_of_week)
    _cache[session_key] = {
        "places": ranked_places,
        "preferences": preferences,
        "category": category,
        "sort_mode": sort_mode,
        "day_of_week": day_of_week,
        "age_group": age_group,
    }

    return jsonify({
        "bounties": bounties,
        "preferences": preferences,
        "session_key": session_key,
        "all_place_ids": [p.get("place_id") for p in ranked_places]
    })

@app.route("/api/swap", methods=["POST"])
def swap():
    data = request.json or {}
    rejected_id = data.get("rejected_place_id")
    current_ids = data.get("current_place_ids", [])
    session_key = data.get("session_key")

    if not rejected_id or not session_key:
        return jsonify({"error": "Missing rejected_place_id or session_key"}), 400

    session = _cache.get(session_key)
    if not session:
        return jsonify({"error": "Session expired, please search again"}), 404

    places = session["places"]
    preferences = session["preferences"]
    category = session.get("category", "restaurants_bars")
    sort_mode = session.get("sort_mode", "popularity")
    day_of_week = session.get("day_of_week")
    age_group = session.get("age_group")
    exclude_ids = list(set(current_ids + [rejected_id]))

    try:
        dossiers = generate_dossiers(
            places,
            preferences,
            exclude_ids=exclude_ids,
            count=1,
            category=category,
            sort_mode=sort_mode,
            day_of_week=day_of_week,
            age_group=age_group,
        )
    except Exception as e:
        err = str(e)
        if "429" in err or "quota" in err.lower():
            return jsonify({"error": "Gemini quota limit. Try again in a minute.", "quota_error": True}), 429
        return jsonify({"error": f"Could not find replacement: {err}"}), 500

    if not dossiers:
        return jsonify({"error": "No more hidden gems to show — the seas are empty!"}), 404

    bounties = build_bounties(dossiers, places)
    if not bounties:
        return jsonify({"error": "No replacement found nearby"}), 404

    return jsonify({"bounty": bounties[0]})

@app.route("/api/crew-react", methods=["POST"])
def crew_react():
    data = request.json or {}
    bounties = data.get("bounties", [])
    preferences = data.get("preferences", {})

    names = [b.get("pirate_name") or b.get("name") for b in bounties if b.get("pirate_name") or b.get("name")]
    vibe = preferences.get("vibe", "unknown")
    budget = preferences.get("budget", "unknown")

    if names:
        captain_message = f"We're bound for {', '.join(names)} tonight — a {vibe} run on a {budget} budget. What say you?"
    else:
        captain_message = f"We've plotted a {vibe} course for tonight on a {budget} budget. What say you?"

    reactions = {}
    for agent_id, agent in CREW.items():
        try:
            text = get_agent_response(agent_id, [], captain_message)
            reactions[agent_id] = {"name": agent["name"], "text": text}
        except Exception:
            pass

    return jsonify({"reactions": reactions})

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ship is sailing"})

if __name__ == "__main__":
    app.run(debug=True, port=5001)