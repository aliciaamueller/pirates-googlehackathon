import { useState, useEffect, useRef } from "react";
import { APIProvider, Map, AdvancedMarker, Pin, InfoWindow } from "@vis.gl/react-google-maps";
import { supabase } from "./supabase";

const MAPS_API_KEY = import.meta.env.VITE_MAPS_API_KEY;

// ─── PIRATE MAP THEME ─────────────────────────────────────────────
const PIRATE_MAP_STYLE = [
  { elementType:"geometry", stylers:[{color:"#1a1a2e"}] },
  { elementType:"labels.text.fill", stylers:[{color:"#D4A96A"}] },
  { elementType:"labels.text.stroke", stylers:[{color:"#1a1a2e"}] },
  { featureType:"administrative", elementType:"geometry", stylers:[{color:"#2d2d4e"}] },
  { featureType:"administrative.country", elementType:"labels.text.fill", stylers:[{color:"#D4A96A"}] },
  { featureType:"administrative.locality", elementType:"labels.text.fill", stylers:[{color:"#f0d090"}] },
  { featureType:"poi", elementType:"labels.text.fill", stylers:[{color:"#D4A96A"}] },
  { featureType:"poi.park", elementType:"geometry", stylers:[{color:"#162535"}] },
  { featureType:"poi.park", elementType:"labels.text.fill", stylers:[{color:"#3C7A3C"}] },
  { featureType:"road", elementType:"geometry", stylers:[{color:"#2d2d4e"}] },
  { featureType:"road", elementType:"geometry.stroke", stylers:[{color:"#0F2747"}] },
  { featureType:"road", elementType:"labels.text.fill", stylers:[{color:"#9ca5b3"}] },
  { featureType:"road.highway", elementType:"geometry", stylers:[{color:"#0F2747"}] },
  { featureType:"road.highway", elementType:"geometry.stroke", stylers:[{color:"#D4A96A"}] },
  { featureType:"road.highway", elementType:"labels.text.fill", stylers:[{color:"#f3d19c"}] },
  { featureType:"transit", elementType:"geometry", stylers:[{color:"#2f3948"}] },
  { featureType:"transit.station", elementType:"labels.text.fill", stylers:[{color:"#D4A96A"}] },
  { featureType:"water", elementType:"geometry", stylers:[{color:"#0F2747"}] },
  { featureType:"water", elementType:"labels.text.fill", stylers:[{color:"#4e6d70"}] },
  { featureType:"water", elementType:"labels.text.stroke", stylers:[{color:"#17263c"}] },
];

// ─── REAL GOOGLE MAP ──────────────────────────────────────────────
const RealMap = ({ bounties = [], scanning = false, center, theme }) => {
  const [selected, setSelected] = useState(null);
  const mapCenter = center || (bounties[0] ? { lat: bounties[0].lat, lng: bounties[0].lng } : { lat: 40.4168, lng: -3.7038 });
  const zoom = bounties.length > 0 ? 14 : 13;

  // Use day style for chill, dark pirate style for everything else
  const mapId = theme?.isDay ? "roadmap" : "DEMO_MAP_ID";

  return (
    <APIProvider apiKey={MAPS_API_KEY}>
      <Map
        defaultCenter={mapCenter}
        defaultZoom={zoom}
        mapId={mapId}
        styles={theme?.isDay ? [] : PIRATE_MAP_STYLE}
        disableDefaultUI={false}
        gestureHandling="greedy"
        style={{ width:"100%", height:"100%", borderRadius:"16px" }}
      >
        {bounties.map((b, i) => (
          <AdvancedMarker
            key={b.place_id || i}
            position={{ lat: b.lat, lng: b.lng }}
            onClick={() => setSelected(selected?.place_id === b.place_id ? null : b)}
          >
            <div style={{
              background: theme?.numberBadgeBg || "#8B2020",
              color: "white", width:"32px", height:"32px",
              borderRadius:"50% 50% 50% 0", transform:"rotate(-45deg)",
              display:"flex", alignItems:"center", justifyContent:"center",
              border:"2px solid rgba(255,255,255,0.3)",
              boxShadow:"0 2px 8px rgba(0,0,0,0.4)",
              cursor:"pointer",
            }}>
              <span style={{ transform:"rotate(45deg)", fontSize:"13px", fontWeight:700 }}>{i+1}</span>
            </div>
          </AdvancedMarker>
        ))}
        {selected && (
          <InfoWindow
            position={{ lat: selected.lat, lng: selected.lng }}
            onCloseClick={() => setSelected(null)}
          >
            <div style={{ padding:"4px 8px", maxWidth:"200px" }}>
              <div style={{ fontWeight:700, fontSize:"14px", color:"#0F2747", marginBottom:"2px" }}>{selected.pirate_name}</div>
              <div style={{ fontSize:"12px", color:"#666" }}>{selected.address}</div>
              {selected.maps_url && (
                <a href={selected.maps_url} target="_blank" rel="noopener noreferrer" style={{ fontSize:"12px", color:"#0F2747", fontWeight:600, textDecoration:"none", display:"block", marginTop:"6px" }}>⚓ Open in Maps →</a>
              )}
            </div>
          </InfoWindow>
        )}
        {scanning && (
          <AdvancedMarker position={{ lat:40.4168, lng:-3.7038 }}>
            <div style={{ width:"20px", height:"20px", borderRadius:"50%", background:"#D4A96A", boxShadow:"0 0 0 0 rgba(212,169,106,0.7)", animation:"scanPulse 1.5s ease-out infinite" }}/>
          </AdvancedMarker>
        )}
      </Map>
    </APIProvider>
  );
};


// ─── MASCOT ───────────────────────────────────────────────────────
const MascotSVG = ({ size = 140, animation = "float", style: extraStyle = {} }) => (
  <div style={{ width:size, height:size, animation:`${animation} 3s ease-in-out infinite`, display:"inline-block", ...extraStyle }}>
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
      {/* Pirate hat */}
      <polygon points="50,8 33,26 67,26" fill="#1a1a2e"/>
      <rect x="29" y="26" width="42" height="7" rx="2.5" fill="#1a1a2e"/>
      <rect x="43" y="15" width="14" height="12" rx="2" fill="#1a1a2e"/>
      <rect x="31" y="30" width="38" height="2" rx="1" fill="#C8A84B" opacity="0.7"/>
      <circle cx="50" cy="21" r="4" fill="#F7F4EE" opacity="0.9"/>
      <circle cx="48.5" cy="22" r="1" fill="#1a1a2e"/>
      <circle cx="51.5" cy="22" r="1" fill="#1a1a2e"/>
      <line x1="47" y1="23.5" x2="50" y2="22.5" stroke="#1a1a2e" strokeWidth="0.7"/>
      <line x1="53" y1="23.5" x2="50" y2="22.5" stroke="#1a1a2e" strokeWidth="0.7"/>
      {/* Chest lid — slightly open */}
      <path d="M14,48 Q50,36 86,48 L86,56 Q50,44 14,56 Z" fill="#4A2A0A"/>
      <path d="M14,48 Q50,36 86,48" stroke="#6B3E1C" strokeWidth="1.2" fill="none"/>
      <path d="M14,48 Q50,36 86,48" stroke="#C8A84B" strokeWidth="1" fill="none" opacity="0.5"/>
      {/* Gold glow escaping from open lid */}
      <ellipse cx="50" cy="52" rx="28" ry="5" fill="#F0C040" opacity="0.18"/>
      {/* Chest body */}
      <rect x="14" y="55" width="72" height="38" rx="6" fill="#3A1F08"/>
      {/* Wood grain */}
      <rect x="14" y="67" width="72" height="1.5" rx="0.7" fill="#2a1506" opacity="0.6"/>
      <rect x="14" y="80" width="72" height="1.5" rx="0.7" fill="#2a1506" opacity="0.6"/>
      {/* Gold top seam */}
      <rect x="14" y="55" width="72" height="3.5" rx="1.5" fill="#C8A84B"/>
      {/* Gold mid band */}
      <rect x="14" y="72" width="72" height="5" rx="2" fill="#C8A84B"/>
      {/* Gold bottom */}
      <rect x="14" y="89" width="72" height="3.5" rx="1.5" fill="#C8A84B" opacity="0.8"/>
      {/* Gold vertical band */}
      <rect x="47" y="55" width="6" height="38" rx="2" fill="#C8A84B"/>
      {/* Corner clasps */}
      <rect x="11" y="42" width="9" height="14" rx="2.5" fill="#C8A84B"/>
      <rect x="80" y="42" width="9" height="14" rx="2.5" fill="#C8A84B"/>
      <rect x="11" y="60" width="9" height="14" rx="2.5" fill="#C8A84B"/>
      <rect x="80" y="60" width="9" height="14" rx="2.5" fill="#C8A84B"/>
      {/* Lock */}
      <rect x="43" y="70" width="14" height="10" rx="3" fill="#C8A84B"/>
      <path d="M46,70 Q46,64 50,64 Q54,64 54,70" stroke="#C8A84B" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="50" cy="75" r="2.5" fill="#7a5010"/>
      {/* Eyes on lid face */}
      <circle cx="36" cy="48" r="7" fill="white"/>
      <circle cx="64" cy="48" r="7" fill="white"/>
      <circle cx="36" cy="48" r="7" fill="none" stroke="#C8A84B" strokeWidth="0.8"/>
      <circle cx="64" cy="48" r="7" fill="none" stroke="#C8A84B" strokeWidth="0.8"/>
      <circle cx="37" cy="48" r="4" fill="#1a1a2e" style={{animation:"blink 4.5s ease-in-out infinite"}}/>
      <circle cx="65" cy="48" r="4" fill="#1a1a2e" style={{animation:"blink 4.5s 0.1s ease-in-out infinite"}}/>
      <circle cx="38.5" cy="46.5" r="1.4" fill="white"/>
      <circle cx="66.5" cy="46.5" r="1.4" fill="white"/>
      {/* Smile */}
      <path d="M40,58 Q50,65 60,58" stroke="#C8A84B" strokeWidth="2" fill="none" strokeLinecap="round"/>
      {/* Sparkle accents */}
      <circle cx="20" cy="42" r="1.5" fill="#F0C040" opacity="0.7" style={{animation:"sparkle 2.2s 0.3s ease-in-out infinite"}}/>
      <circle cx="80" cy="44" r="1.2" fill="#F0C040" opacity="0.6" style={{animation:"sparkle 2.2s 1s ease-in-out infinite"}}/>
      <circle cx="23" cy="74" r="1" fill="#F0C040" opacity="0.5" style={{animation:"sparkle 2.2s 1.7s ease-in-out infinite"}}/>
    </svg>
  </div>
);

const API = import.meta.env.VITE_API_URL || "http://localhost:5001";

const BARRIOS = [
  { name: "Surprise Me 🎲", lat: 40.4168, lng: -3.7038, surprise: true },
  { name: "Malasaña", lat: 40.4270, lng: -3.7030 },
  { name: "Chueca", lat: 40.4243, lng: -3.6957 },
  { name: "La Latina", lat: 40.4130, lng: -3.7110 },
  { name: "Lavapiés", lat: 40.4085, lng: -3.7020 },
  { name: "Sol / Centro", lat: 40.4168, lng: -3.7038 },
  { name: "Salamanca", lat: 40.4280, lng: -3.6820 },
  { name: "Retiro", lat: 40.4115, lng: -3.6820 },
  { name: "Castellana", lat: 40.4500, lng: -3.6924 },
  { name: "Chamberí", lat: 40.4340, lng: -3.7060 },
];

const CREW_ROLES = [
  { id: "broke", label: "The Broke One", emoji: "🪙", desc: "Needs it cheap" },
  { id: "foodie", label: "The Foodie", emoji: "🍽️", desc: "Lives to eat" },
  { id: "nightowl", label: "The Night Owl", emoji: "🦉", desc: "Goes all night" },
  { id: "explorer", label: "The Explorer", emoji: "🗺️", desc: "Hates tourists" },
  { id: "romantic", label: "The Romantic", emoji: "🌹", desc: "Sets the mood" },
  { id: "culture", label: "The Culture Vulture", emoji: "🎭", desc: "Wants character" },
];

const SCAN_MESSAGES = [
  "⚓ Setting sail from your coordinates...",
  "🗺️ Consulting the ancient charts of Madrid...",
  "☠️ Avoiding tourist traps and chain taverns...",
  "🔭 Scanning the seas for hidden gems...",
  "💰 Treasure located. Pulling up the bounty...",
];

const MADRID_CENTER = { lat: 40.4168, lng: -3.7038 };

