// Minimal, safe prompt builders used by generatePlan.ts and generateDrill.ts.
// Exports: generatePromptForPlan, generatePromptForDrill

type GM = {
  id: string;
  name: string;
  philosophy?: string;
  globalPrinciples?: string[];
  ageProgression?: Record<string, string>;
  segmentGuidelines?: Record<string, string>;
};

function asArray(v: any) {
  return Array.isArray(v) ? v : (v == null ? [] : [v]);
}
function safe(v: any, fallback = ""): string {
  if (v == null) return fallback;
  try { return String(v); } catch { return fallback; }
}
function safeJoin(v: any, sep = ", "): string {
  return asArray(v).map((x: any) => safe(x).trim()).filter(Boolean).join(sep);
}

export function generatePromptForPlan(input: {
  model: string;
  phase: string;
  zone: string;
  age: string;
  goalsAvailable?: number;
  keywords?: string[];
}, gm: GM) {
  const mc = gm || { id: input.model, name: input.model };

  const system = [
    "You are CoachAI, an elite UEFA A-licensed youth coach.",
    "Output must be STRICT JSON ONLY matching the schema the client expects.",
    "Keep it realistic, age-appropriate, and actionable."
  ].join("\n");

  const user = [
    "Create a complete training SESSION as JSON.",
    "Required top-level fields:",
    "- title (string)",
    "- rationale (string)",
    "- summary (string)",
    "- totalDurationMin (number)",
    "- phase (string), zone (string), age (string)",
    "- segments (array of 3–6) where each segment has:",
    "  title (string), durationMin (number), principleIds (string[]), psychThemeIds (string[]),",
    "  drill { title, objective, setup, equipment[], coachingPoints[], technicalFocus[], psychFocus[],",
    "         organization, progression[], modelInfluence { modelName, principlesApplied[], tacticalCues[],",
    "         unitFocus, intensityProfile, scoringBias, constraintsToApply[], coachingLanguage[] } }",
    "",
    `Context: phase=${safe(input.phase)}, zone=${safe(input.zone)}, age=${safe(input.age)}, goalsAvailable=${safe(input.goalsAvailable ?? 0)}`,
    `Keywords: ${safeJoin(input.keywords) || "none"}`,
    "",
    "Game Model",
    `- ID: ${safe(mc.id)}`,
    `- Name: ${safe(mc.name)}`,
    `- Philosophy: ${safe(mc.philosophy, "n/a")}`,
    `- Global principles: ${safeJoin(mc.globalPrinciples) || "n/a"}`,
    "Return valid JSON only."
  ].join("\n");

  return { system, user };
}

export function generatePromptForDrill(input: {
  model: string;
  phase: string;
  zone: string;
  age: string;
  goalsAvailable?: number;
  keywords?: string[];
}, gm: GM) {
  const mc = gm || { id: input.model, name: input.model };

  const system = [
    "You are CoachAI, an elite UEFA A-licensed youth coach.",
    "Output must be STRICT JSON ONLY for a single drill.",
    "Keep it realistic, age-appropriate, and actionable."
  ].join("\n");

  const user = [
    "Create ONE training DRILL as JSON.",
    "Required fields:",
    "- title (string under 70 chars)",
    "- objective (string)",
    "- setup (string)",
    "- equipment (string[])",
    "- coachingPoints (string[])",
    "- technicalFocus (string[])",
    "- psychFocus (string[])",
    "- organization (string)",
    "- progression (string[])",
    "- tags (string[]), gameModel (string)",
    "",
    `Context: phase=${safe(input.phase)}, zone=${safe(input.zone)}, age=${safe(input.age)}, goalsAvailable=${safe(input.goalsAvailable ?? 0)}`,
    `Keywords: ${safeJoin(input.keywords) || "none"}`,
    "",
    "Game Model",
    `- ID: ${safe(mc.id)}`,
    `- Name: ${safe(mc.name)}`,
    `- Philosophy: ${safe(mc.philosophy, "n/a")}`,
    `- Global principles: ${safeJoin(mc.globalPrinciples) || "n/a"}`,
    "Return valid JSON only."
  ].join("\n");

  return { system, user };
}
