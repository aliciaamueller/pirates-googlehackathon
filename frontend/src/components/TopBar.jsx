/**
 * TopBar
 * ------
 * Slim sticky header for both desktop and mobile. Intentionally NOT a
 * navigation surface: left is brand (compass + wordmark + kicker), right is
 * a subtle user chip. Compact height keeps attention on the scene below.
 *
 * Click on the brand takes the user to Home (the requested behaviour for
 * the brand lockup — it acts as a logo link, not a nav item).
 */
export function TopBar({ user, onBrandClick, onOpenProfile }) {
  const name = user?.email?.split("@")[0] || "Captain";
  const initial = (name[0] || "C").toUpperCase();

  return (
    <header className="top-bar" role="banner">
      <button
        type="button"
        className="top-bar__brand"
        onClick={onBrandClick}
        aria-label="RUMBO · home"
      >
        <span className="top-bar__mark" aria-hidden="true">
          <svg width="30" height="30" viewBox="0 0 40 40" fill="none">
            <circle cx="20" cy="20" r="18" stroke="currentColor" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.45" />
            <circle cx="20" cy="20" r="4" fill="#D4A96A" />
            <polygon points="20,2 22.5,17 20,20 17.5,17" fill="currentColor" />
            <polygon points="20,38 22.5,23 20,20 17.5,23" fill="currentColor" opacity="0.4" />
            <polygon points="2,20 17,17.5 20,20 17,22.5" fill="currentColor" opacity="0.4" />
            <polygon points="38,20 23,17.5 20,20 23,22.5" fill="currentColor" />
            <circle cx="20" cy="20" r="1.8" fill="#F7F4EE" />
          </svg>
        </span>
        <span className="top-bar__wordmark">
          <span className="top-bar__title">RUMBO</span>
          <span className="top-bar__kicker" aria-hidden="true">
            <em>·</em> Madrid hidden gems, plotted <em>·</em>
          </span>
        </span>
      </button>

      <div className="top-bar__right">
        <span className="top-bar__dot" aria-hidden="true" />
        <span className="top-bar__meta">Logged in</span>
        <button
          type="button"
          className="top-bar__user"
          onClick={onOpenProfile}
          aria-label={`Open profile — ${name}`}
        >
          <span className="top-bar__avatar">{initial}</span>
          <span className="top-bar__user-name">{name}</span>
        </button>
      </div>
    </header>
  );
}

export default TopBar;
