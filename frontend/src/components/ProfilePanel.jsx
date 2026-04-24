import { useState, useEffect } from "react";
import { supabase } from "../supabase";

// ─── PROFILE PANEL ────────────────────────────────────────────────
export function ProfilePanel({ user, onClose }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("favorites");

  useEffect(() => { loadFavorites(); }, []);

  async function loadFavorites() {
    setLoading(true);
    const { data } = await supabase.from("favorites").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setFavorites(data || []);
    setLoading(false);
  }

  async function removeFavorite(id) {
    await supabase.from("favorites").delete().eq("id", id);
    setFavorites(f => f.filter(fav => fav.id !== id));
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    onClose();
  }

  const displayName = user.email?.split("@")[0] || "Pirate";

  return (
    <div className="side-drawer-root" style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", display:"flex", justifyContent:"flex-end" }} onClick={onClose}>
      <div className="side-drawer-panel" style={{ width:"100%", maxWidth:"420px", height:"100%", background:"#0F2747", overflowY:"auto", borderLeft:"1px solid rgba(212,169,106,0.2)", boxShadow:"-20px 0 60px rgba(0,0,0,0.4)", display:"flex", flexDirection:"column" }} onClick={e=>e.stopPropagation()}>
        <div style={{ padding:"28px 24px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:"32px", marginBottom:"6px" }}>🏴‍☠️</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"20px", color:"#F7F4EE", fontWeight:700 }}>Captain {displayName}</div>
              <div style={{ fontSize:"12px", color:"rgba(212,169,106,0.6)", marginTop:"2px" }}>{user.email}</div>
            </div>
            <button onClick={onClose} style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"rgba(255,255,255,0.5)", width:"32px", height:"32px", borderRadius:"50%", cursor:"pointer", fontSize:"16px" }}>✕</button>
          </div>
          <div style={{ display:"flex", gap:"8px", marginTop:"20px" }}>
            {[["favorites","❤️ Favorites"],["account","⚙️ Account"]].map(([id,label]) => (
              <button key={id} onClick={()=>setTab(id)} style={{ padding:"7px 16px", borderRadius:"20px", border:"none", cursor:"pointer", fontSize:"13px", fontWeight:600, background:tab===id?"#D4A96A":"rgba(255,255,255,0.07)", color:tab===id?"#0F2747":"rgba(255,255,255,0.5)" }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ flex:1, padding:"20px 24px", overflowY:"auto" }}>
          {tab === "favorites" && (
            <>
              {loading ? (
                <div style={{ color:"rgba(255,255,255,0.3)", textAlign:"center", padding:"40px 0", fontSize:"14px" }}>Loading treasures...</div>
              ) : favorites.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0" }}>
                  <div style={{ fontSize:"40px", marginBottom:"12px" }}>🗺️</div>
                  <div style={{ color:"rgba(255,255,255,0.3)", fontSize:"14px" }}>No saved treasures yet.<br/>Press ❤️ on any place to save it.</div>
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  <div style={{ fontSize:"12px", color:"rgba(212,169,106,0.5)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"4px" }}>{favorites.length} treasure{favorites.length!==1?"s":""} saved</div>
                  {favorites.map(fav => (
                    <div key={fav.id} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", overflow:"hidden" }}>
                      {fav.place_photo && <img src={fav.place_photo} alt={fav.place_name} style={{ width:"100%", height:"110px", objectFit:"cover", filter:"brightness(0.85)" }}/>}
                      <div style={{ padding:"12px 14px" }}>
                        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"15px", color:"#F7F4EE", marginBottom:"3px" }}>{fav.place_name}</div>
                        {fav.place_address && <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)", marginBottom:"10px" }}>📍 {fav.place_address}</div>}
                        <div style={{ display:"flex", gap:"8px" }}>
                          <a href={`https://maps.google.com/?q=${encodeURIComponent((fav.place_name||"")+" "+(fav.place_address||""))}`} target="_blank" rel="noopener noreferrer" style={{ flex:1, padding:"7px 0", borderRadius:"8px", textAlign:"center", background:"#D4A96A", color:"#0F2747", fontSize:"12px", fontWeight:600, textDecoration:"none", display:"block" }}>⚓ View on Maps</a>
                          <button onClick={()=>removeFavorite(fav.id)} style={{ padding:"7px 12px", borderRadius:"8px", border:"1px solid rgba(255,80,80,0.3)", background:"rgba(255,80,80,0.08)", color:"rgba(255,100,100,0.7)", cursor:"pointer", fontSize:"12px" }}>✕</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {tab === "account" && (
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", padding:"16px" }}>
                <div style={{ fontSize:"11px", color:"rgba(212,169,106,0.5)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"6px" }}>Email</div>
                <div style={{ color:"#F7F4EE", fontSize:"14px" }}>{user.email}</div>
              </div>
              <button onClick={handleLogout} style={{ marginTop:"8px", padding:"12px", borderRadius:"10px", border:"1px solid rgba(255,80,80,0.3)", background:"rgba(255,80,80,0.08)", color:"rgba(255,120,120,0.9)", cursor:"pointer", fontSize:"14px", fontWeight:600 }}>
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
