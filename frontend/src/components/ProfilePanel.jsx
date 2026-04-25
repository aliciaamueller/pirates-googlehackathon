import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabase";
import { PirateAvatar, getPirateTitle } from "./PirateAvatar";

async function drawIdentityCard(displayName, email, favorites, avatarSvgEl = null) {
  const W = 400, H = 640;
  const canvas = document.createElement("canvas");
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext("2d");

  // Background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#07111f");
  bg.addColorStop(0.5, "#0F2747");
  bg.addColorStop(1, "#091a30");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Diagonal stripe texture
  ctx.save();
  ctx.globalAlpha = 0.03;
  for (let i = -H; i < W + H; i += 18) {
    ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H);
    ctx.strokeStyle = "#C8A84B"; ctx.lineWidth = 6; ctx.stroke();
  }
  ctx.restore();

  // Gold borders
  ctx.strokeStyle = "#C8A84B"; ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, W - 20, H - 20);
  ctx.strokeStyle = "rgba(200,168,75,0.3)"; ctx.lineWidth = 1;
  ctx.strokeRect(16, 16, W - 32, H - 32);

  // Corner dots
  [[20, 20], [W - 20, 20], [20, H - 20], [W - 20, H - 20]].forEach(([cx, cy]) => {
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = "#C8A84B"; ctx.fill();
  });

  // Header label
  ctx.fillStyle = "rgba(200,168,75,0.55)";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("— RUMBO  ·  PIRATE NAVIGATOR —", W / 2, 46);

  // Avatar circle
  const avatarCX = W / 2, avatarCY = 115, avatarR = 54;
  if (avatarSvgEl) {
    try {
      const svgStr = new XMLSerializer().serializeToString(avatarSvgEl);
      const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const avatarImg = await new Promise((res, rej) => {
        const i = new Image();
        i.onload = () => res(i);
        i.onerror = () => { URL.revokeObjectURL(url); rej(new Error("avatar load failed")); };
        i.src = url;
      });
      URL.revokeObjectURL(url);
      ctx.save();
      ctx.beginPath();
      ctx.arc(avatarCX, avatarCY, avatarR, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(avatarImg, avatarCX - avatarR, avatarCY - avatarR, avatarR * 2, avatarR * 2);
      ctx.restore();
    } catch {
      ctx.font = "42px serif";
      ctx.textAlign = "center";
      ctx.fillText("🏴‍☠️", avatarCX, avatarCY + 14);
    }
  } else {
    ctx.font = "42px serif";
    ctx.textAlign = "center";
    ctx.fillText("🏴‍☠️", avatarCX, avatarCY + 14);
  }
  // Gold ring
  ctx.beginPath(); ctx.arc(avatarCX, avatarCY, avatarR + 2, 0, Math.PI * 2);
  ctx.strokeStyle = "#C8A84B"; ctx.lineWidth = 2.5; ctx.stroke();

  // Captain name
  ctx.fillStyle = "#F0DFA0";
  ctx.font = "bold 22px serif";
  ctx.textAlign = "center";
  ctx.fillText(`Captain ${displayName}`, W / 2, 190);

  // Subtitle
  ctx.fillStyle = "rgba(200,168,75,0.6)";
  ctx.font = "italic 11px serif";
  ctx.fillText("NAVIGATOR OF HIDDEN MADRID", W / 2, 210);

  // Divider 1
  ctx.strokeStyle = "rgba(200,168,75,0.3)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, 224); ctx.lineTo(W - 40, 224); ctx.stroke();

  // Treasures
  const topSpots = favorites.slice(0, 3);
  if (topSpots.length > 0) {
    ctx.fillStyle = "rgba(200,168,75,0.5)";
    ctx.font = "bold 9px sans-serif";
    ctx.textAlign = "left";
    ctx.fillText("TREASURES CLAIMED", 40, 244);
    const icons = ["⚓", "☠️", "⚔️"];
    topSpots.forEach((spot, i) => {
      const y = 266 + i * 50;
      ctx.fillStyle = "#F7F4EE";
      ctx.font = "bold 13px serif";
      ctx.fillText(`${icons[i]}  ${(spot.place_name || "").slice(0, 30)}`, 40, y);
      ctx.fillStyle = "rgba(255,255,255,0.32)";
      ctx.font = "11px sans-serif";
      ctx.fillText((spot.place_address || "").slice(0, 38), 56, y + 16);
    });
  } else {
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.font = "italic 13px serif";
    ctx.textAlign = "center";
    ctx.fillText("No treasures claimed yet — go explore!", W / 2, 280);
  }

  // Divider 2
  const divY = topSpots.length > 0 ? 408 : 308;
  ctx.strokeStyle = "rgba(200,168,75,0.25)"; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(40, divY); ctx.lineTo(W - 40, divY); ctx.stroke();

  // QR section
  const qrY = divY + 18;
  ctx.fillStyle = "rgba(200,168,75,0.45)";
  ctx.font = "bold 9px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("SHARE THE HUNT", W / 2, qrY);

  try {
    const qrImg = await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = `https://api.qrserver.com/v1/create-qr-code/?size=82x82&data=${encodeURIComponent("https://rumbo.app")}&color=D4A96A&bgcolor=0F2747&format=png`;
    });
    ctx.fillStyle = "#0F2747";
    ctx.fillRect(W / 2 - 48, qrY + 10, 96, 96);
    ctx.strokeStyle = "rgba(200,168,75,0.5)"; ctx.lineWidth = 1.5;
    ctx.strokeRect(W / 2 - 48, qrY + 10, 96, 96);
    ctx.drawImage(qrImg, W / 2 - 41, qrY + 17, 82, 82);
  } catch {
    ctx.fillStyle = "rgba(200,168,75,0.1)";
    ctx.fillRect(W / 2 - 48, qrY + 10, 96, 48);
    ctx.fillStyle = "#D4A96A";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("rumbo.app", W / 2, qrY + 42);
  }

  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.font = "10px sans-serif";
  ctx.textAlign = "center";
  ctx.fillText("Scan to start your own hunt", W / 2, qrY + 118);

  // Footer
  ctx.fillStyle = "rgba(200,168,75,0.3)";
  ctx.font = "9px sans-serif";
  ctx.fillText("Powered by Google Maps × Gemini AI  ·  Google Hackathon 2025", W / 2, H - 22);

  return canvas.toDataURL("image/png");
}

