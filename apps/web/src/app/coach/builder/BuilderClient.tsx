"use client";

import { useState } from "react";

type Plan = {
  rationale?: string;
  totalDurationMin?: number;
  segments?: Array<{
    title: string;
    durationMin: number;
    drill?: { id?: string; title?: string; objective?: string };
    principleIds?: string[];
    psychThemeIds?: string[];
  }>;
};

const PHASES = ["ATTACKING","DEFENDING","TRANSITION","SET_PLAYS"];
const ZONES  = ["DEFENSIVE_THIRD","MIDDLE_THIRD","ATTACKING_THIRD"];
const AGES   = ["U8","U9","U10","U11","U12","U13","U14","U15","U16","U17","U18"];
const MODELS = [
  { id: "COACHAI",    label: "CoachAI (Balanced)" },
  { id: "PRESSING",   label: "High Press & Counter-Press" },
  { id: "POSSESSION", label: "Positional Play (Possession)" },
  { id: "TRANSITION", label: "Fast Transition" },
];

export default function BuilderClient() {
  const [phase, setPhase] = useState("DEFENDING");
  const [zone, setZone]   = useState("DEFENSIVE_THIRD");
  const [age, setAge]     = useState("U10");
  const [duration, setDuration] = useState(60);
  const [model, setModel] = useState("COACHAI");
  const [goals, setGoals] = useState(2);
  const [principles, setPrinciples] = useState("compactness, delay, cover");
  const [psych, setPsych] = useState("communication, resilience");

  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [plan, setPlan]       = useState<Plan | null>(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const res = await fetch("/api/coach/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phase,
          zone,
          age,
          model,
          goalsAvailable: goals,
          totalDurationMin: duration,
          principles: splitCsv(principles),
          psychThemes: splitCsv(psych),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || `HTTP ${res.status}`);
      setPlan(json.plan as Plan);
    } catch (e: any) {
      setError(e?.message || "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Session Builder</h1>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select label="Game Model" value={model} onChange={setModel} options={MODELS} />
        <Select label="Phase" value={phase} onChange={setPhase} options={PHASES.map(x=>({id:x,label:x}))} />
        <Select label="Zone" value={zone} onChange={setZone} options={ZONES.map(x=>({id:x,label:x}))} />
        <Select label="Age Band" value={age} onChange={setAge} options={AGES.map(x=>({id:x,label:x}))} />
        <NumInput label="Total Duration (min)" value={duration} onChange={setDuration} min={30} max={120} />
        <NumInput label="Goals Available" value={goals} onChange={setGoals} min={0} max={4} />
        <Text label="Principles (comma separated)" value={principles} onChange={setPrinciples} placeholder="compactness, delay, cover" />
        <Text label="Psych Themes (comma separated)" value={psych} onChange={setPsych} placeholder="communication, resilience" />
      </section>

      <div>
        <button
          onClick={generate}
          disabled={loading}
          className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate Session"}
        </button>
      </div>

      {error && (
        <div className="border rounded-lg p-4 bg-red-50 text-red-700">
          {error}
        </div>
      )}

      {plan && (
        <section className="space-y-4">
          <header>
            <h2 className="text-xl font-semibold">Plan</h2>
            {plan.rationale && (
              <p className="text-gray-600 mt-1">{plan.rationale}</p>
            )}
            {typeof plan.totalDurationMin === "number" && (
              <p className="text-sm text-gray-500 mt-1">
                Total: {plan.totalDurationMin} minutes
              </p>
            )}
          </header>

          <ol className="space-y-3">
            {(plan.segments || []).map((seg, idx) => (
              <li key={idx} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{seg.title}</div>
                    {seg.drill?.title && (
                      <div className="text-sm text-gray-700">
                        {seg.drill.title}
                        {seg.drill.objective ? `: ${seg.drill.objective}` : ""}
                      </div>
                    )}
                    {(seg.principleIds?.length || 0) > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        Principles: {seg.principleIds?.join(", ")}
                      </div>
                    )}
                    {(seg.psychThemeIds?.length || 0) > 0 && (
                      <div className="text-xs text-gray-500">
                        Psych: {seg.psychThemeIds?.join(", ")}
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">{seg.durationMin}m</div>
                </div>
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}

function splitCsv(s: string): string[] {
  return (s || "")
    .split(",")
    .map(x => x.trim())
    .filter(Boolean);
}

function Text({
  label, value, onChange, placeholder
}: { label:string; value:string; onChange:(s:string)=>void; placeholder?:string }) {
  return (
    <label className="block">
      <div className="text-sm font-medium mb-1">{label}</div>
      <input
        className="w-full border rounded-lg p-2"
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
      />
    </label>
  );
}

function NumInput({
  label, value, onChange, min, max
}: { label:string; value:number; onChange:(n:number)=>void; min?:number; max?:number }) {
  return (
    <label className="block">
      <div className="text-sm font-medium mb-1">{label}</div>
      <input
        type="number"
        className="w-full border rounded-lg p-2"
        value={value}
        min={min}
        max={max}
        onChange={e => onChange(globalThis.Number(e.target.value))}
      />
    </label>
  );
}

function Select<T extends string>({
  label, value, onChange, options
}: { label:string; value:T; onChange:(v:T)=>void; options:{id:T,label:string}[] }) {
  return (
    <label className="block">
      <div className="text-sm font-medium mb-1">{label}</div>
      <select
        className="w-full border rounded-lg p-2 bg-white"
        value={value}
        onChange={e => onChange(e.target.value as T)}
      >
        {options.map(opt => (
          <option key={opt.id} value={opt.id}>{opt.label}</option>
        ))}
      </select>
    </label>
  );
}
