"use client";

import type { ModelInfo } from "@itoolbox/ui/types";
import { cn } from "@/lib/utils";

interface Props {
  models: ModelInfo[];
  value: string;
  onChange: (id: string) => void;
  disabled?: boolean;
  className?: string;
}

/** Which model investigates. Models without credentials stay listed, disabled. */
export function ModelPicker({ models, value, onChange, disabled, className }: Props) {
  return (
    <select
      aria-label="Model"
      value={value}
      disabled={disabled || models.length === 0}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        "h-9 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50",
        className
      )}
    >
      {models.map((m) => (
        <option key={m.id} value={m.id} disabled={!m.available}>
          {m.label}
          {m.available ? "" : " (not configured)"}
        </option>
      ))}
    </select>
  );
}
