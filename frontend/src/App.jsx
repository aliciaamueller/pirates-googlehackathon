import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

// ─── Constants & Styles ───────────────────────────────────────────
import {
  BARRIOS, CREW_ROLES, CHEST_OPTIONS, SORT_OPTIONS,
  CLUB_DAY_OPTIONS, CLUB_AGE_OPTIONS, HUNT_STAGES,
  MADRID_CENTER, VIBE_THEMES,
  MOMENT_OPTIONS, momentFromHour, momentSceneValue,
} from "./constants";
import { BASE_CSS } from "./styles";

// ─── Components ───────────────────────────────────────────────────
import { RealMap } from "./components/MapComponents";
import {
  MascotSVG, TreasureChestMascot, PirateFigureSVG,
  BriefHeroStarfield, BriefHeroFloatingDecor, BriefHeroFooterIcons,
} from "./components/MascotComponents";
import { SkyBackground } from "./components/SkyBackground";
import { ScrollCard } from "./components/ScrollCard";
import { RevealAnimation } from "./components/RevealAnimation";
import { ShareCard } from "./components/ShareCard";
import { VibeMeter } from "./components/VibeMeter";
import { CrewReactions } from "./components/CrewReactions";
import { RouteOptimizer } from "./components/RouteOptimizer";
import { TreasureLog, saveLog } from "./components/TreasureLog";
import { AuthScreen } from "./components/AuthScreen";
import { LandingScreen } from "./components/LandingScreen";
import { ProfilePanel } from "./components/ProfilePanel";
import { PlansPanel, formatPlanDateTime } from "./components/PlansPanel";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { SeaShader } from "./components/SeaShader";
import { TopBar } from "./components/TopBar";
import { HomeScene } from "./components/HomeScene";
import { ExploreScene } from "./components/ExploreScene";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

const MADRID_FACTS = [
  { icon: "🍽️", text: "Sobrino de Botín has been open since 1725 — the world's oldest restaurant, right here in Madrid." },
  { icon: "🌙", text: "Madrileños eat dinner at 10pm. Your hunt is timed to local rhythms, Captain." },
  { icon: "🍺", text: "More bars per capita than anywhere else in Europe. The navigator has options." },
  { icon: "🎨", text: "More museums per square kilometre than almost any city on earth. Culture runs deep here." },
  { icon: "🕰️", text: "El Rastro flea market has run every Sunday since the 15th century. Some traditions stick." },
  { icon: "⛰️", text: "At 667m above sea level, Madrid is the highest capital city in Europe." },
  { icon: "🌀", text: "La Movida Madrileña — the 80s cultural explosion that turned Madrid into Europe's most creative city." },
  { icon: "🍸", text: "La Hora del Vermut: a sacred pre-lunch vermouth ritual the locals guard with their lives." },
  { icon: "🚇", text: "Madrid's metro runs until 1:30am — even the underground knows how to party." },
  { icon: "🌳", text: "El Retiro park was the private garden of Spanish kings for 200 years." },
];

/** Crew mode: no free-text box — we synthesize a clear brief for the API from chips + chest */
function buildCrewBrief({ categoryId, barrio, roleLabels, sortMode, clubDay, clubAge, crewSize, mealType, cuisine, huntDuration, culturalFocus }) {
  const chest = CHEST_OPTIONS.find((c) => c.id === categoryId);
  const chestLine = chest
    ? `Voyage: ${chest.title} — ${chest.subtitle}.`
    : `Voyage category: ${categoryId}.`;
  const parts = [chestLine];
  if (crewSize) parts.push(crewSize === 1 ? "Solo traveller — just one person." : `Group of ${crewSize} people.`);
  if (categoryId === "restaurants_bars") {
    if (mealType === "food") parts.push("Looking for restaurants and food spots only — no bars.");
    else if (mealType === "drinks") parts.push("Looking for bars and drink venues only — no restaurants.");
    if (cuisine && cuisine !== "any") parts.push(`Cuisine preference: ${cuisine}.`);
  }
  if (categoryId === "museums" && culturalFocus && culturalFocus !== "any") {
    parts.push(`Cultural focus: ${culturalFocus} — find museums, galleries or cultural spaces specialising in this.`);
  }
  if (barrio?.name) parts.push(`Area focus: ${barrio.name}.`);
  if (roleLabels.length) parts.push(`Crew archetypes: ${roleLabels.join(", ")}.`);
  const sortLabel = SORT_OPTIONS.find((s) => s.id === sortMode)?.label || sortMode;
  parts.push(`Prefer results ranked by: ${sortLabel}.`);
  if (categoryId === "clubs" && clubDay && clubAge) {
    const ageLabel = CLUB_AGE_OPTIONS.find((a) => a.id === clubAge)?.label || clubAge;
    parts.push(`Club context: ${clubDay}, age band ${ageLabel}.`);
  }
  if (huntDuration && huntDuration !== "any") {
    const dLabel = huntDuration === "allnight" ? "all night — no time limit, make it memorable" : `${huntDuration} hour${huntDuration !== "1" ? "s" : ""}`;
    parts.push(`Time available: ${dLabel}.`);
  }
  parts.push(`Find three exceptional hidden-gem places in Madrid that fit this brief.`);
  return parts.join(" ");
}

