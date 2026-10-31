"use client";

import { useState } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDuration } from "@/lib/utils";

import { Answer } from "./answer";
import type { InvestigationView } from "./investigation";
import { Trail } from "./trail";

const STATUS_STYLE: Record<InvestigationView["status"], string> = {
  running: "bg-primary/15 text-primary",
  completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  failed: "bg-destructive/15 text-destructive",
  refused: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  cancelled: "bg-muted text-muted-foreground",
};

/** `hideQuestion` drops the heading where the question is already on screen, as in a chat bubble. */
export function InvestigationPanel({ view, hideQuestion = false }: { view: InvestigationView; hideQuestion?: boolean }) {
  const [highlight, setHighlight] = useState<string | null>(null);
  const running = view.status === "running";

  function cite(evidenceId: string) {
    document.getElementById(`evidence-${evidenceId}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
    // Re-trigger the flash even when the same chip is clicked twice.
    setHighlight(null);
    requestAnimationFrame(() => setHighlight(evidenceId));
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start gap-3">
        {hideQuestion ? <span className="flex-1"/> : <h2 className="min-w-0 flex-1 text-lg font-semibold">{view.question}</h2>}
        <div className="flex items-center gap-2 text-xs">
          {view.modelLabel && <span className="rounded border border-border px-2 py-0.5">{view.modelLabel}</span>}
          <span className={cn("flex items-center gap-1 rounded px-2 py-0.5 font-medium capitalize", STATUS_STYLE[view.status])}>
            {running && <Loader2 className="size-3 animate-spin" />}
            {view.status}
          </span>
          {view.durationMs != null && (
            <span className="text-muted-foreground">
              {formatDuration(view.durationMs)} · {view.toolCalls} step{view.toolCalls === 1 ? "" : "s"}
            </span>
          )}
        </div>
      </div>

      {(view.answer || view.error) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{view.answer ? "Answer" : "The investigation stopped"}</CardTitle>
          </CardHeader>
          <CardContent>
            {view.answer && <Answer markdown={view.answer} onCite={cite} />}
            {view.error && (
              <p className="mt-2 flex items-start gap-2 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                {view.error}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">How it was investigated</CardTitle>
        </CardHeader>
        <CardContent>
          <Trail items={view.trail} running={running} highlight={highlight} />
        </CardContent>
      </Card>
    </div>
  );
}
