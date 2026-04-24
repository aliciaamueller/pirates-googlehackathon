import { useEffect, useState } from "react";
import { supabase } from "../supabase";

// ─── AUTH SCREEN ──────────────────────────────────────────────────
export function AuthScreen({ onLogin, onBack = null, initialMode = "login" }) {
  const [isLogin, setIsLogin] = useState(initialMode !== "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    setIsLogin(initialMode !== "signup");
  }, [initialMode]);

  const handleSubmit = async () => {
    setLoading(true); setError(""); setMessage("");
    if (isLogin) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onLogin(data.user);
    } else {
      if (!username.trim()) { setError("Username is required"); setLoading(false); return; }
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); }
      else { setMessage("Account created! Check your email to confirm, then log in."); }
    }
    setLoading(false);
  };

  const inp = { padding:"13px 16px", borderRadius:"10px", border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.07)", color:"white", fontSize:"15px", outline:"none", width:"100%", boxSizing:"border-box" };

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(160deg,#F7F4EE 0%,#EDE6D4 60%,#e0d8c0 100%)" }}>
      <div style={{ background:"#0F2747", borderRadius:"24px", padding:"48px", width:"100%", maxWidth:"420px", boxShadow:"0 25px 60px rgba(15,39,71,0.35)", border:"1px solid rgba(212,169,106,0.2)" }}>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            style={{ background:"transparent", border:"none", color:"rgba(212,169,106,0.9)", cursor:"pointer", fontSize:"13px", marginBottom:"18px" }}
          >
            ← Back
          </button>
        )}
        <div style={{ textAlign:"center", marginBottom:"32px" }}>
          <div style={{ fontSize:"44px", marginBottom:"8px" }}>🧭</div>
          <h1 style={{ color:"#F7F4EE", fontSize:"26px", fontFamily:"'Playfair Display',serif", fontWeight:700, margin:0 }}>RUMBO</h1>
          <p style={{ color:"rgba(212,169,106,0.7)", marginTop:"6px", fontSize:"13px", fontStyle:"italic" }}>AI Pirate Navigator · Madrid</p>
        </div>
        <div style={{ display:"flex", background:"rgba(255,255,255,0.05)", borderRadius:"10px", padding:"4px", marginBottom:"24px" }}>
          {["Log In","Sign Up"].map((tab,i) => (
            <button key={tab} onClick={() => { setIsLogin(i===0); setError(""); setMessage(""); }} style={{ flex:1, padding:"10px", borderRadius:"8px", border:"none", cursor:"pointer", fontWeight:600, fontSize:"14px", background:(isLogin?i===0:i===1)?"#D4A96A":"transparent", color:(isLogin?i===0:i===1)?"#0F2747":"rgba(255,255,255,0.4)" }}>{tab}</button>
          ))}
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          {!isLogin && <input type="text" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} style={inp}/>}
          <input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={inp}/>
          <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} style={inp}/>
        </div>
        {error && <div style={{ marginTop:"14px", padding:"10px 14px", background:"rgba(255,80,80,0.12)", border:"1px solid rgba(255,80,80,0.25)", borderRadius:"8px", color:"#ff6b6b", fontSize:"13px" }}>{error}</div>}
        {message && <div style={{ marginTop:"14px", padding:"10px 14px", background:"rgba(80,200,120,0.12)", border:"1px solid rgba(80,200,120,0.25)", borderRadius:"8px", color:"#51cf66", fontSize:"13px" }}>{message}</div>}
        <button onClick={handleSubmit} disabled={loading} style={{ width:"100%", marginTop:"20px", padding:"14px", borderRadius:"10px", border:"none", cursor:loading?"not-allowed":"pointer", background:loading?"rgba(255,255,255,0.1)":"#D4A96A", color:"#0F2747", fontWeight:700, fontSize:"15px", opacity:loading?0.6:1 }}>
          {loading?"Loading...":isLogin?"Log In ⚓":"Create Account 🗺️"}
        </button>
      </div>
    </div>
  );
}

export default AuthScreen;