function buildMapsRouteUrl(bountiesList) {
  if (!bountiesList.length) return "#";
  if (bountiesList.length === 1) return bountiesList[0].maps_url;
  const origin = `${bountiesList[0].lat},${bountiesList[0].lng}`;
  const dest = `${bountiesList[bountiesList.length - 1].lat},${bountiesList[bountiesList.length - 1].lng}`;
  const waypts = bountiesList.slice(1, -1).map(b => `${b.lat},${b.lng}`).join("|");
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${dest}${waypts ? `&waypoints=${waypts}` : ""}&travelmode=walking`;
}

// ─── MAIN APP ─────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authView, setAuthView] = useState("landing");
  const [authInitialMode, setAuthInitialMode] = useState("login");
  const [tab, setTab] = useState("home"); // "home" | "explore" | "hunt"
  const [planCount, setPlanCount] = useState(0);
  const [showProfile, setShowProfile] = useState(false);
  const [showPlans, setShowPlans] = useState(false);
  const [favoritedIds, setFavoritedIds] = useState(new Set());
  const [showAddToPlan, setShowAddToPlan] = useState(false);
  const [addingBounty, setAddingBounty] = useState(null);
  const [userPlans, setUserPlans] = useState([]);
  const [addMsg, setAddMsg] = useState("");
  const [screen, setScreen]           = useState("brief");
  const [selectedBarrio, setBarrio]   = useState(null);
  const [selectedRoles, setRoles]     = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("restaurants_bars");
  const [sortMode, setSortMode]       = useState("popularity");
  const [clubDay, setClubDay]         = useState("");
  const [clubAge, setClubAge]         = useState("");
  const [briefInputTab, setBriefInputTab] = useState("crew");
  const [captainPrompt, setCaptainPrompt] = useState("");
  const [captainExtrasOpen, setCaptainExtrasOpen] = useState(false);
  const [bounties, setBounties]       = useState([]);
  const [preferences, setPrefs]       = useState(null);
  const [sessionKey, setSession]      = useState(null);
  const [error, setError]             = useState("");
  const [location, setLocation]       = useState(null);
  const [visibleCards, setVisible]    = useState([]);
  const [copied, setCopied]           = useState(false);
  const [swappingId, setSwapping]     = useState(null);
  const [reactions, setReactions]     = useState(null);
  const [showShare, setShowShare]     = useState(false);
  const [routeInfo, setRouteInfo]     = useState(null);
  const [showRevealAnim, setShowRevealAnim] = useState(false);
  const [huntStage, setHuntStage]     = useState(0);
  const [quietMode, setQuietMode]     = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [swapHistory, setSwapHistory] = useState([]);
  const [vibeIntensity, setVibeIntensity] = useState("hidden");
  const [crewSize, setCrewSize] = useState(2);
  const [mealType, setMealType] = useState("both");
  const [cuisine, setCuisine] = useState("any");
  const [huntDuration, setHuntDuration] = useState("any");
  const [weather, setWeather] = useState(null);
  const [huntWeather, setHuntWeather] = useState(null);
  const [moment, setMoment] = useState(() => momentFromHour(new Date().getHours()));
  const [speaking, setSpeaking] = useState(false);
  const [navigatorChat, setNavigatorChat] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [rivalryMode, setRivalryMode] = useState(false);
  const [rivalry2Category, setRivalry2Category] = useState("clubs");
  const [openNowOnly, setOpenNowOnly] = useState(false);
  const [culturalFocus, setCulturalFocus] = useState("any");
  const [crewShareId, setCrewShareId] = useState(null);
  const [crewVotes, setCrewVotes] = useState({});
  const [myVotes, setMyVotes] = useState({});
  const [crewLinkCopied, setCrewLinkCopied] = useState(false);
  const [huntFactIdx, setHuntFactIdx] = useState(0);
  const photoInputRef = useRef(null);
  const crewChannelRef = useRef(null);
  const huntAbortRef = useRef(null);

  const currentVibe = preferences?.vibe || null;
  const theme = currentVibe ? VIBE_THEMES[currentVibe] : null;


  useEffect(() => {
    if (!supabase) { setAuthLoading(false); return; }
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Hydrate favourite + plan counts once the user is known (for HomeScene stats).
  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const { data: favs } = await supabase.from("favorites").select("place_id").eq("user_id", user.id);
        if (!cancelled && favs) setFavoritedIds(new Set(favs.map(f => f.place_id)));
      } catch { /* non-fatal */ }
      try {
        const { data: mem } = await supabase.from("plan_members").select("plan_id").eq("user_id", user.id).eq("status", "accepted");
        if (!cancelled) setPlanCount(mem?.length || 0);
      } catch { /* non-fatal */ }
    })();
    return () => { cancelled = true; };
  }, [user]);

  // Parse crew hunt link on first load
  useEffect(() => {
    const hash = window.location.hash;
    if (!hash.startsWith("#hunt=")) return;
    try {
      const encoded = hash.slice(6);
      const { shareId, bounties: loaded } = JSON.parse(decodeURIComponent(atob(encoded)));
      setBounties(loaded);
      setCrewShareId(shareId);
      setTab("hunt");
      setScreen("reveal");
      window.history.replaceState(null, "", window.location.pathname);
      if (supabase && shareId) {
        const ch = supabase.channel(`rumbo-${shareId}`)
          .on("broadcast", { event: "vote" }, ({ payload }) => {
            setCrewVotes(v => {
              const cur = v[payload.place_id] || { up: 0, down: 0 };
              const delta = payload.delta ?? 1;
              const updated = { ...cur, [payload.dir]: Math.max(0, (cur[payload.dir] || 0) + delta) };
              if (payload.remove_dir) updated[payload.remove_dir] = Math.max(0, (cur[payload.remove_dir] || 0) - 1);
              return { ...v, [payload.place_id]: updated };
            });
          })
          .subscribe();
        crewChannelRef.current = ch;
      }
    } catch { /* bad link — ignore */ }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function broadcastVote(placeId, dir) {
    const currentVote = myVotes[placeId];
    if (currentVote === dir) {
      // Toggle off — remove vote
      setMyVotes(v => ({ ...v, [placeId]: null }));
      setCrewVotes(v => {
        const cur = v[placeId] || { up: 0, down: 0 };
        return { ...v, [placeId]: { ...cur, [dir]: Math.max(0, (cur[dir] || 0) - 1) } };
      });
      if (crewChannelRef.current) {
        await crewChannelRef.current.send({ type: "broadcast", event: "vote", payload: { place_id: placeId, dir, delta: -1 } });
      }
    } else {
      // New vote or flip direction
      const oldDir = currentVote || null;
      setMyVotes(v => ({ ...v, [placeId]: dir }));
      setCrewVotes(v => {
        const cur = v[placeId] || { up: 0, down: 0 };
        const next = { ...cur, [dir]: (cur[dir] || 0) + 1 };
        if (oldDir) next[oldDir] = Math.max(0, (next[oldDir] || 0) - 1);
        return { ...v, [placeId]: next };
      });
      if (crewChannelRef.current) {
        await crewChannelRef.current.send({ type: "broadcast", event: "vote", payload: { place_id: placeId, dir, delta: 1, remove_dir: oldDir } });
      }
    }
  }

  function copyCrewLink() {
    if (!crewShareId || !bounties.length) return;
    const minimal = bounties.map(b => ({
      place_id: b.place_id, pirate_name: b.pirate_name, hook: b.hook,
      address: b.address, maps_url: b.maps_url, lat: b.lat, lng: b.lng,
      photo_url: b.photo_url, rating: b.rating, name: b.name,
    }));
    const encoded = btoa(encodeURIComponent(JSON.stringify({ shareId: crewShareId, bounties: minimal })));
    const url = `${window.location.origin}${window.location.pathname}#hunt=${encoded}`;
    navigator.clipboard.writeText(url).then(() => { setCrewLinkCopied(true); setTimeout(() => setCrewLinkCopied(false), 2500); });
  }

  async function startHunt(descOverride = null, barrioOverride = undefined) {
    const barrio = barrioOverride !== undefined ? barrioOverride : selectedBarrio;
    const roleLabels = selectedRoles.map((id) => CREW_ROLES.find((r) => r.id === id)?.label).filter(Boolean);

    // ── Surprise mode: Gemini picks category + description based on time ──
    let effectiveCategory = selectedCategory;
    if (selectedCategory === "surprise" && descOverride == null) {
      const hour = new Date().getHours();
      effectiveCategory = hour >= 22 || hour < 4 ? "clubs" : hour >= 18 ? "restaurants_bars" : hour >= 10 ? "museums" : "restaurants_bars";
      const surpriseDescs = {
        clubs: "A wild surprise night out in Madrid, hidden clubs and bars the navigator chooses for us — no tourist traps, purely local.",
        restaurants_bars: "Surprise us with the best hidden local tapas bar or restaurant in Madrid for tonight, something special the navigator picks.",
        museums: "Surprise us with a hidden cultural gem in Madrid, a museum or gallery off the tourist trail that the navigator thinks we'll love.",
      };
      descOverride = surpriseDescs[effectiveCategory];
    }

    // ── Rivalry mode: combine two vibes into one hunt ──
    if (rivalryMode && descOverride == null && briefInputTab === "crew" && effectiveCategory !== "surprise") {
      const cat1 = CHEST_OPTIONS.find(c => c.id === effectiveCategory);
      const cat2 = CHEST_OPTIONS.find(c => c.id === rivalry2Category);
      if (cat1 && cat2 && cat1.id !== cat2.id) {
        const bLine = barrio?.name ? ` in ${barrio.name}` : "";
        descOverride = `Two people with rival tastes: Person 1 wants ${cat1.subtitle}, Person 2 wants ${cat2.subtitle}. Find three hidden gems${bLine} in Madrid that can satisfy both sides — versatile, character-filled spots that bridge different vibes. Group of ${crewSize}.`;
        effectiveCategory = "restaurants_bars";
      }
    }

    let rawDesc;
    if (descOverride != null) rawDesc = descOverride;
    else if (briefInputTab === "capitan") rawDesc = captainPrompt;
    else
      rawDesc = buildCrewBrief({
        categoryId: effectiveCategory,
        barrio,
        roleLabels,
        sortMode,
        clubDay,
        clubAge,
        crewSize,
        mealType,
        cuisine,
        huntDuration,
        culturalFocus,
      });

    if (briefInputTab === "capitan" && !String(rawDesc).trim()) {
      setError("Tell the Captain what you seek, or switch to Crew.");
      return;
    }
    if (effectiveCategory === "clubs" && selectedCategory !== "surprise" && (!clubDay || !clubAge)) {
      setError("For clubs, choose both day and age before setting sail.");
      return;
    }

    setError(""); setScreen("hunting"); setReactions(null); setHuntStage(0); setRouteInfo(null);
    setCrewVotes({}); setMyVotes({});
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Advance hunt stages visibly — short enough to tick through in a typical 4–8s API round trip
    const stageTimers = [900, 2000, 3400, 5200].map((delay, i) =>
      setTimeout(() => setHuntStage(i + 1), delay)
    );

    huntAbortRef.current = new AbortController();
    const coords = barrio && !barrio.surprise ? { lat: barrio.lat, lng: barrio.lng } : location || MADRID_CENTER;
    const fullDesc = String(rawDesc).trim();
    try {
      const res = await fetch(`${API}/api/hunt`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        signal: huntAbortRef.current.signal,
        body: JSON.stringify({
          description: fullDesc,
          lat: coords.lat,
          lng: coords.lng,
          roles: roleLabels,
          category: effectiveCategory,
          sort_mode: sortMode,
          quiet_mode: quietMode,
          vibe_intensity: vibeIntensity,
          group_size: crewSize,
          moment: moment,
          count: 3,
          open_now_only: openNowOnly,
          day_of_week: effectiveCategory === "clubs" ? (clubDay || new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase()) : new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase(),
          age_group: effectiveCategory === "clubs" ? (clubAge || "21-25") : undefined,
        }),
      });
      stageTimers.forEach(clearTimeout);
      setHuntStage(4);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      const prefs = data.preferences;
      setBounties(data.bounties || []);
      setPrefs(prefs);
      setSession(data.session_key);
      if (data.weather) setHuntWeather(data.weather);

      // Set up live crew sync channel
      const newShareId = Math.random().toString(36).slice(2, 8).toUpperCase();
      setCrewShareId(newShareId);
      if (supabase) {
        if (crewChannelRef.current) supabase.removeChannel(crewChannelRef.current);
        const ch = supabase.channel(`rumbo-${newShareId}`)
          .on("broadcast", { event: "vote" }, ({ payload }) => {
            setCrewVotes(v => {
              const cur = v[payload.place_id] || { up: 0, down: 0 };
              const delta = payload.delta ?? 1;
              const updated = { ...cur, [payload.dir]: Math.max(0, (cur[payload.dir] || 0) + delta) };
              if (payload.remove_dir) updated[payload.remove_dir] = Math.max(0, (cur[payload.remove_dir] || 0) - 1);
              return { ...v, [payload.place_id]: updated };
            });
          })
          .subscribe();
        crewChannelRef.current = ch;
      }

      // Show gold burst reveal animation, then switch to reveal screen
      setShowRevealAnim(true);
      setTimeout(() => {
        setShowRevealAnim(false);
        setScreen("reveal");
      }, 1900);

      saveLog({
        description: fullDesc, vibe: prefs?.vibe,
        barrio: barrio?.name, bounties: data.bounties,
        preferences: prefs,
      });

      fetch(`${API}/api/crew-react`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bounties: data.bounties, preferences: prefs }),
      }).then(r => r.json()).then(d => { if (d.reactions) setReactions(d.reactions); }).catch(() => {});

    } catch (e) {
      stageTimers.forEach(clearTimeout);
      if (e.name === "AbortError") return; // user went back — silent
      setError(e.message); setScreen("brief");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function swapBounty(rejectedId) {
    if (!sessionKey) return;
    setSwapping(rejectedId);
    const currentIds = bounties.map(b => b.place_id);
    const rejectedBounty = bounties.find(b => b.place_id === rejectedId);
    const rejectedIdx = bounties.findIndex(b => b.place_id === rejectedId);
    try {
      const res = await fetch(`${API}/api/swap`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejected_place_id: rejectedId, current_place_ids: currentIds, session_key: sessionKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No replacement");
      setBounties(p => p.map(b => b.place_id === rejectedId ? data.bounty : b));
      setVisible(p => p.filter(i => i !== rejectedIdx));
      setTimeout(() => setVisible(p => [...p, rejectedIdx]), 200);
      setSwapHistory(h => [{ bounty: rejectedBounty, index: rejectedIdx }, ...h].slice(0, 3));
    } catch (e) { setError(e.message); }
    finally { setSwapping(null); }
  }

  function undoLastSwap() {
    if (!swapHistory.length) return;
    const { bounty: original, index } = swapHistory[0];
    setBounties(p => p.map((b, i) => i === index ? original : b));
    setVisible(p => p.filter(i => i !== index));
    setTimeout(() => setVisible(p => [...p, index]), 200);
    setSwapHistory(h => h.slice(1));
  }

  function switchTab(next) {
    const apply = () => {
      if (screen !== "brief") {
        setScreen("brief"); setBounties([]); setPrefs(null);
        setSession(null); setError(""); setVisible([]); setCopied(false);
        setSwapping(null); setReactions(null); setRouteInfo(null);
        setShowRevealAnim(false); setHuntStage(0); setSwapHistory([]);
      }
      setTab(next);
      window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });
    };
    if (typeof document !== "undefined" && document.startViewTransition) {
      document.startViewTransition(apply);
    } else {
      apply();
    }
  }

  function reset() {
    setScreen("brief"); setTab("home"); setBounties([]); setPrefs(null);
    setSession(null); setError(""); setVisible([]); setCopied(false);
    setSwapping(null); setReactions(null);
    setSelectedCategory("restaurants_bars");
    setSortMode("popularity");
    setClubDay("");
    setClubAge("");
    setRouteInfo(null);
    setShowRevealAnim(false);
    setHuntStage(0);
    setSwapHistory([]);
    setIsListening(false);
    setVibeIntensity("hidden");
    setBriefInputTab("crew");
    setCaptainPrompt("");
    setCaptainExtrasOpen(false);
    setHuntDuration("any");
    setWeather(null);
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeaking(false);
    setNavigatorChat(false);
    setChatHistory([]);
    setChatInput("");
    setChatLoading(false);
    setRivalryMode(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restoreFromLog(entry) {
    setBounties(entry.bounties || []);
    setPrefs(entry.preferences || null);
    setCaptainPrompt(entry.description || "");
    setScreen("reveal");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => entry.bounties?.forEach((_, i) => setTimeout(() => setVisible(p => [...p, i]), i * 400)), 100);
  }

  function startVoice() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice input not supported in this browser."); return; }
    if (isListening) { setIsListening(false); return; }
    const rec = new SR();
    rec.lang = "en-US"; rec.continuous = false; rec.interimResults = false;
    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onerror = () => setIsListening(false);
    rec.onresult = e => {
      const transcript = e.results[0][0].transcript;
      setCaptainPrompt(p => p ? p + " " + transcript : transcript);
      setBriefInputTab("capitan");
    };
    rec.start();
  }

  function shareText() {
    const text = ["🗺️ RUMBO found your next adventure in Madrid\n",
      ...bounties.map((b, i) => `${["⚓","☠️","⚔️"][i]} ${b.pirate_name}\n📍 ${b.address}\n→ ${b.maps_url}`),
      "\nFound by RUMBO 🧭 — rumbo.app",
    ].join("\n");
    navigator.clipboard.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); });
  }


  async function handleFavorite(bounty) {
    if (!user) return;
    const newFavs = new Set(favoritedIds);
    if (newFavs.has(bounty.place_id)) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("place_id", bounty.place_id);
      newFavs.delete(bounty.place_id);
    } else {
      await supabase.from("favorites").insert({
        user_id: user.id, place_id: bounty.place_id,
        place_name: bounty.pirate_name || bounty.name,
        place_address: bounty.address, place_photo: bounty.photo_url,
      });
      newFavs.add(bounty.place_id);
    }
    setFavoritedIds(newFavs);
  }

  async function openAddToPlan(bounty) {
    const { data: memberOf } = await supabase.from("plan_members").select("plan_id").eq("user_id", user.id).eq("status", "accepted");
    if (!memberOf?.length) { setUserPlans([]); } else {
      const ids = memberOf.map(m => m.plan_id);
      const { data } = await supabase.from("plans").select("*").in("id", ids);
      setUserPlans(data || []);
    }
    setAddingBounty(bounty);
    setShowAddToPlan(true);
    setAddMsg("");
  }

  async function addBountyToPlan(plan) {
    if (!addingBounty) return;
    const { error } = await supabase.from("plan_places").insert({
      plan_id: plan.id, place_id: addingBounty.place_id,
      place_name: addingBounty.pirate_name || addingBounty.name,
      place_address: addingBounty.address, place_photo: addingBounty.photo_url,
      added_by: user.id,
    });
    if (error) { setAddMsg("❌ Error adding place."); return; }
    setAddMsg(`✅ Added to "${plan.name}"!`);
    setTimeout(() => { setShowAddToPlan(false); setAddingBounty(null); setAddMsg(""); }, 1500);
  }

  useEffect(() => {
    if (screen !== "hunting") return;
    setHuntStage(0);
    setHuntFactIdx(0);
    const id = setInterval(() => setHuntFactIdx(i => (i + 1) % MADRID_FACTS.length), 3800);
    return () => clearInterval(id);
  }, [screen]);

  useEffect(() => {
    if (screen === "reveal" && bounties.length > 0) {
      setVisible([]);
      setTimeout(() => bounties.forEach((_, i) => setTimeout(() => setVisible(p => [...p, i]), i * 500)), 100);
    }
  }, [screen, bounties]);

  useEffect(() => {
    if (screen !== "reveal" || !bounties.length) return;
    const { lat, lng } = bounties[0];
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&forecast_days=1`)
      .then(r => r.json())
      .then(d => { if (d.current_weather) setWeather(d.current_weather); })
      .catch(() => {});
  }, [screen]);

  function speakBounties() {
    if (!window.speechSynthesis) return;
    if (speaking) { window.speechSynthesis.cancel(); setSpeaking(false); return; }
    const text = `Ahoy, Captain! Your three treasures for tonight are: ${bounties.map((b, i) => `Number ${i + 1}: ${b.pirate_name}. ${b.hook} ${b.send_off || ""}`).join(". ")}. Now go claim your bounty!`;
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 0.88; utter.pitch = 0.8;
    utter.onend = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utter);
  }

  async function askNavigator() {
    if (!chatInput.trim() || chatLoading) return;
    const q = chatInput.trim();
    setChatHistory(h => [...h, { role: "user", text: q }]);
    setChatInput(""); setChatLoading(true);
    try {
      const res = await fetch(`${API}/api/ask-navigator`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, bounties, preferences }),
      });
      const d = await res.json();
      setChatHistory(h => [...h, { role: "navigator", text: d.answer || "The navigator has gone silent…" }]);
    } catch {
      setChatHistory(h => [...h, { role: "navigator", text: "The seas are rough… try again." }]);
    } finally { setChatLoading(false); }
  }

  async function handleVibeFromPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (e.target) e.target.value = "";
    const reader = new FileReader();
    reader.onload = async ev => {
      const b64 = ev.target.result.split(",")[1];
      setError("Reading your photo vibe…");
      try {
        const res = await fetch(`${API}/api/vibe-from-photo`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image_b64: b64, mime_type: file.type }),
        });
        const d = await res.json();
        if (d.hunt_description) { setError(""); startHunt(d.hunt_description, null); }
        else setError(d.error || "Could not read photo vibe");
      } catch (err) { setError(err.message); }
    };
    reader.readAsDataURL(file);
  }

  function toggleRole(id) { setRoles(p => p.includes(id) ? p.filter(r => r !== id) : [...p, id]); }

  useEffect(() => {
    if (selectedCategory !== "clubs") {
      setClubDay("");
      setClubAge("");
    }
  }, [selectedCategory]);

  function getSailLabel() {
    if (selectedCategory === "clubs") return "CHART MY NIGHT";
    if (selectedCategory === "museums") return "REVEAL MY RELICS";
    if (selectedCategory === "surprise") return "SURPRISE ME";
    return "FIND MY FEAST";
  }

  const clubOk = selectedCategory !== "clubs" || (clubDay && clubAge);
  const crewReady = clubOk;
  const capitanReady = captainPrompt.trim() && clubOk;
  const canSail = briefInputTab === "capitan" ? capitanReady : crewReady;

  // Dynamic reveal page styles based on vibe theme
  const revealPageStyle = theme ? {
    minHeight: "100vh",
    color: theme.textPrimary,
    transition: "all 0.8s ease",
  } : {};

  if (authLoading) return <div style={{ minHeight: "100vh", background: "#1a1a2e" }} />;
  if (!user && authView === "landing") {
    return (
      <LandingScreen
        onContinue={(mode = "login") => {
          setAuthInitialMode(mode === "signup" ? "signup" : "login");
          setAuthView("auth");
        }}
      />
    );
  }
  if (!user) {
    return (
      <AuthScreen
        onLogin={setUser}
        onBack={() => setAuthView("landing")}
        initialMode={authInitialMode}
      />
    );
  }
  return (

    <>
      <style>{BASE_CSS}</style>

      {/* Shader sea — lives behind everything, responds to scene.
          On the hunt tab we pass a fractional 0..2 so the moment-of-day picker
          morphs the palette without any prompt work. */}
      <SeaShader scene={
        screen === "hunting" ? "hunt"
        : screen === "reveal" ? "explore"
        : screen === "surprise" ? "hunt"
        : tab === "explore" ? "explore"
        : tab === "hunt" ? momentSceneValue(moment)
        : "home"
      } />

      {/* Slim top bar — brand-only, not navigation */}
      <TopBar
        user={user}
        onBrandClick={() => switchTab("home")}
        onOpenProfile={() => setShowProfile(true)}
      />

      {/* ===== HOME TAB ===== */}
      {screen === "brief" && tab === "home" && (
        <HomeScene
          user={user}
          favCount={favoritedIds.size}
          planCount={planCount}
          onStartHunt={() => switchTab("hunt")}
          onOpenExplore={() => switchTab("explore")}
        />
      )}

      {/* ===== EXPLORE TAB ===== */}
      {screen === "brief" && tab === "explore" && (
        <ExploreScene
          onHunt={(desc, barrio) => startHunt(desc, barrio)}
          onStartHunt={() => switchTab("hunt")}
        />
      )}

      {/* ===== HUNT TAB (the brief form) ===== */}
      {screen === "brief" && tab === "hunt" && (
        <div style={{ position: "relative" }}>
          {/* Static hero bg */}
          <div
            className="brief-bg-layer"
            style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}
          />
          <section className="hero hero-brief-unified">
            <div className="brief-hero-column">
              <h1 className="hero-headline fu fu1">
                Chart your course.
                <em>We&apos;ll find the treasure.</em>
              </h1>
              <p className="hero-sub fu fu3">
                Skip the tourist traps. Three mascot chests chart what you hunt — feast, culture, or moonlight — on one night sea.
              </p>

              <div className="input-card input-card-fused fu fu3">
                <div className="chest-hero-scene">
                  <BriefHeroStarfield />
                  <BriefHeroFloatingDecor />
                  <div className="chest-hero-scene-main">
                    <div style={{ display:"flex", justifyContent:"center", marginBottom:"0.25rem" }}>
                      <PirateFigureSVG size={72} />
                    </div>
                    <span className="chest-deck-label">Choose your course</span>
                    <p className="chest-deck-tagline">Pick a chest — or let the navigator surprise you.</p>
                    <div className="chest-picker-grid chest-picker-mascot" style={{ gridTemplateColumns:"repeat(3, minmax(0, 1fr))" }}>
                      {CHEST_OPTIONS.filter(c => c.id !== "surprise").map((chest, i) => (
                        <button
                          type="button"
                          key={chest.id}
                          className={`chest-tile-mascot ${selectedCategory === chest.id ? "sel" : ""}`}
                          style={{ "--chest-accent": chest.accent }}
                          onClick={() => setSelectedCategory(chest.id)}
                        >
                          <TreasureChestMascot
                            variant={chest.variant}
                            selected={selectedCategory === chest.id}
                            animationDelay={`${i * 0.2}s`}
                          />
                          <div className="chest-tile-mascot-labels">
                            <span className="chest-mascot-title">{chest.title}</span>
                            <span className="chest-mascot-sub">{chest.subtitle}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                    {/* Surprise Me — standalone button */}
                    <div style={{ padding:"0 0.5rem 0.5rem", marginTop:"0.85rem" }}>
                      <button type="button" onClick={() => {
                        setSelectedCategory("surprise");
                        const hour = new Date().getHours();
                        const cat = hour >= 22 || hour < 4 ? "clubs" : hour >= 18 ? "restaurants_bars" : "museums";
                        const surpriseDesc = {
                          clubs: "Surprise us with the single most unmissable secret spot in Madrid tonight — something locals love that we would never find on our own.",
                          restaurants_bars: "Surprise us completely — pick the most magical hidden gem restaurant or bar in Madrid right now, something extraordinary we would never discover alone.",
                          museums: "Surprise us with the most fascinating hidden cultural gem in Madrid right now — something genuinely amazing off the tourist trail.",
                        }[cat];
                        startHunt(surpriseDesc, null);
                      }} style={{
                        width:"100%", padding:"0.9rem 1.25rem", borderRadius:14,
                        background:"linear-gradient(135deg, #041510 0%, #082a1a 60%, #041510 100%)",
                        border:"1.5px solid rgba(0,212,170,0.4)",
                        boxShadow:"0 0 24px rgba(0,212,170,0.14), inset 0 1px 0 rgba(0,212,170,0.08)",
                        cursor:"pointer", transition:"all 0.25s",
                        display:"flex", alignItems:"center", gap:12,
                      }}>
                        <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ flexShrink:0 }}>
                          <path d="M16 4 L16 22" stroke="#00D4AA" strokeWidth="1.5" strokeLinecap="round"/>
                          <path d="M16 4 L26 14 L16 14 Z" fill="#00D4AA" opacity="0.85"/>
                          <path d="M16 6 L9 16 L16 16 Z" fill="#00D4AA" opacity="0.55"/>
                          <path d="M5 22 Q16 19 27 22 L24 28 Q16 26 8 28 Z" fill="#00D4AA" opacity="0.7"/>
                          <line x1="5" y1="22" x2="27" y2="22" stroke="#00D4AA" strokeWidth="1.2" opacity="0.5"/>
                        </svg>
                        <div style={{ textAlign:"left", flex:1 }}>
                          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"0.95rem", color:"#00D4AA", fontWeight:700, letterSpacing:"0.04em" }}>Surprise Me</div>
                          <div style={{ fontSize:"0.68rem", color:"rgba(0,212,170,0.6)", fontStyle:"italic", marginTop:2 }}>Gemini picks everything — trust the navigator</div>
                        </div>
                        <span style={{ fontSize:"1rem", color:"rgba(0,212,170,0.55)", flexShrink:0 }}>→</span>
                      </button>
                    </div>
                  </div>
                  <div className="chest-scene-footer">
                    <p className="chest-scene-quote">&ldquo;Aye, I know every hidden gem&hellip;&rdquo;</p>
                    <div className="chest-scene-brand" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:6 }}>
                      <span style={{ color:"#D4A96A" }}>RUMBO</span>
                      <span style={{ color:"rgba(212,169,106,0.35)", fontSize:"0.55rem" }}>×</span>
                      <span style={{ color:"#4285F4", letterSpacing:"0.12em" }}>GOOGLE MAPS</span>
                    </div>
                    <BriefHeroFooterIcons />
                  </div>
                </div>

                <div className="input-card-body">
                <div className="brief-tabs" role="tablist" aria-label="Input mode">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={briefInputTab === "crew"}
                    className={`brief-tab ${briefInputTab === "crew" ? "sel" : ""}`}
                    onClick={() => { setBriefInputTab("crew"); setCaptainExtrasOpen(false); }}
                  >
                    Crew
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={briefInputTab === "capitan"}
                    className={`brief-tab ${briefInputTab === "capitan" ? "sel" : ""}`}
                    onClick={() => setBriefInputTab("capitan")}
                  >
                    Captain
                  </button>
                </div>

                {briefInputTab === "crew" ? (
                  <>
                    <p style={{ fontSize: "0.78rem", color: "#8a7a5a", marginBottom: "0.85rem", fontStyle:"italic" }}>
                      Pick your options below — or switch to <strong>Captain</strong> to type freely.
                    </p>

                    {/* Food vs Drinks battle — only for restaurants_bars */}
                    {selectedCategory === "restaurants_bars" && (
                      <div style={{ marginBottom:"0.85rem" }}>
                        <span className="chips-label">Feast or Grog?</span>
                        <div className="meal-battle">
                          <button type="button" className={`meal-battle-side ${mealType==="food" ? "sel-food" : ""}`} onClick={() => setMealType(mealType==="food" ? "both" : "food")}>
                            <span style={{ fontSize:"1.6rem" }}>🍖</span>
                            <span style={{ fontSize:"0.7rem", fontWeight:700, color:"#b35c00", letterSpacing:"0.06em" }}>FEAST</span>
                            <span style={{ fontSize:"0.62rem", color:"#8a7a5a" }}>Food only</span>
                          </button>
                          <div className="meal-battle-vs">VS</div>
                          <button type="button" className={`meal-battle-side ${mealType==="drinks" ? "sel-drinks" : ""}`} onClick={() => setMealType(mealType==="drinks" ? "both" : "drinks")}>
                            <span style={{ fontSize:"1.6rem" }}>🍸</span>
                            <span style={{ fontSize:"0.7rem", fontWeight:700, color:"#0F2747", letterSpacing:"0.06em" }}>GROG</span>
                            <span style={{ fontSize:"0.62rem", color:"#8a7a5a" }}>Drinks only</span>
                          </button>
                        </div>
                        <button type="button" className={`meal-battle-both ${mealType==="both" ? "sel" : ""}`} onClick={() => setMealType("both")}>
                          🤝 Both — food and drinks
                        </button>
                      </div>
                    )}

                    {/* Moment of the day — only for restaurants; clubs/museums get auto-moment */}
                    {selectedCategory === "restaurants_bars" && (
                      <div style={{ marginBottom:"0.85rem" }}>
                        <span className="chips-label">When is this happening?</span>
                        <div className="chips-row">
                          {MOMENT_OPTIONS.map((m) => (
                            <button
                              type="button"
                              key={m.id}
                              className={`chip ${moment === m.id ? "sel" : ""}`}
                              onClick={() => setMoment(m.id)}
                              title={`${m.es} · ${m.hours}`}
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cuisine selector — only for food/both in restaurants_bars */}
                    {selectedCategory === "restaurants_bars" && mealType !== "drinks" && (
                      <div style={{ marginBottom:"0.5rem" }}>
                        <span className="chips-label">Cuisine</span>
                        <div className="cuisine-grid">
                          {[
                            { id:"any", label:"Any" },
                            { id:"Spanish tapas", label:"Spanish" },
                            { id:"Italian", label:"Italian" },
                            { id:"Japanese", label:"Japanese" },
                            { id:"Asian fusion", label:"Asian" },
                            { id:"Mexican", label:"Mexican" },
                            { id:"Mediterranean", label:"Mediterranean" },
                            { id:"Indian", label:"Indian" },
                            { id:"vegan and vegetarian", label:"Vegan" },
                            { id:"fast food", label:"Fast Food" },
                          ].map(c => (
                            <button type="button" key={c.id} className={`chip ${cuisine===c.id ? "sel" : ""}`} onClick={() => setCuisine(c.id)}>{c.label}</button>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedCategory === "clubs" && (
                      <div className="club-filter-panel" key="club-panel-crew">
                        <span className="chips-label" style={{ marginTop: "0.85rem" }}>Night details (required)</span>
                        <div className="club-filter-grid">
                          <div>
                            <span className="chips-label">Day</span>
                            <div className="chips-row">
                              {CLUB_DAY_OPTIONS.map((day) => (
                                <button
                                  type="button"
                                  key={day}
                                  className={`chip ${clubDay === day ? "sel" : ""}`}
                                  onClick={() => setClubDay(day)}
                                >
                                  {day[0].toUpperCase() + day.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="chips-label">Age</span>
                            <div className="chips-row">
                              {CLUB_AGE_OPTIONS.map((age) => (
                                <button
                                  type="button"
                                  key={age.id}
                                  className={`chip ${clubAge === age.id ? "sel" : ""}`}
                                  onClick={() => setClubAge(age.id)}
                                >
                                  {age.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {/* Cultural focus — only for museums */}
                    {selectedCategory === "museums" && (
                      <div style={{ marginBottom:"0.85rem", marginTop:"0.85rem" }}>
                        <span className="chips-label">Cultural focus</span>
                        <div className="chips-row">
                          {[
                            { id:"any", label:"Any" },
                            { id:"art", label:"Art" },
                            { id:"history", label:"History" },
                            { id:"architecture", label:"Architecture" },
                            { id:"contemporary", label:"Contemporary" },
                            { id:"science", label:"Science" },
                          ].map(f => (
                            <button type="button" key={f.id} className={`chip ${culturalFocus===f.id ? "sel" : ""}`} onClick={() => setCulturalFocus(f.id)}>{f.label}</button>
                          ))}
                        </div>
                      </div>
                    )}
                    <span className="chips-label" style={{ marginTop: "0.85rem" }}>Order results by</span>
                    <div className="chips-row">
                      {SORT_OPTIONS.map((option) => (
                        <button
                          type="button"
                          key={option.id}
                          className={`chip ${sortMode === option.id ? "sel" : ""}`}
                          onClick={() => setSortMode(option.id)}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <div style={{ marginTop: "1rem" }}>
                      <span className="chips-label">Pick a neighborhood</span>
                      <div className="chips-row">
                        {BARRIOS.map((b) => (
                          <button
                            type="button"
                            key={b.name}
                            className={`chip ${b.surprise ? "surprise" : ""} ${selectedBarrio?.name === b.name ? "sel" : ""}`}
                            onClick={() => setBarrio(selectedBarrio?.name === b.name ? null : b)}
                          >
                            {b.name}
                          </button>
                        ))}
                      </div>
                      <span className="chips-label" style={{ marginTop: "0.75rem" }}>Who&apos;s in your crew?</span>
                      <div className="roles-grid">
                        {CREW_ROLES.map((r) => (
                          <button
                            type="button"
                            key={r.id}
                            className={`role-chip ${selectedRoles.includes(r.id) ? "sel" : ""}`}
                            onClick={() => toggleRole(r.id)}
                          >
                            <span className="role-dot" />
                            <span className="role-name">{r.label}</span>
                            <span className="role-desc">{r.desc}</span>
                          </button>
                        ))}
                      </div>
                      <span className="chips-label" style={{ marginTop: "0.75rem" }}>How many are you?</span>
                      <div className="chips-row">
                        {[1, 2, 3, 4, 5, 6].map(n => (
                          <button type="button" key={n} className={`chip ${crewSize === n ? "sel" : ""}`} onClick={() => setCrewSize(n)}>
                            {n === 1 ? "Solo" : n === 6 ? "6+" : n}
                          </button>
                        ))}
                      </div>
                      <span className="chips-label" style={{ marginTop: "0.75rem" }}>How long do you have?</span>
                      <div className="chips-row">
                        {[{id:"any",label:"Any"},{id:"1",label:"1 hr"},{id:"2",label:"2 hrs"},{id:"3",label:"3 hrs"},{id:"allnight",label:"All night"}].map(d => (
                          <button type="button" key={d.id} className={`chip ${huntDuration===d.id ? "sel" : ""}`} onClick={() => setHuntDuration(d.id)}>{d.label}</button>
                        ))}
                      </div>
                      {/* Rivalry Mode toggle */}
                      <div style={{ marginTop:"0.75rem" }}>
                        <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", marginBottom:"0.45rem" }}>
                          <button type="button" onClick={() => setRivalryMode(r => !r)} style={{
                            width:36, height:20, borderRadius:10, border:"none", cursor:"pointer", padding:2,
                            background: rivalryMode ? "#8B2020" : "#d0c8b8", transition:"background 0.25s", flexShrink:0,
                            display:"flex", alignItems:"center",
                          }} aria-pressed={rivalryMode} aria-label="Rivalry mode">
                            <span style={{ width:16, height:16, borderRadius:"50%", background:"white", display:"block",
                              transform: rivalryMode ? "translateX(16px)" : "translateX(0)", transition:"transform 0.25s",
                              boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }} />
                          </button>
                          <span style={{ fontSize:"0.78rem", color:"#4a3820", fontWeight:500 }}>⚔️ Rivalry Mode</span>
                          <span style={{ fontSize:"0.72rem", color:"#8a7a5a" }}>— two vibes, one crew</span>
                        </div>
                        {rivalryMode && (
                          <div style={{ padding:"0.65rem 0.75rem", borderRadius:12, border:"1px solid rgba(139,32,32,0.2)", background:"rgba(139,32,32,0.04)", animation:"fadeUp 0.3s ease" }}>
                            <span className="chips-label">Person 2 picks:</span>
                            <div className="chips-row">
                              {CHEST_OPTIONS.filter(c => c.id !== "surprise").map(c => (
                                <button type="button" key={c.id} className={`chip ${rivalry2Category===c.id ? "sel" : ""}`}
                                  onClick={() => setRivalry2Category(c.id)}>
                                  {c.title}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="capitan-row">
                      <label className="input-label" style={{ marginBottom: 0 }}>Captain&apos;s orders</label>
                      <div style={{ display:"flex", gap:6, alignItems:"center" }}>
                        <button
                          type="button"
                          onClick={startVoice}
                          title={isListening ? "Stop listening" : "Speak your brief"}
                          style={{
                            width:34, height:34, borderRadius:"50%", border:"none", cursor:"pointer",
                            background: isListening ? "rgba(255,60,60,0.15)" : "rgba(15,39,71,0.08)",
                            color: isListening ? "#ff4444" : "#6b5c48",
                            fontSize:"1rem", display:"flex", alignItems:"center", justifyContent:"center",
                            animation: isListening ? "scanPulse 1.2s ease-out infinite" : "none",
                            transition:"all 0.2s",
                          }}
                        >🎙</button>
                        <button
                          type="button"
                          className={`capitan-plus ${captainExtrasOpen ? "open" : ""}`}
                          onClick={() => setCaptainExtrasOpen((o) => !o)}
                          aria-expanded={captainExtrasOpen}
                          aria-label={captainExtrasOpen ? "Hide crew and map options" : "Show crew and map options"}
                        >
                          {captainExtrasOpen ? "−" : "+"}
                        </button>
                      </div>
                    </div>
                    <p style={{ fontSize: "0.78rem", color: "#8a7a5a", marginBottom: "0.65rem", fontStyle: "italic", lineHeight: 1.45 }}>
                      {isListening ? "🔴 Listening… speak your orders" : "Speak freely — tap 🎙 to use voice, or use + for more options."}
                    </p>
                    <textarea
                      className="input-textarea"
                      value={captainPrompt}
                      onChange={(e) => setCaptainPrompt(e.target.value)}
                      placeholder="e.g. Friday night, four of us, techno-adjacent, not tourist traps, budget medium…"
                      rows={4}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && e.ctrlKey) startHunt();
                      }}
                    />
                    {selectedCategory === "clubs" && (
                      <div className="club-filter-panel" key="club-panel-capitan">
                        <span className="chips-label" style={{ marginTop: "0.85rem" }}>Night details (required)</span>
                        <div className="club-filter-grid">
                          <div>
                            <span className="chips-label">Day</span>
                            <div className="chips-row">
                              {CLUB_DAY_OPTIONS.map((day) => (
                                <button
                                  type="button"
                                  key={day}
                                  className={`chip ${clubDay === day ? "sel" : ""}`}
                                  onClick={() => setClubDay(day)}
                                >
                                  {day[0].toUpperCase() + day.slice(1)}
                                </button>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="chips-label">Age</span>
                            <div className="chips-row">
                              {CLUB_AGE_OPTIONS.map((age) => (
                                <button
                                  type="button"
                                  key={age.id}
                                  className={`chip ${clubAge === age.id ? "sel" : ""}`}
                                  onClick={() => setClubAge(age.id)}
                                >
                                  {age.label}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    {captainExtrasOpen && (
                      <div className="captain-extras">
                        <span className="chips-label">Refine the chart</span>
                        <span className="chips-label" style={{ marginTop: "0.5rem" }}>Order results by</span>
                        <div className="chips-row">
                          {SORT_OPTIONS.map((option) => (
                            <button
                              type="button"
                              key={option.id}
                              className={`chip ${sortMode === option.id ? "sel" : ""}`}
                              onClick={() => setSortMode(option.id)}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                        <span className="chips-label" style={{ marginTop: "0.75rem" }}>Pick a neighborhood</span>
                        <div className="chips-row">
                          {BARRIOS.map((b) => (
                            <button
                              type="button"
                              key={b.name}
                              className={`chip ${b.surprise ? "surprise" : ""} ${selectedBarrio?.name === b.name ? "sel" : ""}`}
                              onClick={() => setBarrio(selectedBarrio?.name === b.name ? null : b)}
                            >
                              {b.name}
                            </button>
                          ))}
                        </div>
                        <span className="chips-label" style={{ marginTop: "0.75rem" }}>Who&apos;s in your crew?</span>
                        <div className="roles-grid">
                          {CREW_ROLES.map((r) => (
                            <button
                              type="button"
                              key={r.id}
                              className={`role-chip ${selectedRoles.includes(r.id) ? "sel" : ""}`}
                              onClick={() => toggleRole(r.id)}
                            >
                              <span className="role-dot" />
                              <span className="role-name">{r.label}</span>
                              <span className="role-desc">{r.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Quiet mode toggle */}
                <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", margin:"0.75rem 0 0.5rem", padding:"0.55rem 0.85rem", borderRadius:12, background:"rgba(15,39,71,0.04)", border:"1px solid rgba(15,39,71,0.08)" }}>
                  <button
                    type="button"
                    onClick={() => setQuietMode(q => !q)}
                    style={{
                      width:36, height:20, borderRadius:10, border:"none", cursor:"pointer", padding:2,
                      background: quietMode ? "#0F2747" : "#d0c8b8", transition:"background 0.25s", flexShrink:0,
                      display:"flex", alignItems:"center",
                    }}
                    aria-pressed={quietMode}
                    aria-label="Avoid crowds"
                  >
                    <span style={{
                      width:16, height:16, borderRadius:"50%", background:"white", display:"block",
                      transform: quietMode ? "translateX(16px)" : "translateX(0)",
                      transition:"transform 0.25s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)",
                    }}/>
                  </button>
                  <span style={{ fontSize:"0.78rem", color:"#4a3820", fontWeight:500 }}>Avoid crowds</span>
                  <span style={{ fontSize:"0.72rem", color:"#8a7a5a", marginLeft:2 }}>— prefer places with &lt;150 reviews</span>
                </div>

                {/* Open Now toggle */}
                <div style={{ display:"flex", alignItems:"center", gap:"0.6rem", margin:"0.5rem 0 0.5rem", padding:"0.55rem 0.85rem", borderRadius:12, background:"rgba(81,207,102,0.04)", border:"1px solid rgba(81,207,102,0.12)" }}>
                  <button
                    type="button"
                    onClick={() => setOpenNowOnly(o => !o)}
                    style={{
                      width:36, height:20, borderRadius:10, border:"none", cursor:"pointer", padding:2,
                      background: openNowOnly ? "#51cf66" : "#d0c8b8", transition:"background 0.25s", flexShrink:0,
                      display:"flex", alignItems:"center",
                    }}
                    aria-pressed={openNowOnly}
                    aria-label="Only open right now"
                  >
                    <span style={{
                      width:16, height:16, borderRadius:"50%", background:"white", display:"block",
                      transform: openNowOnly ? "translateX(16px)" : "translateX(0)",
                      transition:"transform 0.25s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)",
                    }}/>
                  </button>
                  <span style={{ fontSize:"0.78rem", color:"#4a3820", fontWeight:500 }}>Only open right now</span>
                  <span style={{ fontSize:"0.72rem", color:"#8a7a5a", marginLeft:2 }}>— live opening hours</span>
                </div>

                {/* Description preview (Crew mode) */}
                {briefInputTab === "crew" && (selectedRoles.length > 0 || selectedBarrio) && (
                  <div style={{ fontSize:"0.75rem", color:"#6b5c48", fontStyle:"italic", background:"rgba(212,169,106,0.07)", borderRadius:10, padding:"0.5rem 0.8rem", marginBottom:"0.4rem", border:"1px solid rgba(212,169,106,0.15)", lineHeight:1.5 }}>
                    Finding <strong>{selectedCategory === "restaurants_bars" ? "food & drink" : selectedCategory === "museums" ? "cultural spots" : selectedCategory === "clubs" ? "nightlife" : "hidden gems"}</strong>
                    {selectedBarrio ? ` in ${selectedBarrio.name}` : " across Madrid"}
                    {selectedRoles.length > 0 ? ` for ${selectedRoles.map(id => CREW_ROLES.find(r => r.id === id)?.label).filter(Boolean).join(", ")}` : ""}
                    {quietMode ? " · avoiding crowds" : ""}…
                  </div>
                )}

                {/* Vibe intensity selector */}
                <div style={{ display:"flex", alignItems:"center", gap:"0.5rem", margin:"0.75rem 0 0.5rem" }}>
                  <span style={{ fontSize:"0.72rem", color:"#6b5c48", fontWeight:500, flexShrink:0 }}>Exclusivity</span>
                  {[{id:"local",label:"Local",desc:"<1500 reviews"},{id:"hidden",label:"Hidden",desc:"<800 reviews"},{id:"popular",label:"Popular",desc:"Well-known spots"}].map(v => (
                    <button key={v.id} type="button" onClick={() => setVibeIntensity(v.id)} title={v.desc} style={{
                      flex:1, padding:"0.35rem 0", border:"1px solid", borderRadius:8, cursor:"pointer", fontSize:"0.7rem", fontWeight:600,
                      transition:"all 0.2s",
                      borderColor: vibeIntensity === v.id ? "#0F2747" : "rgba(15,39,71,0.15)",
                      background: vibeIntensity === v.id ? "#0F2747" : "transparent",
                      color: vibeIntensity === v.id ? "white" : "#6b5c48",
                    }}>{v.label}</button>
                  ))}
                </div>

                {/* Photo vibe match — Telescope */}
                <input ref={photoInputRef} type="file" accept="image/*" style={{ display:"none" }} onChange={handleVibeFromPhoto} />
                <button type="button" onClick={() => photoInputRef.current?.click()} style={{
                  width:"100%", marginBottom:"0.75rem", padding:"0.85rem 1rem", borderRadius:14,
                  border:"2px solid rgba(212,169,106,0.55)",
                  background:"linear-gradient(135deg, rgba(212,169,106,0.08) 0%, rgba(212,169,106,0.14) 100%)",
                  boxShadow:"0 0 18px rgba(212,169,106,0.12)",
                  cursor:"pointer", transition:"all 0.2s",
                  display:"flex", alignItems:"center", gap:10,
                }}>
                  <span style={{ fontSize:"1.6rem", flexShrink:0 }}>🔭</span>
                  <div style={{ textAlign:"left", flex:1 }}>
                    <div style={{ fontSize:"0.82rem", fontWeight:700, color:"#8B6914", letterSpacing:"0.03em" }}>Spy a Vibe Through the Telescope</div>
                    <div style={{ fontSize:"0.68rem", color:"rgba(139,105,20,0.65)", fontStyle:"italic", marginTop:2 }}>Upload a photo — the navigator reads its soul</div>
                  </div>
                  <span style={{ fontSize:"0.85rem", color:"rgba(139,105,20,0.5)", flexShrink:0 }}>→</span>
                </button>

                {/* Weather chip — server-reported Madrid conditions after a hunt.
                    Gives the user visual confirmation that the picks already
                    accounted for rain/cold/heat. */}
                {huntWeather && huntWeather.condition && huntWeather.condition !== "unknown" && (
                  <div style={{
                    display:"inline-flex", alignItems:"center", gap:8,
                    padding:"0.45rem 0.85rem",
                    marginBottom:"0.6rem",
                    borderRadius:999,
                    background:"rgba(15,39,71,0.06)",
                    border:"1px solid rgba(15,39,71,0.14)",
                    color:"#0F2747",
                    fontSize:"0.78rem",
                    fontWeight:500,
                    letterSpacing:"0.02em",
                  }}>
                    <span style={{ fontSize:"1rem" }}>
                      {huntWeather.is_rainy ? "☔"
                        : huntWeather.is_cold ? "🧣"
                        : huntWeather.is_hot ? "☀️"
                        : "⛅"}
                    </span>
                    <span>
                      Madrid · {huntWeather.condition}
                      {typeof huntWeather.temp_c === "number" && (
                        <> · <strong style={{ color:"#8B6914" }}>{huntWeather.temp_c}°</strong></>
                      )}
                    </span>
                    {(huntWeather.is_rainy || huntWeather.is_cold || huntWeather.is_hot) && (
                      <span style={{ color:"rgba(15,39,71,0.55)", fontStyle:"italic" }}>
                        ·&nbsp;
                        {huntWeather.is_rainy ? "terraces skipped"
                          : huntWeather.is_cold ? "warm interiors favored"
                          : "shaded spots favored"}
                      </span>
                    )}
                  </div>
                )}

                <button type="button" className="sail-btn-premium" onClick={() => startHunt()} disabled={!canSail}>
                  {getSailLabel()} <span style={{color:"#D4A96A",marginLeft:4}}>→</span>
                </button>

                {/* Take Me There Now */}
                <button type="button" onClick={() => {
                  navigator.geolocation?.getCurrentPosition(pos => {
                    setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
                  }, () => {});
                  const hour = new Date().getHours();
                  const cat = hour >= 22 || hour < 4 ? "clubs" : hour >= 18 ? "restaurants_bars" : "museums";
                  const descs = {
                    clubs: "A late-night adventure — take me somewhere extraordinary and unexpected right now, locals only",
                    restaurants_bars: "Take me somewhere amazing for food or drinks right now, hidden gem, locals only, no tourist traps",
                    museums: "Take me to a hidden cultural gem in Madrid right now, something special off the tourist trail",
                  };
                  setSelectedCategory(cat);
                  startHunt(descs[cat], null);
                }} style={{
                  width:"100%", marginTop:"0.5rem", padding:"0.7rem", borderRadius:12,
                  background:"rgba(212,169,106,0.08)", border:"1px solid rgba(212,169,106,0.25)",
                  color:"#8B6914", fontSize:"0.82rem", fontWeight:600, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:8,
                  transition:"all 0.2s", letterSpacing:"0.04em",
                }}>
                  ⚓ Take Me There Now — Use My Location
                </button>
                <p className="sail-tagline">Powered by Google Maps × Gemini AI · 3 real hidden gems</p>
                {error && <div className="err-box">⚠️ {error}</div>}
                </div>
              </div>

            </div>
          </section>

          <div className="hunt-back-row">
            <button type="button" className="hunt-back-btn" onClick={() => switchTab("home")}>
              ← Back to Home
            </button>
            <button type="button" className="hunt-back-btn hunt-back-btn--muted" onClick={() => switchTab("explore")}>
              Explore trending →
            </button>
          </div>
        </div>
      )}

      {/* ===== SURPRISE SCREEN ===== */}
      {screen === "surprise" && (
        <div style={{position:"relative",minHeight:"100vh"}}>
          <div style={{position:"fixed",inset:0,zIndex:0,background:"linear-gradient(180deg,#070d1a 0%,#0d1f3c 40%,#0a1628 100%)",pointerEvents:"none"}}>
            <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
              {Array.from({length:90},(_,i)=>(
                <circle key={i} cx={`${(Math.sin(i*137.5)*0.5+0.5)*100}%`} cy={`${(Math.cos(i*97.3)*0.5+0.5)*100}%`}
                  r={0.4+(i%4)*0.35} fill="white"
                  style={{animation:`starTwinkle ${1.8+(i%6)*0.4}s ${i*0.15}s ease-in-out infinite`}}/>
              ))}
            </svg>
          </div>
          <div style={{position:"relative",zIndex:1,maxWidth:900,margin:"0 auto",padding:"110px 2rem 4rem",textAlign:"center"}}>
            <MascotSVG size={110} animation="bounce" extraStyle={{margin:"0 auto 1rem"}}/>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(1.8rem,3.5vw,2.6rem)",color:"#F0DFA0",marginBottom:"0.4rem"}}>
              Choose Your Hunt, Captain
            </h2>
            <p style={{color:"rgba(240,223,160,0.5)",fontStyle:"italic",marginBottom:"2.5rem",fontSize:"0.95rem"}}>
              Pick a vibe — the navigator finds your treasure
            </p>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"1.25rem",marginBottom:"2.5rem"}}>
              {[
                {vibe:"wild",  icon:"🔥", title:"Wild Night Out",     sub:"Clubs, rooftops, hidden bars", desc:"A wild night out in Madrid with an energetic group, clubs, rooftops, and hidden bars locals actually go to"},
                {vibe:"romantic",icon:"🌹",title:"Romantic Evening",  sub:"Intimate, candlelit, unforgettable", desc:"A romantic evening for two, intimate hidden restaurants and bars with special atmosphere in Madrid, avoiding tourists"},
                {vibe:"foodie",icon:"🍽️",title:"Foodie Hunt",        sub:"Local tables, authentic flavours", desc:"A foodie hunt for the best hidden local restaurants and tapas bars that only locals know in Madrid"},
              ].map(({vibe,icon,title,sub,desc})=>(
                <div key={vibe} className="chest-card"
                  onClick={()=>startHunt(desc,null)}
                  style={{background:VIBE_THEMES[vibe].cardBg,border:`2px solid ${VIBE_THEMES[vibe].cardBorder}`}}>
                  <svg width="68" height="58" viewBox="0 0 68 58" className="chest-lid" style={{display:"block",margin:"0 auto 1rem"}}>
                    <rect x="6" y="30" width="56" height="24" rx="5" fill="#3A1F08"/>
                    <path d="M6,30 Q34,18 62,30 L62,36 Q34,24 6,36 Z" fill="#4A2A0A"/>
                    <rect x="6" y="30" width="56" height="3" rx="1.5" fill="#C8A84B"/>
                    <rect x="6" y="50" width="56" height="3" rx="1.5" fill="#C8A84B" opacity="0.7"/>
                    <rect x="6" y="38" width="56" height="4" rx="2" fill="#C8A84B"/>
                    <rect x="31" y="28" width="6" height="5" rx="1.5" fill="#C8A84B"/>
                    <path d="M33,28 Q33,23 34,23 Q35,23 35,28" stroke="#C8A84B" strokeWidth="1.8" fill="none"/>
                    <ellipse cx="50" cy="52" rx="20" ry="4" fill="#F0C040" opacity="0.12"/>
                    <circle cx="22" cy="36" r="5" fill="white"/>
                    <circle cx="46" cy="36" r="5" fill="white"/>
                    <circle cx="22.8" cy="36" r="2.8" fill="#1a1a2e"/>
                    <circle cx="46.8" cy="36" r="2.8" fill="#1a1a2e"/>
                    <circle cx="23.8" cy="34.8" r="1" fill="white"/>
                    <circle cx="47.8" cy="34.8" r="1" fill="white"/>
                  </svg>
                  <div style={{fontFamily:"'Playfair Display',serif",fontSize:"1.05rem",color:VIBE_THEMES[vibe].textPrimary,marginBottom:"0.35rem",fontWeight:600}}>{icon} {title}</div>
                  <div style={{fontSize:"0.76rem",color:VIBE_THEMES[vibe].textMuted,fontStyle:"italic"}}>{sub}</div>
                </div>
              ))}
            </div>
            <button onClick={()=>setScreen("brief")} style={{background:"transparent",border:"1px solid rgba(240,223,160,0.2)",color:"rgba(240,223,160,0.45)",borderRadius:40,padding:"0.65rem 1.8rem",cursor:"pointer",fontSize:"0.85rem",transition:"all 0.2s",fontFamily:"'DM Sans',sans-serif"}}>
              ← Back to Search
            </button>
          </div>
        </div>
      )}

      {/* ===== HUNTING SCREEN ===== */}
      {screen === "hunting" && (
        <div style={{position:"relative",...revealPageStyle}}>
          <div style={{position:"fixed",inset:0,zIndex:0,background:"linear-gradient(180deg,#070d1a 0%,#0d1f3c 45%,#0a1628 100%)",pointerEvents:"none"}}>
            <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
              {Array.from({length:90},(_,i)=>(
                <circle key={i} cx={`${(Math.sin(i*137.5)*0.5+0.5)*100}%`} cy={`${(Math.cos(i*97.3)*0.5+0.5)*75}%`}
                  r={0.4+(i%4)*0.35} fill="white"
                  style={{animation:`starTwinkle ${2+(i%5)*0.5}s ${i*0.12}s ease-in-out infinite`}}/>
              ))}
            </svg>
          </div>
          <div className="hunting-wrap">
            {/* Ship's wheel */}
            <div style={{ position:"relative", flexShrink:0 }}>
              {/* Outer glow ring */}
              <div style={{ position:"absolute", inset:-12, borderRadius:"50%", background:"radial-gradient(circle, rgba(212,169,106,0.12) 0%, transparent 70%)", animation:"radarPing 3s ease-in-out infinite" }}/>
              <svg width="190" height="190" viewBox="0 0 190 190"
                style={{ display:"block", animation:"radarSpin 9s linear infinite", filter:"drop-shadow(0 0 18px rgba(212,169,106,0.35))" }}>
                {/* Rim */}
                <circle cx="95" cy="95" r="88" fill="rgba(139,105,20,0.12)" stroke="#C8A84B" strokeWidth="10" strokeOpacity="0.9"/>
                <circle cx="95" cy="95" r="83" fill="none" stroke="rgba(212,169,106,0.25)" strokeWidth="1"/>
                {/* 8 spokes + knobs */}
                {[0,45,90,135,180,225,270,315].map(a => {
                  const rad = a * Math.PI / 180;
                  const x2 = 95 + 78 * Math.sin(rad);
                  const y2 = 95 - 78 * Math.cos(rad);
                  const kx = 95 + 88 * Math.sin(rad);
                  const ky = 95 - 88 * Math.cos(rad);
                  return (
                    <g key={a}>
                      <line x1="95" y1="95" x2={x2} y2={y2} stroke="#C8A84B" strokeWidth="8" strokeLinecap="round" strokeOpacity="0.85"/>
                      <circle cx={kx} cy={ky} r="9" fill="#C8A84B" stroke="#6a4010" strokeWidth="2.5" opacity="0.9"/>
                    </g>
                  );
                })}
                {/* Hub outer */}
                <circle cx="95" cy="95" r="28" fill="#C8A84B"/>
                <circle cx="95" cy="95" r="22" fill="#6a4010"/>
                <circle cx="95" cy="95" r="18" fill="#4a2a08"/>
                {/* Anchor in hub */}
                <text x="95" y="99" textAnchor="middle" fill="rgba(212,169,106,0.8)" fontSize="16" fontFamily="serif">⚓</text>
              </svg>
            </div>

            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(1.4rem,3vw,1.9rem)",color:"#F0DFA0",textAlign:"center",marginBottom:"0.2rem"}}>
              Scanning the Seas of Madrid…
            </h2>
            <p style={{color:"rgba(240,223,160,0.45)",fontStyle:"italic",textAlign:"center",marginBottom:"1rem",fontSize:"0.85rem"}}>
              The navigator is charting your course
            </p>

            {/* Rotating Madrid facts — parchment scroll style */}
            <div key={huntFactIdx} style={{
              maxWidth:340, margin:"0 auto 1.25rem", padding:"0.9rem 1.2rem 0.85rem",
              borderRadius:4,
              background:"linear-gradient(135deg, #2a1f0e 0%, #1e1608 100%)",
              border:"1px solid rgba(212,169,106,0.3)",
              borderLeft:"4px solid #C8A84B",
              boxShadow:"0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(212,169,106,0.1)",
              animation:"factFade 3.8s ease forwards",
              position:"relative",
            }}>
              <div style={{ position:"absolute", top:8, right:10, fontSize:"0.58rem", color:"rgba(212,169,106,0.35)", fontWeight:700, letterSpacing:"0.12em", textTransform:"uppercase" }}>
                Port Gossip
              </div>
              <div style={{ display:"flex", alignItems:"flex-start", gap:"0.65rem" }}>
                <span style={{ fontSize:"1.3rem", flexShrink:0, marginTop:1 }}>{MADRID_FACTS[huntFactIdx].icon}</span>
                <p style={{ fontSize:"0.8rem", color:"rgba(240,223,160,0.8)", lineHeight:1.6, fontStyle:"italic", fontFamily:"'Crimson Text',serif", margin:0 }}>
                  {MADRID_FACTS[huntFactIdx].text}
                </p>
              </div>
              {/* Dot indicator */}
              <div style={{ display:"flex", justifyContent:"center", gap:4, marginTop:"0.6rem" }}>
                {MADRID_FACTS.map((_, i) => (
                  <div key={i} style={{ width:4, height:4, borderRadius:"50%", background: i === huntFactIdx ? "#C8A84B" : "rgba(212,169,106,0.2)", transition:"background 0.3s" }}/>
                ))}
              </div>
            </div>

            {/* Step checklist */}
            <div style={{display:"flex",flexDirection:"column",gap:"0.55rem",maxWidth:340,margin:"0 auto 1.5rem"}}>
              {HUNT_STAGES.map((stage, i) => {
                const done = huntStage > i;
                const active = huntStage === i;
                return (
                  <div key={i} style={{
                    display:"flex", alignItems:"center", gap:"0.85rem",
                    padding:"0.6rem 1rem", borderRadius:12,
                    background: done ? "rgba(212,169,106,0.12)" : active ? "rgba(212,169,106,0.07)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${done ? "rgba(212,169,106,0.3)" : active ? "rgba(212,169,106,0.18)" : "rgba(255,255,255,0.05)"}`,
                    opacity: huntStage < i ? 0.35 : 1,
                    transition:"all 0.4s ease",
                    animation: active ? "stageSlide 0.4s ease" : "none",
                  }}>
                    <div style={{
                      width:28, height:28, borderRadius:"50%", flexShrink:0,
                      display:"flex", alignItems:"center", justifyContent:"center",
                      background: done ? "#D4A96A" : active ? "rgba(212,169,106,0.2)" : "rgba(255,255,255,0.05)",
                      border: `1.5px solid ${done ? "#D4A96A" : "rgba(212,169,106,0.25)"}`,
                      fontSize:"0.85rem",
                      transition:"all 0.3s ease",
                      animation: done ? "checkPop 0.35s cubic-bezier(0.34,1.56,0.64,1)" : "none",
                    }}>
                      {done ? "✓" : active ? <span style={{animation:"compassSpin 1.5s linear infinite",display:"block"}}>⟳</span> : stage.icon}
                    </div>
                    <span style={{
                      fontFamily:"'Crimson Text',serif", fontStyle:"italic",
                      color: done ? "rgba(240,223,160,0.9)" : active ? "rgba(240,223,160,0.75)" : "rgba(240,223,160,0.4)",
                      fontSize:"0.95rem", lineHeight:1.3,
                      transition:"color 0.3s ease",
                    }}>{stage.text}</span>
                  </div>
                );
              })}
            </div>
            {/* Back button — lets user abort and fix their brief */}
            <div style={{ textAlign:"center" }}>
              <button type="button" onClick={() => { huntAbortRef.current?.abort(); setScreen("brief"); }} style={{
                background:"transparent", border:"1px solid rgba(240,223,160,0.2)",
                color:"rgba(240,223,160,0.4)", borderRadius:40, padding:"0.5rem 1.6rem",
                cursor:"pointer", fontSize:"0.78rem", fontFamily:"'DM Sans',sans-serif",
                letterSpacing:"0.04em", transition:"all 0.2s",
              }}>
                ← Back to search
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== REVEAL ANIMATION OVERLAY ===== */}
      {showRevealAnim && <RevealAnimation onDone={() => { setShowRevealAnim(false); setScreen("reveal"); }} />}

      {/* ===== REVEAL SCREEN ===== */}
      {screen === "reveal" && bounties.length > 0 && (
        <div style={{ position:"relative", ...revealPageStyle }}>
          {/* Dynamic sky */}
          {theme && <SkyBackground vibe={currentVibe}/>}

          <div className="reveal-wrap">
            {/* Vibe badge + title */}
            <div style={{ textAlign:"center", marginBottom:"2rem" }}>
              {theme && (
                <div style={{
                  display:"inline-flex", alignItems:"center", gap:8,
                  background:"rgba(255,255,255,0.1)", backdropFilter:"blur(8px)",
                  border:`1px solid ${theme.accentColor}40`,
                  borderRadius:40, padding:"0.4rem 1.2rem", marginBottom:"0.75rem",
                  fontSize:"0.78rem", letterSpacing:"0.1em", color:theme.accentColor,
                  textTransform:"uppercase",
                }}>
                  {theme.icon} {theme.label}
                </div>
              )}
              <h1 className="reveal-title" style={{ color: theme?.textPrimary || "white" }}>
                {bounties.length === 1 ? "The Treasure Found" : bounties.length === 2 ? "Two Coves Await" : "Three Treasures Found"}
              </h1>
              {preferences && (
                <div className="crew-banner" style={{
                  color: theme?.goldColor || "#D4A96A",
                  background: `${theme?.accentColor || "#D4A96A"}15`,
                  border: `1px solid ${theme?.accentColor || "#D4A96A"}30`,
                }}>
                  🧭 {preferences.group_size||"your"} crew · {preferences.vibe} vibes · {preferences.budget}
                  {selectedBarrio&&` · ${selectedBarrio.name}`}
                </div>
              )}
              {theme && (
                <p style={{ marginTop:"0.5rem", fontSize:"0.85rem", fontStyle:"italic", opacity:0.5, color:theme.textPrimary }}>
                  {theme.tagline}
                </p>
              )}
              {/* Weather badge */}
              {weather && (() => {
                const c = weather.weathercode ?? weather.weather_code ?? 0;
                const temp = weather.temperature ?? weather.temperature_2m ?? 0;
                const icon = c === 0 ? "☀️" : c <= 3 ? "⛅" : c <= 48 ? "🌫️" : c <= 67 ? "🌧️" : c <= 77 ? "❄️" : c <= 82 ? "🌦️" : "⛈️";
                const desc = c === 0 ? "Clear skies" : c <= 3 ? "Partly cloudy" : c <= 48 ? "Foggy" : c <= 67 ? "Rainy" : c <= 77 ? "Snowing" : c <= 82 ? "Showers" : "Stormy";
                return (
                  <div style={{
                    display:"inline-flex", alignItems:"center", gap:7,
                    background:"rgba(255,255,255,0.12)", backdropFilter:"blur(8px)",
                    border:`1px solid ${theme?.cardBorder || "rgba(255,255,255,0.2)"}`,
                    borderRadius:30, padding:"0.3rem 0.9rem", marginTop:"0.6rem",
                    fontSize:"0.8rem", color: theme?.textPrimary || "white",
                  }}>
                    <span>{icon}</span>
                    <span style={{ fontWeight:500 }}>Madrid · {desc}</span>
                    <span style={{ opacity:0.55 }}>·</span>
                    <span style={{ color: theme?.goldColor || "#D4A96A", fontWeight:600 }}>{Math.round(temp)}°C</span>
                  </div>
                );
              })()}
              {/* Cost estimate — woven into the info row below tagline */}
              {preferences && bounties.length > 0 && (() => {
                const avgLevel = Math.round(bounties.reduce((s, b) => s + (b.price_level || 2), 0) / bounties.length);
                const ranges = { 1:[5,10], 2:[12,22], 3:[25,45], 4:[45,80] };
                const [lo, hi] = ranges[avgLevel] || [12,22];
                const group = preferences.group_size || crewSize || 2;
                return (
                  <p style={{
                    marginTop:"0.5rem", fontSize:"0.8rem", fontStyle:"italic",
                    color: theme?.textMuted || "rgba(255,255,255,0.45)",
                  }}>
                    ~€{lo}–{hi} per head · €{lo * group}–{hi * group} for {group === 1 ? "one" : group}
                  </p>
                );
              })()}
            </div>

            {/* Treasure map */}
            <div className="map-frame-outer map-frame-inner-corners" style={{ marginBottom: routeInfo ? "0.75rem" : "2rem" }}>
              <div className="map-wrap wide">
                <RealMap bounties={bounties} theme={theme} center={bounties[0] ? {lat:bounties[0].lat, lng:bounties[0].lng} : null} onRouteInfo={setRouteInfo} />
              </div>
            </div>
            {/* Walking route info */}
            {routeInfo && (
              <div style={{
                display:"flex", alignItems:"center", justifyContent:"center", gap:"0.5rem",
                marginBottom:"1.5rem", padding:"0.5rem 1.2rem",
                background:"rgba(212,169,106,0.1)", borderRadius:30,
                border:"1px solid rgba(212,169,106,0.22)", width:"fit-content", margin:"0 auto 1.5rem",
                fontSize:"0.82rem", color: theme?.goldColor || "#D4A96A", fontWeight:500,
              }}>
                <span>🚶</span>
                <span>{routeInfo.mins} min walk</span>
                <span style={{opacity:0.4}}>·</span>
                <span>{routeInfo.km} km total route</span>
              </div>
            )}

            {/* Vibe meter */}
            <div style={{ color: theme?.textPrimary || "white" }}>
              <VibeMeter preferences={preferences}/>
            </div>


            {/* Route optimizer */}
            <div style={{ color: theme?.textPrimary || "white" }}>
              <RouteOptimizer bounties={bounties} theme={theme}/>
            </div>

            {/* Navigator's Tip — weather-matched drink suggestion */}
            {huntWeather && huntWeather.condition && huntWeather.condition !== "unknown" && (() => {
              const tip = huntWeather.is_rainy
                ? { drink: "vermut caliente", emoji: "🍷", text: "Rain's in — perfect excuse to stay inside with a warm vermut. Ask for it caliente." }
                : huntWeather.is_cold
                ? { drink: "chocolate con churros", emoji: "☕", text: "Cold night calls for chocolate con churros before the main event. Captain's orders." }
                : huntWeather.is_hot
                ? { drink: "clara con limón", emoji: "🍺", text: "Heat like this? Order a cold clara con limón. Half beer, half lemon — Madrid's cure for summer." }
                : { drink: "caña y tapa", emoji: "🍺", text: "Perfect evening for a caña and a tapa at the bar. Start slow, finish strong." };
              return (
                <div style={{
                  display:"flex", alignItems:"center", gap:12, marginBottom:"1.25rem",
                  padding:"0.75rem 1rem", borderRadius:14,
                  background:"rgba(212,169,106,0.07)",
                  border:"1px solid rgba(212,169,106,0.22)",
                }}>
                  <span style={{ fontSize:"1.6rem", flexShrink:0 }}>{tip.emoji}</span>
                  <div>
                    <div style={{ fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.12em", color:"rgba(212,169,106,0.5)", textTransform:"uppercase", marginBottom:3 }}>Navigator's Tip</div>
                    <div style={{ fontSize:"0.82rem", color: theme?.textPrimary || "rgba(255,255,255,0.85)", lineHeight:1.4 }}>
                      {tip.text}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Scroll cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem", marginBottom:"2rem" }}>
              {bounties.map((b,i)=>(
                <ScrollCard key={b.place_id} bounty={b} index={i}
                  visible={visibleCards.includes(i)} onSwap={swapBounty}
                  swapping={swappingId===b.place_id} theme={theme} vibe={currentVibe}
                  onFavorite={user ? handleFavorite : null}
                  isFavorited={favoritedIds.has(b.place_id)}
                  onAddToPlan={user ? openAddToPlan : null}
                  onVote={crewShareId ? broadcastVote : null}
                  crewVotes={crewVotes}
                  myVote={myVotes[b.place_id] || null}
                />
              ))}
            </div>

            {error && <div className="err-box" style={{marginBottom:"1rem"}}>⚠️ {error}</div>}

            {/* Undo last swap */}
            {swapHistory.length > 0 && (
              <div style={{ textAlign:"center", marginBottom:"0.75rem" }}>
                <button onClick={undoLastSwap} style={{
                  background:"rgba(212,169,106,0.1)", border:"1px solid rgba(212,169,106,0.3)",
                  color: theme?.goldColor || "#D4A96A", borderRadius:30, padding:"0.45rem 1.2rem",
                  fontSize:"0.78rem", cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
                  transition:"all 0.2s",
                }}>
                  ↩ Undo last swap — bring back {swapHistory[0].bounty.pirate_name}
                </button>
              </div>
            )}

            {/* Bottom actions — two rows */}
            <div style={{ marginBottom:"2rem" }}>
              {/* Row 1: core actions */}
              <div style={{ display:"flex", gap:"0.6rem", justifyContent:"center", marginBottom:"0.75rem", flexWrap:"wrap" }}>
                <button onClick={reset} style={{
                  padding:"0.7rem 1.4rem", borderRadius:40, fontSize:"0.82rem", fontWeight:600,
                  background:"rgba(255,255,255,0.08)", color: theme?.textPrimary||"white",
                  border:`1px solid ${theme?.cardBorder||"rgba(255,255,255,0.15)"}`,
                  cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s",
                }}>⚓ New Search</button>

                {bounties.length > 1 && (
                  <a href={buildMapsRouteUrl(bounties)} target="_blank" rel="noopener noreferrer" style={{
                    padding:"0.7rem 1.4rem", borderRadius:40, fontSize:"0.82rem", fontWeight:600,
                    background:"rgba(66,133,244,0.15)", color:"#8ab4f8",
                    border:"1px solid rgba(66,133,244,0.28)", textDecoration:"none",
                    display:"flex", alignItems:"center", gap:6, cursor:"pointer",
                    fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s",
                  }}>🗺 Navigate All Stops</a>
                )}

                {typeof window !== "undefined" && window.speechSynthesis && (
                  <button onClick={speakBounties} style={{
                    padding:"0.7rem 1.4rem", borderRadius:40, fontSize:"0.82rem", fontWeight:600,
                    background: speaking ? "rgba(255,80,60,0.15)" : "rgba(255,255,255,0.08)",
                    color: speaking ? "#ff9999" : (theme?.textPrimary||"white"),
                    border:`1px solid ${speaking ? "rgba(255,80,60,0.3)" : (theme?.cardBorder||"rgba(255,255,255,0.15)")}`,
                    cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s",
                  }}>{speaking ? "🔇 Stop" : "🎙 Captain Speaks"}</button>
                )}
              </div>

              {/* Row 2: share section */}
              <div style={{
                border:`1px solid ${theme?.goldColor ? `${theme.goldColor}30` : "rgba(212,169,106,0.22)"}`,
                borderRadius:16, padding:"0.85rem 1rem",
                background:`${theme?.goldColor ? `${theme.goldColor}07` : "rgba(212,169,106,0.04)"}`,
              }}>
                <div style={{ fontSize:"0.65rem", fontWeight:700, letterSpacing:"0.12em", color:"rgba(212,169,106,0.5)", textTransform:"uppercase", textAlign:"center", marginBottom:"0.6rem" }}>
                  Share your treasure
                </div>
                <div style={{ display:"flex", gap:"0.5rem", justifyContent:"center", flexWrap:"wrap" }}>
                  <button onClick={shareText} style={{
                    flex:1, minWidth:90, padding:"0.65rem 0.75rem", borderRadius:12, fontSize:"0.78rem", fontWeight:600,
                    background: theme?.numberBadgeBg || "#0F2747", color:"white",
                    border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s",
                    opacity: copied ? 0.75 : 1,
                  }}>{copied ? "✓ Copied" : "📋 Copy"}</button>

                  <button onClick={() => setShowShare(true)} style={{
                    flex:1, minWidth:90, padding:"0.65rem 0.75rem", borderRadius:12, fontSize:"0.78rem", fontWeight:600,
                    background: theme?.goldColor || "#D4A96A", color:"#0F2747",
                    border:"none", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s",
                  }}>🖼 Story Card</button>

                  <button onClick={copyCrewLink} style={{
                    flex:1, minWidth:90, padding:"0.65rem 0.75rem", borderRadius:12, fontSize:"0.78rem", fontWeight:600,
                    background: crewLinkCopied ? "rgba(81,207,102,0.2)" : "rgba(255,255,255,0.08)",
                    color: crewLinkCopied ? "#51cf66" : (theme?.textPrimary||"white"),
                    border:`1px solid ${crewLinkCopied ? "rgba(81,207,102,0.4)" : (theme?.cardBorder||"rgba(255,255,255,0.15)")}`,
                    cursor:"pointer", fontFamily:"'DM Sans',sans-serif", transition:"all 0.2s",
                  }}>{crewLinkCopied ? "✓ Link Copied!" : "🔗 Crew Link"}</button>
                </div>
                {crewShareId && (
                  <div style={{ textAlign:"center", marginTop:"0.45rem", fontSize:"0.65rem", color:"rgba(212,169,106,0.4)", fontStyle:"italic" }}>
                    Session #{crewShareId} · Friends click Crew Link to join &amp; vote live
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Floating Ask the Navigator button */}
          <div className="fab-ask-navigator" style={{ position:"fixed", bottom:"1.5rem", right:"1.5rem", zIndex:200 }}>
            <button onClick={() => { setNavigatorChat(true); if (!chatHistory.length) setChatHistory([]); }} style={{
              background: theme?.numberBadgeBg || "#0F2747", color:"white",
              border:"none", borderRadius:"50px", padding:"0.7rem 1.2rem",
              boxShadow:"0 8px 28px rgba(0,0,0,0.4)", cursor:"pointer",
              fontSize:"0.85rem", fontWeight:600, display:"flex", alignItems:"center", gap:6,
              transition:"all 0.2s",
            }}>🗺️ Ask the Navigator</button>
          </div>

          {/* Navigator Chat Modal */}
          {navigatorChat && (
            <div className="modal-sheet-root" style={{ position:"fixed", inset:0, zIndex:400, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)", display:"flex", alignItems:"flex-end", justifyContent:"flex-end", padding:"80px 1.5rem 1.5rem" }}
              onClick={() => setNavigatorChat(false)}>
              <div className="modal-sheet" style={{ background:"#0F2747", borderRadius:"20px", padding:"1.4rem", width:"100%", maxWidth:"380px", border:"1px solid rgba(212,169,106,0.25)", boxShadow:"0 20px 60px rgba(0,0,0,0.55)", maxHeight:"62vh", display:"flex", flexDirection:"column" }}
                onClick={e => e.stopPropagation()}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"0.85rem" }}>
                  <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", color:"#F7F4EE" }}>🗺️ The Navigator</span>
                  <button onClick={() => setNavigatorChat(false)} style={{ background:"transparent", border:"none", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:"1.3rem", lineHeight:1 }}>×</button>
                </div>
                <div style={{ flex:1, overflowY:"auto", display:"flex", flexDirection:"column", gap:"0.6rem", marginBottom:"0.75rem", minHeight:"80px" }}>
                  {chatHistory.length === 0 && (
                    <div style={{ fontSize:"0.82rem", color:"rgba(212,169,106,0.65)", fontStyle:"italic", textAlign:"center", padding:"1rem 0.5rem", lineHeight:1.5 }}>
                      Ask me anything about tonight's spots, Captain…
                    </div>
                  )}
                  {chatHistory.map((m, i) => (
                    <div key={i} style={{
                      padding:"0.55rem 0.8rem", borderRadius:12, fontSize:"0.82rem", lineHeight:1.5,
                      background: m.role === "user" ? "rgba(255,255,255,0.08)" : "rgba(212,169,106,0.12)",
                      color: m.role === "user" ? "rgba(255,255,255,0.85)" : "#D4A96A",
                      border:`1px solid ${m.role === "user" ? "rgba(255,255,255,0.1)" : "rgba(212,169,106,0.25)"}`,
                      alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                      maxWidth:"92%",
                    }}>{m.text}</div>
                  ))}
                  {chatLoading && <div style={{ fontSize:"0.75rem", color:"rgba(212,169,106,0.5)", fontStyle:"italic" }}>Navigator is thinking…</div>}
                </div>
                <div style={{ display:"flex", gap:"8px" }}>
                  <input
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) askNavigator(); }}
                    placeholder="Ask about tonight's picks…"
                    style={{ flex:1, background:"rgba(255,255,255,0.08)", border:"1px solid rgba(212,169,106,0.3)", borderRadius:10, padding:"0.5rem 0.8rem", color:"white", fontSize:"0.82rem", outline:"none" }}
                  />
                  <button onClick={askNavigator} disabled={chatLoading} style={{ background:"#D4A96A", color:"#0F2747", border:"none", borderRadius:10, padding:"0.5rem 0.85rem", cursor:"pointer", fontWeight:700, fontSize:"0.85rem" }}>⚓</button>
                </div>
              </div>
            </div>
          )}

          {/* Share card modal */}
          {showShare && (
            <ShareCard bounties={bounties} preferences={preferences} theme={theme} onClose={()=>setShowShare(false)}/>
          )}
        </div>
      )}
      {showProfile && <ProfilePanel user={user} onClose={() => setShowProfile(false)} />}
      {showPlans && <PlansPanel user={user} onClose={() => setShowPlans(false)} />}

      {/* Add to plan modal */}
      {showAddToPlan && (
        <div className="modal-sheet-root" style={{ position:"fixed", inset:0, zIndex:400, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}
          onClick={() => { setShowAddToPlan(false); setAddingBounty(null); }}>
          <div className="modal-sheet" style={{ background:"#0F2747", borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"380px", border:"1px solid rgba(212,169,106,0.2)", boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}
            onClick={e=>e.stopPropagation()}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", color:"#F7F4EE", marginBottom:"4px" }}>Add to Plan</div>
            <div style={{ fontSize:"13px", color:"rgba(212,169,106,0.6)", marginBottom:"20px" }}>"{addingBounty?.pirate_name || addingBounty?.name}"</div>
            {addMsg ? (
              <div style={{ textAlign:"center", padding:"16px", fontSize:"16px", color: addMsg.startsWith("✅") ? "#51cf66" : "#ff6b6b" }}>{addMsg}</div>
            ) : userPlans.length === 0 ? (
              <div style={{ textAlign:"center", padding:"20px 0" }}>
                <div style={{ color:"rgba(255,255,255,0.3)", fontSize:"14px", marginBottom:"12px" }}>No plans yet.</div>
                <button onClick={() => { setShowAddToPlan(false); setShowPlans(true); }} style={{ background:"#D4A96A", color:"#0F2747", border:"none", borderRadius:"20px", padding:"8px 20px", cursor:"pointer", fontWeight:700 }}>
                  Create a Plan ⚓
                </button>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                {userPlans.map(plan => (
                  <button key={plan.id} onClick={() => addBountyToPlan(plan)} style={{
                    background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.1)",
                    borderRadius:"10px", padding:"12px 16px", cursor:"pointer", color:"#F7F4EE",
                    textAlign:"left", fontSize:"14px", fontFamily:"'Playfair Display',serif",
                    transition:"all 0.15s",
                  }}
                    onMouseEnter={e=>e.currentTarget.style.background="rgba(212,169,106,0.12)"}
                    onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.06)"}>
                    📋 {plan.name}
                  </button>
                ))}
              </div>
            )}
            <button onClick={() => { setShowAddToPlan(false); setAddingBounty(null); }} style={{ width:"100%", marginTop:"16px", padding:"10px", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.1)", background:"transparent", color:"rgba(255,255,255,0.4)", cursor:"pointer", fontSize:"14px" }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <MobileBottomNav
        tab={tab}
        screen={screen}
        showPlans={showPlans}
        showProfile={showProfile}
        onHome={() => switchTab("home")}
        onExplore={() => switchTab("explore")}
        onOpenPlans={() => setShowPlans(true)}
        onOpenProfile={() => setShowProfile(true)}
      />
    </>
  );
}
