import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const baseURL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
  const model = process.env.PLAN_MODEL || "anthropic/claude-3.5-sonnet";

  try {
    const res = await fetch(`${baseURL}/models`, {
      method: "GET",
      headers: {
        "authorization": `Bearer ${apiKey}`,
        "http-referer": "http://localhost:3000",
        "x-title": "CoachAI"
      },
    });

    const json = await res.json();
    return NextResponse.json({ ok: res.ok, status: res.status, json });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
