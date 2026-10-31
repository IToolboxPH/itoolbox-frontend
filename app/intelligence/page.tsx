"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { harnessApi } from "@/lib/api-client";
import { INTELLIGENCE_SUBPAGES } from "@/lib/nav";
import { BantAIWidget } from "@/components/bantai-widget";
import type { DataSource, HarnessStatus } from "@itoolbox/ui/types";

const SUBPAGE_DESC: Record<string, string> = {
  "Data Sources": "Every source Zetaris federates for BantAI, with its tables and columns.",
};

export default function IntelligenceOverview() {
  const [status, setStatus] = useState<HarnessStatus | null>(null);
  const [statusFailed, setStatusFailed] = useState(false);
  const [sources, setSources] = useState<DataSource[] | null>(null);

  useEffect(() => {
    harnessApi.status().then(setStatus).catch(() => setStatusFailed(true));
    harnessApi.sources().then(setSources).catch(() => setSources([]));
  }, []);

  const tableCount = sources?.reduce((n, s) => n + (s.table_count ?? 0), 0);

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">BantAI Strategic Intelligence</h1>
        <p className="text-sm text-gray-400 dark:text-white/40 mt-0.5">Empowering Decisions Through Intelligent Automation</p>
      </div>

      {/* Harness KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Zetaris",
            value: statusFailed ? "Unknown" : status === null ? "…" : status.connected ? "Connected" : "Unreachable",
            sub: statusFailed ? "The status check failed" : status?.connected ? `API ${status.api_version ?? ""}`.trim() : status?.error ?? "",
            color: status?.connected ? "text-green-600 dark:text-green-400" : status || statusFailed ? "text-red-500 dark:text-red-400" : "text-gray-400",
          },
          { label: "Sources", value: sources === null ? "…" : String(sources.length), sub: "federated, queried in place", color: "text-purple-600 dark:text-purple-400" },
          { label: "Tables",  value: tableCount === undefined ? "…" : String(tableCount), sub: "across every source",     color: "text-purple-600 dark:text-purple-400" },
        ].map((k) => (
          <div key={k.label} className="bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200 dark:border-white/10 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30">{k.label}</p>
            <p className={`text-2xl font-black mt-1 ${k.color}`}>{k.value}</p>
            <p className="text-[11px] text-gray-400 dark:text-white/40 mt-0.5 truncate">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {INTELLIGENCE_SUBPAGES.filter((sp) => sp.label !== "Overview").map((sp) => (
          <Link key={sp.href} href={sp.href}
            className="block bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200 dark:border-white/10 p-4 hover:bg-gray-50 dark:hover:bg-white/[0.08] hover:border-gray-300 dark:hover:border-white/20 transition-colors">
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{sp.label}</div>
            {SUBPAGE_DESC[sp.label] && <div className="text-xs text-gray-500 dark:text-white/50 mt-1">{SUBPAGE_DESC[sp.label]}</div>}
            <div className="text-xs text-gray-400 dark:text-white/40 mt-1">Open →</div>
          </Link>
        ))}
        <Link href="/bantai"
          className="block bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200 dark:border-white/10 p-4 hover:bg-gray-50 dark:hover:bg-white/[0.08] hover:border-gray-300 dark:hover:border-white/20 transition-colors">
          <div className="text-sm font-semibold text-gray-900 dark:text-white">Ask BantAI</div>
          <div className="text-xs text-gray-500 dark:text-white/50 mt-1">Investigate a question across these sources, with the evidence shown.</div>
          <div className="text-xs text-gray-400 dark:text-white/40 mt-1">Open →</div>
        </Link>
      </div>

      <BantAIWidget/>
    </div>
  );
}
