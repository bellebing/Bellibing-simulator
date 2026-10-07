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
