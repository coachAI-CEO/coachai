type Seg = {
  title?: string;
  durationMin?: number;
  drill?: { id?: string; title?: string; objective?: string };
  principleIds?: string[];
  psychThemeIds?: string[];
};

type Canonical = {
  rationale: string | null;
  summary?: string | null;
  totalDurationMin: number;
  segments: Seg[];
  _raw?: string;
};

export function normalizePlan(obj: any, fallbackDuration?: number, raw?: string): Canonical {
  if (!obj || typeof obj !== "object") {
    return { rationale: null, totalDurationMin: fallbackDuration ?? 0, segments: [], _raw: raw };
  }

  const rationale =
    obj.rationale ??
    obj.summary ??
    obj.description ??
    (typeof obj.raw === "string" ? obj.raw.slice(0, 600) : null) ??
    null;

  const totalDurationMin =
    Number(obj.totalDurationMin ?? obj.total_minutes ?? obj.duration ?? fallbackDuration ?? 0) || 0;

  let segments =
    Array.isArray(obj.segments) ? obj.segments :
    Array.isArray(obj.activities) ? obj.activities :
    Array.isArray(obj.blocks) ? obj.blocks :
    Array.isArray(obj.drills) ? obj.drills :
    [];

  segments = segments.map((s: any, i: number) => {
    const title = s?.title ?? s?.name ?? `Segment ${i + 1}`;
    const durationMin = Number(s?.durationMin ?? s?.minutes ?? s?.duration ?? 0) || 0;

    const drill = s?.drill ?? (s?.objective || s?.drillTitle
      ? {
          id: s?.drillId ?? s?.id ?? `D${i + 1}`,
          title: s?.drillTitle ?? s?.title ?? `Drill ${i + 1}`,
          objective: s?.objective ?? s?.desc ?? s?.description ?? ""
        }
      : undefined);

    return {
      title,
      durationMin,
      drill,
      principleIds: s?.principleIds ?? s?.principles ?? [],
      psychThemeIds: s?.psychThemeIds ?? s?.psych ?? [],
    };
  });

  return { rationale, summary: obj.summary ?? null, totalDurationMin, segments, _raw: raw };
}
