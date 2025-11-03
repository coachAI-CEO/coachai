import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await fetch(`${process.env.OPENROUTER_BASE_URL}/models`, {
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "CoachAI",
      },
    });

    const data = await res.json();

    return NextResponse.json({
      ok: res.ok,
      status: res.status,
      count: Array.isArray(data.data) ? data.data.length : 0,
      sample: data.data ? data.data[0] : data.error,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
