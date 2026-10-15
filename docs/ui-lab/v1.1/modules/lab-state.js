import { ECHO_FIXTURES } from './demo-data.js';

export const DEMO_ACCOUNT_IDS = ['changli', 'yinlin', 'the-shorekeeper', 'augusta', 'iuno', 'phrolova'];
export const DEMO_FEATURED_IDS = ['changli', 'jinhsi', 'yinlin', 'the-shorekeeper', 'augusta', 'iuno', 'cartethyia', 'phrolova', 'jiyan'];

// Static presentation fixtures only. Never compare these as calculated Character outcomes.
export const STAT_LABELS = ['HP', 'ATK', 'DEF', 'Energy Regen', 'CRIT Rate', 'CRIT DMG', 'Electro DMG Bonus', 'Basic Attack DMG', 'Heavy Attack DMG', 'Skill DMG', 'Liberation DMG', 'Healing Bonus'];
const AUGUSTA_STATS = [
  ['18,420', '19,280'], ['2,184', '2,306'], ['1,112', '1,112'],
  ['118.4%', '126.8%'], ['71.6%', '76.4%'], ['226.2%', '238.8%'],
  ['70.0%', '70.0%'], ['0.0%', '0.0%'], ['22.2%', '29.3%'],
  ['0.0%', '0.0%'], ['0.0%', '0.0%'], ['0.0%', '0.0%'],
];
const PREVIEW_FIXTURES = {
  changli: ['2,120', '65.4%', '240.0%'], yinlin: ['1,862', '61.2%', '218.4%'],
  iuno: ['1,940', '60.8%', '202.4%'], phrolova: ['2,036', '69.4%', '224.0%'],
};

export const MINIMUM_TIERS = {
  'CRIT Rate': ['6.3%', '6.9%', '7.5%', '8.1%', '8.7%', '9.3%', '9.9%', '10.5%'],
  'CRIT DMG': ['12.6%', '13.8%', '15.0%', '16.2%', '17.4%', '18.6%', '19.8%', '21.0%'],
  'ATK%': ['6.4%', '7.1%', '7.9%', '8.6%', '9.4%', '10.1%', '10.9%', '11.6%'],
  'Heavy Attack DMG': ['6.4%', '7.1%', '7.9%', '8.6%', '9.4%', '10.1%', '10.9%', '11.6%'],
  'Energy Regen': ['6.8%', '7.6%', '8.4%', '9.2%', '10.0%', '10.8%', '11.6%', '12.4%'],
  'Flat ATK': ['30', '40', '50', '60'],
};

export function candidateFixture(echo) {
  if (!echo) return null;
  return {
    ...structuredClone(echo), level: 15,
    value: { 4: '14.96%', 3: '20.4%', 1: '12.24%' }[echo.cost],
    secondaryValue: { 4: '102', 3: '68', 1: '1,550' }[echo.cost],
    stats: [['CRIT Rate', '9.3%'], ['CRIT DMG', '18.6%'], ['Energy Regen', '10.0%']],
  };
}

export function historyFixture(echo, index) {
  if (!echo) return null;
  const stats = [['CRIT Rate', '6.3%'], ['Flat DEF', '50'], ['Energy Regen', '6.8%'], ['HP%', '7.1%']].slice(0, 2 + index % 3);
  const level = stats.length * 5;
  // Canonical presentation values at known checkpoints, not a rolling algorithm.
  const values = { 4: { 10: '10.56%', 15: '14.96%', 20: '18.48%' }, 3: { 10: '14.4%', 15: '20.4%', 20: '25.2%' }, 1: { 10: '8.64%', 15: '12.24%', 20: '15.12%' } };
  const secondary = { 4: { 10: '78', 15: '102', 20: '126' }, 3: { 10: '52', 15: '68', 20: '84' }, 1: { 10: '1,185', 15: '1,550', 20: '1,915' } };
  return { ...structuredClone(echo), level, value: values[echo.cost][level], secondaryValue: secondary[echo.cost][level], stats, disposition: 'DISCARDED' };
}

function makeState(id) {
  const onAccount = DEMO_ACCOUNT_IDS.includes(id);
  const count = id === 'augusta' ? 5 : ['iuno', 'the-shorekeeper'].includes(id) ? 3 : id === 'yinlin' ? 4 : onAccount ? 5 : 0;
  const echoes = Array.from({ length: 5 }, (_, index) => index < count ? structuredClone(ECHO_FIXTURES[index]) : null);
  const stats = id === 'augusta' ? structuredClone(AUGUSTA_STATS) : STAT_LABELS.map(() => ['—', '—']);
  if (PREVIEW_FIXTURES[id]) [1, 4, 5].forEach((row, index) => { stats[row] = [PREVIEW_FIXTURES[id][index], PREVIEW_FIXTURES[id][index]]; });
  return {
    id, onAccount, selectedSlot: 0, scope: 'slot', echoes,
    materials: id === 'augusta' ? [{ name: 'Echoes', icon: null, count: 12 }, { name: 'Tuners', icon: 'tuner.png', count: 120 }, { name: 'Premium Tubes', icon: 'tube.png', count: 24 }] : null,
    candidates: echoes.map(candidateFixture),
    histories: echoes.map((echo, slot) => echo ? Array.from({ length: [5, 3, 4, 2, 4][slot] }, (_, index) => historyFixture(echo, index)) : []),
    stats, weapon: id === 'augusta' ? 'Thunderflare Dominion' : onAccount ? 'Weapon equipped · demo' : 'Not configured',
    gate: '+5', settingsMode: id === 'augusta' ? 'Recommended' : 'Customize',
    minima: Object.fromEntries(Object.keys(MINIMUM_TIERS).map(name => [name, 0])),
    flexOrder: ['ATK%', 'Heavy Attack DMG', 'Energy Regen', 'Flat ATK'],
  };
}

// A module-local Map, never localStorage, IndexedDB, production account state or an API.
const characterStates = new Map();
export function getDemoState(id) {
  if (!characterStates.has(id)) characterStates.set(id, makeState(id));
  return characterStates.get(id);
}

export function previewSnapshot(id) {
  // Pure lookup: hovering never creates a build, even in this demonstration store.
  const state = characterStates.get(id);
  const onAccount = DEMO_ACCOUNT_IDS.includes(id);
  if (!state && !onAccount) return { onAccount: false, hasBuild: false, slots: 0, weapon: null, stats: ['—', '—', '—'] };
  if (state) return { onAccount, hasBuild: onAccount || state.echoes.some(Boolean), slots: state.echoes.filter(Boolean).length, weapon: state.weapon, stats: [state.stats[1][0], state.stats[4][0], state.stats[5][0]] };
  return { onAccount, hasBuild: true, slots: ['iuno', 'the-shorekeeper'].includes(id) ? 3 : id === 'yinlin' ? 4 : 5, weapon: id === 'augusta' ? 'Thunderflare Dominion' : 'Weapon equipped · demo', stats: id === 'augusta' ? ['2,184', '71.6%', '226.2%'] : PREVIEW_FIXTURES[id] ?? ['—', '—', '—'] };
}

export function resetDemoState(id) {
  characterStates.set(id, makeState(id));
  return characterStates.get(id);
}

export function inspectDemoStore() {
  return [...characterStates.keys()];
}

// Zero is recorded non-use; null is unavailable. Neither is a calculated quantity.
export function visibleMaterials(records) {
  return records.filter(record => record.count !== 0);
}
