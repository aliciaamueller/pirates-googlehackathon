import { useState, useEffect } from "react";

// ─── CREW REACTIONS ───────────────────────────────────────────────
export const CrewReactions = ({ reactions, theme }) => {
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
                  &ldquo;{r.text}&rdquo;
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CrewReactions;
