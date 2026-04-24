import { MascotSVG } from "./MascotComponents";

export function LandingScreen({ onContinue }) {
  return (
    <div className="landing-root">
      <section className="landing-hero">
        <div className="landing-hero-inner">
          <div className="landing-badge">AI Pirate Navigator</div>
          <MascotSVG size={116} animation="float" />
          <h1 className="landing-title">
            Ahoy, Navigator.
            <em>Find Madrid like a local.</em>
          </h1>
          <p className="landing-sub">
            RUMBO helps your crew skip tourist traps and discover hidden gems with live maps,
            vibe-matched recommendations, and routes built for tonight.
          </p>
          <div className="landing-actions">
            <button type="button" className="landing-cta" onClick={() => onContinue("login")}>
              Set Sail - Log In
            </button>
            <button
              type="button"
              className="landing-link"
              onClick={() => onContinue("signup")}
            >
              New here? Create an account
            </button>
          </div>
        </div>
      </section>

      <section className="landing-section">
        <h2>What is RUMBO?</h2>
        <div className="landing-grid">
          <article className="landing-card">
            <span className="landing-card-kicker">Hidden Gems</span>
            <h3>Local-first results</h3>
            <p>
              Curated places beyond the typical lists, tuned to your neighborhood and vibe.
            </p>
          </article>
          <article className="landing-card">
            <span className="landing-card-kicker">AI Navigator</span>
            <h3>Personalized instantly</h3>
            <p>
              Tell us your mood, crew, and budget. We build your route in seconds.
            </p>
          </article>
          <article className="landing-card">
            <span className="landing-card-kicker">Built for crews</span>
            <h3>Plan together</h3>
            <p>
              Save favorites, share routes, and align plans with your friends in one flow.
            </p>
          </article>
        </div>
      </section>

      <section className="landing-section">
        <h2>How it works</h2>
        <div className="landing-steps">
          <article className="landing-step">
            <span>01</span>
            <h3>Pick your chest</h3>
            <p>Choose food, culture, nightlife, or surprise.</p>
          </article>
          <article className="landing-step">
            <span>02</span>
            <h3>Navigator hunts</h3>
            <p>AI scans maps and filters options to match your brief.</p>
          </article>
          <article className="landing-step">
            <span>03</span>
            <h3>Claim your bounty</h3>
            <p>Open directions, swap spots, and share with your crew.</p>
          </article>
        </div>
      </section>

      <footer className="landing-footer">
        Made with anchor by <strong>Pirates</strong> · Google Hackathon
      </footer>
    </div>
  );
}

export default LandingScreen;
