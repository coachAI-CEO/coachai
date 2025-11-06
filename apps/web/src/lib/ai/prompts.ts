type ModelContext = {
  id: string;
  name: string;
  philosophy?: string;
  globalPrinciples?: string[];
  agePolicies?: any;
  sessionGuidelines?: any;
  planningNotes?: string;
};

const asArray = (v: any): string[] =>
  Array.isArray(v) ? v : (v == null ? [] : [String(v)]);

const safeJoin = (v: any, sep = ", "): string =>
  asArray(v).filter(Boolean).join(sep);

const safe = (v: any, fallback = ""): string =>
  typeof v === "string" ? v : fallback;

/**
 * Build the system prompt for FULL SESSION plan generation.
 * generatePlan() calls this with { ...input, modelContext }.
 */
export function generatePromptForPlan(input: {
  phase: string;
  zone: string;
  age: string;
  goalsAvailable?: number;
  principles?: string[];
  psychThemes?: string[];
  modelContext?: ModelContext;
  totalDurationMin?: number;
}): string {
  const {
    phase,
    zone,
    age,
    goalsAvailable,
    principles = [],
    psychThemes = [],
    modelContext,
    totalDurationMin,
  } = input;

  const mc = modelContext ?? ({} as ModelContext);

  return [
    `You are CoachAI. Create a complete, youth-friendly training session as structured JSON.`,
    ``,
    `Context`,
    `- Phase: ${safe(phase)}`,
    `- Zone: ${safe(zone)}`,
    `- Age: ${safe(age)}`,
    `- Goals available: ${Number.isFinite(goalsAvailable) ? goalsAvailable : "unknown"}`,
    `- Target principles: ${safeJoin(principles) || "none specified"}`,
    `- Psych themes: ${safeJoin(psychThemes) || "none specified"}`,
    ``,
    `Game Model`,
    `- ID: ${safe(mc.id)}`,
    `- Name: ${safe(mc.name)}`,
    `- Philosophy: ${safe(mc.philosophy, "n/a")}`,
    `- Global principles: ${safeJoin(mc.globalPrinciples) || "n/a"}`,
    `- Notes: ${safe(mc.planningNotes, "n/a")}`,
    ``,
    `Constraints`,
    `- Session total duration (minutes) if provided: ${Number.isFinite(totalDurationMin) ? totalDurationMin : "unspecified"}`,
    ``,
    `Return ONLY JSON with keys:`,
    `{
      "summary": string,
      "rationale": string,
      "totalDurationMin": number,
      "segments": [
        {
          "title": string,
          "durationMin": number,
          "principleIds": string[] | null,
          "psychThemeIds": string[] | null,
          "drill": {
            "title": string,
            "objective": string,
            "organization": string | null,
            "setup": string | null,
            "equipment": string[] | null,
            "constraints": string[] | null,
            "progression": string[] | null,
            "coachingPoints": string[] | null,
            "technicalFocus": string[] | null,
            "psychFocus": string[] | null,
            "modelInfluence": {
              "modelName": string | null,
              "principlesApplied": string[] | null,
              "tacticalCues": string[] | null,
              "unitFocus": string | null,
              "intensityProfile": string | null,
              "scoringBias": string | null,
              "constraintsToApply": string[] | null,
              "coachingLanguage": string[] | null
            } | null
          } | null
        }
      ]
    }`,
    ``,
    `- Ensure JSON is valid and parseable.`,
    `- Ensure totalDurationMin approximates ${Number.isFinite(totalDurationMin) ? totalDurationMin : "the requested duration"} and segments sum reasonably.`,
  ].join("\n");
}

/**
 * Build a prompt for SINGLE DRILL generation (used by /api/ai/drill-drill, if needed).
 */
export function generatePromptForDrill(input: {
  phase: string;
  zone: string;
  age: string;
  model?: string;
  goalsAvailable?: number;
  keywords?: string[];
}): string {
  const { phase, zone, age, model, goalsAvailable, keywords = [] } = input;

  return [
    `You are CoachAI. Create ONE drill as JSON.`,
    ``,
    `Context`,
    `- Phase: ${safe(phase)}`,
    `- Zone: ${safe(zone)}`,
    `- Age: ${safe(age)}`,
    `- Goals available: ${Number.isFinite(goalsAvailable) ? goalsAvailable : "unknown"}`,
    `- Model: ${safe(model, "n/a")}`,
    `- Keywords: ${safeJoin(keywords) || "none"}`,
    ``,
    `Return ONLY JSON with keys:`,
    `{
      "title": string,
      "objective": string,
      "organization": string | null,
      "setup": string | null,
      "equipment": string[] | null,
      "constraints": string[] | null,
      "progression": string[] | null,
      "coachingPoints": string[] | null,
      "technicalFocus": string[] | null,
      "psychFocus": string[] | null
    }`,
  ].join("\n");
}
