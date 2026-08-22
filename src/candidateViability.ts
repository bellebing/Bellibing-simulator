import type {
  Echo,
  EchoRollRuntime,
  RandomSource,
  ResourceCost,
} from './echoCoreDomain.ts';

export type FinalEchoStatus = 'REJECT' | 'TEMPORARY' | 'KEEP';

export interface FinalEchoAssessment {
  status: FinalEchoStatus;
  /** Optional compact explanation for a later Why? surface. */
  reason?: string;
}

export interface CandidateViabilityResult {
  trials: number;
  rejected: number;
  temporary: number;
  kept: number;
  usableProbability: number;
  keepProbability: number;
  /** Future spend from the current checkpoint to +25 only. Sunk cost is excluded. */
  averageFutureSpend: Required<ResourceCost>;
}

function withShellCredits(cost: ResourceCost): Required<ResourceCost> {
  return {
    echoes: cost.echoes,
    tuners: cost.tuners,
    exp: cost.exp,
    shellCredits: cost.shellCredits ?? 0,
  };
}

function addCost(a: ResourceCost, b: ResourceCost): Required<ResourceCost> {
  const aa = withShellCredits(a);
  const bb = withShellCredits(b);
  return {
    echoes: aa.echoes + bb.echoes,
    tuners: aa.tuners + bb.tuners,
    exp: aa.exp + bb.exp,
    shellCredits: aa.shellCredits + bb.shellCredits,
  };
}

function scaleCost(cost: ResourceCost, scalar: number): Required<ResourceCost> {
  const value = withShellCredits(cost);
  return {
    echoes: value.echoes * scalar,
    tuners: value.tuners * scalar,
    exp: value.exp * scalar,
    shellCredits: value.shellCredits * scalar,
  };
}

function cloneEcho(echo: Echo): Echo {
  return {
    ...echo,
    mainStat: { ...echo.mainStat },
    secondaryMainStat: echo.secondaryMainStat ? { ...echo.secondaryMainStat } : undefined,
    substats: echo.substats.map((stat) => ({ ...stat })),
  };
}

/**
 * Forecast the remaining RNG branches of an already-owned partial Echo.
 *
 * The final evaluator is injected. It may use exact roll values, whole-build
 * stats, ER gates or Personal Rotation DPS. This function contains no built-in
 * good/bad stat labels and never converts a stat name into a verdict by itself.
 *
 * This is deliberately a viability forecast, not yet an optimal-stopping rule:
 * it answers "what can this exact partial Echo still become if taken to +25?".
 */
export function forecastCandidateViability(input: {
  current: Echo;
  trials: number;
  runtime: EchoRollRuntime;
  rng: RandomSource;
  assessFinal: (echo: Echo) => FinalEchoAssessment;
}): CandidateViabilityResult {
  if (!Number.isInteger(input.trials) || input.trials <= 0) {
    throw new RangeError(`trials must be a positive integer, got ${input.trials}.`);
  }
  if (input.current.level >= 25) {
    throw new RangeError('Candidate viability forecast requires a partial Echo below +25.');
  }

  let rejected = 0;
  let temporary = 0;
  let kept = 0;
  let totalFutureSpend: Required<ResourceCost> = {
    echoes: 0,
    tuners: 0,
    exp: 0,
    shellCredits: 0,
  };

  for (let trial = 0; trial < input.trials; trial += 1) {
    let current = cloneEcho(input.current);
    let futureSpend: Required<ResourceCost> = {
      echoes: 0,
      tuners: 0,
      exp: 0,
      shellCredits: 0,
    };

    while (current.level < 25) {
      const step = input.runtime.rollNext(current, input.rng);
      if (!step) throw new Error(`Echo runtime stopped unexpectedly at +${current.level}.`);
      current = step.echo;
      futureSpend = addCost(futureSpend, step.cost);
    }

    totalFutureSpend = addCost(totalFutureSpend, futureSpend);
    const assessment = input.assessFinal(current);
    switch (assessment.status) {
      case 'KEEP':
        kept += 1;
        break;
      case 'TEMPORARY':
        temporary += 1;
        break;
      case 'REJECT':
        rejected += 1;
        break;
      default: {
        const neverStatus: never = assessment.status;
        throw new Error(`Unknown final Echo status: ${String(neverStatus)}`);
      }
    }
  }

  return {
    trials: input.trials,
    rejected,
    temporary,
    kept,
    usableProbability: (temporary + kept) / input.trials,
    keepProbability: kept / input.trials,
    averageFutureSpend: scaleCost(totalFutureSpend, 1 / input.trials),
  };
}
