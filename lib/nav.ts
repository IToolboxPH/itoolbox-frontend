export interface SubPage {
  label: string;
  href: string;
}

// Single source of truth for each module's sub-page list, so the dashboard
// cards, the module sidebars, and the /login preview carousel can never drift
// out of sync with each other.

export const INTELLIGENCE_SUBPAGES: SubPage[] = [
  { label: "Overview",     href: "/intelligence" },
  { label: "Data Sources", href: "/intelligence/sources" },
];

export const SECURE_SUBPAGES: SubPage[] = [
  { label: "Users",    href: "/security-settings" },
  { label: "Access",   href: "/security-settings" },
  { label: "Security", href: "/security-settings" },
];

// One storm run, start to finish -- all on the /autonomous page.
export const AUTONOMOUS_SUBPAGES: SubPage[] = [
  { label: "Bulletins",    href: "/autonomous" },
  { label: "Hazard",       href: "/autonomous" },
  { label: "Exposure",     href: "/autonomous" },
  { label: "Action Brief", href: "/autonomous" },
];

export const TRACKER_SUBPAGES: SubPage[] = [
  { label: "Overview", href: "/tracker" },
];

/** Tracker sub-apps the backend has no routes for yet; listed, not linked. */
export const TRACKER_PLANNED: string[] = ["Projects", "Team", "Meetings", "Actions"];
