import { z } from "zod";

// Minimal drill reference used inside plan segments
export const PlanDrillRef = z.object({
  id: z.string(),
  title: z.string(),
  objective: z.string().optional(),
});

export const PlanSegment = z.object({
  title: z.string(),
  durationMin: z.number().int().positive(),
  drill: PlanDrillRef.optional(),
  principleIds: z.array(z.string()).optional(),
  psychThemeIds: z.array(z.string()).optional(),
});

export const PlanSchema = z.object({
  rationale: z.string().min(4),
  totalDurationMin: z.number().int().positive(),
  segments: z.array(PlanSegment).min(1),
});

export type Plan = z.infer<typeof PlanSchema>;
