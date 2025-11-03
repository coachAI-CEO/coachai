'use client';

import { useState } from "react";

type Phase = 'DEFENDING' | 'ATTACKING' | 'TRANSITION';
type Zone  = 'DEFENSIVE_THIRD' | 'MIDDLE_THIRD' | 'ATTACKING_THIRD';

export default function GenerateDrillPage() {
  const [phase, setPhase] = useState<Phase>('DEFENDING');
  const [zone, setZone] = useState<Zone>('DEFENSIVE_THIRD');
  const [age, setAge] = useState('U10');
  const [goalsAvailable, setGoalsAvailable] = useState(2);
  const [search, setSearch] = useState('compact, delay');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drill, setDrill] = useState<any | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDrill(null);

    try {
      const res = await fetch('/api/ai/generate-drill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phase, zone, age, goalsAvailable, search })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Failed');
      setDrill(data.drill);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Generate Drill (AI)</h1>

      <form onSubmit={onSubmit} className="grid gap-4 md:grid-cols-2 border rounded-xl p-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Phase</span>
          <select value={phase} onChange={e => setPhase(e.target.value as Phase)} className="border rounded p-2">
            <option>DEFENDING</option>
            <option>ATTACKING</option>
            <option>TRANSITION</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Zone</span>
          <select value={zone} onChange={e => setZone(e.target.value as Zone)} className="border rounded p-2">
            <option>DEFENSIVE_THIRD</option>
            <option>MIDDLE_THIRD</option>
            <option>ATTACKING_THIRD</option>
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Age</span>
          <input value={age} onChange={e => setAge(e.target.value)} className="border rounded p-2" />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm font-medium">Goals Available (0–2)</span>
          <input type="number" min={0} max={2} value={goalsAvailable}
                 onChange={e => setGoalsAvailable(Number(e.target.value))}
                 className="border rounded p-2" />
        </label>

        <label className="md:col-span-2 flex flex-col gap-1">
          <span className="text-sm font-medium">Keywords (e.g., “compact, delay”)</span>
          <input value={search} onChange={e => setSearch(e.target.value)} className="border rounded p-2" />
        </label>

        <div className="md:col-span-2">
          <button type="submit" disabled={loading}
                  className="px-4 py-2 bg-black text-white rounded disabled:opacity-50">
            {loading ? 'Generating…' : 'Generate Drill'}
          </button>
        </div>
      </form>

      {error && (
        <div className="text-red-700 border border-red-200 bg-red-50 p-3 rounded">{error}</div>
      )}

      {drill && (
        <div className="border rounded-xl p-4 space-y-2">
          <h2 className="text-xl font-semibold">{drill.title}</h2>
          <p className="text-sm text-gray-600">{drill.objective}</p>
          <div className="text-sm">Phase: <strong>{drill.phase}</strong> • Zone: <strong>{drill.zone}</strong> • Age: {drill.ageBands?.join(', ')}</div>
          <div className="text-sm">Goals available: {drill.goalsAvailable ?? 0}</div>

          {drill.gkFocus && (
            <div className="mt-2 rounded border p-2 bg-gray-50">
              <div className="font-medium">GK Focus</div>
              <div className="text-sm">{drill.gkFocus}</div>
            </div>
          )}

          <div className="mt-2">
            <div className="font-medium">Coaching Points</div>
            <ul className="list-disc list-inside text-sm">
              {(drill.coachingPts || []).map((pt: string) => <li key={pt}>{pt}</li>)}
            </ul>
          </div>

          {Array.isArray(drill.tags) && drill.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-2">
              {drill.tags.map((t: string) => (
                <span key={t} className="px-2 py-1 rounded border text-xs">{t}</span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
