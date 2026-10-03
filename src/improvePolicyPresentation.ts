import type { BuildStatMetric, CharacterStatTarget, EchoRequirements, PolicySection, ResolvedImprovePolicy } from './improvePolicyDomain.ts';
import { SUBSTAT_VALUE_TABLE } from './echoCoreRules.ts';
import type { StatName } from './echoCoreDomain.ts';
import type { ImprovePolicyState } from './improvePolicyState.ts';
import { resolveImprovePolicyState, updateImprovePolicyState } from './improvePolicyState.ts';

export function pendingImprovePolicySource(characterId: string): ResolvedImprovePolicy {
  const section = <T>(): PolicySection<T> => ({ status: 'PENDING', origin: 'PROFILE', value: null, reason: 'Source unavailable.' });
  return { characterId, presetId: null, applicability: null, sourceReviewStatus: 'PENDING', mode: 'RECOMMENDED',
    characterTarget: { numericTargets: section(), priorities: section() },
    echoPolicy: { scope: 'FINISHED_CANDIDATE_ECHO', requirements: section(), preferences: section(), checkpointReference: null } };
}

export const IMPROVE_TARGET_METRICS: readonly { metric: BuildStatMetric; label: string; unit: 'RATIO' | 'POINTS' }[] = [
  { metric: 'TOTAL_ENERGY_REGEN', label: 'Energy Regen', unit: 'RATIO' },
  { metric: 'TOTAL_CRIT_RATE', label: 'CRIT Rate', unit: 'RATIO' },
  { metric: 'TOTAL_CRIT_DAMAGE', label: 'CRIT DMG', unit: 'RATIO' },
  { metric: 'TOTAL_ATK', label: 'ATK', unit: 'POINTS' },
  { metric: 'TOTAL_HP', label: 'HP', unit: 'POINTS' },
  { metric: 'TOTAL_DEF', label: 'DEF', unit: 'POINTS' },
];
export const improveHumanNumber = (value: number): string => new Intl.NumberFormat('en-US', { maximumFractionDigits: 10, useGrouping: false }).format(value);
export function improveTargetInput(target: CharacterStatTarget, value: number): string {
  // Shift the canonical decimal representation, avoiding binary 1.16 * 100
  // display noise and preserving entered precision when the form is reopened.
  const match = String(value).match(/^(\d+)(?:\.(\d+))?(?:e([+-]?\d+))?$/)!;
  const digits = match[1]! + (match[2] ?? ''), position = match[1]!.length + Number(match[3] ?? 0) + (target.unit === 'RATIO' ? 2 : 0);
  const shifted = position <= 0 ? '0.' + '0'.repeat(-position) + digits : position >= digits.length
    ? digits + '0'.repeat(position - digits.length) : digits.slice(0, position) + '.' + digits.slice(position);
  return shifted.replace(/^0+(?=\d)/, '').replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, '');
}
export function parseImproveTarget(metric: BuildStatMetric, minimum: string, preferred: string): CharacterStatTarget {
  const spec = IMPROVE_TARGET_METRICS.find(row => row.metric === metric);
  if (!spec) throw new Error('Unsupported total-stat metric.');
  const number = (text: string): number => {
    if (!/^(?:\d+(?:\.\d*)?|\.\d+)$/.test(text.trim())) throw new Error('Enter a nonnegative number.');
    const value = Number(text.trim());
    if (!Number.isFinite(value)) throw new Error('Enter a finite number.');
    return spec.unit === 'RATIO' ? Number(text.trim() + 'e-2') : value;
  };
  const min = number(minimum), pref = preferred.trim() ? number(preferred) : undefined;
  if (pref !== undefined && pref < min) throw new Error('Preferred cannot be lower than minimum.');
  return { metric, unit: spec.unit, minimum: min, ...(pref === undefined ? {} : { preferred: pref }),
    basis: { kind: 'USER_DEFINED', description: null, comparisonStatus: 'PENDING' } };
}
export function improveRelevantStats(policy: ResolvedImprovePolicy): readonly StatName[] {
  const names = new Set<StatName>();
  if (policy.characterTarget.priorities.status === 'VERIFIED') for (const row of policy.characterTarget.priorities.value) names.add(row.stat);
  if (policy.echoPolicy.requirements.status === 'VERIFIED') {
    for (const row of policy.echoPolicy.requirements.value.requiredOnEveryEcho) names.add(row.stat);
    for (const group of policy.echoPolicy.requirements.value.groups) for (const row of group.members) names.add(row.stat);
  }
  if (policy.echoPolicy.preferences.status === 'VERIFIED') for (const row of policy.echoPolicy.preferences.value) names.add(row.stat);
  return [...names]; // Availability only; never a Recommended preference order.
}
function editable<T>(section: PolicySection<T>, empty: T): T {
  if (section.status === 'PENDING' && section.origin === 'USER') throw new Error('Saved section needs review. Use Recommended to clear its override first.');
  return structuredClone(section.value ?? empty);
}
export function editImproveTarget(state: ImprovePolicyState, source: ResolvedImprovePolicy,
  metric: BuildStatMetric, target: CharacterStatTarget | null): ImprovePolicyState {
  const effective = resolveImprovePolicyState(state, source).policy.characterTarget.numericTargets;
  const rows: CharacterStatTarget[] = editable(effective, []).filter(row => row.metric !== metric)
    .map(row => ({ ...row, basis: { ...row.basis, kind: 'USER_DEFINED' as const } }));
  if (target) rows.push(target);
  return updateImprovePolicyState(state, { type: 'set', section: 'numericTargets', value: rows }, source);
}
/** First edit copies the effective section. Groups/constraints are never flattened. */
export function assignImproveEchoStat(state: ImprovePolicyState, source: ResolvedImprovePolicy,
  name: StatName, destination: 'REQUIRED' | 'PREFERRED' | 'AVAILABLE'): ImprovePolicyState {
  if (!improveRelevantStats(source).includes(name)) throw new Error('Stat is not in this reviewed Character pool.');
  const effective = resolveImprovePolicyState(state, source).policy.echoPolicy;
  const requirements = editable<EchoRequirements>(effective.requirements,
    { requiredOnEveryEcho: [], groups: [], acceptanceConstraints: null });
  let preferences = [...editable(effective.preferences, [])];
  let next = state;
  const required = requirements.requiredOnEveryEcho.some(row => row.stat === name);
  const preferred = preferences.some(row => row.stat === name);
  if (destination === 'REQUIRED' || required) {
    const rows = requirements.requiredOnEveryEcho.filter(row => row.stat !== name);
    if (destination === 'REQUIRED') rows.push(requirements.requiredOnEveryEcho.find(row => row.stat === name) ?? { stat: name });
    next = updateImprovePolicyState(next, { type: 'set', section: 'echoRequirements',
      value: { ...requirements, requiredOnEveryEcho: rows } }, source);
  }
  if (destination === 'PREFERRED' || preferred) {
    preferences = preferences.filter(row => row.stat !== name);
    if (destination === 'PREFERRED') preferences.push({ stat: name, priorityGroup: Math.max(0, ...preferences.map(row => row.priorityGroup)) + 1 });
    next = updateImprovePolicyState(next, { type: 'set', section: 'echoPreferences', value: preferences }, source);
  }
  return next;
}
export function reorderImprovePreferences(state: ImprovePolicyState, source: ResolvedImprovePolicy,
  name: StatName, to: number): ImprovePolicyState {
  const preferences = [...editable(resolveImprovePolicyState(state, source).policy.echoPolicy.preferences, [])];
  const from = preferences.findIndex(row => row.stat === name);
  if (from < 0 || !Number.isInteger(to) || to < 0 || to >= preferences.length || from === to) return state;
  const [moved] = preferences.splice(from, 1); preferences.splice(to, 0, moved!);
  return updateImprovePolicyState(state, { type: 'set', section: 'echoPreferences',
    value: preferences.map((row, index) => ({ ...row, priorityGroup: index + 1 })) }, source);
}

