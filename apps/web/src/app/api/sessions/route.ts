import { NextResponse } from "next/server";
import { saveSession } from "@/lib/sessions/sessionStore";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = body?.title ?? body?.session?.title ?? body?.session?.plan?.title;
    const saved = await saveSession({ title, session: body?.session });
    return NextResponse.json({ ok: true, id: saved.id, session: saved });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || "Save failed" }, { status: 400 });
  }
}
