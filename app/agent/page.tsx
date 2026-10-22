"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Square, Sparkles } from "lucide-react";

import { AppShell } from "@/components/app-shell";
import { HistoryList } from "@/components/agent/history-list";
import { applyEvent, emptyView, replay, type InvestigationView } from "@/components/agent/investigation";
import { InvestigationPanel } from "@/components/agent/investigation-panel";
import { ModelPicker } from "@/components/agent/model-picker";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { agentApi } from "@/lib/api-client";
import type { InvestigationSummary, ModelInfo } from "@itoolbox/ui/types";

const EXAMPLES = [
  "Why did 5G availability drop in Cebu last week?",
  "Which provinces had the most site outages this week, and what caused them?",
  "Are the provinces with the most outages also short of transport capacity?",
];

export default function AgentPage() {
  return (
    <AppShell>
      {/* useSearchParams needs a Suspense boundary in a static export. */}
      <Suspense fallback={null}>
        <Workspace />
      </Suspense>
    </AppShell>
  );
}

function Workspace() {
  const router = useRouter();
  const selectedId = useSearchParams().get("id");
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [model, setModel] = useState("");
  const [question, setQuestion] = useState("");
  const [view, setView] = useState<InvestigationView | null>(null);
  const [history, setHistory] = useState<InvestigationSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const running = view?.status === "running";

  const refreshHistory = useCallback(() => {
    agentApi.investigations().then(setHistory).catch(() => {});
  }, []);

  useEffect(() => {
    agentApi
      .models()
      .then((list) => {
        setModels(list);
        setModel((current) => current || list.find((m) => m.default)?.id || list.find((m) => m.available)?.id || "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load models"));
    refreshHistory();
  }, [refreshHistory]);

  // A past investigation, from the history list or a shared /agent?id= link.
  useEffect(() => {
    if (!selectedId || selectedId === view?.id) return;
    abortRef.current?.abort();
    agentApi
      .investigation(selectedId)
      .then((detail) => setView(replay(detail.question, detail.events)))
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load the investigation"));
    // view?.id is read only to skip reloading the run already on screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  async function investigate(q: string) {
    const text = q.trim();
    if (!text || running) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    setView(emptyView(text));
    if (selectedId) router.replace("/agent");
    try {
      await agentApi.ask({ question: text, model: model || null }, (event) => {
        setView((v) => (v ? applyEvent(v, event) : v));
        if (event.type === "investigation") refreshHistory();
      }, controller.signal);
    } catch (e) {
      if (controller.signal.aborted) {
        setView((v) => (v && v.status === "running" ? { ...v, status: "cancelled" } : v));
      } else {
        const message = e instanceof Error ? e.message : "The investigation failed";
        setError(message);
        setView((v) => (v && v.status === "running" ? { ...v, status: "failed", error: message } : v));
      }
    } finally {
      refreshHistory();
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside className="order-2 lg:order-1">
        <HistoryList
          items={history}
          activeId={view?.id ?? null}
          onSelect={(id) => router.push(`/agent?id=${id}`)}
          onNew={() => {
            abortRef.current?.abort();
            setView(null);
            setQuestion("");
            router.replace("/agent");
          }}
        />
      </aside>

      <section className="order-1 min-w-0 space-y-6 lg:order-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void investigate(question);
          }}
          className="space-y-3"
        >
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) void investigate(question);
            }}
            placeholder="Ask why something happened on the network…"
            className="min-h-[88px] text-base"
          />
          <div className="flex flex-wrap items-center gap-2">
            <ModelPicker models={models} value={model} onChange={setModel} disabled={running} />
            {running ? (
              <Button type="button" variant="outline" onClick={() => abortRef.current?.abort()}>
                <Square />
                Stop
              </Button>
            ) : (
              <Button type="submit" disabled={!question.trim() || !model}>
                <Sparkles />
                Investigate
              </Button>
            )}
            <span className="text-xs text-muted-foreground">Ctrl+Enter to send</span>
          </div>
          {!view && (
            <div className="flex flex-wrap gap-2">
              {EXAMPLES.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setQuestion(q)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          )}
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        </form>

        {view && <InvestigationPanel view={view} />}
      </section>
    </div>
  );
}
