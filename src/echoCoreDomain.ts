export type StatName =
  | 'CRIT Rate'
  | 'CRIT DMG'
  | 'ATK%'
  | 'Flat ATK'
  | 'Energy Regen'
  | 'Basic Attack DMG'
  | 'Heavy Attack DMG'
  | 'Skill DMG'
  | 'Liberation DMG'
  | 'HP%'
  | 'Flat HP'
  | 'DEF%'
  | 'Flat DEF'
  | string;

export interface StatRoll {
  name: StatName;
  value: number;
}

export type EchoLevel = 0 | 5 | 10 | 15 | 20 | 25;

export interface Echo {
  id: string;
  cost: 1 | 3 | 4;
  mainStat: StatRoll;
  level: EchoLevel;
  substats: StatRoll[];
}

export interface ResourceCost {
  echoes: number;
  tuners: number;
  exp: number;
}

export interface RandomSource {
  next(): number;
}

export interface RollStep {
  echo: Echo;
  cost: ResourceCost;
}

/**
 * Pure Echo-system runtime. It must remain usable without any character,
 * weapon, team, rotation or damage model.
 */
export interface EchoRollRuntime {
  /**
   * Produce another candidate matching whatever acquisition constraints the
   * concrete runtime currently models. Acquisition provenance/coverage must be
   * visible when some drop/main-stat odds are still pending.
   */
  acquireFresh(template: Echo, rng: RandomSource): RollStep;

  /** Roll exactly one +5 checkpoint/substat. Returns null at +25. */
  rollNext(current: Echo, rng: RandomSource): RollStep | null;

  /** Effective resources recovered when this Echo is abandoned. */
  refundOnDiscard(current: Echo): ResourceCost;
}
