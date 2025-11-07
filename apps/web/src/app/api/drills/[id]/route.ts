import { NextResponse } from "next/server";
import { getDrill } from "@/lib/drills/drillStore";

// Next 16: params is a Promise in route handlers
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const last = url.pathname.split("/").filter(Boolean).pop();
  const slug = id || last;

  if (!slug) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const drill = await getDrill(slug);
  return NextResponse.json({ drill, id: slug });
}
