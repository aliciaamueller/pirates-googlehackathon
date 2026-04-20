from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import os
import json
import time
import hashlib

load_dotenv()
app = Flask(__name__)
CORS(app)

MAPS_KEY = os.getenv("MAPS_API_KEY")
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

def search_places(vibe, lat=40.4168, lng=-3.7038, radius=2000):
    ck = cache_key("places", vibe, round(lat, 3), round(lng, 3))
    if ck in _cache:
        return _cache[ck]
    place_type = VIBE_TO_TYPE.get(vibe, "bar")
    url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
    params = {"location": f"{lat},{lng}", "radius": 1200, "type": place_type, "opennow": True, "key": MAPS_KEY}
    resp = requests.get(url, params=params, timeout=8)
    results = resp.json().get("results", [])[:15]
    _cache[ck] = results
    return results

def generate_dossiers(places, preferences, exclude_ids=None, count=3):
    if exclude_ids is None:
        exclude_ids = []
    places_summary = [
        {"name": p.get("name"), "rating": p.get("rating"), "user_ratings_total": p.get("user_ratings_total"),
         "vicinity": p.get("vicinity"), "price_level": p.get("price_level"), "place_id": p.get("place_id")}
        for p in places if p.get("place_id") not in exclude_ids
    ]

    special = preferences.get("special_context", "")
    special_line = f"\nSpecial occasion context: {special}" if special else ""

    prompt = f"""You are a grizzled pirate navigator helping a crew find their next destination in Madrid, Spain.
The crew vibe is: {preferences['vibe']}, budget: {preferences['budget']}.
Things to avoid: {preferences['avoid']}.{special_line}
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

    ck = cache_key("dossier", preferences["vibe"], preferences["budget"], [p["place_id"] for p in places_summary], tuple(exclude_ids))
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

    if not crew_description:
        return jsonify({"error": "No description provided"}), 400

    preferences = extract_preferences(crew_description, roles=roles, spend_per_person=spend_per_person)
    places = search_places(preferences["vibe"], lat, lng)
    if not places:
        return jsonify({"error": "No places found nearby"}), 404

    try:
        dossiers = generate_dossiers(places, preferences)
    except Exception as e:
        err = str(e)
        if "429" in err or "quota" in err.lower():
            return jsonify({"error": "Gemini quota limit. Try again in a minute.", "quota_error": True}), 429
        return jsonify({"error": f"Could not generate dossiers: {err}"}), 500

    bounties = build_bounties(dossiers, places)

    session_key = cache_key("session", lat, lng, crew_description)
    _cache[session_key] = {"places": places, "preferences": preferences}

    return jsonify({
        "bounties": bounties,
        "preferences": preferences,
        "session_key": session_key,
        "all_place_ids": [p.get("place_id") for p in places]
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
    exclude_ids = list(set(current_ids + [rejected_id]))

    try:
        dossiers = generate_dossiers(places, preferences, exclude_ids=exclude_ids, count=1)
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

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({"status": "ship is sailing"})

if __name__ == "__main__":
    app.run(debug=True, port=5001)