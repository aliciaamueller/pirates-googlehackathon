# RUMBO — AI Pirate Navigator for Hidden Madrid

> *"Skip the tourist traps. Three hidden gems, charted by a pirate, powered by Google."*

RUMBO is a Google Maps × Gemini AI app that finds three real, non-touristy hidden gems in Madrid for any crew, any vibe, any moment of the night — and makes the discovery feel like an adventure.

Built at the **Google Hackathon Madrid, April 2025**.

---

## What It Does

Most "find a place" apps give you the same tourist-facing results everyone else gets. RUMBO is different:

- You describe your crew (roles, vibe, budget, neighbourhood, time of night)
- Gemini 2.5 Flash reads the room and picks **three real hidden gems** from Google Places — filtered by exclusivity, weather, time of day, and crew archetype
- Each place gets a **pirate dossier**: a dramatic nickname, a one-line hook, and a send-off — all in character
- The crew can **vote live** (aye / nay) in real time via Supabase Realtime, swap places they don't like, navigate the full route, and download a **personalised Pirate Identity Card** PNG to take home

### Key Features

| Feature | What it does |
|---|---|
| **Crew Brief** | Pick category, neighbourhood, roles, crew size, cuisine, duration — or type freely as Captain |
| **Surprise Mode** | Gemini picks everything based on time of day — no input needed |
| **Rivalry Mode** | Two people with different tastes? One hunt satisfies both |
| **Weather-aware picks** | Rain → indoor cellars. Heat → shaded terraces. Cold → warm interiors. All automatic. |
| **Open Now filter** | Live opening hours via Google Places Details API, with closing countdown timers |
| **Moment of day** | Breakfast / Tapas / Cena / Copas / Late — venue energy matched to the hour |
| **Live Crew Votes** | Share a link, crew votes aye/nay in real time via Supabase Realtime broadcast |
| **Pirate Identity Card** | Downloadable PNG with your unique procedurally-generated avatar + QR code |
| **Navigator Chat** | Ask the pirate navigator anything about tonight's picks |
| **Pirate Voice** | Browser TTS narrates your three treasures in character; ElevenLabs upgrade available |
| **Vibe Telescope** | Upload a photo — Gemini reads its soul and generates a hunt brief from it |
| **Route Optimizer** | Walking distance and full Google Maps multi-stop route |
| **Saved Treasures** | Favourite places persist to Supabase, shown on your Identity Card |
| **Crew Plans** | Create shared plans, invite crew, add places together |
| **Unique Pirate Avatar** | Deterministic from your username hash — hat, beard, patch, coat, earring, scar. No two captains look the same. |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19 + Vite, plain CSS-in-JS |
| Backend | Python 3 / Flask |
| AI | Gemini 2.5 Flash (dossiers, preferences, navigator chat, photo vibe) |
| Maps | Google Places API (Nearby Search + Details), Google Maps JS API |
| Auth + Realtime | Supabase (auth, favorites, plans, Realtime broadcast for live voting) |
| Weather | wttr.in (keyless, cached) + Open-Meteo |
| Voice | Browser SpeechSynthesis + optional ElevenLabs TTS |
| Avatar | Procedural SVG (djb2 hash → 9 trait dimensions, 3 hat styles) |

---

## How to Run It Locally

### Prerequisites

- Python 3.10+
- Node.js 18+
- A `.env` file in the project root (see below)

### 1. Clone the repo

```bash
git clone https://github.com/aliciaamueller/pirates-googlehackathon.git
cd pirates-googlehackathon
```

### 2. Set up environment variables

Create a `.env` file in the project root:

```env
# Required
GEMINI_API_KEY=your_gemini_api_key_here
MAPS_API_KEY=your_google_maps_api_key_here

# Required for auth, favorites, plans, and live crew voting
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional — enables ElevenLabs pirate voice (falls back to browser TTS if absent)
ELEVENLABS_API_KEY=your_elevenlabs_key_here
```

