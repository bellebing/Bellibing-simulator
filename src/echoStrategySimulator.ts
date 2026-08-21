import type {
  Echo,
  EchoLevel,
  EchoRollRuntime,
  RandomSource,
  ResourceCost,
  StatName,
} from './echoCoreDomain.ts';
import type { Provenance } from './provenance.ts';

export type StrategyCheckpoint = 5 | 10 | 15 | 20;

export interface DesiredSubstatStrategy {
  /** Human-readable/stable strategy identifier for comparisons and saved presets. */
  id: string;
  /** A hit is currently name-based; roll quality thresholds are a later extension. */
  desiredStats: readonly StatName[];
  /** Minimum number of distinct desired substats required after each checkpoint. */
  minimumDesiredAtCheckpoint?: Partial<Record<StrategyCheckpoint, number>>;
  /** Minimum desired substats required on the finished +25 Echo. */
  finalMinimumDesired: number;
}

export interface EchoStrategySimulationResult {
  /**
   * Acquisition is conditional on already having an eligible +0 candidate.
   * Raw overworld/Tacet/targeted-main-stat acquisition odds are not silently invented.
   */
  scope: 'ELIGIBLE_CANDIDATE_ONLY';
  strategyId: string;
  trials: number;
  successes: number;
  successProbability: number;
  averageNetCostPerAttempt: ResourceCost;
  expectedNetCostPerSuccess: ResourceCost | null;
  discardedAt: Partial<Record<EchoLevel, number>>;
}

export const ECHO_STRATEGY_SIMULATOR_PROVENANCE: Provenance<string> = {
  value: 'Character-free checkpoint strategy simulator over verified Echo RNG/economy rules',
  status: 'MODELED',
  sources: [
    {
      kind: 'OTHER',
      label: 'Wuthering Waves Wiki — Echo Leveling strategy table',
      locator: 'https://wutheringwaves.fandom.com/wiki/Echo/Leveling',
      checkedAt: '2026-08-21',
    },
    {
      kind: 'OTHER',
      label: 'WaveTools — Echo leveling strategy reference implementation',
      locator: 'https://github.com/mcpie87/WaveTools',
      checkedAt: '2026-08-21',
    },
  ],
  notes: [
    'Bellibing does not hard-code one universal desired-stat list. The caller supplies the desired substats/policy.',
    'The simulator consumes the separate verified Echo RNG/economy runtime; its strategy outputs are modeled results.',
    'Echo count means eligible +0 candidates matching the caller template. Raw drop/main-stat acquisition probability remains outside this result until separately verified.',
  ],
};

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

function subtractCost(a: ResourceCost, b: ResourceCost): Required<ResourceCost> {
  const aa = withShellCredits(a);
  const bb = withShellCredits(b);
  return {
    echoes: aa.echoes - bb.echoes,
    tuners: aa.tuners - bb.tuners,
    exp: aa.exp - bb.exp,
    shellCredits: aa.shellCredits - bb.shellCredits,
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

function desiredCount(echo: Echo, desired: ReadonlySet<StatName>): number {
  return echo.substats.reduce((count, stat) => count + (desired.has(stat.name) ? 1 : 0), 0);
}

function validateStrategy(strategy: DesiredSubstatStrategy): Set<StatName> {
  if (!strategy.id.trim()) throw new RangeError('Strategy id cannot be empty.');
  const desired = new Set(strategy.desiredStats);
  if (desired.size === 0) throw new RangeError('A desired-substat strategy needs at least one desired stat.');
  if (desired.size !== strategy.desiredStats.length) {
    throw new RangeError('desiredStats cannot contain duplicates.');
  }
  if (
    !Number.isInteger(strategy.finalMinimumDesired) ||
    strategy.finalMinimumDesired < 1 ||
    strategy.finalMinimumDesired > Math.min(5, desired.size)
  ) {
    throw new RangeError(
      `finalMinimumDesired must be an integer between 1 and ${Math.min(5, desired.size)}.`,
    );
  }

  for (const level of [5, 10, 15, 20] as const) {
    const minimum = strategy.minimumDesiredAtCheckpoint?.[level];
    if (minimum === undefined) continue;
    const maxPossible = Math.min(level / 5, desired.size);
    if (!Number.isInteger(minimum) || minimum < 0 || minimum > maxPossible) {
      throw new RangeError(`Checkpoint +${level} minimum must be between 0 and ${maxPossible}.`);
    }
  }
  return desired;
}

/**
 * Simulate a name-based rolling policy without any character/DPS dependency.
 *
 * A trial starts from another eligible +0 candidate, pays each actual tuning
 * checkpoint, applies the caller's keep/discard gates, and applies verified
 * discard refunds. Expected cost per success uses all failed-attempt cost too.
 */
export function simulateDesiredSubstatStrategy(input: {
  template: Echo;
  strategy: DesiredSubstatStrategy;
  trials: number;
  runtime: EchoRollRuntime;
  rng: RandomSource;
}): EchoStrategySimulationResult {
  const { template, strategy, runtime, rng } = input;
  if (!Number.isInteger(input.trials) || input.trials <= 0) {
    throw new RangeError(`trials must be a positive integer, got ${input.trials}.`);
  }
  const desired = validateStrategy(strategy);

  let successes = 0;
  let totalNet: Required<ResourceCost> = { echoes: 0, tuners: 0, exp: 0, shellCredits: 0 };
  const discardedAt: Partial<Record<EchoLevel, number>> = {};

  for (let trial = 0; trial < input.trials; trial += 1) {
    const acquired = runtime.acquireFresh(template, rng);
    let current = acquired.echo;
    let gross: Required<ResourceCost> = withShellCredits(acquired.cost);
    let finished = false;

    while (current.level < 25) {
      const step = runtime.rollNext(current, rng);
      if (!step) throw new Error(`Echo runtime stopped unexpectedly at +${current.level}.`);
      current = step.echo;
      gross = addCost(gross, step.cost);

      if (current.level < 25) {
        const minimum = strategy.minimumDesiredAtCheckpoint?.[current.level as StrategyCheckpoint];
        if (minimum !== undefined && desiredCount(current, desired) < minimum) {
          const refund = runtime.refundOnDiscard(current);
          totalNet = addCost(totalNet, subtractCost(gross, refund));
          discardedAt[current.level] = (discardedAt[current.level] ?? 0) + 1;
          finished = true;
          break;
        }
      }
    }

    if (finished) continue;

    if (desiredCount(current, desired) >= strategy.finalMinimumDesired) {
      successes += 1;
      totalNet = addCost(totalNet, gross);
    } else {
      const refund = runtime.refundOnDiscard(current);
      totalNet = addCost(totalNet, subtractCost(gross, refund));
      discardedAt[25] = (discardedAt[25] ?? 0) + 1;
    }
  }

  const successProbability = successes / input.trials;
  const averageNetCostPerAttempt = scaleCost(totalNet, 1 / input.trials);
  const expectedNetCostPerSuccess =
    successes > 0 ? scaleCost(averageNetCostPerAttempt, 1 / successProbability) : null;

  return {
    scope: 'ELIGIBLE_CANDIDATE_ONLY',
    strategyId: strategy.id,
    trials: input.trials,
    successes,
    successProbability,
    averageNetCostPerAttempt,
    expectedNetCostPerSuccess,
    discardedAt,
  };
}
