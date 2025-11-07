'use client';

import { useState } from "react";
import GameModelSelect from "@/components/forms/GameModelSelect";
import { DEFAULT_GAME_MODEL_ID, type GameModelId } from "@/lib/gameModels.client";

type Segment = {
  title: string;
  durationMin?: number;
  principleIds?: string[];
  psychThemeIds?: string[];
  drill?: {
    title?: string;
    objective?: string;
    organization?: string;
    coachingPoints?: string[];
    progression?: string[];
  };
};

type Plan = {
  title?: string;
  rationale?: string;
  summary?: string;
  totalDurationMin?: number;
  phase?: string;
  zone?: string;
  age?: string;
  goalsAvailable?: number;
  principleIds?: string[];
  psychThemeIds?: string[];
  segments?: Segment[];
};

export default function SessionPlanGeneratorPage() {
  const [phase, setPhase] = useState<'DEFENDING'|'ATTACKING'|'TRANSITION'>('DEFENDING');
  const [zone, setZone]   = useState<'DEFENSIVE_THIRD'|'MIDDLE_THIRD'|'ATTACKING_THIRD'>('DEFENSIVE_THIRD');
  const [age, setAge]     = useState('U10');
  const [goals, setGoals] = useState(2);
  const [keywords, setKeywords] = useState("compact, delay");

  const [model, setModel] = useState<GameModelId>(DEFAULT_GAME_MODEL_ID);
  const [plan, setPlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  async function saveSessionToVault(plan: any) {
    if (!plan) return;
    setSaving(true);
    setSaveMsg(null);
    async function postTo(url: string){
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: 
    JSON.stringify({ session: plan, title: (plan?.title ?? plan?.plan?.title ?? "Untitled Session") })
  
      });
      const ct = (res.headers.get("content-type") || "");
      const payload = ct.includes("application/json") ? await res.json() : { error: await res.text() };
      return { res, payload };
    }
    try {
      let { res, payload } = await postTo("/api/sessions");
      
    if (!res.ok)
   { ({ res, payload } = await postTo("/api/sessions")); }
      if (!res.ok) throw new Error(payload?.error || (`HTTP ${res.status}`));
      const sid = payload?.id || payload?.session?.id || "(saved)";
      setSaveMsg("Saved to Vault: " + sid);
    } catch (e: any) {
      setSaveMsg(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function generate() {
    setLoading(true);
    setError(null);
    setPlan(null);
    try {
      const res = await fetch("/api/coach/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model,
          phase,
          zone,
          age,
          goalsAvailable: Number(goals),
          keywords: keywords.split(",").map(s => s.trim()).filter(Boolean)
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to generate plan");
      // API returns { plan } or a plan-like object; support both
      setPlan(data?.plan ?? data);
    } catch (e: any) {
      setError(e?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold">Generate Session Plan (AI)</h1>
      <p className="text-sm text-gray-600 mt-1">
        Choose your Game Model and context. We’ll build a complete, youth-friendly training plan.
      </p>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Phase</label>
          <select className="w-full rounded-xl border px-3 py-2 text-sm" value={phase} onChange={e=>setPhase(e.target.value as any)}>
            <option>DEFENDING</option>
            <option>ATTACKING</option>
            <option>TRANSITION</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Zone</label>
          <select className="w-full rounded-xl border px-3 py-2 text-sm" value={zone} onChange={e=>setZone(e.target.value as any)}>
            <option>DEFENSIVE_THIRD</option>
            <option>MIDDLE_THIRD</option>
            <option>ATTACKING_THIRD</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Age Group</label>
          <select className="w-full rounded-xl border px-3 py-2 text-sm" value={age} onChange={e=>setAge(e.target.value)}>
            <option>U8</option><option>U9</option><option>U10</option><option>U11</option>
            <option>U12</option><option>U13</option><option>U14</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Goals Available</label>
          <input type="number" min={0} className="w-full rounded-xl border px-3 py-2 text-sm"
                 value={goals} onChange={e=>setGoals(Number(e.target.value || 0))} />
        </div>

        <div className="md:col-span-2">
          <GameModelSelect
            value={model}
            onChange={setModel}
            helperText="Sets defaults and guides AI reasoning (CoachAI/Possession/Pressing/Transition)."
          />
        </div>

        <div className="md:col-span-2 space-y-1">
          <label className="text-sm font-medium">Keywords / Themes</label>
          <input className="w-full rounded-xl border px-3 py-2 text-sm"
                 value={keywords} onChange={e=>setKeywords(e.target.value)}
                 placeholder="e.g., compact, delay, cover" />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={generate}
          disabled={loading}
          className="rounded-xl px-4 py-2 text-sm font-medium bg-black text-white disabled:opacity-60"
        >
          {loading ? "Generating…" : "Generate Plan"}
        </button>
      <button
        className="ml-3 inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50"
        onClick={() => saveSessionToVault(plan as any)}
        disabled={typeof plan === "undefined" || !plan || saving}
      >
        {saving ? "Saving…" : "Save Session to Vault"}
      </button>
      {saveMsg ? <p className="mt-2 text-sm text-gray-600">{saveMsg}</p> : null}

      </div>

      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>
      )}

      {plan && (
        <section className="mt-8 space-y-4">
          <header>
            <h2 className="text-xl font-semibold">{plan.title || "Session Plan"}</h2>
            {plan.summary && <p className="text-sm text-gray-700 mt-1">{plan.summary}</p>}
            {typeof plan.totalDurationMin === "number" && (
              <p className="text-xs text-gray-500 mt-1">Total: {plan.totalDurationMin} min</p>
            )}
          </header>

          {Array.isArray(plan.segments) && plan.segments.length > 0 && (
            <div className="space-y-4">
              {plan.segments.map((seg, i) => (
                <div key={i} className="rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{seg.title || `Segment ${i+1}`}</h3>
                    {typeof seg.durationMin === "number" && (
                      <span className="text-xs text-gray-500">{seg.durationMin} min</span>
                    )}
                  </div>
                  {seg.drill?.objective && (
                    <p className="text-sm text-gray-700 mt-1">{seg.drill.objective}</p>
                  )}
                  {seg.drill?.organization && (
                    <p className="text-sm text-gray-600 mt-2"><strong>Organization: </strong>{seg.drill.organization}</p>
                  )}
                  {Array.isArray(seg.drill?.coachingPoints) && seg.drill!.coachingPoints!.length > 0 && (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Coaching Points</p>
                      <ul className="text-sm text-gray-700 list-disc ml-5">
                        {seg.drill!.coachingPoints!.map((pt, j) => <li key={j}>{pt}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Raw JSON for debugging */}
          <details className="mt-4">
            <summary className="text-sm cursor-pointer">Raw JSON</summary>
            <pre className="text-xs mt-2 overflow-auto rounded-lg border p-3 bg-gray-50">
{JSON.stringify(plan, null, 2)}
            </pre>
          </details>
        </section>
      )}
    </main>
  );
}