// ─── PROFILE PANEL ────────────────────────────────────────────────
export function ProfilePanel({ user, onClose }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("favorites");
  const [cardBusy, setCardBusy] = useState(false);
  const [cardPreview, setCardPreview] = useState(null);
  const avatarContainerRef = useRef(null);

  const displayName = user.email?.split("@")[0] || "Pirate";
  const pirateTitle = getPirateTitle(displayName);

  useEffect(() => { loadFavorites(); }, []);

  // Auto-generate card when switching to card tab
  useEffect(() => {
    if (tab !== "card" || cardPreview || cardBusy) return;
    const t = setTimeout(() => generateCard(), 180);
    return () => clearTimeout(t);
  }, [tab]); // eslint-disable-line

  async function loadFavorites() {
    setLoading(true);
    const { data } = await supabase.from("favorites").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setFavorites(data || []);
    setLoading(false);
  }

  async function removeFavorite(id) {
    await supabase.from("favorites").delete().eq("id", id);
    setFavorites(f => f.filter(fav => fav.id !== id));
    setCardPreview(null);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    onClose();
  }

  async function generateCard() {
    setCardBusy(true);
    setCardPreview(null);
    try {
      const avatarSvgEl = avatarContainerRef.current?.querySelector("svg") || null;
      const dataUrl = await drawIdentityCard(displayName, user.email, favorites, avatarSvgEl);
      setCardPreview(dataUrl);
    } catch (e) {
      console.warn("Card generation failed", e);
    } finally {
      setCardBusy(false);
    }
  }

  function downloadCard() {
    if (!cardPreview) return;
    const a = document.createElement("a");
    a.href = cardPreview;
    a.download = `rumbo-captain-${displayName}.png`;
    a.click();
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", display:"flex", justifyContent:"flex-end" }} onClick={onClose}>
      <div style={{ width:"100%", maxWidth:"420px", height:"100%", background:"#0F2747", overflowY:"auto", borderLeft:"1px solid rgba(212,169,106,0.2)", boxShadow:"-20px 0 60px rgba(0,0,0,0.4)", display:"flex", flexDirection:"column" }} onClick={e=>e.stopPropagation()}>

        {/* Hidden avatar for canvas serialization */}
        <div ref={avatarContainerRef} aria-hidden style={{ position:"absolute", opacity:0, pointerEvents:"none", width:0, height:0, overflow:"hidden" }}>
          <PirateAvatar username={displayName} size={108} />
        </div>

        {/* Header */}
        <div style={{ padding:"22px 24px 16px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div style={{ display:"flex", alignItems:"center", gap:14 }}>
              <PirateAvatar username={displayName} size={56} style={{ border:"2px solid rgba(212,169,106,0.5)", borderRadius:"50%", flexShrink:0 }} />
              <div>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", color:"#F7F4EE", fontWeight:700 }}>Captain {displayName}</div>
                <div style={{ fontSize:"11px", color:"rgba(212,169,106,0.65)", marginTop:2, fontStyle:"italic" }}>{pirateTitle}</div>
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.28)", marginTop:1 }}>{user.email}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"rgba(255,255,255,0.5)", width:32, height:32, borderRadius:"50%", cursor:"pointer", fontSize:"16px", flexShrink:0 }}>✕</button>
          </div>
          <div style={{ display:"flex", gap:8, marginTop:18, flexWrap:"wrap" }}>
            {[["favorites","❤️ Favorites"],["card","🪪 Identity Card"],["account","⚙️ Account"]].map(([id,label]) => (
              <button key={id} onClick={()=>setTab(id)} style={{ padding:"7px 14px", borderRadius:20, border:"none", cursor:"pointer", fontSize:"12px", fontWeight:600, background:tab===id?"#D4A96A":"rgba(255,255,255,0.07)", color:tab===id?"#0F2747":"rgba(255,255,255,0.5)", transition:"all 0.2s" }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, padding:"20px 24px", overflowY:"auto" }}>

          {/* ── FAVORITES ── */}
          {tab === "favorites" && (
            loading ? (
              <div style={{ color:"rgba(255,255,255,0.3)", textAlign:"center", padding:"40px 0", fontSize:"14px" }}>Loading treasures...</div>
            ) : favorites.length === 0 ? (
              <div style={{ textAlign:"center", padding:"40px 0" }}>
                <div style={{ fontSize:"40px", marginBottom:12 }}>🗺️</div>
                <div style={{ color:"rgba(255,255,255,0.3)", fontSize:"14px" }}>No saved treasures yet.<br/>Press ❤️ on any place to save it.</div>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <div style={{ fontSize:"12px", color:"rgba(212,169,106,0.5)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:4 }}>{favorites.length} treasure{favorites.length!==1?"s":""} saved</div>
                {favorites.map(fav => (
                  <div key={fav.id} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, overflow:"hidden" }}>
                    {fav.place_photo && <img src={fav.place_photo} alt={fav.place_name} style={{ width:"100%", height:110, objectFit:"cover", filter:"brightness(0.85)" }}/>}
                    <div style={{ padding:"12px 14px" }}>
                      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"15px", color:"#F7F4EE", marginBottom:3 }}>{fav.place_name}</div>
                      {fav.place_address && <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)", marginBottom:10 }}>📍 {fav.place_address}</div>}
                      <div style={{ display:"flex", gap:8 }}>
                        <a href={`https://maps.google.com/?q=${encodeURIComponent((fav.place_name||"")+" "+(fav.place_address||""))}`} target="_blank" rel="noopener noreferrer" style={{ flex:1, padding:"7px 0", borderRadius:8, textAlign:"center", background:"#D4A96A", color:"#0F2747", fontSize:"12px", fontWeight:600, textDecoration:"none", display:"block" }}>⚓ View on Maps</a>
                        <button onClick={()=>removeFavorite(fav.id)} style={{ padding:"7px 12px", borderRadius:8, border:"1px solid rgba(255,80,80,0.3)", background:"rgba(255,80,80,0.08)", color:"rgba(255,100,100,0.7)", cursor:"pointer", fontSize:"12px" }}>✕</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── IDENTITY CARD ── */}
          {tab === "card" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"18px", color:"#F0DFA0", marginBottom:4 }}>Pirate Identity Card</div>
                <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)", lineHeight:1.5 }}>
                  Your navigator card — download &amp; share with the judges.
                </div>
              </div>

              {cardPreview ? (
                <div style={{ textAlign:"center" }}>
                  <img src={cardPreview} alt="Identity card" style={{ width:"100%", maxWidth:300, borderRadius:8, border:"1px solid rgba(212,169,106,0.3)", boxShadow:"0 8px 32px rgba(0,0,0,0.5)" }}/>
                  <div style={{ display:"flex", gap:8, marginTop:12, justifyContent:"center" }}>
                    <button onClick={downloadCard} style={{ padding:"10px 24px", borderRadius:20, background:"#D4A96A", color:"#0F2747", border:"none", cursor:"pointer", fontWeight:700, fontSize:"14px" }}>
                      ⬇ Download PNG
                    </button>
                    <button onClick={() => { setCardPreview(null); setTimeout(generateCard, 80); }} style={{ padding:"10px 16px", borderRadius:20, background:"rgba(255,255,255,0.07)", color:"rgba(255,255,255,0.5)", border:"none", cursor:"pointer", fontSize:"13px" }}>
                      ↺ Redo
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign:"center" }}>
                  {/* Mockup card with real avatar */}
                  <div style={{ display:"inline-block", width:190, padding:"18px 14px 14px", background:"linear-gradient(160deg,#07111f 0%,#0F2747 100%)", border:"2px solid #C8A84B", borderRadius:8, boxShadow:"0 8px 32px rgba(0,0,0,0.5)", marginBottom:14, textAlign:"center" }}>
                    <PirateAvatar username={displayName} size={56} style={{ margin:"0 auto 8px", border:"2px solid rgba(200,168,75,0.55)", borderRadius:"50%" }} />
                    <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"11px", color:"#F0DFA0", fontWeight:700, marginBottom:2 }}>Captain {displayName}</div>
                    <div style={{ fontSize:"7px", color:"rgba(200,168,75,0.55)", marginBottom:8, letterSpacing:"0.1em" }}>NAVIGATOR OF HIDDEN MADRID</div>
                    <div style={{ fontSize:"8px", color:"rgba(255,255,255,0.3)", marginBottom:8, textAlign:"left" }}>
                      {favorites.slice(0,2).map((f,i)=>(
                        <div key={i} style={{ marginBottom:3 }}>⚓ {(f.place_name||"").slice(0,16)}</div>
                      ))}
                      {favorites.length===0 && <div style={{ textAlign:"center", fontStyle:"italic" }}>No spots yet</div>}
                    </div>
                    <div style={{ width:38, height:38, background:"rgba(212,169,106,0.1)", border:"1px solid rgba(212,169,106,0.25)", borderRadius:4, margin:"0 auto", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontSize:"7px", color:"rgba(212,169,106,0.55)" }}>QR</span>
                    </div>
                  </div>
                  {cardBusy ? (
                    <div style={{ color:"rgba(212,169,106,0.65)", fontSize:"14px", fontStyle:"italic", padding:"8px 0" }}>Generating your card…</div>
                  ) : (
                    <div>
                      <button onClick={generateCard} style={{ padding:"12px 28px", borderRadius:20, background:"#D4A96A", color:"#0F2747", border:"none", cursor:"pointer", fontWeight:700, fontSize:"14px" }}>
                        ✦ Generate My Card
                      </button>
                      <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.22)", marginTop:8 }}>
                        {Math.min(favorites.length,3)} saved spot{favorites.length!==1?"s":""} · your unique pirate avatar · QR code
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div style={{ padding:"12px 14px", borderRadius:10, background:"rgba(212,169,106,0.06)", border:"1px solid rgba(212,169,106,0.15)", fontSize:"12px", color:"rgba(255,255,255,0.4)", lineHeight:1.6 }}>
                💡 Your pirate avatar is unique to your username — no two captains look the same. Save spots with ❤️ to feature them on the card.
              </div>
            </div>
          )}

          {/* ── ACCOUNT ── */}
          {tab === "account" && (
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, padding:16, background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12 }}>
                <PirateAvatar username={displayName} size={52} />
                <div>
                  <div style={{ color:"#F7F4EE", fontSize:"15px", fontFamily:"'Playfair Display',serif", fontWeight:700 }}>Captain {displayName}</div>
                  <div style={{ fontSize:"11px", color:"rgba(212,169,106,0.65)", fontStyle:"italic", marginTop:2 }}>{pirateTitle}</div>
                </div>
              </div>
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:10, padding:16 }}>
                <div style={{ fontSize:"11px", color:"rgba(212,169,106,0.5)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6 }}>Email</div>
                <div style={{ color:"#F7F4EE", fontSize:"14px" }}>{user.email}</div>
              </div>
              <button onClick={handleLogout} style={{ marginTop:8, padding:12, borderRadius:10, border:"1px solid rgba(255,80,80,0.3)", background:"rgba(255,80,80,0.08)", color:"rgba(255,120,120,0.9)", cursor:"pointer", fontSize:"14px", fontWeight:600 }}>
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePanel;
