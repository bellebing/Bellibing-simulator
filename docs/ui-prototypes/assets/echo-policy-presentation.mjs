import { resolveImprovePolicyState, updateImprovePolicyState } from '../../assets/improvePolicyState.js';

import { initialImproveRollMinimum, improveRollControl, improveRelevantStats } from '../../assets/improvePolicyPresentation.js';

const unique = names => [...new Set(names)];
// UI projection only: reviewed group membership is relevance, not a verified ranking.
// Canonical groups, thresholds, constraints, and source preferences stay untouched.
export function recommendedFlexStats(source) {
  const policy = source.echoPolicy;
  const required = new Set((policy.requirements.value?.requiredOnEveryEcho ?? []).map(row => row.stat));
  const members = policy.requirements.status === 'VERIFIED'
    ? (policy.requirements.value?.groups ?? []).flatMap(group => group.members.map(row => row.stat)) : [];
  const preferences = policy.preferences.status === 'VERIFIED' ? policy.preferences.value.map(row => row.stat) : [];
  return unique([...members, ...preferences]).filter(name => !required.has(name));
}
export function echoPolicyPresentation(state, source, canonicalStats) {
  const policy = resolveImprovePolicyState(state, source).policy.echoPolicy;
  const required = (policy.requirements.value?.requiredOnEveryEcho ?? []).map(row => row.stat);
  const inherited = recommendedFlexStats(source);
  const explicit = policy.preferences.status === 'USER_DEFINED';
  const flex = unique(explicit ? policy.preferences.value.map(row => row.stat) : inherited).filter(name => !required.includes(name));
  // Reviewed Character relevance is public display data, never a minimum or ranking.
  // Preserve canonical order rather than using source priority numbers as usefulness.
  const pool = new Set(improveRelevantStats(source));
  const relevant = canonicalStats.filter(name => pool.has(name));
  return { required, flex, relevant, other: canonicalStats.filter(name => !relevant.includes(name)), policy };
}
const set = (state, source, section, value) => updateImprovePolicyState(state, { type: 'set', section, value }, source);
const minimum = (view, source, list, name) => (list === 'every'
  ? view.policy.requirements.value?.requiredOnEveryEcho.find(row => row.stat === name)?.minimum
  : view.policy.preferences.value?.find(row => row.stat === name)?.minimum) ?? initialImproveRollMinimum(source, name);
const preferences = (names, view, source) => names.map((stat, index) => ({ stat, priorityGroup: index + 1,
  minimum: minimum(view, source, 'flex', stat) }));
export function echoRollControl(view, source, list, name) {
  return improveRollControl(name, minimum(view, source, list, name));
}
export function editEchoRollMinimum(state, source, canonicalStats, list, name, index) {
  const view = echoPolicyPresentation(state, source, canonicalStats);
  const control = echoRollControl(view, source, list, name);
  if (state.mode !== 'MANUAL' || !Number.isInteger(index) || index < 0 || index >= control.values.length
    || (list !== 'every' && list !== 'flex') || !(list === 'every' ? view.required : view.flex).includes(name)) {
    throw new Error('An active editable Echo stat and valid roll tier are required.');
  }
  if (list === 'every') {
    const requirements = structuredClone(view.policy.requirements.value);
    requirements.requiredOnEveryEcho = requirements.requiredOnEveryEcho.map(row => row.stat === name
      ? { ...row, minimum: control.values[index] } : row);
    return set(state, source, 'echoRequirements', requirements);
  }
  return set(state, source, 'echoPreferences', preferences(view.flex, view, source).map(row => row.stat === name
    ? { ...row, minimum: control.values[index] } : row));
}
export function editEchoPolicy(state, source, canonicalStats, list, name) {
  if (!canonicalStats.includes(name)) throw new Error('Unknown Echo substat.');
  const view = echoPolicyPresentation(state, source, canonicalStats);
  if ([view.policy.requirements, view.policy.preferences].some(section => section.status === 'PENDING' && section.origin === 'USER')) {
    throw new Error('Saved Echo intent needs review. Reset to Recommended first.');
  }
  if (list === 'every') {
    const requirements = structuredClone(view.policy.requirements.value ?? { requiredOnEveryEcho: [], groups: [] });
    const active = view.required.includes(name);
    requirements.requiredOnEveryEcho = active ? requirements.requiredOnEveryEcho.filter(row => row.stat !== name)
      : [...requirements.requiredOnEveryEcho, { stat: name, minimum: initialImproveRollMinimum(source, name) }];
    let next = set(state, source, 'echoRequirements', requirements);
    // Removing inherited Flex requires explicit intent so unrequiring won't silently reactivate it.
    if (!active && view.flex.includes(name)) next = set(next, source, 'echoPreferences', preferences(view.flex.filter(stat => stat !== name), view, source));
    return next;
  }
  if (view.required.includes(name)) return state;
  const names = view.flex.includes(name) ? view.flex.filter(stat => stat !== name) : [...view.flex, name];
  return set(state, source, 'echoPreferences', preferences(names, view, source));
}
export function reorderFlexStats(state, source, canonicalStats, name, to) {
  const view = echoPolicyPresentation(state, source, canonicalStats);
  const names = view.flex;
  const from = names.indexOf(name);
  if (from < 0 || !Number.isInteger(to) || to < 0 || to >= names.length || from === to) return state;
  names.splice(to, 0, ...names.splice(from, 1));
  return set(state, source, 'echoPreferences', preferences(names, view, source));
}
export function resetEchoPolicy(state, source) {
  let next = updateImprovePolicyState(state, { type: 'clear', section: 'echoRequirements' }, source);
  return updateImprovePolicyState(next, { type: 'clear', section: 'echoPreferences' }, source);
}

