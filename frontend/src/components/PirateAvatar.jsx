// Procedurally generated pirate avatar — deterministic from username hash.
// Each user gets a unique combination of hat, skin, eye patch, beard, coat, earring.

function djb2(str) {
  let h = 5381;
  for (let i = 0; i < (str || "").length; i++) h = ((h << 5) + h) ^ str.charCodeAt(i);
  return Math.abs(h >>> 0);
}

function darken(hex, amt) {
  const n = parseInt(hex.replace("#",""), 16);
  const r = Math.max(0, (n >> 16) - amt);
  const g = Math.max(0, ((n >> 8) & 0xff) - amt);
  const b = Math.max(0, (n & 0xff) - amt);
  return `rgb(${r},${g},${b})`;
}

const SKINS  = ["#FDDCB5","#D4956A","#A05C2A","#6B3A1F"];
const HAIRS  = ["#1a0800","#5c3010","#8B2010","#C8A060"];
const COATS  = ["#8B0000","#111128","#0F2747","#3d1a08"];
const HAT_COLS = ["#1a0800","#0a0a18","#1a0000","#2a1808"];
const HATS   = ["tricorn","bandana","captain"];
const PATCHES = [null,"left","right"];
const BEARDS = ["none","short","full","mustache"];
const EARRINGS = [null,"left","right","both"];

