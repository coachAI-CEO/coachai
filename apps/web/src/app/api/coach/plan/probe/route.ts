import { NextResponse } from "next/server";
import { generatePlan } from "@/lib/ai/drillPlan"; // ✅ use the same code as real endpoint
import { loadGameModel } from "@/lib/game-models";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Sanity test: can we load the model first?
    const gm = await loadGameModel("COACHAI");

    // Then run a dry plan generation (no parse-level override)
    const plan = await generatePlan({
      phase: "DEFENDING",
      zone: "DEFENSIVE_THIRD",
      age: "U10",
      model: "COACHAI",
      totalDurationMin: 90,
    });

    // Extract diagnostics
    return NextResponse.json({
      ok: true,
      diag: {
        step: "generatePlan",
        modelId: gm.id,
        modelName: gm.name,
        summary: plan?.summary ?? null,
        segCount: plan?.segments?.length ?? 0,
        drillTitles: (plan?.segments ?? []).map((s: any) => s?.drill?.title).filter(Boolean),
      },
    });
  } catch (e: any) {
    return NextResponse.json({
      ok: false,
      diag: {
        step: "error",
        errorMessage: e?.message,
        errorStack: e?.stack,
      },
    }, { status: 500 });
  }
}
