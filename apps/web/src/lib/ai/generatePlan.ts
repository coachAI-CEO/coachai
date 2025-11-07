import { generatePromptForPlan } from "./prompts";
import { runPlanAI } from "./providerRouter";
import { loadGameModel } from "@/lib/game-models";
import { parsePlanJson } from "./parsePlan";
import { RICH_PLAN_FORMAT_HINT } from "./rich-format-hint";
import { normalizePlan } from "./normalizePlan";
import { fillPlan } from "./fillPlan";

export async function generatePlan(input: {
  phase: string;
  zone: string;
  age: string;
  goalsAvailable?: number;
  principles?: string[];
  psychThemes?: string[];
  model?: "POSSESSION" | "PRESSING" | "TRANSITION" | "COACHAI";
  totalDurationMin?: number;
}) {
  // 1) Load game model (default CoachAI)
  const gm = await loadGameModel(input.model || "COACHAI");

  const modelContext = {
    id: gm.id,
    name: gm.name,
    philosophy: gm.philosophy,
    globalPrinciples: gm.globalPrinciples,
    agePolicies: gm.agePolicies,
    sessionGuidelines: gm.sessionGuidelines,
    planningNotes: gm.prompts?.planningNotes,
  };

  // 2) Build prompt and append rich format hint
  let prompt = generatePromptForPlan({ ...input, modelContext });
  prompt += "\n" + RICH_PLAN_FORMAT_HINT;

  // 3) Call model provider
  const text = await runPlanAI(prompt);

  // 4) Parse -> normalize
  const rawObj = parsePlanJson(text);
  const canonical = normalizePlan(rawObj);

  // 5) Ensure modelInfluence exists on each drill
  if (Array.isArray(canonical.segments)) {
    for (const seg of canonical.segments) {
      const d = seg?.drill;
      if (!d) continue;
      if (!d.modelInfluence) {
        d.modelInfluence = {
          modelName: gm.name,
          principlesApplied: ["compactness", "delay", "cover"],
          tacticalCues: [
            "Nearest presses, second covers, third balances",
            "Show outside when possible",
            "Recover behind the ball on loss",
          ],
          unitFocus: String(input.zone || "").includes("DEFENSIVE")
            ? "Back line + DM"
            : "Unit",
          intensityProfile: "moderate",
          scoringBias: "Defensive success: force wide, block, regain",
          constraintsToApply: [
            "Touch limit for attackers",
            "Bonus if defending team forces play wide",
            "Regain within 6s = extra point",
          ],
          coachingLanguage: ["Delay", "Cover", "Compact", "Show wide"],
        };
      }
    }
  }

  // 6) Fill guaranteed fields (title/summary/totalDurationMin/segment titles)
  return fillPlan(canonical, input, gm);
}
