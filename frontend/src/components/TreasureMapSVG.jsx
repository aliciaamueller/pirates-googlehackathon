import { useState, useEffect, useRef } from "react";

// ─── TREASURE MAP SVG ─────────────────────────────────────────────
export const TreasureMapSVG = ({ bounties = [], scanning = false }) => {
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

export default TreasureMapSVG;
