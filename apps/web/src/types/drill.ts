export type EnergySystem = 'ALACTIC' | 'LACTIC' | 'AEROBIC';

export type Drill = {
  id: string;
  title: string;
  objective: string;

  phase: 'DEFENDING' | 'ATTACKING' | 'TRANSITION';
  zone: 'DEFENSIVE_THIRD' | 'MIDDLE_THIRD' | 'ATTACKING_THIRD';

  ageBands: string[];
  categories: string[];

  durationMin: number;
  playersMin: number;
  playersMax: number;

  equipment?: string | null;
  setup?: string | null;
  constraints?: string | null;
  progression?: string | null;

  coachingPts: string[];
  tags: string[];
  diagram?: any;

  // NEW: game model & psychology tags for AI
  principleIds?: string[];
  subprincipleIds?: string[];
  psychThemeIds?: string[];

  // NEW: load & physiology
  rpeMin?: number;
  rpeMax?: number;
  energySystem?: EnergySystem;

  // NEW: GK integration & availability of goals
  goalsAvailable?: 0 | 1 | 2;
  needGKFocus?: boolean;
  gkFocus?: string | null;

  createdAt?: string;
  updatedAt?: string;
};
