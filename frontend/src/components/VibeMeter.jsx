import { useState, useEffect } from "react";

// ─── VIBE METER ───────────────────────────────────────────────────
export const VibeMeter = ({ preferences }) => {
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

export default VibeMeter;
