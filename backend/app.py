from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import requests
import os
import json
import time
import hashlib
import math
import random
from datetime import datetime
from agent import get_agent_response, CREW

_root = os.path.dirname(os.path.dirname(__file__))
load_dotenv(os.path.join(_root, ".env"), override=True)
load_dotenv(os.path.join(os.path.dirname(__file__), ".env"), override=True)
app = Flask(__name__)
CORS(app)

MAPS_KEY = os.getenv("MAPS_API_KEY")
print(f"[startup] MAPS_KEY loaded: {bool(MAPS_KEY)} | value prefix: {(MAPS_KEY or '')[:8]}")
if not MAPS_KEY:
    print("[startup] WARNING: MAPS_API_KEY not set — curated fallback gems will activate automatically")
if not os.getenv("GEMINI_API_KEY"):
    print("[startup] WARNING: GEMINI_API_KEY not set — AI dossier generation will fail")
_cache = {}

# ─── CURATED FALLBACK GEMS ─────────────────────────────────────────
# Activates automatically when Places API is unavailable (REQUEST_DENIED, quota, network).
# Structured identically to Places API nearbysearch results so all downstream logic is unaffected.
FALLBACK_GEMS = {
    "restaurants_bars": [
        {"name": "Bodega de la Ardosa", "place_id": "fb_ardosa", "rating": 4.5, "user_ratings_total": 289, "vicinity": "Calle Colón 13, Malasaña, Madrid", "price_level": 1, "geometry": {"location": {"lat": 40.4236, "lng": -3.7056}}, "photos": []},
        {"name": "Casa Labra", "place_id": "fb_labra", "rating": 4.4, "user_ratings_total": 312, "vicinity": "Calle Tetuán 12, Sol, Madrid", "price_level": 1, "geometry": {"location": {"lat": 40.4193, "lng": -3.7003}}, "photos": []},
        {"name": "Casa Alberto", "place_id": "fb_alberto", "rating": 4.6, "user_ratings_total": 276, "vicinity": "Calle de las Huertas 18, Letras, Madrid", "price_level": 2, "geometry": {"location": {"lat": 40.4140, "lng": -3.6963}}, "photos": []},
        {"name": "El Doble", "place_id": "fb_doble", "rating": 4.3, "user_ratings_total": 198, "vicinity": "Calle Silva 25, Malasaña, Madrid", "price_level": 2, "geometry": {"location": {"lat": 40.4218, "lng": -3.7052}}, "photos": []},
        {"name": "Taberna Verdejo", "place_id": "fb_verdejo", "rating": 4.2, "user_ratings_total": 167, "vicinity": "Calle Ruiz 11, Malasaña, Madrid", "price_level": 1, "geometry": {"location": {"lat": 40.4248, "lng": -3.7042}}, "photos": []},
        {"name": "La Musa Malasaña", "place_id": "fb_musa", "rating": 4.1, "user_ratings_total": 421, "vicinity": "Calle Manuela Malasaña 18, Madrid", "price_level": 2, "geometry": {"location": {"lat": 40.4258, "lng": -3.7074}}, "photos": []},
        {"name": "Taberna La Dolores", "place_id": "fb_dolores", "rating": 4.3, "user_ratings_total": 188, "vicinity": "Plaza de Jesús 4, Huertas, Madrid", "price_level": 1, "geometry": {"location": {"lat": 40.4144, "lng": -3.6952}}, "photos": []},
        {"name": "El Bonanno", "place_id": "fb_bonanno", "rating": 4.2, "user_ratings_total": 145, "vicinity": "Plaza del Humilladero 4, La Latina, Madrid", "price_level": 2, "geometry": {"location": {"lat": 40.4121, "lng": -3.7098}}, "photos": []},
    ],
    "museums": [
        {"name": "Museo del Romanticismo", "place_id": "fb_roman", "rating": 4.5, "user_ratings_total": 189, "vicinity": "Calle San Mateo 13, Madrid", "price_level": 1, "geometry": {"location": {"lat": 40.4271, "lng": -3.6988}}, "photos": []},
        {"name": "CaixaForum Madrid", "place_id": "fb_caixa", "rating": 4.6, "user_ratings_total": 312, "vicinity": "Paseo del Prado 36, Madrid", "price_level": 1, "geometry": {"location": {"lat": 40.4084, "lng": -3.6924}}, "photos": []},
        {"name": "Matadero Madrid", "place_id": "fb_matadero", "rating": 4.4, "user_ratings_total": 287, "vicinity": "Plaza de Legazpi 8, Madrid", "price_level": 1, "geometry": {"location": {"lat": 40.3948, "lng": -3.7003}}, "photos": []},
        {"name": "Real Academia de Bellas Artes de San Fernando", "place_id": "fb_bellas", "rating": 4.4, "user_ratings_total": 203, "vicinity": "Calle de Alcalá 13, Madrid", "price_level": 1, "geometry": {"location": {"lat": 40.4175, "lng": -3.6990}}, "photos": []},
        {"name": "Museo del Traje", "place_id": "fb_traje", "rating": 4.3, "user_ratings_total": 156, "vicinity": "Avenida Juan de Herrera 2, Ciudad Universitaria, Madrid", "price_level": 1, "geometry": {"location": {"lat": 40.4455, "lng": -3.7263}}, "photos": []},
        {"name": "Museo Lázaro Galdiano", "place_id": "fb_lazaro", "rating": 4.5, "user_ratings_total": 142, "vicinity": "Calle Serrano 122, Salamanca, Madrid", "price_level": 1, "geometry": {"location": {"lat": 40.4356, "lng": -3.6863}}, "photos": []},
    ],
    "clubs": [
        {"name": "El Junco Jazz Club", "place_id": "fb_junco", "rating": 4.4, "user_ratings_total": 178, "vicinity": "Plaza de Santa Bárbara 10, Chueca, Madrid", "price_level": 2, "geometry": {"location": {"lat": 40.4278, "lng": -3.6964}}, "photos": []},
        {"name": "Costello Club", "place_id": "fb_costello", "rating": 4.2, "user_ratings_total": 134, "vicinity": "Calle del Caballero de Gracia 10, Madrid", "price_level": 2, "geometry": {"location": {"lat": 40.4202, "lng": -3.7010}}, "photos": []},
        {"name": "Sala Clamores", "place_id": "fb_clamores", "rating": 4.5, "user_ratings_total": 223, "vicinity": "Calle Alburquerque 14, Malasaña, Madrid", "price_level": 2, "geometry": {"location": {"lat": 40.4297, "lng": -3.7046}}, "photos": []},
        {"name": "Tupperware Club", "place_id": "fb_tupperware", "rating": 4.1, "user_ratings_total": 112, "vicinity": "Calle Corredera Alta de San Pablo 26, Malasaña, Madrid", "price_level": 1, "geometry": {"location": {"lat": 40.4261, "lng": -3.7055}}, "photos": []},
        {"name": "Sala But", "place_id": "fb_but", "rating": 4.0, "user_ratings_total": 89, "vicinity": "Calle del Barceló 11, Chueca, Madrid", "price_level": 2, "geometry": {"location": {"lat": 40.4265, "lng": -3.6975}}, "photos": []},
        {"name": "El Intruso Bar", "place_id": "fb_intruso", "rating": 4.3, "user_ratings_total": 97, "vicinity": "Calle Augusto Figueroa 3, Chueca, Madrid", "price_level": 2, "geometry": {"location": {"lat": 40.4241, "lng": -3.6991}}, "photos": []},
    ],
}

