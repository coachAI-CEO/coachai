import { z } from "zod";
import type { Drill } from "@/types/drill";

/** Zod schema for drills including AI-added fields */
export const DrillSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  objective: z.string(),
  phase: z.enum(["DEFENDING", "ATTACKING", "TRANSITION"]),
  zone: z.enum(["DEFENSIVE_THIRD", "MIDDLE_THIRD", "ATTACKING_THIRD"]),
  ageBands: z.array(z.string()).default([]),
  categories: z.array(z.string()).default([]),
  durationMin: z.number().int(),
  playersMin: z.number().int(),
  playersMax: z.number().int(),

  equipment: z.string().optional().nullable(),
  setup: z.string().optional().nullable(),
  constraints: z.string().optional().nullable(),
  progression: z.string().optional().nullable(),

  coachingPts: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  diagram: z.any().optional().nullable(),

  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),

  // AI/GK fields
  goalsAvailable: z.number().int().min(0).max(2).optional(),
  needGKFocus: z.boolean().optional(),
  gkFocus: z.string().optional().nullable(),
});

/** Parse + normalize into your Drill type */
export function validateDrillJson(input: any): Drill {
  const parsed = DrillSchema.parse(input) as any;

  // id fallback from title
  if (!parsed.id) {
    const base = (parsed.title || "drill").toString().toLowerCase();
    parsed.id = base.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 64);
  }

  // timestamps
  const now = new Date().toISOString();
  if (!parsed.createdAt) parsed.createdAt = now;
  if (!parsed.updatedAt) parsed.updatedAt = now;

  return parsed as Drill;
}

/** Ensure GK text present if flagged */
export function ensureGKFocus(d: Drill): Drill {
  const anyD = d as any;
  if (anyD.needGKFocus && !anyD.gkFocus) {
    anyD.gkFocus = "GK: organize back line, cue compactness/delay, sweep depth, manage through balls.";
  }
  return d;
}
