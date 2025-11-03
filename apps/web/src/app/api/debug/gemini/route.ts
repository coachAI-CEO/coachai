import { NextResponse } from "next/server";

export async function GET() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) return NextResponse.json({ error: "No GEMINI_API_KEY" }, { status: 500 });

  try {
    const r = await fetch("https://generativelanguage.googleapis.com/v1/models?key=" + key);
    const j = await r.json();
    return NextResponse.json({ ok: r.ok, status: r.status, sample: j.models?.slice(0,3)?.map((m:any)=>m.name) ?? j });
  } catch (e:any) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
