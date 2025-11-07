import { parseDrillJson } from "./parseDrill";
import { loadGameModel } from "@/lib/game-models";
import { runPlanAI as runDrillAI } from "./providerRouter";

function _ageSpecs(age: string){
  const a = (age||"").toUpperCase();
  const n = parseInt(a.replace(/[^0-9]/g, ""), 10) || 12;
  if (n <= 9)  return { field:"30x20", sets:"4x3 min, Rest: 60 sec", intensity:"technical" };
  if (n <= 11) return { field:"40x25", sets:"3x4 min, Rest: 60 sec", intensity:"technical/tactical" };
  if (n <= 13) return { field:"50x35", sets:"3x5 min, Rest: 60 sec", intensity:"tactical" };
  if (n <= 15) return { field:"60x40", sets:"3x6 min, Rest: 75 sec", intensity:"tactical/high tempo" };
  return { field:"70x50", sets:"3x7 min, Rest: 90 sec", intensity:"high tempo" };
}

export async function generateDrill(input: {
  phase: string;
  zone: string;
  age: string;
  goalsAvailable?: number;
  keywords?: string[];
  model?: "POSSESSION" | "PRESSING" | "TRANSITION" | "COACHAI";
  playersAvailable?: number;

}) {
  const gm = await loadGameModel(input.model || "COACHAI");

  
  const edge =
    (input.model === "POSSESSION" || gm.name.includes("POSSESSION")) ? "possession: patient circulation, third-man runs, overloads, press-resistance" :
    (input.model === "PRESSING"   || gm.name.includes("PRESSING"))   ? "pressing: aggressive compactness, counter-press in 5s, vertical regains" :
    (input.model === "TRANSITION" || gm.name.includes("TRANSITION")) ? "transition: immediate reactions, 5s rule, fast breaks with secure rest-defense" :
    "balanced: spacing, timing, coordinated movement";
const prompt = `
You are CoachAI, an elite UEFA A-licensed technical coach.
Return a SINGLE JSON object only. NO prose, NO markdown.

REQUIRED SHAPE:
{
  "title": string,
  "objective": string,
  "organization": string,     // 3–6 sentences: field size, zones, player roles, rotations, triggers, flow
  "setup": string,            // concise one-liner
  "constraints": string,      // special rules
  "progression": string[],    // 2–4 steps
  "equipment": string[],      // items
  "coachingPoints": string[], // 4–8 bullets
  "phase": string, "zone": string, "age": string,
  "goalsAvailable": number,
  "tags": string[],
  "gameModel": string
}

CONTEXT
Game Model: ${gm.name}
Philosophy: ${gm.philosophy ?? ""}

INPUT
Phase: ${input.phase}
Zone: ${input.zone}
Age: ${input.age}

Players available: ${input.playersAvailable}
Goals available: ${input.goalsAvailable ?? 0}
Keywords: ${(input.keywords || []).join(", ")}
STYLE
- Organization must be 4–8 sentences: set-up, roles, rotations, triggers, flow, and scoring or success conditions.
- Include labeled single-line specs: Field: WIDTHxLENGTH yards; Sets: XxY min; Rest: Z sec; Intensity: (technical|tactical|high tempo); Triggers: short phrase list.
- Psychological edge (): weave this emphasis into decisions, cues, and constraints.
- Prefer common structures matching playersAvailable (e.g., 12→5v5+2, 10→4v4+2, 14→6v6+2) and state them explicitly.
- Keep language concise; avoid fluff. Do not repeat the "Total players" line beyond the header.

- Use exactly  total players in the drill.
- If core activity uses fewer players (e.g., 5v4), add neutrals or servers so total equals that number.
- In the Organization section, START with a header line: "Total players: N". Then write a compact, coach-usable paragraph.
- Then append these exact one-line labels (use the label even if brief):
  Triggers: <key cues that start actions>
  Rotation: <who swaps with whom / when>
  Scoring: <how goals/points are earned for each side>
  Restarts: <how play restarts after stops>
  Success: <clear completion/learning outcome>
- Write those 5 labels as standalone lines exactly in that order.
- Always include these single-line specifics:
  Field: WIDTHxLENGTH yards (age-appropriate)
  Sets: XxY min, Rest: Z sec (tempo)
  Intensity: technical | tactical | high tempo
- Use role-led triggers and intentions. Name WHO and WHY (e.g., "Winger 7 checks inside to draw FB; 10 receives to face forward").
- Coaching Points: action verbs only (Force, Delay, Screen, Cover, Shift, Scan, Body shape, Timing).
- Progressions: (1) stability, (2) add pressure or numbers, (3) directional or time constraint, (4) transition rule.
- If playersAvailable suggests a common format (e.g., 12 -> 5v5+2, 10 -> 4v4+2, 14 -> 6v6+2), choose it and state it clearly.
- Keep language concise; do not repeat "Total players" beyond the header.
`;
const text = await runDrillAI(prompt);
console.log("\n=== DRILL_RAW_START ===\n" + text + "\n=== DRILL_RAW_END ===");
  const drill = parseDrillJson(text);
try { console.log("PARSED_DRILL:\n", JSON.stringify(drill, null, 2)); } catch (e) { console.log("PARSED_DRILL_ERROR", e); }

  // Fill guaranteed fields from input / model when missing
  drill.phase = drill.phase || input.phase;
  drill.zone  = drill.zone  || input.zone;
  drill.age   = drill.age   || input.age;
  drill.goalsAvailable = drill.goalsAvailable ?? (input.goalsAvailable ?? 0);
  drill.gameModel = drill.gameModel || `${gm.name} – ${input.phase} in ${input.zone.replace(/_/g," ").toLowerCase()}`;

// --- Normalize players + organization header for consistent parsing ---
if (typeof input.playersAvailable === "number" && input.playersAvailable > 0) {
  (drill as any).playersAvailable = input.playersAvailable;
} else if (typeof (drill as any).playersAvailable !== "number") {
  // leave undefined if AI didn't set it
}

{
  const N = (drill as any).playersAvailable;
  const hasOrg = typeof drill.organization === "string";
  const orgRaw = hasOrg ? drill.organization : "";
  const orgTrim = String(orgRaw).replace(/^Total players:\s*\d+\s*\n/i, "").trim();

  if (typeof N === "number" && N > 0) {
    // Prepend a consistent header line with the total player count
    drill.organization = `Total players: ${N}\n${orgTrim}`.trim();
  } else if (hasOrg) {
    // If no numeric N, leave org as-is but de-duplicate any repeated headers
    drill.organization = orgTrim || orgRaw;
  }
}

// De-duplicate any extra "Total players:" lines the model might include later.
if (typeof drill.organization === "string") {
  const lines = drill.organization.split(/\n/);
  let seen = false;
  const cleaned = lines.filter(l => {
    if (/^\s*Total players:\s*\d+/i.test(l)) {
      if (seen) return false;
      seen = true;
    }
    return true;
  });
  drill.organization = cleaned.join("\n").replace(/\n{3,}/g, "\n\n");
}

  {
    const raw = String(drill.organization || "").trim();
    const body = raw.replace(/^\s*Total players:\s*\d+\s*\.?\s*(?:\r?\n)?/i, "").trim();
    if (body.length < 80) {
      const spec = _ageSpecs(String(drill.age || input.age));
      const N = (drill as any).playersAvailable || 0;
      const goals = Number(drill.goalsAvailable ?? input.goalsAvailable ?? 0);
      const zone = String(drill.zone || input.zone).replace(/_/g," ").toLowerCase();
      const structure = N >= 14 ? "6v6+2" : N >= 12 ? "5v5+2" : N >= 10 ? "4v4+2" : "3v3+2";
      drill.organization = `Total players: ${N}
Set up ${spec.field} in the ${zone}. Play ${structure} with two neutrals to maintain flow. Ball starts with the ${goals > 0 ? "attacking team" : "coach"} and progresses into the ${zone}. Attackers look to penetrate or combine; defenders delay, screen and force play wide. On regain, counter to ${goals > 0 ? "the goal" : "gates"} within 5s. Rotate roles every set. ${spec.sets}; Intensity: ${spec.intensity}.`;
    }
  }

  // Safety fallback for organization
  drill.organization = drill.organization || "Set up a marked area with clear roles and rotations. Emphasize timing, compactness, and decision-making under the session objective.";

  return drill;
}
