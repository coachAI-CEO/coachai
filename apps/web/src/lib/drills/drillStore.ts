import { promises as fs } from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "apps", "web", "data", "drills");

async function ensureDir() {
  await fs.mkdir(ROOT, { recursive: true });
}

export type Drill = {
  slug: string;
  title?: string;
  objective?: string;
  organization?: string;
  setup?: string;
  equipment?: string[];      // optional array form
  constraints?: string[];    // e.g., touch limits, zones
  progression?: string[];    // 1→n steps
  coachingPoints?: string[]; // bullets
  technicalFocus?: string[];
  psychFocus?: string[];
  modelTags?: string[];      // PRESSING/POSSESSION/...
  raw?: any;                 // original object from LLM (optional)
};

function fileOf(slug: string) {
  return path.join(ROOT, `${slug}.json`);
}

export async function saveDrill(d: Drill): Promise<Drill> {
  await ensureDir();
  const out = { ...d, updatedAt: new Date().toISOString() };
  await fs.writeFile(fileOf(d.slug), JSON.stringify(out, null, 2), "utf8");
  return out;
}

export async function getDrill(slug: string): Promise<Drill | null> {
  try {
    const raw = await fs.readFile(fileOf(slug), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
