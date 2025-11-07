'use client';
// apps/web/src/app/coach/plan/page.tsx
'use client'
import { useState } from 'react'

export default function PlanPage() {
  const [loading, setLoading] = useState(false)
  const [resp, setResp] = useState<any>(null)

  async function buildPlan(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setResp(null)

    const body = {
      ageBands: ['U8','U9','U10'],
      phase: 'DEFENDING',
      zone: 'DEFENSIVE_THIRD',
      themeTags: ['compactness','delay','cover','communication'],
      minutesTotal: 45,
      preferSSG: true,
    }

    const res = await fetch('/api/coach/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    setResp(await res.json())
    setLoading(false)
  }

  return (
    <main className="container py-6">
      <h1 className="text-2xl font-bold mb-4">Session Planner</h1>
      <form onSubmit={buildPlan}>
        <button
          className="px-4 py-2 rounded-lg bg-black text-white disabled:opacity-50"
          disabled={loading}
        >
          {loading ? 'Building…' : 'Build plan (U8–U10, Defending – D3)'}
        </button>
      <button
        className="ml-3 inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-white disabled:opacity-50"
        onClick={() => saveSessionToVault((plan as any))}
        disabled={typeof plan === "undefined" || !plan || saving}
      >
        {saving ? "Saving…" : "Save Session to Vault"}
      </button>
      {saveMsg ? <p className="mt-2 text-sm text-gray-600">{saveMsg}</p> : null}
      </form>

      {resp?.plan && (
        <section className="mt-6 space-y-4">
          <h2 className="text-xl font-semibold">Plan ({resp.plan.totalMinutes}’)</h2>
          <div className="grid gap-3">
            {resp.plan.blocks.map((b: any, i: number) => (
              <div key={i} className="card p-4">
                <div className="text-sm text-gray-500">{b.label}</div>
                <div className="text-lg font-medium">{b.title} <span className="text-gray-500">({b.durationMin}’)</span></div>
                <div className="text-xs text-gray-500">Drill ID: {b.drillId}</div>
                <ul className="mt-2 list-disc pl-5 text-sm">
                  {b.coachingFocus.map((c: string, j: number) => <li key={j}>{c}</li>)}
                </ul>
              </div>
            ))}
          </div>

          <div className="card p-4">
            <div className="text-sm font-medium mb-1">Notes</div>
            <ul className="list-disc pl-5 text-sm">
              {resp.plan.notes.map((n: string, k: number) => <li key={k}>{n}</li>)}
            </ul>
          </div>
        </section>
      )}
    </main>
  )
}
