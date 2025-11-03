'use client';

import { useState } from "react";
import { saveSessionToVault } from "@/lib/vault/client";

export default function PlanPage() {
  const [plan, setPlan] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate60() {
    setError(null);
    setSavedId(null);
    const res = await fetch("/api/coach/plan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        phase: "DEFENDING",
        zone: "DEFENSIVE_THIRD",
        age: "U10",
        goalsAvailable: 2,
        principles: ["compactness","delay","cover"],
        psychThemes: ["communication","resilience"],
        totalDurationMin: 60
      }),
    });
    const json = await res.json();
    if (!res.ok || !json?.plan) {
      setError(json?.error || "Failed to generate");
      return;
    }
    setPlan(json.plan);
  }

  async function onSave() {
    if (!plan) return;
    try {
      setSaving(true);
      setError(null);
      const saved = await saveSessionToVault({
        title: `U10 DEF Third – Compact/Delay/Cover (${plan.totalDurationMin}m)`,
        rationale: plan.rationale || null,
        totalDurationMin: plan.totalDurationMin,
        phase: "DEFENDING",
        zone: "DEFENSIVE_THIRD",
        age: "U10",
        goalsAvailable: 2,
        principleIds: ["compactness","delay","cover"],
        psychThemeIds: ["communication","resilience"],
        segments: plan.segments || [],
      });
      setSavedId(saved.id);
    } catch (e:any) {
      setError(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Coach Plan</h1>

      <div className="flex gap-2">
        <button onClick={generate60} className="px-3 py-2 rounded bg-black text-white">
          Generate 60-min Session
        </button>
        <button
          onClick={onSave}
          disabled={!plan || saving}
          className="px-3 py-2 rounded border"
        >
          {saving ? "Saving..." : "Save to Vault"}
        </button>
        {savedId && (
          <a className="px-3 py-2 rounded border" href={`/vault/${savedId}`}>
            View in Vault
          </a>
        )}
      </div>

      {error && <div className="text-red-600 text-sm">{error}</div>}

      {plan && (
        <div className="mt-4 space-y-2">
          <div className="text-sm text-gray-600">Duration: {plan.totalDurationMin} min</div>
          <p className="text-sm">{plan.rationale}</p>
          <ul className="text-sm list-disc list-inside">
            {plan.segments?.map((s:any, i:number) => (
              <li key={i}>
                <strong>{s.title}</strong> — {s.durationMin}m — {s.drill?.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
