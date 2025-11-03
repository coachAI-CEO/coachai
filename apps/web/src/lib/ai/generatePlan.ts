import { generatePromptForPlan } from "./prompts";
import { runAI } from "./providerRouter";
import { loadGameModel } from "@/lib/game-models";

type PlanIntent = {
  phase: string;
  zone: string;
  age: string;
  goalsAvailable?: number;
  principles?: string[];
  psychThemes?: string[];
  model?: "POSSESSION" | "PRESSING" | "TRANSITION" | "COACHAI";
  totalDurationMin?: number;
};

export async function generatePlan(input: PlanIntent) {
  const modelId = input.model || "COACHAI";
  const gm = await loadGameModel(modelId);

  const modelContext = {
    id: gm.id,
    name: gm.name,
    philosophy: gm.philosophy,
    globalPrinciples: gm.globalPrinciples,
    agePolicies: gm.agePolicies,
    sessionGuidelines: gm.sessionGuidelines,
    planningNotes: gm.prompts?.planningNotes,
  };

  const prompt = generatePromptForPlan({
    ...input,
    modelContext
  });

  // Use the planner provider (OpenRouter/Gemini), falling back handled by caller
  const provider = process.env.PLAN_PROVIDER || "OPENROUTER";
  let raw = "";
  try {
    raw = await runAI(provider, prompt);
  } catch (e: any) {
    return {
      plan: {
        rationale: "Fallback: provider error.",
        totalDurationMin: input.totalDurationMin || 60,
        segments: [],
        error: e?.message || "provider error",
      },
      raw: process.env.NODE_ENV === "development" ? raw : undefined,
    };
  }

  // Extract JSON if wrapped in ```json ... ```
  const m = raw.match(/```json\s*([\s\S]*?)\s*```/i);
  const jsonText = m ? m[1] : raw;

  let parsed: any;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    // last-chance clean
    try {
      parsed = JSON.parse(jsonText.replace(/[^\x09\x0A\x0D\x20-\x7E]/g, ""));
    } catch {
      return {
        plan: {
          rationale: "Fallback: AI did not return valid JSON.",
          totalDurationMin: input.totalDurationMin || 60,
          segments: [],
          error: "Invalid JSON returned",
        },
        raw: process.env.NODE_ENV === "development" ? raw : undefined,
      };
    }
  }

  // Normalize into { plan }
  const total = Number(parsed.totalDurationMin) > 0
    ? Number(parsed.totalDurationMin)
    : (input.totalDurationMin || 60);

  const drills = Array.isArray(parsed.drills) ? parsed.drills : [];
  const segments = Array.isArray(parsed.segments)
    ? parsed.segments
    : drills.map((d: any) => ({
        title: d.title || "Segment",
        durationMin: d.durationMin || Math.floor(total / Math.max(drills.length || 1, 1)),
        drill: {
          id: d.id || "GEN",
          title: d.title || "Generated Drill",
          objective: d.objective || "Apply session focus.",
        },
        principleIds: d.principleIds || input.principles || [],
        psychThemeIds: d.psychThemeIds || input.psychThemes || [],
      }));

  const rationale: string =
    parsed.rationale ||
    `Session aligned to ${modelId} for ${input.age} in ${input.zone}: focuses on ${(input.principles||[]).join(", ") || "core principles"} with psych themes ${(input.psychThemes||[]).join(", ") || "as needed"}.`;

  return {
    plan: {
      rationale,
      totalDurationMin: total,
      segments,
    },
    raw: process.env.NODE_ENV === "development" ? raw : undefined,
  };
}
