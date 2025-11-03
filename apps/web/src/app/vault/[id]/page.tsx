import Link from "next/link";
import { buildBase } from "@/app/lib/getBase";

type ParamsP = Promise<{ id: string }>;
type ParamsS = { id: string };
type Props = { params: ParamsP | ParamsS };

function unwrapParams(p: ParamsP | ParamsS): Promise<{ id: string }> {
  return (p as any)?.then ? (p as ParamsP) : Promise.resolve(p as ParamsS);
}

export default async function VaultDetailPage(props: Props) {
  const { id } = await unwrapParams(props.params);

  if (!id) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <Link href="/vault" className="text-sm text-blue-600">← Back</Link>
        <p className="mt-6 text-red-600 font-semibold">Missing ID</p>
      </main>
    );
  }

  const base = await buildBase();
  const res  = await fetch(`${base}/api/vault/sessions/${id}`, { cache: "no-store" });

  if (!res.ok) {
    return (
      <main className="max-w-3xl mx-auto p-6">
        <Link href="/vault" className="text-sm text-blue-600">← Back</Link>
        <p className="mt-6 text-red-600 font-semibold">Failed to load session: {res.status}</p>
      </main>
    );
  }

  const { session: s } = await res.json();

  return (
    <main className="max-w-3xl mx-auto p-6">
      <Link href="/vault" className="text-sm text-blue-600">← Back</Link>

      <h1 className="text-2xl font-bold mt-4">{s.title}</h1>
      <p className="text-gray-600 mt-1">
        {s.age} • {s.phase} • {s.zone} • {s.totalDurationMin}m
      </p>

      <section className="mt-6">
        <h2 className="font-semibold mb-2">Rationale</h2>
        <p className="text-gray-700">{s.rationale}</p>
      </section>

      <section className="mt-6">
        <h2 className="font-semibold mb-2">Segments</h2>
        <ol className="space-y-2">
          {s.segments?.map((seg: any, idx: number) => (
            <li key={idx} className="border rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">{seg.title}</span>
                <span className="text-xs text-gray-500">{seg.durationMin}m</span>
              </div>
              {seg.drill && (
                <p className="text-sm text-gray-600 mt-1">
                  {seg.drill.title}: {seg.drill.objective}
                </p>
              )}
            </li>
          ))}
        </ol>
      </section>
    </main>
  );
}

      {Array.isArray(s.reflections) && s.reflections.length > 0 && (
        <section className="mt-10">
          <h2 className="font-semibold mb-2">Reflections</h2>
          <ol className="space-y-4">
            {s.reflections.map((r: any) => (
              <li key={r.id} className="border rounded-lg p-4">
                <div className="text-xs text-gray-500 mb-2">
                  {new Date(r.timestamp).toLocaleString()}
                </div>
                <p className="mb-2">{r.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium">What went well</div>
                    <ul className="list-disc ml-5">
                      {(r.whatWentWell || []).map((x: string, i: number) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium">To improve next</div>
                    <ul className="list-disc ml-5">
                      {(r.toImproveNext || []).map((x: string, i: number) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium">Focus for next session</div>
                    <ul className="list-disc ml-5">
                      {(r.focusForNextSession || []).map((x: string, i: number) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>
                </div>
                {Array.isArray(r.psychNotes) && r.psychNotes.length > 0 && (
                  <div className="mt-3 text-sm">
                    <div className="font-medium">Psych notes</div>
                    <ul className="list-disc ml-5">
                      {r.psychNotes.map((x: string, i: number) => <li key={i}>{x}</li>)}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>
      )}
