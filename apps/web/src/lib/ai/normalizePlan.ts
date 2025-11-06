type Drill = {
  title?: string;
  objective?: string;
  organization?: string;
  setup?: string;
  equipment?: string[];
  constraints?: string[];
  progression?: string[];
  coachingPoints?: string[];
  technicalFocus?: string[];
  psychFocus?: string[];
  modelTags?: string[];
  [k: string]: any;
};

export function normalizePlan(raw: any, totalMin?: number, _rawText?: string) {
  const safeStr = (v: any) => (typeof v === "string" ? v : "");
  const safeArr = (v: any) => (Array.isArray(v) ? v.filter(x => typeof x === "string") : []);

  const plan: any = {
    rationale: safeStr(raw?.rationale),
    summary: safeStr(raw?.summary),
    totalDurationMin: Number.isFinite(raw?.totalDurationMin) ? Number(raw.totalDurationMin) : Number(totalMin) || 0,
    segments: Array.isArray(raw?.segments) ? raw.segments : [],
  };

  plan.segments = plan.segments.map((seg: any) => {
    const drill: Drill = seg?.drill || {};

    const normalized: Drill = {
      title: safeStr(drill.title),
      objective: safeStr(drill.objective),
      organization: safeStr(drill.organization),
      setup: safeStr(drill.setup),
      equipment: safeArr(drill.equipment),
      constraints: safeArr(drill.constraints),
      progression: safeArr(drill.progression),
      coachingPoints: safeArr(drill.coachingPoints),
      technicalFocus: safeArr(drill.technicalFocus),
      psychFocus: safeArr(drill.psychFocus),
      modelTags: safeArr(drill.modelTags),
      ...drill,
    };

    return {
      title: safeStr(seg?.title),
      durationMin: Number.isFinite(seg?.durationMin) ? Number(seg.durationMin) : 0,
      principleIds: safeArr(seg?.principleIds),
      psychThemeIds: safeArr(seg?.psychThemeIds),
      drill: normalized,
    };
  });

  return plan;
}
