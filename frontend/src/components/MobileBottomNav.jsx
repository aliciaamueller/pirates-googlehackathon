function HomeIcon({ active }) {
  const stroke = active ? "#D4A96A" : "#4a3820";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke={stroke} strokeWidth="1.6" strokeDasharray="2.5 2.5" opacity="0.55" />
      <polygon points="12,3 13.4,11 12,12 10.6,11" fill={stroke} />
      <polygon points="12,21 13.4,13 12,12 10.6,13" fill={stroke} opacity="0.45" />
      <polygon points="3,12 11,10.6 12,12 11,13.4" fill={stroke} opacity="0.45" />
      <polygon points="21,12 13,10.6 12,12 13,13.4" fill={stroke} />
      <circle cx="12" cy="12" r="1.4" fill={active ? "#0F2747" : "#F7F4EE"} />
    </svg>
  );
}

function ExploreIcon({ active }) {
  const stroke = active ? "#D4A96A" : "#4a3820";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 18 Q12 15 20 18 L17.5 21 Q12 19 6.5 21 Z" fill={stroke} opacity="0.8" />
      <path d="M12 3 L12 16" stroke={stroke} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 3 L19 10 L12 10 Z" fill={stroke} opacity="0.9" />
      <path d="M12 5 L7 11 L12 11 Z" fill={stroke} opacity="0.55" />
    </svg>
  );
}

function PlansIcon({ active }) {
  const stroke = active ? "#D4A96A" : "#4a3820";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 6 L9 4.5 L15 6.5 L20 5 L20 18 L15 19.5 L9 17.5 L4 19 Z"
        stroke={stroke}
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M9 4.5 L9 17.5" stroke={stroke} strokeWidth="1.2" opacity="0.6" />
      <path d="M15 6.5 L15 19.5" stroke={stroke} strokeWidth="1.2" opacity="0.6" />
      <circle cx="12" cy="11" r="1.5" fill={stroke} />
      <path d="M12 11 L12 14" stroke={stroke} strokeWidth="1.2" />
    </svg>
  );
}

function ProfileIcon({ active }) {
  const stroke = active ? "#D4A96A" : "#4a3820";
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="9" r="3.5" stroke={stroke} strokeWidth="1.6" fill="none" />
      <path
        d="M5 20 C5 15.5 8 13.5 12 13.5 C16 13.5 19 15.5 19 20"
        stroke={stroke}
        strokeWidth="1.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="9" cy="7" r="0.8" fill={stroke} opacity="0.5" />
      <circle cx="15" cy="7" r="0.8" fill={stroke} opacity="0.5" />
    </svg>
  );
}

export function MobileBottomNav({
  tab = "home",
  screen,
  showPlans,
  showProfile,
  onHome,
  onExplore,
  onOpenPlans,
  onOpenProfile,
}) {
  const modalOpen = showPlans || showProfile;
  const inBrief = screen === "brief";
  // Home tab stays active when user is on Home scene or in the Hunt flow
  // (Hunt is reached from Home; keeping it lit keeps users oriented).
  const exploreActive = !modalOpen && inBrief && tab === "explore";
  const homeActive = !modalOpen && (!inBrief || tab === "home" || tab === "hunt") && !exploreActive;
  const plansActive = showPlans;
  const profileActive = showProfile;

  const tabs = [
    { id: "home", label: "Home", Icon: HomeIcon, active: homeActive, onClick: onHome },
    { id: "explore", label: "Explore", Icon: ExploreIcon, active: exploreActive, onClick: onExplore },
    { id: "plans", label: "Plans", Icon: PlansIcon, active: plansActive, onClick: onOpenPlans },
    { id: "profile", label: "Profile", Icon: ProfileIcon, active: profileActive, onClick: onOpenProfile },
  ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Primary">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          className={`mbn-tab ${t.active ? "sel" : ""}`}
          onClick={t.onClick}
          aria-label={t.label}
          aria-current={t.active ? "page" : undefined}
        >
          <span className="mbn-icon">
            <t.Icon active={t.active} />
          </span>
          <span className="mbn-label">{t.label}</span>
          <span className="mbn-indicator" aria-hidden="true" />
        </button>
      ))}
    </nav>
  );
}

export default MobileBottomNav;
