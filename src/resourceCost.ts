import type { ResourceCost } from './echoCoreDomain.ts';

export function zeroCost(): ResourceCost {
  return { echoes: 0, tuners: 0, exp: 0 };
}

function includesShellCredits(a: ResourceCost, b: ResourceCost): boolean {
  return a.shellCredits !== undefined || b.shellCredits !== undefined;
}

export function addCost(a: ResourceCost, b: ResourceCost): ResourceCost {
  const base: ResourceCost = {
    echoes: a.echoes + b.echoes,
    tuners: a.tuners + b.tuners,
    exp: a.exp + b.exp,
  };
  if (includesShellCredits(a, b)) {
    base.shellCredits = (a.shellCredits ?? 0) + (b.shellCredits ?? 0);
  }
  return base;
}

export function subtractCost(a: ResourceCost, b: ResourceCost): ResourceCost {
  const base: ResourceCost = {
    echoes: a.echoes - b.echoes,
    tuners: a.tuners - b.tuners,
    exp: a.exp - b.exp,
  };
  if (includesShellCredits(a, b)) {
    base.shellCredits = (a.shellCredits ?? 0) - (b.shellCredits ?? 0);
  }
  return base;
}