// ─── VIBE THEMES ──────────────────────────────────────────────────
// Each vibe gets its own sky, palette, particles, and mood
const VIBE_THEMES = {
  wild: {
    label: "Wild Night",
    icon: "🔥",
    skyGradient: "linear-gradient(180deg, #0a0418 0%, #1a0630 35%, #2d0a4e 60%, #1a0a20 100%)",
    accentColor: "#e040fb",
    accentGlow: "rgba(224,64,251,0.25)",
    cardBg: "rgba(20,6,40,0.92)",
    cardBorder: "rgba(224,64,251,0.25)",
    textPrimary: "#f0e0ff",
    textMuted: "rgba(200,160,240,0.65)",
    goldColor: "#e040fb",
    particles: "stars+neon",
    mapFilter: "saturate(0.4) brightness(0.6) hue-rotate(270deg)",
    tagline: "The night has no limits, Captain.",
    numberBadgeBg: "#e040fb",
  },
  romantic: {
    label: "Romantic Evening",
    icon: "🌹",
    skyGradient: "linear-gradient(180deg, #0d1a2e 0%, #1a1030 30%, #2d1440 55%, #1a0820 80%, #0d0510 100%)",
    accentColor: "#f48fb1",
    accentGlow: "rgba(244,143,177,0.2)",
    cardBg: "rgba(18,8,28,0.92)",
    cardBorder: "rgba(244,143,177,0.2)",
    textPrimary: "#ffe8f0",
    textMuted: "rgba(255,180,200,0.6)",
    goldColor: "#f48fb1",
    particles: "stars+rose",
    mapFilter: "saturate(0.5) brightness(0.55) hue-rotate(300deg)",
    tagline: "A treasure worthy of the occasion.",
    numberBadgeBg: "#c2185b",
  },
  cultural: {
    label: "Cultural Discovery",
    icon: "🎭",
    skyGradient: "linear-gradient(180deg, #0f1b2d 0%, #162540 30%, #1e3050 55%, #162030 100%)",
    accentColor: "#80cbc4",
    accentGlow: "rgba(128,203,196,0.2)",
    cardBg: "rgba(10,20,35,0.92)",
    cardBorder: "rgba(128,203,196,0.2)",
    textPrimary: "#e0f5f3",
    textMuted: "rgba(160,220,210,0.6)",
    goldColor: "#80cbc4",
    particles: "stars+soft",
    mapFilter: "saturate(0.45) brightness(0.55) hue-rotate(180deg)",
    tagline: "Every corner holds a story, Navigator.",
    numberBadgeBg: "#00796b",
  },
  foodie: {
    label: "Foodie Hunt",
    icon: "🍽️",
    skyGradient: "linear-gradient(180deg, #1a2800 0%, #2d4400 30%, #1a3000 60%, #0f1a00 100%)",
    accentColor: "#aed581",
    accentGlow: "rgba(174,213,129,0.2)",
    cardBg: "rgba(12,20,4,0.93)",
    cardBorder: "rgba(174,213,129,0.2)",
    textPrimary: "#f1ffe0",
    textMuted: "rgba(180,220,140,0.6)",
    goldColor: "#cddc39",
    particles: "stars+green",
    mapFilter: "saturate(0.4) brightness(0.5) hue-rotate(80deg)",
    tagline: "The finest hidden tables await your crew.",
    numberBadgeBg: "#558b2f",
  },
  adventure: {
    label: "Adventure Mode",
    icon: "⚡",
    skyGradient: "linear-gradient(180deg, #0a1520 0%, #102030 30%, #1a3040 55%, #102028 100%)",
    accentColor: "#ffd54f",
    accentGlow: "rgba(255,213,79,0.2)",
    cardBg: "rgba(8,18,28,0.93)",
    cardBorder: "rgba(255,213,79,0.2)",
    textPrimary: "#fffde7",
    textMuted: "rgba(240,220,140,0.6)",
    goldColor: "#ffd54f",
    particles: "stars+gold",
    mapFilter: "saturate(0.5) brightness(0.55) hue-rotate(30deg)",
    tagline: "Chart the unknown, Captain. Fortune favours the bold.",
    numberBadgeBg: "#f57f17",
  },
  chill: {
    label: "Chill Vibes",
    icon: "☕",
    // Day/afternoon feel — warm golden afternoon light
    skyGradient: "linear-gradient(180deg, #87CEEB 0%, #a8d8ea 25%, #ffd89b 65%, #f4a460 100%)",
    accentColor: "#D4A96A",
    accentGlow: "rgba(212,169,106,0.2)",
    cardBg: "rgba(255,252,245,0.95)",
    cardBorder: "rgba(180,140,60,0.25)",
    textPrimary: "#2a1a08",
    textMuted: "#8a7a5a",
    goldColor: "#B8860B",
    particles: "clouds+birds",
    mapFilter: "saturate(0.9) brightness(0.95)",
    tagline: "The perfect spot for a lazy afternoon.",
    numberBadgeBg: "#0F2747",
    isDay: true,
  },
};

// ─── ANIMATED SKY BACKGROUND ──────────────────────────────────────
const SkyBackground = ({ vibe }) => {
  const theme = VIBE_THEMES[vibe] || VIBE_THEMES.wild;
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setTick(p => p + 1), 80);
    return () => clearInterval(t);
  }, []);

  // Generate stable random stars
  const stars = useRef(
    Array.from({ length: 120 }, (_, i) => ({
      x: (Math.sin(i * 137.5) * 0.5 + 0.5) * 100,
      y: (Math.cos(i * 97.3) * 0.5 + 0.5) * 70,
      r: 0.4 + (i % 5) * 0.3,
      speed: 0.3 + (i % 7) * 0.1,
      offset: i * 0.8,
    }))
  ).current;

  const clouds = useRef(
    Array.from({ length: 6 }, (_, i) => ({
      x: (i / 6) * 130 - 20,
      y: 8 + (i % 3) * 12,
      w: 80 + (i % 4) * 30,
      speed: 0.008 + (i % 3) * 0.004,
    }))
  ).current;

  if (theme.isDay) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
        <div style={{ position: "absolute", inset: 0, background: theme.skyGradient }} />
        {/* Sun */}
        <div style={{
          position: "absolute", top: "8%", right: "12%",
          width: 80, height: 80, borderRadius: "50%",
          background: "radial-gradient(circle, #fff9c4 0%, #ffd54f 40%, rgba(255,213,79,0) 70%)",
          boxShadow: "0 0 60px 20px rgba(255,220,80,0.4)",
          animation: "sunPulse 4s ease-in-out infinite",
        }} />
        {/* Clouds SVG */}
        <svg style={{ position: "absolute", inset: 0, width: "100%", height: "40%", overflow: "visible" }}>
          {clouds.map((c, i) => {
            const cx = ((c.x + tick * c.speed) % 130) - 15;
            return (
              <g key={i} transform={`translate(${cx}%, ${c.y}%)`} opacity={0.75 - i * 0.05}>
                <ellipse cx="0" cy="0" rx={`${c.w * 0.4}%`} ry="2.5%" fill="white" />
                <ellipse cx={`${c.w * 0.12}%`} cy="-1.2%" rx={`${c.w * 0.28}%`} ry="2%" fill="white" />
                <ellipse cx={`-${c.w * 0.1}%`} cy="-0.8%" rx={`${c.w * 0.22}%`} ry="1.6%" fill="white" />
              </g>
            );
          })}
        </svg>
        {/* Birds */}
        {[...Array(5)].map((_, i) => {
          const bx = ((i * 23 + tick * (0.05 + i * 0.01)) % 110) - 5;
          const by = 15 + i * 6;
          return (
            <svg key={i} style={{ position: "absolute", left: `${bx}%`, top: `${by}%`, width: 20, height: 10, overflow: "visible", opacity: 0.5 }}>
              <path d="M0,5 Q5,0 10,5 Q15,0 20,5" stroke="#334" strokeWidth="1.5" fill="none" />
            </svg>
          );
        })}
        <style>{`@keyframes sunPulse { 0%,100%{box-shadow:0 0 60px 20px rgba(255,220,80,0.4)} 50%{box-shadow:0 0 80px 30px rgba(255,220,80,0.55)} }`}</style>
      </div>
    );
  }

  // Night sky
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, overflow: "hidden", pointerEvents: "none" }}>
      <div style={{ position: "absolute", inset: 0, background: theme.skyGradient }} />
      {/* Stars */}
      <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
        {stars.map((s, i) => {
          const twinkle = Math.abs(Math.sin((tick * s.speed + s.offset)));
          return (
            <circle key={i} cx={`${s.x}%`} cy={`${s.y}%`} r={s.r + twinkle * 0.5}
              fill="white" opacity={0.3 + twinkle * 0.55} />
          );
        })}
        {/* Moon */}
        <circle cx="88%" cy="12%" r="28" fill="#fffde7" opacity="0.9" />
        <circle cx="91%" cy="10%" r="22" fill={theme.skyGradient.match(/#[0-9a-f]{6}/i)?.[0] || "#0a0418"} opacity="0.75" />
        {/* Neon glow for wild/romantic */}
        {(vibe === "wild" || vibe === "romantic") && (
          <ellipse cx="50%" cy="85%" rx="35%" ry="15%"
            fill={theme.accentColor} opacity="0.06" />
        )}
      </svg>
      {/* City glow at horizon */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: "30%",
        background: `linear-gradient(0deg, ${theme.accentGlow} 0%, transparent 100%)`,
      }} />
    </div>
  );
};

// ─── TREASURE MAP SVG ─────────────────────────────────────────────
const TreasureMapSVG = ({ bounties = [], scanning = false }) => {
  const [pulse, setPulse] = useState(0);
  useEffect(() => {
    if (!scanning) return;
    const t = setInterval(() => setPulse(p => (p + 1) % 60), 80);
    return () => clearInterval(t);
  }, [scanning]);

  const neighborhoods = [
    { name: "Malasaña", x: 36, y: 33 },{ name: "Chueca", x: 52, y: 28 },
    { name: "La Latina", x: 32, y: 58 },{ name: "Lavapiés", x: 46, y: 63 },
    { name: "Sol", x: 50, y: 50 },{ name: "Salamanca", x: 68, y: 26 },
    { name: "Retiro", x: 66, y: 54 },{ name: "Chamberí", x: 40, y: 20 },
  ];

  const xMarks = bounties.map((b, i) => ({
    x: Math.min(Math.max(((b.lng + 3.76) / 0.13) * 70 + 15, 15), 85),
    y: Math.min(Math.max(((40.46 - b.lat) / 0.09) * 70 + 12, 12), 82),
    label: b.pirate_name || b.name, index: i + 1,
  }));

  return (
    <svg viewBox="0 0 600 370" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <radialGradient id="pgOuter" cx="48%" cy="45%" r="72%">
          <stop offset="0%" stopColor="#FDF8EC"/>
          <stop offset="55%" stopColor="#F5E8BE"/>
          <stop offset="100%" stopColor="#E8CC80"/>
        </radialGradient>
        <radialGradient id="pgSheen" cx="30%" cy="28%" r="50%">
          <stop offset="0%" stopColor="#FFFEF8" stopOpacity="0.65"/>
          <stop offset="100%" stopColor="#F5E8BE" stopOpacity="0"/>
        </radialGradient>
        {/* Bright ocean teal for top-right */}
        <radialGradient id="seaTR" cx="80%" cy="20%" r="60%">
          <stop offset="0%" stopColor="#7DD8E0"/>
          <stop offset="60%" stopColor="#4CBAC8"/>
          <stop offset="100%" stopColor="#2E9AAA"/>
        </radialGradient>
        {/* Softer ocean teal for bottom-left */}
        <radialGradient id="seaBL" cx="20%" cy="80%" r="60%">
          <stop offset="0%" stopColor="#6CCCD6"/>
          <stop offset="60%" stopColor="#3AAEBB"/>
          <stop offset="100%" stopColor="#2490A0"/>
        </radialGradient>
        <pattern id="dg" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="9" cy="9" r="0.65" fill="#9B7820" opacity="0.22"/>
        </pattern>
        <filter id="ss"><feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor="#4A6E70" floodOpacity="0.18"/></filter>
        <clipPath id="mc"><rect x="8" y="8" width="584" height="354" rx="12"/></clipPath>
      </defs>

      {/* Parchment base */}
      <rect x="8" y="8" width="584" height="354" rx="12" fill="url(#pgOuter)"/>
      <rect x="8" y="8" width="584" height="354" rx="12" fill="url(#pgSheen)"/>
      <rect x="8" y="8" width="584" height="354" rx="12" fill="url(#dg)"/>

      {/* Ocean — top right */}
      <ellipse cx="598" cy="6" rx="158" ry="132" fill="url(#seaTR)" clipPath="url(#mc)"/>
      {/* Waves top right */}
      {[0,1,2,3,4].map(i=>(
        <path key={`wt${i}`}
          d={`M${475+i*14},${22+i*11} Q${505+i*14},${15+i*11} ${530+i*14},${22+i*11} Q${558+i*14},${29+i*11} ${580+i*14},${22+i*11}`}
          stroke="rgba(255,255,255,0.55)" strokeWidth="1.1" fill="none" clipPath="url(#mc)"/>
      ))}

      {/* Ocean — bottom left */}
      <ellipse cx="4" cy="368" rx="138" ry="108" fill="url(#seaBL)" clipPath="url(#mc)"/>
      {/* Waves bottom left */}
      {[0,1,2,3].map(i=>(
        <path key={`wb${i}`}
          d={`M${8+i*10},${342+i*9} Q${30+i*10},${335+i*9} ${52+i*10},${342+i*9} Q${74+i*10},${349+i*9} ${96+i*10},${342+i*9}`}
          stroke="rgba(255,255,255,0.5)" strokeWidth="1" fill="none" clipPath="url(#mc)"/>
      ))}

      {/* Dashed sailing route across map */}
      <path d="M530,55 Q420,130 310,175 Q185,220 72,318"
        stroke="#5A9EAD" strokeWidth="1.6" strokeDasharray="9 6" fill="none" opacity="0.38"/>

      {/* Ship — top right ocean */}
      <g transform="translate(484,16)" clipPath="url(#mc)" filter="url(#ss)">
        <path d="M8,34 Q23,41 42,34 L39,47 Q23,54 11,47 Z" fill="#3A2010" opacity="0.88"/>
        <path d="M8,36 Q23,43 42,36" stroke="#2A1508" strokeWidth="0.9" fill="none" opacity="0.5"/>
        <line x1="23" y1="34" x2="23" y2="4" stroke="#3A2010" strokeWidth="2"/>
        <line x1="13" y1="14" x2="34" y2="14" stroke="#3A2010" strokeWidth="0.9"/>
        <path d="M23,5 L23,31 L35,25 L34,14 Z" fill="#FFFCF0" stroke="#C8A84B" strokeWidth="0.6" opacity="0.96"/>
        <path d="M23,5 L23,31 L11,25 L13,14 Z" fill="#FFF5D8" stroke="#C8A84B" strokeWidth="0.6" opacity="0.88"/>
        <line x1="23" y1="4" x2="23" y2="0" stroke="#3A2010" strokeWidth="0.9"/>
        <path d="M23,0 L31,2 L23,4 Z" fill="#1a1a1a"/>
        <path d="M5,52 Q15,48 25,52 Q35,56 45,52" stroke="rgba(120,210,220,0.65)" strokeWidth="1.3" fill="none"/>
      </g>

      {/* Ship — bottom left ocean */}
      <g transform="translate(22,298)" clipPath="url(#mc)" filter="url(#ss)">
        <path d="M5,22 Q13,27 23,22 L21,29 Q13,33 7,29 Z" fill="#3A2010" opacity="0.85"/>
        <line x1="13" y1="22" x2="13" y2="7" stroke="#3A2010" strokeWidth="1.5"/>
        <path d="M13,8 L13,20 L21,17 L21,12 Z" fill="#FFFCF0" stroke="#C8A84B" strokeWidth="0.45" opacity="0.92"/>
        <path d="M13,8 L13,20 L5,17 L6,12 Z" fill="#FFF5D8" stroke="#C8A84B" strokeWidth="0.45" opacity="0.84"/>
        <line x1="13" y1="7" x2="13" y2="4" stroke="#3A2010" strokeWidth="0.7"/>
        <path d="M13,4 L18,5.5 L13,7 Z" fill="#1a1a1a"/>
      </g>

      {/* Palm — top left */}
      <g transform="translate(20,44)" clipPath="url(#mc)">
        <path d="M10,60 Q11,38 12,20" stroke="#6B4520" strokeWidth="2.2" fill="none"/>
        <ellipse cx="12" cy="21" rx="18" ry="5.5" fill="#2A6C0A" transform="rotate(-25,12,21)" opacity="0.82"/>
        <ellipse cx="12" cy="19" rx="20" ry="5" fill="#3A8A10" transform="rotate(20,12,19)" opacity="0.77"/>
        <ellipse cx="12" cy="20" rx="15" ry="4.5" fill="#2A6C0A" transform="rotate(-55,12,20)" opacity="0.72"/>
        <circle cx="12" cy="17" r="3" fill="#C8A84B" opacity="0.72"/>
      </g>

      {/* Palm — bottom right */}
      <g transform="translate(542,308)" clipPath="url(#mc)">
        <path d="M8,52 Q7,32 6,14" stroke="#6B4520" strokeWidth="1.9" fill="none"/>
        <ellipse cx="6" cy="16" rx="16" ry="4.5" fill="#2A6C0A" transform="rotate(-20,6,16)" opacity="0.78"/>
        <ellipse cx="6" cy="14" rx="18" ry="4" fill="#3A8A10" transform="rotate(28,6,14)" opacity="0.73"/>
        <circle cx="6" cy="12" r="2.6" fill="#C8A84B" opacity="0.65"/>
      </g>

      {/* Compass rose */}
      <g transform="translate(496,252)">
        <circle cx="38" cy="38" r="36" fill="#EDD898" opacity="0.42" stroke="#8B6914" strokeWidth="1.2"/>
        <circle cx="38" cy="38" r="28" fill="none" stroke="#8B6914" strokeWidth="0.65" strokeDasharray="2.5 3"/>
        <polygon points="38,4 41.5,32 38,38 34.5,32" fill="#4A2E10" opacity="0.92"/>
        <polygon points="38,72 41.5,44 38,38 34.5,44" fill="#8B6914" opacity="0.65"/>
        <polygon points="4,38 32,34.5 38,38 32,41.5" fill="#8B6914" opacity="0.65"/>
        <polygon points="72,38 44,34.5 38,38 44,41.5" fill="#4A2E10" opacity="0.92"/>
        {[45,135,225,315].map((a,i)=>(
          <polygon key={i} points="38,14 40,34 38,38 36,34"
            fill="#9B7820" opacity="0.3" transform={`rotate(${a},38,38)`}/>
        ))}
        <circle cx="38" cy="38" r="5.5" fill="#8B6914"/>
        <circle cx="38" cy="38" r="2.5" fill="#FDF8EC"/>
        <text x="38" y="0" textAnchor="middle" fill="#4A2E10" fontSize="8" fontWeight="bold">N</text>
        <text x="38" y="82" textAnchor="middle" fill="#6B4A1A" fontSize="7" opacity="0.75">S</text>
        <text x="-2" y="42" textAnchor="end" fill="#6B4A1A" fontSize="7" opacity="0.75">W</text>
        <text x="80" y="42" textAnchor="start" fill="#6B4A1A" fontSize="7" opacity="0.75">E</text>
      </g>

      {/* Map title banner */}
      <g transform="translate(166,10)">
        <rect x="0" y="0" width="268" height="27" rx="5" fill="#C8A84B" opacity="0.22"/>
        <rect x="0" y="0" width="268" height="27" rx="5" fill="none" stroke="#9B7820" strokeWidth="0.9"/>
        <text x="134" y="18" textAnchor="middle" fill="#4A2E10" fontSize="10.5" fontWeight="bold" letterSpacing="3.5">MAPA SECRETO DE MADRID</text>
      </g>

      {/* Neighborhood dots */}
      {neighborhoods.map(n=>(
        <g key={n.name} transform={`translate(${n.x/100*568+16},${n.y/100*338+16})`}>
          <circle cx="0" cy="0" r="3.8" fill="#9B7820" opacity="0.35"/>
          <circle cx="0" cy="0" r="1.8" fill="#C8A84B" opacity="0.65"/>
          <text x="6" y="4.5" fill="#4A2E10" fontSize="7" opacity="0.62" fontStyle="italic">{n.name}</text>
        </g>
      ))}

      {/* Route lines between bounties */}
      {xMarks.length>1 && xMarks.map((m,i)=>{
        if(i===0) return null;
        const prev=xMarks[i-1];
        const x1=prev.x/100*568+16, y1=prev.y/100*338+16;
        const x2=m.x/100*568+16, y2=m.y/100*338+16;
        const mx=(x1+x2)/2+(y2-y1)*0.15, my=(y1+y2)/2-(x2-x1)*0.1;
        return <path key={i} d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
          stroke="#8B2020" strokeWidth="2" strokeDasharray="8 5" fill="none" opacity="0.7"/>;
      })}

      {/* Bounty X marks */}
      {xMarks.map(m=>{
        const cx=m.x/100*568+16, cy=m.y/100*338+16;
        return (
          <g key={m.index} transform={`translate(${cx},${cy})`} filter="url(#ss)">
            <circle cx="0" cy="0" r="18" fill="#8B2020" opacity="0.1"/>
            <line x1="-9" y1="-9" x2="9" y2="9" stroke="#8B2020" strokeWidth="3.5" strokeLinecap="round"/>
            <line x1="9" y1="-9" x2="-9" y2="9" stroke="#8B2020" strokeWidth="3.5" strokeLinecap="round"/>
            <circle cx="13" cy="-13" r="9" fill="#8B2020"/>
            <text x="13" y="-13" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="9" fontWeight="bold">{m.index}</text>
            <rect x="-40" y="14" width="80" height="17" rx="4" fill="#0F2747" opacity="0.72"/>
            <text x="0" y="23.5" textAnchor="middle" dominantBaseline="middle" fill="#F5E8BE" fontSize="7">{(m.label||"").slice(0,22)}</text>
          </g>
        );
      })}

      {/* Scan pulse */}
      {scanning && (
        <g transform="translate(300,185)">
          {[0,1,2].map(i=>{
            const r=20+((pulse+i*20)%60)*3.5;
            const op=Math.max(0,1-((pulse+i*20)%60)/60);
            return <circle key={i} cx="0" cy="0" r={r} fill="none" stroke="#4CBAC8" strokeWidth="1.8" opacity={op}/>;
          })}
          <circle cx="0" cy="0" r="8" fill="#4CBAC8" opacity="0.82"/>
          <circle cx="0" cy="0" r="4" fill="#FDF8EC"/>
        </g>
      )}

      {/* Outer border */}
      <rect x="8" y="8" width="584" height="354" rx="12" fill="none" stroke="#9B7820" strokeWidth="2.5" opacity="0.62"/>
      <rect x="15" y="15" width="570" height="340" rx="9" fill="none" stroke="#9B7820" strokeWidth="0.7" opacity="0.32"/>
      {/* Corner marks */}
      {[[8,8],[592,8],[8,362],[592,362]].map(([x,y],i)=>(
        <g key={i}>
          <line x1={x+(i%2===0?3:-3)} y1={y} x2={x+(i%2===0?22:-22)} y2={y} stroke="#9B7820" strokeWidth="2.5" opacity="0.52"/>
          <line x1={x} y1={y+(i<2?3:-3)} x2={x} y2={y+(i<2?22:-22)} stroke="#9B7820" strokeWidth="2.5" opacity="0.52"/>
        </g>
      ))}
    </svg>
  );
};

