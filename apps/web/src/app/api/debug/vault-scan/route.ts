import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

const ROOT = path.join(process.cwd(), "apps", "web", "data", "sessions");

export const dynamic = "force-dynamic";

export async function GET() {
  const report: any[] = [];
  try {
    const files = await fs.readdir(ROOT);
    for (const f of files.filter((x) => x.endsWith(".json"))) {
      const p = path.join(ROOT, f);
      try {
        const raw = await fs.readFile(p, "utf8");
        const json = JSON.parse(raw);
        report.push({ file: f, ok: true, keys: Object.keys(json) });
      } catch (e: any) {
        report.push({ file: f, ok: false, error: e?.message });
      }
    }
    return NextResponse.json({ root: ROOT, report });
  } catch (e: any) {
    return NextResponse.json({ root: ROOT, error: e?.message }, { status: 500 });
  }
}
