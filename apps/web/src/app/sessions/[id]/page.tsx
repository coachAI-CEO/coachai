import Link from "next/link";

async function fetchSession(id: string) {
  const base = process.env.NEXT_PUBLIC_BASE_URL ?? "";
  const res = await fetch(`${base}/api/vault/sessions/${encodeURIComponent(id)}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function SessionDetail({ params }: { params: { id: string } }) {
  const data = await fetchSession(params.id);
  if (!data?.session) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <p className="text-red-600">Session not found.</p>
        <Link href="/sessions" className="text-blue-600 underline text-sm">Back</Link>
      </main>
    );
  }
  const s = data.session;
  return (
    <main className="max-w-3xl mx-auto p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{s.title}</h1>
          <div className="text-xs text-gray-500 mt-1">
            {s.phase} · {s.zone} · {s.age} · {s.totalDurationMin}m
          </div>
        </div>
        <form action={`/sessions/${s.id}/delete`} method="post">
          {/* This posts to a Route Handler we'll add next */}
          <button className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg">Delete</button>
        </form>
      </div>

      <section className="mt-6">
        <h2 className="font-medium">Rationale</h2>
        <p className="text-sm mt-1">{s.rationale}</p>
      </section>

      <section className="mt-6">
        <h2 className="font-medium mb-2">Segments</h2>
        <ol className="space-y-3">
          {s.segments?.map((seg: any, idx: number) => (
            <li key={idx} className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="font-medium">{seg.title}</div>
                <div className="text-xs text-gray-500">{seg.durationMin}m</div>
              </div>
              {seg.drill && (
                <div className="text-sm mt-1">
                  <div className="font-medium">{seg.drill.title}</div>
                  <div className="text-gray-600">{seg.drill.objective}</div>
                </div>
              )}
            </li>
          ))}
        </ol>
      </section>

      <div className="mt-8">
        <Link href="/sessions" className="text-blue-600 underline text-sm">← Back to all sessions</Link>
      </div>
    </main>
  );
}
