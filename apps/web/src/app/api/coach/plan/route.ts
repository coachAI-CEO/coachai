import { NextResponse } from "next/server";
import { generatePlan } from "@/lib/ai/generatePlan";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: any;
  try { body = await req.json(); }
  catch { return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 }); }

  const {
    phase, zone, age,
    goalsAvailable = 0,
    principles = [],
    psychThemes = [],
    totalDurationMin,
    model
  } = body || {};

  if (!phase || !zone || !age) {
    return NextResponse.json(
      { error: "Missing required fields: phase, zone, age" },
      { status: 400 }
    );
  }

  const minutes = Number(totalDurationMin) > 0 ? Number(totalDurationMin) : 60;

  try {
    const result = await generatePlan({
      phase, zone, age,
      goalsAvailable,
      principles,
      psychThemes,
      totalDurationMin: minutes,
      model
    });
    // In dev, we may include raw for debugging
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to generate plan" },
      { status: 500 }
    );
  }
}
