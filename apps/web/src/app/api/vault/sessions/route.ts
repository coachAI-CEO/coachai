import { NextResponse } from "next/server";
import { listSessions, saveSession } from "@/lib/vault/sessionVault";
import type { SaveSessionInput } from "@/types/session";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await listSessions();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  let body: SaveSessionInput;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  // minimal validation
  for (const k of ["title","totalDurationMin","phase","zone","age","segments"] as const) {
    if ((body as any)[k] === undefined) {
      return NextResponse.json({ error: `Missing field: ${k}` }, { status: 400 });
    }
  }

  const saved = await saveSession(body);
  return NextResponse.json({ session: saved });
}
