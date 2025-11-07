import { NextResponse } from "next/server";
import { slugify } from "@/lib/slug";
import { saveDrill } from "@/lib/drills/drillStore";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const drill = body?.drill;
    if (!drill || typeof drill !== "object") {
      return NextResponse.json({ ok: false, error: 'Missing "drill" object' }, { status: 400 });
    }
    const title = String(drill.title ?? "").trim();
    const slug  = drill.slug || (title ? slugify(title) : `untitled-${Date.now()}`);

    const saved = await saveDrill({ ...drill, slug });
    return NextResponse.json({ ok: true, id: saved.slug, drill: saved });
  } catch (err: any) {
    console.error("POST /api/drills failed:", err);
    return NextResponse.json({ ok: false, error: err?.message || "Internal error" }, { status: 500 });
  }
}
