import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const teams = await prisma.team.findMany({
      include: {
        club: { select: { name: true } },
        _count: { select: { players: true, sessions: true, games: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    return NextResponse.json({ teams })
  } catch (e) {
    console.error('GET /api/teams error:', e)
    return NextResponse.json({ error: 'Failed to load teams' }, { status: 500 })
  }
}
