import html2canvas from "html2canvas";

/**
 * StoryExport
 * -----------
 * One-tap Instagram Story renderer. Given a bounty, builds an off-screen
 * 1080x1920 parchment canvas, takes a snapshot via html2canvas, and returns
 * a blob URL the caller can download.
 *
 * Design principles
 *   - Uses RUMBO's existing tokens (cream, navy, gold, ember) so the export
 *     feels native to the product.
 *   - Pulls the hero photo through the existing `/api/photo?ref=` proxy so
 *     CORS never blocks the capture (html2canvas needs same-origin pixels).
 *   - Degrades to a parchment-only hero when a photo isn't available or
 *     fails to load, keeping the output aesthetically consistent.
 *   - No animation, no motion — nothing to gate on prefers-reduced-motion.
 */

const TOKENS = {
  cream: "#F7F4EE",
  creamDeep: "#EDE4D1",
  navy: "#0F2747",
  navyDeep: "#08162A",
  gold: "#D4A96A",
  ember: "#C8A84B",
  ink: "#2B2519",
};

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5001";

// Proxy a photo URL through the backend so html2canvas can read pixels.
// The backend `/api/photo` endpoint already sets permissive CORS headers.
function proxyPhoto(url) {
  if (!url) return null;
  if (url.startsWith(`${API_BASE}/api/photo`)) return url;
  // Already a proxied URL — leave it alone.
  if (url.includes("/api/photo?ref=")) return url;
  return `${API_BASE}/api/photo?ref=${encodeURIComponent(url)}`;
}

