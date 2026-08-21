import type { BuildContext, DamageEvaluator, DamageResult, StatRoll } from './domain.ts';

export interface OwnedEchoStatImpact {
  stat: StatRoll;
  dpsLostIfRemoved: number | null;
  dpsLostIfRemovedPct: number | null;
  erGateWithoutStat: DamageResult['erGate'];
}

export interface OwnedEchoValueAnalysis {
  slot: number;
  baseline: DamageResult;
  statImpacts: OwnedEchoStatImpact[];
}

function safePct(delta: number, base: number): number | null {
  if (!Number.isFinite(base) || base <= 0) return null;
  return delta / base;
}

/**
 * Measure the value of each substat on an already-owned Echo by removing exactly
 * that roll and re-evaluating the whole build under the same combat context.
 */
export function analyzeOwnedEchoValue(
  build: BuildContext,
  slot: number,
  evaluator: DamageEvaluator,
): OwnedEchoValueAnalysis {
  const echo = build.echoes[slot];
  if (!echo) throw new RangeError(`Echo slot ${slot} is outside the build.`);

  const baseline = evaluator.evaluate(build);
  const statImpacts = echo.substats.map((stat, index) => {
    const withoutEcho = {
      ...echo,
      substats: echo.substats.filter((_, i) => i !== index),
    };
    const echoes = build.echoes.slice();
    echoes[slot] = withoutEcho;
    const without = evaluator.evaluate({ ...build, echoes });

    if (baseline.erGate === 'PENDING' || without.erGate === 'PENDING') {
      return {
        stat,
        dpsLostIfRemoved: null,
        dpsLostIfRemovedPct: null,
        erGateWithoutStat: without.erGate,
      };
    }

    const loss = baseline.personalRotationDps - without.personalRotationDps;
    return {
      stat,
      dpsLostIfRemoved: loss,
      dpsLostIfRemovedPct: safePct(loss, baseline.personalRotationDps),
      erGateWithoutStat: without.erGate,
    };
  });

  return { slot, baseline, statImpacts };
}
