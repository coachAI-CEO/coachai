import { NextResponse } from "next/server";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL ?? ""}/api/vault/sessions/${encodeURIComponent(params.id)}`, {
    method: "DELETE",
    cache: "no-store",
  });
  if (!res.ok) return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  return NextResponse.redirect(new URL("/sessions", process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"));
}
