"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getStoredAuth, logout } from "@/lib/auth";
import { agentApi } from "@/lib/api-client";
import { useTheme } from "@/components/theme-provider";
import { useBranding, useModuleOverrides } from "@/components/branding-provider";
import { AppIcon } from "@/components/app-icon";
import { getVisibleApps, canAccessApp, isAdmin as isAdminUser, roleLabel as roleLabelOf } from "@/lib/platform-apps";
import { Switch } from "@/components/ui/switch";
import { Sun, Moon } from "lucide-react";
import type { InvestigationSummary, UserProfile } from "@itoolbox/ui/types";

const STATUS_DOT: Record<InvestigationSummary["status"], string> = {
  running:   "bg-orange-400",
  completed: "bg-green-400",
  failed:    "bg-red-400",
  refused:   "bg-amber-400",
  cancelled: "bg-gray-400",
};

function ago(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours} hour${hours === 1 ? "" : "s"} ago` : `${Math.round(hours / 24)} days ago`;
}

/* ── Account Card ────────────────────────────────────────────────────── */
function AccountCard({ user, roleLabel }: { user: UserProfile; roleLabel: string }) {
  const branding = useBranding();
  return (
    <div className="flex flex-col gap-3">
      {/* ID card */}
      <div className="relative rounded-3xl overflow-hidden border border-blue-500/30 bg-gradient-to-br from-blue-600 to-blue-900 p-5 shadow-2xl shadow-blue-900/30 w-full">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
            {[[20,10],[60,5],[100,15],[140,8],[180,12],[10,50],[50,45],[90,55],[130,48],[170,52],[30,80],[75,75],[120,85],[160,78]].map(([x,y],i)=>(
              <circle key={i} cx={x} cy={y} r="1.5" fill="#fff" opacity="0.5"/>
            ))}
          </svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-xl font-black text-white shrink-0 overflow-hidden">
              {(user.full_name || "U").charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-black text-white leading-tight">{user.full_name || "Platform User"}</p>
              <p className="text-[10px] text-blue-200 opacity-80 font-medium">{roleLabel}</p>
              <Link href="/account" className="mt-1 inline-block bg-white/20 hover:bg-white/30 transition-colors rounded-full px-2 py-0.5 text-[9px] text-white font-bold border border-white/30">Open Account →</Link>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-3">
            <div className="p-1.5 bg-white rounded-lg shrink-0">
              <img src={branding.logoSrc} alt="" className="w-[52px] h-[52px] object-contain"/>
            </div>
            <div className="min-w-0">
              <p className="text-[8px] font-black uppercase tracking-widest text-blue-200 opacity-60">{branding.shortName} ID</p>
              <p className="text-[9px] text-blue-200 opacity-60 font-mono mt-0.5 break-all">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
      <Link href="/account"
        className="text-center text-xs text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white/70 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/25 rounded-xl py-2 transition-colors">
        🔐 Account &amp; Password
      </Link>
    </div>
  );
}

/* ── Main dashboard ──────────────────────────────────────────────────── */
export default function DashboardPage() {
  const router  = useRouter();
  const branding = useBranding();
  const { moduleContent, moduleVisibility } = useModuleOverrides();
  const APPS = useMemo(
    () => getVisibleApps(moduleContent, moduleVisibility),
    [moduleContent, moduleVisibility]
  );
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [activity, setActivity] = useState<InvestigationSummary[] | null>(null);
  const { dark, toggleTheme } = useTheme();

  useEffect(() => {
    const { token, user } = getStoredAuth();
    if (!token) { router.replace("/login?page=account"); return; }
    setProfile(user);
    agentApi.investigations(4).then(setActivity).catch(() => setActivity([]));
  }, [router]);

  const user = profile;
  if (!user) return null;

  const isAdmin   = isAdminUser(user);
  const roleLabel = roleLabelOf(user.global_role);

  function canAccess(app: typeof APPS[number]): boolean {
    return canAccessApp(app, user);
  }

  /* ── Theme tokens ── */
  const bg      = dark ? "bg-[#0a0f1e]"                              : "bg-gray-50";
  const navBg   = dark ? "bg-[#0a0f1e]/95 border-white/[0.06]"      : "bg-white/95 border-gray-200";
  const card    = dark ? "bg-white/[0.04] border-white/[0.08]"      : "bg-white border-gray-200";
  const heading = dark ? "text-white"                                : "text-gray-900";
  const sub     = dark ? "text-white/40"                             : "text-gray-400";
  const label   = dark ? "text-white/50"                             : "text-gray-500";

  return (
    <div className={`min-h-screen ${bg} transition-colors duration-300`}>

      {/* ── Top Nav ── */}
      <header className={`sticky top-0 z-20 border-b backdrop-blur-md ${navBg}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setMenuOpen((o) => !o)} aria-label="Open menu" aria-expanded={menuOpen ? "true" : "false"}
              className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors -ml-0.5 ${dark ? "bg-white/10 hover:bg-white/15" : "bg-gray-100 hover:bg-gray-200"}`}>
              <svg className={`w-4 h-4 ${heading}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"/>
                )}
              </svg>
            </button>
            <Link href="/" className="bg-white rounded-lg px-2 py-1 overflow-hidden shrink-0 flex items-center gap-1.5">
              <img src={branding.logoSrc} alt="" className="h-5 w-auto object-contain"/>
              <span className="text-itoolbox-navy text-xs font-black tracking-tight">{branding.shortName}</span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 pl-2 border-l border-white/[0.07]">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 bg-itoolbox-red text-white overflow-hidden">
                {(user.full_name || "U").charAt(0).toUpperCase()}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className={`text-xs font-bold ${heading}`}>{user.full_name || user.email}</p>
                <p className={`text-[10px] ${sub}`}>{roleLabel}</p>
              </div>
            </div>
            <label className="flex items-center gap-1.5 ml-1 cursor-pointer" title="Toggle theme">
              {dark ? <Moon className={`size-3.5 ${sub}`} /> : <Sun className={`size-3.5 ${sub}`} />}
              <Switch checked={dark} onCheckedChange={() => toggleTheme()} className="scale-90" />
            </label>
            <button type="button" onClick={() => logout()}
              className={`text-xs transition-colors ml-1 ${dark ? "text-white/30 hover:text-red-400" : "text-gray-400 hover:text-red-500"}`}>
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* ── HAMBURGER MENU DRAWER — only modules this user can open ── */}
      {menuOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)}>
          <div className={`absolute inset-0 ${dark ? "bg-black/60" : "bg-black/20"}`}/>
          <div onClick={(e) => e.stopPropagation()}
            className={`absolute top-14 left-0 right-0 sm:right-auto sm:w-80 max-h-[calc(100vh-3.5rem)] overflow-y-auto border-b sm:border-r shadow-2xl p-3 space-y-1 ${dark ? "bg-[#0c1326] border-white/[0.06]" : "bg-white border-gray-200"}`}>
            {APPS.filter((app) => canAccess(app)).map((app) => (
              <Link key={app.key} href={app.href} onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors ${dark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                <span className="w-7 flex items-center justify-center shrink-0">
                  <AppIcon icon={app.icon} imgSrc={app.imgSrc} name={app.title} emojiClassName="text-xl" imgClassName="w-6 h-6"/>
                </span>
                <span className="flex flex-col min-w-0">
                  <span className={`text-sm font-black ${dark ? app.accent : "text-gray-900"}`}>{app.title}</span>
                  <span className={`text-[10px] truncate ${sub}`}>{app.subtitle}</span>
                </span>
              </Link>
            ))}
            <div className={`border-t pt-1 mt-1 ${dark ? "border-white/[0.06]" : "border-gray-200"}`}>
              <Link href="/support" onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg transition-colors ${dark ? "hover:bg-white/5" : "hover:bg-gray-50"}`}>
                <span className="text-xl w-7 text-center shrink-0">🎫</span>
                <span className={`text-sm font-black ${heading}`}>Support</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-8">

        {/* ── Welcome banner + Account ── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-5 items-start">
          <div className={`relative rounded-2xl overflow-hidden border h-full ${dark ? "border-white/[0.06] bg-[#0c1326]" : "border-blue-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50"}`}>
            <div className={`absolute inset-0 opacity-10 pointer-events-none ${dark ? "" : "opacity-5"}`}>
              <svg viewBox="0 0 200 80" className="w-full h-full" preserveAspectRatio="xMidYMid slice">
                {[[20,15],[60,8],[100,20],[140,12],[180,18],[10,50],[50,45],[90,55],[130,48],[170,52],[30,70],[75,65],[120,72],[160,68]].map(([x,y],i)=>(
                  <circle key={i} cx={x} cy={y} r="1.5" fill="#ef3f34" opacity="0.6"/>
                ))}
              </svg>
            </div>
            <div className="relative z-10 p-6">
              <h1 className={`text-2xl font-black ${dark ? "text-white" : "text-gray-900"}`}>Welcome back, {(user.full_name || "User").split(" ")[0]}.</h1>
              <p className={`text-sm mt-1 ${dark ? "text-white/50" : "text-gray-500"}`}>
                {roleLabel}{isAdmin ? " · Admin access enabled" : ""}
              </p>
            </div>
          </div>
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest mb-3 ${sub}`}>Your Account</p>
            <AccountCard user={user} roleLabel={roleLabel}/>
          </div>
        </div>

        {/* ── Platform Modules (full workspace apps) ── */}
        <div className="space-y-4">
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${sub}`}>Platform Modules</p>
            <p className={`text-xs mt-0.5 ${sub}`}>Full-featured workspaces with dedicated sub-apps</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {APPS.filter((app) => ["bantay", "autonomous", "intelligence"].includes(app.key)).map((app) => {
              const accessible = canAccess(app);
              return (
                <div key={app.key}
                  className={`rounded-2xl border overflow-hidden flex flex-col transition-all ${card} ${app.border} ${accessible ? "hover:shadow-lg hover:shadow-black/20" : "opacity-50"}`}>
                  {/* Card header */}
                  <div className={`p-5 border-b ${dark ? `border-white/[0.06] bg-[#0c1326]` : `${app.border} ${app.bg}`}`}>
                    <div className="flex items-center justify-between mb-3">
                      <AppIcon icon={app.icon} imgSrc={app.imgSrc} name={app.title} emojiClassName="text-3xl" imgClassName="w-9 h-9"/>
                      {app.badge && (
                        <span className={`text-[9px] font-black tracking-widest uppercase rounded px-2 py-0.5 leading-none border ${app.border} ${app.accent}`}>
                          {app.badge}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-base font-black leading-tight ${dark ? app.accent : "text-gray-900"}`}>{app.title}</h3>
                    <p className={`text-xs font-medium mt-0.5 ${dark ? "text-white/50" : "text-gray-500"}`}>{app.subtitle}</p>
                  </div>

                  {/* Card body */}
                  <div className="p-4 flex flex-col gap-3 flex-1">
                    <p className={`text-xs leading-relaxed ${label}`}>{app.desc}</p>

                    {/* Sub-page chips */}
                    {app.subPages.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {app.subPages.map((sp) => (
                          accessible ? (
                            <Link key={sp.href + sp.label} href={sp.href}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg transition-opacity hover:opacity-70 ${app.bg} ${app.accent}`}>
                              {sp.label}
                            </Link>
                          ) : (
                            <span key={sp.href + sp.label}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg ${app.bg} ${app.accent}`}>
                              {sp.label}
                            </span>
                          )
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <div className="mt-auto pt-1">
                      {accessible ? (
                        <Link href={app.href}
                          className={`block w-full text-center text-xs font-black py-2.5 rounded-xl text-white bg-gradient-to-r ${app.gradient} hover:opacity-90 transition-opacity`}>
                          Open {app.title} →
                        </Link>
                      ) : (
                        <div className={`block w-full text-center text-xs font-black py-2.5 rounded-xl text-white/40 border ${dark ? "border-white/10 bg-white/[0.03]" : "border-gray-200 bg-gray-50"}`}>
                          🔒 Access Restricted
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Platform Tools (quick-access tiles) ── */}
        <div className="space-y-4">
          <div>
            <p className={`text-[10px] font-black uppercase tracking-widest ${sub}`}>Platform Tools</p>
            <p className={`text-xs mt-0.5 ${sub}`}>Quick access to platform services</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {APPS.filter((app) => ["secure", "tracker"].includes(app.key)).map((app) => {
              const accessible = canAccess(app);
              return (
                <div key={app.key}
                  className={`rounded-2xl border overflow-hidden transition-all ${card} ${app.border} ${accessible ? "hover:shadow-md hover:shadow-black/20" : "opacity-50"}`}>
                  <div className={`p-4 border-b ${dark ? `border-white/[0.06] bg-[#0c1326]` : `${app.border} ${app.bg}`}`}>
                    <div className="flex items-start justify-between mb-2">
                      <AppIcon icon={app.icon} imgSrc={app.imgSrc} name={app.title} emojiClassName="text-2xl" imgClassName="w-7 h-7"/>
                      {app.badge && (
                        <span className={`text-[8px] font-black tracking-widest uppercase rounded px-1.5 py-0.5 leading-none border ${app.border} ${app.accent}`}>
                          {app.badge}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-sm font-black leading-tight ${dark ? app.accent : "text-gray-900"}`}>{app.title}</h3>
                    <p className={`text-[10px] mt-0.5 ${dark ? "text-white/40" : "text-gray-400"}`}>{app.subtitle}</p>
                  </div>
                  <div className="px-3 pb-3 pt-2.5">
                    {accessible ? (
                      <Link href={app.href}
                        className={`block w-full text-center text-[10px] font-black py-2 rounded-lg text-white bg-gradient-to-r ${app.gradient} hover:opacity-90 transition-opacity`}>
                        Open {app.title} →
                      </Link>
                    ) : (
                      <div className={`block w-full text-center text-[10px] font-black py-2 rounded-lg text-white/30 border ${dark ? "border-white/10 bg-white/[0.03]" : "border-gray-200 bg-gray-50"}`}>
                        🔒 Restricted
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Recent Activity — your latest Bantay investigations ── */}
        <div className={`rounded-2xl border p-5 ${card}`}>
          <div className="flex items-center justify-between mb-4">
            <p className={`text-[10px] font-black uppercase tracking-widest ${sub}`}>Recent Activity</p>
            <Link href="/bantay" className={`text-[9px] hover:underline ${sub}`}>All investigations →</Link>
          </div>
          {activity === null ? (
            <p className={`text-xs ${sub}`}>Loading…</p>
          ) : activity.length === 0 ? (
            <p className={`text-xs ${sub}`}>No activity yet — ask Bantay a question to start.</p>
          ) : (
            <div className="space-y-3">
              {activity.map((a) => (
                <Link key={a.id} href={`/bantay?id=${a.id}`} className="flex items-start gap-3 group">
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${STATUS_DOT[a.status]}`}/>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug group-hover:underline ${heading}`}>💬 Asked Bantay: {a.question}</p>
                    <p className={`text-[10px] mt-0.5 ${sub}`}>{ago(a.created_at)} · {a.status}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
