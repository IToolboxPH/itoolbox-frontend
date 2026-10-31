import type { UserProfile } from "@itoolbox/ui/types";
import { AUTONOMOUS_SUBPAGES, INTELLIGENCE_SUBPAGES, SECURE_SUBPAGES, TRACKER_SUBPAGES, type SubPage } from "@/lib/nav";

export interface PlatformApp {
  key: string;
  adminOnly: boolean;
  badge: string;
  title: string;
  subtitle: string;
  desc: string;
  gradient: string;
  border: string;
  accent: string;
  bg: string;
  /** Hex equivalent of `accent`/`gradient`, for contexts (inline styles, SVG) where Tailwind classes don't apply. */
  hex: string;
  icon: string;
  imgSrc?: string;
  href: string;
  subPages: SubPage[];
}

// Single source of truth for the platform's module list — used by the landing
// carousel, ticker and hamburger, the dashboard cards, and the account menu, so
// order, wording, and icons can't drift apart between pages.
export const PLATFORM_APPS: PlatformApp[] = [
  {
    key: "account",
    adminOnly: false,
    badge: "",
    title: "Account Profile",
    subtitle: "A Smart Digital Identity — Secure, Scalable, and Built for IToolbox.",
    desc: "One IToolbox identity for Bantay and every platform module — your role, your access, and your sign-in in a single card.",
    gradient: "from-blue-600 to-blue-800",
    border: "border-blue-500/30",
    accent: "text-blue-400",
    bg: "bg-blue-500/10",
    hex: "#3b82f6",
    icon: "🪪",
    href: "/account",
    subPages: [],
  },
  {
    key: "bantay",
    adminOnly: false,
    badge: "",
    title: "Knowledge at Your Fingertips — Bantay",
    subtitle: "A Unified AI Assistant — Instant Knowledge with Automation and Intelligent Decisions.",
    desc: "Ask Bantay why. It plans an investigation, queries every source in place through the Zetaris AI Data Harness, and answers with the evidence behind each claim.",
    gradient: "from-orange-600 to-orange-800",
    border: "border-orange-500/30",
    accent: "text-orange-400",
    bg: "bg-orange-500/10",
    hex: "#f97316",
    icon: "💬",
    imgSrc: "/icons/bantay.jpg",
    href: "/bantay",
    subPages: [],
  },
  {
    key: "autonomous",
    adminOnly: false,
    badge: "",
    title: "Autonomous Typhoon-Operation Agent",
    subtitle: "Detect, Alert, Recommend — Autonomous Typhoon-Operations Powered by PAGASA BagyoAPI bulletins, Project NOAH flood, landslide and storm surge hazard, Branches, distribution centres, staff, inventory, delivery schedule, continuity SOP and insurance terms.",
    desc: "When a PAGASA bulletin puts company sites under a signal, Bantay scores each site's exposure and drafts actions — close early, pre-stock, move stock out of flood zones, reschedule deliveries — for the manager to approve.",
    gradient: "from-green-600 to-green-800",
    border: "border-green-500/30",
    accent: "text-green-400",
    bg: "bg-green-500/10",
    hex: "#22c55e",
    icon: "📡",
    href: "/autonomous",
    subPages: AUTONOMOUS_SUBPAGES,
  },
  {
    key: "intelligence",
    adminOnly: false,
    badge: "",
    title: "Intelligence & Analytics",
    subtitle: "Empowering Decisions Through Intelligent Automation",
    desc: "Everything Bantay can see: the sources the Zetaris AI Data Harness federates — bulletins, hazard layers, branch and inventory tables — browsed in place, with nothing copied into a new warehouse.",
    gradient: "from-purple-600 to-purple-800",
    border: "border-purple-500/30",
    accent: "text-purple-400",
    bg: "bg-purple-500/10",
    hex: "#a855f7",
    icon: "🤖",
    href: "/intelligence",
    subPages: INTELLIGENCE_SUBPAGES,
  },
  {
    key: "tracker",
    adminOnly: false,
    badge: "",
    title: "Project Management",
    subtitle: "Seamless Project Management.",
    desc: "End-to-end project management for IToolbox engagements — projects, team capacity, meetings, and action items.",
    gradient: "from-pink-600 to-pink-800",
    border: "border-pink-500/30",
    accent: "text-pink-400",
    bg: "bg-pink-500/10",
    hex: "#ec4899",
    icon: "📊",
    href: "/tracker",
    subPages: TRACKER_SUBPAGES,
  },
  {
    key: "secure",
    adminOnly: true,
    badge: "",
    title: "Security Settings",
    subtitle: "Enterprise‑Grade Security and Governance, End‑to‑End.",
    desc: "Role-based access, signed JWT sessions, and a read-only SQL guard between Bantay and your data — every query the agent writes is checked before it reaches Zetaris.",
    gradient: "from-slate-600 to-slate-800",
    border: "border-slate-500/30",
    accent: "text-slate-400",
    bg: "bg-slate-500/10",
    hex: "#94a3b8",
    icon: "🔒",
    href: "/security-settings",
    subPages: SECURE_SUBPAGES,
  },
  {
    key: "docs",
    adminOnly: true,
    badge: "",
    title: "Docs",
    subtitle: "Comprehensive Documentation and Knowledge Base for Scalable Platforms.",
    desc: "User guides, API reference, and architecture for Bantay and the IToolbox platform — the agent loop, the Zetaris data harness, and the evidence ledger.",
    gradient: "from-teal-600 to-teal-800",
    border: "border-teal-500/30",
    accent: "text-teal-400",
    bg: "bg-teal-500/10",
    hex: "#14b8a6",
    icon: "📚",
    href: "/docs",
    subPages: [
      { label: "User Guides",   href: "/docs" },
      { label: "API Reference", href: "/docs" },
      { label: "Architecture",  href: "/docs" },
      { label: "SOPs",          href: "/docs" },
    ],
  },
];

/** Per-module overrides layered on PLATFORM_APPS (see components/branding-provider.tsx). */
export interface ModuleContentOverride {
  name?: string;
  tagline?: string;
  desc?: string;
  hex?: string;
}

function withOverride(app: PlatformApp, override?: ModuleContentOverride): PlatformApp {
  if (!override) return app;
  return {
    ...app,
    title: override.name ?? app.title,
    subtitle: override.tagline ?? app.subtitle,
    desc: override.desc ?? app.desc,
    hex: override.hex ?? app.hex,
  };
}

/**
 * PLATFORM_APPS with content overrides applied and hidden modules removed —
 * no role filtering, so it's safe for logged-out surfaces like the landing
 * page carousel.
 */
export function getVisibleApps(
  moduleContent: Record<string, ModuleContentOverride> = {},
  moduleVisibility: Record<string, boolean> = {}
): PlatformApp[] {
  return PLATFORM_APPS
    .filter((app) => moduleVisibility[app.key] !== false)
    .map((app) => withOverride(app, moduleContent[app.key]));
}

/** Admin-only modules need an admin; every other module is open to any signed-in user. */
export function canAccessApp(app: PlatformApp, user: UserProfile | null): boolean {
  if (!user) return false;
  if (app.adminOnly) return isAdmin(user);
  return true;
}

export function isAdmin(user: UserProfile | null): boolean {
  return user?.global_role === "super_admin" || user?.global_role === "admin";
}

export function roleLabel(role: string | undefined): string {
  switch (role) {
    case "super_admin": return "Super Admin";
    case "admin":       return "Admin";
    case "analyst":     return "Analyst";
    default:            return "Viewer";
  }
}
