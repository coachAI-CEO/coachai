import { NextResponse } from "next/server";
import { generateDrill } from "@/lib/ai/generateDrill";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { phase, zone, age, search, goalsAvailable = 0 } = body || {};
  if (!phase || !zone || !age) {
    return NextResponse.json(
      { error: "Missing required fields: phase, zone, age" },
      { status: 400 }
    );
  }

  try {
    const drill = await generateDrill({
      phase,
      zone,
      age,
      search,
      goalsAvailable,
    });
    return NextResponse.json({ drill });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || "Failed to generate drill" },
      { status: 500 }
    );
  }
}
