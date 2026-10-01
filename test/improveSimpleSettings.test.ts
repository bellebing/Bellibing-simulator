import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { getDefaultBuildPreset } from '../src/profileRegistry.ts';
import { projectImproveSettingsSources } from '../src/improveSettingsProjection.ts';
import { normalizeSimpleSettings, updateSimpleSettings } from '../src/improveSimpleSettings.mjs';

const sources = projectImproveSettingsSources();
const source = sources.find(row => row.characterId === 'augusta')!;
test('Improve pools exactly reuse verified default Character StatTargetProfiles and provenance', () => {
  assert.equal(sources.length, 57);
  for (const row of sources) {
    const resolved = getDefaultBuildPreset(PROFILE_REGISTRY, row.characterId);
    if (row.status === 'READY') {
      assert.equal(resolved?.preset.verificationStatus, 'VERIFIED');
      assert.equal(resolved?.statTarget.verificationStatus, 'VERIFIED');
      assert.equal(row.profileId, resolved!.statTarget.id);
      assert.deepEqual(row.stats, resolved!.statTarget.targetRules.map(rule => ({ name: rule.stat, note: rule.notes ?? null })));
      assert.deepEqual(row.provenance, resolved!.statTarget.provenance);
    } else {
      assert.deepEqual(row.stats, []);
      assert.equal(row.profileId, null);
    }
  }
  assert.ok(sources.some(row => row.status === 'PENDING'));
  assert.ok(sources.some(row => row.status === 'READY' && row.stats.some(stat => stat.name === 'HP%')));
});
test('checked-in Improve source/state exports match canonical code', () => {
  const exported = JSON.parse(readFileSync('docs/ui-prototypes/assets/improve-settings/sources.json', 'utf8'));
  assert.deepEqual(exported.characters, sources);
  assert.equal(exported.rollQualityMappingStatus, 'PENDING');
  assert.equal(readFileSync('docs/ui-prototypes/assets/improve-settings/state.mjs', 'utf8').replace(/\r\n/g, '\n'), readFileSync('src/improveSimpleSettings.mjs', 'utf8').replace(/\r\n/g, '\n'));
});
test('Improve defaults have no fabricated valuable requirement or thresholds; +25 is selectable', () => {
  const state = normalizeSimpleSettings(null, source, 5);
  assert.equal(state.gate, 5);
  assert.equal(state.valuableStats.requiredCount, null);
  assert.equal(state.rollQuality, 'All Rolls');
  for (const value of [5, 10, 15, 20, 25]) assert.equal(updateSimpleSettings(state, { type: 'gate', value }, source, 5).gate, value);
  for (const value of ['All Rolls', 'Mid+', 'High+']) {
    const next = updateSimpleSettings(state, { type: 'quality', value }, source, 5);
    assert.equal(next.rollQuality, value);
    assert.equal(next.rollQualityMappingStatus, 'PENDING');
    assert.equal('thresholds' in next, false);
  }
});
test('valuable configuration/count use unique pool members and the canonical substat capacity', () => {
  const initial = normalizeSimpleSettings(null, source, 5);
  const selected = updateSimpleSettings(initial, { type: 'count', value: 2 }, source, 5);
  assert.equal(selected.valuableStats.requiredCount, 2);
  assert.equal(updateSimpleSettings(selected, { type: 'count', value: 6 }, source, 5).valuableStats.requiredCount, null);
  assert.deepEqual(updateSimpleSettings(selected, { type: 'stat', value: 'invented' }, source, 5), selected);
  let next = selected;
  for (const stat of source.stats) next = updateSimpleSettings(next, { type: 'stat', value: stat.name }, source, 5);
  assert.deepEqual(next.valuableStats.selectedStats, []);
  assert.equal(next.valuableStats.requiredCount, null);
  assert.equal(initial.valuableStats.selectedStats.length, source.stats.length);
  assert.equal(initial.valuableStats.requiredCount, null);
});
test('missing or changed source fails closed without carrying a Character pool across contexts', () => {
  const selected = updateSimpleSettings(normalizeSimpleSettings(null, source, 5), { type: 'count', value: 2 }, source, 5);
  const pending = normalizeSimpleSettings(selected, null, 5);
  assert.equal(pending.valuableStats.status, 'PENDING');
  assert.equal(pending.valuableStats.requiredCount, null);
  assert.deepEqual(pending.valuableStats.selectedStats, []);
  const changed = normalizeSimpleSettings(selected, { ...source, profileId: 'changed' }, 5);
  assert.equal(changed.valuableStats.requiredCount, null);
  const other = sources.find(row => row.status === 'READY' && row.characterId !== source.characterId)!;
  assert.equal(normalizeSimpleSettings(selected, other, 5).valuableStats.requiredCount, null);
});
test('malformed saved UI values cannot become policy values', () => {
  const good = normalizeSimpleSettings(null, source, 5);
  const saved = { gate: 17, rollQuality: '99%', valuableStats: { ...good.valuableStats, selectedStats: [source.stats[0].name, source.stats[0].name, 'unknown'], requiredCount: -1 } };
  const normalized = normalizeSimpleSettings(saved, source, 5);
  assert.equal(normalized.gate, 5);
  assert.equal(normalized.rollQuality, 'All Rolls');
  assert.deepEqual(normalized.valuableStats.selectedStats, [source.stats[0].name]);
  assert.equal(normalized.valuableStats.requiredCount, null);
});
