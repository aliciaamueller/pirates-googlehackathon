import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

// ─── Constants & Styles ───────────────────────────────────────────
import {
  BARRIOS, CREW_ROLES, CHEST_OPTIONS, SORT_OPTIONS,
  CLUB_DAY_OPTIONS, CLUB_AGE_OPTIONS, HUNT_STAGES,
  MADRID_CENTER, VIBE_THEMES, ROUTES_DATA,
} from "./constants";
import { BASE_CSS } from "./styles";

// ─── Components ───────────────────────────────────────────────────
import { RealMap } from "./components/MapComponents";
import {
  MascotSVG, TreasureChestMascot,
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
import { ProfilePanel } from "./components/ProfilePanel";
import { PlansPanel, formatPlanDateTime } from "./components/PlansPanel";

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

/** Crew mode: no free-text box — we synthesize a clear brief for the API from chips + chest */
function buildCrewBrief({ categoryId, barrio, roleLabels, sortMode, clubDay, clubAge, crewSize }) {
  const chest = CHEST_OPTIONS.find((c) => c.id === categoryId);
  const chestLine = chest
    ? `Voyage: ${chest.title} — ${chest.subtitle}.`
    : `Voyage category: ${categoryId}.`;
  const parts = [chestLine];
  if (crewSize) parts.push(crewSize === 1 ? "Solo traveller — just one person." : `Group of ${crewSize} people.`);
  if (barrio?.name) parts.push(`Area focus: ${barrio.name}.`);
  if (roleLabels.length) parts.push(`Crew archetypes: ${roleLabels.join(", ")}.`);
  const sortLabel = SORT_OPTIONS.find((s) => s.id === sortMode)?.label || sortMode;
  parts.push(`Prefer results ranked by: ${sortLabel}.`);
  if (categoryId === "clubs" && clubDay && clubAge) {
    const ageLabel = CLUB_AGE_OPTIONS.find((a) => a.id === clubAge)?.label || clubAge;
    parts.push(`Club context: ${clubDay}, age band ${ageLabel}.`);
  }
  parts.push("Find three exceptional hidden-gem places in Madrid that fit this brief.");
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

  const currentVibe = preferences?.vibe || null;
  const theme = currentVibe ? VIBE_THEMES[currentVibe] : null;


  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

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
    window.scrollTo({ top: 0, behavior: "smooth" });

    // Advance hunt stages on a timer while API call runs
    const stageTimers = [1800, 3600, 5400, 7200].map((delay, i) =>
      setTimeout(() => setHuntStage(i + 1), delay)
    );

    const coords = barrio && !barrio.surprise ? { lat: barrio.lat, lng: barrio.lng } : location || MADRID_CENTER;
    const fullDesc = String(rawDesc).trim();
    try {
      const res = await fetch(`${API}/api/hunt`, {
        method: "POST", headers: { "Content-Type": "application/json" },
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

  function reset() {
    setScreen("brief"); setBounties([]); setPrefs(null);
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
  }, [screen]);

  useEffect(() => {
    if (screen === "reveal" && bounties.length > 0) {
      setVisible([]);
      setTimeout(() => bounties.forEach((_, i) => setTimeout(() => setVisible(p => [...p, i]), i * 500)), 100);
    }
  }, [screen, bounties]);

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
  if (!user) return <AuthScreen onLogin={setUser} />;
  return (

    <>
      <style>{BASE_CSS}</style>

      {/* Navbar always on top */}
      <nav className="navbar">
        <div className="nav-brand" onClick={reset}>
          <svg width="38" height="38" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="#0F2747" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.4"/>
            <circle cx="20" cy="20" r="4" fill="#D4A96A"/>
            <polygon points="20,2 22.5,17 20,20 17.5,17" fill="#0F2747"/>
            <polygon points="20,38 22.5,23 20,20 17.5,23" fill="#0F2747" opacity="0.4"/>
            <polygon points="2,20 17,17.5 20,20 17,22.5" fill="#0F2747" opacity="0.4"/>
            <polygon points="38,20 23,17.5 20,20 23,22.5" fill="#0F2747"/>
            <circle cx="20" cy="20" r="1.8" fill="#F7F4EE"/>
          </svg>
          <div style={{ display:"flex", flexDirection:"column", lineHeight:1 }}>
            <span className="nav-title">RUMBO</span>
            <span className="nav-sub">✦ AI Pirate Navigator ✦</span>
          </div>
        </div>
        <ul className="nav-links">
          <li><a href="#how">How It Works</a></li>
          <li><a href="#routes">Treasure Routes</a></li>
          <li><a href="#" onClick={e=>{e.preventDefault();reset();}}>Start Fresh</a></li>
        </ul>
        <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
          <button onClick={() => setShowPlans(true)} style={{ display:"flex", alignItems:"center", gap:"6px", background:"rgba(15,39,71,0.08)", border:"1px solid rgba(15,39,71,0.15)", borderRadius:"40px", padding:"0.5rem 1rem", cursor:"pointer", fontSize:"0.82rem", color:"#4a3820", fontWeight:500 }}>
            🗺️ Plans
          </button>
          <button onClick={() => setShowProfile(true)} style={{ display:"flex", alignItems:"center", gap:"6px", background:"rgba(15,39,71,0.08)", border:"1px solid rgba(15,39,71,0.15)", borderRadius:"40px", padding:"0.5rem 1rem", cursor:"pointer", fontSize:"0.82rem", color:"#4a3820", fontWeight:500 }}>
            🏴‍☠️ {user?.email?.split("@")[0] || "Profile"}
          </button>
          <button className="nav-cta" onClick={reset}>Set Sail <span style={{color:"#D4A96A"}}>→</span></button>
        </div>
      </nav>

      {/* ===== BRIEF SCREEN ===== */}
      {screen === "brief" && (
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
                    <span className="chest-deck-label">Choose your course</span>
                    <p className="chest-deck-tagline">Three holds, three voyages — tap the chest that matches your crew.</p>
                    <div className="chest-picker-grid chest-picker-mascot">
                      {CHEST_OPTIONS.map((chest, i) => (
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
                  </div>
                  <div className="chest-scene-footer">
                    <p className="chest-scene-quote">&ldquo;Aye, I know every hidden gem&hellip;&rdquo;</p>
                    <div className="chest-scene-brand">Hidden Gems of Madrid</div>
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
                    Capitan
                  </button>
                </div>

                {briefInputTab === "crew" ? (
                  <>
                    <p style={{ fontSize: "0.8rem", color: "#6b5c48", marginBottom: "0.85rem", lineHeight: 1.5 }}>
                      <em>Crew</em> mode builds your orders from the chest, neighborhood, crew roles, and sort — no typing required. Switch to <strong>Capitan</strong> for a free-form brief.
                    </p>
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
                  {[{id:"local",label:"Local",desc:"<1500 reviews"},{id:"hidden",label:"Hidden",desc:"<800 reviews"},{id:"secret",label:"Secret",desc:"<250 reviews"}].map(v => (
                    <button key={v.id} type="button" onClick={() => setVibeIntensity(v.id)} title={v.desc} style={{
                      flex:1, padding:"0.35rem 0", border:"1px solid", borderRadius:8, cursor:"pointer", fontSize:"0.7rem", fontWeight:600,
                      transition:"all 0.2s",
                      borderColor: vibeIntensity === v.id ? "#0F2747" : "rgba(15,39,71,0.15)",
                      background: vibeIntensity === v.id ? "#0F2747" : "transparent",
                      color: vibeIntensity === v.id ? "white" : "#6b5c48",
                    }}>{v.label}</button>
                  ))}
                </div>

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
                <p className="sail-tagline">3 hidden gems · Pirate-voiced picks · Google Maps links</p>
                {error && <div className="err-box">⚠️ {error}</div>}
                </div>
              </div>

              <div className="features-bar features-bar-brief fu fu4">
                {[
                  ["◆", "3 hidden gems"],
                  ["◆", "Pirate-voiced picks"],
                  ["◆", "Google Maps ready"],
                  ["◆", "AI navigator"],
                ].map(([i, t]) => (
                  <div key={t} className="feat">
                    <span className="feat-glyph">{i}</span>
                    <span>{t}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="how-section" id="how">
            <div className="how-inner">
              <h2 className="sec-headline">How RUMBO Works</h2>
              <p className="sec-sub">Discover hidden places in Madrid in under a minute.</p>
              <div className="how-cards">
                {[
                  {icon:"◆",title:"Pick Your Chest & Crew",text:"Choose a treasure chest for food, culture, or nightlife, then tune neighborhood, crew roles, and how results are ranked."},
                  {icon:"◆",title:"AI Hunts Hidden Gems",text:"Our pirate navigator searches beyond tourist traps to find places locals actually love."},
                  {icon:"◆",title:"Claim Your Bounty",text:"Choose your favourite spot and open it in Google Maps. Swap any result you don't love."},
                ].map(c=>(
                  <div key={c.title} className="how-card">
                    <span className="how-icon">{c.icon}</span>
                    <div className="how-title">{c.title}</div>
                    <p className="how-text">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <hr className="divider"/>

          <section className="routes-section" id="routes">
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:"2.5rem" }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(212,169,106,0.1)", border:"1px solid rgba(212,169,106,0.25)", borderRadius:40, padding:"0.3rem 1rem", marginBottom:"0.85rem", fontSize:"0.7rem", letterSpacing:"0.12em", color:"#8B6914", fontWeight:600, textTransform:"uppercase" }}>✦ Quick Sail ✦</div>
              <h2 className="sec-headline" style={{ marginBottom:"0.5rem" }}>Legendary Voyages of Madrid</h2>
              <p className="sec-sub">Six curated routes — click to sail instantly.</p>
            </div>
            <div className="routes-grid">
              {ROUTES_DATA.map((r) => (
                <div key={r.title} className="voyage-card"
                  onClick={() => startHunt(r.huntDesc, BARRIOS.find(b => b.name === r.barrio) || null)}>
                  <div className="voyage-inner">
                    <span className="voyage-badge">{r.badge}</span>
                    <span className="voyage-emoji">{r.emoji}</span>
                    <div className="voyage-title">{r.title}</div>
                    <div className="voyage-meta">{r.meta}</div>
                    <div className="voyage-cta">Set Sail →</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <footer className="footer">Made with ⚓ by <strong>Pirates</strong> · RUMBO © 2025 · Google Hackathon</footer>
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
            <div style={{textAlign:"center",marginBottom:"0.25rem"}}>
              <MascotSVG size={120} animation="bounce"/>
            </div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(1.5rem,3vw,2rem)",color:"#F0DFA0",textAlign:"center",marginBottom:"0.3rem"}}>
              Scanning the Seas of Madrid…
            </h2>
            <p style={{color:"rgba(240,223,160,0.45)",fontStyle:"italic",textAlign:"center",marginBottom:"1.75rem",fontSize:"0.88rem"}}>
              The navigator is charting your course
            </p>
            {/* Step checklist */}
            <div style={{display:"flex",flexDirection:"column",gap:"0.65rem",maxWidth:340,margin:"0 auto 1.75rem"}}>
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
              <h1 className="reveal-title" style={{ color: theme?.textPrimary || "white" }}>Three Treasures Found</h1>
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

            {/* Crew reactions */}
            {reactions && (
              <div style={{ color: theme?.textPrimary || "white" }}>
                <CrewReactions reactions={reactions} theme={theme}/>
              </div>
            )}

            {/* Scroll cards */}
            <div style={{ display:"flex", flexDirection:"column", gap:"1.25rem", marginBottom:"2rem" }}>
              {bounties.map((b,i)=>(
                <ScrollCard key={b.place_id} bounty={b} index={i}
                  visible={visibleCards.includes(i)} onSwap={swapBounty}
                  swapping={swappingId===b.place_id} theme={theme} vibe={currentVibe}
                  onFavorite={user ? handleFavorite : null}
                  isFavorited={favoritedIds.has(b.place_id)}
                  onAddToPlan={user ? openAddToPlan : null}
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

            <div className="bot-actions">
              <button className="bot-btn" onClick={reset} style={{
                background:"rgba(255,255,255,0.1)", color: theme?.textPrimary||"white",
                border:`1px solid ${theme?.cardBorder||"rgba(255,255,255,0.15)"}`,
              }}>⚓ New Search</button>
              <button className="bot-btn" onClick={shareText} style={{
                background: theme?.numberBadgeBg || "#0F2747", color:"white",
                opacity: copied ? 0.8 : 1,
              }}>{copied ? "✓ Copied!" : "📋 Share with crew"}</button>
              <button className="bot-btn" onClick={()=>setShowShare(true)} style={{
                background: theme?.goldColor || "#D4A96A", color:"#0F2747",
              }}>🖼 Share Card</button>
              {bounties.length > 1 && (
                <a href={buildMapsRouteUrl(bounties)} target="_blank" rel="noopener noreferrer" className="bot-btn" style={{
                  background:"rgba(66,133,244,0.18)", color:"#8ab4f8",
                  border:"1px solid rgba(66,133,244,0.3)", textDecoration:"none",
                  display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                }}>🗺 Navigate All Stops</a>
              )}
            </div>
          </div>

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
        <div style={{ position:"fixed", inset:0, zIndex:400, background:"rgba(0,0,0,0.7)", backdropFilter:"blur(4px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}
          onClick={() => { setShowAddToPlan(false); setAddingBounty(null); }}>
          <div style={{ background:"#0F2747", borderRadius:"20px", padding:"28px", width:"100%", maxWidth:"380px", border:"1px solid rgba(212,169,106,0.2)", boxShadow:"0 20px 60px rgba(0,0,0,0.5)" }}
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
    </>
  );
}