// ─── HERO ILLUSTRATED PANEL ───────────────────────────────────────
const HeroIllustratedPanel = () => (
  <div className="hero-panel">
    {/* Starfield */}
    <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg">
      {Array.from({length:50},(_,i)=>(
        <circle key={i}
          cx={`${(Math.sin(i*137.5)*0.5+0.5)*100}%`}
          cy={`${(Math.cos(i*97.3)*0.5+0.5)*100}%`}
          r={0.5+(i%3)*0.5} fill="white"
          style={{animation:`starTwinkle ${2+(i%5)*0.5}s ${i*0.18}s ease-in-out infinite`}}
        />
      ))}
    </svg>

    {/* Floating compass */}
    <div style={{position:"absolute",bottom:"10%",left:"7%",animation:"floatSlow 4.5s 0.5s ease-in-out infinite",opacity:0.5}}>
      <svg width="58" height="58" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r="35" fill="none" stroke="#C8A84B" strokeWidth="1.5" strokeDasharray="4 5"/>
        <circle cx="38" cy="38" r="26" fill="none" stroke="#C8A84B" strokeWidth="0.7" opacity="0.45"/>
        <polygon points="38,6 41,32 38,38 35,32" fill="#F7F4EE"/>
        <polygon points="38,70 41,44 38,38 35,44" fill="#C8A84B" opacity="0.55"/>
        <polygon points="6,38 32,35 38,38 32,41" fill="#C8A84B" opacity="0.55"/>
        <polygon points="70,38 44,35 38,38 44,41" fill="#F7F4EE"/>
        <circle cx="38" cy="38" r="5" fill="#C8A84B"/>
        <circle cx="38" cy="38" r="2.5" fill="#1a1a2e"/>
        <text x="38" y="3" textAnchor="middle" fill="#C8A84B" fontSize="7" fontWeight="bold">N</text>
      </svg>
    </div>

    {/* Floating coin */}
    <div style={{position:"absolute",top:"12%",right:"9%",animation:"float 2.8s 1.2s ease-in-out infinite",opacity:0.65}}>
      <svg width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="#C8A84B" stroke="#F0C040" strokeWidth="1.5"/>
        <circle cx="20" cy="20" r="12" fill="none" stroke="#8B6914" strokeWidth="0.8"/>
        <text x="20" y="25" textAnchor="middle" fill="#8B6914" fontSize="13" fontWeight="bold">$</text>
      </svg>
    </div>

    {/* Floating scroll */}
    <div style={{position:"absolute",top:"40%",left:"5%",animation:"float 3.6s 0.2s ease-in-out infinite",opacity:0.45}}>
      <svg width="30" height="38" viewBox="0 0 30 38">
        <rect x="4" y="4" width="22" height="30" rx="2" fill="#F5E8BE" stroke="#C8A84B" strokeWidth="1.2"/>
        <path d="M4,4 Q1,4 1,8 Q1,12 4,12" fill="#E8CC80"/>
        <path d="M26,4 Q29,4 29,8 Q29,12 26,12" fill="#E8CC80"/>
        <line x1="8" y1="16" x2="22" y2="16" stroke="#C8A84B" strokeWidth="0.9" opacity="0.6"/>
        <line x1="8" y1="20" x2="22" y2="20" stroke="#C8A84B" strokeWidth="0.9" opacity="0.4"/>
        <line x1="8" y1="24" x2="17" y2="24" stroke="#C8A84B" strokeWidth="0.9" opacity="0.4"/>
      </svg>
    </div>

    {/* Ship — top right */}
    <div style={{position:"absolute",top:"8%",right:"6%",animation:"floatSlow 5s 0.8s ease-in-out infinite",opacity:0.4}}>
      <svg width="44" height="44" viewBox="0 0 60 50">
        <path d="M8,34 Q30,42 52,34 L49,44 Q30,52 11,44 Z" fill="#3A2010"/>
        <line x1="30" y1="34" x2="30" y2="6" stroke="#3A2010" strokeWidth="2.2"/>
        <line x1="18" y1="16" x2="42" y2="16" stroke="#3A2010" strokeWidth="1"/>
        <path d="M30,7 L30,32 L43,26 L42,16 Z" fill="#FFFCF0" stroke="#C8A84B" strokeWidth="0.6" opacity="0.95"/>
        <path d="M30,7 L30,32 L17,26 L18,16 Z" fill="#FFF5D8" stroke="#C8A84B" strokeWidth="0.6" opacity="0.88"/>
        <path d="M30,5 L37,7 L30,9 Z" fill="#1a1a1a"/>
      </svg>
    </div>

    {/* Mascot */}
    <div style={{position:"relative",zIndex:2,textAlign:"center",padding:"1rem"}}>
      <MascotSVG size={160} animation="float"/>
      <div style={{
        fontFamily:"'Crimson Text',serif", fontSize:"1.05rem",
        color:"rgba(212,169,106,0.8)", marginTop:"0.5rem",
        fontStyle:"italic", letterSpacing:"0.04em",
        textShadow:"0 2px 8px rgba(0,0,0,0.4)",
      }}>
        "Aye, I know every hidden gem…"
      </div>
    </div>

    {/* Bottom gradient + label */}
    <div style={{
      position:"absolute", bottom:0, left:0, right:0,
      background:"linear-gradient(0deg,rgba(10,22,48,0.95) 0%,transparent 100%)",
      padding:"1.5rem 1.25rem 1.1rem", textAlign:"center",
    }}>
      <div style={{fontSize:"0.7rem",letterSpacing:"0.25em",textTransform:"uppercase",color:"#D4A96A",marginBottom:"0.5rem"}}>
        Hidden Gems of Madrid
      </div>
      <div style={{display:"flex",justifyContent:"center",gap:"0.65rem"}}>
        {["🏴‍☠️","⚓","🗺️","💰","☠️"].map((e,i)=>(
          <span key={i} style={{fontSize:"1rem",opacity:0.65}}>{e}</span>
        ))}
      </div>
    </div>
  </div>
);

// ─── VIBE METER ───────────────────────────────────────────────────
const VibeMeter = ({ preferences }) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 200); }, []);

  if (!preferences) return null;

  const avoid = preferences.avoid || [];
  const budgetWidth = preferences.budget === "broke" ? 25 : preferences.budget === "medium" ? 60 : 90;
  const vibeEmojis = { wild:"🔥", romantic:"🌹", cultural:"🎭", foodie:"🍽️", adventure:"⚡", chill:"☕" };

  return (
    <div style={{
      background: "rgba(255,255,255,0.07)", backdropFilter: "blur(12px)",
      border: "1px solid rgba(255,255,255,0.12)", borderRadius: 16,
      padding: "1.25rem 1.5rem", marginBottom: "1.5rem",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)",
      transition: "all 0.5s ease",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "1rem" }}>
        <span style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.5 }}>
          AI ANALYSIS
        </span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }}/>
        <span style={{ fontSize: "0.75rem", opacity: 0.6 }}>
          {vibeEmojis[preferences.vibe]} {preferences.vibe}
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
        {/* Crew size */}
        <div>
          <div style={{ fontSize: "0.68rem", opacity: 0.5, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Crew Size</div>
          <div style={{ display: "flex", gap: 4 }}>
            {Array.from({ length: Math.min(preferences.group_size || 2, 8) }).map((_, i) => (
              <div key={i} style={{
                width: 8, height: 8, borderRadius: "50%",
                background: "currentColor", opacity: 0.7 + i * 0.03,
                transition: `all ${0.3 + i * 0.05}s ease`,
                transform: visible ? "scale(1)" : "scale(0)",
              }}/>
            ))}
            {(preferences.group_size||0) > 8 && <span style={{ fontSize: "0.7rem", opacity: 0.5 }}>+{preferences.group_size-8}</span>}
          </div>
        </div>

        {/* Budget meter */}
        <div>
          <div style={{ fontSize: "0.68rem", opacity: 0.5, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.1em" }}>Budget</div>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: 4, height: 6, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4,
              background: "currentColor",
              width: visible ? `${budgetWidth}%` : "0%",
              transition: "width 0.8s cubic-bezier(0.4,0,0.2,1) 0.3s",
              opacity: 0.7,
            }}/>
          </div>
          <div style={{ fontSize: "0.68rem", opacity: 0.45, marginTop: 2 }}>{preferences.budget}</div>
        </div>
      </div>

      {/* Avoid tags */}
      {avoid.length > 0 && (
        <div style={{ marginTop: "0.75rem", display: "flex", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: "0.65rem", opacity: 0.4, alignSelf: "center" }}>Avoiding:</span>
          {avoid.map(a => (
            <span key={a} style={{
              background: "rgba(255,80,80,0.15)", border: "1px solid rgba(255,80,80,0.25)",
              borderRadius: 20, padding: "0.15rem 0.6rem",
              fontSize: "0.7rem", opacity: 0.8,
            }}>✕ {a}</span>
          ))}
        </div>
      )}

      {preferences.special_context && (
        <div style={{
          marginTop: "0.75rem", padding: "0.5rem 0.75rem",
          background: "rgba(255,255,255,0.06)", borderRadius: 8,
          fontSize: "0.78rem", fontStyle: "italic", opacity: 0.7,
        }}>✨ {preferences.special_context}</div>
      )}
    </div>
  );
};

