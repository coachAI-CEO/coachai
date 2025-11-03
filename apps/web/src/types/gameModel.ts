export type GameModel = {
  id: "POSSESSION" | "PRESSING" | "TRANSITION" | "COACHAI";
  name: string;
  philosophy: string;
  globalPrinciples: string[];
  agePolicies: Record<string, { emphasis: string[]; constraints: string[] }>;
  sessionGuidelines: {
    typicalSegments: { title: string; rangeMin: [number, number] }[];
    psychThemes: string[];
  };
  prompts: {
    drillTone: string;
    planningNotes: string;
  };
};
