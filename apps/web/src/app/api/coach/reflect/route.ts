import { NextResponse } from "next/server";
import { generateReflection } from "@/lib/ai/reflect";
import { getSession, appendReflection } from "@/lib/vault/sessionVault";
import type { SessionPlan } from "@/types/session";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { sessionId, session, attachToVault } = body || {};
  let s: SessionPlan | null = null;

  if (sessionId) {
    s = await getSession(sessionId);
    if (!s) return NextResponse.json({ error: "Session not found" }, { status: 404 });
  } else if (session) {
    s = session as SessionPlan;
    if (!s?.id) return NextResponse.json({ error: "Session object must include id" }, { status: 400 });
  } else {
    return NextResponse.json({ error: "Provide sessionId or session" }, { status: 400 });
  }

  try {
    const reflection = await generateReflection(s!);
    if (attachToVault && s?.id) {
      const updated = await appendReflection(s.id, reflection);
      return NextResponse.json({ reflection, saved: Boolean(updated) });
    }
    return NextResponse.json({ reflection });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Reflection failed" }, { status: 500 });
  }
}
