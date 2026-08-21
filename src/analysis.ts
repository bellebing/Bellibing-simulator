import type {
  BuildContext,
  DamageEvaluator,
  DamageResult,
  Echo,
  EchoAnalysis,
  StatRoll,
} from './domain.ts';

function replaceEcho(build: BuildContext, slot: number, echo: Echo): BuildContext {
  const echoes = build.echoes.slice();
  echoes[slot] = echo;
  return { ...build, echoes };
}

function safePct(delta: number, base: number): number | null {
  if (!Number.isFinite(base) || base <= 0) return null;
  return delta / base;
}

function removeOneSubstat(echo: Echo, index: number): Echo {
  return {
    ...echo,
    substats: echo.substats.filter((_, i) => i !== index),
  };
}

/**
 * Evaluate an owned/candidate Echo by its actual whole-build Personal Rotation DPS effect.
 * No Core/Useful/Filler score is allowed to override the damage evaluator.
 */
export function analyzeEchoCandidate(
  build: BuildContext,
  slot: number,
  candidate: Echo,
  evaluator: DamageEvaluator,
): EchoAnalysis {
  if (slot < 0 || slot >= build.echoes.length) {
    throw new RangeError(`Echo slot ${slot} is outside the build.`);
  }

  const incumbent = evaluator.evaluate(build);
  const candidateBuild = replaceEcho(build, slot, candidate);
  const candidateResult = evaluator.evaluate(candidateBuild);

  if (incumbent.erGate === 'PENDING' || candidateResult.erGate === 'PENDING') {
    return {
      slot,
      incumbent,
      candidate: candidateResult,
      dpsDelta: null,
      dpsDeltaPct: null,
      verdict: 'PENDING_MODEL',
      statContributions: [],
      reasons: ['A required combat gate is still pending; no upgrade claim is allowed.'],
    };
  }

  const delta = candidateResult.personalRotationDps - incumbent.personalRotationDps;
  const pct = safePct(delta, incumbent.personalRotationDps);

  const statContributions = candidate.substats.map((stat: StatRoll, index: number) => {
    const without = removeOneSubstat(candidate, index);
    const withoutResult: DamageResult = evaluator.evaluate(replaceEcho(build, slot, without));
    if (withoutResult.erGate !== 'PASS' || candidateResult.erGate !== 'PASS') {
      return { stat, dpsLostIfRemoved: null, dpsLostIfRemovedPct: null };
    }
    const lost = candidateResult.personalRotationDps - withoutResult.personalRotationDps;
    return {
      stat,
      dpsLostIfRemoved: lost,
      dpsLostIfRemovedPct: safePct(lost, candidateResult.personalRotationDps),
    };
  });

  if (candidateResult.erGate === 'FAIL') {
    return {
      slot,
      incumbent,
      candidate: candidateResult,
      dpsDelta: delta,
      dpsDeltaPct: pct,
      verdict: 'INVALID_ER',
      statContributions,
      reasons: [
        'Candidate is not accepted because the resulting whole build fails the locked ER gate.',
        'Raw damage gain is never allowed to hide an invalid rotation-energy state.',
      ],
    };
  }

  if (delta > 0) {
    return {
      slot,
      incumbent,
      candidate: candidateResult,
      dpsDelta: delta,
      dpsDeltaPct: pct,
      verdict: 'UPGRADE',
      statContributions,
      reasons: [
        'Candidate increases whole-build Personal Rotation DPS under the same locked combat context.',
        'Actual build impact outranks generic or visual substat rankings.',
      ],
    };
  }

  return {
    slot,
    incumbent,
    candidate: candidateResult,
    dpsDelta: delta,
    dpsDeltaPct: pct,
    verdict: 'NO_UPGRADE',
    statContributions,
    reasons: [
      'Candidate does not improve whole-build Personal Rotation DPS under the same locked combat context.',
    ],
  };
}
