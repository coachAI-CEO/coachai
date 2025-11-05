import { promises as fs } from "node:fs";
import path from "node:path";

const SESSIONS_DIR = path.join(process.cwd(), "data", "sessions");

export async function getVaultSessionById(id: string) {
  const fileCandidates = [
    path.join(SESSIONS_DIR, `${id}.json`),
    path.join(SESSIONS_DIR, id, "session.json"),
  ];
  for (const p of fileCandidates) {
    try {
      const raw = await fs.readFile(p, "utf8");
      return JSON.parse(raw);
    } catch { /* try next */ }
  }
  throw new Error(`Session not found: ${id}`);
}
