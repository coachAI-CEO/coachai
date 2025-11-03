import { runAI } from "./providerRouter";
import { ensureGKFocus, DrillSchema } from "./schema";

export async function generateDrill(intent: {
  phase: string;
  zone: string;
  age: string;
  search?: string;
  goalsAvailable?: number;
}) {
  const provider = process.env.PROVIDER || "GEMINI";

  // 1️⃣ Construct the AI prompt
  const prompt = `
You are CoachAI, an expert youth soccer drill creator.
Generate ONE JSON drill only — do not include commentary or markdown.
Format your response exactly as JSON matching this schema:
{
  "id": string,
  "title": string,
  "objective": string,
  "phase": "DEFENDING" | "ATTACKING" | "TRANSITION",
  "zone": "DEFENSIVE_THIRD" | "MIDDLE_THIRD" | "ATTACKING_THIRD",
  "ageBands": string[],
  "categories": string[],
  "durationMin": number,
  "playersMin": number,
  "playersMax": number,
  "equipment": string,
  "setup": string,
  "constraints": string,
  "progression": string,
  "coachingPts": string[],
  "tags": string[],
  "diagram": null,
  "goalsAvailable": number,
  "needGKFocus": boolean,
  "gkFocus": string
}

Context:
Phase: ${intent.phase}
Zone: ${intent.zone}
Age group: ${intent.age}
Keywords: ${intent.search || "none"}
Goals available: ${intent.goalsAvailable || 0}

Be concise and realistic for ${intent.age} players.
`;

  // 2️⃣ Call the chosen AI provider
  const json = await runAI(provider, prompt);

  // 3️⃣ Parse and clean JSON
  let raw: any;
  try {
    const cleaned = json
      .trim()
      .replace(/^```json/i, "")
      .replace(/```$/, "")
      .trim();

    const match = cleaned.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON object found in AI response");

    raw = JSON.parse(match[0]);
  } catch (e) {
    console.error("⚠️ JSON parse error from AI:", e, json);
    throw new Error("AI did not return valid JSON");
  }

  // 4️⃣ Validate and enrich with schema + GK logic
  const validated = ensureGKFocus(DrillSchema.parse(raw));

  if (!validated.ageBands?.length) validated.ageBands = [intent.age];
  if (!validated.goalsAvailable && intent.goalsAvailable)
    validated.goalsAvailable = intent.goalsAvailable;

  validated.createdAt = new Date().toISOString();
  validated.updatedAt = new Date().toISOString();

  return validated;
}
