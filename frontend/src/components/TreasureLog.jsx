import { useState, useEffect } from "react";

// ─── TREASURE LOG ─────────────────────────────────────────────────
export const STORAGE_KEY = "rumbo_treasure_log";

export function loadLog() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); } catch { return []; }
}

export function saveLog(entry) {
  const log = loadLog();
  log.unshift({ ...entry, ts: Date.now() });
  localStorage.setItem(STORAGE_KEY, JSON.stringify(log.slice(0, 10)));
}

export const TreasureLog = ({ onSelect, theme }) => {
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

export default TreasureLog;