// ─── CREW REACTIONS ───────────────────────────────────────────────
const CrewReactions = ({ reactions, theme }) => {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 600); }, []);

  if (!reactions) return null;

  const agents = [
    { id: "blackwood", emoji: "⚔️", color: "#ef9a9a" },
    { id: "rosario",   emoji: "🗺️", color: "#80cbc4" },
    { id: "finn",      emoji: "🍳", color: "#a5d6a7" },
  ];

  return (
    <div style={{
      background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16,
      marginBottom: "1.5rem", overflow: "hidden",
      opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(16px)",
      transition: "all 0.6s ease",
    }}>
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: "100%", padding: "1rem 1.25rem", background: "none", border: "none",
          cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between",
          color: "inherit",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.5 }}>
            THE CREW REACTS
          </span>
          <div style={{ display: "flex", gap: -4 }}>
            {agents.map(a => (
              <span key={a.id} style={{ fontSize: "1rem", marginLeft: -4 }}>{a.emoji}</span>
            ))}
          </div>
        </div>
        <span style={{ opacity: 0.4, fontSize: "0.8rem", transition: "transform 0.2s", transform: expanded ? "rotate(180deg)" : "none" }}>▼</span>
      </button>

      {expanded && (
        <div style={{ padding: "0 1.25rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {agents.map((a, i) => {
            const r = reactions[a.id];
            if (!r) return null;
            return (
              <div key={a.id} style={{
                background: "rgba(255,255,255,0.05)", borderRadius: 10,
                padding: "0.75rem 1rem", borderLeft: `3px solid ${a.color}`,
                animation: `fadeUp 0.4s ease ${i * 0.15}s both`,
              }}>
                <div style={{ fontSize: "0.72rem", fontWeight: 600, opacity: 0.8, marginBottom: 4, letterSpacing: "0.05em" }}>
                  {a.emoji} {r.name}
                </div>
                <div style={{ fontSize: "0.85rem", opacity: 0.7, lineHeight: 1.5, fontStyle: "italic" }}>
                  "{r.text}"
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

// ─── TREASURE LOG ─────────────────────────────────────────────────
const STORAGE_KEY = "rumbo_treasure_log";

function loadLog() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}
function saveLog(entry) {
  const log = loadLog();
  log.unshift({ ...entry, ts: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(0, 10)));
}

const TreasureLog = ({ onSelect, theme }) => {
  const [log, setLog] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => { setLog(loadLog()); }, [open]);

  if (log.length === 0) return null;

  const vibeEmojis = { wild:"🔥", romantic:"🌹", cultural:"🎭", foodie:"🍽️", adventure:"⚡", chill:"☕" };
  const fmt = ts => {
    const d = new Date(ts), now = new Date();
    const diff = now - d;
    if (diff < 86400000) return "Today";
    if (diff < 172800000) return "Yesterday";
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  };

  return (
    <div style={{ marginBottom: "1.5rem" }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", background: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12,
          padding: "0.75rem 1.25rem", cursor: "pointer", color: "inherit",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}
      >
        <span style={{ fontSize: "0.75rem", opacity: 0.6, letterSpacing: "0.08em", textTransform: "uppercase" }}>
          📜 Treasure Log ({log.length})
        </span>
        <span style={{ opacity: 0.4, fontSize: "0.8rem", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>▼</span>
      </button>

      {open && (
        <div style={{
          background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 12, marginTop: 6, overflow: "hidden",
        }}>
          {log.map((entry, i) => (
            <button
              key={i}
              onClick={() => onSelect(entry)}
              style={{
                width: "100%", background: "none", border: "none",
                borderBottom: i < log.length-1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                padding: "0.75rem 1.25rem", cursor: "pointer", color: "inherit",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                textAlign: "left", transition: "background 0.15s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "none"}
            >
              <div>
                <div style={{ fontSize: "0.82rem", opacity: 0.8, marginBottom: 2 }}>
                  {vibeEmojis[entry.vibe] || "🧭"} {entry.description?.slice(0, 40) || "Madrid search"}
                </div>
                <div style={{ fontSize: "0.7rem", opacity: 0.4 }}>
                  {entry.bounties?.length || 0} gems · {entry.barrio || "Madrid"} · {fmt(entry.ts)}
                </div>
              </div>
              <span style={{ opacity: 0.35, fontSize: "0.8rem" }}>→</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── ROUTE OPTIMIZER ──────────────────────────────────────────────
const RouteOptimizer = ({ bounties, theme }) => {
  if (!bounties || bounties.length < 2) return null;

  // Simple nearest-neighbor from first bounty
  const optimize = (bs) => {
    const visited = [0]; let remaining = [1, 2].slice(0, bs.length - 1);
    while (remaining.length > 0) {
      const last = visited[visited.length - 1];
      let nearest = remaining[0], minDist = Infinity;
      remaining.forEach(i => {
        const d = Math.hypot(bs[i].lat - bs[last].lat, bs[i].lng - bs[last].lng);
        if (d < minDist) { minDist = d; nearest = i; }
      });
      visited.push(nearest);
      remaining = remaining.filter(i => i !== nearest);
    }
    return visited;
  };

  const order = optimize(bounties);
  const isOptimal = order.every((v, i) => v === i);

  // Estimate walking time between consecutive stops (avg 4 km/h)
  const walkMins = (a, b) => {
    const km = Math.hypot(a.lat - b.lat, a.lng - b.lng) * 111;
    return Math.round(km / 4 * 60);
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.06)", backdropFilter: "blur(10px)",
      border: "1px solid rgba(255,255,255,0.1)", borderRadius: 16,
      padding: "1rem 1.25rem", marginBottom: "1.5rem",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "0.85rem" }}>
        <span style={{ fontSize: "0.65rem", letterSpacing: "0.15em", textTransform: "uppercase", opacity: 0.5 }}>
          🧭 OPTIMAL ROUTE
        </span>
        {isOptimal && (
          <span style={{ fontSize: "0.65rem", opacity: 0.4, marginLeft: "auto" }}>Already optimized ✓</span>
        )}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
        {order.map((idx, i) => {
          const b = bounties[idx];
          const next = i < order.length - 1 ? bounties[order[i + 1]] : null;
          const mins = next ? walkMins(b, next) : null;
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{
                background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 8, padding: "0.4rem 0.7rem",
                fontSize: "0.78rem", lineHeight: 1.3,
              }}>
                <span style={{ opacity: 0.5, fontSize: "0.65rem" }}>#{idx + 1}</span>{" "}
                <span style={{ opacity: 0.85 }}>{b.pirate_name?.split(" ")[0] || b.name?.split(" ")[0]}</span>
              </div>
              {mins !== null && (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", opacity: 0.4 }}>
                  <span style={{ fontSize: "0.62rem" }}>{mins}min</span>
                  <span style={{ fontSize: "0.8rem" }}>→</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── SHARE CARD ───────────────────────────────────────────────────
const ShareCard = ({ bounties, preferences, theme, onClose }) => {
  const canvasRef = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    const W = 600, H = 420; c.width = W; c.height = H;

    // Background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    if (theme?.isDay) {
      bg.addColorStop(0, "#87CEEB"); bg.addColorStop(0.5, "#ffd89b"); bg.addColorStop(1, "#f4a460");
    } else {
      bg.addColorStop(0, "#0a0418"); bg.addColorStop(0.5, "#1a0630"); bg.addColorStop(1, "#0a0520");
    }
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Stars (night only)
    if (!theme?.isDay) {
      ctx.fillStyle = "white";
      for (let i = 0; i < 80; i++) {
        const x = (Math.sin(i * 137.5) * 0.5 + 0.5) * W;
        const y = (Math.cos(i * 97.3) * 0.5 + 0.5) * H * 0.6;
        const r = 0.5 + (i % 3) * 0.4;
        ctx.globalAlpha = 0.3 + (i % 5) * 0.1;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Card bg
    ctx.fillStyle = theme?.isDay ? "rgba(255,252,245,0.92)" : "rgba(15,8,30,0.88)";
    roundRect(ctx, 30, 30, W - 60, H - 60, 18);
    ctx.fill();

    // Gold border
    ctx.strokeStyle = "#D4A96A"; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.5;
    roundRect(ctx, 30, 30, W - 60, H - 60, 18); ctx.stroke();
    ctx.globalAlpha = 1;

    // Header
    ctx.fillStyle = theme?.isDay ? "#0F2747" : "#F0DFA0";
    ctx.font = "bold 28px Georgia, serif"; ctx.textAlign = "center";
    ctx.fillText("RUMBO 🧭", W / 2, 90);

    ctx.fillStyle = theme?.accentColor || "#D4A96A";
    ctx.font = "italic 14px Georgia, serif";
    ctx.fillText(theme?.tagline || "Hidden gems found.", W / 2, 115);

    // Bounties
    bounties.forEach((b, i) => {
      const y = 160 + i * 80;
      ctx.fillStyle = "#8B2020"; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "left";
      ctx.fillText(`✕ #${i + 1}`, 65, y);
      ctx.fillStyle = theme?.isDay ? "#0F2747" : "#F0DFA0";
      ctx.font = "bold 16px Georgia, serif";
      ctx.fillText(b.pirate_name || b.name, 95, y);
      ctx.fillStyle = theme?.isDay ? "#8a7a5a" : "rgba(240,223,160,0.6)";
      ctx.font = "13px sans-serif";
      ctx.fillText(b.address || "", 95, y + 18);
      ctx.fillStyle = theme?.accentColor || "#D4A96A";
      ctx.font = "italic 12px Georgia, serif";
      ctx.fillText(`"${(b.hook || "").slice(0, 55)}${b.hook?.length > 55 ? "…" : ""}"`, 95, y + 34);
    });

    // Footer
    ctx.fillStyle = "#D4A96A"; ctx.font = "11px sans-serif"; ctx.textAlign = "center";
    ctx.fillText("rumbo.app · AI Pirate Navigator", W / 2, H - 45);
    setDone(true);
  }, []);

  const download = () => {
    const a = document.createElement("a");
    a.download = "rumbo-treasure.png";
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: "1rem",
    }} onClick={onClose}>
      <div style={{ maxWidth: 640, width: "100%" }} onClick={e => e.stopPropagation()}>
        <canvas ref={canvasRef} style={{ width: "100%", borderRadius: 12, display: "block" }} />
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", justifyContent: "center" }}>
          <button onClick={download} style={{
            background: "#D4A96A", color: "#0F2747", border: "none",
            borderRadius: 40, padding: "0.7rem 1.8rem", cursor: "pointer",
            fontWeight: 600, fontSize: "0.85rem",
          }}>⬇ Download Card</button>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 40, padding: "0.7rem 1.4rem", cursor: "pointer", fontSize: "0.85rem",
          }}>Close</button>
        </div>
      </div>
    </div>
  );
};

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ─── SCROLL CARD ──────────────────────────────────────────────────
function ConfirmSwapButton({ onConfirm, swapping, theme }) {
  const [confirming, setConfirming] = useState(false);
  const t = theme || {};
  if (swapping) return (
    <button disabled style={{ background:"rgba(255,255,255,0.06)", border:`1px solid ${t.cardBorder||"rgba(255,255,255,0.15)"}`, color:t.textMuted||"rgba(255,255,255,0.55)", borderRadius:10, padding:"0.75rem 1rem", fontSize:"0.8rem", cursor:"not-allowed", whiteSpace:"nowrap" }}>...</button>
  );
  if (confirming) return (
    <div style={{ display:"flex", gap:"6px" }}>
      <button onClick={() => { setConfirming(false); onConfirm(); }} style={{ background:"rgba(255,80,80,0.15)", border:"1px solid rgba(255,80,80,0.3)", color:"#ff6b6b", borderRadius:10, padding:"0.75rem 0.8rem", fontSize:"0.8rem", cursor:"pointer", whiteSpace:"nowrap" }}>Yes, swap</button>
      <button onClick={() => setConfirming(false)} style={{ background:"rgba(255,255,255,0.06)", border:`1px solid ${t.cardBorder||"rgba(255,255,255,0.15)"}`, color:t.textMuted||"rgba(255,255,255,0.55)", borderRadius:10, padding:"0.75rem 0.8rem", fontSize:"0.8rem", cursor:"pointer", whiteSpace:"nowrap" }}>Cancel</button>
    </div>
  );
  return (
    <button onClick={() => setConfirming(true)} style={{ background:"rgba(255,255,255,0.06)", border:`1px solid ${t.cardBorder||"rgba(255,255,255,0.15)"}`, color:t.textMuted||"rgba(255,255,255,0.55)", borderRadius:10, padding:"0.75rem 1rem", fontSize:"0.8rem", cursor:"pointer", whiteSpace:"nowrap" }}>✕ Not feeling it</button>
  );
}

function ScrollCard({ bounty, index, visible, onSwap, swapping, theme, onAddToPlan, onFavorite, isFavorited }) {
  const t = theme || {};
  const [addMsg, setAddMsg] = useState("");

  async function handleAddToPlan() {
    if (onAddToPlan) {
      await onAddToPlan(bounty);
      setAddMsg("Added! ✓");
      setTimeout(() => setAddMsg(""), 2000);
    }
  }

  return (
    <div className="bounty-card" style={{
      background: t.cardBg || "rgba(255,255,255,0.07)",
      border: `1px solid ${t.cardBorder || "rgba(255,255,255,0.12)"}`,
      boxShadow: `0 4px 24px ${t.accentGlow || "rgba(0,0,0,0.3)"}`,
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: "opacity 0.5s ease, transform 0.5s ease",
      filter: swapping ? "opacity(0.3)" : "none",
      pointerEvents: swapping ? "none" : "all",
    }}>
      {/* Photo header with overlaid badges */}
      <div style={{ position: "relative", height: 220, background: t.numberBadgeBg || "#0F2747", overflow: "hidden" }}>
        {bounty.photo_url
          ? <img src={bounty.photo_url} alt={bounty.name}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", filter: "brightness(0.78) saturate(0.85)" }} />
          : <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg, #0F2747 0%, #1a3a6a 100%)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"3rem" }}>🏴‍☠️</div>
        }
        {/* Gradient overlay */}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top, rgba(10,20,40,0.9) 0%, rgba(10,20,40,0.2) 50%, transparent 100%)" }} />
        {/* Top-right action buttons */}
        <div style={{ position:"absolute", top:10, right:10, display:"flex", gap:6 }}>
          {onFavorite && (
            <button onClick={() => onFavorite(bounty)} title={isFavorited?"Remove from favorites":"Save to favorites"} style={{
              background: isFavorited ? "rgba(255,80,80,0.25)" : "rgba(0,0,0,0.35)",
              border: `1px solid ${isFavorited ? "rgba(255,80,80,0.5)" : "rgba(255,255,255,0.2)"}`,
              borderRadius:"50%", width:34, height:34, cursor:"pointer",
              fontSize:"15px", display:"flex", alignItems:"center", justifyContent:"center",
              backdropFilter:"blur(8px)",
            }}>{isFavorited ? "❤️" : "🤍"}</button>
          )}
          {onAddToPlan && (
            <button onClick={handleAddToPlan} title="Add to a plan" style={{
              background: addMsg ? "rgba(80,200,120,0.25)" : "rgba(0,0,0,0.35)",
              border: `1px solid ${addMsg ? "rgba(80,200,120,0.5)" : "rgba(255,255,255,0.2)"}`,
              borderRadius:"50%", width:34, height:34, cursor:"pointer",
              fontSize:"15px", display:"flex", alignItems:"center", justifyContent:"center",
              backdropFilter:"blur(8px)",
            }}>{addMsg ? "✓" : "+"}</button>
          )}
          <div style={{
            width:34, height:34, borderRadius:"50%",
            background: t.numberBadgeBg || "#8B2020",
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:"0.75rem", fontWeight:700, color:"white",
            border:"2px solid rgba(255,255,255,0.2)",
          }}>{index + 1}</div>
        </div>
        {/* Pirate name + real name on photo bottom */}
        <div style={{ position:"absolute", bottom:12, left:14, right:14 }}>
          <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", fontWeight:700, color:"white", textShadow:"0 2px 8px rgba(0,0,0,0.8)" }}>
            {bounty.pirate_name}
          </div>
          <div style={{ fontSize:"0.78rem", color:"rgba(255,255,255,0.65)", marginTop:2 }}>
            {bounty.name}{bounty.price_level ? " · " + "💰".repeat(bounty.price_level) : ""}
          </div>
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding:"1.25rem 1.4rem" }}>
        {/* AI insight callout */}
        <div className="insight-callout" style={{
          marginBottom:"1rem",
          borderLeftColor: t.goldColor || "#D4A96A",
          background: t.accentGlow || "rgba(212,169,106,0.08)",
          color: t.textMuted || "rgba(255,255,255,0.72)",
        }}>
          "{bounty.hook}"
        </div>

        {/* Rating + address row */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:6, marginBottom:"0.85rem", fontSize:"0.8rem" }}>
          <div style={{ display:"flex", gap:"0.75rem", alignItems:"center" }}>
            {bounty.rating && (
              <span style={{ color: t.goldColor || "#D4A96A", fontWeight:600 }}>
                {"★".repeat(Math.floor(bounty.rating))}{"☆".repeat(5 - Math.floor(bounty.rating))} {bounty.rating}
              </span>
            )}
            {bounty.address && <span style={{ color: t.textMuted || "rgba(255,255,255,0.5)" }}>📍 {bounty.address}</span>}
          </div>
          {bounty.send_off && (
            <div style={{ fontSize:"0.78rem", color: t.goldColor || "#D4A96A", fontStyle:"italic" }}>{bounty.send_off}</div>
          )}
        </div>

        {/* CTA row */}
        <div style={{ display:"flex", gap:"0.75rem" }}>
          <a href={bounty.maps_url} target="_blank" rel="noopener noreferrer" style={{
            flex:1, background:`linear-gradient(135deg, ${t.numberBadgeBg || "#0F2747"} 0%, #1a3a6a 100%)`,
            color:"white", border:"none", borderRadius:12,
            padding:"0.8rem", fontSize:"0.85rem", fontWeight:600,
            textAlign:"center", textDecoration:"none",
            display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            boxShadow:"0 4px 14px rgba(0,0,0,0.3)",
            transition:"transform 0.15s, box-shadow 0.15s",
          }}>⚓ Claim this Bounty</a>
          <ConfirmSwapButton onConfirm={() => onSwap(bounty.place_id)} swapping={swapping} theme={t} />
        </div>
      </div>
    </div>
  );
}

// ─── BASE STYLES ──────────────────────────────────────────────────
const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #0F2747; font-family: 'DM Sans', sans-serif; min-height: 100vh; overflow-x: hidden; }

  /* NAVBAR */
  .navbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2.5rem; height: 68px;
    background: rgba(247,244,238,0.94); backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(180,140,60,0.2);
  }
  .nav-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .nav-title { font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:700; color:#0F2747; letter-spacing:0.05em; }
  .nav-sub { font-size:0.57rem; letter-spacing:0.18em; color:#B8860B; text-transform:uppercase; font-weight:500; }
  .nav-links { display:flex; gap:2rem; list-style:none; }
  .nav-links a { font-size:0.85rem; color:#4a3820; text-decoration:none; transition:color 0.2s; }
  .nav-links a:hover { color:#0F2747; }
  .nav-cta {
    display:flex; align-items:center; gap:8px; background:#0F2747; color:white;
    padding:0.6rem 1.4rem; border-radius:40px; font-size:0.82rem; font-weight:500;
    border:none; cursor:pointer; transition:all 0.2s;
  }
  .nav-cta:hover { background:#1a3a6a; transform:translateY(-1px); }

  /* HERO */
  .hero {
    min-height: 100vh; padding-top: 68px;
    display: grid; grid-template-columns: 1fr 1fr;
    align-items: center; gap: 3rem;
    max-width: 1200px; margin: 0 auto; padding-left:3rem; padding-right:3rem;
    position: relative; z-index: 1;
  }

  /* INPUT CARD */
  .input-card {
    background:rgba(255,255,255,0.9); backdrop-filter:blur(16px);
    border:1px solid #E0D4B8; border-radius:20px; padding:1.75rem;
    box-shadow:0 8px 40px rgba(15,39,71,0.12);
  }
  .input-label { font-size:0.7rem; font-weight:500; letter-spacing:0.12em; text-transform:uppercase; color:#8a7a5a; margin-bottom:0.6rem; display:block; }
  .input-textarea {
    width:100%; background:#F7F4EE; border:1.5px solid #E0D4B8; border-radius:10px;
    color:#1a1208; font-family:'Crimson Text',serif; font-size:1.05rem; line-height:1.6;
    padding:0.9rem 1rem; resize:none; min-height:72px; outline:none; transition:border-color 0.2s;
  }
  .input-textarea::placeholder { color:#b0a080; font-style:italic; }
  .input-textarea:focus { border-color:#D4A96A; }
  .chips-label { font-size:0.68rem; letter-spacing:0.1em; text-transform:uppercase; color:#8a7a5a; margin-bottom:0.5rem; display:block; font-weight:500; }
  .chips-row { display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:0.6rem; }
  .chip {
    background:white; border:1.5px solid #E0D4B8; border-radius:40px;
    padding:0.3rem 0.85rem; font-size:0.8rem; color:#4a3820;
    cursor:pointer; transition:all 0.15s; white-space:nowrap;
  }
  .chip:hover { border-color:#D4A96A; color:#0F2747; }
  .chip.sel { background:#0F2747; border-color:#0F2747; color:white; }
  .chip.surprise { border-style:dashed; border-color:rgba(212,169,106,0.5); color:#8B6914; }
  .chip.surprise.sel { background:#B8860B; border-color:#B8860B; color:white; border-style:solid; }
  .roles-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0.5rem; margin-bottom:1rem; }
  .role-chip { background:white; border:1.5px solid #E0D4B8; border-radius:10px; padding:0.6rem 0.4rem; cursor:pointer; transition:all 0.15s; text-align:center; }
  .role-chip:hover { border-color:#D4A96A; }
  .role-chip.sel { background:rgba(15,39,71,0.05); border-color:#0F2747; }
  .role-emoji { font-size:1.2rem; display:block; margin-bottom:0.15rem; }
  .role-name { font-size:0.65rem; color:#0F2747; display:block; font-weight:500; line-height:1.3; }
  .role-desc { font-size:0.62rem; color:#8a7a5a; font-style:italic; display:block; }
  .sail-btn {
    width:100%; margin-top:1.2rem; background:#0F2747; color:white; border:none; border-radius:12px;
    padding:0.95rem; font-size:0.9rem; font-weight:500; letter-spacing:0.08em;
    cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px; text-transform:uppercase;
  }
  .sail-btn:hover:not(:disabled) { background:#1a3a6a; transform:translateY(-1px); box-shadow:0 4px 20px rgba(15,39,71,0.3); }
  .sail-btn:disabled { opacity:0.4; cursor:not-allowed; }
  .sail-gold { color:#D4A96A; }
  .sail-tagline { text-align:center; margin-top:0.75rem; font-size:0.75rem; color:#8a7a5a; font-style:italic; }

  /* MAP */
  .map-wrap {
    width:100%; border-radius:16px; overflow:hidden;
    border:2px solid rgba(180,140,60,0.35);
    box-shadow:0 20px 60px rgba(15,39,71,0.15); aspect-ratio:14/9; background:#F0E8D0;
  }
  .map-wrap.tall { aspect-ratio:16/10; }
  .map-wrap.wide { aspect-ratio:21/9; }

  /* ERROR */
  .err-box { background:rgba(139,32,32,0.1); border:1px solid rgba(139,32,32,0.3); border-radius:10px; padding:0.75rem 1rem; color:#c0392b; font-size:0.85rem; margin-top:0.75rem; }

  /* FEATURES */
  .features-bar { display:flex; gap:1.5rem; margin-top:1.5rem; padding-top:1.5rem; border-top:1px solid #E0D4B8; flex-wrap:wrap; }
  .feat { display:flex; align-items:center; gap:6px; font-size:0.75rem; color:#8a7a5a; }

  /* HUNTING */
  .hunting-wrap { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2rem; padding:88px 3rem 3rem; max-width:800px; margin:0 auto; position:relative; z-index:1; }

  /* REVEAL */
  .reveal-wrap { padding:100px 3rem 4rem; max-width:900px; margin:0 auto; position:relative; z-index:1; color:white; }
  .reveal-title { font-family:'Playfair Display',serif; font-size:clamp(1.8rem,3vw,2.6rem); margin-bottom:0.75rem; text-align:center; }
  .crew-banner {
    display:inline-flex; align-items:center; gap:0.5rem;
    background:rgba(212,169,106,0.15); border:1px solid rgba(212,169,106,0.3);
    border-radius:40px; padding:0.45rem 1.2rem; font-size:0.82rem; font-style:italic;
  }

  /* BOTTOM ACTIONS */
  .bot-actions { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; margin-bottom:2rem; }
  .bot-btn { padding:0.8rem 2rem; border-radius:40px; font-size:0.85rem; font-weight:500; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; border:none; }

  /* HOW SECTION */
  .how-section { background:white; padding:5rem 3rem; border-top:1px solid #E0D4B8; position:relative; z-index:1; }
  .how-inner { max-width:1100px; margin:0 auto; }
  .sec-headline { font-family:'Playfair Display',serif; font-size:clamp(2rem,3.5vw,2.8rem); color:#0F2747; text-align:center; margin-bottom:0.5rem; }
  .sec-sub { text-align:center; color:#8a7a5a; font-size:1rem; margin-bottom:3rem; }
  .how-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
  .how-card { background:#F7F4EE; border:1px solid #E0D4B8; border-radius:16px; padding:2rem 1.75rem; }
  .how-icon { font-size:2rem; margin-bottom:1rem; display:block; }
  .how-title { font-family:'Playfair Display',serif; font-size:1.1rem; color:#0F2747; margin-bottom:0.5rem; }
  .how-text { font-size:0.88rem; color:#8a7a5a; line-height:1.6; }

  /* ROUTES */
  .routes-section { padding:5rem 3rem; max-width:1200px; margin:0 auto; position:relative; z-index:1; }
  .routes-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
  .route-card { border-radius:14px; overflow:hidden; border:1px solid #E0D4B8; background:white; transition:transform 0.2s, box-shadow 0.2s; cursor:pointer; }
  .route-card:hover { transform:translateY(-3px); box-shadow:0 12px 40px rgba(15,39,71,0.12); }
  .route-inner { padding:2rem 1.5rem 1.5rem; min-height:180px; display:flex; flex-direction:column; justify-content:flex-end; }
  .route-badge { display:inline-block; background:#D4A96A; color:#0F2747; border-radius:40px; padding:0.25rem 0.75rem; font-size:0.72rem; font-weight:600; margin-bottom:1rem; align-self:flex-start; }
  .route-emoji { font-size:2.2rem; margin-bottom:0.5rem; display:block; }
  .route-title { font-family:'Playfair Display',serif; font-size:1rem; color:white; font-weight:600; margin-bottom:0.3rem; }
  .route-meta { font-size:0.78rem; color:rgba(255,255,255,0.7); }

  /* HERO BADGE */
  .hero-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(212,169,106,0.15); border:1px solid rgba(212,169,106,0.4); border-radius:40px; padding:0.35rem 1rem; font-size:0.72rem; font-weight:500; letter-spacing:0.1em; color:#8B6914; text-transform:uppercase; margin-bottom:1.5rem; }
  .hero-headline { font-family:'Playfair Display',serif; font-size:clamp(2.2rem,4vw,3.3rem); font-weight:700; line-height:1.1; color:#0F2747; margin-bottom:0.5rem; }
  .hero-headline em { font-style:italic; color:#D4A96A; display:block; }
  .hero-sub { font-size:1rem; color:#4a3820; line-height:1.65; margin-bottom:2.5rem; font-weight:300; max-width:440px; }

  /* FOOTER */
  .footer { background:#0F2747; color:rgba(255,255,255,0.5); text-align:center; padding:2rem; font-size:0.8rem; position:relative; z-index:1; }
  .footer strong { color:#D4A96A; }
  .divider { border:none; border-top:1px solid #E0D4B8; margin:0; }

  /* ANIMATIONS */
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scanPulse { 0%{box-shadow:0 0 0 0 rgba(212,169,106,0.7)} 70%{box-shadow:0 0 0 20px rgba(212,169,106,0)} 100%{box-shadow:0 0 0 0 rgba(212,169,106,0)} }
  @keyframes sunPulse { 0%,100%{box-shadow:0 0 60px 20px rgba(255,220,80,0.4)} 50%{box-shadow:0 0 80px 30px rgba(255,220,80,0.55)} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  @keyframes floatSlow { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-18px) rotate(2deg)} }
  @keyframes bounce { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-20px)} 70%{transform:translateY(-7px)} }
  @keyframes blink { 0%,88%,100%{transform:scaleY(1)} 92%,96%{transform:scaleY(0.05)} }
  @keyframes sparkle { 0%,100%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} }
  @keyframes pulseGlow { 0%,100%{box-shadow:0 0 18px rgba(212,169,106,0.25)} 50%{box-shadow:0 0 38px rgba(212,169,106,0.65),0 0 70px rgba(212,169,106,0.2)} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes compassSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
  @keyframes starTwinkle { 0%,100%{opacity:0.15} 50%{opacity:0.8} }
  @keyframes chestShake { 0%,100%{transform:rotate(0deg) scale(1)} 25%{transform:rotate(-5deg) scale(1.04)} 75%{transform:rotate(5deg) scale(1.04)} }
  .fu { animation:fadeUp 0.6s ease forwards; opacity:0; }
  .fu1{animation-delay:0.1s} .fu2{animation-delay:0.25s} .fu3{animation-delay:0.4s} .fu4{animation-delay:0.55s}

  /* HERO ILLUSTRATED PANEL */
  .hero-panel {
    position:relative; display:flex; align-items:center; justify-content:center;
    border-radius:24px; overflow:hidden; aspect-ratio:4/5;
    background:linear-gradient(160deg,#0d1f3c 0%,#1a3a6a 45%,#0a1628 100%);
    border:2px solid rgba(212,169,106,0.3);
    box-shadow:0 24px 80px rgba(15,39,71,0.35);
    animation:pulseGlow 4s ease-in-out infinite;
  }

  /* PREMIUM SAIL BUTTON */
  .sail-btn-premium {
    width:100%; margin-top:1.2rem; border:none; border-radius:14px;
    padding:1rem; font-size:0.9rem; font-weight:600; letter-spacing:0.08em;
    cursor:pointer; transition:all 0.25s; text-transform:uppercase;
    display:flex; align-items:center; justify-content:center; gap:10px;
    background:linear-gradient(135deg,#0F2747 0%,#1a3a6a 100%);
    color:white; position:relative; overflow:hidden;
  }
  .sail-btn-premium::after {
    content:""; position:absolute; inset:0;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.09),transparent);
    background-size:200% 100%; animation:shimmer 2.5s ease-in-out infinite;
  }
  .sail-btn-premium:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(15,39,71,0.45); }
  .sail-btn-premium:disabled { opacity:0.35; cursor:not-allowed; }

  /* SURPRISE BUTTON */
  .surprise-btn {
    width:100%; margin-top:0.65rem; padding:0.85rem; border-radius:14px;
    border:2px dashed rgba(212,169,106,0.45); background:rgba(212,169,106,0.05);
    color:#8B6914; font-size:0.85rem; font-weight:600; cursor:pointer;
    transition:all 0.2s; letter-spacing:0.05em; font-family:'DM Sans',sans-serif;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .surprise-btn:hover { border-color:#D4A96A; background:rgba(212,169,106,0.1); color:#B8860B; transform:translateY(-1px); }

  /* ROPE DIVIDER */
  .rope-divider { display:flex; align-items:center; gap:1rem; padding:0 3rem; max-width:1200px; margin:0 auto; }
  .rope-divider::before,.rope-divider::after { content:""; flex:1; height:3px; border-radius:2px; opacity:0.35;
    background:repeating-linear-gradient(90deg,#C8A84B 0,#C8A84B 8px,#8B6914 8px,#8B6914 14px,#C8A84B 14px,#C8A84B 20px); }
  .rope-divider span { font-size:1.1rem; opacity:0.5; flex-shrink:0; }

  /* VIBE GRID */
  .vibe-section { padding:4rem 3rem 5rem; max-width:1200px; margin:0 auto; position:relative; z-index:1; }
  .vibe-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-top:2rem; }
  .vibe-tile { border-radius:18px; padding:1.75rem 1.25rem; text-align:center; cursor:pointer;
    transition:all 0.22s; position:relative; overflow:hidden; }
  .vibe-tile:hover { transform:translateY(-5px) scale(1.02); box-shadow:0 16px 48px rgba(0,0,0,0.22); }
  .vibe-tile-icon { font-size:2.6rem; display:block; margin-bottom:0.6rem; }
  .vibe-tile-label { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; display:block; margin-bottom:0.3rem; }
  .vibe-tile-sub { font-size:0.72rem; opacity:0.6; font-style:italic; display:block; }

  /* CHEST CARDS (SURPRISE SCREEN) */
  .chest-card { border-radius:20px; padding:2rem 1.25rem 1.75rem; text-align:center; cursor:pointer;
    transition:all 0.25s; backdrop-filter:blur(10px); }
  .chest-card:hover { transform:scale(1.05) translateY(-6px); }
  .chest-card:hover .chest-lid { transform:rotate(-14deg) translateY(-3px); transform-origin:left bottom; transition:transform 0.3s ease; }
  .chest-lid { transition:transform 0.3s ease; }

  /* BOUNTY CARD (RESULTS) */
  .bounty-card { border-radius:20px; overflow:hidden; backdrop-filter:blur(12px);
    transition:transform 0.25s ease, box-shadow 0.25s ease; }
  .bounty-card:hover { transform:translateY(-3px); }

  /* AI INSIGHT CALLOUT */
  .insight-callout {
    border-radius:0 10px 10px 0; padding:0.8rem 1rem; margin:0.75rem 0;
    font-family:'Crimson Text',serif; font-style:italic; font-size:1.05rem; line-height:1.55;
    position:relative; border-left-width:3px; border-left-style:solid;
  }
  .insight-callout::before { content:"AI PICK"; position:absolute; top:-9px; left:10px;
    background:#D4A96A; color:#0F2747; font-size:0.5rem; font-family:'DM Sans',sans-serif;
    font-style:normal; font-weight:700; letter-spacing:0.15em; padding:2px 7px; border-radius:4px; }

  @media (max-width:900px) {
    .hero { grid-template-columns:1fr; padding:5rem 1.5rem 2rem; gap:2rem; }
    .hero-panel { aspect-ratio:16/9; min-height:260px; }
    .how-cards { grid-template-columns:1fr; }
    .routes-grid { grid-template-columns:repeat(2,1fr); }
    .vibe-grid { grid-template-columns:repeat(2,1fr); }
    .navbar { padding:0 1.5rem; }
    .nav-links { display:none; }
    .reveal-wrap { padding:90px 1.25rem 3rem; }
    .hunting-wrap { padding:90px 1.25rem 3rem; }
    .how-section,.routes-section,.vibe-section { padding:3rem 1.5rem; }
    .rope-divider { padding:0 1.5rem; }
  }
  @media (max-width:600px) {
    .routes-grid { grid-template-columns:1fr; }
    .vibe-grid { grid-template-columns:1fr 1fr; }
  }
`;

const ROUTES_DATA = [
  { title:"Hidden Cafés in Malasaña", badge:"Local Favorite", emoji:"☕", a:"#1a5a6e", b:"#0d3a4a", meta:"12 gems · Malasaña", barrio:"Malasaña", huntDesc:"Friends looking for hidden local cafés with character, avoiding tourist chains" },
  { title:"Rooftop Night in Salamanca", badge:"Night Out", emoji:"🌙", a:"#1a3a62", b:"#0d2040", meta:"8 gems · Salamanca", barrio:"Salamanca", huntDesc:"Friends going out for drinks and night views, wants something special" },
  { title:"Cheap Eats in Chamberí", badge:"Student Pick", emoji:"🍺", a:"#2a4a1a", b:"#122010", meta:"15 gems · Chamberí", barrio:"Chamberí", huntDesc:"Broke students who want cheap local food and drinks, no tourist spots" },
  { title:"Romantic Spots in La Latina", badge:"Date Night", emoji:"🌹", a:"#5a1a3a", b:"#300a20", meta:"10 gems · La Latina", barrio:"La Latina", huntDesc:"A couple on a date wanting intimate cozy spots away from the crowds" },
  { title:"Local Markets & Bookstores", badge:"Off the Map", emoji:"📚", a:"#2a3a1a", b:"#141e08", meta:"9 gems · Centro", barrio:"Sol / Centro", huntDesc:"Culture lovers looking for local markets, bookstores and hidden character spots" },
  { title:"Secret Cocktail Bars in Chueca", badge:"Hidden Gem", emoji:"🍸", a:"#0d2a42", b:"#061420", meta:"11 gems · Chueca", barrio:"Chueca", huntDesc:"A group looking for secret cocktail bars and speakeasies in Chueca" },
];


// ─── AUTH SCREEN ──────────────────────────────────────────────────
function AuthScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    setLoading(true); setError(""); setMessage("");
    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onLogin(data.user);
    } else {
      if (!username.trim()) { setError("Username is required"); setLoading(false); return; }
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); }
      else { setMessage("Account created! Check your email to confirm, then log in."); }
    }
    setLoading(false);
  };

  const inp = { padding:"13px 16px", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.07)", color:"white", fontSize:"15px", outline:"none", width:"100%", boxSizing:"border-box" };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(160deg,#F7F4EE 0%,#EDE6D4 60%,#e0d8c0 100%)" }}>
      <div style={{ background:"#0F2747", borderRadius:"24px", padding:"48px", width:"100%", maxWidth:"420px", boxShadow:"0 25px 60px rgba(15,39,71,0.35)", border:"1px solid rgba(212,169,106,0.2)" }}>
        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          <div style={{ fontSize:"44px", marginBottom:"8px" }}>🧭</div>
          <h1 style={{ color:"#F7F4EE", fontSize:"26px", fontFamily:"'Playfair Display',serif", fontWeight:700, margin:0 }}>RUMBO</h1>
          <p style={{ color:"rgba(212,169,106,0.7)", marginTop:"6px", fontSize:"13px", fontStyle:"italic" }}>AI Pirate Navigator · Madrid</p>
        </div>
        <div style={{ display:"flex", background:"rgba(255,255,255,0.05)", borderRadius:"10px", padding:"4px", marginBottom:"24px" }}>
          {["Log In","Sign Up"].map((tab,i) => (
            <button key={tab} onClick={() => { setIsLogin(i===0); setError(""); setMessage(""); }} style={{ flex:1, padding:"10px", borderRadius:"8px", border:"none", cursor:"pointer", fontWeight:600, fontSize:"14px", background:(isLogin?i===0:i===1)?"#D4A96A":"transparent", color:(isLogin?i===0:i===1)?"#0F2747":"rgba(255,255,255,0.4)" }}>{tab}</button>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          {!isLogin && <input type="text" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} style={inp}/>}
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={inp}/>
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} style={inp}/>
        </div>
        {error && <div style={{ marginTop:"14px", padding:"10px 14px", background:"rgba(255,80,80,0.12)", border:"1px solid rgba(255,80,80,0.25)", borderRadius:"8px", color:"#ff6b6b", fontSize:"13px" }}>{error}</div>}
        {message && <div style={{ marginTop:"14px", padding:"10px 14px", background:"rgba(80,200,120,0.12)", border:"1px solid rgba(80,200,120,0.25)", borderRadius:"8px", color:"#51cf66", fontSize:"13px" }}>{message}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{ width:"100%", marginTop:"20px", padding:"14px", borderRadius:"10px", border:"none", cursor:loading?"not-allowed":"pointer", background:loading?"rgba(255,255,255,0.1)":"#D4A96A", color:"#0F2747", fontWeight:700, fontSize:"15px", opacity:loading?0.6:1 }}>
          {loading?"Loading...":isLogin?"Log In ⚓":"Create Account 🗺️"}
        </button>
      </div>
    </div>
  );
}

// ─── PROFILE PANEL ────────────────────────────────────────────────
function ProfilePanel({ user, onClose }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("favorites");

  useEffect(() => { loadFavorites(); }, []);

  async function loadFavorites() {
    setLoading(true);
    const { data } = await supabase.from("favorites").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setFavorites(data || []);
    setLoading(false);
  }

  async function removeFavorite(id) {
    await supabase.from("favorites").delete().eq("id", id);
    setFavorites(f => f.filter(fav => fav.id !== id));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    onClose();
  }

  const displayName = user.email?.split("@")[0] || "Pirate";

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", display:"flex", justifyContent:"flex-end" }} onClick={onClose}>
      <div style={{ width:"100%", maxWidth:"420px", height:"100%", background:"#0F2747", overflowY:"auto", borderLeft:"1px solid rgba(212,169,106,0.2)", boxShadow:"-20px 0 60px rgba(0,0,0,0.4)", display:"flex", flexDirection:"column" }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:"28px 24px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:"32px", marginBottom:"6px" }}>🏴‍☠️</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", color:"#F7F4EE", fontWeight:700 }}>Captain {displayName}</div>
              <div style={{ fontSize:"12px", color:"rgba(212,169,106,0.6)", marginTop:"2px" }}>{user.email}</div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"rgba(255,255,255,0.5)", width:"32px", height:"32px", borderRadius:"50%", cursor:"pointer", fontSize:"16px" }}>✕</button>
          </div>
          <div style={{ display:"flex", gap:"8px", marginTop:"20px" }}>
            {[["favorites","❤️ Favorites"],["account","⚙️ Account"]].map(([id,label]) => (
              <button key={id} onClick={()=>setTab(id)} style={{ padding:"7px 16px", borderRadius:"20px", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, background:tab===id?"#D4A96A":"rgba(255,255,255,0.07)", color:tab===id?"#0F2747":"rgba(255,255,255,0.5)" }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ flex:1, padding:"20px 24px", overflowY:"auto" }}>
          {tab === "favorites" && (
            <>
              {loading ? (
                <div style={{ color:"rgba(255,255,255,0.3)", textAlign:"center", padding:"40px 0", fontSize:"14px" }}>Loading treasures...</div>
              ) : favorites.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0" }}>
                  <div style={{ fontSize:"40px", marginBottom:"12px" }}>🗺️</div>
                  <div style={{ color:"rgba(255,255,255,0.3)", fontSize:"14px" }}>No saved treasures yet.<br/>Press ❤️ on any place to save it.</div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  <div style={{ fontSize:"12px", color:"rgba(212,169,106,0.5)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"4px" }}>{favorites.length} treasure{favorites.length!==1?"s":""} saved</div>
                  {favorites.map(fav => (
                    <div key={fav.id} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", overflow:"hidden" }}>
                      {fav.place_photo && <img src={fav.place_photo} alt={fav.place_name} style={{ width:"100%", height:"110px", objectFit:"cover", filter:"brightness(0.85)" }}/>}
                      <div style={{ padding:"12px 14px" }}>
                        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"15px", color:"#F7F4EE", marginBottom:"3px" }}>{fav.place_name}</div>
                        {fav.place_address && <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)", marginBottom:"10px" }}>📍 {fav.place_address}</div>}
                        <div style={{ display:"flex", gap:"8px" }}>
                          <a href={`https://maps.google.com/?q=${encodeURIComponent((fav.place_name||"")+" "+(fav.place_address||""))}`} target="_blank" rel="noopener noreferrer" style={{ flex:1, padding:"7px 0", borderRadius:"8px", textAlign:"center", background:"#D4A96A", color:"#0F2747", fontSize:"12px", fontWeight:600, textDecoration:"none", display:"block" }}>⚓ View on Maps</a>
                          <button onClick={()=>removeFavorite(fav.id)} style={{ padding:"7px 12px", borderRadius:"8px", border:"1px solid rgba(255,80,80,0.3)", background:"rgba(255,80,80,0.08)", color:"rgba(255,100,100,0.7)", cursor:"pointer", fontSize:"12px" }}>✕</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {tab === "account" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", padding:"16px" }}>
                <div style={{ fontSize:"11px", color:"rgba(212,169,106,0.5)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"6px" }}>Email</div>
                <div style={{ color:"#F7F4EE", fontSize:"14px" }}>{user.email}</div>
              </div>
              <button onClick={handleLogout} style={{ marginTop:"8px", padding:"12px", borderRadius:"10px", border:"1px solid rgba(255,80,80,0.3)", background:"rgba(255,80,80,0.08)", color:"rgba(255,120,120,0.9)", cursor:"pointer", fontSize:"14px", fontWeight:600 }}>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────

// ─── PLANS PANEL ──────────────────────────────────────────────────

// ─── PLANS PANEL ──────────────────────────────────────────────────

// ─── PLANS PANEL ──────────────────────────────────────────────────
function PlansPanel({ user, onClose, onAddToplan, bounties }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPlanName, setNewPlanName] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planMembers, setPlanMembers] = useState([]);
  const [memberFavorites, setMemberFavorites] = useState([]);
  const [planPlaces, setPlanPlaces] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [joinToken, setJoinToken] = useState("");
  const [joinMsg, setJoinMsg] = useState("");

  useEffect(() => { loadPlans(); }, []);

  async function loadPlans() {
    setLoading(true);
    const { data: memberOf } = await supabase.from("plan_members").select("plan_id").eq("user_id", user.id);
    if (!memberOf?.length) { setPlans([]); setLoading(false); return; }
    const ids = memberOf.map(m => m.plan_id);
    const { data } = await supabase.from("plans").select("*").in("id", ids).order("created_at", { ascending: false });
    setPlans(data || []);
    setLoading(false);
  }

  async function createPlan() {
    if (!newPlanName.trim()) return;
    setCreating(true);
    const { data, error } = await supabase.from("plans").insert({ name: newPlanName.trim(), created_by: user.id }).select().single();
    if (!error && data) {
      await supabase.from("plan_members").insert({ plan_id: data.id, user_id: user.id });
      setNewPlanName("");
      await loadPlans();
      openPlan(data);
    }
    setCreating(false);
  }

  async function openPlan(plan) {
    const { data: freshPlan } = await supabase.from("plans").select("*").eq("id", plan.id).single();
    setSelectedPlan(freshPlan || plan);
    const { data: members } = await supabase.from("plan_members").select("user_id").eq("plan_id", plan.id);
    const memberIds = (members || []).map(m => m.user_id);
    const { data: profiles } = await supabase.from("profiles").select("id, username, email").in("id", memberIds);
    setPlanMembers(profiles || []);
    const { data: favs } = await supabase.from("favorites").select("*, profiles(username, email)").in("user_id", memberIds);
    setMemberFavorites(favs || []);
    const { data: places } = await supabase.from("plan_places").select("*").eq("plan_id", plan.id);
    setPlanPlaces(places || []);
    setInviteMsg(""); setLinkCopied(false);
  }

  async function inviteByEmail() {
    setInviteMsg("");
    if (!inviteEmail.trim()) return;
    const { data: profile } = await supabase.from("profiles").select("id").eq("email", inviteEmail.trim()).single();
    if (!profile) { setInviteMsg("❌ No RUMBO account found with that email."); return; }
    if (planMembers.find(m => m.id === profile.id)) { setInviteMsg("⚠️ Already in this plan!"); return; }
    await supabase.from("plan_members").insert({ plan_id: selectedPlan.id, user_id: profile.id });
    setInviteMsg("✅ Friend added!");
    setInviteEmail("");
    openPlan(selectedPlan);
  }

  function copyInviteLink() {
    const link = `${window.location.origin}?join=${selectedPlan.invite_token}`;
    navigator.clipboard.writeText(link).then(() => { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 3000); });
  }

  async function joinByToken() {
    setJoinMsg("");
    if (!joinToken.trim()) return;
    const token = joinToken.trim().includes("?join=") ? joinToken.trim().split("?join=")[1] : joinToken.trim();
    const { data: plan } = await supabase.from("plans").select("*").eq("invite_token", token).single();
    if (!plan) { setJoinMsg("❌ Invalid invite code."); return; }
    const { data: existing } = await supabase.from("plan_members").select("user_id").eq("plan_id", plan.id).eq("user_id", user.id).single();
    if (existing) { setJoinMsg("⚠️ Already in this plan!"); return; }
    await supabase.from("plan_members").insert({ plan_id: plan.id, user_id: user.id });
    setJoinMsg("✅ Joined!");
    setJoinToken("");
    await loadPlans();
    setTimeout(() => { openPlan(plan); setJoinMsg(""); }, 800);
  }

  async function removePlanPlace(id) {
    await supabase.from("plan_places").delete().eq("id", id);
    setPlanPlaces(p => p.filter(pl => pl.id !== id));
  }

  const inp = { padding:"10px 14px", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.07)", color:"white", fontSize:"14px", outline:"none", width:"100%", boxSizing:"border-box" };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", display:"flex", justifyContent:"flex-end" }} onClick={onClose}>
      <div style={{ width:"100%", maxWidth:"480px", height:"100%", background:"#0F2747", overflowY:"auto", borderLeft:"1px solid rgba(212,169,106,0.2)", boxShadow:"-20px 0 60px rgba(0,0,0,0.4)", display:"flex", flexDirection:"column" }} onClick={e=>e.stopPropagation()}>

        <div style={{ padding:"28px 24px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", color:"#F7F4EE", fontWeight:700 }}>
                {selectedPlan ? `📋 ${selectedPlan.name}` : "🗺️ Crew Plans"}
              </div>
              <div style={{ fontSize:"12px", color:"rgba(212,169,106,0.6)", marginTop:"2px" }}>
                {selectedPlan ? "Your crew's plan" : "Plan adventures together"}
              </div>
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              {selectedPlan && (
                <button onClick={() => { setSelectedPlan(null); setPlanMembers([]); setMemberFavorites([]); setPlanPlaces([]); }} style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"rgba(255,255,255,0.6)", padding:"6px 14px", borderRadius:"20px", cursor:"pointer", fontSize:"13px" }}>← Back</button>
              )}
              <button onClick={onClose} style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"rgba(255,255,255,0.5)", width:"32px", height:"32px", borderRadius:"50%", cursor:"pointer", fontSize:"16px" }}>✕</button>
            </div>
          </div>
        </div>

        <div style={{ flex:1, padding:"20px 24px", overflowY:"auto" }}>
          {!selectedPlan ? (
            <>
              <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(212,169,106,0.2)", borderRadius:"12px", padding:"16px", marginBottom:"14px" }}>
                <div style={{ fontSize:"11px", color:"rgba(212,169,106,0.6)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"10px" }}>✦ Create New Plan</div>
                <div style={{ display:"flex", gap:"8px" }}>
                  <input placeholder="e.g. Friday Night in Malasaña" value={newPlanName} onChange={e=>setNewPlanName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createPlan()} style={inp}/>
                  <button onClick={createPlan} disabled={creating||!newPlanName.trim()} style={{ padding:"10px 16px", borderRadius:"8px", border:"none", background:"#D4A96A", color:"#0F2747", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", opacity:creating||!newPlanName.trim()?0.5:1 }}>
                    {creating?"...":"Create ⚓"}
                  </button>
                </div>
              </div>

              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"16px", marginBottom:"20px" }}>
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"10px" }}>🔗 Join with Invite Code</div>
                <div style={{ display:"flex", gap:"8px" }}>
                  <input placeholder="Paste code here" value={joinToken} onChange={e=>setJoinToken(e.target.value)} onKeyDown={e=>e.key==="Enter"&&joinByToken()} style={inp}/>
                  <button onClick={joinByToken} disabled={!joinToken.trim()} style={{ padding:"10px 16px", borderRadius:"8px", border:"none", background:"rgba(255,255,255,0.1)", color:"white", fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", opacity:!joinToken.trim()?0.4:1 }}>Join</button>
                </div>
                {joinMsg && <div style={{ marginTop:"8px", fontSize:"13px", color:joinMsg.startsWith("✅")?"#51cf66":joinMsg.startsWith("⚠️")?"#ffd54f":"#ff6b6b" }}>{joinMsg}</div>}
              </div>

              {loading ? (
                <div style={{ color:"rgba(255,255,255,0.3)", textAlign:"center", padding:"40px 0" }}>Loading plans...</div>
              ) : plans.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0" }}>
                  <div style={{ fontSize:"40px", marginBottom:"12px" }}>🏴‍☠️</div>
                  <div style={{ color:"rgba(255,255,255,0.3)", fontSize:"14px" }}>No plans yet.<br/>Create one and invite your crew!</div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  <div style={{ fontSize:"11px", color:"rgba(212,169,106,0.5)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"4px" }}>{plans.length} plan{plans.length!==1?"s":""}</div>
                  {plans.map(plan => (
                    <div key={plan.id} style={{ display:"flex", gap:"8px" }}>
                      <button onClick={()=>openPlan(plan)} style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", padding:"16px", cursor:"pointer", textAlign:"left", color:"inherit", transition:"all 0.2s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.09)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
                        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"16px", color:"#F7F4EE", marginBottom:"4px" }}>📋 {plan.name}</div>
                        <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)" }}>{new Date(plan.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</div>
                      </button>
                      <button onClick={async()=>{ if(!window.confirm("Delete this plan?")) return; await supabase.from("plan_members").delete().eq("plan_id",plan.id); await supabase.from("plans").delete().eq("id",plan.id).eq("created_by",user.id); loadPlans(); }} style={{ background:"rgba(255,80,80,0.08)", border:"1px solid rgba(255,80,80,0.2)", borderRadius:"12px", padding:"0 14px", cursor:"pointer", color:"rgba(255,100,100,0.7)", fontSize:"18px", flexShrink:0 }}>🗑</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Invite link */}
              <div style={{ background:"rgba(212,169,106,0.08)", border:"1px solid rgba(212,169,106,0.25)", borderRadius:"12px", padding:"14px", marginBottom:"12px" }}>
                <div style={{ fontSize:"11px", color:"rgba(212,169,106,0.7)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"10px" }}>🔗 Invite Link</div>
                <div style={{ display:"flex", gap:"8px" }}>
                  <div style={{ flex:1, background:"rgba(0,0,0,0.2)", borderRadius:"8px", padding:"8px 12px", fontSize:"12px", color:"rgba(255,255,255,0.4)", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                    {selectedPlan.invite_token?`rumbo.app?join=${selectedPlan.invite_token}`:"Generating..."}
                  </div>
                  <button onClick={copyInviteLink} style={{ padding:"8px 14px", borderRadius:"8px", border:"none", background:linkCopied?"#51cf66":"#D4A96A", color:"#0F2747", fontWeight:700, cursor:"pointer", fontSize:"13px", transition:"all 0.2s" }}>
                    {linkCopied?"✓ Copied!":"Copy"}
                  </button>
                </div>
              </div>

              {/* Invite by email */}
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"14px", marginBottom:"12px" }}>
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"10px" }}>📧 Invite by Email</div>
                <div style={{ display:"flex", gap:"8px" }}>
                  <input type="email" placeholder="friend@email.com" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&inviteByEmail()} style={inp}/>
                  <button onClick={inviteByEmail} style={{ padding:"10px 14px", borderRadius:"8px", border:"none", background:"rgba(255,255,255,0.1)", color:"white", fontWeight:600, cursor:"pointer" }}>Add</button>
                </div>
                {inviteMsg && <div style={{ marginTop:"8px", fontSize:"13px", color:inviteMsg.startsWith("✅")?"#51cf66":inviteMsg.startsWith("⚠️")?"#ffd54f":"#ff6b6b" }}>{inviteMsg}</div>}
              </div>

              {/* Members */}
              <div style={{ marginBottom:"16px" }}>
                <div style={{ fontSize:"11px", color:"rgba(212,169,106,0.5)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px" }}>👥 Crew ({planMembers.length})</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                  {planMembers.map(member => (
                    <div key={member.id} style={{ display:"flex", alignItems:"center", gap:"6px", background:"rgba(255,255,255,0.06)", borderRadius:"20px", padding:"5px 12px 5px 8px" }}>
                      <span style={{ fontSize:"14px" }}>{member.id===user.id?"🏴‍☠️":"👤"}</span>
                      <span style={{ color:"#F7F4EE", fontSize:"13px" }}>{member.username||member.email?.split("@")[0]}{member.id===user.id?" (you)":""}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan places */}
              <div style={{ marginBottom:"16px" }}>
                <div style={{ fontSize:"11px", color:"rgba(212,169,106,0.5)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px" }}>📍 Plan Places ({planPlaces.length})</div>
                {planPlaces.length === 0 ? (
                  <div style={{ background:"rgba(255,255,255,0.04)", border:"1px dashed rgba(255,255,255,0.1)", borderRadius:"12px", padding:"24px", textAlign:"center" }}>
                    <div style={{ fontSize:"28px", marginBottom:"8px" }}>🗺️</div>
                    <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"13px", marginBottom:"12px" }}>No places added yet.<br/>Search for places and hit <strong style={{color:"#D4A96A"}}>+</strong> to add them here.</div>
                    <button onClick={onClose} style={{ background:"#D4A96A", color:"#0F2747", border:"none", borderRadius:"20px", padding:"8px 20px", cursor:"pointer", fontSize:"13px", fontWeight:700 }}>
                      🧭 Find Places
                    </button>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                    {planPlaces.map(place => (
                      <div key={place.id} style={{ display:"flex", gap:"10px", alignItems:"center", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", padding:"10px 12px" }}>
                        {place.place_photo && <img src={place.place_photo} style={{ width:"48px", height:"48px", borderRadius:"8px", objectFit:"cover" }}/>}
                        <div style={{ flex:1 }}>
                          <div style={{ color:"#F7F4EE", fontSize:"14px", fontFamily:"'Playfair Display',serif" }}>{place.place_name}</div>
                          {place.place_address && <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"12px" }}>📍 {place.place_address}</div>}
                        </div>
                        <button onClick={()=>removePlanPlace(place.id)} style={{ background:"none", border:"none", color:"rgba(255,80,80,0.5)", cursor:"pointer", fontSize:"16px", padding:"4px" }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Crew favorites */}
              <div>
                <div style={{ fontSize:"11px", color:"rgba(212,169,106,0.5)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px" }}>❤️ Crew Favorites ({memberFavorites.length})</div>
                {memberFavorites.length === 0 ? (
                  <div style={{ color:"rgba(255,255,255,0.3)", fontSize:"13px", textAlign:"center", padding:"16px 0" }}>No favorites saved yet by crew.</div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                    {memberFavorites.map(fav => (
                      <div key={fav.id} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", overflow:"hidden" }}>
                        {fav.place_photo && <img src={fav.place_photo} alt={fav.place_name} style={{ width:"100%", height:"80px", objectFit:"cover", filter:"brightness(0.85)" }}/>}
                        <div style={{ padding:"10px 12px" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"14px", color:"#F7F4EE" }}>{fav.place_name}</div>
                            <span style={{ fontSize:"11px", color:"rgba(212,169,106,0.7)", marginLeft:"8px", background:"rgba(212,169,106,0.1)", padding:"2px 8px", borderRadius:"10px", whiteSpace:"nowrap" }}>
                              {fav.profiles?.username||fav.profiles?.email?.split("@")[0]}
                            </span>
                          </div>
                          {fav.place_address && <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>📍 {fav.place_address}</div>}
                          <a href={`https://maps.google.com/?q=${encodeURIComponent((fav.place_name||"")+" "+(fav.place_address||""))}`} target="_blank" rel="noopener noreferrer" style={{ display:"block", marginTop:"8px", padding:"5px 0", borderRadius:"6px", textAlign:"center", background:"rgba(212,169,106,0.12)", color:"#D4A96A", fontSize:"12px", fontWeight:600, textDecoration:"none" }}>⚓ View on Maps</a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
  const [description, setDescription] = useState("");
  const [selectedBarrio, setBarrio]   = useState(null);
  const [selectedRoles, setRoles]     = useState([]);
  const [bounties, setBounties]       = useState([]);
  const [preferences, setPrefs]       = useState(null);
  const [sessionKey, setSession]      = useState(null);
  const [error, setError]             = useState("");
  const [location, setLocation]       = useState(null);
  const [visibleCards, setVisible]    = useState([]);
  const [copied, setCopied]           = useState(false);
  const [scanMsg, setScanMsg]         = useState(SCAN_MESSAGES[0]);
  const [swappingId, setSwapping]     = useState(null);
  const [reactions, setReactions]     = useState(null);
  const [showShare, setShowShare]     = useState(false);

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
    const desc = descOverride ?? description;
    const barrio = barrioOverride !== undefined ? barrioOverride : selectedBarrio;
    if (!desc.trim() && selectedRoles.length === 0) return;
    setError(""); setScreen("hunting"); setReactions(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    const coords = barrio && !barrio.surprise ? { lat: barrio.lat, lng: barrio.lng } : location || MADRID_CENTER;
    const roleLabels = selectedRoles.map(id => CREW_ROLES.find(r => r.id === id)?.label).filter(Boolean);
    const fullDesc = desc.trim() || `A crew with these roles: ${roleLabels.join(", ")}`;
    try {
      const res = await fetch(`${API}/api/hunt`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: fullDesc, lat: coords.lat, lng: coords.lng, roles: roleLabels }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");
      const prefs = data.preferences;
      setBounties(data.bounties || []);
      setPrefs(prefs);
      setSession(data.session_key);
      setScreen("reveal");

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
      setError(e.message); setScreen("brief");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  async function swapBounty(rejectedId) {
    if (!sessionKey) return;
    setSwapping(rejectedId);
    const currentIds = bounties.map(b => b.place_id);
    try {
      const res = await fetch(`${API}/api/swap`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rejected_place_id: rejectedId, current_place_ids: currentIds, session_key: sessionKey }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No replacement");
      const idx = bounties.findIndex(b => b.place_id === rejectedId);
      setBounties(p => p.map(b => b.place_id === rejectedId ? data.bounty : b));
      setVisible(p => p.filter(i => i !== idx));
      setTimeout(() => setVisible(p => [...p, idx]), 200);
    } catch (e) { setError(e.message); }
    finally { setSwapping(null); }
  }

  function reset() {
    setScreen("brief"); setDescription(""); setBounties([]); setPrefs(null);
    setSession(null); setError(""); setVisible([]); setCopied(false);
    setSwapping(null); setReactions(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function restoreFromLog(entry) {
    setBounties(entry.bounties || []);
    setPrefs(entry.preferences || null);
    setDescription(entry.description || "");
    setScreen("reveal");
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => entry.bounties?.forEach((_, i) => setTimeout(() => setVisible(p => [...p, i]), i * 400)), 100);
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
    const { data: memberOf } = await supabase.from("plan_members").select("plan_id").eq("user_id", user.id);
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
    let i = 0; setScanMsg(SCAN_MESSAGES[0]);
    const iv = setInterval(() => { i = (i + 1) % SCAN_MESSAGES.length; setScanMsg(SCAN_MESSAGES[i]); }, 2200);
    return () => clearInterval(iv);
  }, [screen]);

  useEffect(() => {
    if (screen === "reveal" && bounties.length > 0) {
      setVisible([]);
      setTimeout(() => bounties.forEach((_, i) => setTimeout(() => setVisible(p => [...p, i]), i * 500)), 100);
    }
  }, [screen, bounties]);

  function toggleRole(id) { setRoles(p => p.includes(id) ? p.filter(r => r !== id) : [...p, id]); }

  const canSail = description.trim() || selectedRoles.length > 0;

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
          <div style={{
            position: "fixed", inset: 0, zIndex: 0,
            background: "linear-gradient(160deg, #e8f5f7 0%, #d6edf0 20%, #EDE6D4 62%, #e0d8c0 100%)",
            pointerEvents: "none",
          }}/>
          <section className="hero">
            <div style={{ position:"relative", zIndex:1 }}>
              <div className="hero-badge fu fu1">✦ AI-Powered Hidden Gem Finder</div>
              <h1 className="hero-headline fu fu2">
                You tell us your crew.
                <em>We'll find the treasure.</em>
              </h1>
              <p className="hero-sub fu fu3">
                Skip the tourist traps. Get 3 hidden gem spots picked by an AI Pirate that knows Madrid's secret corners.
              </p>

              <div className="input-card fu fu3">
                <label className="input-label">Describe your crew</label>
                <textarea className="input-textarea" value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="e.g. 4 broke students, want something different, not a chain..."
                  rows={3} onKeyDown={e => { if (e.key==="Enter" && e.ctrlKey) startHunt(); }}
                />
                <div style={{ marginTop:"1rem" }}>
                  <span className="chips-label">Pick a neighborhood</span>
                  <div className="chips-row">
                    {BARRIOS.map(b => (
                      <button key={b.name}
                        className={`chip ${b.surprise?"surprise":""} ${selectedBarrio?.name===b.name?"sel":""}`}
                        onClick={()=>setBarrio(selectedBarrio?.name===b.name?null:b)}>
                        {b.name}
                      </button>
                    ))}
                  </div>
                  <span className="chips-label" style={{marginTop:"0.75rem"}}>Who's in your crew?</span>
                  <div className="roles-grid">
                    {CREW_ROLES.map(r => (
                      <button key={r.id} className={`role-chip ${selectedRoles.includes(r.id)?"sel":""}`}
                        onClick={()=>toggleRole(r.id)}>
                        <span className="role-emoji">{r.emoji}</span>
                        <span className="role-name">{r.label}</span>
                        <span className="role-desc">{r.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
                <button className="sail-btn-premium" onClick={() => startHunt()} disabled={!canSail}>
                  <span style={{color:"#D4A96A"}}>🧭</span> FIND MY TREASURES <span style={{color:"#D4A96A",marginLeft:4}}>→</span>
                </button>
                <button className="surprise-btn" onClick={() => setScreen("surprise")}>
                  🎲 Surprise Me — Let the Navigator Decide
                </button>
                <p className="sail-tagline">🗺️ 3 hidden gems · Pirate descriptions · Google Maps links</p>
                {error && <div className="err-box">⚠️ {error}</div>}
              </div>

              <div className="features-bar fu fu4">
                {[["💎","3 hidden gems"],["☠️","Pirate descriptions"],["📍","Google Maps ready"],["✦","AI-powered"]].map(([i,t])=>(
                  <div key={t} className="feat"><span>{i}</span><span>{t}</span></div>
                ))}
              </div>
            </div>

            <div style={{ position:"relative", zIndex:1 }} className="fu fu2">
              <HeroIllustratedPanel />
            </div>
          </section>

          <section className="how-section" id="how">
            <div className="how-inner">
              <h2 className="sec-headline">How RUMBO Works</h2>
              <p className="sec-sub">Discover hidden places in Madrid in under a minute.</p>
              <div className="how-cards">
                {[
                  {icon:"👥",title:"Describe Your Crew",text:"Tell RUMBO who you're with, what mood you're in, and what kind of place you want."},
                  {icon:"🧭",title:"AI Hunts Hidden Gems",text:"Our pirate navigator searches beyond tourist traps to find places locals actually love."},
                  {icon:"💰",title:"Claim Your Bounty",text:"Choose your favourite spot and open it in Google Maps. Swap any result you don't love."},
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
            <h2 className="sec-headline">Popular Treasure Routes</h2>
            <p className="sec-sub" style={{marginBottom:"2.5rem"}}>Explore some of Madrid's favourite local routes.</p>
            <div className="routes-grid">
              {ROUTES_DATA.map(r=>(
                <div key={r.title} className="route-card"
                  onClick={()=>startHunt(r.huntDesc, BARRIOS.find(b=>b.name===r.barrio)||null)}>
                  <div className="route-inner" style={{background:`linear-gradient(135deg,${r.a},${r.b})`}}>
                    <span className="route-badge">{r.badge}</span>
                    <span className="route-emoji">{r.emoji}</span>
                    <div className="route-title">{r.title}</div>
                    <div className="route-meta">{r.meta}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="rope-divider"><span>⚓</span></div>

          <section className="vibe-section" id="vibes">
            <h2 className="sec-headline">Choose Your Vibe</h2>
            <p className="sec-sub">Pick a mood and let the navigator chart your course.</p>
            <div className="vibe-grid">
              {Object.entries(VIBE_THEMES).map(([key,t])=>(
                <div key={key} className="vibe-tile"
                  style={{background:t.isDay?"rgba(250,246,234,0.95)":t.cardBg, border:`1.5px solid ${t.cardBorder}`, color:t.isDay?"#2a1a08":t.textPrimary}}
                  onClick={()=>startHunt(`${t.tagline} Find hidden spots in Madrid matching this vibe.`, null)}>
                  <span className="vibe-tile-icon">{t.icon}</span>
                  <span className="vibe-tile-label" style={{color:t.isDay?"#2a1a08":t.textPrimary}}>{t.label}</span>
                  <span className="vibe-tile-sub" style={{color:t.isDay?"#8a7a5a":t.textMuted}}>{t.tagline}</span>
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
              <MascotSVG size={130} animation="bounce"/>
            </div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(1.6rem,3vw,2.2rem)",color:"#F0DFA0",textAlign:"center",marginBottom:"0.4rem"}}>
              Scanning the Seas of Madrid…
            </h2>
            <p style={{color:"rgba(240,223,160,0.5)",fontStyle:"italic",textAlign:"center",marginBottom:"1.5rem",fontSize:"0.9rem"}}>
              The navigator is charting your course
            </p>
            <div style={{position:"relative",width:88,height:88,margin:"0 auto 1.5rem"}}>
              <div style={{position:"absolute",inset:0,borderRadius:"50%",border:"2px solid rgba(212,169,106,0.35)",animation:"pulseGlow 1.8s ease-in-out infinite"}}/>
              <div style={{position:"absolute",inset:10,borderRadius:"50%",border:"1.5px solid rgba(212,169,106,0.55)",animation:"pulseGlow 1.8s 0.45s ease-in-out infinite"}}/>
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"2.2rem",animation:"compassSpin 5s linear infinite"}}>🧭</div>
            </div>
            <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",color:"rgba(240,223,160,0.8)",fontSize:"1.1rem",textAlign:"center",minHeight:"1.8em",transition:"opacity 0.4s ease",marginBottom:"1.25rem"}}>
              {scanMsg}
            </p>
            <div style={{display:"flex",gap:8,justifyContent:"center"}}>
              {SCAN_MESSAGES.map((msg,i)=>(
                <div key={i} style={{width:8,height:8,borderRadius:"50%",transition:"background 0.4s",background:scanMsg===msg?"#D4A96A":"rgba(212,169,106,0.2)"}}/>
              ))}
            </div>
          </div>
        </div>
      )}

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
            </div>

            {/* Treasure map */}
            <div className="map-wrap wide" style={{ marginBottom:"2rem" }}>
              <RealMap bounties={bounties} theme={theme} center={bounties[0] ? {lat:bounties[0].lat, lng:bounties[0].lng} : null} />
            </div>

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
                  swapping={swappingId===b.place_id} theme={theme}
                  onFavorite={user ? handleFavorite : null}
                  isFavorited={favoritedIds.has(b.place_id)}
                  onAddToPlan={user ? openAddToPlan : null}
                />
              ))}
            </div>

            {error && <div className="err-box" style={{marginBottom:"1rem"}}>⚠️ {error}</div>}

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