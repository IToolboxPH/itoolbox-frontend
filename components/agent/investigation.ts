import type { AgentEvent, InvestigationStatus, ToolResultEvent } from "@itoolbox/ui/types";

/** One line of the investigation trail: a progress note, or a tool call with its result. */
export type TrailItem =
  | { kind: "status"; text: string }
  | { kind: "tool"; callId: string; tool: string; input: Record<string, unknown>; result: ToolResultEvent | null };

export interface InvestigationView {
  id: string | null;
  question: string;
  modelLabel: string | null;
  status: InvestigationStatus;
  trail: TrailItem[];
  answer: string | null;
  evidenceIds: string[];
  error: string | null;
  durationMs: number | null;
  toolCalls: number;
}

export function emptyView(question: string): InvestigationView {
  return {
    id: null,
    question,
    modelLabel: null,
    status: "running",
    trail: [],
    answer: null,
    evidenceIds: [],
    error: null,
    durationMs: null,
    toolCalls: 0,
  };
}

/** Folds one server-sent event into the view. The same function replays a stored
 * investigation, so a past run renders exactly as it did live. */
export function applyEvent(view: InvestigationView, event: AgentEvent): InvestigationView {
  switch (event.type) {
    case "investigation":
      return { ...view, id: event.id, question: event.question, modelLabel: event.model_label };
    case "status":
      return { ...view, trail: [...view.trail, { kind: "status", text: event.text }] };
    case "tool_call":
      return {
        ...view,
        trail: [...view.trail, { kind: "tool", callId: event.call_id, tool: event.tool, input: event.input, result: null }],
      };
    case "tool_result":
      return {
        ...view,
        trail: view.trail.map((item) =>
          item.kind === "tool" && item.callId === event.call_id ? { ...item, result: event } : item
        ),
      };
    case "answer":
      return { ...view, answer: event.markdown, evidenceIds: event.evidence_ids };
    case "error":
      return { ...view, error: event.message };
    case "done":
      return { ...view, status: event.status, durationMs: event.duration_ms, toolCalls: event.tool_calls };
    default:
      return view;
  }
}

export function replay(question: string, events: AgentEvent[]): InvestigationView {
  return events.reduce(applyEvent, emptyView(question));
}
