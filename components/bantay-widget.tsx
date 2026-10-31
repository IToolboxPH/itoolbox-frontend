"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Floating Ask Bantay launcher, dropped into real app pages (as opposed to the
// login carousel's own BantayTeaser). A question typed here opens the full
// Bantay page, which runs the investigation with its evidence trail.
export function BantayWidget() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    router.push(`/bantay?q=${encodeURIComponent(text)}`);
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {open && (
        <div className="mb-3 w-72 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0c1326] shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.04]">
            <img src="/icons/bantay.jpg" alt="Bantay" className="w-7 h-7 rounded-full object-cover shrink-0"/>
            <div className="min-w-0">
              <p className="text-xs font-black text-gray-900 dark:text-white">Ask Bantay</p>
              <p className="text-[9px] text-gray-400 dark:text-white/40">Typhoon-Operations Agent</p>
            </div>
            <Link href="/bantay" className="ml-auto text-[9px] font-bold text-orange-500 dark:text-orange-400 hover:underline whitespace-nowrap">
              Full app ↗
            </Link>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close Ask Bantay"
              className="text-gray-400 dark:text-white/30 hover:text-gray-700 dark:hover:text-white transition-colors shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="p-3 space-y-2">
            <div className="bg-gray-100 dark:bg-white/[0.06] border border-gray-200 dark:border-white/10 rounded-2xl rounded-tl-sm px-3 py-2">
              <p className="text-gray-700 dark:text-white/80 text-[11px] leading-relaxed">
                Hello! 👋 I&apos;m Bantay. Ask me why — I&apos;ll investigate and show you the evidence.
              </p>
            </div>
          </div>

          <form onSubmit={handleSend} className="flex items-center gap-2 p-2.5 border-t border-gray-200 dark:border-white/10">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Bantay anything…"
              className="bg-gray-50 dark:bg-white/[0.06] rounded-full px-3 py-1.5 text-[11px] flex-1 outline-none text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-white/30 min-w-0"
            />
            <button type="submit" aria-label="Send to Bantay"
              className="w-7 h-7 rounded-full flex items-center justify-center bg-orange-600 hover:bg-orange-500 transition-colors shrink-0">
              <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/>
              </svg>
            </button>
          </form>
        </div>
      )}

      <button type="button" onClick={() => setOpen((o) => !o)} aria-label={open ? "Close Ask Bantay" : "Open Ask Bantay"}
        className="w-14 h-14 rounded-full bg-orange-600 hover:bg-orange-500 shadow-2xl flex items-center justify-center transition-colors overflow-hidden">
        {open ? (
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        ) : (
          <img src="/icons/bantay.jpg" alt="Ask Bantay" className="w-full h-full object-cover"/>
        )}
      </button>
    </div>
  );
}
