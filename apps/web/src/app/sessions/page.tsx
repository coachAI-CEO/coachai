import Link from "next/link";

async function fetchSessions() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/vault/sessions`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load sessions");
  return res.json();
}

export default async function SessionsPage() {
  const { items } = await fetchSessions();
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-semibold mb-4">Saved Sessions</h1>
      {(!items || items.length === 0) && <p className="text-sm text-gray-500">No sessions yet.</p>}
      <ul className="space-y-3">
        {items?.map((s: any) => (
          <li key={s.id} className="border rounded-lg p-4 flex items-center justify-between">
            <div>
              <div className="font-medium">{s.title}</div>
              <div className="text-xs text-gray-500">{s.phase} · {s.zone} · {s.age} · {s.totalDurationMin}m</div>
            </div>
            <Link className="text-blue-600 underline text-sm" href={`/sessions/${s.id}`}>Open</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
