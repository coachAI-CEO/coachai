import Link from "next/link";
import { buildBase } from "@/app/lib/getBase";

async function getSessions() {
  const base = await buildBase();
  const res  = await fetch(`${base}/api/vault/sessions`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Failed to load sessions: ${res.status}`);
  return res.json() as Promise<{ items: Array<{ id:string; title:string; totalDurationMin:number; age:string; phase:string; zone:string; }> }>;
}

export default async function VaultListPage() {
  const { items } = await getSessions();
  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Session Vault</h1>

      {!items.length ? (
        <p className="text-gray-600">No saved sessions yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map(s => (
            <li key={s.id} className="border rounded-lg p-4 hover:bg-gray-50">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-semibold">{s.title}</h2>
                  <p className="text-xs text-gray-500">
                    {s.age} • {s.phase} • {s.zone} • {s.totalDurationMin}m
                  </p>
                </div>
                <Link className="text-blue-600 underline" href={`/vault/${s.id}`}>
                  View
                </Link>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
