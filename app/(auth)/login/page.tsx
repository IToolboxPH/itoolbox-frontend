"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { login, getStoredAuth, logout, type AuthState } from "@/lib/auth";
import { useBranding } from "@/components/branding-provider";
import { AUTONOMOUS_SUBPAGES, INTELLIGENCE_SUBPAGES, SECURE_SUBPAGES, TRACKER_PLANNED } from "@/lib/nav";
import { PLATFORM_APPS, roleLabel as roleLabelOf } from "@/lib/platform-apps";

/* ── Stored auth, read after mount ──────────────────────────────────
   The static export pre-renders this page signed out; reading localStorage
   during render would make the first client render disagree with that HTML. */
function useStoredAuth(): AuthState {
  const [auth, setAuth] = useState<AuthState>({ token: null, user: null });
  useEffect(() => { setAuth(getStoredAuth()); }, []);
  return auth;
}

/* ── Network node background ────────────────────────────────────── */
function NodeNetwork({ color }: { color: string }) {
  const nodes = [
    { x: 8,  y: 12 }, { x: 28, y: 6  }, { x: 55, y: 18 }, { x: 80, y: 8  },
    { x: 92, y: 30 }, { x: 18, y: 35 }, { x: 45, y: 30 }, { x: 70, y: 42 },
    { x: 88, y: 58 }, { x: 12, y: 60 }, { x: 38, y: 55 }, { x: 62, y: 68 },
    { x: 85, y: 78 }, { x: 22, y: 80 }, { x: 50, y: 85 }, { x: 75, y: 92 },
    { x: 5,  y: 90 }, { x: 35, y: 95 }, { x: 95, y: 70 },
  ];
  const edges = [
    [0,1],[1,2],[2,3],[3,4],[5,6],[6,7],[7,8],[9,10],[10,11],[11,12],
    [13,14],[14,15],[0,5],[1,6],[2,7],[3,4],[5,9],[6,10],[7,11],[8,12],
    [9,13],[10,14],[11,15],[13,16],[14,17],[12,18],
  ];
  return (
    <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full opacity-50"
      preserveAspectRatio="xMidYMid slice" aria-hidden>
      {edges.map(([a, b], i) => (
        <line key={i} x1={nodes[a].x} y1={nodes[a].y} x2={nodes[b].x} y2={nodes[b].y}
          stroke={color} strokeWidth="0.25" opacity="0.25"/>
      ))}
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={i % 4 === 0 ? 1.2 : 0.7} fill={color}
          opacity={i % 3 === 0 ? 0.9 : 0.5}/>
      ))}
    </svg>
  );
}

/* ── Icon with image fallback ───────────────────────────────────── */
function ComponentIcon({ icon, img, name, size = "w-5 h-5" }: { icon: string; img?: string; name: string; size?: string }) {
  const [failed, setFailed] = useState(false);
  if (!img || failed) return <span className="text-base leading-none">{icon}</span>;
  return <img src={img} alt={name} className={`${size} object-cover rounded-md`} onError={() => setFailed(true)}/>;
}

/* ── Bluetooth SVG ─────────────────────────────────────────────── */
function BluetoothIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-4 h-4 text-blue-400" fill="currentColor">
      <path d="M17.71 7.71L12 2h-1v7.59L6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 11 14.41V22h1l5.71-5.71-4.3-4.29 4.3-4.29zM13 5.83l1.88 1.88L13 9.59V5.83zm1.88 10.46L13 18.17v-3.76l1.88 1.88z"/>
    </svg>
  );
}

/* ── NFC waves SVG ─────────────────────────────────────────────── */
function NfcIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M6 12c0-3.31 2.69-6 6-6" strokeLinecap="round"/>
      <path d="M3 12c0-4.97 4.03-9 9-9" strokeLinecap="round"/>
      <path d="M1 12C1 5.93 5.93 1 12 1" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
    </svg>
  );
}

/* ── Waveform SVG ──────────────────────────────────────────────── */
function WaveformIcon() {
  return (
    <svg viewBox="0 0 32 14" className="w-8 h-3.5" fill="none">
      {[2,5,8,8,5,10,14,10,5,8,8,5,2].map((h, i) => (
        <rect key={i} x={i * 2.3 + 0.5} y={(14 - h) / 2} width="1.5" height={h}
          rx="0.75" fill="#60a5fa" opacity="0.7"/>
      ))}
    </svg>
  );
}

/* ── QR grid ───────────────────────────────────────────────────── */
function QrGrid() {
  return (
    <div className="grid grid-cols-3 gap-0.5 opacity-60">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className={`w-2 h-2 rounded-sm ${
          [0,2,6,8].includes(i) ? "bg-amber-400" : [4].includes(i) ? "bg-amber-300" : "bg-gray-500"
        }`}/>
      ))}
    </div>
  );
}

/* ── Page definitions ──────────────────────────────────────────── */
// id doubles as the /login?page=<id> URL slug and is the module's
// PLATFORM_APPS key, so names and taglines can't drift from the landing page.
// Docs has no preview page; it's linked from the menu instead.
const PAGES = PLATFORM_APPS.filter((app) => app.key !== "docs").map((app) => ({
  id: app.key,
  name: app.title,
  tagline: app.subtitle,
  color: app.hex,
  icon: app.icon,
  img: app.imgSrc,
}));

const DEFAULT_PAGE_ID = "account";

const PAGE_TEXT_CLS: Record<string, string> = {
  account:      "text-blue-500",
  bantai:       "text-orange-500",
  autonomous:   "text-green-500",
  intelligence: "text-purple-500",
  tracker:      "text-pink-500",
  secure:       "text-slate-400",
};

