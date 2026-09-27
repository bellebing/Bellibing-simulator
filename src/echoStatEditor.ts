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
  type EchoLevel,
  type PrimaryMainStatName,
  type StatRoll,
} from './echoCore.ts';

export const ECHO_STATS_EDITOR_RANK = 5 as const;
export const ECHO_STATS_EDITOR_LEVELS: readonly EchoLevel[] = [0, 5, 10, 15, 20, 25] as const;
export const ECHO_STATS_EDITOR_MAX_SUBSTATS = 5 as const;

export interface EchoStatsEditorSelection {
  readonly cost: EchoCost;
  readonly level: EchoLevel;
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

export function echoStatsEditorLevelForCompleteSubstats(completeSubstatCount: number): EchoLevel {
  if (!Number.isInteger(completeSubstatCount) || completeSubstatCount < 0 || completeSubstatCount > ECHO_STATS_EDITOR_MAX_SUBSTATS) {
    throw new RangeError(`Echo Stats Editor complete substat count must be 0–${ECHO_STATS_EDITOR_MAX_SUBSTATS}.`);
  }
  return ECHO_STATS_EDITOR_LEVELS[completeSubstatCount]!;
}

export function listEchoStatsEditorMainStatOptions(
  cost: EchoCost,
  level: EchoLevel,
): readonly EchoStatsEditorMainStatOption[] {
  return RANK5_PRIMARY_MAIN_STATS[cost].map((profile) => {
    const value = primaryMainStatValueAtLevel(cost, profile.name, level);
    if (value === null) throw new Error(`Missing Rank-5 +${level} primary main-stat value for ${cost}-cost ${profile.name}.`);
    return { name: profile.name, value };
  });
}

export function getEchoStatsEditorSecondaryMainStat(cost: EchoCost, level: EchoLevel): StatRoll {
  const profile = RANK5_SECONDARY_MAIN_STATS[cost];
  return {
    name: profile.name,
    value: secondaryMainStatValueAtLevel(cost, level),
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
  substats: readonly StatRoll[] = [],
): EchoStatsEditorSelection {
  if (substats.length > ECHO_STATS_EDITOR_MAX_SUBSTATS) {
    throw new RangeError(`Echo Stats Editor supports at most ${ECHO_STATS_EDITOR_MAX_SUBSTATS} substats.`);
  }
  const level = echoStatsEditorLevelForCompleteSubstats(substats.length);
  const options = listEchoStatsEditorMainStatOptions(cost, level);
  const selected = primaryMainStat
    ? options.find((option) => option.name === primaryMainStat)
    : options[0];
  if (!selected || !isPrimaryMainStatAllowed(cost, selected.name)) {
    throw new RangeError(`${primaryMainStat ?? 'Missing primary main stat'} is not valid for ${cost}-cost Echoes.`);
  }
  const selection: EchoStatsEditorSelection = {
    cost,
    level,
    mainStat: { ...selected },
    secondaryMainStat: getEchoStatsEditorSecondaryMainStat(cost, level),
    substats: substats.map((roll) => ({ ...roll })),
  };
  assertEchoStatsEditorSelection(selection);
  return selection;
}

export function assertEchoStatsEditorSelection(selection: EchoStatsEditorSelection): void {
  if (![1, 3, 4].includes(selection.cost)) throw new RangeError(`Unsupported Echo cost: ${selection.cost}.`);
  if (!ECHO_STATS_EDITOR_LEVELS.includes(selection.level)) {
    throw new RangeError(`Unsupported Echo level: +${selection.level}.`);
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

  const expectedLevel = echoStatsEditorLevelForCompleteSubstats(selection.substats.length);
  if (selection.level !== expectedLevel) {
    throw new RangeError(`Echo level +${selection.level} does not match ${selection.substats.length} complete substats (+${expectedLevel}).`);
  }

  const expectedPrimary = primaryMainStatValueAtLevel(
    selection.cost,
    selection.mainStat.name,
    selection.level,
  );
  if (expectedPrimary === null || !exact(selection.mainStat.value, expectedPrimary)) {
    throw new RangeError(`Invalid ${selection.cost}-cost primary main stat at +${selection.level}: ${selection.mainStat.name}.`);
  }

  const expectedSecondary = getEchoStatsEditorSecondaryMainStat(selection.cost, selection.level);
  if (
    selection.secondaryMainStat.name !== expectedSecondary.name
    || !exact(selection.secondaryMainStat.value, expectedSecondary.value)
  ) {
    throw new RangeError(`Invalid automatic secondary main stat for ${selection.cost}-cost Echo at +${selection.level}.`);
  }
}
