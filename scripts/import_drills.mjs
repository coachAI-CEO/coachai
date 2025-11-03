import fs from 'fs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function pickModelFields(d) {
  // Map slug -> id if needed, and pick only model fields
  const id = d.id || d.slug
  if (!id) throw new Error('Drill is missing id/slug')

  return {
    id,
    title: d.title,
    objective: d.objective,
    phase: d.phase,                 // must match enum Phase
    zone: d.zone,                   // must match enum PitchZone
    ageBands: d.ageBands ?? [],
    categories: d.categories ?? [],
    durationMin: Number(d.durationMin ?? 0),
    playersMin: Number(d.playersMin ?? 0),
    playersMax: Number(d.playersMax ?? 0),
    equipment: d.equipment ?? null,
    setup: d.setup ?? null,
    constraints: d.constraints ?? null,
    progression: d.progression ?? null,
    coachingPts: d.coachingPts ?? [],
    tags: d.tags ?? [],
    diagram: d.diagram ?? null,
    // createdAt / updatedAt handled by Prisma defaults
  }
}

async function main() {
  const file = process.argv[2]
  if (!file) {
    console.error('❌ Usage: node scripts/import_drills.mjs <file>')
    process.exit(1)
  }

  const raw = fs.readFileSync(file, 'utf8')
  const data = JSON.parse(raw)

  console.log(`📥 Importing ${data.length} drills...`)
  let count = 0

  for (const d of data) {
    const record = pickModelFields(d)
    await prisma.drill.upsert({
      where: { id: record.id },
      update: {
        // DO NOT include slug here; only model fields:
        title: record.title,
        objective: record.objective,
        phase: record.phase,
        zone: record.zone,
        ageBands: record.ageBands,
        categories: record.categories,
        durationMin: record.durationMin,
        playersMin: record.playersMin,
        playersMax: record.playersMax,
        equipment: record.equipment,
        setup: record.setup,
        constraints: record.constraints,
        progression: record.progression,
        coachingPts: record.coachingPts,
        tags: record.tags,
        diagram: record.diagram,
      },
      create: record,
    })
    count++
  }

  console.log(`✅ Imported ${count} drills successfully`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
