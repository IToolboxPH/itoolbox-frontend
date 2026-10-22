/**
 * Typed API client for itoolbox-backend.
 * All requests include the Bearer token from localStorage.
 */

import type {
  AgentEvent,
  AskRequest,
  Column,
  DataSource,
  HarnessStatus,
  InvestigationDetail,
  InvestigationSummary,
  ModelCheck,
  ModelInfo,
  QueryRequest,
  QueryResult,
  Table,
  UserProfile,
} from "@itoolbox/ui/types";

import { apiUrl } from "./auth";
import { readEventStream } from "./sse";

/** FastAPI returns a string detail, or a list of field errors on 422. */
function errorDetail(detail: unknown): string | undefined {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail
      .map((d: { loc?: (string | number)[]; msg?: string }) =>
        `${d.loc?.filter((p) => p !== "body").join(".") ?? "field"}: ${(d.msg ?? "invalid").replace(/^Value error, /, "")}`)
      .join("; ");
  }
  return undefined;
}

function token(): string | null {
  return typeof window !== "undefined" ? localStorage.getItem("itoolbox_access_token") : null;
}

function headers(extra?: HeadersInit): HeadersInit {
  const t = token();
  return {
    "Content-Type": "application/json",
    ...(t ? { Authorization: `Bearer ${t}` } : {}),
    ...(extra ?? {}),
  };
}

async function failure(res: Response): Promise<Error> {
  if (res.status === 401 && typeof window !== "undefined") {
    window.location.href = "/login";
    return new Error("Unauthorized");
  }
  const err = await res.json().catch(() => ({}));
  return new Error(errorDetail(err.detail) ?? `HTTP ${res.status}`);
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${apiUrl()}${path}`, { ...options, headers: headers(options.headers) });
  if (!res.ok) throw await failure(res);
  if (res.status === 204) return undefined as T;
  return res.json();
}

// ── Health / auth ─────────────────────────────────────────────────────────────
export const healthApi = {
  ping: () => request<{ status: string }>("/api/v1/health"),
};

export const authApi = {
  me: () => request<UserProfile>("/api/v1/auth/me"),
  changePassword: (current_password: string, new_password: string) =>
    request<void>("/api/v1/auth/me/change-password", {
      method: "POST",
      body: JSON.stringify({ current_password, new_password }),
    }),
};

// ── Data harness (Zetaris) ────────────────────────────────────────────────────
export const harnessApi = {
  status: () => request<HarnessStatus>("/api/v1/harness/status"),
  sources: () => request<DataSource[]>("/api/v1/harness/sources"),
  tables: (source: string) => request<Table[]>(`/api/v1/harness/sources/${encodeURIComponent(source)}/tables`),
  columns: (source: string, table: string) =>
    request<Column[]>(
      `/api/v1/harness/sources/${encodeURIComponent(source)}/tables/${encodeURIComponent(table)}`
    ),
  query: (body: QueryRequest) =>
    request<QueryResult>("/api/v1/harness/query", { method: "POST", body: JSON.stringify(body) }),
};

// ── Agent ─────────────────────────────────────────────────────────────────────
export const agentApi = {
  models: () => request<ModelInfo[]>("/api/v1/agent/models"),
  checkModel: (id: string) => request<ModelCheck>(`/api/v1/agent/models/${encodeURIComponent(id)}/check`),
  investigations: (limit = 50) => request<InvestigationSummary[]>(`/api/v1/agent/investigations?limit=${limit}`),
  investigation: (id: string) => request<InvestigationDetail>(`/api/v1/agent/investigations/${encodeURIComponent(id)}`),

  /**
   * Investigate a question, calling onEvent for every server-sent event as it
   * arrives. Resolves when the stream ends; abort the signal to stop early, which
   * also stops the investigation on the server.
   */
  ask: async (body: AskRequest, onEvent: (event: AgentEvent) => void, signal?: AbortSignal): Promise<void> => {
    const res = await fetch(`${apiUrl()}/api/v1/agent/ask`, {
      method: "POST",
      headers: headers({ Accept: "text/event-stream" }),
      body: JSON.stringify(body),
      signal,
    });
    if (!res.ok) throw await failure(res);
    await readEventStream<AgentEvent>(res, onEvent);
  },
};
