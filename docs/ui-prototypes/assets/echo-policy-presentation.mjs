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
  // Augusta/default guidance was approved for this UI only. It is not evaluator coverage.
  const pool = new Set(source.characterId === 'augusta' && source.presetId === 'augusta-standard'
    ? ['CRIT Rate', 'CRIT DMG', 'Energy Regen', 'ATK%', 'Heavy Attack DMG'] : improveRelevantStats(source));
  const relevant = canonicalStats.filter(name => pool.has(name));
  const layout = { every: [], flex: [], other: [], minimums: state.echoLayout?.minimums ?? {} };
  const seen = new Set();
  const saved = state.echoLayout;
  // Existing active requirements/preferences own their visible section. Never hide legacy intent.
  for (const list of ['every', 'flex', 'other']) {
    const defaults = list === 'every' ? [...required, ...relevant.filter(name => !flex.includes(name))]
      : list === 'flex' ? flex : canonicalStats;
    for (const name of [...(saved?.[list] ?? []), ...defaults]) {
      if (!canonicalStats.includes(name) || seen.has(name) || required.includes(name) && list !== 'every'
        || flex.includes(name) && list !== 'flex') continue;
      // Saved placements take precedence over defaults for inactive stats.
      if (saved && !required.includes(name) && !flex.includes(name) && !saved[list].includes(name)) continue;
      layout[list].push(name); seen.add(name);
    }
  }
  for (const name of canonicalStats) if (!seen.has(name)) layout.other.push(name);
  return { required, flex, relevant, other: layout.other, layout, policy };
}
const set = (state, source, section, value) => updateImprovePolicyState(state, { type: 'set', section, value }, source);
const minimum = (view, source, list, name) => view.policy.requirements.value?.requiredOnEveryEcho.find(row => row.stat === name)?.minimum
  ?? view.policy.preferences.value?.find(row => row.stat === name)?.minimum
  ?? view.layout.minimums[name] ?? initialImproveRollMinimum(source, name);
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
  if (list === 'other') list = 'flex';
  if (list === 'flex' && view.required.includes(name)) return state;
  const layout = structuredClone(view.layout);
  layout.minimums[name] = minimum(view, source, list, name);
  if (!layout[list].includes(name)) {
    for (const key of ['every', 'flex', 'other']) layout[key] = layout[key].filter(stat => stat !== name);
    layout[list].push(name);
  }
  state = updateImprovePolicyState(state, { type: 'layout', value: layout }, source);
  if (list === 'every') {
    const requirements = structuredClone(view.policy.requirements.value ?? { requiredOnEveryEcho: [], groups: [] });
    const active = view.required.includes(name);
    requirements.requiredOnEveryEcho = active ? requirements.requiredOnEveryEcho.filter(row => row.stat !== name)
      : [...requirements.requiredOnEveryEcho, { stat: name, minimum: minimum(view, source, list, name) }];
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
  const from = view.flex.indexOf(name);
  if (from < 0 || !Number.isInteger(to) || to < 0 || to >= view.flex.length || from === to) return state;
  return moveEchoStat(state, source, canonicalStats, name, 'flex', view.layout.flex.indexOf(view.flex[to]));
}
export function resetEchoPolicy(state, source) {
  const { echoLayout: _layout, ...base } = state;
  let next = updateImprovePolicyState(base, { type: 'clear', section: 'echoRequirements' }, source);
  return updateImprovePolicyState(next, { type: 'clear', section: 'echoPreferences' }, source);
}

/** Move presentation rows with the original active intent and minimum; other is inactive. */
export function moveEchoStat(state, source, canonicalStats, name, destination, to) {
  if (!canonicalStats.includes(name) || !['every', 'flex', 'other'].includes(destination)) throw new Error('Unknown Echo row/destination.');
  const view = echoPolicyPresentation(state, source, canonicalStats);
  if ([view.policy.requirements, view.policy.preferences].some(section => section.status === 'PENDING' && section.origin === 'USER'))
    throw new Error('Saved Echo intent needs review. Reset to Recommended first.');
  const layout = structuredClone(view.layout);
  const origin = ['every', 'flex', 'other'].find(list => layout[list].includes(name));
  const active = view.required.includes(name) || view.flex.includes(name);
  const value = minimum(view, source, origin, name);
  layout.minimums[name] = value;
  for (const list of ['every', 'flex', 'other']) layout[list] = layout[list].filter(stat => stat !== name);
  layout[destination].splice(Math.max(0, Math.min(to ?? layout[destination].length, layout[destination].length)), 0, name);
  let next = state;
  if (active && origin !== destination) {
    const requirements = structuredClone(view.policy.requirements.value ?? { requiredOnEveryEcho: [], groups: [] });
    if (origin === 'every' || destination === 'every') {
      requirements.requiredOnEveryEcho = requirements.requiredOnEveryEcho.filter(row => row.stat !== name);
      if (destination === 'every') requirements.requiredOnEveryEcho.push({ stat: name, minimum: value });
      next = set(next, source, 'echoRequirements', requirements);
    }
    if (origin === 'flex' || destination === 'flex') {
      const names = view.flex.filter(stat => stat !== name);
      if (destination === 'flex') names.push(name);
      next = set(next, source, 'echoPreferences', preferences(layout.flex.filter(stat => names.includes(stat)), view, source));
    }
  } else if (active && destination === 'flex') {
    const ordered = layout.flex.filter(stat => view.flex.includes(stat));
    next = set(next, source, 'echoPreferences', preferences(ordered, view, source));
  }
  return updateImprovePolicyState(next, { type: 'layout', value: layout }, source);
}
