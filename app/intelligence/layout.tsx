"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { getStoredAuth } from "@/lib/auth";
import { INTELLIGENCE_SUBPAGES } from "@/lib/nav";

export default function IntelligenceLayout({ children }: { children: React.ReactNode }) {
  const path   = usePathname();
  const router = useRouter();
  useEffect(() => {
    if (!getStoredAuth().token) router.replace("/login?page=intelligence");
  }, [router]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0a0f1e]">
      <aside className="w-56 bg-white dark:bg-[#060c18] border-r border-gray-200 dark:border-white/[0.08] text-gray-900 dark:text-white flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-gray-200 dark:border-white/[0.08]">
          <Link href="/dashboard" className="text-xs text-gray-400 dark:text-white/40 hover:text-gray-900 dark:hover:text-white transition-colors">← Dashboard</Link>
          <h2 className="font-bold text-base mt-1 leading-tight text-gray-900 dark:text-white">BantAI Strategic Intelligence</h2>
          <p className="text-[10px] text-gray-400 dark:text-white/30 mt-0.5">What BantAI can see</p>
        </div>
        <nav className="flex-1 py-2">
          {INTELLIGENCE_SUBPAGES.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`block px-4 py-2.5 text-sm transition-colors ${
                path === item.href
                  ? "bg-purple-500/15 text-purple-600 dark:text-purple-400 font-semibold border-l-2 border-purple-400"
                  : "text-gray-500 dark:text-white/60 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/[0.05]"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="px-4 py-3 border-t border-gray-200 dark:border-white/[0.08]">
          <span className="text-[10px] text-gray-400 dark:text-white/25">Zetaris AI Data Harness</span>
        </div>
      </aside>
      <main className="flex-1 bg-gray-50 dark:bg-[#0a0f1e] min-w-0">{children}</main>
    </div>
  );
}
