import { promises as fs } from "fs";
import path from "path";
import crypto from "node:crypto";
import { slugify } from "@/lib/slug";

const ROOT = path.join(process.cwd(), "apps", "web", "data", "sessions");

async function ensureDir() {
  await fs.mkdir(ROOT, { recursive: true });
}

function fileOf(id: string) {
  return path.join(ROOT, `${id}.json`);
}

export type SessionPlan = {
  id: string;
  slug: string;
  title: string;
  plan: any;                 // the full plan object you show in the UI
  savedAt: string;           // ISO timestamp
};

export async function saveSession(input: { title?: string; session: any }): Promise<SessionPlan> {
  await ensureDir();

  const rawPlan = input?.session?.plan ?? input?.session ?? {};
  const title = String(input?.title ?? rawPlan?.title ?? "Untitled Session").trim();
  if (!title) throw new Error("Missing field: title");

  const id = rawPlan?.id || crypto.randomUUID();
  const slug = slugify(title);

  const record: SessionPlan = {
    id,
    slug,
    title,
    plan: rawPlan,
    savedAt: new Date().toISOString(),
  };

  await fs.writeFile(fileOf(id), JSON.stringify(record, null, 2), "utf8");
  return record;
}
