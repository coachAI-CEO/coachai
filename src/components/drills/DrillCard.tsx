"use client";

import type { Drill } from "@/types/drill";

export default function DrillCard({ drill }: { drill: Drill }) {
  return (
    <div className="rounded-2xl border p-4 shadow-sm hover:shadow-md transition">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-lg font-semibold">{drill.title}</h3>
        <span className="text-xs px-2 py-1 rounded bg-gray-100">{drill.zone}</span>
      </div>

      <p className="text-sm text-gray-600 mt-1">{drill.objective}</p>

      <div className="flex flex-wrap gap-2 mt-3 text-xs">
        <span className="px-2 py-1 rounded bg-blue-50 text-blue-700">{drill.phase}</span>
        <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-700">
          {drill.ageBands.join(", ")}
        </span>
        <span className="px-2 py-1 rounded bg-amber-50 text-amber-700">
          {drill.playersMin}-{drill.playersMax} players
        </span>
        <span className="px-2 py-1 rounded bg-fuchsia-50 text-fuchsia-700">
          {drill.durationMin} min
        </span>
      </div>

      {!!drill.tags?.length && (
        <div className="mt-3 flex flex-wrap gap-1">
          {drill.tags.slice(0, 6).map((t) => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded bg-gray-100 text-gray-700">
              {t}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