export function PirateAvatar({ username, size = 80, style, className }) {
  const seed = djb2(username || "pirate");
  const pick = (exp, arr) => arr[Math.floor(seed / Math.pow(7, exp)) % arr.length];

  const skin     = pick(0, SKINS);
  const hair     = pick(1, HAIRS);
  const coat     = pick(2, COATS);
  const hatCol   = pick(3, HAT_COLS);
  const hat      = pick(4, HATS);
  const patch    = pick(5, PATCHES);
  const beard    = pick(6, BEARDS);
  const earring  = pick(7, EARRINGS);
  const scar     = pick(8, [false, false, true]);

  const skinD = darken(skin, 28);
  const id = `p${seed}`;

  return (
    <svg
      width={size} height={size} viewBox="0 0 100 100"
      style={{ display:"block", borderRadius:"50%", flexShrink:0, ...style }}
      className={className}
    >
      <defs>
        <clipPath id={`cl-${id}`}><circle cx="50" cy="50" r="49"/></clipPath>
        <radialGradient id={`bg-${id}`} cx="50%" cy="30%" r="70%">
          <stop offset="0%"   stopColor="#1d3f70"/>
          <stop offset="100%" stopColor="#050d1a"/>
        </radialGradient>
      </defs>

      <g clipPath={`url(#cl-${id})`}>
        {/* Ocean background */}
        <rect width="100" height="100" fill={`url(#bg-${id})`}/>
        <ellipse cx="50" cy="100" rx="55" ry="16" fill="rgba(0,160,200,0.12)"/>

        {/* Coat at bottom */}
        <path d="M 6,100 L 26,82 C 34,77 42,80 50,78 C 58,80 66,77 74,82 L 94,100 Z"
          fill={coat} stroke="#000" strokeWidth="1.5"/>
        <path d="M 38,82 L 50,73 L 62,82" fill="#EDE8D8" stroke="#0a0a0a" strokeWidth="1"/>

        {/* Beard — drawn behind face */}
        {beard === "full" && (
          <ellipse cx="50" cy="82" rx="21" ry="11" fill={hair} stroke="#0a0a0a" strokeWidth="1.2"/>
        )}
        {beard === "short" && (
          <ellipse cx="50" cy="83" rx="16" ry="7" fill={hair} opacity="0.9" stroke="#0a0a0a" strokeWidth="1"/>
        )}

        {/* Ears */}
        <ellipse cx="26" cy="60" rx="5" ry="7" fill={skin} stroke="#0a0a0a" strokeWidth="1.5"/>
        <ellipse cx="74" cy="60" rx="5" ry="7" fill={skin} stroke="#0a0a0a" strokeWidth="1.5"/>
        <ellipse cx="27" cy="60" rx="2.2" ry="4" fill={skinD} opacity="0.4"/>
        <ellipse cx="73" cy="60" rx="2.2" ry="4" fill={skinD} opacity="0.4"/>

        {/* Earrings */}
        {(earring === "left" || earring === "both") && (
          <circle cx="22" cy="67" r="3.5" fill="none" stroke="#FFD700" strokeWidth="2"/>
        )}
        {(earring === "right" || earring === "both") && (
          <circle cx="78" cy="67" r="3.5" fill="none" stroke="#FFD700" strokeWidth="2"/>
        )}

        {/* Face */}
        <ellipse cx="50" cy="60" rx="24" ry="26" fill={skin} stroke="#0a0a0a" strokeWidth="2"/>
        <ellipse cx="50" cy="78" rx="14" ry="6" fill={skinD} opacity="0.2"/>
        <ellipse cx="44" cy="47" rx="8" ry="5" fill="white" opacity="0.1"/>

        {/* Scar */}
        {scar && (
          <line x1="58" y1="51" x2="64" y2="63" stroke="#6a0010" strokeWidth="1.5" strokeLinecap="round" opacity="0.65"/>
        )}

        {/* Left eye */}
        {patch === "left" ? (
          <g>
            <ellipse cx="40" cy="57" rx="7.5" ry="6.5" fill="#1a0a00" stroke="#0a0a0a" strokeWidth="1.5"/>
            <line x1="33" y1="52" x2="49" y2="52" stroke="#3a1a00" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="40" y1="52" x2="40" y2="34" stroke="#3a1a00" strokeWidth="2" strokeLinecap="round"/>
          </g>
        ) : (
          <g>
            <circle cx="40" cy="57" r="7" fill="white" stroke="#0a0a0a" strokeWidth="1.5"/>
            <circle cx="41" cy="57" r="4" fill="#1a1000"/>
            <circle cx="42.5" cy="55.5" r="1.3" fill="white"/>
          </g>
        )}

        {/* Right eye */}
        {patch === "right" ? (
          <g>
            <ellipse cx="60" cy="57" rx="7.5" ry="6.5" fill="#1a0a00" stroke="#0a0a0a" strokeWidth="1.5"/>
            <line x1="52" y1="52" x2="68" y2="52" stroke="#3a1a00" strokeWidth="2.5" strokeLinecap="round"/>
            <line x1="60" y1="52" x2="60" y2="34" stroke="#3a1a00" strokeWidth="2" strokeLinecap="round"/>
          </g>
        ) : (
          <g>
            <circle cx="60" cy="57" r="7" fill="white" stroke="#0a0a0a" strokeWidth="1.5"/>
            <circle cx="61" cy="57" r="4" fill="#1a1000"/>
            <circle cx="62.5" cy="55.5" r="1.3" fill="white"/>
          </g>
        )}

        {/* Eyebrows */}
        <path d="M 35,50 Q 40,47 45,50" fill="none" stroke={hair} strokeWidth="2.5" strokeLinecap="round"/>
        <path d="M 55,50 Q 60,47 65,50" fill="none" stroke={hair} strokeWidth="2.5" strokeLinecap="round"/>

        {/* Nose */}
        <path d="M 48,65 Q 46,71 50,72 Q 54,71 52,65" fill={skinD} stroke="none" opacity="0.45"/>

        {/* Mouth */}
        <path d="M 42,74 Q 50,80 58,74" fill="none" stroke="#4a1800" strokeWidth="2" strokeLinecap="round"/>
        <path d="M 43,74 Q 50,77 57,74" fill="#b86050" opacity="0.45"/>

        {/* Mustache */}
        {beard === "mustache" && (
          <path d="M 41,72 Q 46,69 50,70 Q 54,69 59,72" fill={hair} stroke="#0a0a0a" strokeWidth="1"/>
        )}

        {/* Side hair (for non-tricorn) */}
        {hat !== "tricorn" && (
          <>
            <path d="M 27,50 Q 28,36 38,34 Q 31,44 33,52" fill={hair} stroke="#0a0a0a" strokeWidth="1"/>
            <path d="M 73,50 Q 72,36 62,34 Q 69,44 67,52" fill={hair} stroke="#0a0a0a" strokeWidth="1"/>
          </>
        )}

        {/* ── HATS ── */}
        {hat === "tricorn" && (
          <g>
            <ellipse cx="50" cy="36" rx="33" ry="7" fill={hatCol} stroke="#0a0a0a" strokeWidth="2"/>
            <polygon points="50,3 18,34 82,34" fill={hatCol} stroke="#0a0a0a" strokeWidth="2" strokeLinejoin="round"/>
            <ellipse cx="50" cy="36" rx="33" ry="7" fill="none" stroke="#C8A84B" strokeWidth="1.5" opacity="0.55"/>
            <ellipse cx="50" cy="18" rx="10" ry="8" fill="none" stroke="rgba(200,168,75,0.3)" strokeWidth="1"/>
            <text x="50" y="28" textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.8)">☠</text>
          </g>
        )}
        {hat === "bandana" && (
          <g>
            <path d="M 24,40 Q 50,22 76,40 Q 50,50 24,40 Z" fill={hatCol} stroke="#0a0a0a" strokeWidth="1.8"/>
            <circle cx="74" cy="43" r="5.5" fill={hatCol} stroke="#0a0a0a" strokeWidth="1.5"/>
            <path d="M 74,38 L 82,34 M 74,48 L 82,51" stroke={hatCol} strokeWidth="4" strokeLinecap="round"/>
            <path d="M 28,38 Q 50,24 72,38" fill="none" stroke="rgba(255,255,255,0.18)" strokeWidth="1.5"/>
            <path d="M 30,42 Q 50,30 70,42" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1.5"/>
          </g>
        )}
        {hat === "captain" && (
          <g>
            <rect x="17" y="35" width="66" height="6" rx="2" fill={hatCol} stroke="#0a0a0a" strokeWidth="1.8"/>
            <rect x="27" y="8" width="46" height="29" rx="3" fill={hatCol} stroke="#0a0a0a" strokeWidth="2"/>
            <rect x="27" y="30" width="46" height="4" fill="#C8A84B" stroke="#0a0a0a" strokeWidth="1"/>
            <text x="50" y="27" textAnchor="middle" fontSize="13" fill="rgba(255,255,255,0.75)">⚓</text>
          </g>
        )}
      </g>

      {/* Gold ring */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="#C8A84B" strokeWidth="1.5" opacity="0.45"/>
    </svg>
  );
}

// Returns the hash-derived trait summary for a username — used on identity card
export function getPirateTitle(username) {
  const seed = djb2(username || "pirate");
  const pick = (exp, arr) => arr[Math.floor(seed / Math.pow(7, exp)) % arr.length];
  const ranks = ["Buccaneer","Corsair","Marauder","Freebooter","Privateer","Navigator","Commodore"];
  const epithets = ["of the Hidden Seas","of Malasaña","of the Dark Taverns","of the Lost Charts","of Midnight Tides","of the Gold Route"];
  return `${pick(9, ranks)} ${pick(10, epithets)}`;
}
