import type { Echo, EchoCost, EchoLevel, StatName, StatRoll } from './echoCoreDomain.ts';
import type { Provenance } from './provenance.ts';

export type PrimaryMainStatName =
  | 'HP%'
  | 'ATK%'
  | 'DEF%'
  | 'Energy Regen'
  | 'Aero DMG'
  | 'Glacio DMG'
  | 'Fusion DMG'
  | 'Electro DMG'
  | 'Havoc DMG'
  | 'Spectro DMG'
  | 'CRIT Rate'
  | 'CRIT DMG'
  | 'Healing Bonus';

export interface Rank5MainStatProfile {
  name: PrimaryMainStatName;
  /** Exact internal ratio at +0, not a one-decimal guide/UI rendering. */
  atLevel0: number;
  /** Exact internal ratio at +25. */
  atLevel25: number;
}

export interface Rank5SecondaryMainStatProfile {
  name: 'Flat HP' | 'Flat ATK';
  atLevel0: number;
  atLevel25: number;
}

/**
 * Raw PhantomGrowth GrowthId=1 values at the six Rank-5 tuning checkpoints.
 * Game formula: floor(StandardProperty * GrowthValue / 10000).
 */
export const RANK5_MAIN_STAT_GROWTH: Readonly<Record<EchoLevel, number>> = {
  0: 10000,
  5: 18000,
  10: 26000,
  15: 34000,
  20: 42000,
  25: 50000,
} as const;

const elementMainStats: readonly Rank5MainStatProfile[] = [
  { name: 'Aero DMG', atLevel0: 0.06, atLevel25: 0.30 },
  { name: 'Glacio DMG', atLevel0: 0.06, atLevel25: 0.30 },
  { name: 'Fusion DMG', atLevel0: 0.06, atLevel25: 0.30 },
  { name: 'Electro DMG', atLevel0: 0.06, atLevel25: 0.30 },
  { name: 'Havoc DMG', atLevel0: 0.06, atLevel25: 0.30 },
  { name: 'Spectro DMG', atLevel0: 0.06, atLevel25: 0.30 },
] as const;

/**
 * Rank-5 primary StandardProperty values represented as exact ratios.
 *
 * A few older guide tables round/truncate these values for display. The raw
 * game data is more precise: e.g. 1-cost HP% starts at 4.56%, 4-cost DEF at
 * 8.36% and Healing Bonus at 5.28%. Using the raw ratios also resolves the
 * corresponding +25 values to 22.8%, 41.8% and 26.4% respectively.
 */
export const RANK5_PRIMARY_MAIN_STATS: Readonly<Record<EchoCost, readonly Rank5MainStatProfile[]>> = {
  1: [
    { name: 'HP%', atLevel0: 0.0456, atLevel25: 0.228 },
    { name: 'ATK%', atLevel0: 0.036, atLevel25: 0.18 },
    { name: 'DEF%', atLevel0: 0.036, atLevel25: 0.18 },
  ],
  3: [
    { name: 'HP%', atLevel0: 0.06, atLevel25: 0.30 },
    { name: 'ATK%', atLevel0: 0.06, atLevel25: 0.30 },
    { name: 'DEF%', atLevel0: 0.076, atLevel25: 0.38 },
    { name: 'Energy Regen', atLevel0: 0.064, atLevel25: 0.32 },
    ...elementMainStats,
  ],
  4: [
    { name: 'HP%', atLevel0: 0.066, atLevel25: 0.33 },
    { name: 'ATK%', atLevel0: 0.066, atLevel25: 0.33 },
    { name: 'DEF%', atLevel0: 0.0836, atLevel25: 0.418 },
    { name: 'CRIT Rate', atLevel0: 0.044, atLevel25: 0.22 },
    { name: 'CRIT DMG', atLevel0: 0.088, atLevel25: 0.44 },
    { name: 'Healing Bonus', atLevel0: 0.0528, atLevel25: 0.264 },
  ],
} as const;

export const RANK5_SECONDARY_MAIN_STATS: Readonly<Record<EchoCost, Rank5SecondaryMainStatProfile>> = {
  1: { name: 'Flat HP', atLevel0: 456, atLevel25: 2280 },
  3: { name: 'Flat ATK', atLevel0: 20, atLevel25: 100 },
  4: { name: 'Flat ATK', atLevel0: 30, atLevel25: 150 },
} as const;

