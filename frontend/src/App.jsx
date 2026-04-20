import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

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
    <svg viewBox="0 0 600 360" xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%", display: "block" }}>
      <defs>
        <radialGradient id="pgOuter" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#F2E0B0"/><stop offset="65%" stopColor="#E4CC88"/>
          <stop offset="100%" stopColor="#C0A050"/>
        </radialGradient>
        <radialGradient id="pgInner" cx="40%" cy="35%" r="55%">
          <stop offset="0%" stopColor="#FAF0D0" stopOpacity="0.6"/>
          <stop offset="100%" stopColor="#E4CC88" stopOpacity="0"/>
        </radialGradient>
        <linearGradient id="seaL" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a3558" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#0a1e38" stopOpacity="0.9"/>
        </linearGradient>
        <pattern id="dg" x="0" y="0" width="18" height="18" patternUnits="userSpaceOnUse">
          <circle cx="9" cy="9" r="0.6" fill="#8B6914" opacity="0.35"/>
        </pattern>
        <filter id="ss"><feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#5C3D1E" floodOpacity="0.2"/></filter>
        <clipPath id="mc"><rect x="8" y="8" width="584" height="344" rx="10"/></clipPath>
      </defs>
      <rect x="8" y="8" width="584" height="344" rx="10" fill="url(#pgOuter)"/>
      <rect x="8" y="8" width="584" height="344" rx="10" fill="url(#pgInner)"/>
      <rect x="8" y="8" width="584" height="344" rx="10" fill="url(#dg)"/>
      {/* Sea corners */}
      <ellipse cx="590" cy="8" rx="130" ry="100" fill="url(#seaL)" clipPath="url(#mc)" opacity="0.9"/>
      <ellipse cx="10" cy="352" rx="110" ry="80" fill="url(#seaL)" clipPath="url(#mc)" opacity="0.85"/>
      {/* Waves */}
      {[0,1,2,3].map(i=>(
        <path key={i} d={`M${490+i*15},${20+i*8} Q${520+i*15},${16+i*8} ${540+i*15},${20+i*8} Q${560+i*15},${24+i*8} ${580+i*15},${20+i*8}`}
          stroke="#4a7aac" strokeWidth="0.8" fill="none" opacity="0.35" clipPath="url(#mc)"/>
      ))}
      {/* Ship */}
      <g transform="translate(488,18)" clipPath="url(#mc)" filter="url(#ss)">
        <path d="M8,32 Q22,38 38,32 L35,42 Q22,48 11,42 Z" fill="#4A2E10"/>
        <line x1="20" y1="32" x2="20" y2="4" stroke="#4A2E10" strokeWidth="1.8"/>
        <line x1="10" y1="12" x2="32" y2="12" stroke="#4A2E10" strokeWidth="1"/>
        <path d="M20,5 L20,28 L32,22 L32,11 Z" fill="#F0DFA0" stroke="#C8A84B" strokeWidth="0.5" opacity="0.92"/>
        <path d="M20,5 L20,28 L8,22 L10,12 Z" fill="#E8D490" stroke="#C8A84B" strokeWidth="0.5" opacity="0.85"/>
        <line x1="20" y1="4" x2="20" y2="0" stroke="#4A2E10" strokeWidth="0.8"/>
        <path d="M20,0 L27,2 L20,4 Z" fill="#1a1a1a"/>
        <path d="M5,47 Q12,44 22,47 Q32,50 40,47" stroke="#7aaad0" strokeWidth="1" fill="none" opacity="0.5"/>
      </g>
      {/* Small ship */}
      <g transform="translate(14,295)" clipPath="url(#mc)" filter="url(#ss)">
        <path d="M6,22 Q14,26 24,22 L22,28 Q14,32 8,28 Z" fill="#4A2E10"/>
        <line x1="14" y1="22" x2="14" y2="7" stroke="#4A2E10" strokeWidth="1.4"/>
        <path d="M14,8 L14,20 L22,17 L22,12 Z" fill="#F0DFA0" stroke="#C8A84B" strokeWidth="0.4" opacity="0.88"/>
        <path d="M14,8 L14,20 L6,17 L7,12 Z" fill="#E8D490" stroke="#C8A84B" strokeWidth="0.4" opacity="0.8"/>
        <line x1="14" y1="7" x2="14" y2="4" stroke="#4A2E10" strokeWidth="0.7"/>
        <path d="M14,4 L19,5.5 L14,7 Z" fill="#1a1a1a"/>
      </g>
      {/* Palms */}
      <g transform="translate(22,55)" clipPath="url(#mc)">
        <path d="M10,55 Q11,35 12,18" stroke="#6B4520" strokeWidth="2" fill="none"/>
        <ellipse cx="12" cy="20" rx="16" ry="5" fill="#2A5C0A" transform="rotate(-25,12,20)" opacity="0.85"/>
        <ellipse cx="12" cy="18" rx="18" ry="4.5" fill="#3A7A10" transform="rotate(20,12,18)" opacity="0.8"/>
        <ellipse cx="12" cy="19" rx="15" ry="4" fill="#2A5C0A" transform="rotate(-50,12,19)" opacity="0.75"/>
        <circle cx="12" cy="16" r="2.5" fill="#C8A84B" opacity="0.7"/>
      </g>
      <g transform="translate(535,300)" clipPath="url(#mc)">
        <path d="M10,50 Q9,32 8,15" stroke="#6B4520" strokeWidth="1.8" fill="none"/>
        <ellipse cx="8" cy="17" rx="15" ry="4.5" fill="#2A5C0A" transform="rotate(-20,8,17)" opacity="0.8"/>
        <ellipse cx="8" cy="15" rx="17" ry="4" fill="#3A7A10" transform="rotate(25,8,15)" opacity="0.75"/>
        <circle cx="8" cy="14" r="2.2" fill="#C8A84B" opacity="0.65"/>
      </g>
      {/* Compass */}
      <g transform="translate(500,248)">
        <circle cx="36" cy="36" r="34" fill="#E4CC88" opacity="0.5" stroke="#8B6914" strokeWidth="1"/>
        <circle cx="36" cy="36" r="26" fill="none" stroke="#8B6914" strokeWidth="0.6" strokeDasharray="2 3"/>
        <polygon points="36,4 39.5,30 36,36 32.5,30" fill="#5C3D1E" opacity="0.9"/>
        <polygon points="36,68 39.5,42 36,36 32.5,42" fill="#5C3D1E" opacity="0.5"/>
        <polygon points="4,36 30,32.5 36,36 30,39.5" fill="#5C3D1E" opacity="0.5"/>
        <polygon points="68,36 42,32.5 36,36 42,39.5" fill="#5C3D1E" opacity="0.9"/>
        <circle cx="36" cy="36" r="4.5" fill="#8B6914"/>
        <circle cx="36" cy="36" r="2" fill="#F0DFA0"/>
        <text x="36" y="1" textAnchor="middle" fill="#5C3D1E" fontSize="7" fontWeight="bold">N</text>
      </g>
      {/* Map title */}
      <g transform="translate(175,10)">
        <rect x="0" y="0" width="250" height="26" rx="4" fill="#C8A84B" opacity="0.2"/>
        <rect x="0" y="0" width="250" height="26" rx="4" fill="none" stroke="#8B6914" strokeWidth="0.8"/>
        <text x="125" y="17" textAnchor="middle" fill="#4A2E10" fontSize="10" fontWeight="bold" letterSpacing="3">MAPA SECRETO DE MADRID</text>
      </g>
      {/* Neighborhoods */}
      {neighborhoods.map(n=>(
        <g key={n.name} transform={`translate(${n.x/100*568+16},${n.y/100*328+16})`}>
          <circle cx="0" cy="0" r="2.8" fill="#8B6914" opacity="0.45"/>
          <text x="5" y="4" fill="#4A2E10" fontSize="6.5" opacity="0.6" fontStyle="italic">{n.name}</text>
        </g>
      ))}
      {/* Route lines */}
      {xMarks.length>1 && xMarks.map((m,i)=>{
        if(i===0) return null;
        const prev=xMarks[i-1];
        const x1=prev.x/100*568+16, y1=prev.y/100*328+16;
        const x2=m.x/100*568+16, y2=m.y/100*328+16;
        const mx=(x1+x2)/2+(y2-y1)*0.15, my=(y1+y2)/2-(x2-x1)*0.1;
        return <path key={i} d={`M${x1},${y1} Q${mx},${my} ${x2},${y2}`}
          stroke="#8B2020" strokeWidth="1.8" strokeDasharray="7 5" fill="none" opacity="0.75"/>;
      })}
      {/* X marks */}
      {xMarks.map(m=>{
        const cx=m.x/100*568+16, cy=m.y/100*328+16;
        return (
          <g key={m.index} transform={`translate(${cx},${cy})`} filter="url(#ss)">
            <circle cx="0" cy="0" r="16" fill="#8B2020" opacity="0.15"/>
            <line x1="-9" y1="-9" x2="9" y2="9" stroke="#8B2020" strokeWidth="3" strokeLinecap="round"/>
            <line x1="9" y1="-9" x2="-9" y2="9" stroke="#8B2020" strokeWidth="3" strokeLinecap="round"/>
            <circle cx="12" cy="-12" r="8" fill="#8B2020"/>
            <text x="12" y="-12" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="8" fontWeight="bold">{m.index}</text>
            <rect x="-38" y="14" width="76" height="16" rx="4" fill="#0F2747" opacity="0.8"/>
            <text x="0" y="23" textAnchor="middle" dominantBaseline="middle" fill="#F0DFA0" fontSize="6.5">{(m.label||"").slice(0,20)}</text>
          </g>
        );
      })}
      {/* Scan pulse */}
      {scanning && (
        <g transform="translate(300,180)">
          {[0,1,2].map(i=>{
            const r=20+((pulse+i*20)%60)*3.5;
            const op=Math.max(0,1-((pulse+i*20)%60)/60);
            return <circle key={i} cx="0" cy="0" r={r} fill="none" stroke="#C8A84B" strokeWidth="1.5" opacity={op}/>;
          })}
          <circle cx="0" cy="0" r="7" fill="#C8A84B" opacity="0.9"/>
          <circle cx="0" cy="0" r="3.5" fill="#F0DFA0"/>
        </g>
      )}
      {/* Border */}
      <rect x="8" y="8" width="584" height="344" rx="10" fill="none" stroke="#8B6914" strokeWidth="2.5" opacity="0.7"/>
      <rect x="14" y="14" width="572" height="332" rx="8" fill="none" stroke="#8B6914" strokeWidth="0.6" opacity="0.4"/>
      {[[8,8],[592,8],[8,352],[592,352]].map(([x,y],i)=>(
        <g key={i}>
          <line x1={x+(i%2===0?2:-2)} y1={y} x2={x+(i%2===0?18:-18)} y2={y} stroke="#8B6914" strokeWidth="2.5" opacity="0.6"/>
          <line x1={x} y1={y+(i<2?2:-2)} x2={x} y2={y+(i<2?18:-18)} stroke="#8B6914" strokeWidth="2.5" opacity="0.6"/>
        </g>
      ))}
    </svg>
  );
};

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
    <div style={{
      background: t.cardBg || "rgba(255,255,255,0.07)",
      border: `1px solid ${t.cardBorder || "rgba(255,255,255,0.12)"}`,
      borderRadius: 16,
      overflow: "hidden",
      opacity: visible ? 1 : 0,
      transform: visible ? "translateY(0)" : "translateY(24px)",
      transition: "0.5s",
    }}>
      <div style={{ padding: "1.25rem 1.5rem" }}>
        <div style={{ display:"flex", justifyContent:"space-between" }}>
          <div>{bounty.pirate_name}</div>

          <div style={{ display:"flex", gap:"6px" }}>
            {onFavorite && (
              <button onClick={() => onFavorite(bounty)}>
                {isFavorited ? "❤️" : "🤍"}
              </button>
            )}

            {onAddToPlan && (
              <button onClick={handleAddToPlan}>
                {addMsg ? "✓" : "+"}
              </button>
            )}
          </div>
        </div>

        <div>{bounty.name}</div>

        <div style={{ marginTop: 10 }}>
          <a href={bounty.maps_url} target="_blank">
            Open in Maps
          </a>

          <button onClick={() => onSwap(bounty.place_id)}>
            Swap
          </button>
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
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
  @keyframes sunPulse { 0%,100%{box-shadow:0 0 60px 20px rgba(255,220,80,0.4)} 50%{box-shadow:0 0 80px 30px rgba(255,220,80,0.55)} }
  .fu { animation:fadeUp 0.6s ease forwards; opacity:0; }
  .fu1{animation-delay:0.1s} .fu2{animation-delay:0.25s} .fu3{animation-delay:0.4s} .fu4{animation-delay:0.55s}

  @media (max-width:900px) {
    .hero { grid-template-columns:1fr; padding:5rem 1.5rem 2rem; gap:2rem; }
    .how-cards { grid-template-columns:1fr; }
    .routes-grid { grid-template-columns:repeat(2,1fr); }
    .navbar { padding:0 1.5rem; }
    .nav-links { display:none; }
    .reveal-wrap { padding:90px 1.25rem 3rem; }
    .hunting-wrap { padding:90px 1.25rem 3rem; }
    .how-section,.routes-section { padding:4rem 1.5rem; }
  }
  @media (max-width:600px) { .routes-grid { grid-template-columns:1fr; } }
