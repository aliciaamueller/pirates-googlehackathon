import { useState, useEffect, useRef } from "react";
import { VIBE_THEMES } from "../constants";

// ─── ANIMATED SKY BACKGROUND ──────────────────────────────────────
export const SkyBackground = ({ vibe }) => {
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

export default SkyBackground;