/* ── Logo pill (the IToolbox logo has an opaque white background) ─ */
function LogoPill({ size = "h-5" }: { size?: string }) {
  const branding = useBranding();
  return (
    <div className="bg-white rounded-lg px-2 py-1 overflow-hidden flex items-center gap-1.5">
      <img src={branding.logoSrc} alt="" className={`${size} w-auto object-contain`}/>
      <span className="text-itoolbox-navy text-xs font-black tracking-tight">{branding.shortName}</span>
    </div>
  );
}

/* ── Sign-in CTA banner ─────────────────────────────────────────── */
function SignInBanner({ onSignIn, pageName }: { onSignIn: () => void; pageName: string }) {
  const { token } = useStoredAuth();
  if (token) return null;
  return (
    <div className="bg-blue-500/[0.07] border border-blue-500/25 rounded-xl p-3 flex items-center justify-between gap-3">
      <p className="text-gray-500 dark:text-white/50 text-xs leading-tight">
        Sign in to access the full <strong className="text-gray-700 dark:text-white/70">{pageName}</strong> platform
      </p>
      <button type="button" onClick={onSignIn}
        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-[11px] font-black px-3 py-1.5 rounded-lg transition-colors shrink-0 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
        Sign In →
      </button>
    </div>
  );
}

/* ── BantAI teaser card (mascot + speech bubble + mini chat input) ── */
function BantAITeaser({ onOpenBantAI, onSignIn, inputRef }: { onOpenBantAI: () => void; onSignIn?: () => void; inputRef?: React.RefObject<HTMLInputElement | null> }) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const isLoggedIn = !!useStoredAuth().token;

  // A question asked here runs on the full BantAI page, with its evidence trail.
  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn) return;
    const text = input.trim();
    if (!text) return;
    router.push(`/bantai?q=${encodeURIComponent(text)}`);
  }

  return (
    <div className="relative z-10 flex flex-col items-center w-full max-w-[280px] mx-auto">
      {/* Speech bubble callout */}
      <div className="relative mb-3">
        <div className="bg-white rounded-2xl px-4 py-2.5 shadow-lg">
          <p className="text-gray-900 text-sm font-semibold text-center leading-snug">
            {isLoggedIn ? "How can I help you?" : "Sign in to chat with BantAI"}
          </p>
        </div>
        <div className="absolute left-1/2 -bottom-[5px] -translate-x-1/2 w-3 h-3 bg-white rotate-45"/>
      </div>

      <img src="/icons/bantai.jpg" alt="BantAI AI Assistant"
        className="w-56 h-56 object-cover rounded-3xl shadow-2xl mb-3"/>

      <div className="bg-[#5a0e0e] rounded-2xl rounded-tl-sm px-4 py-3 mb-2 w-full shadow-lg">
        <p className="text-white text-xs text-center leading-relaxed">
          Hello! 👋 I&apos;m <strong>BantAI</strong>, your Virtual Assistant.{" "}
          {isLoggedIn ? "Ask me below:" : "Sign in to unlock full AI assistance."}
        </p>
      </div>

      {isLoggedIn ? (
        <form onSubmit={handleSend} className="w-full mb-3">
          <div className="flex items-center gap-2 bg-transparent border border-gray-300 dark:border-white/30 rounded-full px-4 py-2.5">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask BantAI anything…"
              className="bg-transparent text-gray-900 dark:text-white text-xs flex-1 outline-none placeholder-gray-400 dark:placeholder-white/40 min-w-0"
            />
            <button type="submit" aria-label="Send to BantAI"
              className="w-7 h-7 rounded-full flex items-center justify-center bg-orange-600 hover:bg-orange-500 transition-colors shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
              </svg>
            </button>
          </div>
        </form>
      ) : (
        <button type="button" onClick={onSignIn ?? onOpenBantAI}
          className="w-full mb-3 flex items-center justify-center gap-2 bg-orange-600/10 hover:bg-orange-600/20 border border-orange-500/30 rounded-full px-4 py-2.5 transition-colors">
          <svg className="w-3.5 h-3.5 text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
          </svg>
          <span className="text-orange-400 text-xs font-bold">Sign in to Ask BantAI</span>
        </button>
      )}

      <button type="button" onClick={onOpenBantAI}
        className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/30 rounded-full px-2.5 py-1 hover:bg-red-500/20 transition-colors">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse"/>
        <span className="text-red-400 text-[10px] font-bold">Open full app ↗</span>
      </button>
    </div>
  );
}

