import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import type { SessionPlan, SaveSessionInput, Reflection } from "@/types/session";

// ✅ Correct vault root
const ROOT = path.join(process.cwd(), "data", "sessions");

async function ensureDir() {
  await fs.mkdir(ROOT, { recursive: true });
}

function fileOf(id: string) {
  return path.join(ROOT, `${id}.json`);
}

export async function listSessions(): Promise<Pick<SessionPlan, "id"|"title"|"totalDurationMin"|"age"|"phase"|"zone"|"updatedAt">[]> {
  await ensureDir();
  const files = await fs.readdir(ROOT);
  const items: any[] = [];
  for (const f of files.filter(f => f.endsWith(".json"))) {
    const raw = await fs.readFile(path.join(ROOT, f), "utf8");
    const j = JSON.parse(raw);
    items.push({
      id: j.id,
      title: j.title,
      totalDurationMin: j.totalDurationMin,
      age: j.age,
      phase: j.phase,
      zone: j.zone,
      updatedAt: j.updatedAt,
    });
  }
  return items;
}

export async function getSession(id: string): Promise<SessionPlan | null> {
  try {
    const raw = await fs.readFile(fileOf(id), "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function saveSession(data: SaveSessionInput): Promise<SessionPlan> {
  await ensureDir();
  const id = randomUUID();
  const plan = {
    ...data,
    id,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(fileOf(id), JSON.stringify(plan, null, 2), "utf8");
  return plan;
}

export async function removeSession(id: string): Promise<boolean> {
  try {
    await fs.unlink(fileOf(id));
    return true;
  } catch {
    return false;
  }
}

export async function appendReflection(sessionId: string, reflection: Reflection): Promise<SessionPlan | null> {
  const s = await getSession(sessionId);
  if (!s) return null;
  const updated: SessionPlan = {
    ...s,
    reflections: [...(s.reflections ?? []), reflection],
    updatedAt: new Date().toISOString(),
  };
  await fs.writeFile(fileOf(sessionId), JSON.stringify(updated, null, 2), "utf8");
  return updated;
}
