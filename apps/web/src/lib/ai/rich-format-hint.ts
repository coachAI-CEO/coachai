export const RICH_PLAN_FORMAT_HINT = `
Return strict JSON with this shape:

{
  "rationale": "3–5 sentences explaining the overall session intent",
  "summary": "Short paragraph of what players should gain",
  "totalDurationMin": <number>,
  "segments": [
    {
      "title": "string",
      "durationMin": <number>,
      "principleIds": ["compactness","delay","cover"],
      "psychThemeIds": ["communication","resilience"],
      "drill": {
        "id": "optional",
        "title": "string",
        "objective": "string (tactical outcome)",
        "setup": "field size, players, constraints, flows",
        "equipment": ["cones","balls","bibs","goals"],
        "coachingPoints": [
          "imperative coaching cues, 4–7 bullets"
        ],
        "technicalFocus": ["defensive shape","closing down","recovery runs"],
        "psychFocus": ["communication","resilience"]
      }
    }
  ]
}
Only valid JSON. No prose, no markdown fences.`;
