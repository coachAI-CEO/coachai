import { getVaultSessionById } from "@/lib/vault";
export const dynamic = "force-dynamic";
// If your project defaults to edge, force Node for react-pdf:
export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";
import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { SessionExportPDF } from "@/pdf/SessionExportPDF";

function toMarkdown(session: any) {
  const { summary, rationale, segments = [] } = session ?? {};
  const drills = Array.isArray(segments)
    ? segments
        .map((s: any, i: number) => `**${i + 1}. ${s?.drill?.title || s?.title || "Untitled"}**`)
        .join("\n\n")
    : "";
  const md = [
    `# Session Export`,
    summary ? `\n## Summary\n${summary}` : "",
    rationale ? `\n## Rationale\n${rationale}` : "",
    drills ? `\n## Drills\n${drills}` : "",
  ].join("\n");
  return md.trim() + "\n";
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    // Support both promise + plain object shapes for Next versions
    // @ts-expect-error runtime guard
    const resolved = typeof (context.params as any).then === "function"
      ? await (context.params as Promise<{ id: string }>)
      : (context.params as { id: string });
    const id = resolved.id;

    const url = new URL(req.url);
    const fmt = (url.searchParams.get("format") ?? "json").toLowerCase();

    const session = await getVaultSessionById(id);

    // Safe, short slug for filenames
    const safeSlug = (session?.title || `session-${id}`)
      .toString()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || `session-${id}`;

    if (fmt === "json") {
      return NextResponse.json(session, {
        headers: {
          "content-disposition": `attachment; filename="${safeSlug}.json"`,
        },
      });
    }

    if (fmt === "md" || fmt === "markdown") {
      const md = toMarkdown(session);
      return new NextResponse(md, {
        status: 200,
        headers: {
          "content-type": "text/markdown; charset=utf-8",
          "content-disposition": `attachment; filename="${safeSlug}.md"`,
        },
      });
    }

    if (fmt === "pdf") {
      const element = React.createElement(SessionExportPDF, { session });
      const stream = await renderToStream(element);
      const pdfBuffer = await streamToBuffer(stream as unknown as NodeJS.ReadableStream);

      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          "content-type": "application/pdf",
          "content-disposition": `attachment; filename="${safeSlug}.pdf"`,
        },
      });
    }

    return NextResponse.json({ ok: false, error: `Unknown format: ${fmt}` }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "Server error" }, { status: 500 });
  }
}

async function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  const chunks: Buffer[] = [];
  return new Promise((resolve, reject) => {
    stream.on("data", (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    stream.on("error", reject);
    stream.on("end", () => resolve(Buffer.concat(chunks)));
  });
}
