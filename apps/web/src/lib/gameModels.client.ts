import coachAI from "@/lib/game-models/coachai.json";
import possession from "@/lib/game-models/possession.json";
import pressing from "@/lib/game-models/pressing.json";
import transition from "@/lib/game-models/transition.json";

export const GAME_MODEL_IDS = ["COACHAI","POSSESSION","PRESSING","TRANSITION"] as const;
export type GameModelId = typeof GAME_MODEL_IDS[number];

export const GAME_MODELS: Record<GameModelId, any> = {
  COACHAI: coachAI,
  POSSESSION: possession,
  PRESSING: pressing,
  TRANSITION: transition,
};

export const GAME_MODEL_OPTIONS = GAME_MODEL_IDS.map((id) => {
  const m = GAME_MODELS[id];
  return { id, name: m?.name ?? id, philosophy: m?.philosophy ?? "" };
});

export const DEFAULT_GAME_MODEL_ID: GameModelId = "COACHAI";
