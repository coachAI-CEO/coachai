export function parseDrillJson(text: string) {
  if (!text || typeof text !== "string") {
    return { _raw: "", title: null, objective: null, organization: null, setup: null, constraints: null, progression: null, coachingPoints: null };
  }

  // Prefer fenced ```json … ```
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : text.trim();

  // If the model sent extra prose, try to salvage the first JSON block
  let jsonStr = candidate;
  const firstBrace = candidate.indexOf("{");
  const lastBrace  = candidate.lastIndexOf("}");
  if ((firstBrace > -1) && (lastBrace > firstBrace)) {
    jsonStr = candidate.slice(firstBrace, lastBrace + 1);
  }

  try {
    const j = JSON.parse(jsonStr);
    // Ensure fields exist (nullable is OK, but keys present)
    return {
      _raw: text,
      title: j.title ?? null,
      objective: j.objective ?? null,
      organization: j.organization ?? null,
      setup: j.setup ?? null,
      constraints: j.constraints ?? null,
      progression: Array.isArray(j.progression) ? j.progression : null,
      equipment: Array.isArray(j.equipment) ? j.equipment : null,
      coachingPoints: Array.isArray(j.coachingPoints) ? j.coachingPoints : null,
      phase: j.phase ?? null,
      zone: j.zone ?? null,
      age: j.age ?? null,
      goalsAvailable: (typeof j.goalsAvailable === 'number') ? j.goalsAvailable : null,
      tags: Array.isArray(j.tags) ? j.tags : null,
      gameModel: j.gameModel ?? null
    };
  } catch {
    return {
      _raw: text,
      title: null, objective: null, organization: null, setup: null,
      constraints: null, progression: null, equipment: null, coachingPoints: null,
      phase: null, zone: null, age: null, goalsAvailable: null, tags: null, gameModel: null
    };
  }
}
