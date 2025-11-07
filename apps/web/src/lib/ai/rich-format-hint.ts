export const RICH_PLAN_FORMAT_HINT = `
Return ONLY valid JSON. No prose outside JSON.

Required top-level keys:
- rationale (string)
- summary (string)
- totalDurationMin (number)
- segments (array of objects)

Each segment MUST include:
- title (string)
- durationMin (number)
- principleIds (array of strings, can be empty)
- psychThemeIds (array of strings, can be empty)
- drill (object) with ALL of:
  - title (string)
  - objective (string)
  - organization (string)  // narrative layout like the example paragraph
  - setup (string)
  - equipment (string[])
  - constraints (string[]) // rules/conditions
  - progression (string[]) // stepwise changes
  - coachingPoints (string[])
  - technicalFocus (string[])
  - psychFocus (string[])
  - modelTags (string[])    // e.g. ["COACHAI","PRESSING","POSSESSION","TRANSITION"]

Example minimal shape:
{
  "rationale": "Why this plan matters...",
  "summary": "Session outcomes...",
  "totalDurationMin": 90,
  "segments": [
    {
      "title": "Defensive Shape & Pressure",
      "durationMin": 25,
      "principleIds": ["compactness","delay","cover"],
      "psychThemeIds": ["communication","resilience"],
      "drill": {
        "title": "3v3 Narrow Block to Protect Goal",
        "objective": "Teach compact defending and delay principles.",
        "organization": "50x50yd area split into zones; attackers circulate before finding wide entry; defenders shift together; if defenders win it, transition to mini goals.",
        "setup": "Area: 50x50yd in zones. Players: 6 attackers vs 5 defenders + GK. Duration: 4x5'.",
        "equipment": ["cones","balls","mini goals","bibs"],
        "constraints": ["All attackers touch before finish","Defenders counter to mini goals after regain"],
        "progression": ["Add second striker (7v6)","Reduce width for compactness","Add offside line to time the press"],
        "coachingPoints": ["Compactness & cover","Force wide","Delay until support arrives","Communication cues"],
        "technicalFocus": ["defensive shape","pressure","cover","delay"],
        "psychFocus": ["resilience","communication"],
        "modelTags": ["COACHAI","PRESSING"]
      }
    }
  ]
}
`;
