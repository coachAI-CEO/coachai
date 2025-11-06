import { NextResponse } from "next/server";
import { generatePlan } from "@/lib/ai/drillPlan";

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

  if (!phase || !zone || !age || !totalDurationMin) {
    return NextResponse.json(
      { error: "Missing required fields: phase, zone, age, totalDurationMin" },
      { status: 400 }
    );
  }

  try {
    const plan = await generatePlan({
      phase, zone, age,
      goalsAvailable,
      principles,
      psychThemes,
      model,
      totalDurationMin: Number(totalDurationMin)
    });
    // ⬇️ Always wrap as { plan }
    return NextResponse.json(plan);
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to generate plan" },
      { status: 500 }
    );
  }
}
