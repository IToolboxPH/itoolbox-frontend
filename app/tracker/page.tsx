"use client";

import { BantAIWidget } from "@/components/bantai-widget";

// The sub-apps this module will have; itoolbox-backend has no tracker routes
// yet, so they are shown as planned rather than linked.
const PLANNED = [
  { icon: "📁", title: "Projects", desc: "Every engagement with its owner, status, priority, and milestones." },
  { icon: "👥", title: "Team",     desc: "Who is on what, and how much capacity each person has left." },
  { icon: "🤝", title: "Meetings", desc: "Minutes for each meeting, linked to the project they move forward." },
  { icon: "✅", title: "Actions",  desc: "Action items from meetings and storm reviews, tracked to done." },
];

export default function TrackerOverview() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Project Management</h1>
        <p className="text-sm text-gray-400 dark:text-white/40 mt-0.5">Seamless Project Management.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {PLANNED.map((p) => (
          <div key={p.title} className="bg-white dark:bg-white/[0.04] rounded-xl border border-gray-200 dark:border-white/10 p-4">
            <div className="flex items-start justify-between mb-3">
              <span className="text-2xl">{p.icon}</span>
              <span className="text-[9px] font-black tracking-widest uppercase rounded-full px-2 py-0.5 border text-pink-500 dark:text-pink-400 border-pink-500/30 bg-pink-500/10">
                Planned
              </span>
            </div>
            <div className="text-sm font-semibold text-gray-900 dark:text-white">{p.title}</div>
            <div className="text-xs text-gray-500 dark:text-white/40 mt-1 leading-relaxed">{p.desc}</div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 dark:text-white/30 mt-6">
        Project tracking arrives in a later release. Until then, BantAI&apos;s investigations are listed on the dashboard.
      </p>

      <BantAIWidget/>
    </div>
  );
}