`;

const ROUTES_DATA = [
  { title:"Hidden Cafés in Malasaña", badge:"Local Favorite", emoji:"☕", a:"#1a3a6a", b:"#0F2747", meta:"12 gems · Malasaña" },
  { title:"Rooftop Night in Salamanca", badge:"Night Out", emoji:"🌙", a:"#1a4a3a", b:"#0d2a20", meta:"8 gems · Salamanca" },
  { title:"Cheap Eats in Chamberí", badge:"Student Pick", emoji:"🍺", a:"#4a2a1a", b:"#2a1208", meta:"15 gems · Chamberí" },
  { title:"Romantic Spots in La Latina", badge:"Date Night", emoji:"🌹", a:"#3a1a4a", b:"#1a0a28", meta:"10 gems · La Latina" },
  { title:"Local Markets & Bookstores", badge:"Off the Map", emoji:"📚", a:"#3a3010", b:"#1a1a08", meta:"9 gems · Centro" },
  { title:"Secret Cocktail Bars in Chueca", badge:"Hidden Gem", emoji:"🍸", a:"#0d3a40", b:"#061e22", meta:"11 gems · Chueca" },
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
function PlansPanel({ user, onClose, onAddToPlan, bounties, onGoToBrief }) {
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
  const [sharingWhatsApp, setSharingWhatsApp] = useState(false);
  const [planMsg, setPlanMsg] = useState("");

  function buildInviteToken() {
    return `plan-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-4)}`;
  }

  useEffect(() => { loadPlans(); }, []);

  async function loadPlans() {
    setLoading(true);
    const { data: memberOf, error: memberErr } = await supabase
      .from("plan_members")
      .select("plan_id")
      .eq("user_id", user.id);

    // Fallback: if plan_members policies are broken, at least show plans you created.
    if (memberErr) {
      const { data: owned } = await supabase
        .from("plans")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });
      setPlans(owned || []);
      setLoading(false);
      return;
    }

    const ids = (memberOf || []).map(m => m.plan_id);
    if (!ids.length) {
      const { data: owned } = await supabase
        .from("plans")
        .select("*")
        .eq("created_by", user.id)
        .order("created_at", { ascending: false });
      setPlans(owned || []);
      setLoading(false);
      return;
    }

    const { data } = await supabase.from("plans").select("*").in("id", ids).order("created_at", { ascending: false });
    setPlans(data || []);
    setLoading(false);
  }

  async function createPlan() {
    if (!newPlanName.trim()) return;
    setCreating(true);
    setPlanMsg("");
    const invite_token = buildInviteToken();
    // Use minimal insert first to avoid select-policy recursion on insert response.
    const { error: insertErr } = await supabase
      .from("plans")
      .insert({ name: newPlanName.trim(), created_by: user.id, invite_token });

    if (insertErr) {
      setPlanMsg(`❌ Could not create plan: ${insertErr.message || "unknown error"}`);
      setCreating(false);
      return;
    }

    // Try to resolve the created plan row (fallback to owned list if policies are restrictive).
    let createdPlan = null;
    const { data: createdRows } = await supabase
      .from("plans")
      .select("*")
      .eq("created_by", user.id)
      .eq("name", newPlanName.trim())
      .order("created_at", { ascending: false })
      .limit(1);

    if (createdRows?.length) {
      createdPlan = createdRows[0];
      if (!createdPlan.invite_token) {
        await supabase.from("plans").update({ invite_token }).eq("id", createdPlan.id);
        createdPlan = { ...createdPlan, invite_token };
      }
    }

    // Best-effort member insert; can fail if RLS policies recurse.
    if (createdPlan?.id) {
      await supabase.from("plan_members").insert({ plan_id: createdPlan.id, user_id: user.id });
    }

    setNewPlanName("");
    await loadPlans();

    if (createdPlan) {
      await openPlan(createdPlan);
      setPlanMsg("");
    } else {
      setPlanMsg("⚠️ Plan created. Refresh the list if it doesn't appear immediately.");
    }
    setCreating(false);
  }

  async function openPlan(plan) {
    const { data: freshPlan } = await supabase.from("plans").select("*").eq("id", plan.id).single();
    setSelectedPlan(freshPlan || plan);
    const { data: members, error: membersErr } = await supabase.from("plan_members").select("user_id").eq("plan_id", plan.id);
    const memberIds = (members || []).map(m => m.user_id);

    if (membersErr || memberIds.length === 0) {
      setPlanMembers([{ id: user.id, username: user.email?.split("@")[0], email: user.email }]);
      const { data: favs } = await supabase.from("favorites").select("*, profiles(username, email)").eq("user_id", user.id);
      setMemberFavorites(favs || []);
    } else {
      const { data: profiles } = await supabase.from("profiles").select("id, username, email").in("id", memberIds);
      setPlanMembers(profiles || []);
      const { data: favs } = await supabase.from("favorites").select("*, profiles(username, email)").in("user_id", memberIds);
      setMemberFavorites(favs || []);
    }

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
    const code = selectedPlan.invite_token || selectedPlan.id;
    const link = `${window.location.origin}?join=${code}`;
    navigator.clipboard.writeText(link).then(() => { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 3000); });
  }

  function shareInviteWhatsApp() {
    if (!selectedPlan) return;
    const code = selectedPlan.invite_token || selectedPlan.id;
    const link = `${window.location.origin}?join=${code}`;
    const msg = encodeURIComponent(`Join my RUMBO plan "${selectedPlan.name}" ⚓\n${link}`);
    setSharingWhatsApp(true);
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer");
    setTimeout(() => setSharingWhatsApp(false), 2000);
  }

  async function joinByToken() {
    setJoinMsg("");
    if (!joinToken.trim()) return;
    const cleanToken = joinToken.trim().replace(/^.*join=/, "").trim();
    const { data: plan } = await supabase
      .from("plans")
      .select("*")
      .or(`invite_token.eq.${cleanToken},id.eq.${cleanToken}`)
      .single();
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
                {planMsg && <div style={{ marginTop:"8px", fontSize:"13px", color:planMsg.startsWith("❌")?"#ff6b6b":"#ffd54f" }}>{planMsg}</div>}
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
                    <button key={plan.id} onClick={()=>openPlan(plan)} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", padding:"16px", cursor:"pointer", textAlign:"left", color:"inherit", width:"100%", transition:"all 0.2s" }}
                      onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.09)"}
                      onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"16px", color:"#F7F4EE", marginBottom:"4px" }}>📋 {plan.name}</div>
                      <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)" }}>{new Date(plan.created_at).toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})}</div>
                    </button>
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
                    {`rumbo.app?join=${selectedPlan.invite_token || selectedPlan.id}`}
                  </div>
                  <button onClick={copyInviteLink} style={{ padding:"8px 14px", borderRadius:"8px", border:"none", background:linkCopied?"#51cf66":"#D4A96A", color:"#0F2747", fontWeight:700, cursor:"pointer", fontSize:"13px", transition:"all 0.2s" }}>
                    {linkCopied?"✓ Copied!":"Copy"}
                  </button>
                  <button onClick={shareInviteWhatsApp} style={{ padding:"8px 12px", borderRadius:"8px", border:"none", background:sharingWhatsApp?"#51cf66":"rgba(255,255,255,0.12)", color:"white", fontWeight:700, cursor:"pointer", fontSize:"13px", transition:"all 0.2s" }}>
                    {sharingWhatsApp ? "✓" : "WhatsApp"}
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
                    <button onClick={() => { onClose(); onGoToBrief?.(); }} style={{ background:"#D4A96A", color:"#0F2747", border:"none", borderRadius:"20px", padding:"8px 20px", cursor:"pointer", fontSize:"13px", fontWeight:700 }}>
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

  function toggleRole(roleId) {
  setRoles(prev =>
    prev.includes(roleId)
      ? prev.filter(r => r !== roleId)
      : [...prev, roleId]
  );
  }
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

  useEffect(() => {
    if (!user) {
      setFavoritedIds(new Set());
      return;
    }
    let active = true;
    supabase
      .from("favorites")
      .select("place_id")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!active) return;
        setFavoritedIds(new Set((data || []).map(row => row.place_id)));
      });
    return () => { active = false; };
  }, [user]);

  function getCoords() {
    if (!selectedBarrio) return location || MADRID_CENTER;
    if (selectedBarrio.surprise) return MADRID_CENTER;
    return { lat: selectedBarrio.lat, lng: selectedBarrio.lng };
  }

  async function startHunt() {
    if (!description.trim() && selectedRoles.length === 0) return;
    setError(""); setScreen("hunting"); setReactions(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
    const coords = getCoords();
    const roleLabels = selectedRoles.map(id => CREW_ROLES.find(r => r.id === id)?.label).filter(Boolean);
    const fullDesc = description.trim() || `A crew with these roles: ${roleLabels.join(", ")}`;
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

      // Save to treasure log
      saveLog({
        description: fullDesc, vibe: prefs?.vibe,
        barrio: selectedBarrio?.name, bounties: data.bounties,
        preferences: prefs,
      });

      // Fetch crew reactions in background
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
    if (!user) return;
    const params = new URLSearchParams(window.location.search);
    const joinCode = params.get("join");
    if (!joinCode) return;

    let cancelled = false;
    (async () => {
      const { data: plan } = await supabase
        .from("plans")
        .select("*")
        .or(`invite_token.eq.${joinCode},id.eq.${joinCode}`)
        .single();
      if (!plan || cancelled) return;

      const { data: existing } = await supabase
        .from("plan_members")
        .select("user_id")
        .eq("plan_id", plan.id)
        .eq("user_id", user.id)
        .single();

      if (!existing) {
        await supabase.from("plan_members").insert({ plan_id: plan.id, user_id: user.id });
      }
      if (!cancelled) setShowPlans(true);
    })();

    return () => { cancelled = true; };
  }, [user]);

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
            background: "linear-gradient(160deg, #F7F4EE 0%, #EDE6D4 60%, #e0d8c0 100%)",
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
                <button className="sail-btn" onClick={startHunt} disabled={!canSail}>
                  <span className="sail-gold">🧭</span> FIND MY TREASURES <span className="sail-gold">→</span>
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
              <div className="map-wrap tall">
                <TreasureMapSVG bounties={[]} scanning={false}/>
              </div>
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
                  onClick={()=>{setDescription(r.title);window.scrollTo({top:0,behavior:"smooth"});}}>
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

          <footer className="footer">Made with ⚓ by <strong>Pirates</strong> · RUMBO © 2025 · Google Hackathon</footer>
        </div>
      )}

      {/* ===== HUNTING SCREEN ===== */}
      {screen === "hunting" && (
        <div style={{ position:"relative", ...revealPageStyle }}>
          <div style={{
            position:"fixed", inset:0, zIndex:0,
            background:"linear-gradient(180deg,#0a0418 0%,#1a0630 40%,#2d0a4e 70%,#1a0a20 100%)",
            pointerEvents:"none",
          }}>
            <svg style={{position:"absolute",inset:0,width:"100%",height:"100%"}}>
              {Array.from({length:80},(_,i)=>(
                <circle key={i} cx={`${(Math.sin(i*137.5)*0.5+0.5)*100}%`}
                  cy={`${(Math.cos(i*97.3)*0.5+0.5)*60}%`}
                  r={0.5+(i%4)*0.3} fill="white" opacity={0.2+(i%5)*0.1}/>
              ))}
            </svg>
          </div>
          <div className="hunting-wrap">
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"2rem",color:"#F0DFA0",textAlign:"center"}}>
              Scanning the Seas of Madrid…
            </h2>
            <p style={{color:"rgba(240,223,160,0.6)",fontStyle:"italic",textAlign:"center",marginTop:"-1.5rem"}}>
              The navigator is charting your course
            </p>
            <div className="map-wrap tall" style={{width:"100%"}}>
              <TreasureMapSVG bounties={[]} scanning={true}/>
            </div>
            <p style={{fontFamily:"'Crimson Text',serif",fontStyle:"italic",color:"rgba(240,223,160,0.7)",fontSize:"1rem",textAlign:"center"}}>
              {scanMsg}
            </p>
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
            <div className="map-wrap wide" style={{ marginBottom:"2rem", filter: theme?.mapFilter || "none" }}>
              <TreasureMapSVG bounties={bounties} scanning={false}/>
            </div>

            {/* Vibe meter */}
            <div style={{ color: theme?.textPrimary || "white" }}>
              <VibeMeter preferences={preferences}/>
            </div>

            {/* Treasure log */}
            <div style={{ color: theme?.textPrimary || "white" }}>
              <TreasureLog onSelect={restoreFromLog} theme={theme}/>
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
            </div>

            {error && (
              <div className="err-box" style={{marginBottom:"1rem"}}>
                ⚠️ {error}
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
          </div>
          {showShare && (
            <ShareCard
              bounties={bounties}
              preferences={preferences}
              theme={theme}
              onClose={() => setShowShare(false)}
            />
          )}
        </div>
      )}
      {showProfile && <ProfilePanel user={user} onClose={() => setShowProfile(false)} />}
      {showPlans && (
        <PlansPanel
          user={user}
          onClose={() => setShowPlans(false)}
          onAddToPlan={addBountyToPlan}
          bounties={bounties}
          onGoToBrief={() => setScreen("brief")}
        />
      )}
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