/* ── Page 1: Account — login form ──────────────────────────────── */
function AccountPage({
  email, setEmail, password, setPassword,
  error, loading, handleSubmit, onOpenBantAI, bantaiInputRef,
}: {
  email: string; setEmail: (v: string) => void;
  password: string; setPassword: (v: string) => void;
  error: string; loading: boolean;
  handleSubmit: (e: React.FormEvent) => void;
  onOpenBantAI: () => void;
  bantaiInputRef?: React.RefObject<HTMLInputElement | null>;
}) {
  const branding = useBranding();
  const [showPw, setShowPw] = useState(false);
  const { token, user } = useStoredAuth();
  const isLoggedIn = !!token;

  const roleLabel = roleLabelOf(user?.global_role);

  const roleColor = user?.global_role === "super_admin" ? "text-red-400 border-red-500/30 bg-red-500/10"
    : user?.global_role === "admin" ? "text-amber-400 border-amber-500/30 bg-amber-500/10"
    : "text-blue-400 border-blue-500/30 bg-blue-500/10";

  return (
    <div className="relative min-h-full bg-gray-50 dark:bg-gradient-to-b dark:from-[#0c1a35] dark:to-[#0a0f1e]">
      <NodeNetwork color="#22c55e"/>
      <div className="absolute top-1/3 left-1/4 w-48 h-48 rounded-full opacity-20 pointer-events-none green-glow-blob"/>

      <div className="relative z-10 max-w-4xl mx-auto px-5 pt-6 pb-8">
        {/* Two-column on md+ */}
        <div className="flex flex-col md:flex-row gap-8 items-start">

          {/* Left: Account card */}
          <div className="flex flex-col items-center mx-auto md:mx-0 shrink-0">
            {/* Lanyard */}
            <div className="flex flex-col items-center">
              <div className="w-2.5 h-6 bg-gradient-to-b from-gray-700 to-gray-600 rounded-t"/>
              <div className="w-9 h-5 bg-gradient-to-b from-gray-500 to-gray-600 rounded-full -mt-0.5 flex items-center justify-center shadow-lg border border-gray-400/30">
                <div className="w-5 h-2.5 bg-gradient-to-b from-gray-700 to-gray-800 rounded-full"/>
              </div>
            </div>

            {/* Account body */}
            <div className="relative w-[320px] bg-gradient-to-b from-gray-700 via-gray-800 to-gray-900 rounded-2xl border border-gray-500/40 shadow-2xl overflow-hidden">
              <div className="bg-[#111] px-4 py-2 flex items-center justify-between">
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600"/>
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-600"/>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-gray-700 border border-gray-600"/>
                  <div className="w-7 h-3 rounded bg-gray-800 flex items-center justify-center gap-0.5">
                    <div className="w-1 h-1 rounded-full bg-gray-600"/>
                    <div className="w-1 h-1 rounded-full bg-gray-600"/>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_4px_#3b82f6]"/>
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-700"/>
                </div>
              </div>

              <div className="px-4 pt-3 pb-2">
                <div className="w-fit mx-auto mb-3">
                  <LogoPill size="h-6"/>
                </div>
                <div className="rounded-xl mb-3 h-32 overflow-hidden">
                  <img src="/icons/bantai.jpg" alt="BantAI" className="w-full h-full object-cover"/>
                </div>

                {isLoggedIn ? (
                  /* ── Logged-in identity view ── */
                  <div className="space-y-2.5">
                    <div className="text-center space-y-1">
                      <div className="w-12 h-12 rounded-full bg-blue-600/20 border-2 border-blue-500/40 flex items-center justify-center mx-auto text-xl overflow-hidden">
                        🪪
                      </div>
                      <p className="text-white font-black text-sm leading-tight">
                        {user?.full_name || user?.email || "IToolbox User"}
                      </p>
                      <span className={`text-[9px] font-black border rounded-full px-2 py-0.5 inline-block ${roleColor}`}>
                        {roleLabel}
                      </span>
                    </div>
                    <div className="bg-white/[0.06] border border-white/10 rounded-lg px-3 py-2 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-white/40">Status</span>
                        <div className="flex items-center gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
                          <span className="text-[9px] text-green-400 font-bold">Active Session</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] text-white/40">Platform</span>
                        <span className="text-[9px] text-white/70 font-medium">{branding.appName}</span>
                      </div>
                    </div>
                    <Link href="/account"
                      className="block w-full py-2 rounded text-xs font-black text-white text-center bg-itoolbox-red hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(239,63,52,0.4)]">
                      Open Account →
                    </Link>
                    <button type="button" onClick={() => logout()}
                      className="block w-full text-center text-[10px] text-gray-500 hover:text-red-400 transition-colors pt-0.5">
                      Sign out
                    </button>
                  </div>
                ) : (
                  /* ── Login form ── */
                  <form onSubmit={handleSubmit} className="space-y-2">
                    <div>
                      <label htmlFor="login-email" className="block text-[9px] text-gray-400 mb-1">Email</label>
                      <input id="login-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                        autoComplete="email" placeholder="you@company.com"
                        className="w-full bg-white/90 border border-gray-300 rounded px-2.5 py-1.5 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-itoolbox-red"/>
                    </div>
                    <div>
                      <label htmlFor="login-password" className="block text-[9px] text-gray-400 mb-1">Password</label>
                      <div className="relative">
                        <input id="login-password" type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} required
                          autoComplete="current-password" placeholder="••••••••"
                          className="w-full bg-white/90 border border-gray-300 rounded px-2.5 py-1.5 pr-8 text-xs text-gray-800 focus:outline-none focus:ring-1 focus:ring-itoolbox-red"/>
                        <button type="button" onClick={() => setShowPw((v) => !v)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                          aria-label={showPw ? "Hide password" : "Show password"}>
                          {showPw ? (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"/>
                            </svg>
                          ) : (
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {error && <p className="text-[10px] text-red-400 bg-red-900/20 px-2 py-1 rounded">{error}</p>}

                    <button type="submit" disabled={loading}
                      className="w-full py-2 rounded text-xs font-black text-white bg-itoolbox-red hover:bg-red-700 disabled:opacity-50 transition-colors mt-1 shadow-[0_0_15px_rgba(239,63,52,0.4)]">
                      {loading ? "Authenticating…" : "Sign In"}
                    </button>

                    {/* Accounts are provisioned by an admin and there is no self-service reset; Support reaches one. */}
                    <div className="text-center pt-1">
                      <Link href="/support" className="text-[10px] text-gray-400 hover:text-white transition-colors">
                        Forgot Password?
                      </Link>
                    </div>
                  </form>
                )}
              </div>

              <div className="px-3 py-2.5 flex items-center justify-between border-t border-white/10">
                <NfcIcon/>
                <span className="text-[9px] font-black text-gray-300 tracking-widest uppercase">
                  {user?.full_name ? `${user.full_name.split(" ")[0]} ID Badge` : "ID Badge"}
                </span>
                <QrGrid/>
              </div>

              <div className="absolute right-0 top-1/2 -translate-y-1/2 -mr-3 flex flex-col gap-3 items-center">
                <div className="bg-gray-800 rounded-full p-1 border border-gray-600"><BluetoothIcon/></div>
                <WaveformIcon/>
              </div>
            </div>
          </div>{/* end badge card column */}

          {/* Right: BantAITeaser */}
          <div className="flex-1 flex flex-col items-center pt-6 md:pt-0 border-t md:border-t-0 md:border-l border-gray-200 dark:border-white/[0.05] md:pl-8 w-full">
            <BantAITeaser onOpenBantAI={onOpenBantAI} inputRef={bantaiInputRef}/>
          </div>

        </div>{/* end two-column */}
      </div>{/* end max-w container */}
    </div>
  );
}

/* ── Page 2: Intelligent Workflow Automation preview ───────────── */
// The loop one workflow run goes through. The preview shows its shape, not live state.
const RUN_STEPS = [
  { step: "Trigger", text: "A schedule, a threshold, or a request starts the run" },
  { step: "Plan",    text: "What to check, and who needs to know" },
  { step: "Query",   text: "Every connected source queried where it lives" },
  { step: "Draft",   text: "Tasks and notices drafted from what BantAI finds" },
  { step: "Review",  text: "Thin or conflicting evidence goes back for more data" },
  { step: "Approve", text: "Every action linked to its evidence, approved by a person" },
];

function AutonomousPage({
  onOpenBantAI, bantaiInputRef, onSignIn,
}: {
  onOpenBantAI: () => void;
  bantaiInputRef?: React.RefObject<HTMLInputElement | null>;
  onSignIn: () => void;
}) {
  return (
    <div className="relative flex flex-col min-h-full overflow-y-auto bg-gray-50 dark:bg-[#061a0c]">
      <NodeNetwork color="#22c55e"/>
      <div className="absolute top-1/4 right-1/4 w-40 h-40 rounded-full opacity-15 pointer-events-none green-glow-blob"/>

      <div className="relative z-10 p-4 space-y-3">
        {/* App header */}
        <div className="bg-white dark:bg-white/[0.08] border border-gray-200 dark:border-white/10 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-100 dark:bg-white/10 rounded-xl overflow-hidden flex items-center justify-center text-2xl">
              📡
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-black text-sm">Workflow Automation</p>
              <p className="text-gray-400 dark:text-white/40 text-[10px] leading-tight">Trigger · Draft · Approve<br/>IToolbox · BantAI</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="text-[10px] font-black text-green-400 border border-green-500/30 bg-green-500/10 rounded-full px-2 py-0.5">🌐 Public Overview</span>
            <a href="/autonomous"
              className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-full px-2.5 py-1 hover:bg-green-500/20 transition-colors">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"/>
              <span className="text-green-400 text-[10px] font-bold">Open full app ↗</span>
            </a>
          </div>
        </div>

        <SignInBanner onSignIn={onSignIn} pageName="BantAI Intelligent Workflow Automation"/>

        {/* One workflow run, step by step */}
        <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <p className="text-gray-500 dark:text-white/50 text-[10px] font-black uppercase tracking-widest mb-3">One Workflow Run</p>
          <ol className="space-y-2.5">
            {RUN_STEPS.map((s, i) => (
              <li key={s.step} className="flex items-start gap-3">
                <span className="w-5 h-5 rounded-full bg-green-500/15 border border-green-500/30 text-green-600 dark:text-green-400 text-[10px] font-black flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                <span className="flex flex-col">
                  <span className="text-gray-700 dark:text-white/80 text-[11px] font-bold">{s.step}</span>
                  <span className="text-gray-400 dark:text-white/40 text-[10px] leading-snug">{s.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div className="flex flex-wrap gap-2">
          {AUTONOMOUS_SUBPAGES.map((sp) => (
            <span key={sp.label} className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-green-500/30 text-green-400/80">{sp.label}</span>
          ))}
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-white/[0.05]">
          <BantAITeaser onOpenBantAI={onOpenBantAI} onSignIn={onSignIn} inputRef={bantaiInputRef}/>
        </div>
      </div>
    </div>
  );
}

/* ── Page 3: Strategic Intelligence preview ────────────────────── */
// BantAI's data sources (itoolbox-data-platform's DATA_SOURCES.md), the live ones
// all public. `live: false` marks a planned source.
const DATA_PLAN = [
  { name: "Places, population, and public facilities",   live: true },
  { name: "Weather, forecasts, and climate history",     live: true },
  { name: "Tropical cyclone bulletins and typhoon history", live: true },
  { name: "Hazard maps, earthquakes, and disaster alerts", live: true },
  { name: "Your organization's documents and records",   live: false },
  { name: "Business apps and integrations",              live: false },
];

function IntelligencePage({
  onOpenBantAI, bantaiInputRef, onSignIn,
}: {
  onOpenBantAI: () => void;
  bantaiInputRef?: React.RefObject<HTMLInputElement | null>;
  onSignIn: () => void;
}) {
  const isLoggedIn = !!useStoredAuth().token;

  return (
    <div className="relative flex flex-col min-h-full bg-gray-50 dark:bg-[#0a0118]">
      <NodeNetwork color="#a855f7"/>
      <div className="absolute bottom-1/3 left-1/3 w-40 h-40 rounded-full opacity-15 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(168,85,247,0.4) 0%, transparent 70%)" }}/>

      <div className="relative z-10 p-4 space-y-3">

        {/* App header */}
        <div className="bg-white dark:bg-white/[0.06] border border-purple-500/30 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/40 rounded-xl overflow-hidden flex items-center justify-center text-2xl">
              🤖
            </div>
            <div>
              <p className="text-gray-900 dark:text-white font-black text-sm">BantAI Strategic Intelligence</p>
              <p className="text-purple-500 dark:text-purple-400/70 text-[10px] leading-tight">Connected Data<br/>IToolbox · BantAI</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full px-2.5 py-1">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-400"/>
              <span className="text-purple-400 text-[10px] font-bold">Preview</span>
            </div>
            {isLoggedIn && (
              <a href="/intelligence"
                className="flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 rounded-full px-2.5 py-1 hover:bg-purple-500/20 transition-colors">
                <span className="text-purple-400 text-[10px] font-bold">Open BantAI Strategic Intelligence ↗</span>
              </a>
            )}
          </div>
        </div>

        <SignInBanner onSignIn={onSignIn} pageName="BantAI Strategic Intelligence"/>

        {/* KPI cards */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { value: String(DATA_PLAN.length), unit: "", label: "Sources in the plan", color: "#a855f7" },
            { value: String(DATA_PLAN.filter((d) => d.live).length), unit: "", label: "Live now", color: "#22c55e" },
            { value: "0", unit: "",  label: "Copies made",          color: "#f59e0b" },
          ].map((k) => (
            <div key={k.label} className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-xl p-3 text-center">
              <p className="font-black text-xl" style={{ color: k.color }}>
                {k.value}<span className="text-xs">{k.unit}</span>
              </p>
              <p className="text-gray-400 dark:text-white/30 text-[9px] mt-0.5 leading-tight">{k.label}</p>
            </div>
          ))}
        </div>

        {/* The data plan */}
        <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-xl p-4 space-y-2.5">
          <p className="text-gray-500 dark:text-white/50 text-[10px] font-black uppercase tracking-widest">Sources · Queried in Place</p>
          {DATA_PLAN.map((d) => (
            <div key={d.name} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"/>
              <span className="text-gray-500 dark:text-white/60 text-[11px] flex-1">{d.name}</span>
              <span className={`text-[9px] font-black uppercase tracking-widest rounded-full px-1.5 py-0.5 border ${
                d.live ? "text-green-500 dark:text-green-400 border-green-500/30" : "text-gray-400 dark:text-white/40 border-gray-200 dark:border-white/10"
              }`}>
                {d.live ? "Live" : "Next"}
              </span>
            </div>
          ))}
        </div>

        {/* Feature tags */}
        <div className="flex flex-wrap gap-2">
          {INTELLIGENCE_SUBPAGES.map((sp) => (
            <span key={sp.label} className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-purple-500/30 text-purple-400/80">{sp.label}</span>
          ))}
        </div>

        {/* BantAI */}
        <div className="pt-3 border-t border-gray-200 dark:border-white/[0.05]">
          <BantAITeaser onOpenBantAI={onOpenBantAI} onSignIn={onSignIn} inputRef={bantaiInputRef}/>
        </div>
      </div>
    </div>
  );
}

/* ── Page 4: Security Settings preview ─────────────────────────── */
function SecurePage({
  onOpenBantAI, bantaiInputRef, onSignIn,
}: {
  onOpenBantAI: () => void;
  bantaiInputRef?: React.RefObject<HTMLInputElement | null>;
  onSignIn: () => void;
}) {
  const isLoggedIn = !!useStoredAuth().token;

  return (
    <div className="relative flex flex-col min-h-full overflow-y-auto bg-gray-50 dark:bg-[#0d1117]">
      <NodeNetwork color="#94a3b8"/>

      <div className="relative z-10 p-4 space-y-3">
        <div className="bg-white dark:bg-white/[0.06] border border-slate-500/30 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-slate-100 dark:bg-slate-500/20 rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-6 h-6 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"/>
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 dark:text-white font-black text-sm">Security Settings</p>
            <p className="text-slate-500 dark:text-slate-400 text-[10px]">Platform Safety & Access Control</p>
          </div>
          <span className="text-[10px] font-black text-amber-400 border border-amber-500/30 bg-amber-500/10 rounded-full px-2 py-0.5 shrink-0">🔒 Admin Only</span>
          {isLoggedIn && (
            <a href="/security-settings"
              className="flex items-center gap-1.5 bg-slate-500/10 border border-slate-500/30 rounded-full px-2.5 py-1 hover:bg-slate-500/20 transition-colors shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-pulse"/>
              <span className="text-slate-400 text-[10px] font-bold">Open Admin Panel ↗</span>
            </a>
          )}
        </div>

        <SignInBanner onSignIn={onSignIn} pageName="Security Settings"/>

        {/* Security status — public portion always visible */}
        <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200 dark:border-white/[0.07] flex items-center justify-between">
            <span className="text-gray-500 dark:text-white/60 text-[10px] font-black tracking-widest uppercase">Security Status</span>
            <span className="flex items-center gap-1.5 text-emerald-500 dark:text-emerald-400 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
              All Systems Secure
            </span>
          </div>

          {isLoggedIn ? (
            /* Detailed rows — logged-in only */
            <>
              <div className="p-4 space-y-2">
                {[
                  { label: "Auth Method",  value: "Signed JWT sessions",       ok: true  },
                  { label: "Role Gating",  value: "4 roles, checked per route", ok: true  },
                  { label: "SQL Guard",    value: "Read-only, per query",       ok: true  },
                  { label: "Audit Logs",   value: "Backend pending",            ok: false },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between">
                    <span className="text-gray-400 dark:text-white/40 text-[10px]">{row.label}</span>
                    <span className={`text-[10px] font-bold ${row.ok ? "text-emerald-500 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400"}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
              <div className="px-4 pb-4">
                <a href="/security-settings"
                  className="flex items-center justify-center gap-2 w-full bg-slate-600 hover:bg-slate-500 active:bg-slate-700 text-white text-xs font-black py-2.5 rounded-xl transition-colors">
                  Open Admin Panel ↗
                </a>
              </div>
            </>
          ) : (
            /* Public — blurred/locked placeholder */
            <div className="p-4 space-y-2">
              {["Auth Method", "Role Gating", "SQL Guard", "Audit Logs"].map((label) => (
                <div key={label} className="flex items-center justify-between">
                  <span className="text-gray-300 dark:text-white/20 text-[10px]">{label}</span>
                  <span className="text-[10px] font-bold text-gray-200 dark:text-white/10 select-none blur-[3px]">••••••••••••</span>
                </div>
              ))}
              <p className="text-gray-300 dark:text-white/20 text-[9px] text-center pt-1">🔒 Sign in to view security details</p>
            </div>
          )}
        </div>

        {/* Module grid — hidden from public */}
        {isLoggedIn && (
          <div className="grid grid-cols-2 gap-2">
            {SECURE_SUBPAGES.map((sp, i) => ({
              ...sp,
              icon: ["👤", "🔑", "🛡️"][i],
              sub:  ["Accounts & roles", "What each role can do", "Sessions & SQL guard"][i],
            })).map((f) => (
              <div key={f.label} className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-xl p-3">
                <span className="text-lg">{f.icon}</span>
                <p className="text-gray-700 dark:text-white/80 text-[11px] font-bold mt-1">{f.label}</p>
                <p className="text-gray-400 dark:text-white/30 text-[10px]">{f.sub}</p>
              </div>
            ))}
          </div>
        )}

        {/* BantAI */}
        <div className="pt-3 border-t border-gray-200 dark:border-white/[0.05]">
          <BantAITeaser onOpenBantAI={onOpenBantAI} onSignIn={onSignIn} inputRef={bantaiInputRef}/>
        </div>
      </div>
    </div>
  );
}

/* ── Page 5: Ask BantAI ────────────────────────────────────────── */
function AskBantAIPage({ onSignIn }: { onSignIn: () => void }) {
  const router = useRouter();
  const [input, setInput] = useState("");
  const isLoggedIn = !!useStoredAuth().token;

  // Questions run on the full BantAI page, where the investigation streams.
  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!isLoggedIn) return;
    const text = input.trim();
    if (!text) return;
    router.push(`/bantai?q=${encodeURIComponent(text)}`);
  }

  return (
    <div className="relative flex flex-col h-full min-h-full bg-gray-50 dark:bg-[#0d0700]">
      <NodeNetwork color="#f97316"/>
      <div className="absolute top-1/3 left-1/4 w-40 h-40 rounded-full opacity-15 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 70%)" }}/>

      <div className="relative z-10 flex flex-col flex-1 min-h-0">
        <div className="shrink-0 flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.04]">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center shrink-0">
            <img src="/icons/bantai.jpg" alt="Ask BantAI" className="w-full h-full object-cover"/>
          </div>
          <div>
            <p className="text-gray-900 dark:text-white font-black text-sm">Ask BantAI</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-orange-400"/>
              <span className="text-orange-400 text-[10px] font-medium">AI Chat Assistant</span>
            </div>
          </div>
          {!isLoggedIn && (
            <button type="button" onClick={onSignIn}
              className="ml-auto flex items-center gap-1 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white text-[10px] font-black px-2.5 py-1.5 rounded-lg transition-colors shadow-[0_0_8px_rgba(59,130,246,0.3)] shrink-0">
              Sign In →
            </button>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
          <div className="bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 rounded-2xl rounded-tl-sm p-4 max-w-[95%] sm:max-w-[90%]">
            <p className="text-gray-700 dark:text-white text-xs leading-relaxed">
              Hello! 👋 I&apos;m <strong className="text-orange-500 dark:text-orange-300">BantAI</strong>, your AI assistant. Ask me about IToolbox or your connected data — I&apos;ll look through it and show you the evidence behind the answer.
            </p>
          </div>
        </div>

        {isLoggedIn ? (
          <form onSubmit={handleSend} className="shrink-0 p-4 pt-2">
            <div className="flex items-center gap-2 bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 rounded-2xl px-4 py-3">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask BantAI anything…"
                className="bg-transparent text-gray-900 dark:text-white text-xs flex-1 outline-none placeholder-gray-400 dark:placeholder-white/20 min-w-0"
              />
              <button type="submit" aria-label="Send" disabled={!input.trim()}
                className="w-7 h-7 rounded-full flex items-center justify-center bg-orange-600 shrink-0 disabled:opacity-40">
                <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
                </svg>
              </button>
            </div>
          </form>
        ) : (
          <div className="shrink-0 p-4 pt-2">
            <button type="button" onClick={onSignIn}
              className="w-full flex items-center justify-center gap-2 bg-orange-600/10 hover:bg-orange-600/20 border border-orange-500/30 rounded-2xl px-4 py-3.5 transition-colors">
              <svg className="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
              </svg>
              <span className="text-orange-400 text-xs font-bold">Sign in to Ask BantAI</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Page 6: Project Management preview ────────────────────────── */
function ProjectTrackPage({
  onOpenBantAI, bantaiInputRef, onSignIn,
}: {
  onOpenBantAI: () => void;
  bantaiInputRef?: React.RefObject<HTMLInputElement | null>;
  onSignIn: () => void;
}) {
  const isLoggedIn = !!useStoredAuth().token;
  // Illustrative only: the shape of a client engagement, not tracked data.
  const milestones = [
    { label: "Phase 1 — Data sources connected",  pct: 100, done: true  },
    { label: "Phase 2 — Agent loop and evidence", pct: 60,  done: false },
    { label: "Phase 3 — Team interface",          pct: 30,  done: false },
    { label: "Phase 4 — Pilot with a client",     pct: 0,   done: false },
  ];

  return (
    <div className="relative min-h-full bg-gray-50 dark:bg-[#10040a]">
      <NodeNetwork color="#ec4899"/>
      <div className="absolute top-1/3 left-1/3 w-48 h-48 rounded-full opacity-10 pointer-events-none" style={{ background: "radial-gradient(circle, rgba(236,72,153,0.5) 0%, transparent 70%)" }}/>

      <div className="relative z-10 p-4 space-y-3">

        {/* App header */}
        <div className="bg-white dark:bg-white/[0.06] border border-pink-500/30 rounded-xl p-4 flex items-center gap-3">
          <div className="w-12 h-12 bg-pink-100 dark:bg-pink-500/20 rounded-xl flex items-center justify-center shrink-0 text-2xl">
            📊
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-gray-900 dark:text-white font-black text-sm">Project Management</p>
            <p className="text-pink-500 dark:text-pink-400/70 text-[10px] leading-tight">IToolbox Engagements · Projects, Team, Meetings, Actions</p>
          </div>
          <span className="text-[10px] font-black text-pink-400 border border-pink-500/30 bg-pink-500/10 rounded-full px-2 py-0.5 shrink-0">Preview</span>
          {isLoggedIn && (
            <a href="/tracker"
              className="flex items-center gap-1.5 bg-pink-500/10 border border-pink-500/30 rounded-full px-2.5 py-1 hover:bg-pink-500/20 transition-colors shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-pink-400 animate-pulse"/>
              <span className="text-pink-400 text-[10px] font-bold">Open Project Management ↗</span>
            </a>
          )}
        </div>

        <SignInBanner onSignIn={onSignIn} pageName="Project Management"/>

        {/* Roadmap milestones */}
        <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-xl p-4 space-y-3">
          <p className="text-gray-500 dark:text-white/50 text-[10px] font-black uppercase tracking-widest mb-2">Engagement Roadmap · Example</p>
          {milestones.map((m) => (
            <div key={m.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-600 dark:text-white/70 text-[11px] font-medium">{m.label}</span>
                <span className={`text-[10px] font-black ${m.done ? "text-green-500 dark:text-green-400" : "text-pink-500 dark:text-pink-400"}`}>
                  {m.done ? "✓ Done" : `${m.pct}%`}
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 dark:bg-white/[0.06] rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all"
                  style={{ width: `${m.pct}%`, background: m.done ? "#22c55e" : "#ec4899" }}/>
              </div>
            </div>
          ))}
        </div>

        {/* Feature tags */}
        <div className="flex flex-wrap gap-2">
          {TRACKER_PLANNED.map((label) => (
            <span key={label} className="text-[10px] font-bold px-2.5 py-1 rounded-full border border-pink-500/30 text-pink-400/80">{label}</span>
          ))}
        </div>

        {/* BantAI */}
        <div className="pt-3 border-t border-gray-200 dark:border-white/[0.05]">
          <BantAITeaser onOpenBantAI={onOpenBantAI} onSignIn={onSignIn} inputRef={bantaiInputRef}/>
        </div>
      </div>
    </div>
  );
}

/* ── Main page ─────────────────────────────────────────────────── */
export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [error, setError]         = useState("");
  const [loading, setLoading]     = useState(false);
  const isLoggedIn = !!useStoredAuth().token;

  const [currentPage, setCurrentPage] = useState(DEFAULT_PAGE_ID);
  const [menuOpen, setMenuOpen]       = useState(false);
  const accountBantAIInputRef      = useRef<HTMLInputElement>(null);
  const autonomousBantAIInputRef   = useRef<HTMLInputElement>(null);
  const intelligenceBantAIInputRef = useRef<HTMLInputElement>(null);
  const trackerBantAIInputRef      = useRef<HTMLInputElement>(null);
  const secureBantAIInputRef       = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login(email.trim(), password);
      router.replace("/account");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p = params.get("page");
    if (p && PAGES.some((page) => page.id === p)) setCurrentPage(p);
  }, []);

  function goToPage(id: string) {
    setCurrentPage(id);
    setMenuOpen(false);
    window.history.replaceState({}, "", `/login?page=${id}`);
  }

  const page = PAGES.find((p) => p.id === currentPage) ?? PAGES[0];

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-[#0a0f1e]">

      {/* ── TOP NAV ── */}
      <nav className="relative z-50 flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/[0.05] shrink-0">
        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <button type="button" onClick={() => setMenuOpen((o) => !o)} aria-label="Open menu"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors -ml-0.5">
              <svg className="w-4 h-4 text-gray-700 dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/>
                )}
              </svg>
            </button>
          ) : (
            <Link href="/" aria-label="Home"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors -ml-0.5">
              <svg className="w-4 h-4 text-gray-700 dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"/>
              </svg>
            </Link>
          )}
          <Link href="/" className="flex items-center gap-2">
            <LogoPill/>
          </Link>
        </div>
        <div className="flex items-center gap-1.5">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard" className="px-3 py-1.5 text-[11px] font-bold text-white bg-itoolbox-red hover:bg-red-700 rounded-lg transition-colors shadow-[0_0_10px_rgba(239,63,52,0.3)]">Dashboard</Link>
              <button type="button" onClick={() => logout()}
                className="px-3 py-1.5 text-[11px] font-bold text-gray-600 dark:text-white/60 bg-gray-100 dark:bg-[#1a2444] hover:bg-red-50 dark:hover:bg-red-900/40 hover:text-red-500 dark:hover:text-red-400 rounded-lg transition-colors border border-gray-200 dark:border-white/10">
                Sign Out
              </button>
            </>
          ) : null}
          {!isLoggedIn && (
            <Link href="/support" className="px-3 py-1.5 text-[11px] font-bold text-gray-500 dark:text-white/50 bg-gray-100 dark:bg-white/[0.07] hover:bg-gray-200 dark:hover:bg-white/[0.12] hover:text-gray-700 dark:hover:text-white/70 rounded-lg transition-colors border border-gray-200 dark:border-white/10">🎫 Support</Link>
          )}
          <Link href="/" className="px-3 py-1.5 text-[11px] font-bold text-gray-700 dark:text-white bg-gray-100 dark:bg-[#1a2444] hover:bg-gray-200 dark:hover:bg-[#1e2d57] rounded-lg transition-colors border border-gray-200 dark:border-white/10">About</Link>
        </div>
      </nav>

      {/* ── HAMBURGER MENU DRAWER ── */}
      {isLoggedIn && menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/60"/>
          <div onClick={(e) => e.stopPropagation()}
            className="absolute top-[57px] left-0 right-0 bg-white dark:bg-[#0c1326] border-b border-gray-200 dark:border-white/10 shadow-2xl p-3 space-y-1">
            {PAGES.map((p) => (
              <button key={p.id} type="button" onClick={() => goToPage(p.id)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors ${
                  currentPage === p.id ? "bg-gray-100 dark:bg-white/10" : "hover:bg-gray-50 dark:hover:bg-white/5"
                }`}>
                <div className="w-7 h-7 flex items-center justify-center shrink-0">
                  <ComponentIcon icon={p.icon} img={p.img} name={p.name} size="w-6 h-6"/>
                </div>
                <span className="flex flex-col">
                  <span className={`text-sm font-black ${PAGE_TEXT_CLS[p.id] ?? "text-gray-900 dark:text-white"}`}>{p.name}</span>
                  <span className="text-gray-400 dark:text-white/40 text-[10px]">{p.tagline}</span>
                </span>
              </button>
            ))}
            <div className="border-t border-gray-200 dark:border-white/[0.06] pt-1 mt-1">
              <Link href="/docs" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                <div className="w-7 h-7 flex items-center justify-center shrink-0 text-lg">📚</div>
                <span className="flex flex-col">
                  <span className="text-sm font-black text-teal-500 dark:text-teal-400">Docs</span>
                  <span className="text-gray-400 dark:text-white/40 text-[10px]">User Guides · API Reference · Platform Architecture · Knowledge Base</span>
                </span>
              </Link>
              <Link href="/support" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                <div className="w-7 h-7 flex items-center justify-center shrink-0 text-lg">🎫</div>
                <span className="text-sm font-black text-gray-900 dark:text-white">Support</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── ACTIVE PAGE HEADER STRIP ── */}
      <div className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 border-b bg-gray-100 dark:bg-black/30"
        style={{ borderBottomColor: `${page.color}40` }}>
        <div className="w-5 h-5 shrink-0 flex items-center justify-center">
          <ComponentIcon icon={page.icon} img={page.img} name={page.name} size="w-5 h-5"/>
        </div>
        <span className="flex flex-col min-w-0">
          <span className={`text-sm font-black ${PAGE_TEXT_CLS[page.id] ?? "text-gray-900 dark:text-white"}`}>{page.name}</span>
          <span className="text-gray-400 dark:text-white/40 text-[10px] leading-tight">{page.tagline}</span>
        </span>
      </div>

      {/* ── CONTENT AREA — one page at a time, fades in on change ── */}
      <div className="flex-1 overflow-hidden relative">
        <div
          key={currentPage}
          className={`absolute inset-0 [animation:pageIn_0.25s_ease-out_both] ${
            currentPage === "bantai" ? "flex flex-col overflow-hidden" : "overflow-y-auto"
          }`}
        >
          {currentPage === "account" && (
            <AccountPage
              email={email} setEmail={setEmail}
              password={password} setPassword={setPassword}
              error={error} loading={loading}
              handleSubmit={handleSubmit}
              onOpenBantAI={() => goToPage("bantai")}
              bantaiInputRef={accountBantAIInputRef}
            />
          )}
          {currentPage === "bantai" && <AskBantAIPage onSignIn={() => goToPage("account")}/>}
          {currentPage === "autonomous" && <AutonomousPage onOpenBantAI={() => goToPage("bantai")} bantaiInputRef={autonomousBantAIInputRef} onSignIn={() => goToPage("account")}/>}
          {currentPage === "intelligence" && <IntelligencePage onOpenBantAI={() => goToPage("bantai")} bantaiInputRef={intelligenceBantAIInputRef} onSignIn={() => goToPage("account")}/>}
          {currentPage === "tracker" && <ProjectTrackPage onOpenBantAI={() => goToPage("bantai")} bantaiInputRef={trackerBantAIInputRef} onSignIn={() => goToPage("account")}/>}
          {currentPage === "secure" && <SecurePage onOpenBantAI={() => goToPage("bantai")} bantaiInputRef={secureBantAIInputRef} onSignIn={() => goToPage("account")}/>}
        </div>
      </div>

      {/* ── BOTTOM TAGLINE ── */}
      <div className="bg-gray-50 dark:bg-[#0a0f1e] border-t border-gray-200 dark:border-white/[0.04] py-4 text-center shrink-0">
        <p className="text-gray-900 dark:text-white text-xl sm:text-2xl font-black tracking-wide">
          Future Ready. Sustainably Driven.
        </p>
        <p className="text-gray-400 dark:text-white/20 text-xs mt-1 tracking-widest font-medium">
          Resilient, sustainable technology — engineered from the network up.
        </p>
      </div>

      <style>{`
        @keyframes pageIn {
          from { opacity: 0; transform: translateY(5px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
