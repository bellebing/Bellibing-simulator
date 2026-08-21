import type { ResourceCost, UpgradeEconomics } from './domain.ts';

export interface UpgradeTrial {
  /** One independent candidate attempt under the same policy/context. */
  success: boolean;
  /** Net cost of this attempt, including verified refunds on failed candidates. */
  cost: ResourceCost;
  /** Fractional whole-build DPS gain, e.g. 0.03 = +3%, when successful. */
  dpsGainPct?: number;
}

function avg(values: number[]): number | null {
  if (values.length === 0) return null;
  return values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Summarise independent candidate attempts under one fixed policy.
 *
 * Expected cost to obtain one success is E[cost per attempt] / P(success),
 * not the average cost of successful attempts. Failed Echoes consume resources too.
 * This renewal-process identity remains valid even when expensive attempts are more
 * or less likely to succeed, as long as attempts restart independently under the
 * same policy after a failure.
 */
export function summarizeUpgradeTrials(trials: UpgradeTrial[]): UpgradeEconomics {
  if (trials.length === 0) {
    return {
      successProbability: 0,
      expectedCostToSuccess: null,
      expectedDpsGainOnSuccess: null,
      tunersPerOnePercentDps: null,
    };
  }

  const successes = trials.filter((trial) => trial.success);
  const p = successes.length / trials.length;

  if (successes.length === 0) {
    return {
      successProbability: 0,
      expectedCostToSuccess: null,
      expectedDpsGainOnSuccess: null,
      tunersPerOnePercentDps: null,
    };
  }

  const hasShellCredits = trials.some((trial) => trial.cost.shellCredits !== undefined);
  const averageAttemptCost: ResourceCost = {
    echoes: avg(trials.map((t) => t.cost.echoes))!,
    tuners: avg(trials.map((t) => t.cost.tuners))!,
    exp: avg(trials.map((t) => t.cost.exp))!,
  };
  if (hasShellCredits) {
    averageAttemptCost.shellCredits = avg(trials.map((t) => t.cost.shellCredits ?? 0))!;
  }

  const expectedCostToSuccess: ResourceCost = {
    echoes: averageAttemptCost.echoes / p,
    tuners: averageAttemptCost.tuners / p,
    exp: averageAttemptCost.exp / p,
  };
  if (hasShellCredits) {
    expectedCostToSuccess.shellCredits = (averageAttemptCost.shellCredits ?? 0) / p;
  }

  const expectedDpsGainOnSuccess = avg(
    successes.map((t) => t.dpsGainPct ?? 0),
  );
  const tunersPerOnePercentDps =
    expectedDpsGainOnSuccess && expectedDpsGainOnSuccess > 0
      ? expectedCostToSuccess.tuners / (expectedDpsGainOnSuccess * 100)
      : null;

  return {
    successProbability: p,
    expectedCostToSuccess,
    expectedDpsGainOnSuccess,
    tunersPerOnePercentDps,
  };
}
