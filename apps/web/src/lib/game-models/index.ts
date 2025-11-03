import { promises as fs } from "fs";
import path from "path";

export type GameModel = {
  id: string;
  name: string;
  philosophy?: string;
  globalPrinciples?: string[];
  agePolicies?: Record<string, any>;
  sessionGuidelines?: Record<string, any>;
  prompts?: { planningNotes?: string };
};

// ---- Where JSON models live if you’re storing them on disk
const FS_ROOT = path.join(process.cwd(), "apps", "web", "data", "game-models");

// ---- Optional in-code registry (works even if there are no files yet)
const REGISTRY: Record<string, GameModel> = {
  PRESSING: {
    id: "PRESSING",
    name: "High Press & Counter-Press",
    prompts: { planningNotes: "" },
  },
  POSSESSION: {
    id: "POSSESSION",
    name: "Positional Play & Build-up",
    prompts: { planningNotes: "" },
  },
  TRANSITION: {
    id: "TRANSITION",
    name: "Fast Breaks & Counter-Attacks",
    prompts: { planningNotes: "" },
  },
  COACHAI: {
    id: "COACHAI",
    name: "CoachAI Balanced Youth Model",
    prompts: { planningNotes: "" },
  },
};

// Try FS first, then fall back to registry
async function listFromFS(): Promise<string[]> {
  try {
    const files = await fs.readdir(FS_ROOT);
    return files
      .filter(f => f.endsWith(".json"))
      .map(f => path.basename(f, ".json").toUpperCase());
  } catch {
    return [];
  }
}

export async function listAvailableModels(): Promise<string[]> {
  const fsList = await listFromFS();
  const regList = Object.keys(REGISTRY);
  // merge unique, preserve FS first
  const set = new Set<string>([...fsList, ...regList]);
  return [...set];
}

export async function loadGameModel(idRaw: string): Promise<GameModel> {
  const id = (idRaw || "").toUpperCase();

  // Try FS JSON first
  try {
    const file = path.join(FS_ROOT, `${id.toLowerCase()}.json`);
    const raw = await fs.readFile(file, "utf8");
    const j = JSON.parse(raw);
    // Ensure id/name exist even if the file is partial
    return {
      id: j.id || id,
      name: j.name || id,
      ...j,
    };
  } catch {
    // Then fall back to in-code registry
    const fromReg = REGISTRY[id];
    if (fromReg) return fromReg;
    throw new Error(`Game model not found: ${id}`);
  }
}
