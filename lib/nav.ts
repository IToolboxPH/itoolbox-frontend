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

// One workflow run, start to finish -- all on the /autonomous page.
export const AUTONOMOUS_SUBPAGES: SubPage[] = [
  { label: "Triggers",  href: "/autonomous" },
  { label: "Workflows", href: "/autonomous" },
  { label: "Approvals", href: "/autonomous" },
  { label: "Reports",   href: "/autonomous" },
];

export const TRACKER_SUBPAGES: SubPage[] = [
  { label: "Overview", href: "/tracker" },
];

/** Tracker sub-apps the backend has no routes for yet; listed, not linked. */
export const TRACKER_PLANNED: string[] = ["Projects", "Team", "Meetings", "Actions"];
