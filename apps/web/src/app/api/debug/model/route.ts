import { NextResponse } from "next/server";
import { loadGameModel, listAvailableModels } from "@/lib/game-models";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = (searchParams.get("id") || "COACHAI").toUpperCase();
  try {
    const model = await loadGameModel(id);
    const list = await listAvailableModels();
    return NextResponse.json({ 
      loaded: model.id, 
      name: model.name, 
      available: list 
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "failed" }, { status: 500 });
  }
}
