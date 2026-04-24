// ─── BASE STYLES ──────────────────────────────────────────────────
export const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400;500&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { background: #0F2747; font-family: 'DM Sans', sans-serif; min-height: 100vh; overflow-x: hidden; }

  /* Brief screen: cream sky → teal → deep navy + star speckle (fused with chest deck) */
  .brief-bg-layer {
    background: linear-gradient(165deg,
      #eef4f8 0%,
      #d4e6ef 12%,
      #7fa3b8 36%,
      #2a4a62 58%,
      #0f1f34 78%,
      #050a12 100%);
  }
  .brief-bg-layer::after {
    content: "";
    position: absolute;
    inset: 0;
    pointer-events: none;
    opacity: 0.65;
    background-image:
      radial-gradient(1.5px 1.5px at 8% 18%, rgba(255,255,255,0.95) 50%, transparent 50%),
      radial-gradient(1px 1px at 22% 42%, rgba(255,255,255,0.75) 50%, transparent 50%),
      radial-gradient(1.2px 1.2px at 38% 12%, rgba(255,255,255,0.85) 50%, transparent 50%),
      radial-gradient(1px 1px at 55% 28%, rgba(255,255,255,0.55) 50%, transparent 50%),
      radial-gradient(1.4px 1.4px at 71% 48%, rgba(255,255,255,0.9) 50%, transparent 50%),
      radial-gradient(1px 1px at 88% 22%, rgba(255,255,255,0.65) 50%, transparent 50%),
      radial-gradient(1.2px 1.2px at 14% 68%, rgba(255,255,255,0.8) 50%, transparent 50%),
      radial-gradient(1px 1px at 33% 82%, rgba(255,255,255,0.5) 50%, transparent 50%),
      radial-gradient(1.3px 1.3px at 52% 72%, rgba(255,255,255,0.88) 50%, transparent 50%),
      radial-gradient(1px 1px at 67% 88%, rgba(255,255,255,0.6) 50%, transparent 50%),
      radial-gradient(1.5px 1.5px at 84% 62%, rgba(255,255,255,0.92) 50%, transparent 50%),
      radial-gradient(1px 1px at 93% 90%, rgba(255,255,255,0.55) 50%, transparent 50%),
      radial-gradient(2px 2px at 48% 55%, rgba(212,169,106,0.35) 50%, transparent 50%),
      radial-gradient(1.2px 1.2px at 76% 12%, rgba(255,255,255,0.7) 50%, transparent 50%);
    mix-blend-mode: screen;
  }

  /* NAVBAR */
  .navbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 100;
    display: flex; align-items: center; justify-content: space-between;
    padding: 0 2.5rem; height: 68px;
    background: rgba(247,244,238,0.94); backdrop-filter: blur(14px);
    border-bottom: 1px solid rgba(180,140,60,0.2);
  }
  .nav-brand { display: flex; align-items: center; gap: 10px; cursor: pointer; }
  .nav-title { font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:700; color:#0F2747; letter-spacing:0.05em; }
  .nav-sub { font-size:0.57rem; letter-spacing:0.18em; color:#B8860B; text-transform:uppercase; font-weight:500; }
  .nav-links { display:flex; gap:2rem; list-style:none; }
  .nav-links a { font-size:0.85rem; color:#4a3820; text-decoration:none; transition:color 0.2s; }
  .nav-links a:hover { color:#0F2747; }
  .nav-cta {
    display:flex; align-items:center; gap:8px; background:#0F2747; color:white;
    padding:0.6rem 1.4rem; border-radius:40px; font-size:0.82rem; font-weight:500;
    border:none; cursor:pointer; transition:all 0.2s;
  }
  .nav-cta:hover { background:#1a3a6a; transform:translateY(-1px); }

  /* HERO */
  .hero {
    min-height: 100vh; padding-top: 68px;
    display: grid; grid-template-columns: 1fr 1fr;
    align-items: center; gap: 3rem;
    max-width: 1200px; margin: 0 auto; padding-left:3rem; padding-right:3rem;
    position: relative; z-index: 1;
  }
  .hero-brief-unified {
    grid-template-columns: 1fr;
    max-width: 920px;
    align-items: start;
    gap: 0;
    padding-top: 104px;
    padding-bottom: 4rem;
  }
  .brief-hero-column { width: 100%; position: relative; z-index: 1; }

  /* INPUT CARD */
  .input-card {
    background:rgba(255,255,255,0.9); backdrop-filter:blur(16px);
    border:1px solid #E0D4B8; border-radius:20px; padding:1.75rem;
    box-shadow:0 8px 40px rgba(15,39,71,0.12);
  }
  .input-card-fused {
    background: transparent;
    border: none;
    box-shadow: none;
    padding: 0;
    backdrop-filter: none;
  }
  .chest-hero-scene {
    position: relative;
    border-radius: 20px 20px 0 0;
    margin-bottom: 0;
    min-height: 520px;
    display: flex;
    flex-direction: column;
    background:
      radial-gradient(ellipse 90% 70% at 50% 100%, rgba(74,140,180,0.22) 0%, transparent 55%),
      linear-gradient(175deg, #0d1f3c 0%, #1a3a6a 40%, #0a1628 100%);
    border: 2px solid rgba(212,169,106,0.3);
    border-bottom: none;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.06),
      0 16px 56px rgba(0,0,0,0.45),
      0 0 90px rgba(30,80,120,0.18);
    overflow: hidden;
    animation: pulseGlow 4s ease-in-out infinite;
  }
  .brief-hero-starfield {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    opacity: 0.88;
  }
  .brief-float { position: absolute; z-index: 1; pointer-events: none; }
  .brief-float--compass { bottom: 8%; left: 4%; animation: floatSlow 4.5s 0.5s ease-in-out infinite; opacity: 0.42; }
  .brief-float--coin { top: 10%; right: 6%; animation: float 2.8s 1.2s ease-in-out infinite; opacity: 0.52; }
  .brief-float--scroll { top: 36%; left: 3%; animation: float 3.6s 0.2s ease-in-out infinite; opacity: 0.36; }
  .brief-float--ship { top: 6%; right: 4%; animation: floatSlow 5s 0.8s ease-in-out infinite; opacity: 0.32; }
  .chest-hero-scene-main {
    position: relative;
    z-index: 2;
    flex: 1;
    padding: 1.5rem 0.75rem 0.5rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .chest-scene-footer {
    position: relative;
    z-index: 2;
    padding: 1.25rem 1rem 1.2rem;
    text-align: center;
    background: linear-gradient(0deg, rgba(5,10,24,0.95) 0%, rgba(5,10,24,0.2) 100%);
  }
  .chest-scene-quote {
    font-family: 'Crimson Text', serif;
    font-size: 1rem;
    font-style: italic;
    color: rgba(212,169,106,0.88);
    text-shadow: 0 2px 14px rgba(0,0,0,0.55);
    margin-bottom: 0.45rem;
  }
  .chest-scene-brand {
    font-size: 0.66rem;
    letter-spacing: 0.24em;
    text-transform: uppercase;
    color: #D4A96A;
    margin-bottom: 0.6rem;
  }
  .brief-hero-footer-icons {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.85rem;
    opacity: 0.75;
  }
  .chest-picker-mascot { align-items: end; }
  .chest-tile-mascot {
    --chest-accent: #C8A84B;
    background: transparent;
    border: none;
    padding: 0.4rem 0.25rem 0.65rem;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    transition: transform 0.22s ease;
    animation: chestFloat 5.6s ease-in-out infinite;
  }
  .chest-tile-mascot:nth-child(1) { animation-delay: 0s; }
  .chest-tile-mascot:nth-child(2) { animation-delay: 0.25s; }
  .chest-tile-mascot:nth-child(3) { animation-delay: 0.5s; }
  .chest-tile-mascot:nth-child(4) { animation-delay: 0.75s; }
  .chest-tile-mascot:hover { transform: translateY(-3px); }
  .treasure-chest-mascot {
    width: 100%;
    max-width: min(210px, 30vw);
    margin: 0 auto;
    animation: float 3.1s ease-in-out infinite;
    filter: drop-shadow(0 14px 28px rgba(0,0,0,0.5));
  }
  .treasure-chest-mascot-svg { width: 100%; height: auto; display: block; transition: transform 0.3s ease, filter 0.3s ease; }
  .chest-tile-mascot:hover .treasure-chest-mascot-svg { transform: translateY(-5px) scale(1.03); }
  .chest-tile-mascot.sel .treasure-chest-mascot {
    filter: drop-shadow(0 18px 40px rgba(212,169,106,0.42)) drop-shadow(0 0 24px rgba(212,169,106,0.25));
  }
  .chest-tile-mascot.sel .treasure-chest-mascot-svg { transform: translateY(-4px) scale(1.04); }
  .chest-tile-mascot-labels { margin-top: 0.55rem; text-align: center; max-width: 12rem; }
  .chest-mascot-title {
    font-family: 'Playfair Display', serif;
    font-size: 0.74rem;
    font-weight: 700;
    letter-spacing: 0.07em;
    text-transform: uppercase;
    color: #f7e8c8;
    text-shadow: 0 2px 12px rgba(0,0,0,0.65);
    display: block;
    line-height: 1.2;
  }
  .chest-mascot-sub {
    font-family: 'Crimson Text', serif;
    font-size: 0.8rem;
    font-style: italic;
    color: rgba(232,216,190,0.84);
    display: block;
    margin-top: 0.15rem;
    line-height: 1.3;
  }
  .features-bar-brief .feat-glyph { font-size: 0.55rem; color: #B8860B; opacity: 0.85; margin-right: 2px; }
  .role-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: linear-gradient(135deg, #D4A96A, #8B6914);
    margin: 0 auto 0.35rem;
    display: block;
  }
  .chest-deck-label {
    position: relative;
    z-index: 1;
    font-family: 'Playfair Display', serif;
    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: #e8c87a;
    text-shadow: 0 2px 16px rgba(0,0,0,0.45);
    display: block;
    margin-bottom: 0.35rem;
    text-align: center;
  }
  .chest-deck-tagline {
    position: relative;
    z-index: 1;
    font-family: 'Crimson Text', serif;
    font-style: italic;
    font-size: 0.88rem;
    color: rgba(232,216,180,0.78);
    text-align: center;
    margin-bottom: 1.1rem;
    line-height: 1.45;
  }
  .input-card-body {
    position: relative;
    background: rgba(255,255,255,0.94);
    backdrop-filter: blur(18px);
    border: 1px solid #E0D4B8;
    border-top: 1px solid rgba(212,169,106,0.28);
    border-radius: 0 0 20px 20px;
    padding: 1.65rem 1.75rem 1.75rem;
    box-shadow: 0 16px 48px rgba(15,39,71,0.14);
  }
  .input-label { font-size:0.7rem; font-weight:500; letter-spacing:0.12em; text-transform:uppercase; color:#8a7a5a; margin-bottom:0.6rem; display:block; }
  .input-textarea {
    width:100%; background:#F7F4EE; border:1.5px solid #E0D4B8; border-radius:10px;
    color:#1a1208; font-family:'Crimson Text',serif; font-size:1.05rem; line-height:1.6;
    padding:0.9rem 1rem; resize:none; min-height:72px; outline:none; transition:border-color 0.2s;
  }
  .input-textarea::placeholder { color:#b0a080; font-style:italic; }
  .input-textarea:focus { border-color:#D4A96A; }
  .chips-label { font-size:0.68rem; letter-spacing:0.1em; text-transform:uppercase; color:#8a7a5a; margin-bottom:0.5rem; display:block; font-weight:500; }
  .chips-row { display:flex; flex-wrap:wrap; gap:0.4rem; margin-bottom:0.6rem; }
  .chip {
    background:white; border:1.5px solid #E0D4B8; border-radius:40px;
    padding:0.3rem 0.85rem; font-size:0.8rem; color:#4a3820;
    cursor:pointer; transition:all 0.15s; white-space:nowrap;
  }
  .chip:hover { border-color:#D4A96A; color:#0F2747; }
  .chip.sel { background:#0F2747; border-color:#0F2747; color:white; }
  .chip.surprise { border-style:dashed; border-color:rgba(212,169,106,0.5); color:#8B6914; }
  .chip.surprise.sel { background:#B8860B; border-color:#B8860B; color:white; border-style:solid; }
  .chest-picker-grid { display:grid; grid-template-columns:repeat(4, minmax(0, 1fr)); gap:1.15rem; align-items:stretch; position:relative; z-index:1; }
  .brief-tabs {
    display:flex; gap:0; margin-bottom:1rem; background:rgba(247,244,238,0.75); border-radius:14px;
    padding:5px; border:1px solid #E0D4B8;
  }
  .brief-tab {
    flex:1; border:none; background:transparent; padding:0.7rem 0.85rem;
    font-size:0.68rem; font-weight:700; letter-spacing:0.14em; color:#8a7a5a; cursor:pointer;
    border-radius:11px; transition:all 0.22s; font-family:'DM Sans',sans-serif; text-transform:uppercase;
  }
  .brief-tab.sel { background:#0F2747; color:#F7F4EE; box-shadow:0 4px 14px rgba(15,39,71,0.18); }
  .brief-tab:hover:not(.sel) { color:#0F2747; background:rgba(255,255,255,0.5); }
  .capitan-row { display:flex; align-items:center; justify-content:space-between; gap:0.75rem; margin-bottom:0.55rem; }
  .capitan-plus {
    flex-shrink:0; width:42px; height:42px; border-radius:50%; border:1.5px solid #E0D4B8; background:#FDF8F1;
    color:#0F2747; font-size:1.5rem; font-weight:300; line-height:1; cursor:pointer;
    display:flex; align-items:center; justify-content:center; transition:all 0.22s;
    font-family:'DM Sans',sans-serif;
  }
  .capitan-plus:hover { border-color:#D4A96A; background:white; transform:scale(1.06); box-shadow:0 4px 14px rgba(15,39,71,0.1); }
  .capitan-plus.open { background:#0F2747; color:#F7F4EE; border-color:#0F2747; }
  .captain-extras { margin-top:0.85rem; padding:0.9rem; border-radius:14px; border:1px dashed rgba(212,169,106,0.5);
    background:rgba(212,169,106,0.07); animation:fadeUp 0.32s ease;
  }
  .club-filter-panel {
    margin-top:0.7rem; padding:0.7rem 0.75rem; border-radius:12px;
    border:1px solid rgba(212,169,106,0.35); background:rgba(212,169,106,0.06);
    animation:fadeUp 0.32s ease;
  }
  .club-filter-grid { display:grid; grid-template-columns:1fr; gap:0.25rem; }
  .roles-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:0.5rem; margin-bottom:1rem; }
  .role-chip { background:white; border:1.5px solid #E0D4B8; border-radius:10px; padding:0.6rem 0.4rem; cursor:pointer; transition:all 0.15s; text-align:center; }
  .role-chip:hover { border-color:#D4A96A; }
  .role-chip.sel { background:rgba(15,39,71,0.05); border-color:#0F2747; }
  .role-name { font-size:0.65rem; color:#0F2747; display:block; font-weight:500; line-height:1.3; }
  .role-desc { font-size:0.62rem; color:#8a7a5a; font-style:italic; display:block; }
  .sail-btn {
    width:100%; margin-top:1.2rem; background:#0F2747; color:white; border:none; border-radius:12px;
    padding:0.95rem; font-size:0.9rem; font-weight:500; letter-spacing:0.08em;
    cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px; text-transform:uppercase;
  }
  .sail-btn:hover:not(:disabled) { background:#1a3a6a; transform:translateY(-1px); box-shadow:0 4px 20px rgba(15,39,71,0.3); }
  .sail-btn:disabled { opacity:0.4; cursor:not-allowed; }
  .sail-gold { color:#D4A96A; }
  .sail-tagline { text-align:center; margin-top:0.75rem; font-size:0.75rem; color:#8a7a5a; font-style:italic; }

  /* MAP */
  .map-wrap {
    width:100%; border-radius:14px; overflow:hidden;
    border: 3px solid rgba(200,168,75,0.72);
    box-shadow:
      inset 0 0 40px rgba(0,0,0,0.6),
      inset 0 0 0 1px rgba(212,169,106,0.1),
      0 0 0 1px rgba(139,105,20,0.14),
      0 28px 60px rgba(0,0,0,0.5);
    aspect-ratio:14/9; background:#0c1628;
  }
  .map-wrap.tall { aspect-ratio:16/10; }
  .map-wrap.wide { aspect-ratio:21/9; }
  .map-frame-outer {
    position: relative;
  }
  .map-frame-outer::before, .map-frame-outer::after {
    content: '';
    position: absolute;
    width: 22px; height: 22px;
    border-color: rgba(200,168,75,0.65);
    border-style: solid;
    z-index: 5;
    pointer-events: none;
  }
  .map-frame-outer::before { top:-4px; left:-4px; border-width:3px 0 0 3px; border-radius:2px 0 0 0; }
  .map-frame-outer::after  { top:-4px; right:-4px; border-width:3px 3px 0 0; border-radius:0 2px 0 0; }
  .map-frame-inner-corners::before, .map-frame-inner-corners::after {
    content: '';
    position: absolute;
    width: 22px; height: 22px;
    border-color: rgba(200,168,75,0.65);
    border-style: solid;
    z-index: 5;
    pointer-events: none;
  }
  .map-frame-inner-corners::before { bottom:-4px; left:-4px; border-width:0 0 3px 3px; border-radius:0 0 0 2px; }
  .map-frame-inner-corners::after  { bottom:-4px; right:-4px; border-width:0 3px 3px 0; border-radius:0 0 2px 0; }

  /* ERROR */
  .err-box { background:rgba(139,32,32,0.1); border:1px solid rgba(139,32,32,0.3); border-radius:10px; padding:0.75rem 1rem; color:#c0392b; font-size:0.85rem; margin-top:0.75rem; }

  /* FEATURES */
  .features-bar { display:flex; gap:1.5rem; margin-top:1.5rem; padding-top:1.5rem; border-top:1px solid #E0D4B8; flex-wrap:wrap; }
  .feat { display:flex; align-items:center; gap:6px; font-size:0.75rem; color:#8a7a5a; }

  /* HUNTING */
  .hunting-wrap { min-height:100vh; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:2rem; padding:88px 3rem 3rem; max-width:800px; margin:0 auto; position:relative; z-index:1; }

  /* REVEAL */
  .reveal-wrap { padding:100px 3rem 4rem; max-width:900px; margin:0 auto; position:relative; z-index:1; color:white; }
  .reveal-title { font-family:'Playfair Display',serif; font-size:clamp(1.8rem,3vw,2.6rem); margin-bottom:0.75rem; text-align:center; }
  .crew-banner {
    display:inline-flex; align-items:center; gap:0.5rem;
    background:rgba(212,169,106,0.15); border:1px solid rgba(212,169,106,0.3);
    border-radius:40px; padding:0.45rem 1.2rem; font-size:0.82rem; font-style:italic;
  }

  /* BOTTOM ACTIONS */
  .bot-actions { display:flex; gap:1rem; justify-content:center; flex-wrap:wrap; margin-bottom:2rem; }
  .bot-btn { padding:0.8rem 2rem; border-radius:40px; font-size:0.85rem; font-weight:500; cursor:pointer; transition:all 0.2s; font-family:'DM Sans',sans-serif; border:none; }

  /* HOW SECTION */
  .how-section { background:white; padding:5rem 3rem; border-top:1px solid #E0D4B8; position:relative; z-index:1; }
  .how-inner { max-width:1100px; margin:0 auto; }
  .sec-headline { font-family:'Playfair Display',serif; font-size:clamp(2rem,3.5vw,2.8rem); color:#0F2747; text-align:center; margin-bottom:0.5rem; }
  .sec-sub { text-align:center; color:#8a7a5a; font-size:1rem; margin-bottom:3rem; }
  .how-cards { display:grid; grid-template-columns:repeat(3,1fr); gap:1.5rem; }
  .how-card { background:#F7F4EE; border:1px solid #E0D4B8; border-radius:16px; padding:2rem 1.75rem; }
  .how-icon { font-size:2rem; margin-bottom:1rem; display:block; }
  .how-title { font-family:'Playfair Display',serif; font-size:1.1rem; color:#0F2747; margin-bottom:0.5rem; }
  .how-text { font-size:0.88rem; color:#8a7a5a; line-height:1.6; }

  /* LEGENDARY VOYAGES */
  .routes-section { padding:5rem 3rem; max-width:1200px; margin:0 auto; position:relative; z-index:1; }
  .routes-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; }
  .voyage-card {
    border-radius:18px; overflow:hidden; cursor:pointer;
    background:#F7F4EE; border:1px solid #E0D4B8;
    transition:transform 0.28s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.28s;
  }
  .voyage-card:hover { transform:translateY(-6px) scale(1.02); box-shadow:0 22px 55px rgba(15,39,71,0.15); border-color:#C8A84B; }
  .voyage-inner {
    padding:1.75rem 1.5rem 1.5rem; min-height:210px;
    display:flex; flex-direction:column;
  }
  .voyage-emoji { font-size:3rem; display:block; margin-bottom:0.6rem; line-height:1; }
  .voyage-badge {
    display:inline-block; align-self:flex-start;
    background:rgba(15,39,71,0.06); border:1px solid rgba(15,39,71,0.12);
    color:#0F2747; border-radius:40px; padding:0.2rem 0.7rem;
    font-size:0.63rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase;
    margin-bottom:0.85rem;
  }
  .voyage-title { font-family:'Playfair Display',serif; font-size:1.05rem; color:#0F2747; font-weight:700; margin-bottom:0.3rem; line-height:1.3; flex:1; }
  .voyage-meta { font-size:0.75rem; color:#8a7a5a; letter-spacing:0.03em; }
  .voyage-cta { font-size:0.78rem; color:#D4A96A; font-weight:700; letter-spacing:0.06em; margin-top:0.85rem; opacity:0; transform:translateX(-4px); transition:all 0.2s; }
  .voyage-card:hover .voyage-cta { opacity:1; transform:translateX(0); }

  /* HERO BADGE */
  .hero-badge { display:inline-flex; align-items:center; gap:6px; background:rgba(212,169,106,0.15); border:1px solid rgba(212,169,106,0.4); border-radius:40px; padding:0.35rem 1rem; font-size:0.72rem; font-weight:500; letter-spacing:0.1em; color:#8B6914; text-transform:uppercase; margin-bottom:1.5rem; }
  .hero-headline { font-family:'Playfair Display',serif; font-size:clamp(2.2rem,4vw,3.3rem); font-weight:700; line-height:1.1; color:#0F2747; margin-bottom:0.5rem; }
  .hero-headline em { font-style:italic; color:#D4A96A; display:block; }
  .hero-sub { font-size:1rem; color:#4a3820; line-height:1.65; margin-bottom:2.5rem; font-weight:300; max-width:440px; }

  /* FOOTER */
  .footer { background:#0F2747; color:rgba(255,255,255,0.5); text-align:center; padding:2rem; font-size:0.8rem; position:relative; z-index:1; }
  .footer strong { color:#D4A96A; }
  .divider { border:none; border-top:1px solid #E0D4B8; margin:0; }

  /* FAN FAVOURITES */
  .fan-fav-section { padding:4.5rem 3rem; max-width:1200px; margin:0 auto; position:relative; z-index:1; }
  .fan-fav-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1.25rem; margin-top:2.5rem; }
  .fan-fav-card {
    background:white; border:1px solid #E0D4B8; border-radius:18px;
    padding:1.5rem; display:flex; flex-direction:column; gap:0.5rem;
    transition:transform 0.22s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.22s;
  }
  .fan-fav-card:hover { transform:translateY(-5px); box-shadow:0 18px 45px rgba(15,39,71,0.12); border-color:#C8A84B; }
  .fan-fav-heat {
    display:inline-flex; align-items:center; gap:5px;
    font-size:0.62rem; font-weight:700; letter-spacing:0.14em; text-transform:uppercase;
    color:#8B6914; background:linear-gradient(135deg,rgba(212,169,106,0.18),rgba(212,169,106,0.08));
    border:1px solid rgba(212,169,106,0.45); border-radius:30px;
    padding:0.22rem 0.7rem; margin-bottom:0.1rem;
  }
  .fan-fav-heat::before { content:"✦"; font-size:0.55rem; opacity:0.8; }
  .fan-fav-platform { font-size:0.62rem; letter-spacing:0.1em; text-transform:uppercase; color:#8a7a5a; font-weight:600; }
  .fan-fav-name { font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:700; color:#0F2747; }
  .fan-fav-barrio { font-size:0.72rem; color:#C8A84B; font-weight:600; letter-spacing:0.05em; }
  .fan-fav-desc { font-size:0.82rem; color:#6b5c48; line-height:1.55; flex:1; }
  .fan-fav-tags { display:flex; flex-wrap:wrap; gap:4px; margin-top:0.25rem; }
  .fan-fav-tags span { font-size:0.65rem; color:#8B6914; background:rgba(212,169,106,0.1); border-radius:20px; padding:0.15rem 0.55rem; }
  .fan-fav-cta {
    margin-top:0.75rem; padding:0.65rem; border-radius:10px; border:none;
    background:#0F2747; color:white; font-size:0.8rem; font-weight:600;
    cursor:pointer; transition:all 0.2s; text-align:center; letter-spacing:0.04em;
  }
  .fan-fav-cta:hover { background:#1a3a6a; transform:translateY(-1px); }

  /* MEAL TYPE BATTLE */
  .meal-battle { display:flex; gap:0.5rem; align-items:stretch; margin-bottom:0.85rem; }
  .meal-battle-side {
    flex:1; border:2px solid #E0D4B8; border-radius:12px; padding:0.85rem 0.5rem;
    cursor:pointer; transition:all 0.2s; background:white;
    display:flex; flex-direction:column; align-items:center; gap:4px; text-align:center;
  }
  .meal-battle-side:hover { border-color:#C8A84B; }
  .meal-battle-side.sel-food { border-color:#b35c00; background:rgba(255,154,60,0.08); }
  .meal-battle-side.sel-drinks { border-color:#0F2747; background:rgba(15,39,71,0.06); }
  .meal-battle-vs {
    display:flex; align-items:center; justify-content:center;
    width:32px; flex-shrink:0; font-size:0.7rem; font-weight:700;
    color:#C8A84B; letter-spacing:0.08em;
  }
  .meal-battle-both {
    width:100%; margin-top:0.35rem; padding:0.45rem; border-radius:8px;
    border:1px solid #E0D4B8; background:transparent; cursor:pointer;
    font-size:0.72rem; font-weight:600; color:#6b5c48; transition:all 0.2s; text-align:center;
  }
  .meal-battle-both.sel { background:#0F2747; border-color:#0F2747; color:white; }
  .meal-battle-both:hover:not(.sel) { border-color:#C8A84B; }

  /* CUISINE CHIPS */
  .cuisine-grid { display:flex; flex-wrap:nowrap; overflow-x:auto; gap:0.35rem; margin-bottom:0.75rem; padding-bottom:4px; -webkit-overflow-scrolling:touch; scrollbar-width:thin; scrollbar-color:rgba(212,169,106,0.3) transparent; }
  .cuisine-grid .chip { font-size:0.72rem; padding:0.22rem 0.6rem; flex-shrink:0; }

  @media (max-width:900px) {
    .fan-fav-grid { grid-template-columns:1fr; }
  }
  @media (max-width:600px) {
    .fan-fav-section { padding:3rem 1.5rem; }
  }

  /* ANIMATIONS */
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes scanPulse { 0%{box-shadow:0 0 0 0 rgba(212,169,106,0.7)} 70%{box-shadow:0 0 0 20px rgba(212,169,106,0)} 100%{box-shadow:0 0 0 0 rgba(212,169,106,0)} }
  @keyframes sunPulse { 0%,100%{box-shadow:0 0 60px 20px rgba(255,220,80,0.4)} 50%{box-shadow:0 0 80px 30px rgba(255,220,80,0.55)} }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-14px)} }
  @keyframes floatSlow { 0%,100%{transform:translateY(0) rotate(-2deg)} 50%{transform:translateY(-18px) rotate(2deg)} }
  @keyframes bounce { 0%,100%{transform:translateY(0)} 40%{transform:translateY(-20px)} 70%{transform:translateY(-7px)} }
  @keyframes blink { 0%,88%,100%{transform:scaleY(1)} 92%,96%{transform:scaleY(0.05)} }
  @keyframes sparkle { 0%,100%{opacity:0;transform:scale(0)} 50%{opacity:1;transform:scale(1)} }
  @keyframes pulseGlow { 0%,100%{box-shadow:0 0 18px rgba(212,169,106,0.25)} 50%{box-shadow:0 0 38px rgba(212,169,106,0.65),0 0 70px rgba(212,169,106,0.2)} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes compassSpin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
  @keyframes starTwinkle { 0%,100%{opacity:0.15} 50%{opacity:0.8} }
  @keyframes chestShake { 0%,100%{transform:rotate(0deg) scale(1)} 25%{transform:rotate(-5deg) scale(1.04)} 75%{transform:rotate(5deg) scale(1.04)} }
  @keyframes chestFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-2px)} }
  @keyframes chestShine { from{transform:translateX(-120%)} to{transform:translateX(120%)} }
  @keyframes particleBurst { 0%{transform:translate(-50%,-50%) scale(1);opacity:1} 100%{transform:translate(calc(-50% + var(--dx)),calc(-50% + var(--dy))) scale(0.2);opacity:0} }
  @keyframes revealFadeOut { 0%,70%{opacity:1} 100%{opacity:0;pointer-events:none} }
  @keyframes revealTextPop { from{opacity:0;transform:scale(0.5) translateY(10px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes revealChestPop { from{opacity:0;transform:scale(0.4) translateY(30px)} to{opacity:1;transform:scale(1) translateY(0)} }
  @keyframes stageSlide { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
  @keyframes checkPop { 0%{transform:scale(0)} 60%{transform:scale(1.3)} 100%{transform:scale(1)} }
  .fu { animation:fadeUp 0.6s ease forwards; opacity:0; }
  .fu1{animation-delay:0.1s} .fu2{animation-delay:0.25s} .fu3{animation-delay:0.4s} .fu4{animation-delay:0.55s}

  /* PREMIUM SAIL BUTTON */
  .sail-btn-premium {
    width:100%; margin-top:1.2rem; border:none; border-radius:14px;
    padding:1rem; font-size:0.9rem; font-weight:600; letter-spacing:0.08em;
    cursor:pointer; transition:all 0.25s; text-transform:uppercase;
    display:flex; align-items:center; justify-content:center; gap:10px;
    background:linear-gradient(135deg,#0F2747 0%,#1a3a6a 100%);
    color:white; position:relative; overflow:hidden;
  }
  .sail-btn-premium::after {
    content:""; position:absolute; inset:0;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,0.09),transparent);
    background-size:200% 100%; animation:shimmer 2.5s ease-in-out infinite;
  }
  .sail-btn-premium:hover:not(:disabled) { transform:translateY(-2px); box-shadow:0 8px 28px rgba(15,39,71,0.45); }
  .sail-btn-premium:disabled { opacity:0.35; cursor:not-allowed; }

  /* SURPRISE BUTTON */
  .surprise-btn {
    width:100%; margin-top:0.65rem; padding:0.85rem; border-radius:14px;
    border:2px dashed rgba(212,169,106,0.45); background:rgba(212,169,106,0.05);
    color:#8B6914; font-size:0.85rem; font-weight:600; cursor:pointer;
    transition:all 0.2s; letter-spacing:0.05em; font-family:'DM Sans',sans-serif;
    display:flex; align-items:center; justify-content:center; gap:8px;
  }
  .surprise-btn:hover { border-color:#D4A96A; background:rgba(212,169,106,0.1); color:#B8860B; transform:translateY(-1px); }

  /* ROPE DIVIDER */
  .rope-divider { display:flex; align-items:center; gap:1rem; padding:0 3rem; max-width:1200px; margin:0 auto; }
  .rope-divider::before,.rope-divider::after { content:""; flex:1; height:3px; border-radius:2px; opacity:0.35;
    background:repeating-linear-gradient(90deg,#C8A84B 0,#C8A84B 8px,#8B6914 8px,#8B6914 14px,#C8A84B 14px,#C8A84B 20px); }
  .rope-divider span { font-size:1.1rem; opacity:0.5; flex-shrink:0; }

  /* VIBE GRID */
  .vibe-section { padding:4rem 3rem 5rem; max-width:1200px; margin:0 auto; position:relative; z-index:1; }
  .vibe-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:1rem; margin-top:2rem; }
  .vibe-tile { border-radius:18px; padding:1.75rem 1.25rem; text-align:center; cursor:pointer;
    transition:all 0.22s; position:relative; overflow:hidden; }
  .vibe-tile:hover { transform:translateY(-5px) scale(1.02); box-shadow:0 16px 48px rgba(0,0,0,0.22); }
  .vibe-tile-icon { font-size:2.6rem; display:block; margin-bottom:0.6rem; }
  .vibe-tile-label { font-family:'Playfair Display',serif; font-size:1rem; font-weight:700; display:block; margin-bottom:0.3rem; }
  .vibe-tile-sub { font-size:0.72rem; opacity:0.6; font-style:italic; display:block; }

  /* CHEST CARDS (SURPRISE SCREEN) */
  .chest-card { border-radius:20px; padding:2rem 1.25rem 1.75rem; text-align:center; cursor:pointer;
    transition:all 0.25s; backdrop-filter:blur(10px); }
  .chest-card:hover { transform:scale(1.05) translateY(-6px); }
  .chest-card:hover .chest-lid { transform:rotate(-14deg) translateY(-3px); transform-origin:left bottom; transition:transform 0.3s ease; }
  .chest-lid { transition:transform 0.3s ease; }

  /* BOUNTY CARD (RESULTS) */
  .bounty-card { border-radius:20px; overflow:hidden; backdrop-filter:blur(12px);
    transition:transform 0.25s ease, box-shadow 0.25s ease; }
  .bounty-card:hover { transform:translateY(-3px); }

  /* AI INSIGHT CALLOUT */
  .insight-callout {
    border-radius:0 10px 10px 0; padding:0.8rem 1rem; margin:0.75rem 0;
    font-family:'Crimson Text',serif; font-style:italic; font-size:1.05rem; line-height:1.55;
    position:relative; border-left-width:3px; border-left-style:solid;
  }
  .insight-callout::before { content:"AI PICK"; position:absolute; top:-9px; left:10px;
    background:#D4A96A; color:#0F2747; font-size:0.5rem; font-family:'DM Sans',sans-serif;
    font-style:normal; font-weight:700; letter-spacing:0.15em; padding:2px 7px; border-radius:4px; }

  @media (max-width:900px) {
    .hero { grid-template-columns:1fr; padding:5rem 1.5rem 2rem; gap:2rem; }
    .how-cards { grid-template-columns:1fr; }
    .routes-grid { grid-template-columns:repeat(2,1fr); }
    .vibe-grid { grid-template-columns:repeat(2,1fr); }
    .navbar { padding:0 1.5rem; }
    .nav-links { display:none; }
    .reveal-wrap { padding:90px 1.25rem 3rem; }
    .hunting-wrap { padding:90px 1.25rem 3rem; }
    .how-section,.routes-section,.vibe-section { padding:3rem 1.5rem; }
    .rope-divider { padding:0 1.5rem; }
    .chest-picker-grid { grid-template-columns:1fr 1fr; max-width:min(500px, 94vw); margin:0 auto; }
    .chest-picker-mascot { grid-template-columns: 1fr 1fr; max-width: min(460px, 94vw); margin: 0 auto; }
    .treasure-chest-mascot { max-width: min(280px, 72vw); }
    .chest-hero-scene { min-height: auto; }
  }
  @media (max-width:600px) {
    .routes-grid { grid-template-columns:1fr; }
    .vibe-grid { grid-template-columns:1fr 1fr; }
    .chest-picker-grid { grid-template-columns:1fr 1fr; max-width:min(420px, 96vw); }
  }
`;
