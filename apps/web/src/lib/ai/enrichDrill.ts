export async function enrichDrill(
  drill: any,
  ctx: { phase: string; zone: string; age: string; modelName: string }
) {
  const base = drill || {};
  const mi = base.modelInfluence || {};

  const defaults = {
    modelName: ctx.modelName,
    principlesApplied: mi.principlesApplied ?? ["compactness","delay","cover"],
    tacticalCues: mi.tacticalCues ?? [
      "Nearest presses, second covers, third balances",
      "Show outside when possible",
      "Recover behind the ball on loss",
    ],
    unitFocus: mi.unitFocus ?? (ctx.zone.includes("DEFENSIVE") ? "Back line + DM" : "Unit"),
    intensityProfile: mi.intensityProfile ?? "moderate",
    scoringBias: mi.scoringBias ?? "Defensive success: force wide, block, regain",
    constraintsToApply: mi.constraintsToApply ?? [
      "Touch limit for attackers",
      "Bonus if defending team forces play wide",
      "Regain within 6s = extra point",
    ],
    coachingLanguage: mi.coachingLanguage ?? ["Delay","Cover","Compact","Show wide"],
  };

  return { ...base, modelInfluence: defaults };
}
