import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const out = {
    NODE_VERSION: process.version,
    // Generation (Gemini)
    HAS_GEMINI_KEY: !!process.env.GEMINI_API_KEY,
    // Planner (OpenRouter / Claude)
    PLAN_PROVIDER: process.env.PLAN_PROVIDER || null,
    PLAN_MODEL: process.env.PLAN_MODEL || null,
    OPENROUTER_BASE_URL: process.env.OPENROUTER_BASE_URL || null,
    HAS_OPENROUTER_KEY: !!process.env.OPENROUTER_API_KEY,
  };
  return NextResponse.json(out);
}
