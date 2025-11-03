import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const drills = [
  {
    id: 'drill_low-block-2v2',
    title: '2v2 Low Block Gate Defending',
    objective: 'Delay and deny central penetration; angle body to show outside.',
    phase: 'DEFENDING',
    zone: 'DEFENSIVE_THIRD',
    ageBands: ['U9','U10'],
    categories: ['2v2','Low Block','Defending'],
    durationMin: 12,
    playersMin: 4,
    playersMax: 8,
    equipment: '10 cones, 2 mini goals, pinnies',
    setup: '10x15 yd grid with two central “gates”. 2 defenders vs 2 attackers; attackers score by dribbling through a gate.',
    constraints: 'Attackers must enter through central gates; defenders earn a point for forcing play wide or winning the ball.',
    progression: 'Add a recovering defender (2v3), reduce gate width, limit attacker touches.',
    coachingPts: [
      'Angle + distance of first defender (body half-open).',
      'Second defender tucks to protect gate (cover).',
      'Tackle on trigger (heavy touch, back to goal).'
    ],
    tags: ['defending','u10','2v2','delay','deny','press angle'],
    diagram: { grid: [10,15], gates: 2 }
  },
  {
    id: 'drill_1v1-channel-sidestep',
    title: '1v1 Channel – Sidestep & Delay',
    objective: 'Teach the first defender to slow attacker and steer to the sideline.',
    phase: 'DEFENDING',
    zone: 'DEFENSIVE_THIRD',
    ageBands: ['U8','U9','U10'],
    categories: ['1v1','Channel','Defending'],
    durationMin: 10,
    playersMin: 2,
    playersMax: 10,
    equipment: '6 cones, 1 mini goal',
    setup: '15x8 yd channel. Attacker starts with ball, attempts to dribble across end line; defender starts 2–3 yds off.',
    constraints: 'Defender must open stance and match speed; defender scores by winning ball and dribbling out.',
    progression: 'Add counter-goal for defender; add passing target; time limit for attacker.',
    coachingPts: [
      'Approach fast → slow down at 2 yards.',
      'Side-on stance; show to weaker foot / sideline.',
      'Tackle when ball is outside attacker’s feet.'
    ],
    tags: ['1v1','defending','channel','delay','body shape'],
    diagram: { channel: [15,8] }
  },
  {
    id: 'drill_3v3_pressing_triggers',
    title: '3v3 Compact Press – Triggers',
    objective: 'Recognize pressing triggers and press as a unit in our third.',
    phase: 'DEFENDING',
    zone: 'DEFENSIVE_THIRD',
    ageBands: ['U10','U11'],
    categories: ['3v3','Pressing','Compactness'],
    durationMin: 15,
    playersMin: 6,
    playersMax: 10,
    equipment: '12 cones, 2 mini goals, pinnies',
    setup: '20x18 yd. 3v3 to mini goals. Team out of possession stays compact and presses on trigger.',
    constraints: 'Press only on: poor touch, backward pass, sideline trap.',
    progression: 'Add neutral joker to overload in possession; score double for winning & scoring within 5s.',
    coachingPts: [
      'Nearest player presses; others tuck and screen.',
      'Curve run to shut passing lane.',
      'If beat, immediate recovery sprint to goal side.'
    ],
    tags: ['pressing','compact','u10','triggers'],
    diagram: { grid: [20,18] }
  }
]

async function main() {
  for (const d of drills) {
    await prisma.drill.upsert({
      where: { id: d.id },
      update: d,
      create: d,
    })
    console.log('✅ Seeded drill:', d.title)
  }
}

main().finally(() => prisma.$disconnect())
