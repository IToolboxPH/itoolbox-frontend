"use client";

import { useEffect, useState } from "react";
import { harnessApi } from "@/lib/api-client";
import { BantayWidget } from "@/components/bantay-widget";
import type { Column, DataSource, HarnessStatus, Table } from "@itoolbox/ui/types";

const CARD = "bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200 dark:border-white/10";
const ITEM = "w-full rounded-lg px-2 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-white/[0.06]";
const ACTIVE = "bg-purple-500/15 text-purple-700 dark:text-purple-300";

/** What Bantay can see: the sources Zetaris federates, their tables and columns. */
export default function SourcesPage() {
  const [status, setStatus] = useState<HarnessStatus | null>(null);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [source, setSource] = useState<string | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [table, setTable] = useState<string | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState<"tables" | "columns" | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    harnessApi.status().then(setStatus).catch(() => {});
    harnessApi.sources().then(setSources).catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  function fail(e: unknown) {
    setError(e instanceof Error ? e.message : String(e));
  }

  function openSource(name: string) {
    setSource(name);
    setTable(null);
    setColumns([]);
    setTables([]);
    setLoading("tables");
    harnessApi.tables(name).then(setTables).catch(fail).finally(() => setLoading(null));
  }

  function openTable(name: string) {
    if (!source) return;
    setTable(name);
    setColumns([]);
    setLoading("columns");
    harnessApi.columns(source, name).then(setColumns).catch(fail).finally(() => setLoading(null));
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Data Sources</h1>
          <p className="text-sm text-gray-400 dark:text-white/40 mt-0.5">Every source Bantay queries in place through the Zetaris AI Data Harness</p>
        </div>
        {status && (
          <span className={`ml-auto text-[10px] font-black uppercase tracking-widest rounded-full px-2.5 py-1 border ${
            status.connected
              ? "text-green-600 dark:text-green-400 border-green-500/30 bg-green-500/10"
              : "text-red-500 dark:text-red-400 border-red-500/30 bg-red-500/10"
          }`}>
            {status.connected ? `Zetaris ${status.api_version ?? ""} connected` : `Zetaris unreachable: ${status.error}`}
          </span>
        )}
      </div>
      {error && <p className="text-sm text-red-500 dark:text-red-400 mb-4" role="alert">{error}</p>}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className={`${CARD} p-4`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 mb-2">Sources</p>
          <div className="space-y-1">
            {sources.map((s) => (
              <button key={s.name} type="button" onClick={() => openSource(s.name)}
                className={`${ITEM} ${source === s.name ? ACTIVE : ""}`}>
                <span className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-white">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0"/>
                  {s.name}
                  <span className="ml-auto text-xs font-normal text-gray-400 dark:text-white/40">{s.table_count ?? "—"} tables</span>
                </span>
                {s.description && <span className="mt-0.5 block text-xs text-gray-500 dark:text-white/40">{s.description}</span>}
              </button>
            ))}
            {!sources.length && !error && <p className="text-xs text-gray-400 dark:text-white/30">Loading…</p>}
          </div>
        </div>

        <div className={`${CARD} p-4`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 mb-2">Tables</p>
          {!source && <p className="text-xs text-gray-400 dark:text-white/30">Pick a source.</p>}
          {loading === "tables" && <p className="text-xs text-gray-400 dark:text-white/30">Loading…</p>}
          <div className="space-y-0.5">
            {tables.map((t) => (
              <button key={t.name} type="button" onClick={() => openTable(t.name)}
                className={`${ITEM} py-1.5 font-mono text-xs text-gray-700 dark:text-white/70 ${table === t.name ? ACTIVE : ""}`}>
                {t.name.toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        <div className={`${CARD} p-4`}>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 mb-2">Columns</p>
          {!table && <p className="text-xs text-gray-400 dark:text-white/30">Pick a table.</p>}
          {loading === "columns" && <p className="text-xs text-gray-400 dark:text-white/30">Loading…</p>}
          <ul className="space-y-1 text-xs">
            {columns.map((c) => (
              <li key={c.name} className="flex gap-2">
                <span className="font-mono text-gray-700 dark:text-white/80">{c.name}</span>
                <span className="ml-auto text-gray-400 dark:text-white/40">{c.data_type}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <BantayWidget/>
    </div>
  );
}
