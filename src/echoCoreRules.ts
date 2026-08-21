import type {
  EchoLevel,
  RandomSource,
  ResourceCost,
  StatName,
  StatRoll,
} from './echoCoreDomain.ts';
import type { Provenance } from './provenance.ts';

export const SUBSTAT_TYPES: readonly StatName[] = [
  'Flat HP',
  'Flat ATK',
  'Flat DEF',
  'CRIT Rate',
  'CRIT DMG',
  'Energy Regen',
  'HP%',
  'ATK%',
  'DEF%',
  'Skill DMG',
  'Basic Attack DMG',
  'Heavy Attack DMG',
  'Liberation DMG',
] as const;

const genericEightProbabilities = [
  0.067961,
  0.07767,
  0.203883,
  0.242718,
  0.174757,
  0.145631,
  0.058252,
  0.029126,
] as const;

const critEightProbabilities = [
  0.233333,
  0.233333,
  0.233333,
  0.08,
  0.08,
  0.08,
  0.03,
  0.03,
] as const;

const flatAtkProbabilities = [0.067961, 0.524272, 0.378641, 0.029126] as const;
const flatDefProbabilities = [0.145631, 0.446602, 0.320388, 0.087379] as const;

export const SUBSTAT_VALUE_TABLE: Readonly<Record<string, readonly number[]>> = {
  'Flat HP': [320, 360, 390, 430, 470, 510, 540, 580],
  'Flat ATK': [30, 40, 50, 60],
  'Flat DEF': [40, 50, 60, 70],
  'CRIT Rate': [0.063, 0.069, 0.075, 0.081, 0.087, 0.093, 0.099, 0.105],
  'CRIT DMG': [0.126, 0.138, 0.15, 0.162, 0.174, 0.186, 0.198, 0.21],
  'Energy Regen': [0.068, 0.076, 0.084, 0.092, 0.1, 0.108, 0.116, 0.124],
  'HP%': [0.064, 0.071, 0.079, 0.086, 0.094, 0.101, 0.109, 0.116],
  'ATK%': [0.064, 0.071, 0.079, 0.086, 0.094, 0.101, 0.109, 0.116],
  'DEF%': [0.081, 0.09, 0.1, 0.109, 0.118, 0.128, 0.138, 0.147],
  'Skill DMG': [0.064, 0.071, 0.079, 0.086, 0.094, 0.101, 0.109, 0.116],
  'Basic Attack DMG': [0.064, 0.071, 0.079, 0.086, 0.094, 0.101, 0.109, 0.116],
  'Heavy Attack DMG': [0.064, 0.071, 0.079, 0.086, 0.094, 0.101, 0.109, 0.116],
  'Liberation DMG': [0.064, 0.071, 0.079, 0.086, 0.094, 0.101, 0.109, 0.116],
};

export const SUBSTAT_VALUE_PROBABILITIES: Readonly<Record<string, readonly number[]>> = {
  'Flat HP': genericEightProbabilities,
  'Flat ATK': flatAtkProbabilities,
  'Flat DEF': flatDefProbabilities,
  'CRIT Rate': critEightProbabilities,
  'CRIT DMG': critEightProbabilities,
  'Energy Regen': genericEightProbabilities,
  'HP%': genericEightProbabilities,
  'ATK%': genericEightProbabilities,
  'DEF%': genericEightProbabilities,
  'Skill DMG': genericEightProbabilities,
  'Basic Attack DMG': genericEightProbabilities,
  'Heavy Attack DMG': genericEightProbabilities,
  'Liberation DMG': genericEightProbabilities,
};

export const CHECKPOINT_CUMULATIVE_COST: Readonly<Record<EchoLevel, ResourceCost>> = {
  0: { echoes: 0, tuners: 0, exp: 0 },
  5: { echoes: 0, tuners: 10, exp: 4400 },
  10: { echoes: 0, tuners: 20, exp: 16500 },
  15: { echoes: 0, tuners: 30, exp: 39600 },
  20: { echoes: 0, tuners: 40, exp: 79100 },
  25: { echoes: 0, tuners: 50, exp: 142600 },
};

export const ECHO_EXP_RECOVERY_FRACTION = 0.75;
export const TUNER_RECOVERY_FRACTION = 0.3;

