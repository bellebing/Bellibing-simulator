import type { StatRoll, UpgradeEconomics } from './domain.ts';
import {
  compareContinueVsRestart,
  type PathComparison,
  type PathDecision,
} from './pathComparison.ts';

export interface NextRollForecast {
  nextRoll: StatRoll;
  /** Expected upgrade economics after seeing this roll and continuing the same Echo. */
  continuePath: UpgradeEconomics;
  /** Expected upgrade economics if the Echo is discarded at that checkpoint and farming restarts. */
  restartPath: UpgradeEconomics;
}

export interface NextRollOutcomeAdvice {
  nextRoll: StatRoll;
  decision: PathDecision;
  reasons: string[];
}

export interface NextRollAdvice {
  continueOn: NextRollOutcomeAdvice[];
  discardOn: NextRollOutcomeAdvice[];
  tradeoffOn: NextRollOutcomeAdvice[];
  pendingOn: NextRollOutcomeAdvice[];
}

function adviseOne(forecast: NextRollForecast): NextRollOutcomeAdvice {
  const comparison: PathComparison = compareContinueVsRestart(
    forecast.continuePath,
    forecast.restartPath,
  );
  return {
    nextRoll: forecast.nextRoll,
    decision: comparison.decision,
    reasons: comparison.reasons,
  };
}

/**
 * Converts branch-specific future economics into the practical checkpoint answer:
 * "If the next roll is X, keep going; if it is Y, dump it."
 *
 * Crucially, stat names themselves have no built-in good/bad class. A HP roll may land in
 * `continueOn` for an HP-scaling character if the combat/economy forecast says so.
 */
export function buildNextRollAdvice(forecasts: NextRollForecast[]): NextRollAdvice {
  const result: NextRollAdvice = {
    continueOn: [],
    discardOn: [],
    tradeoffOn: [],
    pendingOn: [],
  };

  for (const forecast of forecasts) {
    const advice = adviseOne(forecast);
    switch (advice.decision) {
      case 'CONTINUE_DOMINATES':
        result.continueOn.push(advice);
        break;
      case 'RESTART_DOMINATES':
        result.discardOn.push(advice);
        break;
      case 'TRADEOFF':
        result.tradeoffOn.push(advice);
        break;
      case 'INSUFFICIENT_DATA':
        result.pendingOn.push(advice);
        break;
    }
  }

  return result;
}
