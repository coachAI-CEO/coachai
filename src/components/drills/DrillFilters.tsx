"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

const phases = ["DEFENDING","ATTACKING","TRANSITION"] as const;
const zones = ["DEFENSIVE_THIRD","MIDDLE_THIRD","ATTACKING_THIRD"] as const;
const ages = ["U9","U10","U11"] as const;

export default function DrillFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  const state = useMemo(() => ({
    phase: sp.get("phase") ?? "",
    zone: sp.get("zone") ?? "",
    age: sp.get("age") ?? "",
    search: sp.get("search") ?? "",
  }), [sp]);

  const setParam = useCallback((key: string, val?: string) => {
    const next = new URLSearchParams(sp.toString());
    if (val && val.length) next.set(key, val);
    else next.delete(key);
    // reset pagination on any filter change
    next.delete("skip");
    router.push(`/drills?${next.toString()}`);
  }, [router, sp]);

  return (
    <div className="grid gap-3 md:grid-cols-4">
      <select
        className="border rounded-lg px-3 py-2"
        value={state.phase}
        onChange={(e) => setParam("phase", e.target.value || undefined)}
      >
        <option value="">Phase (all)</option>
        {phases.map(p => <option key={p} value={p}>{p}</option>)}
      </select>

      <select
        className="border rounded-lg px-3 py-2"
        value={state.zone}
        onChange={(e) => setParam("zone", e.target.value || undefined)}
      >
        <option value="">Zone (all)</option>
        {zones.map(z => <option key={z} value={z}>{z}</option>)}
      </select>

      <select
        className="border rounded-lg px-3 py-2"
        value={state.age}
        onChange={(e) => setParam("age", e.target.value || undefined)}
      >
        <option value="">Age (all)</option>
        {ages.map(a => <option key={a} value={a}>{a}</option>)}
      </select>

      <input
        className="border rounded-lg px-3 py-2"
        placeholder="Search by keyword…"
        defaultValue={state.search}
        onKeyDown={(e) => {
          if (e.key === "Enter") setParam("search", (e.target as HTMLInputElement).value || undefined);
        }}
        onBlur={(e) => setParam("search", e.target.value || undefined)}
      />
    </div>
  );
}