**Getting the keys:**
- `GEMINI_API_KEY` → [Google AI Studio](https://aistudio.google.com/app/apikey)
- `MAPS_API_KEY` → [Google Cloud Console](https://console.cloud.google.com/) — enable **Places API** and **Maps JavaScript API**
- Supabase → [supabase.com](https://supabase.com) — free project, copy URL + anon key from Settings → API

> **No Maps key?** The app automatically falls back to a curated list of 20+ real Madrid hidden gems so it still works for demos.

### 3. One-command launch (recommended)

Run both backend and frontend with a single script:

```bash
bash start.sh
```

This will:
- Create and activate a Python virtual environment
- Install Python dependencies
- Install Node dependencies
- Start the Flask backend on `http://localhost:5001`
- Start the Vite dev server on `http://localhost:5173`

Then open **http://localhost:5173** in your browser.

---

### Manual launch (alternative)

**Backend** (in one terminal):
```bash
cd backend
python3 -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

**Frontend** (in another terminal):
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**.

---

## Supabase Schema

If you want favorites, plans, and live voting to work, create these tables in your Supabase project (SQL editor):

```sql
-- Saved places
create table favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  place_id text not null,
  place_name text,
  place_address text,
  place_photo text,
  created_at timestamptz default now()
);

-- Crew plans
create table plans (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_by uuid references auth.users not null,
  created_at timestamptz default now()
);

create table plan_members (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references plans not null,
  user_id uuid references auth.users not null,
  status text default 'accepted',
  created_at timestamptz default now()
);

create table plan_places (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references plans not null,
  place_id text,
  place_name text,
  place_address text,
  place_photo text,
  added_by uuid references auth.users,
  created_at timestamptz default now()
);

-- Enable Row Level Security (optional but recommended)
alter table favorites enable row level security;
create policy "Users manage own favorites" on favorites for all using (auth.uid() = user_id);
```

Live crew voting uses **Supabase Realtime broadcast** — no table needed, zero config.

---

## What Judges Should Notice

1. **It actually finds hidden gems** — not the first Google result. Gemini filters by review count, vibe, budget, and weather simultaneously.

2. **The hunt loading screen** — a spinning ship's wheel with rotating "Port Gossip" facts about Madrid. Every second of wait time is entertaining.

3. **The pirate avatar** — click the profile icon. Every user gets a unique procedurally-generated pirate portrait (hat, beard, eye patch, coat, earring, scar) derived from a hash of their username. Download your Identity Card PNG.

4. **Live crew votes** — open the app on two devices, share the Crew Link, vote aye/nay on the same places in real time. Counts update instantly via WebSocket.

5. **The weather is live** — if it's raining in Madrid right now, you won't get rooftop bar recommendations. The app knows.

6. **Tap "Surprise Me"** — Gemini picks category, neighbourhood, and brief based on the current time. No input required.

7. **The Navigator's Tip** — after a hunt, a contextual drink suggestion appears based on live weather (*"Rain's in — perfect excuse for a warm vermut"*).

---

## Project Structure

```
pirates-googlehackathon/
├── backend/
│   ├── app.py          # Flask API — hunt, swap, narrate, weather, photo proxy
│   ├── agent.py        # Crew reaction agents (pirate personas)
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── App.jsx                    # Main app shell + all screens
│       ├── constants.js               # Barrios, roles, vibes, hunt stages
│       ├── styles.js                  # Global CSS + keyframe animations
│       └── components/
│           ├── PirateAvatar.jsx       # Procedural SVG avatar + getPirateTitle
│           ├── ProfilePanel.jsx       # Favorites, Identity Card, Account
│           ├── ScrollCard.jsx         # Result card with vote, swap, favorite
│           ├── MapComponents.jsx      # Google Maps integration + route
│           ├── PlansPanel.jsx         # Crew plans UI
│           ├── LandingScreen.jsx      # First-load marketing screen
│           ├── HomeScene.jsx          # Home tab
│           ├── ExploreScene.jsx       # Explore tab
│           └── ...                    # RevealAnimation, VibeMeter, etc.
└── README.md
```

---

## Team

Built by **Ale Pirates** at the Google Hackathon Madrid, April 2025.
