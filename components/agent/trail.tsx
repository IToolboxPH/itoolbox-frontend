"use client";

import { CheckCircle2, Database, ListTree, Loader2, MessageSquareText, Table2, XCircle } from "lucide-react";

import type { TrailItem } from "./investigation";
import { EvidenceTable } from "./evidence-table";

const TOOL_LABEL: Record<string, { label: string; icon: typeof Database }> = {
  list_sources: { label: "Listed data sources", icon: ListTree },
  list_tables: { label: "Listed tables", icon: ListTree },
  describe_table: { label: "Read table columns", icon: Table2 },
  run_sql: { label: "Queried", icon: Database },
};

/** The investigation step by step: progress notes, tool calls, and the evidence they returned. */
export function Trail({ items, running, highlight }: { items: TrailItem[]; running: boolean; highlight: string | null }) {
  return (
    <ol className="space-y-3">
      {items.map((item, i) => {
        if (item.kind === "status") {
          return (
            <li key={i} className="flex gap-2 text-sm text-muted-foreground">
              <MessageSquareText className="mt-0.5 size-4 shrink-0" />
              <p className="italic">{item.text}</p>
            </li>
          );
        }
        const meta = TOOL_LABEL[item.tool] ?? { label: item.tool, icon: Database };
        const Icon = meta.icon;
        const r = item.result;
        const target =
          typeof item.input.source === "string"
            ? `${item.input.source}${typeof item.input.table === "string" ? `.${item.input.table}` : ""}`
            : "";
        return (
          <li key={item.callId} className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Icon className="size-4 shrink-0 text-primary" />
              <span className="font-medium">{meta.label}</span>
              {target && <code className="rounded bg-muted px-1 text-xs">{target}</code>}
              {r === null ? (
                <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
              ) : r.ok ? (
                <CheckCircle2 className="size-3.5 text-emerald-500" />
              ) : (
                <XCircle className="size-3.5 text-destructive" />
              )}
              {r && item.tool !== "run_sql" && <span className="text-xs text-muted-foreground">{r.summary}</span>}
            </div>
            {r && !r.ok && <p className="ml-6 text-xs text-destructive">{r.error ?? r.summary}</p>}
            {r && r.ok && item.tool === "run_sql" && (
              <div className="ml-6">
                <EvidenceTable result={r} highlighted={highlight !== null && highlight === r.evidence_id} />
              </div>
            )}
          </li>
        );
      })}
      {running && (
        <li className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="size-4 animate-spin" />
          Investigating…
        </li>
      )}
    </ol>
  );
}
