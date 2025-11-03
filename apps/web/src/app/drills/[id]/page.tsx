import Link from "next/link"
import { notFound } from "next/navigation"
import type { Drill } from "@/types/drill"

async function getDrill(id: string): Promise<Drill | null> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000"
  const res = await fetch(`${base}/api/drills/${encodeURIComponent(id)}`, { cache: "no-store" })
  if (!res.ok) return null
  const data = await res.json()
  return (data?.drill ?? null) as Drill | null
}

export default async function DrillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const drill = await getDrill(id)
  if (!drill) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <Link href="/drills" className="text-sm underline">&larr; Back to drills</Link>

      <h1 className="text-2xl font-bold mt-2">{drill.title}</h1>
      <p className="text-sm text-gray-500 mt-1">
        {drill.phase} • {drill.zone} • {drill.ageBands?.join(", ")}
      </p>

      <p className="mt-4">{drill.objective}</p>

      <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
        <div><span className="font-semibold">Categories:</span> {drill.categories?.join(", ")}</div>
        <div><span className="font-semibold">Duration:</span> {drill.durationMin}m</div>
        <div><span className="font-semibold">Players:</span> {drill.playersMin}-{drill.playersMax}</div>
        {typeof drill.goalsAvailable !== "undefined" && (
          <div><span className="font-semibold">Goals available:</span> {drill.goalsAvailable}</div>
        )}
      </div>

      {drill.equipment && (<div className="mt-6"><h3 className="font-semibold">Equipment</h3><p>{drill.equipment}</p></div>)}
      {drill.setup && (<div className="mt-4"><h3 className="font-semibold">Setup</h3><p>{drill.setup}</p></div>)}
      {drill.constraints && (<div className="mt-4"><h3 className="font-semibold">Constraints</h3><p>{drill.constraints}</p></div>)}
      {drill.progression && (<div className="mt-4"><h3 className="font-semibold">Progression</h3><p>{drill.progression}</p></div>)}

      {(drill.needGKFocus || drill.gkFocus) && (
        <div className="mt-6 rounded-xl border p-4 bg-gray-50">
          <h3 className="font-semibold">GK Focus</h3>
          {typeof drill.needGKFocus !== "undefined" && (
            <p className="text-sm mt-1"><span className="font-semibold">Needs GK focus:</span> {drill.needGKFocus ? "Yes" : "No"}</p>
          )}
          {drill.gkFocus && <p className="text-sm mt-2">{drill.gkFocus}</p>}
        </div>
      )}

      <div className="mt-6">
        <h3 className="font-semibold">Coaching Points</h3>
        <ul className="list-disc list-inside text-sm">
          {drill.coachingPts?.map((pt) => <li key={pt}>{pt}</li>)}
        </ul>
      </div>

      {drill.tags?.length ? (
        <div className="mt-6 flex flex-wrap gap-2">
          {drill.tags.map((t) => (
            <span key={t} className="px-2 py-1 rounded border text-xs">{t}</span>
          ))}
        </div>
      ) : null}

      <div className="mt-8">
        <button className="px-4 py-2 bg-black text-white rounded">Add to Session Plan</button>
      </div>
    </div>
  )
}
