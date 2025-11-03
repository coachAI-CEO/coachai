import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    // query params
    const phase = searchParams.get('phase')?.toUpperCase() || undefined
    const zone  = searchParams.get('zone')?.toUpperCase()  || undefined
    const age   = searchParams.get('age')?.toUpperCase()   || undefined
    const q     = searchParams.get('search')?.trim() || undefined

    // pagination
    const take = Math.min(Number(searchParams.get('take') ?? 50), 100)
    const skip = Number(searchParams.get('skip') ?? 0)

    // where clause
    const where: any = {}
    if (phase) where.phase = phase
    if (zone)  where.zone  = zone
    if (age)   where.ageBands = { has: age }
    if (q) {
      where.OR = [
        { title:     { contains: q, mode: 'insensitive' } },
        { objective: { contains: q, mode: 'insensitive' } },
        { tags:       { has: q } },
        { categories: { has: q } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.drill.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        take,
        skip,
        select: {
          id: true, title: true, objective: true, phase: true, zone: true,
          ageBands: true, categories: true, durationMin: true,
          playersMin: true, playersMax: true, tags: true, updatedAt: true,
        },
      }),
      prisma.drill.count({ where }),
    ])

    return NextResponse.json({ items, total, take, skip })
  } catch (e) {
    console.error('GET /api/drills error:', e)
    return NextResponse.json({ error: 'Failed to load drills' }, { status: 500 })
  }
}
