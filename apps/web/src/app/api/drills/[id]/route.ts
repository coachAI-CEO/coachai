import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: Request, ctx: { params?: { id?: string } }) {
  // Debug to verify what Next passes
  console.log('DRILLS [id] ctx.params =', ctx?.params, 'url=', req.url);

  // Fallback: extract id from the URL path if params are missing
  const url = new URL(req.url);
  const parts = url.pathname.split('/').filter(Boolean);
  const last = parts[parts.length - 1];
  const idFromPath = last ? decodeURIComponent(last) : undefined;

  const id = ctx?.params?.id ?? idFromPath;

  if (!id) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 });
  }

  try {
    const drill = await prisma.drill.findUnique({ where: { id } });
    if (!drill) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ drill });
  } catch (e) {
    console.error('GET /api/drills/[id] error:', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