// One canonical collection in the existing policy override envelope. Dormant
// minimums are user inputs; they do not invent source-backed recommendations.
export const ECHO_CATEGORIES = Object.freeze([['HARD', 'Hard Requirements'], ['ANY', 'Any Of'], ['NOT_IMPORTANT', 'Not Important']]);
export function echoCardPresentation(state, source, canonicalStats) {
  const resolved = resolveImprovePolicyState(state, source);
  const requirements = source.echoPolicy.requirements;
  const legacy = !state.overrides.echoCards && (state.overrides.echoRequirements !== undefined
    || state.overrides.echoPreferences !== undefined || state.migration !== null);
  const sourceRows = requirements.status === 'VERIFIED' ? requirements.value : null;
  const groups = sourceRows?.groups ?? [];
  const hard = sourceRows?.requiredOnEveryEcho ?? [];
  const any = groups.length === 1 && Number.isInteger(groups[0].minimumCount) ? groups[0].members : [];
  const recommendedReady = source.sourceReviewStatus === 'CURRENT' && !!sourceRows && groups.length <= 1
    && (groups.length === 0 || Number.isInteger(groups[0].minimumCount))
    && [...hard, ...any].every(row => improveRollControl(row.stat, row.minimum).index >= 0)
    && new Set([...hard, ...any].map(row => row.stat)).size === hard.length + any.length
    && hard.length + (groups[0]?.minimumCount ?? 0) <= 5
    && (!groups.length || groups[0].minimumCount > 0 && groups[0].minimumCount <= any.length);
  const initial = { cards: canonicalStats.map(stat => {
    const required = recommendedReady ? hard.find(row => row.stat === stat) : null;
    const alternative = recommendedReady ? any.find(row => row.stat === stat) : null;
    return { stat, category: required ? 'HARD' : alternative ? 'ANY' : 'NOT_IMPORTANT',
      minimum: required?.minimum ?? alternative?.minimum ?? improveRollControl(stat, 0).values[0] };
  }), anyOfMinimumCount: recommendedReady ? groups[0]?.minimumCount ?? 1 : 1 };
  const suspended = resolved.compatibility.suspendedSections.includes('echoCards');
  const input = state.mode === 'MANUAL' && state.overrides.echoCards && !suspended ? structuredClone(state.overrides.echoCards) : initial;
  const hardCount = input.cards.filter(row => row.category === 'HARD').length;
  const poolCount = input.cards.filter(row => row.category === 'ANY').length;
  const maxCount = Math.min(poolCount, Math.max(0, 5 - hardCount));
  const errors = [];
  if (hardCount > 5) errors.push('Hard Requirements exceed the five Echo substat slots. Move a stat to another category.');
  if (poolCount && input.anyOfMinimumCount > maxCount) errors.push('Any Of requires ' + input.anyOfMinimumCount + ' distinct stats, but only ' + maxCount + ' fit the pool and remaining Echo slots. Adjust the count or move cards.');
  if (!poolCount && state.overrides.echoCards && input.anyOfMinimumCount !== 1) errors.push('Any Of count is retained at ' + input.anyOfMinimumCount + '. Add enough alternatives or set the count to 1.');
  return { ...input, maxCount, poolCount, errors, recommendedReady, needsReview: legacy || suspended,
    editable: !legacy && !suspended && resolved.compatibility.context !== 'MISMATCH' };
}
export function editEchoCard(state, source, canonicalStats, action) {
  const view = echoCardPresentation(state, source, canonicalStats);
  if (!view.editable) throw new Error('Saved Echo intent needs review. Reset to Recommended first.');
  const input = { cards: view.cards, anyOfMinimumCount: view.anyOfMinimumCount };
  if (action.type === 'count') {
    // An invalid retained choice can be explicitly reduced, including an empty pool.
    if (!Number.isInteger(action.value) || action.value < 1 || action.value > Math.max(1, view.maxCount)) throw new Error('Choose a count within the pool and remaining slots.');
    input.anyOfMinimumCount = action.value;
  } else {
    const card = input.cards.find(row => row.stat === action.stat);
    if (!card) throw new Error('Unknown Echo substat.');
    if (action.type === 'category') {
      if (!ECHO_CATEGORIES.some(([id]) => id === action.value)) throw new Error('Unknown Echo category.');
      card.category = action.value;
    } else if (action.type === 'roll') {
      const values = improveRollControl(card.stat, card.minimum).values;
      if (!Number.isInteger(action.value) || action.value < 0 || action.value >= values.length) throw new Error('Canonical roll tier required.');
      card.minimum = values[action.value];
    } else throw new Error('Unknown Echo card edit.');
  }
  return updateImprovePolicyState(state, { type: 'set', section: 'echoCards', value: input }, source);
}
