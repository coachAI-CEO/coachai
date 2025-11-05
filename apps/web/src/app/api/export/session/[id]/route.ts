import { getVaultSessionById } from "@/lib/vault";
export const dynamic = "force-dynamic";

import { NextResponse, type NextRequest } from "next/server";

function toMarkdown(session: any) {
  const { summary, rationale, drills = [] } = session ?? {};
  const md = [
    `# Session Export`,
    summary ? `\n## Summary\n${summary}` : "",
    rationale ? `\n## Rationale\n${rationale}` : "",
    drills.length
      ? `\n## Drills\n${drills.map((d: any, i: number) =>
          `**${i + 1}. ${d.title ?? "Untitled"}**\n${d.description ?? ""}`
        ).join("\n\n")}`
      : "",
  ].join("\n");
  return md.trim() + "\n";
}

// NOTE: In newer Next.js, context.params is a Promise — await it.
export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    // Works whether params is a Promise or plain object
    // @ts-expect-error - handle both shapes at runtime
    const resolved = typeof (context.params as any).then === "function"
      ? await (context.params as Promise<{ id: string }>)
      : (context.params as { id: string });

    const id = resolved.id;

    const url = new URL(req.url);
    const fmt = (url.searchParams.get("format") ?? "json").toLowerCase();

    const session = await getVaultSessionById(id);

    if (fmt === "json") {
      return NextResponse.json(session, {
        headers: { "content-disposition": `attachment; filename="session-${id}.json"` },
      });
    }

    if (fmt === "md" || fmt === "markdown") {
      const md = toMarkdown(session);
      return new NextResponse(md, {
        status: 200,
        headers: {
          "content-type": "text/markdown; charset=utf-8",
          "content-disposition": `attachment; filename="session-${id}.md"`,
        },
      });
    }

    if (fmt === "pdf") {
      // placeholder: same bytes as MD but with PDF headers
      const md = toMarkdown(session);
      return new NextResponse(md, {
        status: 200,
        headers: {
          "content-type": "application/pdf",
          "content-disposition": `attachment; filename="session-${id}.pdf"`,
        },
      });
    }

    return NextResponse.json({ ok: false, error: `Unknown format: ${fmt}` }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
  }
}
