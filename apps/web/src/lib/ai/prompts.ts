export function generatePromptForDrill(input: {
  phase: string; zone: string; age: string;
  goalsAvailable?: number; search?: string;
}) {
  const search = input.search ? `Focus on: ${input.search}.` : "";
  return `You are CoachAI. Produce a single soccer training drill as strict JSON.
Fields:
id,title,objective,phase,zone,ageBands[],categories[],durationMin,playersMin,playersMax,
equipment,setup,constraints,progression,coachingPts[],tags[],diagram,nullable gkFocus,
goalsAvailable,needGKFocus.

Constraints:
- Age must include "${input.age}" in ageBands.
- Phase="${input.phase}", Zone="${input.zone}", Goals=${input.goalsAvailable ?? 0}
- ${search}
Return ONLY JSON.`;
}

export function generatePromptForPlan(input: {
  phase: string; zone: string; age: string;
  goalsAvailable: number;
  principles: string[];
  psychThemes: string[];
  totalDurationMin: number;
}) {
  return `You are CoachAI. Create a session PLAN as strict JSON ONLY.

JSON schema:
{
  "rationale": string,
  "totalDurationMin": number,
  "segments": [
    {
      "title": string,
      "durationMin": number,
      "drill"?: { "id": string, "title": string, "objective"?: string },
      "principleIds"?: string[],
      "psychThemeIds"?: string[]
    }
  ]
}

Requirements:
- Phase="${input.phase}", Zone="${input.zone}", Age="${input.age}", Goals=${input.goalsAvailable}
- Target duration=${input.totalDurationMin} minutes (segments must sum to this total).
- Emphasize principles: ${input.principles.join(", ")}.
- Weave psych themes: ${input.psychThemes.join(", ")}.
- Prefer 3–5 segments; include a warm-up and a game-like block.
- Keep JSON compact; no markdown fences; no commentary.`;
}

export function generatePromptForReflection(input: {
  session: import("@/types/session").SessionPlan
}) {
  const s = input.session;
  const segs = s.segments
    .map((x, i) => ` ${i + 1}. ${x.title} — ${x.durationMin}m${x.drill?.objective ? ` — ${x.drill.objective}` : ""}`)
    .join("\n");

  return `
You are a youth soccer coaching analyst. Create a concise, actionable post-session reflection in JSON ONLY, matching this schema:
{
  "summary": "string (3-5 sentences)",
  "whatWentWell": ["bullet", "..."],
  "toImproveNext": ["bullet", "..."],
  "focusForNextSession": ["1-3 bullets"],
  "psychNotes": ["optional bullets"]
}
Context:
- Age: ${s.age}
- Phase/Zone: ${s.phase} / ${s.zone}
- Total duration: ${s.totalDurationMin} minutes
- Principles: ${(s.principleIds || []).join(", ") || "n/a"}
- Psych themes: ${(s.psychThemeIds || []).join(", ") || "n/a"}
- Segments:
${segs}

Return ONLY valid JSON with the exact keys above.
`;
}
