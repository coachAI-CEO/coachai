import Link from "next/link";
import { buildBase } from "@/app/lib/getBase";
import { ExportSessionButton } from "@/components/ExportSessionButton";

type ParamsP = Promise<{ id: string }>;
type ParamsS = { id: string };
type Props = { params: ParamsP | ParamsS };

function unwrapParams(p: ParamsP | ParamsS): Promise<{ id: string }> {
  return (p as any)?.then ? (p as ParamsP) : Promise.resolve(p as ParamsS);
}

function Chip({ children }: { children: React.ReactNode }) {
  return <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs text-gray-700 bg-white">{children}</span>;
}

function Line({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <p className="text-sm">
      <span className="font-semibold">{label}:</span> {value}
    </p>
  );
}

function List({ label, items }: { label: string; items?: string[] }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return (
    <div className="text-sm">
      <div className="font-semibold">{label}</div>
      <ul className="list-disc ml-5">
        {items.map((x, i) => <li key={i}>{x}</li>)}
      </ul>
    </div>
  );
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
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <Link href="/vault" className="text-sm text-blue-600">← Back</Link>

      <header>
        <h1 className="text-2xl font-bold mt-2">{s.title}</h1>
        <p className="text-gray-600 mt-1">
  {s.age} • {s.phase} • {s.zone} • {s.totalDurationMin}m
</p>

<div className="mt-3">
  <ExportSessionButton id={s.id ?? id} />
</div>
      </header>

      <section>
        <h2 className="font-semibold mb-2">Rationale</h2>
        <p className="text-gray-700">{s.rationale || s.summary}</p>
      </section>

      <section>
        <h2 className="font-semibold mb-3">Session Segments</h2>
        <ol className="space-y-4">
          {s.segments?.map((seg: any, idx: number) => {
            const d = seg.drill || {};
            const tags: string[] = []
              .concat(seg.principleIds || [])
              .concat((seg.psychThemeIds || []).map((x: string) => `psych: ${x}`));

            return (
              <li key={idx} className="border rounded-xl p-4 bg-white">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Link href={`/vault/${s.id}/drill/${idx}`} className="text-lg font-semibold text-blue-600 hover:underline">{seg.title}</Link>
                    <div className="text-sm text-gray-500">
                      {d.title ? <>Drill: {d.title}</> : null}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 whitespace-nowrap">{seg.durationMin}m</div>
                </div>

                {tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {tags.map((t, i) => <Chip key={i}>{t}</Chip>)}
                  </div>
                )}

                <div className="mt-3 space-y-2">
                  <Line label="Objective" value={d.objective} />
                  <Line label="Setup" value={d.setup} />
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <List label="Equipment" items={d.equipment} />
                  <List label="Coaching points" items={d.coachingPoints} />
                </div>

                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <List label="Technical focus" items={d.technicalFocus} />
                  <List label="Psych focus" items={d.psychFocus} />
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      {Array.isArray(s.reflections) && s.reflections.length > 0 && (
        <section className="pt-2">
          <h2 className="font-semibold mb-2">Reflections</h2>
          <ol className="space-y-4">
            {s.reflections.map((r: any) => (
              <li key={r.id} className="border rounded-xl p-4 bg-white">
                <div className="text-xs text-gray-500 mb-2">
                  {new Date(r.timestamp).toLocaleString()}
                </div>
                <p className="mb-2">{r.summary}</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <List label="What went well" items={r.whatWentWell} />
                  <List label="To improve next" items={r.toImproveNext} />
                  <List label="Focus for next session" items={r.focusForNextSession} />
                </div>
                <List label="Psych notes" items={r.psychNotes} />
              </li>
            ))}
          </ol>
        </section>
      )}
    </main>
  );
}
