import { useEffect, useRef, useState } from "react";

// ─── ROUND RECT HELPER ────────────────────────────────────────────
export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.arcTo(x + w, y, x + w, y + r, r);
  ctx.lineTo(x + w, y + h - r); ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
  ctx.lineTo(x + r, y + h); ctx.arcTo(x, y + h, x, y + h - r, r);
  ctx.lineTo(x, y + r); ctx.arcTo(x, y, x + r, y, r);
  ctx.closePath();
}

// ─── SHARE CARD ───────────────────────────────────────────────────
export const ShareCard = ({ bounties, preferences, theme, onClose }) => {
  const canvasRef = useRef(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ctx = c.getContext("2d");
    // Instagram Story format: 1080×1920 rendered at half res for performance
    const W = 540, H = 960; c.width = W; c.height = H;

    // Sky gradient background
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    const accent = theme?.accentColor || "#D4A96A";
    if (theme?.isDay) {
      bg.addColorStop(0, "#eef4f8"); bg.addColorStop(0.5, "#c8dfe8"); bg.addColorStop(1, "#7fa3b8");
    } else {
      const sky = (theme?.skyGradient || "").match(/#[0-9a-f]{6}/gi) || ["#070d1a","#0d1f3c","#0a1628"];
      bg.addColorStop(0, sky[0]); bg.addColorStop(0.5, sky[1] || sky[0]); bg.addColorStop(1, sky[2] || sky[0]);
    }
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);

    // Stars (night only)
    if (!theme?.isDay) {
      for (let i = 0; i < 120; i++) {
        const x = (Math.sin(i * 137.5) * 0.5 + 0.5) * W;
        const y = (Math.cos(i * 97.3) * 0.5 + 0.5) * H * 0.45;
        const r = 0.4 + (i % 4) * 0.35;
        ctx.globalAlpha = 0.15 + (i % 5) * 0.1;
        ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }

    // Inner card panel
    const pad = 28, cardY = 140, cardH = H - cardY - 100;
    ctx.fillStyle = theme?.isDay ? "rgba(255,252,245,0.93)" : "rgba(8,14,30,0.88)";
    roundRect(ctx, pad, cardY, W - pad * 2, cardH, 22); ctx.fill();

    // Gold border on card
    ctx.strokeStyle = accent; ctx.lineWidth = 1.5; ctx.globalAlpha = 0.45;
    roundRect(ctx, pad, cardY, W - pad * 2, cardH, 22); ctx.stroke();
    ctx.globalAlpha = 1;

    // Top decorative compass line
    ctx.strokeStyle = accent; ctx.lineWidth = 1; ctx.globalAlpha = 0.3;
    ctx.beginPath(); ctx.moveTo(pad + 30, cardY + 60); ctx.lineTo(W - pad - 30, cardY + 60); ctx.stroke();
    ctx.globalAlpha = 1;

    // RUMBO title
    ctx.fillStyle = theme?.isDay ? "#0F2747" : "#F0DFA0";
    ctx.font = "bold 42px Georgia, serif"; ctx.textAlign = "center";
    ctx.fillText("RUMBO", W / 2, 90);
    ctx.font = "16px Georgia, serif"; ctx.fillStyle = accent;
    ctx.fillText("AI Pirate Navigator · Madrid", W / 2, 118);

    // Vibe badge
    if (preferences?.vibe) {
      ctx.fillStyle = accent; ctx.globalAlpha = 0.15;
      roundRect(ctx, W/2 - 80, cardY + 18, 160, 28, 14); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = accent; ctx.font = "bold 12px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`✦ ${preferences.vibe.toUpperCase()} VIBES ✦`, W / 2, cardY + 37);
    }

    // Separator
    ctx.strokeStyle = accent; ctx.lineWidth = 0.8; ctx.globalAlpha = 0.2;
    ctx.beginPath(); ctx.moveTo(pad + 20, cardY + 56); ctx.lineTo(W - pad - 20, cardY + 56); ctx.stroke();
    ctx.globalAlpha = 1;

    // Bounties
    bounties.forEach((b, i) => {
      const rowH = 200;
      const y = cardY + 76 + i * rowH;

      // Number badge
      ctx.fillStyle = theme?.numberBadgeBg || "#8B2020";
      ctx.globalAlpha = 0.9;
      ctx.beginPath(); ctx.arc(pad + 36, y + 18, 16, 0, Math.PI * 2); ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "white"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(i + 1, pad + 36, y + 23);

      // Pirate name
      ctx.fillStyle = theme?.isDay ? "#0F2747" : "#F0DFA0";
      ctx.font = "bold 20px Georgia, serif"; ctx.textAlign = "left";
      const pname = (b.pirate_name || b.name || "").slice(0, 28);
      ctx.fillText(pname, pad + 62, y + 24);

      // Real name + rating
      ctx.fillStyle = theme?.isDay ? "#6b5c48" : "rgba(240,223,160,0.55)";
      ctx.font = "13px sans-serif";
      const rname = (b.name || "").slice(0, 30);
      const stars = b.rating ? " · " + "★".repeat(Math.floor(b.rating)) + " " + b.rating : "";
      ctx.fillText(rname + stars, pad + 62, y + 46);

      // Hook quote
      ctx.fillStyle = accent; ctx.font = "italic 14px Georgia, serif";
      const hook = `"${(b.hook || "").slice(0, 60)}${(b.hook || "").length > 60 ? "…" : ""}"`;
      ctx.fillText(hook, pad + 18, y + 76);

      // Address
      ctx.fillStyle = theme?.isDay ? "#8a7a5a" : "rgba(240,223,160,0.4)";
      ctx.font = "12px sans-serif";
      ctx.fillText("📍 " + (b.address || "").slice(0, 42), pad + 18, y + 100);

      // Divider (except last)
      if (i < bounties.length - 1) {
        ctx.strokeStyle = accent; ctx.lineWidth = 0.6; ctx.globalAlpha = 0.15;
        ctx.beginPath(); ctx.moveTo(pad + 18, y + 120); ctx.lineTo(W - pad - 18, y + 120); ctx.stroke();
        ctx.globalAlpha = 1;
      }
    });

    // Footer
    ctx.fillStyle = accent; ctx.font = "bold 13px sans-serif"; ctx.textAlign = "center"; ctx.globalAlpha = 0.8;
    ctx.fillText("rumbo.app · Find your treasure", W / 2, H - 52);
    ctx.globalAlpha = 0.4; ctx.font = "11px sans-serif";
    ctx.fillText("AI-powered hidden gems in Madrid", W / 2, H - 34);
    ctx.globalAlpha = 1;

    setDone(true);
  }, []);

  const download = () => {
    const a = document.createElement("a");
    a.download = "rumbo-story.png";
    a.href = canvasRef.current.toDataURL("image/png");
    a.click();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 200, padding: "1rem",
    }} onClick={onClose}>
      <div style={{ maxWidth: 340, width: "100%" }} onClick={e => e.stopPropagation()}>
        <canvas ref={canvasRef} style={{ width: "100%", borderRadius: 16, display: "block", boxShadow: "0 20px 60px rgba(0,0,0,0.6)" }} />
        <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem", justifyContent: "center" }}>
          <button onClick={download} style={{
            background: "#D4A96A", color: "#0F2747", border: "none",
            borderRadius: 40, padding: "0.7rem 1.8rem", cursor: "pointer",
            fontWeight: 600, fontSize: "0.85rem",
          }}>⬇ Save for Story</button>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.1)", color: "white", border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: 40, padding: "0.7rem 1.4rem", cursor: "pointer", fontSize: "0.85rem",
          }}>Close</button>
        </div>
      </div>
    </div>
  );
};

export default ShareCard;
