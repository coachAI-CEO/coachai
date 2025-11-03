import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await ctx.params
    const team = await prisma.team.findUnique({
      where: { id },
      include: { club: true },
    })
    if (!team) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ team })
  } catch (e) {
    console.error('GET /api/teams/[id] error:', e)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
