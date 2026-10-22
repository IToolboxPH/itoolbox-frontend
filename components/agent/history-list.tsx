"use client";

import { Plus } from "lucide-react";

import type { InvestigationSummary } from "@itoolbox/ui/types";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DOT: Record<InvestigationSummary["status"], string> = {
  running: "bg-primary",
  completed: "bg-emerald-500",
  failed: "bg-destructive",
  refused: "bg-amber-500",
  cancelled: "bg-muted-foreground",
};

function ago(iso: string): string {
  const minutes = Math.round((Date.now() - new Date(iso).getTime()) / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  return hours < 24 ? `${hours}h ago` : `${Math.round(hours / 24)}d ago`;
}

interface Props {
  items: InvestigationSummary[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
}

export function HistoryList({ items, activeId, onSelect, onNew }: Props) {
  return (
    <div className="space-y-3">
      <Button variant="outline" className="w-full justify-start" onClick={onNew}>
        <Plus />
        New investigation
      </Button>
      {items.length === 0 ? (
        <p className="px-1 text-sm text-muted-foreground">Your investigations will be listed here.</p>
      ) : (
        <ul className="space-y-1">
          {items.map((it) => (
            <li key={it.id}>
              <button
                type="button"
                onClick={() => onSelect(it.id)}
                className={cn(
                  "w-full rounded-md px-2 py-2 text-left transition-colors hover:bg-muted",
                  it.id === activeId && "bg-secondary"
                )}
              >
                <span className="line-clamp-2 text-sm">{it.question}</span>
                <span className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className={cn("size-1.5 rounded-full", DOT[it.status])} />
                  {it.model_id} · {ago(it.created_at)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
