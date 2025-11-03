// src/types/drill.ts
// --------------------------------------
// Shared Drill type used across CoachAI
// --------------------------------------

export type Drill = {
  id: string
  title: string
  objective: string
  phase: 'DEFENDING' | 'ATTACKING' | 'TRANSITION'
  zone: 'DEFENSIVE_THIRD' | 'MIDDLE_THIRD' | 'ATTACKING_THIRD'
  ageBands: string[]
  categories: string[]
  durationMin: number
  playersMin: number
  playersMax: number
  equipment?: string | null
  setup?: string | null
  constraints?: string | null
  progression?: string | null
  coachingPts: string[]
  tags: string[]
  diagram?: any
  createdAt?: string
  updatedAt?: string
}
