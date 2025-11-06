import { NextResponse } from "next/server";
import { generateDrill } from "@/lib/ai/drillDrill";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const drill = await generateDrill(body);
    return NextResponse.json({ drill, _raw: drill._raw ?? null });
  } catch (e:any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
