import { NextResponse } from "next/server";
import path from "node:path";
import fs from "node:fs/promises";

export const dynamic = "force-dynamic";

export async function GET() {
  const ROOT = path.join(process.cwd(), "apps", "web", "data", "sessions");
  let files: string[] = [];
  let error: string | null = null;
  try {
    files = await fs.readdir(ROOT);
  } catch (e: any) {
    error = e.message;
  }

  return NextResponse.json({
    cwd: process.cwd(),
    root: ROOT,
    files,
    error,
  });
}
