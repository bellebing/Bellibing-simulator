import type { Echo, EchoCost, StatName, StatRoll } from './echoCoreDomain.ts';
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
  atLevel0: number;
  atLevel25: number;
}

export interface Rank5SecondaryMainStatProfile {
  name: 'Flat HP' | 'Flat ATK';
  atLevel0: number;
  atLevel25: number;
}

const elementMainStats: readonly Rank5MainStatProfile[] = [
  { name: 'Aero DMG', atLevel0: 0.06, atLevel25: 0.30 },
  { name: 'Glacio DMG', atLevel0: 0.06, atLevel25: 0.30 },
  { name: 'Fusion DMG', atLevel0: 0.06, atLevel25: 0.30 },
  { name: 'Electro DMG', atLevel0: 0.06, atLevel25: 0.30 },
  { name: 'Havoc DMG', atLevel0: 0.06, atLevel25: 0.30 },
  { name: 'Spectro DMG', atLevel0: 0.06, atLevel25: 0.30 },
] as const;

export const RANK5_PRIMARY_MAIN_STATS: Readonly<Record<EchoCost, readonly Rank5MainStatProfile[]>> = {
  1: [
    { name: 'HP%', atLevel0: 0.045, atLevel25: 0.228 },
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
    { name: 'DEF%', atLevel0: 0.083, atLevel25: 0.415 },
    { name: 'CRIT Rate', atLevel0: 0.044, atLevel25: 0.22 },
    { name: 'CRIT DMG', atLevel0: 0.088, atLevel25: 0.44 },
    { name: 'Healing Bonus', atLevel0: 0.052, atLevel25: 0.26 },
  ],
} as const;

export const RANK5_SECONDARY_MAIN_STATS: Readonly<Record<EchoCost, Rank5SecondaryMainStatProfile>> = {
  1: { name: 'Flat HP', atLevel0: 456, atLevel25: 2280 },
  3: { name: 'Flat ATK', atLevel0: 20, atLevel25: 100 },
  4: { name: 'Flat ATK', atLevel0: 30, atLevel25: 150 },
} as const;

export const ECHO_MAIN_STAT_PROVENANCE: Provenance<string> = {
  value: 'Rank-5 cost-bound primary main-stat pools plus fixed secondary main stats',
  status: 'VERIFIED_EXTERNAL',
  sources: [
    {
      kind: 'GUIDE',
      label: 'Prydwen — Echo Stats',
      locator: 'https://www.prydwen.gg/wuthering-waves/guides/echo-stats',
      checkedAt: '2026-08-21',
    },
    {
      kind: 'GUIDE',
      label: 'Game8 — All Echo Stats and Substats',
      locator: 'https://game8.co/games/Wuthering-Waves/archives/456278',
      checkedAt: '2026-08-21',
    },
    {
      kind: 'RAW_DATABASE',
      label: 'WutheringLab — current Echo attribute tables',
      locator: 'https://wutheringlab.com/wuthering-waves-echoes-list/',
      checkedAt: '2026-08-21',
    },
  ],
  notes: [
    'Primary-stat pools and fixed secondary-stat classes agree across the checked sources.',
    'Where published max-value tables conflict slightly, Prydwen plus the current WutheringLab table are used: 4-cost DEF 41.5% and Healing Bonus 26.0%. Game8 currently prints 41.8% / 26.4%.',
    'Exact random acquisition weights for primary main stats are not treated as verified here and are deliberately not hard-coded.',
    'Intermediate +5/+10/+15/+20 main-stat scaling is a separate pending rule; this module only locks verified +0 and +25 endpoints.',
  ],
};

export function primaryMainStatProfile(
  cost: EchoCost,
  name: StatName,
): Rank5MainStatProfile | null {
  return RANK5_PRIMARY_MAIN_STATS[cost].find((profile) => profile.name === name) ?? null;
}

export function isPrimaryMainStatAllowed(cost: EchoCost, name: StatName): boolean {
  return primaryMainStatProfile(cost, name) !== null;
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
