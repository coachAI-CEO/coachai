import pkg from '@prisma/client'
const { PrismaClient } = pkg
const prisma = new PrismaClient()

async function createTeamWithData(clubId, name, ageBand, formation, playersData) {
  const team = await prisma.team.create({
    data: { clubId, name, ageBand, formation },
  })

  await prisma.player.createMany({
    data: playersData.map((p) => ({ ...p, teamId: team.id })),
  })

  const session = await prisma.session.create({
    data: {
      teamId: team.id,
      title: `Build-out fundamentals (${name})`,
      cycleType: 'micro',
      plan: {
        blocks: [
          { name: '4v1 Rondo', minutes: 15, objective: 'Support angles' },
          { name: '6v4 Build-up', minutes: 20, objective: 'Quick release decisions' },
        ],
      },
      psych: { cue: 'Next one', theme: 'Stay composed under pressure' },
      alignmentScore: 75,
    },
  })

  await prisma.sessionLog.create({
    data: {
      sessionId: session.id,
      execScore: 7,
      retentionScore: 8,
      behaviorScore: 8,
      notes: `Good shape, ${name} learning communication timing.`,
      playerNotes: { GK: 'Solid handling under pressure' },
    },
  })

  await prisma.game.create({
    data: {
      teamId: team.id,
      opponent: 'San Juan SC',
      date: new Date(),
      tags: ['possession_focus', 'transition_speed'],
      notes: `${name} competed well and showed progress in build-up confidence.`,
    },
  })

  console.log(`✅ Seeded team: ${name}`)
  return team
}

async function main() {
  const club = await prisma.club.create({
    data: { name: 'Roseville United' },
  })

  await createTeamWithData(club.id, 'U10 Girls White', 'U10', '2-3-1', [
    { firstName: 'Amelia', lastName: 'S.', jersey: '7', position: 'W' },
    { firstName: 'Freya', lastName: 'K.', jersey: '10', position: 'CM' },
    { firstName: 'Sadie', lastName: 'L.', jersey: '4', position: 'CB' },
    { firstName: 'Blake', lastName: 'R.', jersey: '9', position: 'ST' },
    { firstName: 'Maya', lastName: 'D.', jersey: '1', position: 'GK' },
  ])

  await createTeamWithData(club.id, 'U10 Girls Navy', 'U10', '3-2-1', [
    { firstName: 'Lily', lastName: 'P.', jersey: '8', position: 'CM' },
    { firstName: 'Ava', lastName: 'T.', jersey: '11', position: 'W' },
    { firstName: 'Harper', lastName: 'G.', jersey: '5', position: 'CB' },
    { firstName: 'Nora', lastName: 'B.', jersey: '3', position: 'LB' },
    { firstName: 'Zoey', lastName: 'M.', jersey: '1', position: 'GK' },
  ])

  console.log('🌟 Seed complete for both teams!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
