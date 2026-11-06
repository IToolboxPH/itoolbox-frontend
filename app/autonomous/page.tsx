"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getStoredAuth, logout } from "@/lib/auth";
import { agentApi } from "@/lib/api-client";
import { useBranding } from "@/components/branding-provider";
import { BantAIWidget } from "@/components/bantai-widget";
import type { InvestigationSummary } from "@itoolbox/ui/types";

const STATUS_BADGE: Record<InvestigationSummary["status"], string> = {
  running:   "bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/20",
  completed: "bg-green-500/15 text-green-600 dark:text-green-400 border border-green-500/20",
  failed:    "bg-red-500/15 text-red-500 dark:text-red-400 border border-red-500/20",
  refused:   "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20",
  cancelled: "bg-gray-100 dark:bg-white/[0.08] text-gray-400 dark:text-white/40 border border-gray-200 dark:border-white/10",
};

export default function AutonomousPage() {
  const branding = useBranding();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName]     = useState<string | null>(null);

  const [runs, setRuns]           = useState<InvestigationSummary[] | null>(null);
  const [opsLoading, setOpsLoading] = useState(false);
  const [opsError, setOpsError]     = useState<string | null>(null);

  useEffect(() => {
    const { token, user } = getStoredAuth();
    setIsLoggedIn(!!token);
    setUserName(user?.full_name ?? null);
  }, []);

  useEffect(() => {
    if (!isLoggedIn) return;
    setOpsLoading(true);
    agentApi.investigations(10)
      .then(setRuns)
      .catch((err) => setOpsError(err instanceof Error ? err.message : "Failed to load recent investigations."))
      .finally(() => setOpsLoading(false));
  }, [isLoggedIn]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070b14] text-gray-900 dark:text-white transition-colors duration-200">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/[0.06] bg-white/80 dark:bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-white rounded-lg px-2 py-1 overflow-hidden flex items-center gap-1.5">
              <img src={branding.logoSrc} alt="" className="h-5 w-auto object-contain"/>
              <span className="text-itoolbox-navy text-xs font-black tracking-tight">{branding.shortName}</span>
            </div>
            <span className="text-gray-400 dark:text-white/40 text-xs hidden sm:block">{branding.appName}</span>
          </Link>
          <span className="text-gray-300 dark:text-white/20 text-xs">/</span>
          <span className="text-gray-600 dark:text-white/60 text-xs font-bold truncate">📡 BantAI Intelligent Workflow Automation</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline text-[9px] font-black tracking-widest uppercase text-green-600 dark:text-green-400 border border-green-400/40 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 rounded-full px-2 py-1">🌐 Public</span>
          {isLoggedIn ? (
            <>
              <button type="button" onClick={() => logout()} className="text-xs text-gray-400 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 transition-colors">Sign out</button>
              <Link href="/dashboard" className="px-3 py-1.5 text-[11px] font-bold text-white bg-itoolbox-red hover:bg-red-700 rounded-lg transition-colors">Dashboard</Link>
            </>
          ) : (
            <Link href="/login?page=autonomous" className="px-3 py-1.5 text-[11px] font-bold text-white bg-itoolbox-red hover:bg-red-700 rounded-lg transition-colors">Sign In</Link>
          )}
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-green-600 dark:text-green-400 border border-green-400/40 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10 rounded-full px-3 py-1 mb-4">
            🌐 Public Overview · Workflows Need a Sign-In
          </div>
          <h1 className="text-4xl font-black mb-3">BantAI Intelligent Workflow Automation</h1>
          <p className="text-gray-500 dark:text-white/50 text-base max-w-xl mx-auto">
            Intelligent workflow orchestration and automation. When something changes — a threshold crossed,
            a request waiting, a report due — BantAI checks your connected data and drafts the next steps for a
            person to approve.
          </p>
          {isLoggedIn && userName && (
            <p className="mt-3 text-green-600 dark:text-green-400 text-xs font-bold">
              👋 Welcome, {userName.split(" ")[0]} — you&apos;re signed in.
            </p>
          )}
        </div>

        {/* Workflow monitor panel */}
        <div className="rounded-2xl border border-green-400/30 dark:border-green-500/20 bg-green-50/50 dark:bg-green-500/[0.04] p-6 mb-8 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-green-600/70 dark:text-green-400/70 mb-3">Workflow Monitor</p>
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Active Workflows",  value: "—", unit: "running",   icon: "⚙️" },
              { label: "Next Trigger",      value: "—", unit: "scheduled", icon: "⏱️" },
              { label: "Awaiting Approval", value: "—", unit: "actions",   icon: "✅" },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-4">
                <div className="text-2xl mb-1">{m.icon}</div>
                <div className="text-2xl font-black">{m.value}</div>
                <div className="text-[10px] text-gray-400 dark:text-white/30">{m.unit}</div>
                <div className="text-[10px] text-gray-400 dark:text-white/40 mt-0.5">{m.label}</div>
              </div>
            ))}
          </div>
          <button type="button" disabled className="px-8 py-3 rounded-xl text-sm font-black text-white bg-gradient-to-r from-green-600 to-green-700 opacity-60 cursor-not-allowed">
            Start a Workflow — Coming Soon
          </button>
          <p className="text-gray-400 dark:text-white/20 text-[10px] mt-2">Workflow triggers and scheduling are under development</p>
        </div>

        {/* Autonomous operations panel — recent investigations + proposed actions */}
        {isLoggedIn && (
          <div className="rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] p-6 mb-8">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-green-600/70 dark:text-green-400/70">Autonomous Operations</p>
                <p className="text-gray-400 dark:text-white/40 text-[11px] mt-0.5">Investigations and proposed actions — approval is human sign-off, not automatic execution.</p>
              </div>
              <Link
                href="/bantai"
                className="px-4 py-2 rounded-lg text-xs font-black text-green-700 dark:text-green-400 border border-green-500/30 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 dark:hover:bg-green-500/20 transition-colors"
              >
                Ask BantAI →
              </Link>
            </div>

            {opsError && (
              <p className="text-red-500 dark:text-red-400 text-[11px] font-bold mb-3">{opsError}</p>
            )}
            {opsLoading && (
              <p className="text-gray-400 dark:text-white/40 text-xs">Loading…</p>
            )}

            {!opsLoading && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Investigations */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 mb-2">
                    Recent Investigations {runs && `(${runs.length})`}
                  </p>
                  {runs && runs.length === 0 && (
                    <p className="text-gray-400 dark:text-white/30 text-xs">No investigations yet.</p>
                  )}
                  <div className="space-y-2">
                    {(runs ?? []).map((r) => (
                      <Link key={r.id} href={`/bantai?id=${r.id}`} className="block rounded-xl border border-gray-200 dark:border-white/[0.07] p-3 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-xs font-bold truncate">{r.question}</span>
                          <span className={`text-[9px] font-black uppercase tracking-widest rounded-full px-2 py-0.5 shrink-0 ${STATUS_BADGE[r.status]}`}>
                            {r.status}
                          </span>
                        </div>
                        <p className="text-gray-400 dark:text-white/40 text-[11px]">
                          {r.model_name} · {r.tool_calls} step{r.tool_calls === 1 ? "" : "s"}
                        </p>
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Proposed actions */}
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 mb-2">
                    Proposed Actions
                  </p>
                  <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/[0.1] p-4">
                    <p className="text-gray-500 dark:text-white/50 text-xs leading-relaxed">
                      No proposed actions yet. Once workflow automation lands, each run proposes actions here — tasks,
                      notices, schedule changes — and every one waits for a person to approve or edit it.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {[
            { icon: "⏱️", title: "Triggers",        desc: "A schedule, a threshold crossed in your data, or a request starts a run.",                  tag: "Public" },
            { icon: "🗂️", title: "Connected Data",  desc: "BantAI checks every connected source where it lives; nothing is copied into a new warehouse.", tag: "Public" },
            { icon: "🧠", title: "Planning",        desc: "BantAI works out what to check and drafts the next steps from what it finds.",               tag: "Public" },
            { icon: "📝", title: "Task Drafting",   desc: "Tasks, notices, and schedule changes drafted for your team to review.",                       tag: isLoggedIn ? "Login Unlocked" : "Login Required" },
            { icon: "🧭", title: "Routing",         desc: "Each step goes to the right person, with the context they need.",                             tag: isLoggedIn ? "Login Unlocked" : "Login Required" },
            { icon: "🧐", title: "Review Step",     desc: "A second check challenges every action; thin or conflicting evidence goes back for more data.", tag: "Public" },
            { icon: "🧾", title: "Evidence Ledger", desc: "Every step stores its query, source, and rows, so each decision stays traceable.",            tag: isLoggedIn ? "Login Unlocked" : "Login Required" },
            { icon: "✅", title: "Human Approval",  desc: "Nothing goes out until a person approves or edits each action.",                              tag: isLoggedIn ? "Login Unlocked" : "Login Required" },
            { icon: "📣", title: "Notices",         desc: "Approved actions become drafted email, SMS, or Viber messages.",                              tag: isLoggedIn ? "Login Unlocked" : "Login Required" },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-4">
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{f.icon}</span>
                <span className={`text-[9px] font-black tracking-widest uppercase rounded-full px-2 py-0.5 border ${
                  f.tag === "Login Unlocked" ? "text-green-600 dark:text-green-400 border-green-400/40 dark:border-green-500/30 bg-green-50 dark:bg-green-500/10" :
                  f.tag === "Login Required" ? "text-amber-600 dark:text-amber-400 border-amber-400/40 dark:border-amber-500/30 bg-amber-50 dark:bg-amber-500/10" :
                  "text-gray-400 dark:text-white/30 border-gray-200 dark:border-white/10"
                }`}>{f.tag}</span>
              </div>
              <p className="text-xs font-bold mb-1">{f.title}</p>
              <p className="text-[11px] text-gray-500 dark:text-white/40 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>

        <p className="text-center text-[11px] text-gray-400 dark:text-white/30 mb-10 max-w-xl mx-auto">
          BantAI supports decisions, and people stay in charge. It is not a warning service: for weather, disaster, and other life-safety calls, PAGASA, NDRRMC, and your local government remain the authority.
        </p>

        {!isLoggedIn && (
          <div className="text-center border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.02] rounded-2xl p-6 mb-6">
            <p className="text-gray-500 dark:text-white/50 text-sm mb-3">Sign in to run workflows, check the evidence behind each step, and approve actions.</p>
            <Link href="/login?page=autonomous" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black text-white bg-itoolbox-red hover:bg-red-700 transition-colors">
              Sign In → Unlock Full Access
            </Link>
          </div>
        )}

        <div className="text-center">
          <Link href={isLoggedIn ? "/dashboard" : "/"} className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-white/40 hover:text-gray-700 dark:hover:text-white transition-colors">
            ← {isLoggedIn ? "Back to Dashboard" : "Back to Home"}
          </Link>
        </div>
      </div>
      <BantAIWidget/>
    </div>
  );
}
