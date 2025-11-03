'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

const phases = ['DEFENDING','ATTACKING','TRANSITION'] as const;
const zones = ['DEFENSIVE_THIRD','MIDDLE_THIRD','ATTACKING_THIRD'] as const;
const ages = ['U9','U10','U11'];

export default function DrillFilters() {
  const router = useRouter();
  const sp = useSearchParams();

  const [phase, setPhase] = useState(sp.get('phase') ?? 'DEFENDING');
  const [zone, setZone] = useState(sp.get('zone') ?? 'DEFENSIVE_THIRD');
  const [age, setAge] = useState(sp.get('age') ?? 'U10');
  const [search, setSearch] = useState(sp.get('search') ?? '');

  useEffect(() => {
    setPhase(sp.get('phase') ?? 'DEFENDING');
    setZone(sp.get('zone') ?? 'DEFENSIVE_THIRD');
    setAge(sp.get('age') ?? 'U10');
    setSearch(sp.get('search') ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sp]);

  const apply = () => {
    const p = new URLSearchParams();
    if (phase) p.set('phase', phase);
    if (zone) p.set('zone', zone);
    if (age) p.set('age', age);
    if (search) p.set('search', search);
    router.push(`/drills?${p.toString()}`);
  };

  return (
    <div className="flex flex-wrap gap-2 items-end p-3 border rounded-lg">
      <div className="flex flex-col">
        <label className="text-xs">Phase</label>
        <select className="border px-2 py-1 rounded" value={phase} onChange={e=>setPhase(e.target.value)}>
          {phases.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs">Zone</label>
        <select className="border px-2 py-1 rounded" value={zone} onChange={e=>setZone(e.target.value)}>
          {zones.map(z => <option key={z} value={z}>{z}</option>)}
        </select>
      </div>

      <div className="flex flex-col">
        <label className="text-xs">Age</label>
        <select className="border px-2 py-1 rounded" value={age} onChange={e=>setAge(e.target.value)}>
          {ages.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="flex flex-col grow min-w-[200px]">
        <label className="text-xs">Search</label>
        <input
          className="border px-2 py-1 rounded"
          value={search}
          onChange={e=>setSearch(e.target.value)}
          placeholder="compact, 3v3, cutback…"
        />
      </div>

      <button onClick={apply} className="px-3 py-2 rounded bg-black text-white">
        Apply
      </button>
    </div>
  );
}
