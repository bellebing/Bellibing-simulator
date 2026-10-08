import type { EchoLevel, EchoRank, StatRoll } from './echoCoreDomain.ts';
import type { EchoRequirements, EchoStatRequirement } from './improvePolicyDomain.ts';
import { SUBSTAT_TYPES, SUBSTAT_VALUE_TABLE, assertExactRank5SubstatRoll } from './echoCoreRules.ts';

/** Explicit public user acceptance, independent of economic/evaluator decisions. */
export const SELECTED_FLEX_GROUP_ID = 'selected-flex';
export const FINAL_ECHO_SUBSTAT_CAPACITY = 5;
export function selectedFlexRequirement(requirements: EchoRequirements | null, selected: number, hard: number) {
  const group = requirements?.groups.find(row => row.id === SELECTED_FLEX_GROUP_ID);
  const count = group?.minimumCount ?? null;
  const maximum = Math.max(0, Math.min(selected, FINAL_ECHO_SUBSTAT_CAPACITY - hard));
  const valid = count === null || count >= 1 && count <= maximum;
  return { count, maximum, valid, message: selected === 0
    ? count === null ? 'No Flex Stats selected' : `Flex pool empty; saved count ${count} needs attention`
    : !valid ? `Saved count ${count} exceeds the feasible maximum ${maximum}; adjust the count or move stats`
    : count === null ? `No Flex count configured (${selected} selected)` : `At least ${count} of ${selected}` };
}

/** Legacy groups lacking an explicit count remain unresolved; no implicit any-of conversion. */
export function assessEchoRequirements(requirements: EchoRequirements, echo: {
  readonly level: EchoLevel; readonly substats: readonly StatRoll[]; readonly rank?: EchoRank;
}) {
  const base = { missingHard: 0, missingFlexHits: 0, remainingSlots: 0, minimumFutureHits: null as number | null };
  const result = (status: 'INVALID' | 'PENDING' | 'SATISFIED' | 'STILL_POSSIBLE' | 'IMPOSSIBLE', reason: string,
    detail = base) => ({ status, ...detail, reason });
  if (![0,5,10,15,20,25].includes(echo.level) || echo.rank !== undefined && echo.rank !== 5
    || echo.substats.length !== echo.level / 5 || new Set(echo.substats.map(row => row.name)).size !== echo.substats.length)
    return result('INVALID', 'A valid uniquely tuned Rank-5 checkpoint is required.');
  try { echo.substats.forEach(assertExactRank5SubstatRoll); } catch { return result('INVALID', 'Unsupported substat roll.'); }
  const validRows = (rows: readonly EchoStatRequirement[]) => new Set(rows.map(row => row.stat)).size === rows.length
    && rows.every(row => SUBSTAT_TYPES.includes(row.stat) && (row.minimum === undefined || Number.isFinite(row.minimum) && row.minimum >= 0));
  if (!validRows(requirements.requiredOnEveryEcho) || new Set(requirements.groups.map(group => group.id)).size !== requirements.groups.length
    || requirements.groups.some(group => !validRows(group.members) || group.minimumCount !== undefined
      && (!Number.isInteger(group.minimumCount) || group.minimumCount < 1)))
    return result('INVALID', 'Invalid requirement identity, minimum or count.');
  if (requirements.groups.some(group => group.minimumCount === undefined))
    return result('PENDING', 'Legacy group has no explicit acceptance count.');
  const rolled = new Map(echo.substats.map(row => [row.name, row.value]));
  const passes = (row: EchoStatRequirement, value: number | undefined) => value !== undefined && value >= (row.minimum ?? 0);
  const missingHard = requirements.requiredOnEveryEcho.filter(row => !passes(row, rolled.get(row.stat)));
  const missingFlexHits = requirements.groups.reduce((sum, group) => sum + Math.max(0, group.minimumCount!
    - group.members.filter(row => passes(row, rolled.get(row.stat))).length), 0);
  const detail = { missingHard: missingHard.length, missingFlexHits,
    remainingSlots: FINAL_ECHO_SUBSTAT_CAPACITY - echo.substats.length, minimumFutureHits: null as number | null };
  if (missingHard.some(row => rolled.has(row.stat))) return result('IMPOSSIBLE', 'A Hard Requirement already rolled below its minimum; unique types cannot roll again.', detail);
  const available = SUBSTAT_TYPES.filter(stat => !rolled.has(stat));
  // Enumerate distinct future type sets, using each type's highest canonical roll.
  // This is exact existential slot feasibility, not RNG or a rolling decision.
  let minimum = Infinity;
  for (let mask = 0; mask < 2 ** available.length; mask++) {
    const future = available.filter((_, index) => (mask & (1 << index)) !== 0);
    if (future.length >= minimum) continue;
    const value = (stat: string) => rolled.get(stat) ?? (future.includes(stat) ? SUBSTAT_VALUE_TABLE[stat]!.at(-1) : undefined);
    if (requirements.requiredOnEveryEcho.every(row => passes(row, value(row.stat)))
      && requirements.groups.every(group => group.members.filter(row => passes(row, value(row.stat))).length >= group.minimumCount!)) minimum = future.length;
  }
  detail.minimumFutureHits = Number.isFinite(minimum) ? minimum : null;
  if (minimum > detail.remainingSlots) return result('IMPOSSIBLE', 'Required distinct future hits exceed the remaining slots or available qualifying types.', detail);
  return result(minimum === 0 ? 'SATISFIED' : 'STILL_POSSIBLE', minimum === 0 ? 'All configured requirements pass.' : 'A distinct future completion exists.', detail);
}
export function acceptsFinalEcho(requirements: EchoRequirements, echo: Parameters<typeof assessEchoRequirements>[1]): boolean {
  return echo.level === 25 && assessEchoRequirements(requirements, echo).status === 'SATISFIED';
}
