"use client";

import { useEffect, useState } from "react";
import { CircleCheck, CircleX, Database } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { harnessApi } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { Column, DataSource, HarnessStatus, Table } from "@itoolbox/ui/types";

/** What the agent can see: the sources Zetaris federates, their tables and columns. */
export default function SourcesPage() {
  const [status, setStatus] = useState<HarnessStatus | null>(null);
  const [sources, setSources] = useState<DataSource[]>([]);
  const [source, setSource] = useState<string | null>(null);
  const [tables, setTables] = useState<Table[]>([]);
  const [table, setTable] = useState<string | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    harnessApi.status().then(setStatus).catch(() => {});
    harnessApi.sources().then(setSources).catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }, []);

  function openSource(name: string) {
    setSource(name);
    setTable(null);
    setColumns([]);
    setTables([]);
    harnessApi.tables(name).then(setTables).catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }

  function openTable(name: string) {
    if (!source) return;
    setTable(name);
    harnessApi.columns(source, name).then(setColumns).catch((e) => setError(e instanceof Error ? e.message : String(e)));
  }

  return (
    <AppShell>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-xl font-semibold">Data sources</h1>
          {status && (
            <span className={cn("flex items-center gap-1 text-sm", status.connected ? "text-emerald-600 dark:text-emerald-400" : "text-destructive")}>
              {status.connected ? <CircleCheck className="size-4" /> : <CircleX className="size-4" />}
              {status.connected ? `Zetaris ${status.api_version} connected` : `Zetaris unreachable: ${status.error}`}
            </span>
          )}
        </div>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}

        <div className="grid gap-4 lg:grid-cols-3">
          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Sources</CardTitle></CardHeader>
            <CardContent className="space-y-1">
              {sources.map((s) => (
                <button key={s.name} type="button" onClick={() => openSource(s.name)}
                  className={cn("w-full rounded-md px-2 py-2 text-left hover:bg-muted", source === s.name && "bg-secondary")}>
                  <span className="flex items-center gap-2 text-sm font-medium">
                    <Database className="size-4 text-primary" />
                    {s.name}
                    <span className="ml-auto text-xs font-normal text-muted-foreground">{s.table_count} tables</span>
                  </span>
                  {s.description && <span className="mt-0.5 block text-xs text-muted-foreground">{s.description}</span>}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Tables</CardTitle>
              {!source && <CardDescription>Pick a source.</CardDescription>}
            </CardHeader>
            <CardContent className="space-y-1">
              {tables.map((t) => (
                <button key={t.name} type="button" onClick={() => openTable(t.name)}
                  className={cn("w-full rounded-md px-2 py-1.5 text-left font-mono text-xs hover:bg-muted", table === t.name && "bg-secondary")}>
                  {t.name.toLowerCase()}
                </button>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Columns</CardTitle>
              {!table && <CardDescription>Pick a table.</CardDescription>}
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-xs">
                {columns.map((c) => (
                  <li key={c.name} className="flex gap-2">
                    <span className="font-mono">{c.name}</span>
                    <span className="ml-auto text-muted-foreground">{c.data_type}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
