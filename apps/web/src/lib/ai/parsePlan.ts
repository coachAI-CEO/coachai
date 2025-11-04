export function parsePlanJson(text: string) {
  if (!text || typeof text !== "string") throw new Error("Empty AI response");

  // Prefer ```json ... ``` fenced block
  const fenced = text.match(/```json\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : text.trim();

  try {
    const j = JSON.parse(candidate);
    if (!j || typeof j !== "object") throw new Error("Parsed non-object");
    return j;
  } catch {
    // Fallback so API still returns valid JSON
    return {
      rationale: candidate.slice(0, 600),
      totalDurationMin: 0,
      segments: [],
      _raw: text
    };
  }
}