// Preload an image and resolve whether it actually decoded.
function loadImage(src) {
  return new Promise((resolve) => {
    if (!src) return resolve(false);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

function shortId(bounty) {
  const raw = bounty?.place_id || bounty?.name || "rumbo";
  return String(raw).replace(/[^a-zA-Z0-9]/g, "").slice(-6).toUpperCase();
}

function formatStars(rating) {
  if (!rating) return "";
  const full = Math.floor(rating);
  return "★".repeat(full) + "☆".repeat(Math.max(0, 5 - full));
}

/**
 * renderStoryPng(bounty, opts?) -> Promise<string>
 * Returns a blob URL pointing at a freshly-rendered 1080x1920 PNG.
 * Caller is responsible for URL.revokeObjectURL when done.
 */
export async function renderStoryPng(bounty, opts = {}) {
  if (!bounty) throw new Error("renderStoryPng: bounty required");

  const photoSrc = bounty.photo_url ? proxyPhoto(bounty.photo_url) : null;
  const photoOk = photoSrc ? await loadImage(photoSrc) : false;

  const node = document.createElement("div");
  node.setAttribute("aria-hidden", "true");
  Object.assign(node.style, {
    position: "fixed",
    top: "0",
    left: "-99999px",
    width: "1080px",
    height: "1920px",
    fontFamily: '"Playfair Display", "Georgia", serif',
    color: TOKENS.ink,
    background: TOKENS.cream,
    overflow: "hidden",
    zIndex: "-1",
    pointerEvents: "none",
  });

  const hero = photoOk
    ? `url("${photoSrc}") center/cover no-repeat`
    : `radial-gradient(120% 90% at 50% 30%, ${TOKENS.gold}55 0%, ${TOKENS.cream} 55%, ${TOKENS.creamDeep} 100%)`;

  const price = bounty.price_level ? "€".repeat(bounty.price_level) : "";
  const stars = formatStars(bounty.rating);
  const reviews = bounty.user_ratings_total ? `${bounty.user_ratings_total.toLocaleString()} reviews` : "";
  const hook = (bounty.hook || "").trim();
  const pirateName = bounty.pirate_name || bounty.name || "Hidden gem";
  const realName = bounty.name || "";
  const address = bounty.address || bounty.vicinity || "Madrid";
  const openLabel = bounty.open_now === true ? "OPEN NOW"
    : bounty.open_now === false ? "CLOSED"
    : "";
  const coords = (bounty.lat != null && bounty.lng != null)
    ? `${Number(bounty.lat).toFixed(4)}°, ${Number(bounty.lng).toFixed(4)}°`
    : "Madrid, ES";

  node.innerHTML = `
    <!-- Parchment grain wash, subtle -->
    <div style="
      position:absolute; inset:0;
      background:
        radial-gradient(1px 1px at 23% 17%, rgba(43,37,25,0.08) 50%, transparent 51%),
        radial-gradient(1px 1px at 71% 42%, rgba(43,37,25,0.06) 50%, transparent 51%),
        radial-gradient(1px 1px at 48% 78%, rgba(43,37,25,0.05) 50%, transparent 51%);
      background-size: 140px 140px, 220px 220px, 180px 180px;
      mix-blend-mode: multiply;
      opacity:0.6;
      pointer-events:none;
    "></div>

    <!-- Top band -->
    <div style="
      position:absolute; top:0; left:0; right:0; height:220px;
      display:flex; align-items:center; justify-content:space-between;
      padding: 0 72px;
      background: linear-gradient(180deg, ${TOKENS.cream} 0%, rgba(247,244,238,0.85) 100%);
      border-bottom: 1px solid rgba(15,39,71,0.08);
    ">
      <div style="display:flex; align-items:center; gap:22px;">
        <!-- compass mark -->
        <div style="
          width:78px; height:78px; border-radius:50%;
          border: 3px solid ${TOKENS.navy};
          display:flex; align-items:center; justify-content:center;
          font-size:44px; color:${TOKENS.navy};
          font-family: 'Playfair Display', Georgia, serif;
          background: radial-gradient(circle, ${TOKENS.cream} 55%, ${TOKENS.creamDeep} 100%);
        ">✦</div>
        <div>
          <div style="
            font-family: 'Playfair Display', Georgia, serif;
            font-size: 56px; font-weight: 700; line-height: 1;
            letter-spacing: 0.14em; color:${TOKENS.navy};
          ">RUMBO</div>
          <div style="
            margin-top: 10px;
            font-family: Georgia, 'Times New Roman', serif;
            font-style: italic; font-size: 22px;
            color: rgba(15,39,71,0.65); letter-spacing:0.04em;
          ">Madrid hidden gems · plotted</div>
        </div>
      </div>
      <div style="
        font-family: Georgia, serif; font-size:20px; font-weight:600;
        letter-spacing:0.26em; color:${TOKENS.ember};
      ">№ ${shortId(bounty)}</div>
    </div>

    <!-- Hero photo zone -->
    <div style="
      position:absolute; top:220px; left:0; right:0; height:680px;
      background: ${hero};
    ">
      <!-- darken overlay for text legibility on lower third -->
      <div style="
        position:absolute; inset:0;
        background: linear-gradient(180deg, rgba(8,22,42,0) 55%, rgba(8,22,42,0.55) 100%);
      "></div>
    </div>

    <!-- Headline block -->
    <div style="
      position:absolute; top:900px; left:72px; right:72px; height:480px;
      display:flex; flex-direction:column; justify-content:flex-start; gap:18px;
    ">
      <div style="
        font-family: 'Playfair Display', Georgia, serif;
        font-weight: 700; font-size: 96px; line-height: 1.02;
        color: ${TOKENS.navy};
        letter-spacing: -0.005em;
      ">${escapeHtml(pirateName)}</div>

      ${realName && realName !== pirateName ? `
        <div style="
          font-family: Georgia, serif; font-size: 28px; font-weight: 600;
          color: ${TOKENS.ember}; letter-spacing: 0.12em; text-transform: uppercase;
        ">${escapeHtml(realName)}${price ? ` · <span style="color:${TOKENS.gold}">${price}</span>` : ""}</div>
      ` : ""}

      ${hook ? `
        <div style="
          margin-top: 12px;
          font-family: 'Georgia', serif; font-style: italic;
          font-size: 36px; line-height: 1.28;
          color: rgba(15,39,71,0.78);
          display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;
          overflow: hidden;
        ">“${escapeHtml(hook)}”</div>
      ` : ""}
    </div>

    <!-- Info strip -->
    <div style="
      position:absolute; top:1400px; left:72px; right:72px; height:160px;
      display:flex; align-items:center; gap:32px;
      border-top: 2px solid rgba(15,39,71,0.1);
      border-bottom: 2px solid rgba(15,39,71,0.1);
      padding: 18px 0;
    ">
      ${stars ? `
        <div style="display:flex; align-items:center; gap:12px;">
          <span style="color:${TOKENS.gold}; font-size:36px; letter-spacing:2px;">${stars}</span>
          <span style="font-family:Georgia,serif; font-size:26px; font-weight:700; color:${TOKENS.navy};">${bounty.rating?.toFixed ? bounty.rating.toFixed(1) : bounty.rating || ""}</span>
          ${reviews ? `<span style="font-family:Georgia,serif; font-size:20px; color:rgba(15,39,71,0.55);">· ${reviews}</span>` : ""}
        </div>
      ` : ""}
      ${openLabel ? `
        <div style="
          padding: 10px 22px; border-radius: 999px;
          background: ${openLabel === "OPEN NOW" ? "rgba(81,207,102,0.15)" : "rgba(200,90,90,0.12)"};
          color: ${openLabel === "OPEN NOW" ? "#2f8a3a" : "#a14141"};
          border: 1px solid ${openLabel === "OPEN NOW" ? "rgba(81,207,102,0.45)" : "rgba(200,90,90,0.35)"};
          font-family: Georgia, serif; font-weight: 700; font-size: 22px;
          letter-spacing: 0.12em;
        ">${openLabel}</div>
      ` : ""}
      <div style="
        flex:1; text-align:right;
        font-family: Georgia, serif; font-size: 22px;
        color: rgba(15,39,71,0.7); font-style: italic;
        white-space: nowrap; overflow:hidden; text-overflow: ellipsis;
      ">📍 ${escapeHtml(address)}</div>
    </div>

    <!-- Footer -->
    <div style="
      position:absolute; top:1600px; left:0; right:0; bottom:0;
      padding: 44px 72px;
      background: linear-gradient(180deg, rgba(247,244,238,0.6) 0%, ${TOKENS.creamDeep} 100%);
      display:flex; flex-direction:column; justify-content:space-between;
    ">
      <div style="display:flex; align-items:center; gap:18px;">
        <div style="
          width:64px; height:64px; border-radius:50%;
          background: ${TOKENS.navy}; color:${TOKENS.gold};
          display:flex; align-items:center; justify-content:center;
          font-size:34px;
        ">📍</div>
        <div>
          <div style="font-family:Georgia,serif; font-size:22px; font-weight:700; color:${TOKENS.navy}; letter-spacing:0.08em;">LOCATION</div>
          <div style="font-family:Georgia,serif; font-size:24px; color:rgba(15,39,71,0.7); margin-top:4px;">${escapeHtml(coords)}</div>
        </div>
      </div>

      <div style="display:flex; align-items:center; justify-content:space-between;">
        <div style="
          font-family:'Playfair Display', Georgia, serif;
          font-size:40px; font-weight:700; letter-spacing:0.14em;
          color:${TOKENS.navy};
        ">found via <span style="color:${TOKENS.ember};">RUMBO</span></div>
        <div style="
          font-family:'Courier New', monospace; font-size:22px;
          color:rgba(15,39,71,0.55); letter-spacing:0.08em;
        ">#hunt-${shortId(bounty)}</div>
      </div>
    </div>
  `;

  document.body.appendChild(node);

  try {
    const canvas = await html2canvas(node, {
      width: 1080,
      height: 1920,
      scale: 1,
      useCORS: true,
      allowTaint: false,
      backgroundColor: TOKENS.cream,
      logging: false,
      imageTimeout: 6000,
    });

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png", 0.95));
    if (!blob) throw new Error("Story export: canvas produced no blob");
    return URL.createObjectURL(blob);
  } finally {
    node.remove();
  }
}

function escapeHtml(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export default { renderStoryPng };
