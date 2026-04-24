import { BARRIOS, ROUTES_DATA, FAN_FAVOURITES } from "../constants";

/**
 * ExploreScene — the "Explorer" surface.
 *
 * Deliberately stylistically distinct from HomeScene: framed as a nautical
 * chart-room index. No hero headline that competes with Home; instead, a
 * "contents" board, trending strip, route catalogue, and crew invitation.
 *
 * `onHunt(description, barrio)` is forwarded to App's startHunt so the
 * same curated Routes / Favourites triggers still work.
 */
export function ExploreScene({ onHunt, onStartHunt }) {
  return (
    <main className="explore-scene" id="explore">
      {/* — CHART HEADER — */}
      <header className="explore-masthead">
        <div className="explore-masthead__top">
          <span className="explore-masthead__dot" aria-hidden="true" />
          <span className="explore-masthead__label">The Explorer</span>
          <span className="explore-masthead__rule" aria-hidden="true" />
          <span className="explore-masthead__meta">Chart room · Madrid</span>
        </div>
        <h1 className="explore-masthead__title">
          Every corner
          <em> worth charting.</em>
        </h1>
        <p className="explore-masthead__sub">
          Browse what the navigator has plotted. Pick a legendary voyage, tap a trending hideout,
          or start a hunt from any card — we'll map the night around it.
        </p>
        <nav className="explore-toc" aria-label="Sections">
          <a href="#trending">I · Trending tonight</a>
          <a href="#voyages">II · Legendary voyages</a>
          <a href="#barrios">III · Neighbourhoods</a>
        </nav>
      </header>

      {/* — TRENDING — */}
      <section className="explore-trending" id="trending" aria-labelledby="trending-title">
        <div className="explore-section-head">
          <span className="explore-section-head__num">I</span>
          <div>
            <h2 id="trending-title" className="explore-section-head__title">Trending tonight</h2>
            <p className="explore-section-head__sub">Where Madrid's feeds are actually pointing. Three handpicked cult spots.</p>
          </div>
        </div>
        <div className="explore-trending__grid">
          {FAN_FAVOURITES.map((f, i) => (
            <article key={f.name} className="explore-trend-card">
              <header className="explore-trend-card__top">
                <span className="explore-trend-card__ix">{String(i + 1).padStart(2, "0")}</span>
                <span className="explore-trend-card__heat">{f.heat}</span>
              </header>
              <h3 className="explore-trend-card__name">{f.name}</h3>
              <p className="explore-trend-card__barrio">📍 {f.barrio}</p>
              <p className="explore-trend-card__desc">{f.desc}</p>
              <div className="explore-trend-card__tags">
                {f.tags.map(t => <span key={t}>{t}</span>)}
              </div>
              <button
                type="button"
                className="explore-trend-card__cta"
                onClick={() => onHunt(f.huntDesc, BARRIOS.find(b => b.name === f.barrio) || null)}
              >
                Hunt nearby gems →
              </button>
              <footer className="explore-trend-card__foot">Seen on {f.platform}</footer>
            </article>
          ))}
        </div>
      </section>

      {/* — LEGENDARY VOYAGES — */}
      <section className="explore-voyages" id="voyages" aria-labelledby="voyages-title">
        <div className="explore-section-head">
          <span className="explore-section-head__num">II</span>
          <div>
            <h2 id="voyages-title" className="explore-section-head__title">Legendary voyages</h2>
            <p className="explore-section-head__sub">Nine prebuilt routes. Click once, the navigator does the rest.</p>
          </div>
        </div>
        <div className="explore-voyages__grid">
          {ROUTES_DATA.map((r) => (
            <button
              key={r.title}
              type="button"
              className="explore-voyage"
              onClick={() => onHunt(r.huntDesc, BARRIOS.find(b => b.name === r.barrio) || null)}
            >
              <span className="explore-voyage__badge">{r.badge}</span>
              <span className="explore-voyage__emoji" aria-hidden="true">{r.emoji}</span>
              <span className="explore-voyage__title">{r.title}</span>
              <span className="explore-voyage__meta">{r.meta}</span>
              <span className="explore-voyage__cta">Set Sail →</span>
            </button>
          ))}
        </div>
      </section>

      {/* — BARRIOS — */}
      <section className="explore-barrios" id="barrios" aria-labelledby="barrios-title">
        <div className="explore-section-head">
          <span className="explore-section-head__num">III</span>
          <div>
            <h2 id="barrios-title" className="explore-section-head__title">Neighbourhoods</h2>
            <p className="explore-section-head__sub">Tap any barrio to aim a hunt there.</p>
          </div>
        </div>
        <div className="explore-barrios__grid">
          {BARRIOS.filter(b => !b.surprise).map((b) => (
            <button
              key={b.name}
              type="button"
              className="explore-barrio"
              onClick={() => onHunt(`Find hidden gem restaurants, bars, and spots in ${b.name}, Madrid — local favourites, not tourist traps.`, b)}
            >
              <span className="explore-barrio__name">{b.name}</span>
              <span className="explore-barrio__arrow" aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      </section>

      {/* — CALL TO HUNT — */}
      <section className="explore-hunt-cta" aria-labelledby="hunt-cta-title">
        <div className="explore-hunt-cta__inner">
          <span className="explore-hunt-cta__kicker">Rather write your own brief?</span>
          <h2 id="hunt-cta-title" className="explore-hunt-cta__title">
            Start a clean hunt
            <em> — we'll chart three gems.</em>
          </h2>
          <button type="button" className="home-cta-primary" onClick={onStartHunt}>
            Open the hunt desk
          </button>
        </div>
      </section>
    </main>
  );
}

export default ExploreScene;