export const ECHO_RNG_PROVENANCE: Provenance<string> = {
  value: '2026-07 Korean probability disclosure transcription + current range/economy cross-check',
  status: 'VERIFIED_EXTERNAL',
  sources: [
    {
      kind: 'OFFICIAL',
      label: 'Kuro Games Korean probability disclosure',
      locator: 'https://wutheringwaves.kurogames.com/p/language_ko/product_info.html',
      checkedAt: '2026-08-21',
    },
    {
      kind: 'OTHER',
      label: 'Public transcription of Kuro Echo substat probabilities',
      locator: 'https://docs.google.com/spreadsheets/d/146XGH50bYVe3MPzjVVpF5UPoSlAZffBJ1HarAeQzgb8/edit',
      checkedAt: '2026-08-21',
    },
    {
      kind: 'GUIDE',
      label: 'Prydwen Echo Stats',
      locator: 'https://www.prydwen.gg/wuthering-waves/guides/echo-stats',
      checkedAt: '2026-08-21',
    },
  ],
  notes: [
    'The official Kuro page is dynamic. Exact numeric tier probabilities are taken from the linked public transcription and are not represented as a direct scrape of the official table.',
    'Fresh Echo acquisition/main-stat probabilities remain outside this ruleset.',
  ],
};

export const ECHO_ECONOMY_PROVENANCE: Provenance<string> = {
  value: 'Rank-5 Echo checkpoint EXP/Tuner costs and effective recycle/feed recovery',
  status: 'VERIFIED_EXTERNAL',
  sources: [
    {
      kind: 'OTHER',
      label: 'Wuthering Waves Wiki — Echo Leveling',
      locator: 'https://wutheringwaves.fandom.com/wiki/Echo/Leveling',
      checkedAt: '2026-08-21',
    },
    {
      kind: 'GOOGLE_SHEET',
      label: 'Bellibing historical V7 runtime corroboration only',
      locator: 'local:Bellibing_Simulator_v7_NO_ZIP_Verified(1).gs',
      checkedAt: '2026-08-21',
    },
  ],
  notes: [
    'Current external source confirms +5/+10/+15/+20/+25 cumulative EXP and 10 Tuners per tuned slot, 75% Echo EXP recovery and 30% Tuner recovery.',
    'Shell Credit spend is not yet part of ResourceCost because V9.15 upgrade economics tracked Echoes/Tuners/EXP.',
    'Direct conversion to EXP materials can round recovered EXP; current runtime models effective 75% feed/recycle value and records rounding as a later refinement.',
  ],
};

const levels: readonly EchoLevel[] = [0, 5, 10, 15, 20, 25] as const;

export function nextCheckpoint(level: EchoLevel): EchoLevel | null {
  const index = levels.indexOf(level);
  if (index < 0 || index >= levels.length - 1) return null;
  return levels[index + 1]!;
}

export function checkpointIncrement(from: EchoLevel, to: EchoLevel): ResourceCost {
  if (nextCheckpoint(from) !== to) {
    throw new RangeError(`Expected adjacent Echo checkpoints, got ${from} -> ${to}.`);
  }
  const a = CHECKPOINT_CUMULATIVE_COST[from];
  const b = CHECKPOINT_CUMULATIVE_COST[to];
  return {
    echoes: 0,
    tuners: b.tuners - a.tuners,
    exp: b.exp - a.exp,
  };
}

export function effectiveRefundAtLevel(level: EchoLevel): ResourceCost {
  const gross = CHECKPOINT_CUMULATIVE_COST[level];
  return {
    echoes: 0,
    tuners: gross.tuners * TUNER_RECOVERY_FRACTION,
    exp: gross.exp * ECHO_EXP_RECOVERY_FRACTION,
  };
}

export function weightedIndex(probabilities: readonly number[], rng: RandomSource): number {
  if (probabilities.length === 0) throw new RangeError('Cannot draw from an empty probability table.');
  const total = probabilities.reduce((sum, value) => sum + value, 0);
  if (!(total > 0)) throw new RangeError('Probability table must have positive mass.');

  const raw = rng.next();
  if (!(raw >= 0 && raw < 1)) throw new RangeError(`RandomSource.next() must be in [0,1), got ${raw}.`);
  const target = raw * total;
  let cumulative = 0;
  for (let i = 0; i < probabilities.length; i += 1) {
    cumulative += probabilities[i]!;
    if (target < cumulative) return i;
  }
  return probabilities.length - 1;
}

export function rollSubstatValue(name: StatName, rng: RandomSource): number {
  const values = SUBSTAT_VALUE_TABLE[name];
  const probabilities = SUBSTAT_VALUE_PROBABILITIES[name];
  if (!values || !probabilities) throw new RangeError(`No verified Echo roll table for stat: ${name}`);
  if (values.length !== probabilities.length) {
    throw new Error(`Roll values/probabilities length mismatch for ${name}.`);
  }
  return values[weightedIndex(probabilities, rng)]!;
}

export function rollNewSubstat(existing: readonly StatRoll[], rng: RandomSource): StatRoll {
  const existingNames = new Set(existing.map((stat) => stat.name));
  const available = SUBSTAT_TYPES.filter((name) => !existingNames.has(name));
  if (available.length === 0) throw new RangeError('No Echo substat types remain to roll.');
  const typeIndex = Math.min(Math.floor(rng.next() * available.length), available.length - 1);
  const name = available[typeIndex]!;
  return { name, value: rollSubstatValue(name, rng) };
}
