export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";
import { NextResponse } from "next/server";
import { generateDrill } from "@/lib/ai/generateDrill";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    
  const __playersAvailable = (typeof body?.playersAvailable === "number" && body.playersAvailable > 0)
    ? Math.floor(body.playersAvailable)
    : 10;
const keywords =
      Array.isArray(body.keywords) ? body.keywords :
      (typeof body.search === "string"
        ? body.search.split(",").map((s: string) => s.trim()).filter(Boolean)
        : []);

    const drill = await generateDrill({
      model: body.model || "COACHAI",
      phase: body.phase,
      zone: body.zone,
      age: body.age,
      playersAvailable: __playersAvailable,
      goalsAvailable: Number(body.goalsAvailable ?? 0),
      keywords,
    });

    return NextResponse.json({ ok: true, drill, playersAvailable: __playersAvailable }, { headers: { "Cache-Control": "no-store, must-revalidate" } });
  } catch (e: any) {
    console.error("[api/ai/generate-drill] error:", e?.stack || e);
    return NextResponse.json({ ok: false, error: e?.message || "failed" }, { status: 500 }, { headers: { "Cache-Control": "no-store, must-revalidate" } });
  }
}