/** Source-backed minimum, or the lowest verified tier for user-created intent. */
export function initialImproveRollMinimum(source: ResolvedImprovePolicy, name: StatName): number {
  const policy = source.echoPolicy;
  const requirements = policy.requirements.status === 'VERIFIED' ? policy.requirements.value : null;
  const preference = policy.preferences.status === 'VERIFIED' ? policy.preferences.value.find(row => row.stat === name) : null;
  const minimum = requirements?.requiredOnEveryEcho.find(row => row.stat === name)?.minimum
    ?? preference?.minimum ?? requirements?.groups.flatMap(group => group.members).find(row => row.stat === name)?.minimum;
  return minimum ?? SUBSTAT_VALUE_TABLE[name]![0]!;
}
/** Decimal display only; canonical persisted ratios/points never change units. */
export function improveRollValueText(name: StatName, value: number): string {
  return improveHumanNumber(name.startsWith('Flat ') ? value : value * 100) + (name.startsWith('Flat ') ? '' : '%');
}
export function improveRollControl(name: StatName, minimum: number): {
  values: readonly number[]; index: number; text: string;
} {
  const values = SUBSTAT_VALUE_TABLE[name] ?? [];
  return { values, index: values.indexOf(minimum), text: improveRollValueText(name, minimum) };
}