def get_place_details(place_id):
    if not MAPS_KEY or str(place_id).startswith("fb_"):
        return {"open_now": None, "closes_at": None}
    ck = cache_key("details", place_id)
    if ck in _cache:
        return _cache[ck]
    url = "https://maps.googleapis.com/maps/api/place/details/json"
    params = {"place_id": place_id, "fields": "opening_hours,website", "key": MAPS_KEY}
    try:
        resp = requests.get(url, params=params, timeout=5)
        data = resp.json()
        if data.get("status") == "OK":
            hours = data.get("result", {}).get("opening_hours", {})
            open_now = hours.get("open_now")
            closes_at = None
            periods = hours.get("periods", [])
            if periods:
                now = datetime.now()
                # Google uses 0=Sun … 6=Sat; Python weekday() is 0=Mon … 6=Sun
                google_dow = (now.weekday() + 1) % 7
                for period in periods:
                    if period.get("open", {}).get("day") == google_dow:
                        close_time = (period.get("close") or {}).get("time", "")
                        if len(close_time) == 4:
                            closes_at = f"{close_time[:2]}:{close_time[2:]}"
                        break
            website = data.get("result", {}).get("website")
            result = {"open_now": open_now, "closes_at": closes_at, "website": website}
            _cache[ck] = result
            return result
    except Exception as e:
        print(f"[Places Details] {e}")
    return {"open_now": None, "closes_at": None, "website": None}

