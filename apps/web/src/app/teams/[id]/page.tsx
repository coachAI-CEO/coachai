import Link from 'next/link'

async function getTeam(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3002'
  const res = await fetch(`${base}/api/teams/${id}`, { cache: 'no-store' })
  if (!res.ok) throw new Error('Failed to load team')
  return res.json() as Promise<{ team: any }>
}

export default async function TeamPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const { team } = await getTeam(id)

  return (
    <main className="space-y-4">
      <Link href="/" className="text-sm text-blue-600 hover:underline">← Back</Link>
      <h1 className="text-2xl font-bold">{team.name}</h1>
      <p className="text-gray-600">
        {team.ageBand} • {team.formation || '—'} • {team.club?.name}
      </p>

      <div className="grid grid-cols-3 gap-3">
        <div className="card p-4 text-center">
          <div className="text-2xl font-semibold">{team._count?.players ?? '—'}</div>
          <div className="text-xs text-gray-500">Players</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-semibold">{team._count?.sessions ?? '—'}</div>
          <div className="text-xs text-gray-500">Sessions</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-semibold">{team._count?.games ?? '—'}</div>
          <div className="text-xs text-gray-500">Games</div>
        </div>
      </div>
    </main>
  )
}
