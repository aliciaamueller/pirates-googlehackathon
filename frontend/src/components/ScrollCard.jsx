import { useState } from "react";
import { VIBE_CARD_ANIM } from "../constants";
import { renderStoryPng } from "./StoryExport";

// ─── CONFIRM SWAP BUTTON ──────────────────────────────────────────
export function ConfirmSwapButton({ onConfirm, swapping, theme }) {
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

function getCrowdLevel(bounty) {
  const hour = new Date().getHours();
  const day = new Date().getDay();
  const isWeekend = day === 0 || day === 6;
  const isEvening = hour >= 19 && hour <= 23;
  const isLunch = hour >= 12 && hour <= 15;
  const reviews = bounty.user_ratings_total || 200;
  let level = reviews > 800 ? 3 : reviews > 300 ? 2 : 1;
  if (isEvening) level = Math.min(3, level + 1);
  if (isWeekend && isEvening) level = 3;
  else if (isLunch) level = Math.min(3, level + 1);
  if (level === 1) return { label: "Quiet now", color: "#51cf66" };
  if (level === 2) return { label: "Getting busy", color: "#fcc419" };
  return { label: "Packed", color: "#ff6b6b" };
}

// ─── SCROLL CARD ──────────────────────────────────────────────────
export function ScrollCard({ bounty, index, visible, onSwap, swapping, theme, vibe, onAddToPlan, onFavorite, isFavorited }) {
  const t = theme || {};
  const [addMsg, setAddMsg] = useState("");
  const [showEs, setShowEs] = useState(false);
  const [storyBusy, setStoryBusy] = useState(false);

  async function handleStoryExport() {
    if (storyBusy) return;
    setStoryBusy(true);
    try {
      const url = await renderStoryPng(bounty);
      const a = document.createElement("a");
      const slug = (bounty.place_id || bounty.name || "bounty").toString().replace(/[^a-z0-9]+/gi, "-").slice(0, 40);
      a.href = url;
      a.download = `rumbo-${slug}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 4000);
    } catch (err) {
      console.warn("Story export failed", err);
    } finally {
      setStoryBusy(false);
    }
  }
  const anim = VIBE_CARD_ANIM[vibe] || VIBE_CARD_ANIM.chill;
  const crowd = getCrowdLevel(bounty);
  const streetViewUrl = bounty.lat && bounty.lng ? `https://www.google.com/maps?layer=c&cbll=${bounty.lat},${bounty.lng}` : null;

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
      transform: visible ? "translateY(0) rotate(0deg) scale(1)" : anim.hidden,
      transition: `opacity ${anim.duration} ${anim.easing}, transform ${anim.duration} ${anim.easing}`,
      filter: swapping ? "opacity(0.3)" : "none",
      pointerEvents: swapping ? "none" : "all",
    }}>
      {/* Photo header with overlaid badges */}
      <div style={{ position: "relative", height: 220, background: "#0c1628", overflow: "hidden" }}>
        {/* Permanent fallback — always visible behind photo */}
        <div style={{ position:"absolute", inset:0, background:"linear-gradient(160deg, #0c1628 0%, #162540 55%, #0a1020 100%)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:0 }}>
          <span style={{ fontSize:"2.5rem", opacity:0.12 }}>⚓</span>
        </div>
        {bounty.photo_url && (
          <img
            src={bounty.photo_url}
            alt=""
            onError={e => { e.currentTarget.style.opacity = "0"; }}
            style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", display:"block", filter:"brightness(0.78) saturate(0.85)", zIndex:1 }}
          />
        )}
        {/* Gradient overlay */}
        <div style={{ position:"absolute", inset:0, zIndex:2, background:"linear-gradient(to top, rgba(10,20,40,0.9) 0%, rgba(10,20,40,0.2) 50%, transparent 100%)" }} />
        {/* Top-right action buttons */}
        <div style={{ position:"absolute", top:10, right:10, zIndex:3, display:"flex", gap:6 }}>
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
        <div style={{ position:"absolute", bottom:12, left:14, right:14, zIndex:3 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", fontWeight:700, color:"white", textShadow:"0 2px 8px rgba(0,0,0,0.8)", flex:1 }}>
              {showEs && bounty.pirate_name_es ? bounty.pirate_name_es : bounty.pirate_name}
            </div>
            {bounty.pirate_name_es && (
              <button
                onClick={() => setShowEs(s => !s)}
                style={{
                  background:"rgba(0,0,0,0.45)", border:"1px solid rgba(255,255,255,0.25)",
                  borderRadius:20, padding:"0.15rem 0.55rem", fontSize:"0.62rem",
                  color:"rgba(255,255,255,0.8)", cursor:"pointer", fontWeight:600,
                  letterSpacing:"0.06em", backdropFilter:"blur(4px)", flexShrink:0,
                }}
              >{showEs ? "EN" : "ES"}</button>
            )}
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

        {/* Open Now + closing time badge */}
        {bounty.open_now !== null && bounty.open_now !== undefined && (
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:"0.65rem", flexWrap:"wrap" }}>
            <div style={{
              display:"inline-flex", alignItems:"center", gap:5,
              padding:"0.2rem 0.65rem", borderRadius:20,
              fontSize:"0.72rem", fontWeight:600, letterSpacing:"0.04em",
              background: bounty.open_now ? "rgba(81,207,102,0.15)" : "rgba(255,107,107,0.12)",
              border: `1px solid ${bounty.open_now ? "rgba(81,207,102,0.35)" : "rgba(255,107,107,0.3)"}`,
              color: bounty.open_now ? "#51cf66" : "#ff6b6b",
            }}>
              <span style={{ fontSize:"0.55rem" }}>●</span>
              {bounty.open_now ? "OPEN NOW" : "CURRENTLY CLOSED"}
            </div>
            {bounty.closes_at && bounty.open_now && (
              <span style={{ fontSize:"0.72rem", color: t.textMuted || "rgba(255,255,255,0.45)" }}>
                Closes {bounty.closes_at}
              </span>
            )}
          </div>
        )}
        {/* Crowd meter */}
        <div style={{ display:"inline-flex", alignItems:"center", gap:4, padding:"0.18rem 0.55rem", borderRadius:20, background:`${crowd.color}18`, border:`1px solid ${crowd.color}45`, marginBottom:"0.5rem" }}>
          <span style={{ fontSize:"0.5rem", color:crowd.color }}>●</span>
          <span style={{ fontSize:"0.68rem", fontWeight:600, color:crowd.color, letterSpacing:"0.04em" }}>{crowd.label}</span>
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
        <div style={{ display:"flex", gap:"0.6rem" }}>
          <a href={bounty.maps_url} target="_blank" rel="noopener noreferrer" style={{
            flex:1, background:`linear-gradient(135deg, ${t.numberBadgeBg || "#0F2747"} 0%, #1a3a6a 100%)`,
            color:"white", border:"none", borderRadius:12,
            padding:"0.8rem", fontSize:"0.85rem", fontWeight:600,
            textAlign:"center", textDecoration:"none",
            display:"flex", alignItems:"center", justifyContent:"center", gap:6,
            boxShadow:"0 4px 14px rgba(0,0,0,0.3)",
            transition:"transform 0.15s, box-shadow 0.15s",
          }}>⚓ Claim this Bounty</a>
          {bounty.website && (
            <a href={bounty.website} target="_blank" rel="noopener noreferrer" title="Reserve a table" style={{
              background:"rgba(81,207,102,0.1)", border:"1px solid rgba(81,207,102,0.3)",
              color:"#51cf66", borderRadius:10, padding:"0.75rem 0.7rem",
              fontSize:"0.78rem", fontWeight:600, cursor:"pointer", whiteSpace:"nowrap",
              textDecoration:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:3,
            }}>📅 Reserve</a>
          )}
          {streetViewUrl && (
            <a href={streetViewUrl} target="_blank" rel="noopener noreferrer" title="Street View" style={{
              background:"rgba(255,255,255,0.06)", border:`1px solid ${t.cardBorder||"rgba(255,255,255,0.15)"}`,
              color:t.textMuted||"rgba(255,255,255,0.55)", borderRadius:10, padding:"0.75rem 0.7rem",
              fontSize:"0.8rem", cursor:"pointer", whiteSpace:"nowrap", textDecoration:"none",
              display:"flex", alignItems:"center", justifyContent:"center",
            }}>👁</a>
          )}
          <button
            type="button"
            onClick={handleStoryExport}
            disabled={storyBusy}
            title="Download Instagram story"
            aria-label="Download Instagram story"
            style={{
              background: storyBusy ? "rgba(212,169,106,0.18)" : "rgba(212,169,106,0.10)",
              border: `1px solid ${t.goldColor ? `${t.goldColor}55` : "rgba(212,169,106,0.35)"}`,
              color: t.goldColor || "#D4A96A",
              borderRadius: 10,
              padding: "0.75rem 0.7rem",
              fontSize: "0.9rem",
              cursor: storyBusy ? "wait" : "pointer",
              whiteSpace: "nowrap",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "transform 0.15s, background 0.15s",
            }}
          >
            {storyBusy ? (
              <span style={{ fontSize: "0.75rem", letterSpacing: "0.06em" }}>…</span>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M12 3v13" />
                <path d="M6 9l6-6 6 6" />
                <path d="M5 21h14" />
              </svg>
            )}
          </button>
          <ConfirmSwapButton onConfirm={() => onSwap(bounty.place_id)} swapping={swapping} theme={t} />
        </div>
      </div>
    </div>
  );
}
