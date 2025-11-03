import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const base = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
  const key  = process.env.OPENROUTER_API_KEY || "";
  const model = process.env.PLAN_MODEL || "anthropic/claude-3.5-sonnet";

  const body = {
    model,
    messages: [
      { role: "system", content: "You are a test router." },
      { role: "user", content: "Reply with a tiny JSON object {\"ok\":true}" }
    ],
    // keep it simple
    temperature: 0.2,
    max_tokens: 64
  };

  try {
    const res = await fetch(`${base}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${key}`,
        "Content-Type": "application/json",
        // These two help OpenRouter associate your app (recommended)
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "CoachAI"
      },
      body: JSON.stringify(body)
    });

    const text = await res.text();
    return NextResponse.json({ ok: res.ok, status: res.status, text });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}
