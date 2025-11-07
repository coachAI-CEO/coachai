import { NextResponse } from "next/server";
import { generatePlan } from "@/lib/ai/drillPlan";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const plan = await generatePlan({
      phase: "DEFENDING",
      zone: "DEFENSIVE_THIRD",
      age: "U10",
      model: "COACHAI",
      totalDurationMin: 90,
    });
    return NextResponse.json({ ok: true, plan });
  } catch (e:any) {
    return NextResponse.json({
      ok: false,
      name: e?.name,
      message: e?.message,
      stack: e?.stack,
    }, { status: 500 });
  }
}