export const ECHO_MAIN_STAT_PROVENANCE: Provenance<string> = {
  value: 'Rank-5 cost-bound main-stat pools plus exact GrowthId=1 level progression',
  status: 'VERIFIED_EXTERNAL',
  sources: [
    {
      kind: 'RAW_DATABASE',
      label: 'Dimbreath/WutheringData — PhantomMainProperty / PhantomMainPropItem / PhantomGrowth',
      locator: 'https://github.com/Dimbreath/WutheringData/tree/master/ConfigDB',
      checkedAt: '2026-08-25',
    },
    {
      kind: 'RAW_DATABASE',
      label: 'Arikatsu/WutheringWaves_Data 3.6 — phantom main props / growth',
      locator: 'https://github.com/Arikatsu/WutheringWaves_Data/tree/3.6/BinData/phantom',
      checkedAt: '2026-08-25',
    },
    {
      kind: 'RAW_DATABASE',
      label: 'zigrika — EchoInfo mainPropValue implementation',
      locator: 'https://github.com/hcl-vp/zigrika/blob/master/gamesv/src/fs/EchoInfo.zig',
      checkedAt: '2026-08-25',
    },
    {
      kind: 'GUIDE',
      label: 'Prydwen — Echo Stats endpoint sanity check',
      locator: 'https://www.prydwen.gg/wuthering-waves/guides/echo-stats',
      checkedAt: '2026-08-25',
    },
  ],
  notes: [
    'Two independent 3.6 datamined tables agree on the Rank-5 StandardProperty values and GrowthId=1 curve.',
    'The source-backed runtime formula is integer truncation: floor(StandardProperty * GrowthValue / 10000).',
    'Checkpoint GrowthValue is 10000/18000/26000/34000/42000/50000 at +0/+5/+10/+15/+20/+25.',
    'Percent/ratio main stats use the raw internal value divided by 10000 in Bellibing calculations; flat secondary main stats remain integer values.',
    'Guide tables remain useful for pool/end-point sanity checks but may round display values. Raw game values override those rounded displays for calculation truth.',
    'Exact random acquisition weights for primary main stats remain a separate unresolved acquisition-model question and are not inferred from these tables.',
  ],
};

function scaledRawMainProperty(standardProperty: number, level: EchoLevel): number {
  return Math.trunc((standardProperty * RANK5_MAIN_STAT_GROWTH[level]) / 10000);
}

export function primaryMainStatProfile(
  cost: EchoCost,
  name: StatName,
): Rank5MainStatProfile | null {
  return RANK5_PRIMARY_MAIN_STATS[cost].find((profile) => profile.name === name) ?? null;
}

export function isPrimaryMainStatAllowed(cost: EchoCost, name: StatName): boolean {
  return primaryMainStatProfile(cost, name) !== null;
}

/** Exact internal ratio for a Rank-5 primary main stat at a modeled checkpoint. */
export function primaryMainStatValueAtLevel(
  cost: EchoCost,
  name: StatName,
  level: EchoLevel,
): number | null {
  const profile = primaryMainStatProfile(cost, name);
  if (!profile) return null;
  const standardProperty = Math.round(profile.atLevel0 * 10000);
  return scaledRawMainProperty(standardProperty, level) / 10000;
}

/** Exact flat secondary-main value for Rank-5 Echoes at a modeled checkpoint. */
export function secondaryMainStatValueAtLevel(cost: EchoCost, level: EchoLevel): number {
  const profile = RANK5_SECONDARY_MAIN_STATS[cost];
  return scaledRawMainProperty(profile.atLevel0, level);
}

/**
 * Apply source-backed Rank-5 main-stat progression without touching rolled
 * substats or any character/build state. Legacy/non-Rank-5 fixtures are left
 * numerically unchanged while their requested level is preserved.
 */
export function withRank5MainStatsAtLevel(echo: Echo, level: EchoLevel): Echo {
  if (echo.rank !== 5) return { ...echo, level };

  const primaryValue = primaryMainStatValueAtLevel(echo.cost, echo.mainStat.name, level);
  if (primaryValue === null) return { ...echo, level };

  const secondary = RANK5_SECONDARY_MAIN_STATS[echo.cost];
  return {
    ...echo,
    level,
    mainStat: { name: echo.mainStat.name, value: primaryValue },
    secondaryMainStat: {
      name: secondary.name,
      value: secondaryMainStatValueAtLevel(echo.cost, level),
    },
  };
}

export function createRank5EchoAtLevel0(input: {
  id: string;
  cost: EchoCost;
  primaryMainStat: PrimaryMainStatName;
}): Echo {
  const primary = primaryMainStatProfile(input.cost, input.primaryMainStat);
  if (!primary) {
    throw new RangeError(`${input.primaryMainStat} is not a valid ${input.cost}-cost primary main stat.`);
  }

  const secondary = RANK5_SECONDARY_MAIN_STATS[input.cost];
  const mainStat: StatRoll = { name: primary.name, value: primary.atLevel0 };
  const secondaryMainStat: StatRoll = { name: secondary.name, value: secondary.atLevel0 };

  return {
    id: input.id,
    rank: 5,
    cost: input.cost,
    mainStat,
    secondaryMainStat,
    level: 0,
    substats: [],
  };
}
