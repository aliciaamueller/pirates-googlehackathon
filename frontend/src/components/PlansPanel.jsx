import { useState, useEffect } from "react";
import { supabase } from "../supabase";

// ─── FORMAT PLAN DATE TIME ─────────────────────────────────────────
export function formatPlanDateTime(plan) {
  if (!plan?.plan_date) return null;
  const d = new Date(plan.plan_date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleString("en-GB", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── PLANS PANEL ──────────────────────────────────────────────────
export function PlansPanel({ user, onClose, onAddToplan, bounties }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPlanName, setNewPlanName] = useState("");
  const [creating, setCreating] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [planMembers, setPlanMembers] = useState([]);
  const [memberFavorites, setMemberFavorites] = useState([]);
  const [planPlaces, setPlanPlaces] = useState([]);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteMsg, setInviteMsg] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  const [joinToken, setJoinToken] = useState("");
  const [joinMsg, setJoinMsg] = useState("");
  const [planDateEnabled, setPlanDateEnabled] = useState(false);
  const [planDate, setPlanDate] = useState("");
  const [planTime, setPlanTime] = useState("20:00");
  const [pendingInvites, setPendingInvites] = useState([]);

  useEffect(() => { loadPlans(); loadPendingInvites(); }, []);

  async function loadPlans() {
    setLoading(true);
    const { data: memberOf } = await supabase.from("plan_members").select("plan_id").eq("user_id", user.id).eq("status", "accepted");
    if (!memberOf?.length) { setPlans([]); setLoading(false); return; }
    const ids = memberOf.map(m => m.plan_id);
    const { data } = await supabase.from("plans").select("*").in("id", ids);
    const parsePlanTime = (p) => {
      if (!p.plan_date) return null;
      const t = new Date(p.plan_date).getTime();
      return Number.isNaN(t) ? null : t;
    };
    const ranked = [...(data || [])].sort((a, b) => {
      const ta = parsePlanTime(a);
      const tb = parsePlanTime(b);
      if (ta == null && tb == null) return new Date(b.created_at) - new Date(a.created_at);
      if (ta == null) return 1;
      if (tb == null) return -1;
      if (ta !== tb) return ta - tb;
      return new Date(a.created_at) - new Date(b.created_at);
    });
    setPlans(ranked);
    setLoading(false);
  }

  async function loadPendingInvites() {
    const { data } = await supabase.from("plan_members").select("plan_id, status, plans(id, name, created_by, profiles(username, email))").eq("user_id", user.id).eq("status", "pending");
    setPendingInvites(data || []);
  }

  async function respondToInvite(planId, accept) {
    if (accept) { await supabase.from("plan_members").update({ status: "accepted" }).eq("plan_id", planId).eq("user_id", user.id); await loadPlans(); }
    else { await supabase.from("plan_members").delete().eq("plan_id", planId).eq("user_id", user.id); }
    loadPendingInvites();
  }

  async function createPlan() {
    if (!newPlanName.trim()) return;
    setCreating(true);
    const token = Math.random().toString(36).substring(2,10)+Math.random().toString(36).substring(2,10);
    const planData = { name: newPlanName.trim(), created_by: user.id, invite_token: token };
    if (planDateEnabled && planDate) planData.plan_date = planDate + (planTime ? "T" + planTime : "T20:00");
    const { data, error } = await supabase.from("plans").insert(planData).select().single();
    if (!error && data) {
      await supabase.from("plan_members").insert({ plan_id: data.id, user_id: user.id, status: "accepted" });
      setNewPlanName("");
      setPlanDateEnabled(false);
      setPlanDate("");
      setPlanTime("20:00");
      await loadPlans();
      openPlan(data);
    }
    setCreating(false);
  }

  async function openPlan(plan) {
    const { data: freshPlan } = await supabase.from("plans").select("*").eq("id", plan.id).single();
    setSelectedPlan(freshPlan || plan);
    const { data: members } = await supabase.from("plan_members").select("user_id").eq("plan_id", plan.id);
    const memberIds = (members || []).map(m => m.user_id);
    const { data: profiles } = await supabase.from("profiles").select("id, username, email").in("id", memberIds);
    setPlanMembers(profiles || []);
    const { data: favs } = await supabase.from("favorites").select("*, profiles(username, email)").in("user_id", memberIds);
    setMemberFavorites(favs || []);
    const { data: places } = await supabase.from("plan_places").select("*").eq("plan_id", plan.id);
    setPlanPlaces(places || []);
    setInviteMsg(""); setLinkCopied(false);
  }

  async function inviteByEmail() {
    setInviteMsg("");
    if (!inviteEmail.trim()) return;
    const { data: profile } = await supabase.from("profiles").select("id").eq("email", inviteEmail.trim()).single();
    if (!profile) { setInviteMsg("No RUMBO account found with that email."); return; }
    if (planMembers.find(m => m.id === profile.id)) { setInviteMsg("Already in this plan!"); return; }
    await supabase.from("plan_members").insert({ plan_id: selectedPlan.id, user_id: profile.id, status: "pending" });
    setInviteMsg("Friend added!");
    setInviteEmail("");
    openPlan(selectedPlan);
  }

  function copyInviteLink() {
    const link = `${window.location.origin}?join=${selectedPlan.invite_token}`;
    navigator.clipboard.writeText(link).then(() => { setLinkCopied(true); setTimeout(() => setLinkCopied(false), 3000); });
  }

  async function joinByToken() {
    setJoinMsg("");
    if (!joinToken.trim()) return;
    const token = joinToken.trim().includes("?join=") ? joinToken.trim().split("?join=")[1] : joinToken.trim();
    const { data: plan } = await supabase.from("plans").select("*").eq("invite_token", token).single();
    if (!plan) { setJoinMsg("Invalid invite code."); return; }
    const { data: existing } = await supabase.from("plan_members").select("user_id").eq("plan_id", plan.id).eq("user_id", user.id).single();
    if (existing) { setJoinMsg("Already in this plan!"); return; }
    await supabase.from("plan_members").insert({ plan_id: plan.id, user_id: user.id, status: "accepted" });
    setJoinMsg("Joined!");
    setJoinToken("");
    await loadPlans();
    setTimeout(() => { openPlan(plan); setJoinMsg(""); }, 800);
  }

  function exportToGoogleCalendar() {
    if (!planPlaces.length) return;
    const baseTime = new Date();
    baseTime.setHours(20, 0, 0, 0); // starts at 8pm

    planPlaces.forEach((place, i) => {
      const start = new Date(baseTime.getTime() + i * 90 * 60000); // 90 min per place
      const end = new Date(start.getTime() + 90 * 60000);
      const fmt = d => d.toISOString().replace(/[-:]/g,'').split('.')[0] + 'Z';
      const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: place.place_name || 'RUMBO Stop',
        dates: `${fmt(start)}/${fmt(end)}`,
        details: `Added via RUMBO\n${place.place_address || ''}`,
        location: place.place_address || 'Madrid',
      });
      setTimeout(() => {
        window.open(`https://calendar.google.com/calendar/render?${params}`, '_blank');
      }, i * 400);
    });
  }

  async function removePlanPlace(id) {
    await supabase.from("plan_places").delete().eq("id", id);
    setPlanPlaces(p => p.filter(pl => pl.id !== id));
  }

  const inp = { padding:"10px 14px", borderRadius:"8px", border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.07)", color:"white", fontSize:"14px", outline:"none", width:"100%", boxSizing:"border-box" };

  return (
    <div style={{ position:"fixed", inset:0, zIndex:300, background:"rgba(0,0,0,0.6)", backdropFilter:"blur(4px)", display:"flex", justifyContent:"flex-end" }} onClick={onClose}>
      <div style={{ width:"100%", maxWidth:"480px", height:"100%", background:"#0F2747", overflowY:"auto", borderLeft:"1px solid rgba(212,169,106,0.2)", boxShadow:"-20px 0 60px rgba(0,0,0,0.4)", display:"flex", flexDirection:"column" }} onClick={e=>e.stopPropagation()}>

        <div style={{ padding:"28px 24px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"22px", color:"#F7F4EE", fontWeight:700 }}>
                {selectedPlan ? selectedPlan.name : "Crew Plans"}
              </div>
              <div style={{ fontSize:"12px", color:"rgba(212,169,106,0.6)", marginTop:"2px" }}>
                {selectedPlan ? (formatPlanDateTime(selectedPlan) || "No date set") : "Plan adventures together"}
              </div>
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              {selectedPlan && (
                <button onClick={() => { setSelectedPlan(null); setPlanMembers([]); setMemberFavorites([]); setPlanPlaces([]); }} style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"rgba(255,255,255,0.6)", padding:"6px 14px", borderRadius:"20px", cursor:"pointer", fontSize:"13px" }}>← Back</button>
              )}
              <button onClick={onClose} style={{ background:"rgba(255,255,255,0.07)", border:"none", color:"rgba(255,255,255,0.5)", width:"32px", height:"32px", borderRadius:"50%", cursor:"pointer", fontSize:"16px" }}>✕</button>
            </div>
          </div>
        </div>

        <div style={{ flex:1, padding:"20px 24px", overflowY:"auto" }}>
          {!selectedPlan ? (
            <>
              <div style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(212,169,106,0.2)", borderRadius:"12px", padding:"16px", marginBottom:"14px" }}>
                <div style={{ fontSize:"11px", color:"rgba(212,169,106,0.6)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"10px" }}>Create New Plan</div>
                <div style={{ display:"flex", gap:"8px", marginBottom: planDateEnabled ? "12px" : "0" }}>
                  <input placeholder="e.g. Friday Night in Malasaña" value={newPlanName} onChange={e=>setNewPlanName(e.target.value)} onKeyDown={e=>e.key==="Enter"&&createPlan()} style={inp}/>
                  <button onClick={createPlan} disabled={creating||!newPlanName.trim()} style={{ padding:"10px 16px", borderRadius:"8px", border:"none", background:"#D4A96A", color:"#0F2747", fontWeight:700, cursor:"pointer", whiteSpace:"nowrap", opacity:creating||!newPlanName.trim()?0.5:1 }}>
                    {creating?"...":"Create"}
                  </button>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", marginTop:"10px" }}>
                  <button onClick={()=>setPlanDateEnabled(p=>!p)} style={{
                    display:"flex", alignItems:"center", gap:"8px", background:"none", border:"none",
                    cursor:"pointer", padding:0,
                  }}>
                    <div style={{
                      width:"36px", height:"20px", borderRadius:"10px", position:"relative",
                      background: planDateEnabled ? "#D4A96A" : "rgba(255,255,255,0.15)",
                      transition:"background 0.2s",
                    }}>
                      <div style={{
                        position:"absolute", top:"3px",
                        left: planDateEnabled ? "19px" : "3px",
                        width:"14px", height:"14px", borderRadius:"50%",
                        background:"white", transition:"left 0.2s",
                      }}/>
                    </div>
                    <span style={{ fontSize:"12px", color: planDateEnabled ? "#D4A96A" : "rgba(255,255,255,0.4)", fontWeight:500 }}>
                      Add plan date & time
                    </span>
                  </button>
                </div>
                {planDateEnabled && (
                  <div style={{ marginTop:"10px", display:"flex", gap:"8px", animation:"fadeUp 0.2s ease" }}>
                    <input
                      type="date"
                      value={planDate}
                      onChange={e=>setPlanDate(e.target.value)}
                      style={{ ...inp, flex:1, colorScheme:"dark" }}
                    />
                    <input
                      type="time"
                      value={planTime}
                      onChange={e=>setPlanTime(e.target.value)}
                      style={{ ...inp, width:"110px", colorScheme:"dark" }}
                    />
                  </div>
                )}
              </div>

              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"16px", marginBottom:"20px" }}>
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"10px" }}>Join with Invite Code</div>
                <div style={{ display:"flex", gap:"8px" }}>
                  <input placeholder="Paste code here" value={joinToken} onChange={e=>setJoinToken(e.target.value)} onKeyDown={e=>e.key==="Enter"&&joinByToken()} style={inp}/>
                  <button onClick={joinByToken} disabled={!joinToken.trim()} style={{ padding:"10px 16px", borderRadius:"8px", border:"none", background:"rgba(255,255,255,0.1)", color:"white", fontWeight:600, cursor:"pointer", whiteSpace:"nowrap", opacity:!joinToken.trim()?0.4:1 }}>Join</button>
                </div>
                {joinMsg && <div style={{ marginTop:"8px", fontSize:"13px", color:joinMsg==="Joined!"?"#51cf66":joinMsg.includes("Already")?"#ffd54f":"#ff6b6b" }}>{joinMsg}</div>}
              </div>

              {pendingInvites.length > 0 && (
                <div style={{ background:"rgba(212,169,106,0.08)", border:"1px solid rgba(212,169,106,0.3)", borderRadius:"12px", padding:"14px", marginBottom:"14px" }}>
                  <div style={{ fontSize:"11px", color:"rgba(212,169,106,0.8)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"12px" }}>Pending Invitations ({pendingInvites.length})</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                    {pendingInvites.map(inv => (
                      <div key={inv.plan_id} style={{ background:"rgba(0,0,0,0.2)", borderRadius:"10px", padding:"12px 14px" }}>
                        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"15px", color:"#F7F4EE", marginBottom:"4px" }}>{inv.plans?.name || "A plan"}</div>
                        <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.4)", marginBottom:"12px" }}>Invited by {inv.plans?.profiles?.username || inv.plans?.profiles?.email?.split("@")[0] || "a friend"}</div>
                        <div style={{ display:"flex", gap:"8px" }}>
                          <button onClick={()=>respondToInvite(inv.plan_id, true)} style={{ flex:1, padding:"9px", borderRadius:"8px", border:"none", background:"#51cf66", color:"white", fontWeight:700, cursor:"pointer", fontSize:"13px" }}>Accept</button>
                          <button onClick={()=>respondToInvite(inv.plan_id, false)} style={{ flex:1, padding:"9px", borderRadius:"8px", border:"1px solid rgba(255,80,80,0.3)", background:"rgba(255,80,80,0.1)", color:"rgba(255,120,120,0.9)", fontWeight:600, cursor:"pointer", fontSize:"13px" }}>Decline</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {loading ? (
                <div style={{ color:"rgba(255,255,255,0.3)", textAlign:"center", padding:"40px 0" }}>Loading plans...</div>
              ) : plans.length === 0 ? (
                <div style={{ textAlign:"center", padding:"40px 0", color:"rgba(255,255,255,0.3)", fontSize:"14px", lineHeight:1.6 }}>
                  No plans yet.<br/>Create one and invite your crew!
                </div>
              ) : (
                <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                  <div style={{ fontSize:"11px", color:"rgba(212,169,106,0.5)", letterSpacing:"0.1em", textTransform:"uppercase", marginBottom:"4px" }}>{plans.length} plan{plans.length!==1?"s":""}</div>
                  {plans.map(plan => (
                    <div key={plan.id} style={{ display:"flex", gap:"8px" }}>
                      <button onClick={()=>openPlan(plan)} style={{ flex:1, background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"12px", padding:"16px", cursor:"pointer", textAlign:"left", color:"inherit", transition:"all 0.2s" }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(255,255,255,0.09)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(255,255,255,0.05)"}>
                        <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"16px", color:"#F7F4EE", marginBottom:"4px" }}>{plan.name}</div>
                        <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)" }}>{formatPlanDateTime(plan) || "No date set"}</div>
                      </button>
                      <button title="Delete plan" onClick={async()=>{ if(!window.confirm("Delete this plan?")) return; await supabase.from("plan_members").delete().eq("plan_id",plan.id); await supabase.from("plans").delete().eq("id",plan.id).eq("created_by",user.id); loadPlans(); }} style={{ background:"rgba(255,80,80,0.08)", border:"1px solid rgba(255,80,80,0.2)", borderRadius:"12px", padding:"0 12px", cursor:"pointer", color:"rgba(255,100,100,0.9)", fontSize:"12px", fontWeight:600, flexShrink:0 }}>Delete</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              {/* Invite link */}
              <div style={{ background:"rgba(212,169,106,0.08)", border:"1px solid rgba(212,169,106,0.25)", borderRadius:"12px", padding:"14px", marginBottom:"12px" }}>
                <div style={{ fontSize:"11px", color:"rgba(212,169,106,0.7)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"10px" }}>Invite Code</div>
                <div style={{ display:"flex", gap:"8px" }}>
                  <div style={{ flex:1, background:"rgba(0,0,0,0.3)", borderRadius:"10px", padding:"14px 16px", fontSize:"22px", fontWeight:700, color:"#D4A96A", textAlign:"center", letterSpacing:"0.25em", fontFamily:"monospace" }}>
                    {selectedPlan.invite_token?.toUpperCase()||"..."}
                  </div>
                  <button onClick={()=>{ navigator.clipboard.writeText(selectedPlan.invite_token?.toUpperCase()||"").then(()=>{setLinkCopied(true);setTimeout(()=>setLinkCopied(false),3000);}); }} style={{ padding:"8px 14px", borderRadius:"8px", border:"none", background:linkCopied?"#51cf66":"#D4A96A", color:"#0F2747", fontWeight:700, cursor:"pointer", fontSize:"13px", transition:"all 0.2s" }}>
                    {linkCopied?"Copied!":"Copy"}
                  </button>
                </div>
              </div>

              {/* Invite by email */}
              <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.07)", borderRadius:"12px", padding:"14px", marginBottom:"12px" }}>
                <div style={{ fontSize:"11px", color:"rgba(255,255,255,0.4)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"10px" }}>Invite by Email</div>
                <div style={{ display:"flex", gap:"8px" }}>
                  <input type="email" placeholder="friend@email.com" value={inviteEmail} onChange={e=>setInviteEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&inviteByEmail()} style={inp}/>
                  <button onClick={inviteByEmail} style={{ padding:"10px 14px", borderRadius:"8px", border:"none", background:"rgba(255,255,255,0.1)", color:"white", fontWeight:600, cursor:"pointer" }}>Add</button>
                </div>
                {inviteMsg && <div style={{ marginTop:"8px", fontSize:"13px", color:inviteMsg==="Friend added!"?"#51cf66":inviteMsg.includes("Already")?"#ffd54f":"#ff6b6b" }}>{inviteMsg}</div>}
              </div>

              {/* Members */}
              <div style={{ marginBottom:"16px" }}>
                <div style={{ fontSize:"11px", color:"rgba(212,169,106,0.5)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px" }}>Crew ({planMembers.length})</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                  {planMembers.map(member => (
                    <div key={member.id} style={{ display:"flex", alignItems:"center", gap:"6px", background:"rgba(255,255,255,0.06)", borderRadius:"20px", padding:"5px 12px 5px 8px" }}>
                      <span style={{ color:"#F7F4EE", fontSize:"13px" }}>{member.username||member.email?.split("@")[0]}{member.id===user.id?" (you)":""}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plan places */}
              <div style={{ marginBottom:"16px" }}>
                <div style={{ fontSize:"11px", color:"rgba(212,169,106,0.5)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px" }}>Plan Places ({planPlaces.length})</div>
                {planPlaces.length === 0 ? (
                  <div style={{ background:"rgba(255,255,255,0.04)", border:"1px dashed rgba(255,255,255,0.1)", borderRadius:"12px", padding:"24px", textAlign:"center" }}>
                    <div style={{ color:"rgba(255,255,255,0.4)", fontSize:"13px", marginBottom:"12px" }}>No places added yet.<br/>Search for places and use <strong style={{color:"#D4A96A"}}>+</strong> to add them here.</div>
                    <button onClick={onClose} style={{ background:"#D4A96A", color:"#0F2747", border:"none", borderRadius:"20px", padding:"8px 20px", cursor:"pointer", fontSize:"13px", fontWeight:700 }}>
                      Find Places
                    </button>
                  </div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                    {planPlaces.map(place => (
                      <div key={place.id} style={{ display:"flex", gap:"10px", alignItems:"center", background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", padding:"10px 12px" }}>
                        {place.place_photo && <img src={place.place_photo} style={{ width:"48px", height:"48px", borderRadius:"8px", objectFit:"cover" }}/>}
                        <div style={{ flex:1 }}>
                          <div style={{ color:"#F7F4EE", fontSize:"14px", fontFamily:"'Playfair Display',serif" }}>{place.place_name}</div>
                          {place.place_address && <div style={{ color:"rgba(255,255,255,0.35)", fontSize:"12px" }}>{place.place_address}</div>}
                        </div>
                        <button onClick={()=>removePlanPlace(place.id)} style={{ background:"none", border:"none", color:"rgba(255,80,80,0.5)", cursor:"pointer", fontSize:"16px", padding:"4px" }}>✕</button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Export to Google Calendar */}
              {planPlaces.length > 0 && (
                <div style={{ marginBottom:"16px" }}>
                  <button onClick={exportToGoogleCalendar} style={{
                    width:"100%", padding:"12px", borderRadius:"12px",
                    border:"1px solid rgba(66,133,244,0.4)",
                    background:"rgba(66,133,244,0.1)", color:"#6ba3f5",
                    cursor:"pointer", fontSize:"13px", fontWeight:600,
                    display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                    transition:"all 0.2s",
                  }}
                  onMouseEnter={e=>{e.currentTarget.style.background="rgba(66,133,244,0.2)"}}
                  onMouseLeave={e=>{e.currentTarget.style.background="rgba(66,133,244,0.1)"}}>
                    Export to Google Calendar ({planPlaces.length} stop{planPlaces.length!==1?"s":""})
                  </button>
                </div>
              )}

              {/* Crew favorites */}
              <div>
                <div style={{ fontSize:"11px", color:"rgba(212,169,106,0.5)", textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:"8px" }}>Crew Favorites ({memberFavorites.length})</div>
                {memberFavorites.length === 0 ? (
                  <div style={{ color:"rgba(255,255,255,0.3)", fontSize:"13px", textAlign:"center", padding:"16px 0" }}>No favorites saved yet by crew.</div>
                ) : (
                  <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
                    {memberFavorites.map(fav => (
                      <div key={fav.id} style={{ background:"rgba(255,255,255,0.05)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:"10px", overflow:"hidden" }}>
                        {fav.place_photo && <img src={fav.place_photo} alt={fav.place_name} style={{ width:"100%", height:"80px", objectFit:"cover", filter:"brightness(0.85)" }}/>}
                        <div style={{ padding:"10px 12px" }}>
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:"14px", color:"#F7F4EE" }}>{fav.place_name}</div>
                            <span style={{ fontSize:"11px", color:"rgba(212,169,106,0.7)", marginLeft:"8px", background:"rgba(212,169,106,0.1)", padding:"2px 8px", borderRadius:"10px", whiteSpace:"nowrap" }}>
                              {fav.profiles?.username||fav.profiles?.email?.split("@")[0]}
                            </span>
                          </div>
                          {fav.place_address && <div style={{ fontSize:"12px", color:"rgba(255,255,255,0.35)", marginTop:"2px" }}>{fav.place_address}</div>}
                          <a href={`https://maps.google.com/?q=${encodeURIComponent((fav.place_name||"")+" "+(fav.place_address||""))}`} target="_blank" rel="noopener noreferrer" style={{ display:"block", marginTop:"8px", padding:"5px 0", borderRadius:"6px", textAlign:"center", background:"rgba(212,169,106,0.12)", color:"#D4A96A", fontSize:"12px", fontWeight:600, textDecoration:"none" }}>View on Maps</a>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default PlansPanel;
