"use client";

import { useState } from "react";

import type { ToolResultEvent } from "@itoolbox/ui/types";
import { cn, formatDuration } from "@/lib/utils";

const PREVIEW_ROWS = 10;

function cell(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

/** The rows one run_sql returned, labelled with the evidence id the answer cites. */
export function EvidenceTable({ result, highlighted }: { result: ToolResultEvent; highlighted?: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const rows = result.rows ?? [];
  const columns = result.columns ?? [];
  const shown = expanded ? rows : rows.slice(0, PREVIEW_ROWS);

  return (
    <div
      id={result.evidence_id ? `evidence-${result.evidence_id}` : undefined}
      className={cn("scroll-mt-20 rounded-md border border-border bg-background", highlighted && "cite-flash")}
    >
      <div className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 text-xs">
        {result.evidence_id && (
          <span className="rounded bg-accent px-1.5 py-0.5 font-semibold text-accent-foreground">
            {result.evidence_id}
          </span>
        )}
        <span className="font-medium">{result.purpose}</span>
        <span className="ml-auto text-muted-foreground">
          {result.row_count ?? rows.length} row{(result.row_count ?? rows.length) === 1 ? "" : "s"}
          {result.elapsed_ms != null && ` · ${formatDuration(result.elapsed_ms)}`}
        </span>
      </div>
      {result.sql && (
        <details className="border-b border-border px-3 py-1.5 text-xs">
          <summary className="cursor-pointer select-none text-muted-foreground">SQL</summary>
          <pre className="mt-1.5 overflow-x-auto whitespace-pre-wrap font-mono text-[11px] leading-relaxed">{result.sql}</pre>
        </details>
      )}
      {columns.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-muted/60 text-muted-foreground">
              <tr>
                {columns.map((c) => (
                  <th key={c} className="whitespace-nowrap px-3 py-1.5 font-medium">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {shown.map((row, i) => (
                <tr key={i} className="border-t border-border/60">
                  {row.map((v, j) => (
                    <td key={j} className="whitespace-nowrap px-3 py-1 tabular-nums">{cell(v)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="px-3 py-2 text-xs text-muted-foreground">No rows.</p>
      )}
      {rows.length > PREVIEW_ROWS && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="w-full border-t border-border px-3 py-1.5 text-xs text-primary hover:bg-muted/50"
        >
          {expanded ? "Show fewer" : `Show all ${rows.length}${result.truncated ? ` of ${result.row_count}` : ""} rows`}
        </button>
      )}
    </div>
  );
}
