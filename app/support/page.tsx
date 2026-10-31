"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getStoredAuth } from "@/lib/auth";
import { useBranding, useModuleOverrides } from "@/components/branding-provider";
import { getVisibleApps, roleLabel } from "@/lib/platform-apps";
import type { UserProfile } from "@itoolbox/ui/types";

const CATEGORIES = [
  { value: "bug",        label: "🐛 Bug Report",     desc: "Something is broken or not working as expected" },
  { value: "access",     label: "🔑 Account Access", desc: "Can't sign in, forgot your password, or need a role change" },
  { value: "feature",    label: "✨ Feature Request", desc: "Suggest a new feature or improvement" },
  { value: "question",   label: "❓ Question / Help", desc: "Need guidance on how to use Bantay or the platform" },
  { value: "other",      label: "📋 Other",           desc: "Anything else not covered above" },
];

export default function SupportPage() {
  const branding = useBranding();
  const { moduleContent, moduleVisibility } = useModuleOverrides();
  // No role filter: Support is reachable logged-out, and people often need to
  // report problems with modules they can't get into.
  const COMPONENTS = useMemo(
    () => [...getVisibleApps(moduleContent, moduleVisibility).map((app) => app.title), "Platform General"],
    [moduleContent, moduleVisibility]
  );
  const [user, setUser] = useState<UserProfile | null>(null);
  const [checkedAuth, setCheckedAuth] = useState(false);

  const [email, setEmail]             = useState("");
  const [category, setCategory]       = useState("");
  const [component, setComponent]     = useState("");
  const [subject, setSubject]         = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority]       = useState("normal");
  const [ticketId, setTicketId]       = useState("");
  const [copied, setCopied]           = useState(false);

  useEffect(() => {
    // Support must stay reachable when logged out -- it's exactly where
    // someone having trouble signing in needs to end up.
    const { user: u } = getStoredAuth();
    setUser(u);
    setCheckedAuth(true);
  }, []);

  // itoolbox-backend has no support route yet, so a ticket is assembled here
  // and handed to an admin by the person filing it.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTicketId(`ITB-${Date.now().toString(36).toUpperCase()}`);
    setCopied(false);
  }

  function ticketText(): string {
    return [
      `Ticket ${ticketId}`,
      `From: ${user ? `${user.full_name || user.email} <${user.email}>` : email}`,
      `Category: ${CATEGORIES.find((c) => c.value === category)?.label ?? category}`,
      `Component: ${component}`,
      `Priority: ${priority}`,
      `Subject: ${subject}`,
      "",
      description,
    ].join("\n");
  }

  async function copyTicket() {
    try {
      await navigator.clipboard.writeText(ticketText());
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  if (!checkedAuth) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070b14] text-gray-900 dark:text-white transition-colors duration-200">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/[0.06] bg-white/80 dark:bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href={user ? "/dashboard" : "/"} className="flex items-center gap-2">
            <div className="bg-white rounded-lg px-2 py-1 overflow-hidden flex items-center gap-1.5">
              <img src={branding.logoSrc} alt="" className="h-5 w-auto object-contain"/>
              <span className="text-itoolbox-navy text-xs font-black tracking-tight">{branding.shortName}</span>
            </div>
            <span className="text-gray-400 dark:text-white/40 text-xs hidden sm:block">{branding.appName}</span>
          </Link>
          <span className="text-gray-300 dark:text-white/20 text-xs">/</span>
          <span className="text-gray-600 dark:text-white/60 text-xs font-bold">Support</span>
        </div>
        <div className="flex items-center gap-2">
          <Link href={user ? "/dashboard" : "/"}
            className="px-3 py-1.5 text-[11px] font-bold text-white bg-itoolbox-red hover:bg-red-700 rounded-lg transition-colors">
            ← {user ? "Dashboard" : "Home"}
          </Link>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        {ticketId ? (
          <div className="text-center py-16 space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border-2 border-green-500/30 flex items-center justify-center mx-auto text-4xl">✅</div>
            <div>
              <h1 className="text-2xl font-black mb-2">Ticket Ready</h1>
              <p className="text-gray-500 dark:text-white/50 text-sm max-w-sm mx-auto">
                Tickets aren&apos;t sent automatically yet. Copy the details below and send them to your {branding.shortName} administrator.
              </p>
            </div>
            <div className="bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-2xl p-6 text-left space-y-3 max-w-sm mx-auto">
              {[
                { label: "Ticket ID",  value: ticketId,                                                className: "font-black font-mono" },
                { label: "Category",   value: CATEGORIES.find(c => c.value === category)?.label ?? "", className: "" },
                { label: "Component",  value: component,                                               className: "" },
                { label: "Priority",   value: priority.charAt(0).toUpperCase() + priority.slice(1),   className: `font-bold ${priority === "high" ? "text-red-400" : priority === "low" ? "text-gray-400" : "text-amber-400"}` },
              ].map((r) => (
                <div key={r.label} className="flex items-center justify-between">
                  <span className="text-gray-400 dark:text-white/40 text-xs">{r.label}</span>
                  <span className={`text-xs ${r.className}`}>{r.value}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <button type="button" onClick={copyTicket}
                className="px-5 py-2.5 rounded-xl text-xs font-black bg-itoolbox-red hover:bg-red-700 transition-colors text-white">
                {copied ? "✓ Copied" : "Copy Ticket Details"}
              </button>
              <button type="button" onClick={() => {
                setTicketId(""); setCategory(""); setComponent(""); setSubject(""); setDescription(""); setPriority("normal");
              }} className="px-5 py-2.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/15 text-gray-500 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors">
                New Ticket
              </button>
              <Link href={user ? "/dashboard" : "/"} className="px-5 py-2.5 rounded-xl text-xs font-bold border border-gray-200 dark:border-white/15 text-gray-500 dark:text-white/60 hover:bg-gray-50 dark:hover:bg-white/[0.05] transition-colors">
                {user ? "Back to Dashboard" : "Back to Home"}
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="mb-8">
              <h1 className="text-2xl font-black mb-1">Support Center</h1>
              <p className="text-gray-500 dark:text-white/40 text-sm">
                Report bugs, request access, or ask questions about Bantay and the {branding.appName}.
              </p>
              {user ? (
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400 dark:text-white/30">
                  <span>Filing as</span>
                  <span className="text-gray-600 dark:text-white/60 font-bold">{user.full_name || user.email}</span>
                  <span className="px-1.5 py-0.5 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/5 text-[10px] font-bold text-gray-500 dark:text-white/40">
                    {roleLabel(user.global_role)}
                  </span>
                </div>
              ) : (
                <p className="mt-3 text-xs text-gray-400 dark:text-white/30">
                  Not signed in — filing as a guest. Add your email below so your admin can follow up.
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {!user && (
                <div>
                  <label htmlFor="support-email" className="block text-xs font-bold text-gray-500 dark:text-white/60 mb-2">Your Email <span className="text-red-400">*</span></label>
                  <input id="support-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
                    placeholder="you@company.com"
                    className="w-full bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-400 dark:focus:border-white/25 focus:bg-white dark:focus:bg-white/[0.06] transition-colors"/>
                </div>
              )}

              {/* Category */}
              <div>
                <p className="block text-xs font-bold text-gray-500 dark:text-white/60 mb-2">Category <span className="text-red-400">*</span></p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c.value} type="button" onClick={() => setCategory(c.value)}
                      className={`text-left px-3 py-2.5 rounded-xl border transition-all ${
                        category === c.value
                          ? "border-red-400/60 bg-red-500/10 text-gray-900 dark:text-white"
                          : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] text-gray-500 dark:text-white/50 hover:bg-gray-100 dark:hover:bg-white/[0.06]"
                      }`}>
                      <span className="block text-xs font-bold">{c.label}</span>
                      <span className="block text-[10px] text-gray-400 dark:text-white/30 mt-0.5 leading-tight">{c.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Component */}
              <div>
                <p className="block text-xs font-bold text-gray-500 dark:text-white/60 mb-2">Affected Component <span className="text-red-400">*</span></p>
                <div className="flex flex-wrap gap-2">
                  {COMPONENTS.map((c) => (
                    <button key={c} type="button" onClick={() => setComponent(c)}
                      className={`px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all ${
                        component === c
                          ? "border-blue-500/60 bg-blue-500/10 text-blue-500 dark:text-blue-300"
                          : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] text-gray-400 dark:text-white/40 hover:bg-gray-100 dark:hover:bg-white/[0.07]"
                      }`}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="support-subject" className="block text-xs font-bold text-gray-500 dark:text-white/60 mb-2">Subject <span className="text-red-400">*</span></label>
                <input id="support-subject" type="text" value={subject} onChange={(e) => setSubject(e.target.value)} required maxLength={120}
                  placeholder="Brief summary of your request…"
                  className="w-full bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-400 dark:focus:border-white/25 focus:bg-white dark:focus:bg-white/[0.06] transition-colors"/>
              </div>

              {/* Description */}
              <div>
                <label htmlFor="support-description" className="block text-xs font-bold text-gray-500 dark:text-white/60 mb-2">Description <span className="text-red-400">*</span></label>
                <textarea id="support-description" value={description} onChange={(e) => setDescription(e.target.value)} required rows={5}
                  placeholder="Describe the issue or request in detail. Include steps to reproduce if reporting a bug…"
                  className="w-full bg-white dark:bg-white/[0.04] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-gray-400 dark:focus:border-white/25 focus:bg-white dark:focus:bg-white/[0.06] transition-colors resize-none"/>
              </div>

              {/* Priority */}
              <div>
                <p className="block text-xs font-bold text-gray-500 dark:text-white/60 mb-2">Priority</p>
                <div className="flex gap-2">
                  {[
                    { value: "low",    label: "Low",    active: "border-gray-300 dark:border-white/25 bg-gray-100 dark:bg-white/[0.08]" },
                    { value: "normal", label: "Normal", active: "border-amber-400/50 bg-amber-500/10 text-amber-600 dark:text-amber-300" },
                    { value: "high",   label: "High",   active: "border-red-400/50 bg-red-500/10 text-red-500 dark:text-red-300" },
                  ].map((p) => (
                    <button key={p.value} type="button" onClick={() => setPriority(p.value)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                        priority === p.value
                          ? p.active
                          : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03] text-gray-400 dark:text-white/40"
                      }`}>
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <button type="submit"
                disabled={!category || !component || !subject.trim() || !description.trim() || (!user && !email.trim())}
                className="w-full py-3.5 rounded-xl text-sm font-black text-white bg-itoolbox-red hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-[0_0_20px_rgba(239,63,52,0.25)] mt-2">
                Create Ticket
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
