'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type DrillListItem = {
  id: string;
  title: string;
  objective: string;
  phase: 'DEFENDING' | 'ATTACKING' | 'TRANSITION';
  zone: 'DEFENSIVE_THIRD' | 'MIDDLE_THIRD' | 'ATTACKING_THIRD';
  ageBands: string[];
  categories: string[];
  durationMin: number;
  playersMin: number;
  playersMax: number;
  tags: string[];
  updatedAt?: string;
};

function qs(params: Record<string, string | undefined>) {
  const entries = Object.entries(params).filter(([,v]) => v && v.length);
  if (!entries.length) return "";
  const usp = new URLSearchParams(entries as [string,string][]);
  return "?" + usp.toString();
}

export default function DrillsPage() {
  const [items, setItems] = useState<DrillListItem[]>([]);
  const [phase, setPhase] = useState<string>("");
  const [zone, setZone] = useState<string>("");
  const [age, setAge] = useState<string>("");
  const [search, setSearch] = useState<string>("");

  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  const query = useMemo(() => qs({ phase, zone, age, search }), [phase, zone, age, search]);

  useEffect(() => {
    let active = true;
    (async () => {
      const res = await fetch(`${base}/api/drills${query}`, { cache: 'no-store' });
      const json = await res.json();
      if (active) setItems(json.items ?? json.drills ?? []);
    })();
    return () => { active = false; };
  }, [base, query]);

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold">Drills</h1>

      <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-2">
        <select className="border p-2 rounded"
          value={phase} onChange={e => setPhase(e.target.value)}>
          <option value="">All Phases</option>
          <option value="DEFENDING">Defending</option>
          <option value="ATTACKING">Attacking</option>
          <option value="TRANSITION">Transition</option>
        </select>

        <select className="border p-2 rounded"
          value={zone} onChange={e => setZone(e.target.value)}>
          <option value="">All Zones</option>
          <option value="DEFENSIVE_THIRD">Defensive Third</option>
          <option value="MIDDLE_THIRD">Middle Third</option>
          <option value="ATTACKING_THIRD">Attacking Third</option>
        </select>

        <select className="border p-2 rounded"
          value={age} onChange={e => setAge(e.target.value)}>
          <option value="">All Ages</option>
          <option value="U9">U9</option>
          <option value="U10">U10</option>
          <option value="U11">U11</option>
        </select>

        <input
          className="border p-2 rounded col-span-2"
          placeholder="Search title, objective, tag..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map((d) => (
          <Link key={d.id} href={`/drills/${d.id}`} className="border rounded p-3 hover:shadow">
            <h3 className="font-semibold">{d.title}</h3>
            <p className="text-sm text-neutral-600 line-clamp-2">{d.objective}</p>
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-neutral-700">
              <span className="px-2 py-0.5 bg-neutral-100 rounded">{d.phase}</span>
              <span className="px-2 py-0.5 bg-neutral-100 rounded">{d.zone}</span>
              <span className="px-2 py-0.5 bg-neutral-100 rounded">{d.ageBands.join(', ')}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
