type GM = { id:string; name:string; philosophy?:string };
type Input = {
  model?: string; phase?: string; zone?: string; age?: string;
  goalsAvailable?: number; keywords?: string[] | string;
};

export function fillPlan(plan: any, input: Input, gm: GM) {
  const p = plan || {};

  // totalDurationMin: sum segments if missing
  if (typeof p.totalDurationMin !== "number" && Array.isArray(p.segments)) {
    const sum = p.segments.reduce((s: number, seg: any) => s + (Number(seg?.durationMin) || 0), 0);
    if (sum > 0) p.totalDurationMin = sum;
  }

  // title fallback
  if (!p.title || typeof p.title !== "string" || !p.title.trim()) {
    const age = input.age || p.age || "U10";
    const phase = String(input.phase || p.phase || "SESSION").toUpperCase();
    const zone = String(input.zone || p.zone || "").replace(/_/g, " ").toLowerCase();
    const mins = typeof p.totalDurationMin === "number" ? ` (${p.totalDurationMin}m)` : "";
    const gmName = gm?.name || input.model || "CoachAI";
    const zoneBit = zone ? ` – ${zone}` : "";
    p.title = `${age} ${phase}${zoneBit} — ${gmName}${mins}`;
  }

  // summary fallback
  if (!p.summary || typeof p.summary !== "string" || !p.summary.trim()) {
    const kws = Array.isArray(input.keywords) ? input.keywords : (input.keywords ? String(input.keywords).split(",") : []);
    const kStr = kws.map(s => String(s).trim()).filter(Boolean).slice(0,4).join(", ");
    const gmLine = gm?.philosophy ? gm.philosophy : `Aligned with ${gm?.name || "CoachAI"}.`;
    p.summary = [kStr ? `Themes: ${kStr}.` : "", gmLine].filter(Boolean).join(" ");
  }

  // segment title fallback
  if (Array.isArray(p.segments)) {
    p.segments = p.segments.map((seg: any, i: number) => {
      if (!seg?.title) {
        const d = seg?.durationMin ? ` (${seg.durationMin} min)` : "";
        seg.title = `Segment ${i+1}${d}`;
      }
      return seg;
    });
  }

  return p;
}
