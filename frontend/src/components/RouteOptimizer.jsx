import React from "react";

// ─── ROUTE OPTIMIZER ──────────────────────────────────────────────
export const RouteOptimizer = ({ bounties, theme }) => {
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

export default RouteOptimizer;
