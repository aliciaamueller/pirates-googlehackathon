import { MascotSVG } from "./MascotComponents";

/**
 * HomeScene — the authenticated Home.
 *
 * Purpose: a proper "this is our project" page. Distinct from the Explore
 * feed. Leads the eye to a primary Start-a-Hunt CTA and a secondary invite
 * into Explore. Not a dashboard; not a form — an editorial home deck.
 */
function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Middle watch";
  if (h < 12) return "Morning watch";
  if (h < 17) return "Afternoon watch";
  if (h < 21) return "Dog watch";
  return "First watch";
}

export function HomeScene({ user, favCount = 0, planCount = 0, onStartHunt, onOpenExplore }) {
  const name = user?.email?.split("@")[0] || "Captain";
  const initial = (name[0] || "C").toUpperCase();

  return (
    <main className="home-scene" id="home">
      {/* — CAPTAIN'S LOG BANNER — */}
      <section className="home-intro">
        <div className="home-intro__text">
          <div className="home-intro__watch">
            <span className="home-intro__pip" aria-hidden="true" />
            {greeting()} · Madrid
          </div>
          <h1 className="home-intro__title">
            Welcome back,
            <em> {name}.</em>
          </h1>
          <p className="home-intro__sub">
            RUMBO is a pirate-navigator for Madrid. Tell us your crew, your chest, and your mood,
            and we chart three hidden gems for tonight — no tourist traps.
          </p>
          <div className="home-intro__cta-row">
            <button type="button" className="home-cta-primary" onClick={onStartHunt}>
              <span className="home-cta-primary__label">Start a hunt</span>
              <span className="home-cta-primary__glyph" aria-hidden="true">
                <svg width="28" height="14" viewBox="0 0 28 14" fill="none">
                  <path d="M0 7 H24" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M18 1 L27 7 L18 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
                </svg>
              </span>
            </button>
            <button type="button" className="home-cta-secondary" onClick={onOpenExplore}>
              Browse Explore
            </button>
          </div>
        </div>

        {/* Mascot column — sits in the second grid cell on desktop, above the
            text on mobile (ordered via CSS). */}
        <aside className="home-intro__mascot" aria-hidden="true">
          <div className="home-intro__mascot-frame">
            <MascotSVG size={240} animation="float" />
          </div>
        </aside>
      </section>

      {/* — PROJECT MARQUEE — a tight identity band so it reads as a HOME, not a form — */}
      <section className="home-band" aria-label="About RUMBO">
        <div className="home-band__label">The project</div>
        <p className="home-band__copy">
          A Google Hackathon build. Gemini + Google Maps, dressed as a pirate navigator,
          trained on hidden Madrid — the tapas bar your gran knew, the rooftop locals guard,
          the gallery that never shows up on search.
        </p>
        <ul className="home-band__stats">
          <li>
            <span className="home-band__stat-num">{favCount}</span>
            <span className="home-band__stat-label">Saved spots</span>
          </li>
          <li>
            <span className="home-band__stat-num">{planCount}</span>
            <span className="home-band__stat-label">Plans with crew</span>
          </li>
          <li>
            <span className="home-band__stat-num">3 min</span>
            <span className="home-band__stat-label">Per hunt, average</span>
          </li>
        </ul>
      </section>

      {/* — HOW IT WORKS (editorial, not card-grid) — */}
      <section className="home-steps" aria-label="How RUMBO works">
        <header className="home-steps__header">
          <span className="home-steps__kicker">The method</span>
          <h2 className="home-steps__title">Three turns of the wheel.</h2>
        </header>
        <ol className="home-steps__list">
          <li>
            <span className="home-steps__num">I</span>
            <h3>Chart the course</h3>
            <p>Pick a chest — feast, culture, moonlight, or let the navigator surprise you.</p>
          </li>
          <li>
            <span className="home-steps__num">II</span>
            <h3>Crew the vessel</h3>
            <p>Tell us your barrio, who's with you, and how loud you want the night to be.</p>
          </li>
          <li>
            <span className="home-steps__num">III</span>
            <h3>Claim the bounty</h3>
            <p>Three gems appear, on a real map, in Google-ready routes. Swap anything you don't love.</p>
          </li>
        </ol>
      </section>

      {/* — WHAT YOU CAN DO — a quiet rail, not a card dump — */}
      <section className="home-rail" aria-label="What you can do">
        <h2 className="home-rail__title">What lives inside</h2>
        <div className="home-rail__rows">
          <div className="home-rail__row">
            <span className="home-rail__num">01</span>
            <div>
              <h3>Crew mode</h3>
              <p>A guided brief for groups. Pick chips, pick neighbourhoods, press sail.</p>
            </div>
          </div>
          <div className="home-rail__row">
            <span className="home-rail__num">02</span>
            <div>
              <h3>Captain mode</h3>
              <p>Free-type your orders, or dictate them with voice. The navigator reads between the lines.</p>
            </div>
          </div>
          <div className="home-rail__row">
            <span className="home-rail__num">03</span>
            <div>
              <h3>Telescope</h3>
              <p>Upload a photo — we read the vibe and find places that match the mood.</p>
            </div>
          </div>
          <div className="home-rail__row">
            <span className="home-rail__num">04</span>
            <div>
              <h3>Plans with crew</h3>
              <p>Save bounties into shared plans. Everyone sees the same map.</p>
            </div>
          </div>
        </div>
      </section>

      {/* — CLOSING CTA (repeats primary action with different framing) — */}
      <section className="home-closing">
        <div className="home-closing__inner">
          <span className="home-closing__label" aria-hidden="true">{initial} · {greeting()}</span>
          <h2 className="home-closing__title">
            The seas are calm. <em>Where shall we sail?</em>
          </h2>
          <div className="home-closing__actions">
            <button type="button" className="home-cta-primary" onClick={onStartHunt}>
              Start a hunt
            </button>
            <button type="button" className="home-cta-secondary" onClick={onOpenExplore}>
              See what's trending
            </button>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        ⚓ RUMBO · Google Hackathon · Madrid only · built by Pirates
      </footer>
    </main>
  );
}

export default HomeScene;
