import type { Drill } from '@/types/drill'

export type DrillsResponse = { items: Drill[]; total: number; take: number; skip: number }
export type DrillResponse = { drill: Drill }

function buildQS(params: Record<string, string | number | boolean | undefined> = {}) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') q.set(k, String(v))
  }
  return q.toString()
}

export async function fetchDrills(params: Record<string, string | number | boolean | undefined> = {}) {
  const qs = buildQS(params)
  const url = qs ? `/api/drills?${qs}` : '/api/drills'
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch drills: ${res.status}`)
  return res.json() as Promise<DrillsResponse>
}

export async function fetchDrill(id: string) {
  const res = await fetch(`/api/drills/${encodeURIComponent(id)}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`Failed to fetch drill ${id}: ${res.status}`)
  return res.json() as Promise<DrillResponse>
}
