import type { UpgradeEconomics } from './domain.ts';

export type PathDecision =
  | 'CONTINUE_DOMINATES'
  | 'RESTART_DOMINATES'
  | 'TRADEOFF'
  | 'INSUFFICIENT_DATA';

export interface PathComparison {
  decision: PathDecision;
  reasons: string[];
}

function comparable(a: number | null, b: number | null): a is number {
  return a !== null && b !== null && Number.isFinite(a) && Number.isFinite(b);
}

/**
 * Pareto comparison only. It deliberately does not invent exchange rates between
 * Echoes, Tuners and EXP. A later policy/budget layer resolves genuine tradeoffs.
 */
export function compareContinueVsRestart(
  continuation: UpgradeEconomics,
  restart: UpgradeEconomics,
): PathComparison {
  const cc = continuation.expectedCostToSuccess;
  const rc = restart.expectedCostToSuccess;
  const cg = continuation.expectedDpsGainOnSuccess;
  const rg = restart.expectedDpsGainOnSuccess;

  if (!cc || !rc || !comparable(cg, rg)) {
    return {
      decision: 'INSUFFICIENT_DATA',
      reasons: ['A successful-path cost/gain estimate is missing for one of the options.'],
    };
  }

  const continueBetterOrEqual =
    continuation.successProbability >= restart.successProbability &&
    cc.echoes <= rc.echoes &&
    cc.tuners <= rc.tuners &&
    cc.exp <= rc.exp &&
    cg >= rg;

  const restartBetterOrEqual =
    restart.successProbability >= continuation.successProbability &&
    rc.echoes <= cc.echoes &&
    rc.tuners <= cc.tuners &&
    rc.exp <= cc.exp &&
    rg >= cg;

  const continueStrict =
    continuation.successProbability > restart.successProbability ||
    cc.echoes < rc.echoes ||
    cc.tuners < rc.tuners ||
    cc.exp < rc.exp ||
    cg > rg;

  const restartStrict =
    restart.successProbability > continuation.successProbability ||
    rc.echoes < cc.echoes ||
    rc.tuners < cc.tuners ||
    rc.exp < cc.exp ||
    rg > cg;

  if (continueBetterOrEqual && continueStrict) {
    return {
      decision: 'CONTINUE_DOMINATES',
      reasons: [
        'Continuing is at least as good on upgrade chance and successful DPS gain while costing no more of any tracked resource.',
      ],
    };
  }

  if (restartBetterOrEqual && restartStrict) {
    return {
      decision: 'RESTART_DOMINATES',
      reasons: [
        'Restarting is at least as good on upgrade chance and successful DPS gain while costing no more of any tracked resource.',
      ],
    };
  }

  return {
    decision: 'TRADEOFF',
    reasons: [
      'Neither path dominates. The budget/policy layer must resolve the tradeoff using the user’s actual resource constraints or a validated default policy.',
    ],
  };
}
