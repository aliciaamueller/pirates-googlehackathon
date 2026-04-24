import { useEffect } from "react";
import { MascotSVG } from "./MascotComponents";

// ─── REVEAL ANIMATION ─────────────────────────────────────────────
export function RevealAnimation({ onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1900);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 500,
      background: "radial-gradient(ellipse at center, rgba(30,20,5,0.97) 0%, rgba(5,10,25,0.99) 100%)",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      animation: "revealFadeOut 1.9s ease forwards",
      cursor: "pointer",
    }} onClick={onDone}>
      {Array.from({ length: 20 }, (_, i) => {
        const angle = (i / 20) * 360;
        const dist = 90 + (i % 4) * 35;
        const dx = Math.cos((angle * Math.PI) / 180) * dist;
        const dy = Math.sin((angle * Math.PI) / 180) * dist;
        const size = 8 + (i % 5) * 4;
        return (
          <div key={i} style={{
            position: "absolute", top: "50%", left: "50%",
            width: size, height: size, borderRadius: "50%",
            background: i % 3 === 0 ? "#F0C040" : i % 3 === 1 ? "#D4A96A" : "#fff8e0",
            animation: `particleBurst 1.4s ${i * 0.05}s cubic-bezier(0.25,0.46,0.45,0.94) forwards`,
            "--dx": `${dx}px`, "--dy": `${dy}px`,
            transform: "translate(-50%, -50%)",
          }} />
        );
      })}
      <div style={{ animation: "revealChestPop 0.7s 0.1s cubic-bezier(0.34,1.56,0.64,1) both", pointerEvents: "none" }}>
        <MascotSVG size={150} animation="bounce" />
      </div>
      <div style={{
        fontFamily: "'Playfair Display',serif",
        fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "#F0C040", fontWeight: 700,
        textShadow: "0 0 40px rgba(240,192,64,0.8), 0 0 80px rgba(240,192,64,0.4)",
        marginTop: "1rem", letterSpacing: "0.08em",
        animation: "revealTextPop 0.6s 0.4s cubic-bezier(0.34,1.56,0.64,1) both",
        pointerEvents: "none",
      }}>TREASURE FOUND!</div>
      <div style={{
        fontFamily: "'Crimson Text',serif", fontStyle: "italic",
        color: "rgba(240,223,160,0.65)", fontSize: "1.1rem", marginTop: "0.5rem",
        animation: "revealTextPop 0.6s 0.6s cubic-bezier(0.34,1.56,0.64,1) both",
        pointerEvents: "none",
      }}>The navigator has charted your course</div>
    </div>
  );
}

export default RevealAnimation;
