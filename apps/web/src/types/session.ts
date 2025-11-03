export type PlanSegment = {
  title: string;
  durationMin: number;
  drill: { id: string; title: string; objective?: string | null };
  principleIds?: string[];
  psychThemeIds?: string[];
};

export type SessionPlan = {
  id: string;
  title: string;
  rationale?: string | null;
  totalDurationMin: number;
  phase: string;
  zone: string;
  age: string;
  goalsAvailable?: 0 | 1 | 2;
  principleIds?: string[];
  psychThemeIds?: string[];
  segments: PlanSegment[];
  createdAt: string;
  updatedAt: string;
};

export type SaveSessionInput = Omit<SessionPlan, "id"|"createdAt"|"updatedAt"> & {
  id?: string;
};

export type Reflection = {
  id: string;
  sessionId: string;
  summary: string;                 // 3–5 lines
  whatWentWell: string[];          // bullets
  toImproveNext: string[];         // bullets
  focusForNextSession: string[];   // 1–3 focuses
  psychNotes?: string[];           // optional comms/resilience notes
  timestamp: string;               // ISO
};
