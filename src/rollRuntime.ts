import type {
  BuildContext,
  DamageEvaluator,
  Echo,
  EchoAnalysis,
  EchoLevel,
  ResourceCost,
} from './domain.ts';
import { analyzeEchoCandidate } from './analysis.ts';

export interface RandomSource {
  next(): number;
}

export interface RollStep {
  echo: Echo;
  cost: ResourceCost;
}

/**
 * Adapter over source-backed Wuthering Waves Echo RNG/economy rules.
 * The decision engine deliberately knows nothing about roll odds or refund constants.
 */
export interface EchoRollRuntime {
  /** Create/acquire another Echo with the same slot constraints (cost/main-stat target). */
  acquireFresh(template: Echo, rng: RandomSource): RollStep;
  /** Roll exactly one new checkpoint/substat. Returns null at +25. */
  rollNext(current: Echo, rng: RandomSource): RollStep | null;
  /** Net resources recovered when abandoning this Echo at its current state. */
  refundOnDiscard(current: Echo): ResourceCost;
}

export type CheckpointDecision = 'CONTINUE' | 'DISCARD';

export interface RollDecisionContext {
  build: BuildContext;
  slot: number;
  partial: Echo;
  incumbent: Echo;
}

export interface CheckpointPolicy {
  decide(context: RollDecisionContext): CheckpointDecision;
}

export interface RollAttemptResult {
  accepted: boolean;
  finalEcho: Echo | null;
  analysis: EchoAnalysis | null;
  grossCost: ResourceCost;
  recovered: ResourceCost;
  netCost: ResourceCost;
  discardedAt: EchoLevel | null;
}

export function zeroCost(): ResourceCost {
  return { echoes: 0, tuners: 0, exp: 0 };
}

export function addCost(a: ResourceCost, b: ResourceCost): ResourceCost {
  return {
    echoes: a.echoes + b.echoes,
    tuners: a.tuners + b.tuners,
    exp: a.exp + b.exp,
  };
}

export function subtractCost(a: ResourceCost, b: ResourceCost): ResourceCost {
  return {
    echoes: a.echoes - b.echoes,
    tuners: a.tuners - b.tuners,
    exp: a.exp - b.exp,
  };
}

/**
 * Run one candidate from its present state until the policy discards it or +25 is reached.
 * At +25 the only acceptance rule is whole-build DPS + required combat gates.
 */
export function runCandidateAttempt(
  build: BuildContext,
  slot: number,
  startingEcho: Echo,
  runtime: EchoRollRuntime,
  policy: CheckpointPolicy,
  evaluator: DamageEvaluator,
  rng: RandomSource,
): RollAttemptResult {
  const incumbent = build.echoes[slot];
  if (!incumbent) throw new RangeError(`Echo slot ${slot} is outside the build.`);

  let current = startingEcho;
  let grossCost = zeroCost();

  while (current.level < 25) {
    const decision = policy.decide({ build, slot, partial: current, incumbent });
    if (decision === 'DISCARD') {
      const recovered = runtime.refundOnDiscard(current);
      return {
        accepted: false,
        finalEcho: null,
        analysis: null,
        grossCost,
        recovered,
        netCost: subtractCost(grossCost, recovered),
        discardedAt: current.level,
      };
    }

    const step = runtime.rollNext(current, rng);
    if (!step) throw new Error(`Roll runtime stopped before +25 at level ${current.level}.`);
    current = step.echo;
    grossCost = addCost(grossCost, step.cost);
  }

  const analysis = analyzeEchoCandidate(build, slot, current, evaluator);
  const accepted = analysis.verdict === 'UPGRADE';
  if (accepted) {
    return {
      accepted: true,
      finalEcho: current,
      analysis,
      grossCost,
      recovered: zeroCost(),
      netCost: grossCost,
      discardedAt: null,
    };
  }

  const recovered = runtime.refundOnDiscard(current);
  return {
    accepted: false,
    finalEcho: null,
    analysis,
    grossCost,
    recovered,
    netCost: subtractCost(grossCost, recovered),
    discardedAt: 25,
  };
}
