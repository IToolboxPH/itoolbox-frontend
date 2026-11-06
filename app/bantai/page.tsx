"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getStoredAuth, logout } from "@/lib/auth";
import { agentApi } from "@/lib/api-client";
import { useBranding } from "@/components/branding-provider";
import { HistoryList } from "@/components/agent/history-list";
import { applyEvent, emptyView, replay, type InvestigationView } from "@/components/agent/investigation";
import { InvestigationPanel } from "@/components/agent/investigation-panel";
import { ModelPicker } from "@/components/agent/model-picker";
import type { InvestigationSummary, ModelInfo, UserProfile } from "@itoolbox/ui/types";

// Each answerable today: about IToolbox itself, or from the sources registered.
const EXAMPLES = [
  "What can you help me with?",
  "What products does IToolbox offer?",
  "How many people live in Cebu province, and which hospitals are near Cebu City?",
  "Which cities should prepare for heavy rain in the next 48 hours?",
  "What strong earthquakes hit the Philippines this year?",
  "Saan pinakamainit ngayon, at gaano kalakas ang hangin doon?",
];

export default function BantAIPage() {
  return (
    // useSearchParams needs a Suspense boundary in a static export.
    <Suspense fallback={null}>
      <Workspace />
    </Suspense>
  );
}

function Workspace() {
  const branding = useBranding();
  const router = useRouter();
  const params = useSearchParams();
  const selectedId = params.get("id");
  const handedOverQuestion = params.get("q");
  const [user, setUser] = useState<UserProfile | null>(null);
  const [models, setModels] = useState<ModelInfo[]>([]);
  const [model, setModel] = useState("");
  const [question, setQuestion] = useState("");
  const [view, setView] = useState<InvestigationView | null>(null);
  const [history, setHistory] = useState<InvestigationSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const handedOver = useRef(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const questionRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const running = view?.status === "running";

  const refreshHistory = useCallback(() => {
    agentApi.investigations().then(setHistory).catch(() => {});
  }, []);

  useEffect(() => {
    const { token, user: u } = getStoredAuth();
    if (!token) { router.replace("/login?page=bantai"); return; }
    setUser(u);
    agentApi
      .models()
      .then((list) => {
        setModels(list);
        setModel((current) => current || list.find((m) => m.default)?.id || list.find((m) => m.available)?.id || "");
      })
      .catch((e) => setError(e instanceof Error ? e.message : "Could not load models"));
    refreshHistory();
  }, [router, refreshHistory]);

  // A past investigation, from the history list or a shared /bantai?id= link.
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

  // Follow the trail while a run streams; once it ends (or a past run opens),
  // bring the question and its answer, which sit above the trail, into view.
  useEffect(() => {
    if (running) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [running, view?.trail.length]);

  useEffect(() => {
    if (view && view.status !== "running") questionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Only a change of run or status should move the page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view?.id, view?.status]);

  async function investigate(q: string) {
    const text = q.trim();
    if (!text || running) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setError(null);
    setQuestion("");
    setView(emptyView(text));
    if (selectedId) router.replace("/bantai");
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

  // A question handed over from the BantAI widget or the login teaser (?q=)
  // runs once the default model is known.
  useEffect(() => {
    if (!handedOverQuestion || handedOver.current) return;
    if (!model) { setQuestion(handedOverQuestion); return; }
    handedOver.current = true;
    router.replace("/bantai");
    void investigate(handedOverQuestion);
    // investigate is recreated every render; the ref guarantees a single run.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handedOverQuestion, model]);

  function startNew() {
    abortRef.current?.abort();
    setView(null);
    setQuestion("");
    setError(null);
    router.replace("/bantai");
    inputRef.current?.focus();
  }

  if (!user) return null;

  const modelLabel = models.find((m) => m.id === model)?.label;

  return (
    <div className="h-screen bg-gray-50 dark:bg-[#070b14] text-gray-900 dark:text-white flex flex-col transition-colors duration-200">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-white/[0.06] bg-white/80 dark:bg-black/20 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="bg-white rounded-lg px-2 py-1 overflow-hidden flex items-center gap-1.5">
              <img src={branding.logoSrc} alt="" className="h-5 w-auto object-contain"/>
              <span className="text-itoolbox-navy text-xs font-black tracking-tight">{branding.shortName}</span>
            </div>
            <span className="text-gray-400 dark:text-white/40 text-xs hidden sm:block">{branding.appName}</span>
          </Link>
          <span className="text-gray-300 dark:text-white/20 text-xs">/</span>
          <span className="text-gray-600 dark:text-white/60 text-xs font-bold truncate">💬 Ask BantAI</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-gray-400 dark:text-white/30">
            <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse"/>
            BantAI · AI Chat Assistant
          </div>
          <button type="button" onClick={() => logout()} className="text-xs text-gray-400 dark:text-white/30 hover:text-red-500 dark:hover:text-red-400 transition-colors">Sign out</button>
          <Link href="/dashboard" className="px-3 py-1.5 text-[11px] font-bold text-white bg-itoolbox-red hover:bg-red-700 rounded-lg transition-colors">← Dashboard</Link>
        </div>
      </nav>

      <div className="flex-1 flex min-h-0">
        {/* History */}
        <aside className="hidden lg:block w-72 shrink-0 overflow-y-auto border-r border-gray-200 dark:border-white/[0.06] bg-white/60 dark:bg-black/10 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 mb-3">Investigations</p>
          <HistoryList
            items={history}
            activeId={view?.id ?? null}
            onSelect={(id) => router.push(`/bantai?id=${id}`)}
            onNew={startNew}
          />
        </aside>

        {/* Chat area */}
        <main className="flex-1 overflow-y-auto">
          <div className="px-4 py-6 max-w-4xl w-full mx-auto flex flex-col gap-4">
            <div className="flex flex-col items-center text-center mb-2">
              <img src="/icons/bantai.jpg" alt="BantAI"
                className="w-16 h-16 rounded-2xl object-cover mb-3 shadow-xl shadow-orange-900/30"/>
              <h1 className="text-xl font-black">Ask BantAI</h1>
              <p className="text-gray-400 dark:text-white/40 text-xs mt-1">AI Knowledge Base & Conversational Agent · {branding.appName}</p>
            </div>

            {/* Greeting */}
            <div className="flex gap-3 justify-start">
              <img src="/icons/bantai.jpg" alt="" className="w-8 h-8 rounded-xl object-cover shrink-0 mt-0.5"/>
              <div className="max-w-[80%] rounded-2xl rounded-bl-md px-4 py-3 text-sm leading-relaxed bg-white dark:bg-white/[0.06] border border-gray-200 dark:border-white/[0.08] text-gray-700 dark:text-white/80 shadow-sm dark:shadow-none">
                Hi! I&apos;m BantAI, IToolbox&apos;s AI assistant. Ask me about IToolbox or about the data connected to this platform, in English or Filipino. Today that data covers Philippine places, population, facilities, weather, and hazards, with more on the way. I&apos;ll look through it and show the evidence behind each answer.
              </div>
            </div>

            {!view && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {EXAMPLES.map((q) => (
                    <button key={q} type="button"
                      onClick={() => { setQuestion(q); inputRef.current?.focus(); }}
                      className="text-left text-xs px-3 py-2.5 rounded-xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] text-gray-500 dark:text-white/50 hover:bg-gray-50 dark:hover:bg-white/[0.07] hover:text-gray-700 dark:hover:text-white/80 transition-colors">
                      {q}
                    </button>
                  ))}
                </div>

                {/* History on small screens, where the sidebar is hidden */}
                {history.length > 0 && (
                  <div className="lg:hidden rounded-xl border border-gray-200 dark:border-white/[0.07] bg-white dark:bg-white/[0.03] p-3">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-white/30 mb-2">Recent investigations</p>
                    <ul className="space-y-1">
                      {history.slice(0, 5).map((it) => (
                        <li key={it.id}>
                          <button type="button" onClick={() => router.push(`/bantai?id=${it.id}`)}
                            className="w-full text-left text-xs text-gray-600 dark:text-white/60 hover:text-gray-900 dark:hover:text-white truncate py-1">
                            {it.question}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}

            {view && (
              <>
                {/* The question */}
                <div ref={questionRef} className="flex gap-3 justify-end scroll-mt-4">
                  <div className="max-w-[80%] rounded-2xl rounded-br-md px-4 py-3 text-sm leading-relaxed bg-itoolbox-red text-white">
                    {view.question}
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-white/10 flex items-center justify-center text-sm font-black shrink-0 mt-0.5">
                    {(user.full_name || "U").charAt(0).toUpperCase()}
                  </div>
                </div>

                {/* BantAI's investigation */}
                <div className="flex gap-3 justify-start">
                  <img src="/icons/bantai.jpg" alt="" className="w-8 h-8 rounded-xl object-cover shrink-0 mt-0.5"/>
                  <div className="min-w-0 flex-1">
                    <InvestigationPanel view={view} hideQuestion />
                  </div>
                </div>
              </>
            )}

            {error && !view?.error && (
              <p className="text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg" role="alert">{error}</p>
            )}
            <div ref={bottomRef}/>
          </div>
        </main>
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-gray-200 dark:border-white/[0.06] bg-white/80 dark:bg-black/20 backdrop-blur-md px-4 py-3">
        <form
          onSubmit={(e) => { e.preventDefault(); void investigate(question); }}
          className="max-w-4xl mx-auto flex gap-2"
        >
          <ModelPicker models={models} value={model} onChange={setModel} disabled={running}
            className="h-auto rounded-xl bg-white dark:bg-white/[0.05] border-gray-200 dark:border-white/10 text-xs max-w-[9rem] sm:max-w-[12rem]"/>
          <input ref={inputRef} type="text" value={question} onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask BantAI…"
            className="flex-1 min-w-0 bg-white dark:bg-white/[0.05] border border-gray-200 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm placeholder-gray-300 dark:placeholder-white/20 focus:outline-none focus:border-orange-400/60 dark:focus:border-orange-500/40 transition-colors"/>
          {running ? (
            <button type="button" aria-label="Stop the investigation" onClick={() => abortRef.current?.abort()}
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-gray-200 dark:border-white/10 text-gray-500 dark:text-white/60 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shrink-0">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24"><rect x="5" y="5" width="14" height="14" rx="2"/></svg>
            </button>
          ) : (
            <button type="submit" aria-label="Send question" disabled={!question.trim() || !model}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-orange-700 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-opacity hover:opacity-90 shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/>
              </svg>
            </button>
          )}
        </form>
        <p className="text-center text-[10px] text-gray-400 dark:text-white/20 mt-1.5 max-w-4xl mx-auto">
          {modelLabel ? `${modelLabel} · ` : ""}Answers from the data cite their evidence — click a citation like E1 to jump to the rows behind it.
          {view && !running && (
            <button type="button" onClick={startNew} className="ml-2 text-orange-500 dark:text-orange-400 hover:underline">New question</button>
          )}
        </p>
        <p className="text-center text-[10px] text-gray-400 dark:text-white/20 mt-0.5 max-w-4xl mx-auto">
          BantAI can make mistakes. For weather, disaster, and other life-safety decisions, follow PAGASA, NDRRMC, and your local government.
        </p>
      </div>
    </div>
  );
}