def get_fallback_gems(category="restaurants_bars", lat=40.4168, lng=-3.7038):
    gems = list(FALLBACK_GEMS.get(category, FALLBACK_GEMS["restaurants_bars"]))
    for g in gems:
        plat = g["geometry"]["location"]["lat"]
        plng = g["geometry"]["location"]["lng"]
        g["_dist"] = math.sqrt((plat - lat) ** 2 + (plng - lng) ** 2)
    return sorted(gems, key=lambda x: x.get("_dist", 0))

def cache_key(*args):
    raw = json.dumps(args, sort_keys=True)
    return hashlib.md5(raw.encode()).hexdigest()

def fetch_madrid_weather():
    """Keyless Madrid weather via wttr.in, cached in 15-minute buckets.
    Failures degrade to a neutral/unknown payload — never raise."""
    ck = cache_key("weather", "madrid", int(time.time() // 900))
    if ck in _cache:
        return _cache[ck]
    w = {"temp_c": None, "condition": "unknown", "is_rainy": False, "is_cold": False, "is_hot": False}
    try:
        r = requests.get("https://wttr.in/Madrid?format=j1", timeout=4)
        cur = r.json()["current_condition"][0]
        temp = int(cur.get("temp_C", 0))
        condition = cur["weatherDesc"][0]["value"]
        cond_lower = condition.lower()
        precip = float(cur.get("precipMM", 0) or 0)
        w = {
            "temp_c": temp,
            "condition": condition,
            "is_rainy": ("rain" in cond_lower) or ("drizzle" in cond_lower) or ("shower" in cond_lower) or precip > 0.2,
            "is_cold": temp < 10,
            "is_hot": temp > 28,
        }
    except Exception as e:
        print(f"[weather] fetch failed: {e}")
    _cache[ck] = w
    return w

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

    if not MAPS_KEY:
        print(f"[Places API] No key — serving curated fallback for category={category}")
        return get_fallback_gems(category or "restaurants_bars", lat, lng)

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

    try:
        resp = requests.get(url, params=params, timeout=8)
        data = resp.json()
    except Exception as e:
        print(f"[Places API] Network error: {e} — serving curated fallback")
        return get_fallback_gems(category or "restaurants_bars", lat, lng)

    status = data.get("status", "UNKNOWN")
    print(f"[Places API] status={status} vibe={vibe} category={category_key or 'auto'} day={day_norm} lat={lat} lng={lng} key_set={bool(MAPS_KEY)}")

    if status in ("REQUEST_DENIED", "INVALID_REQUEST"):
        err_msg = data.get("error_message", "no details")
        print(f"[Places API] {status}: {err_msg} — serving curated fallback")
        fallback = get_fallback_gems(category or "restaurants_bars", lat, lng)
        _cache[ck] = fallback
        return fallback

    if status not in ("OK", "ZERO_RESULTS"):
        raise Exception(f"Places API error: {status} — {data.get('error_message', '')}")

    results = data.get("results", [])[:20]
    if results:
        _cache[ck] = results
    return results

def generate_dossiers(places, preferences, exclude_ids=None, count=3, category="auto", sort_mode="popularity", day_of_week=None, age_group=None, quiet_mode=False, vibe_intensity="hidden", relaxed=False, weather=None, moment=None):
    if exclude_ids is None:
        exclude_ids = []
    places_summary = [
        {"name": p.get("name"), "rating": p.get("rating"), "user_ratings_total": p.get("user_ratings_total"),
         "vicinity": p.get("vicinity"), "price_level": p.get("price_level"), "place_id": p.get("place_id")}
        for p in places if p.get("place_id") not in exclude_ids
    ]
    # Shuffle so Gemini sees a different ordering each call → avoids same picks every time
    random.shuffle(places_summary)
    places_summary = places_summary[:12]

    special = preferences.get("special_context", "")
    special_line = f"\nSpecial occasion context: {special}" if special else ""
    day_line = ""
    if category == "clubs":
        age_line = f" Target age group: {age_group}." if age_group else ""
        day_line = f"\nToday is {normalize_day(day_of_week)}.{age_line} Prioritize clubs that fit that day's nightlife energy."
    intensity_limits = {"local": 1500, "hidden": 800, "secret": 250, "popular": 9999}
    review_limit = 9999 if relaxed else (150 if quiet_mode else intensity_limits.get(vibe_intensity, 800))
    review_rule = f"- You MUST return exactly {count} results. If strict review limits prevent this, include the best available options regardless of review count." if relaxed else f"- Prefer places with under {review_limit} reviews; if you cannot find {count} qualifying results, include the best remaining options"
    quiet_line = "\n- PRIORITY: prefer venues with under 150 reviews — intimate, local, quiet spots only" if quiet_mode else ""

    # Moment-of-day rhythm guidance — shapes venue energy (slow cafés vs speakeasies).
    moment_line = ""
    if moment:
        rhythms = {
            "breakfast": "breakfast (Madrid: 06–11) — slow cafés, panaderías, churrerías, quiet terrazas with coffee and pastry.",
            "lunch": "lunch (Madrid: 11–16) — menú del día spots, traditional tabernas, family-run restaurants with a midday rhythm.",
            "tapas": "tapas (Madrid: 16–19) — counter-service tapas bars with character, vermut joints, street-facing cañas.",
            "cena": "dinner (Madrid: 19–23) — sit-down restaurants with atmosphere, intimate dining rooms, chef-led kitchens.",
            "copas": "drinks (Madrid: 23–02) — cocktail caves, vermuterías, candlelit bars, speakeasy-style lounges.",
            "late": "late night (Madrid: 02–06) — after-hours speakeasies, dive bars with soul, live-music basements, 24h tabernas.",
        }
        rhythm = rhythms.get(moment)
        if rhythm:
            moment_line = f"\n- Current moment of the day: {rhythm} Strongly prefer venues whose natural energy fits this window — reject picks that feel out-of-hour."

    # Weather-aware guidance — only added when we have real data.
    weather_line = ""
    if weather and weather.get("condition") and weather.get("condition") != "unknown":
        rules = []
        if weather.get("is_rainy"):
            rules.append("It's raining right now — AVOID rooftops, open-air terraces, and venues whose main draw is outdoor seating. FAVOR cozy indoor cellars, tabernas, covered patios, and places with fireplaces.")
        if weather.get("is_cold"):
            rules.append("It's cold (under 10°C) — FAVOR warm interiors, heated dining rooms, and venues known for warm drinks. AVOID open-air venues.")
        if weather.get("is_hot"):
            rules.append("It's hot (over 28°C) — FAVOR shaded terraces, air-conditioned basements, and places with cold drinks or helado. AVOID sun-baked rooftops at peak hours.")
        rules_block = ("\n- " + "\n- ".join(rules)) if rules else ""
        temp_part = f", {weather.get('temp_c')}°C" if weather.get("temp_c") is not None else ""
        weather_line = f"\nMadrid weather right now: {weather['condition']}{temp_part}.{rules_block}"

    prompt = f"""You are a grizzled pirate navigator helping a crew find their next destination in Madrid, Spain.
The crew vibe is: {preferences['vibe']}, budget: {preferences['budget']}.
Chosen chest category: {category}. Sort priority: {sort_mode}.
Things to avoid: {preferences['avoid']}.{special_line}{day_line}{moment_line}{weather_line}
From this list of real places, pick the {count} best hidden gems.
Rules:
- Avoid chains or franchises (McDonalds, Starbucks, VIPS, etc) unless no other option exists
{review_rule}
- Pick places that match the vibe and budget
- If budget is broke, avoid places with price_level 3 or 4
- If there is a special occasion, factor it into the hook
- You MUST return a JSON array with exactly {count} objects — no fewer{quiet_line}
Return ONLY a JSON array, no extra text, no markdown:
[{{"name":"exact original place name","pirate_name":"dramatic pirate nickname max 4 words","pirate_name_es":"mismo apodo en español max 4 palabras","hook":"one sentence pirate voice max 15 words","send_off":"short pirate encouragement max 8 words","place_id":"exact place_id from input"}}]
Places to choose from:
{json.dumps(places_summary, indent=2)}"""

    raw = call_gemini_with_retry(prompt, temperature=0.9)
    result = json.loads(clean_json(raw))
    return result

def build_bounties(dossiers, places, base_url="http://localhost:5001"):
    bounties = []
    for d in dossiers:
        match = next((p for p in places if p.get("place_id") == d.get("place_id")), None)
        if match:
            photo_ref = (match.get("photos") or [{}])[0].get("photo_reference")
            photo_url = f"{base_url}/api/photo?ref={photo_ref}" if photo_ref else None
            details = get_place_details(d.get("place_id"))
            bounties.append({
                "name": d.get("name"),
                "pirate_name": d.get("pirate_name"),
                "pirate_name_es": d.get("pirate_name_es"),
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
                "user_ratings_total": match.get("user_ratings_total"),
                "open_now": details.get("open_now"),
                "closes_at": details.get("closes_at"),
                "website": details.get("website"),
            })
    return bounties

@app.route("/api/photo")
def photo_proxy():
    ref = request.args.get("ref", "").strip()
    if not ref or not MAPS_KEY:
        return ("", 404)
    url = "https://maps.googleapis.com/maps/api/place/photo"
    params = {"maxwidth": 800, "photo_reference": ref, "key": MAPS_KEY}
    try:
        resp = requests.get(url, params=params, timeout=8, allow_redirects=True)
        if resp.status_code == 200:
            return (resp.content, 200, {
                "Content-Type": resp.headers.get("Content-Type", "image/jpeg"),
                "Cache-Control": "public, max-age=86400",
                "Access-Control-Allow-Origin": "*",
            })
    except Exception as e:
        print(f"[Photo proxy] {e}")
    return ("", 502)

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
    quiet_mode = bool(data.get("quiet_mode", False))
    vibe_intensity = (data.get("vibe_intensity") or "hidden").strip().lower()
    moment = (data.get("moment") or "").strip().lower()

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

    weather = fetch_madrid_weather()

    base_url = request.host_url.rstrip("/")
    try:
        dossiers = generate_dossiers(
            ranked_places, preferences, category=category, sort_mode=sort_mode,
            day_of_week=day_of_week, age_group=age_group, quiet_mode=quiet_mode, vibe_intensity=vibe_intensity,
            weather=weather, moment=moment,
        )
    except Exception as e:
        err = str(e)
        if "429" in err or "quota" in err.lower():
            return jsonify({"error": "Gemini quota limit. Try again in a minute.", "quota_error": True}), 429
        return jsonify({"error": f"Could not generate dossiers: {err}"}), 500

    bounties = build_bounties(dossiers, ranked_places, base_url)

    # If Gemini returned fewer than 3, retry with relaxed constraints
    if len(bounties) < 3:
        try:
            relaxed_dossiers = generate_dossiers(
                ranked_places, preferences, category=category, sort_mode=sort_mode,
                day_of_week=day_of_week, age_group=age_group, quiet_mode=False, relaxed=True,
                weather=weather, moment=moment,
            )
            bounties = build_bounties(relaxed_dossiers, ranked_places, base_url)
        except Exception:
            pass

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
        "all_place_ids": [p.get("place_id") for p in ranked_places],
        "weather": weather,
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

    base_url = request.host_url.rstrip("/")
    bounties = build_bounties(dossiers, places, base_url)
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

@app.route("/api/vibe-from-photo", methods=["POST"])
def vibe_from_photo():
    data = request.json or {}
    image_b64 = data.get("image_b64", "")
    mime_type = data.get("mime_type", "image/jpeg")
    if not image_b64:
        return jsonify({"error": "No image provided"}), 400
    api_key = os.getenv("GEMINI_API_KEY")
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
    prompt_text = (
        "You are RUMBO, a pirate navigator for Madrid nightlife. Look at this photo the user uploaded. "
        "Based on its vibe, mood, aesthetic, and content, describe the kind of night out in Madrid this person is looking for. "
        "Write a hunt description (2–3 sentences) that captures the energy of this photo and directs a search for matching hidden gems in Madrid. "
        "Be specific about vibe — romantic, wild, cultural, foodie, adventure, or chill. "
        "Keep it under 60 words. Write in second person starting with 'You're looking for...'"
    )
    payload = {
        "contents": [{"parts": [
            {"text": prompt_text},
            {"inline_data": {"mime_type": mime_type, "data": image_b64}},
        ]}]
    }
    try:
        resp = requests.post(url, json=payload, timeout=30)
        if resp.status_code != 200:
            return jsonify({"error": f"Gemini error {resp.status_code}"}), 500
        result = resp.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
        return jsonify({"hunt_description": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/ask-navigator", methods=["POST"])
def ask_navigator():
    data = request.json or {}
    question = (data.get("question") or "").strip()
    bounties = data.get("bounties", [])
    preferences = data.get("preferences", {})
    if not question:
        return jsonify({"error": "No question provided"}), 400
    bounties_text = "\n".join([
        f"- {b.get('pirate_name','?')} ({b.get('name','?')}) at {b.get('address','?')}: {b.get('hook','')}"
        for b in bounties
    ])
    prompt = (
        f"You are RUMBO, a grizzled pirate navigator who knows every hidden gem in Madrid.\n"
        f"Tonight's three treasures for the crew:\n{bounties_text}\n\n"
        f"Vibe: {preferences.get('vibe','unknown')}, budget: {preferences.get('budget','medium')}.\n"
        f"The crew asks: \"{question}\"\n\n"
        f"Answer in character as a pirate navigator — dramatic but practical. Max 3 sentences. "
        f"Give useful advice about the venues, timing, dress code, or Madrid nightlife as relevant."
    )
    try:
        answer = call_gemini_with_retry(prompt, temperature=0.7)
        return jsonify({"answer": answer})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "ship is sailing",
        "maps_key": bool(MAPS_KEY),
        "gemini_key": bool(os.getenv("GEMINI_API_KEY")),
        "fallback_mode": not bool(MAPS_KEY),
        "cache_entries": len(_cache),
    })

if __name__ == "__main__":
    # Watch .env files so editing secrets triggers a reload without a manual
    # restart — otherwise stale env vars silently drop us into FALLBACK_GEMS.
    extra_watch = [
        os.path.join(_root, ".env"),
        os.path.join(os.path.dirname(__file__), ".env"),
    ]
    app.run(debug=True, port=5001, extra_files=[p for p in extra_watch if os.path.exists(p)])