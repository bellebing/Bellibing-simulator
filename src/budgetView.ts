import type { ResourceCost, UpgradeEconomics } from './domain.ts';

export interface ResourceBudget {
  echoes: number | null;
  tuners: number | null;
  exp: number | null;
}

export type ResourceName = keyof ResourceCost;

export interface BudgetPressure {
  maxFractionOfBudget: number | null;
  limitingResource: ResourceName | null;
  fractions: Partial<Record<ResourceName, number>>;
}

/**
 * Descriptive budget view only. It does not turn different resources into a made-up currency.
 * Each cost is divided by the user's available amount and the highest fraction identifies
 * the practical bottleneck, mirroring V9.15's dynamic-limiter idea.
 */
export function calculateBudgetPressure(
  economics: UpgradeEconomics,
  budget: ResourceBudget,
): BudgetPressure {
  const cost = economics.expectedCostToSuccess;
  if (!cost) {
    return { maxFractionOfBudget: null, limitingResource: null, fractions: {} };
  }

  const fractions: Partial<Record<ResourceName, number>> = {};
  for (const resource of ['echoes', 'tuners', 'exp'] as const) {
    const available = budget[resource];
    if (available !== null && Number.isFinite(available) && available > 0) {
      fractions[resource] = cost[resource] / available;
    }
  }

  const entries = Object.entries(fractions) as Array<[ResourceName, number]>;
  if (entries.length === 0) {
    return { maxFractionOfBudget: null, limitingResource: null, fractions };
  }

  entries.sort((a, b) => b[1] - a[1]);
  return {
    maxFractionOfBudget: entries[0]![1],
    limitingResource: entries[0]![0],
    fractions,
  };
}
