import type {
  BuildContext,
  DamageEvaluator,
  EchoAnalysis,
} from './domain.ts';
import type {
  Echo,
  EchoLevel,
  EchoRollRuntime,
  RandomSource,
  ResourceCost,
  RollStep,
} from './echoCoreDomain.ts';
import { analyzeEchoCandidate } from './analysis.ts';

// Compatibility exports for callers that used the old mixed runtime module.
// New Echo-only code must import these from echoCore.ts / echoCoreDomain.ts.
export type { EchoRollRuntime, RandomSource, RollStep } from './echoCoreDomain.ts';

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
 * Character-aware integration layer. This is intentionally above Echo Core:
 * it asks the pure Echo runtime for rolls/costs, then asks a damage evaluator
 * whether the resulting Echo is an upgrade for a specific build.
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
