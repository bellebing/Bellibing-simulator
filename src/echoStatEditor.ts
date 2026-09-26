import {
  RANK5_PRIMARY_MAIN_STATS,
  RANK5_SECONDARY_MAIN_STATS,
  SUBSTAT_TYPES,
  SUBSTAT_VALUE_TABLE,
  assertExactRank5SubstatRoll,
  isPrimaryMainStatAllowed,
  primaryMainStatValueAtLevel,
  secondaryMainStatValueAtLevel,
  type EchoCost,
  type PrimaryMainStatName,
  type StatRoll,
} from './echoCore.ts';

export const ECHO_STATS_EDITOR_RANK = 5 as const;
export const ECHO_STATS_EDITOR_LEVEL = 25 as const;
export const ECHO_STATS_EDITOR_MAX_SUBSTATS = 5 as const;

export interface EchoStatsEditorSelection {
  readonly cost: EchoCost;
  readonly mainStat: StatRoll;
  readonly secondaryMainStat: StatRoll;
  readonly substats: readonly StatRoll[];
}

export interface EchoStatsEditorMainStatOption {
  readonly name: PrimaryMainStatName;
  readonly value: number;
}

export interface EchoStatsEditorSubstatOption {
  readonly name: string;
  readonly values: readonly number[];
}

const exact = (a: number, b: number) => Number.isFinite(a) && Math.abs(a - b) <= 1e-12;

export function listEchoStatsEditorMainStatOptions(cost: EchoCost): readonly EchoStatsEditorMainStatOption[] {
  return RANK5_PRIMARY_MAIN_STATS[cost].map((profile) => {
    const value = primaryMainStatValueAtLevel(cost, profile.name, ECHO_STATS_EDITOR_LEVEL);
    if (value === null) throw new Error(`Missing Rank-5 +25 primary main-stat value for ${cost}-cost ${profile.name}.`);
    return { name: profile.name, value };
  });
}

export function getEchoStatsEditorSecondaryMainStat(cost: EchoCost): StatRoll {
  const profile = RANK5_SECONDARY_MAIN_STATS[cost];
  return {
    name: profile.name,
    value: secondaryMainStatValueAtLevel(cost, ECHO_STATS_EDITOR_LEVEL),
  };
}

export function listEchoStatsEditorSubstatOptions(): readonly EchoStatsEditorSubstatOption[] {
  return SUBSTAT_TYPES.map((name) => ({
    name,
    values: [...(SUBSTAT_VALUE_TABLE[name] ?? [])],
  }));
}

export function createEchoStatsEditorSelection(
  cost: EchoCost,
  primaryMainStat?: PrimaryMainStatName,
): EchoStatsEditorSelection {
  const options = listEchoStatsEditorMainStatOptions(cost);
  const selected = primaryMainStat
    ? options.find((option) => option.name === primaryMainStat)
    : options[0];
  if (!selected || !isPrimaryMainStatAllowed(cost, selected.name)) {
    throw new RangeError(`${primaryMainStat ?? 'Missing primary main stat'} is not valid for ${cost}-cost Echoes.`);
  }
  return {
    cost,
    mainStat: { ...selected },
    secondaryMainStat: getEchoStatsEditorSecondaryMainStat(cost),
    substats: [],
  };
}

export function assertEchoStatsEditorSelection(selection: EchoStatsEditorSelection): void {
  if (![1, 3, 4].includes(selection.cost)) throw new RangeError(`Unsupported Echo cost: ${selection.cost}.`);

  const expectedPrimary = primaryMainStatValueAtLevel(
    selection.cost,
    selection.mainStat.name,
    ECHO_STATS_EDITOR_LEVEL,
  );
  if (expectedPrimary === null || !exact(selection.mainStat.value, expectedPrimary)) {
    throw new RangeError(`Invalid ${selection.cost}-cost primary main stat: ${selection.mainStat.name}.`);
  }

  const expectedSecondary = getEchoStatsEditorSecondaryMainStat(selection.cost);
  if (
    selection.secondaryMainStat.name !== expectedSecondary.name
    || !exact(selection.secondaryMainStat.value, expectedSecondary.value)
  ) {
    throw new RangeError(`Invalid automatic secondary main stat for ${selection.cost}-cost Echo.`);
  }

  if (!Array.isArray(selection.substats) || selection.substats.length > ECHO_STATS_EDITOR_MAX_SUBSTATS) {
    throw new RangeError(`Echo Stats Editor supports at most ${ECHO_STATS_EDITOR_MAX_SUBSTATS} substats.`);
  }

  const names = new Set<string>();
  for (const roll of selection.substats) {
    if (names.has(roll.name)) throw new RangeError(`Duplicate Echo substat: ${roll.name}.`);
    assertExactRank5SubstatRoll(roll);
    names.add(roll.name);
  }
}
