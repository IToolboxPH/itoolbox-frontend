"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredAuth, logout } from "@/lib/auth";
import { authApi } from "@/lib/api-client";
import { AppIcon } from "@/components/app-icon";
import { BantAIWidget } from "@/components/bantai-widget";
import { getVisibleApps, canAccessApp, roleLabel as roleLabelOf } from "@/lib/platform-apps";
import { useBranding, useModuleOverrides } from "@/components/branding-provider";
import type { UserProfile } from "@itoolbox/ui/types";

// itoolbox-backend's ChangePasswordRequest minimum.
const MIN_PASSWORD = 10;

export default function AccountPage() {
  const branding = useBranding();
  const { moduleContent, moduleVisibility } = useModuleOverrides();
  const PLATFORM_APPS = useMemo(
    () => getVisibleApps(moduleContent, moduleVisibility),
    [moduleContent, moduleVisibility]
  );
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwSaving, setPwSaving] = useState(false);
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    const { token, user: u } = getStoredAuth();
    if (!token) { router.replace("/login?page=account"); return; }
    setUser(u);
  }, [router]);

  if (!user) return null;

  const roleLabel = roleLabelOf(user.global_role);

  function startChangingPassword() {
    setCurrentPw(""); setNewPw(""); setConfirmPw("");
    setPwError(""); setPwSuccess(false);
    setChangingPassword(true);
  }

  async function handleChangePassword() {
    setPwError("");
    if (newPw.length < MIN_PASSWORD) { setPwError(`New password must be at least ${MIN_PASSWORD} characters`); return; }
    if (newPw !== confirmPw) { setPwError("New passwords do not match"); return; }
    setPwSaving(true);
    try {
      await authApi.changePassword(currentPw, newPw);
      setPwSuccess(true);
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setTimeout(() => { setChangingPassword(false); setPwSuccess(false); }, 2000);
    } catch (err) {
      setPwError(err instanceof Error ? err.message : "Failed to change password.");
    } finally {
      setPwSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070b14] text-gray-900 dark:text-white transition-colors duration-200">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/[0.06] bg-white/80 dark:bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => setMenuOpen((o) => !o)} aria-label="Open menu" aria-expanded={menuOpen ? "true" : "false"}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/15 transition-colors -ml-0.5">
            <svg className="w-4 h-4 text-gray-700 dark:text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/>
              )}
            </svg>
          </button>
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-white rounded-lg px-2 py-1 overflow-hidden flex items-center gap-1.5">
              <img src={branding.logoSrc} alt="" className="h-5 w-auto object-contain"/>
              <span className="text-itoolbox-navy text-xs font-black tracking-tight">{branding.shortName}</span>
            </div>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => logout()} className="text-xs text-gray-400 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 transition-colors">Sign out</button>
          <Link href="/dashboard" className="px-3 py-1.5 text-[11px] font-bold text-white bg-itoolbox-red hover:bg-red-700 rounded-lg transition-colors">← Dashboard</Link>
        </div>
      </nav>

      {/* ── HAMBURGER MENU DRAWER — only modules this user can open ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}>
          <div className="absolute inset-0 bg-black/20 dark:bg-black/60"/>
          <div onClick={(e) => e.stopPropagation()}
            className="absolute top-14 left-0 right-0 sm:right-auto sm:w-80 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-b sm:border-r border-gray-200 dark:border-white/[0.06] bg-white dark:bg-[#0c1326] shadow-2xl p-3 space-y-1">
            {PLATFORM_APPS.filter((app) => canAccessApp(app, user)).map((app) => (
              <Link key={app.key} href={app.href} onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                <span className="w-7 flex items-center justify-center shrink-0">
                  <AppIcon icon={app.icon} imgSrc={app.imgSrc} name={app.title} emojiClassName="text-xl" imgClassName="w-6 h-6"/>
                </span>
                <span className="flex flex-col min-w-0">
                  <span className="text-sm font-black text-gray-900 dark:text-white">{app.title}</span>
                  <span className="text-[10px] text-gray-400 dark:text-white/40 truncate">{app.subtitle}</span>
                </span>
              </Link>
            ))}
            <div className="border-t border-gray-200 dark:border-white/[0.06] pt-1 mt-1">
              <Link href="/support" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-white/5">
                <span className="text-xl w-7 text-center shrink-0">🎫</span>
                <span className="text-sm font-black text-gray-900 dark:text-white">Support</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-black mb-3">Welcome, {(user.full_name || "User").split(" ")[0]}!</h1>
          <p className="text-gray-500 dark:text-white/50 text-base max-w-xl mx-auto">
            {branding.shortName} Digital Identity — below is your ID badge
          </p>
        </div>

        {/* ID Card Preview */}
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="relative w-80 rounded-3xl overflow-hidden border border-blue-500/30 bg-gradient-to-br from-blue-600 to-blue-900 p-6 shadow-2xl shadow-blue-900/30">
            <div className="absolute inset-0 opacity-10">
              <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                {[[20,10],[60,5],[100,15],[140,8],[180,12],[10,50],[50,45],[90,55],[130,48],[170,52],[30,80],[75,75],[120,85],[160,78]].map(([x,y],i)=>(
                  <circle key={i} cx={x} cy={y} r="1.5" fill="#fff" opacity="0.5"/>
                ))}
              </svg>
            </div>
            <div className="relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-2xl font-black text-white shrink-0 overflow-hidden">
                  {(user.full_name || "U").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-base font-black text-white leading-tight">{user.full_name || "IToolbox User"}</p>
                  <p className="text-[10px] text-blue-200 opacity-80 font-medium">{roleLabel}</p>
                  <div className="mt-1 inline-block bg-white/10 rounded-full px-2 py-0.5 text-[9px] text-blue-200 font-bold border border-white/20">{branding.shortName} ID</div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-3">
                <div className="p-1.5 bg-white rounded-lg">
                  <img src={branding.logoSrc} alt="" className="w-12 h-12 object-contain"/>
                </div>
                <div className="min-w-0">
                  <p className="text-[8px] font-black uppercase tracking-widest text-blue-200 opacity-60">Signed in as</p>
                  <p className="text-[9px] text-blue-200 opacity-60 font-mono mt-0.5 break-all">{user.email}</p>
                </div>
              </div>
            </div>
          </div>
          <p className="text-gray-400 dark:text-white/30 text-xs text-center max-w-xs">
            Your {branding.shortName} ID badge — one identity across BantAI and the {branding.appName}.
          </p>
        </div>

        {/* Account details */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-5 mb-10 max-w-md mx-auto">
          <p className="text-sm font-black mb-4">Account Details</p>
          <dl className="space-y-2.5">
            {[
              { label: "Name",   value: user.full_name || "—" },
              { label: "Email",  value: user.email },
              { label: "Role",   value: roleLabel },
              { label: "Status", value: user.is_active ? "Active" : "Disabled" },
            ].map((row) => (
              <div key={row.label} className="flex items-center justify-between gap-4">
                <dt className="text-xs text-gray-500 dark:text-white/40">{row.label}</dt>
                <dd className="text-sm text-gray-700 dark:text-white/80 truncate">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-[10px] text-gray-400 dark:text-white/25 mt-4">
            Names and roles are set by an admin in Security Settings.
          </p>
        </div>

        {/* Change Password */}
        <div className="rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-5 mb-10 max-w-md mx-auto">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-black">Password</p>
            {!changingPassword && (
              <button type="button" onClick={startChangingPassword}
                className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline">
                Change Password
              </button>
            )}
          </div>

          {changingPassword ? (
            <div className="space-y-3">
              {pwError && (
                <p className="text-[11px] text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
                  {pwError}
                </p>
              )}
              {pwSuccess && (
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-2 rounded-lg">
                  Password updated.
                </p>
              )}
              <div>
                <label htmlFor="current-password" className="block text-xs text-gray-500 dark:text-white/40 mb-1 font-medium">Current Password</label>
                <input id="current-password" type="password" autoComplete="current-password" value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-itoolbox-red/60 focus:ring-1 focus:ring-itoolbox-red/30 transition"
                />
              </div>
              <div>
                <label htmlFor="new-password" className="block text-xs text-gray-500 dark:text-white/40 mb-1 font-medium">New Password</label>
                <input id="new-password" type="password" autoComplete="new-password" value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder={`Minimum ${MIN_PASSWORD} characters`}
                  className="w-full bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-itoolbox-red/60 focus:ring-1 focus:ring-itoolbox-red/30 transition"
                />
              </div>
              <div>
                <label htmlFor="confirm-password" className="block text-xs text-gray-500 dark:text-white/40 mb-1 font-medium">Confirm New Password</label>
                <input id="confirm-password" type="password" autoComplete="new-password" value={confirmPw}
                  onChange={(e) => setConfirmPw(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-itoolbox-red/60 focus:ring-1 focus:ring-itoolbox-red/30 transition"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleChangePassword} disabled={pwSaving}
                  className="flex-1 py-2 rounded-lg text-xs font-black text-white bg-itoolbox-red hover:bg-red-700 disabled:opacity-50 transition-colors">
                  {pwSaving ? "Updating…" : "Update Password"}
                </button>
                <button type="button" onClick={() => setChangingPassword(false)} disabled={pwSaving}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-gray-500 dark:text-white/40 border border-gray-200 dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed">
              ••••••••••
            </p>
          )}
        </div>

        {/* Feature roadmap */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          {[
            { icon: "🪪", title: `${branding.shortName} ID`,  desc: "Your identity across BantAI and every platform module — role, access, and sign-in in one card.", status: "live"    },
            { icon: "🔑", title: "Role-Based Access",         desc: "Viewer, analyst, admin, or super admin: your role decides what you can open and do.",            status: "live"    },
            { icon: "🔐", title: "Self-Service Password",     desc: "Change your password any time from this page. Sessions are signed and expire on their own.",    status: "live"    },
            { icon: "🔔", title: "Storm Alerts",              desc: "BantAI's action briefs for your sites, sent to branch heads by SMS or Viber.",                    status: "planned" },
            { icon: "📲", title: "Mobile Account App",        desc: "Carry your IToolbox ID and approve storm actions from your phone.",                              status: "planned" },
            { icon: "🛡️", title: "Privacy Controls",          desc: "Choose what your profile shows to other members of your organization.",                         status: "planned" },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-4">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{f.icon}</span>
                <span className={`text-[9px] font-black tracking-widest uppercase rounded-full px-2 py-0.5 border ${f.status === "live" ? "text-emerald-600 dark:text-emerald-400 border-emerald-400/40 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10" : "text-gray-400 dark:text-white/30 border-gray-200 dark:border-white/10"}`}>
                  {f.status === "live" ? "Live" : "Planned"}
                </span>
              </div>
              <p className="text-xs font-bold mb-1">{f.title}</p>
              <p className="text-[11px] text-gray-500 dark:text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <div className="text-center">
          <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white transition-colors">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
      <BantAIWidget/>
    </div>
  );
}
