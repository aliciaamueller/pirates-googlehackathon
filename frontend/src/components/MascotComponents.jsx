import { useId, useRef } from "react";

// ─── MASCOT ───────────────────────────────────────────────────────
export const MascotSVG = ({ size = 140, animation = "float", style: extraStyle = {} }) => (
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

/** Three themed mascot chests (wood + bicorne + skull) — matches hero mascot language */
export function TreasureChestMascot({ variant = "feast", selected = false, animationDelay = "0s" }) {
  const uid = useId().replace(/:/g, "");
  const T = {
    feast: { w1: "#4A2A0A", w2: "#2a1506", gold: "#C8A84B", hat: "#0d1a2e", seam: "#2a1506" },
    culture: { w1: "#2a4a52", w2: "#1a3038", gold: "#6ab4c4", hat: "#0a1f28", seam: "#1a3038" },
    moonlight: { w1: "#4a3258", w2: "#2a1838", gold: "#b894d4", hat: "#1a0a28", seam: "#2a1838" },
    surprise: { w1: "#2a1a00", w2: "#150e00", gold: "#F0C040", hat: "#0a0800", seam: "#3a2a00" },
  }[variant] || {
    w1: "#4A2A0A",
    w2: "#2a1506",
    gold: "#C8A84B",
    hat: "#0d1a2e",
    seam: "#2a1506",
  };
  const gid = `wood-${uid}`;
  return (
    <div
      className={`treasure-chest-mascot ${selected ? "sel" : ""}`}
      style={{ animationDelay }}
      aria-hidden
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="treasure-chest-mascot-svg">
        <defs>
          <linearGradient id={gid} x1="50" y1="36" x2="50" y2="96" gradientUnits="userSpaceOnUse">
            <stop stopColor={T.w1} />
            <stop offset="1" stopColor={T.w2} />
          </linearGradient>
        </defs>
        {/* Bicorne + skull (reference mascot) */}
        <path d="M32,24 L50,14 L68,24 L64,30 L36,30 Z" fill={T.hat} opacity="0.98" />
        <ellipse cx="50" cy="26" rx="11" ry="4" fill="#F7F4EE" opacity="0.1" />
        <g transform="translate(50, 22)">
          <circle cx="0" cy="0" r="4.2" fill="#F7F4EE" opacity="0.95" />
          <circle cx="-1.4" cy="-0.3" r="1.1" fill="#1a1a2e" />
          <circle cx="1.4" cy="-0.3" r="1.1" fill="#1a1a2e" />
          <path d="M-1.8,1.8 Q0,3 1.8,1.8" stroke="#1a1a2e" strokeWidth="0.65" fill="none" strokeLinecap="round" />
        </g>
        {/* Lid */}
        <path d="M14,48 Q50,36 86,48 L86,56 Q50,44 14,56 Z" fill={`url(#${gid})`} />
        <path d="M14,48 Q50,36 86,48" stroke={T.seam} strokeWidth="1.2" fill="none" opacity="0.5" />
        <path d="M14,48 Q50,36 86,48" stroke={T.gold} strokeWidth="0.9" fill="none" opacity="0.45" />
        <ellipse cx="50" cy="52" rx="28" ry="5" fill="#F0C040" opacity="0.14" />
        {/* Body */}
        <rect x="14" y="55" width="72" height="38" rx="6" fill={`url(#${gid})`} />
        <rect x="14" y="67" width="72" height="1.5" rx="0.7" fill={T.seam} opacity="0.55" />
        <rect x="14" y="80" width="72" height="1.5" rx="0.7" fill={T.seam} opacity="0.55" />
        <rect x="14" y="55" width="72" height="3.5" rx="1.5" fill={T.gold} />
        <rect x="14" y="72" width="72" height="5" rx="2" fill={T.gold} />
        <rect x="14" y="89" width="72" height="3.5" rx="1.5" fill={T.gold} opacity="0.85" />
        <rect x="47" y="55" width="6" height="38" rx="2" fill={T.gold} opacity="0.92" />
        <rect x="11" y="42" width="9" height="14" rx="2.5" fill={T.gold} />
        <rect x="80" y="42" width="9" height="14" rx="2.5" fill={T.gold} />
        <rect x="11" y="60" width="9" height="14" rx="2.5" fill={T.gold} />
        <rect x="80" y="60" width="9" height="14" rx="2.5" fill={T.gold} />
        <rect x="43" y="70" width="14" height="10" rx="3" fill={T.gold} />
        <path d="M46,70 Q46,64 50,64 Q54,64 54,70" stroke={T.gold} strokeWidth="2.5" fill="none" strokeLinecap="round" />
        <circle cx="50" cy="75" r="2.5" fill="#5c3d10" />
        {/* Eyes */}
        <circle cx="36" cy="48" r="7" fill="white" />
        <circle cx="64" cy="48" r="7" fill="white" />
        <circle cx="36" cy="48" r="7" fill="none" stroke={T.gold} strokeWidth="0.8" />
        <circle cx="64" cy="48" r="7" fill="none" stroke={T.gold} strokeWidth="0.8" />
        <circle cx="37" cy="48" r="4" fill="#1a1a2e" style={{ animation: "blink 4.5s ease-in-out infinite" }} />
        <circle cx="65" cy="48" r="4" fill="#1a1a2e" style={{ animation: "blink 4.5s 0.1s ease-in-out infinite" }} />
        <circle cx="38.5" cy="46.5" r="1.4" fill="white" />
        <circle cx="66.5" cy="46.5" r="1.4" fill="white" />
        <path d="M40,58 Q50,65 60,58" stroke={T.gold} strokeWidth="2" fill="none" strokeLinecap="round" />
        <circle cx="20" cy="42" r="1.5" fill="#F0C040" opacity="0.7" style={{ animation: "sparkle 2.2s 0.3s ease-in-out infinite" }} />
        <circle cx="80" cy="44" r="1.2" fill="#F0C040" opacity="0.6" style={{ animation: "sparkle 2.2s 1s ease-in-out infinite" }} />
      </svg>
    </div>
  );
}

export function BriefHeroStarfield() {
  return (
    <svg className="brief-hero-starfield" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {Array.from({ length: 48 }, (_, i) => (
        <circle
          key={i}
          cx={`${(Math.sin(i * 137.5) * 0.5 + 0.5) * 100}%`}
          cy={`${(Math.cos(i * 97.3) * 0.5 + 0.5) * 100}%`}
          r={0.4 + (i % 3) * 0.45}
          fill="white"
          style={{ animation: `starTwinkle ${2 + (i % 5) * 0.5}s ${i * 0.18}s ease-in-out infinite` }}
        />
      ))}
    </svg>
  );
}

export function BriefHeroFloatingDecor() {
  return (
    <>
      <div className="brief-float brief-float--compass">
        <svg width="58" height="58" viewBox="0 0 76 76" aria-hidden>
          <circle cx="38" cy="38" r="35" fill="none" stroke="#C8A84B" strokeWidth="1.5" strokeDasharray="4 5" />
          <circle cx="38" cy="38" r="26" fill="none" stroke="#C8A84B" strokeWidth="0.7" opacity="0.45" />
          <polygon points="38,6 41,32 38,38 35,32" fill="#F7F4EE" />
          <polygon points="38,70 41,44 38,38 35,44" fill="#C8A84B" opacity="0.55" />
          <polygon points="6,38 32,35 38,38 32,41" fill="#C8A84B" opacity="0.55" />
          <polygon points="70,38 44,35 38,38 44,41" fill="#F7F4EE" />
          <circle cx="38" cy="38" r="5" fill="#C8A84B" />
          <circle cx="38" cy="38" r="2.5" fill="#1a1a2e" />
          <text x="38" y="11" textAnchor="middle" fill="#C8A84B" fontSize="7" fontWeight="bold">
            N
          </text>
        </svg>
      </div>
      <div className="brief-float brief-float--coin">
        <svg width="40" height="40" viewBox="0 0 40 40" aria-hidden>
          <circle cx="20" cy="20" r="18" fill="#C8A84B" stroke="#F0C040" strokeWidth="1.5" />
          <circle cx="20" cy="20" r="12" fill="none" stroke="#8B6914" strokeWidth="0.8" />
          <text x="20" y="25" textAnchor="middle" fill="#8B6914" fontSize="13" fontWeight="bold">
            $
          </text>
        </svg>
      </div>
      <div className="brief-float brief-float--scroll">
        <svg width="30" height="38" viewBox="0 0 30 38" aria-hidden>
          <rect x="4" y="4" width="22" height="30" rx="2" fill="#F5E8BE" stroke="#C8A84B" strokeWidth="1.2" />
          <path d="M4,4 Q1,4 1,8 Q1,12 4,12" fill="#E8CC80" />
          <path d="M26,4 Q29,4 29,8 Q29,12 26,12" fill="#E8CC80" />
          <line x1="8" y1="16" x2="22" y2="16" stroke="#C8A84B" strokeWidth="0.9" opacity="0.6" />
          <line x1="8" y1="20" x2="22" y2="20" stroke="#C8A84B" strokeWidth="0.9" opacity="0.4" />
          <line x1="8" y1="24" x2="17" y2="24" stroke="#C8A84B" strokeWidth="0.9" opacity="0.4" />
        </svg>
      </div>
      <div className="brief-float brief-float--ship">
        <svg width="44" height="44" viewBox="0 0 60 50" aria-hidden>
          <path d="M8,34 Q30,42 52,34 L49,44 Q30,52 11,44 Z" fill="#3A2010" />
          <line x1="30" y1="34" x2="30" y2="6" stroke="#3A2010" strokeWidth="2.2" />
          <line x1="18" y1="16" x2="42" y2="16" stroke="#3A2010" strokeWidth="1" />
          <path d="M30,7 L30,32 L43,26 L42,16 Z" fill="#FFFCF0" stroke="#C8A84B" strokeWidth="0.6" opacity="0.95" />
          <path d="M30,7 L30,32 L17,26 L18,16 Z" fill="#FFF5D8" stroke="#C8A84B" strokeWidth="0.6" opacity="0.88" />
          <path d="M30,5 L37,7 L30,9 Z" fill="#1a1a1a" />
        </svg>
      </div>
    </>
  );
}

export function BriefHeroFooterIcons() {
  return (
    <div className="brief-hero-footer-icons" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M4 12L12 4l8 8M8 12v6h8v-6" stroke="rgba(212,169,106,0.75)" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v18M8 21h8M9 3h6v4H9V3z" stroke="rgba(212,169,106,0.75)" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="12" cy="14" r="5" stroke="rgba(212,169,106,0.55)" strokeWidth="1.2" />
      </svg>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="5" width="18" height="14" rx="2" stroke="rgba(212,169,106,0.75)" strokeWidth="1.4" />
        <path d="M3 10h18M8 5v14" stroke="rgba(212,169,106,0.55)" strokeWidth="1.2" />
      </svg>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="7" width="16" height="12" rx="2" stroke="rgba(212,169,106,0.75)" strokeWidth="1.4" />
        <path d="M4 10h16M12 7v-2M8 19h8" stroke="rgba(212,169,106,0.55)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="11" r="6" stroke="rgba(212,169,106,0.75)" strokeWidth="1.4" />
        <path d="M8 19c1.5-2 10-2 11.5 0" stroke="rgba(212,169,106,0.55)" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
    </div>
  );
}
