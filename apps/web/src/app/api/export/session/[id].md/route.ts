import { NextResponse } from "next/server";
import { buildBase } from "@/app/lib/getBase";

function asText(x: any): string {
  if (x == null) return "";
  if (typeof x === "string") return x;
  return JSON.stringify(x, null, 2);
}
function arr(xs: any): string[] {
  return Array.isArray(xs) ? xs.filter((s: any) => typeof s === "string") : [];
}

export const dynamic = "force-dynamic";

export async function GET(req: Request, ctx: { params?: { id?: string } }) {
  // Unwrap id safely even if ctx.params is a Promise in dev
  const url = new URL(req.url);
  const parts = url.pathname.split("/");
  const idFromPath = parts[parts.length - 1]?.replace(/\.md$/, "");

  const id = (ctx as any)?.params?.id ?? idFromPath;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const base = await buildBase();
  const res = await fetch(`${base}/api/vault/sessions/${id}`, { cache: "no-store" });
  if (!res.ok) {
    return NextResponse.json({ error: `Session not found (${res.status})` }, { status: 404 });
  }
  const { session: s } = await res.json();

  // Build Markdown
  let md: string[] = [];
  md.push(`# ${s.title || "Session"}`);
  md.push("");
  md.push(`**Age:** ${s.age || "-"}  |  **Phase:** ${s.phase || "-"}  |  **Zone:** ${s.zone || "-"}  |  **Total:** ${s.totalDurationMin ?? 0}m`);
  md.push("");
  if (s.summary) {
    md.push("## Summary");
    md.push(asText(s.summary));
    md.push("");
  }
  if (s.rationale) {
    md.push("## Rationale");
    md.push(asText(s.rationale));
    md.push("");
  }

  md.push("## Segments");
  (s.segments || []).forEach((seg: any, i: number) => {
    md.push(`### ${i + 1}. ${seg.title || "Segment"} (${seg.durationMin ?? 0}m)`);
    if (seg.drill) {
      const d = seg.drill;
      if (d.objective) { md.push(`**Objective:** ${asText(d.objective)}`); }
      if (d.organization) { md.push(`**Organization:** ${asText(d.organization)}`); }
      if (d.setup) { md.push(`**Setup:** ${asText(d.setup)}`); }
      const eq = arr(d.equipment);
      if (eq.length) { md.push(`**Equipment:** ${eq.join(", ")}`); }
      const cp = arr(d.coachingPoints);
      if (cp.length) {
        md.push("**Coaching Points:**");
        cp.forEach((p) => md.push(`- ${p}`));
      }
      const prog = arr(d.progression);
      if (prog.length) {
        md.push("**Progression:**");
        prog.forEach((p) => md.push(`- ${p}`));
      }
      if (d.modelInfluence) {
        const mi = d.modelInfluence;
        md.push("");
        md.push("**Model Influence:**");
        if (mi.modelName) md.push(`- Model: ${mi.modelName}`);
        if (Array.isArray(mi.principlesApplied) && mi.principlesApplied.length) md.push(`- Principles: ${mi.principlesApplied.join(", ")}`);
        if (Array.isArray(mi.tacticalCues) && mi.tacticalCues.length) {
          md.push("- Tactical Cues:"); mi.tacticalCues.forEach((t: string)=>md.push(`  - ${t}`));
        }
        if (mi.unitFocus) md.push(`- Unit Focus: ${mi.unitFocus}`);
        if (mi.intensityProfile) md.push(`- Intensity: ${mi.intensityProfile}`);
        if (mi.scoringBias) md.push(`- Scoring Bias: ${mi.scoringBias}`);
        if (Array.isArray(mi.constraintsToApply) && mi.constraintsToApply.length) {
          md.push("- Constraints:"); mi.constraintsToApply.forEach((c: string)=>md.push(`  - ${c}`));
        }
      }
    }
    md.push("");
  });

  const refs = Array.isArray(s.reflections) ? s.reflections : [];
  if (refs.length) {
    md.push("## Reflections");
    refs.forEach((r: any, idx: number) => {
      md.push(`### Reflection ${idx + 1} — ${new Date(r.timestamp || Date.now()).toLocaleString()}`);
      if (r.summary) md.push(r.summary);
      const w = Array.isArray(r.whatWentWell) ? r.whatWentWell : [];
      const imp = Array.isArray(r.toImproveNext) ? r.toImproveNext : [];
      const foc = Array.isArray(r.focusForNextSession) ? r.focusForNextSession : [];
      if (w.length) { md.push("**What went well:**"); w.forEach((x)=>md.push(`- ${x}`)); }
      if (imp.length) { md.push("**To improve next:**"); imp.forEach((x)=>md.push(`- ${x}`)); }
      if (foc.length) { md.push("**Focus for next session:**"); foc.forEach((x)=>md.push(`- ${x}`)); }
      const psy = Array.isArray(r.psychNotes) ? r.psychNotes : [];
      if (psy.length) { md.push("**Psych notes:**"); psy.forEach((x)=>md.push(`- ${x}`)); }
      md.push("");
    });
  }

  const buf = Buffer.from(md.join("\n"));
  return new NextResponse(buf, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${id}.md"`,
      "Cache-Control": "no-store",
    },
  });
}
