import test from 'node:test';
import assert from 'node:assert/strict';
import { simulatedCharacterTargets } from '../docs/ui-prototypes/assets/character-target-presentation.js';
const settings = { compatibility: { context: 'MATCH', suspendedSections: [] }, presentation: { characterTarget: { numericTargets: { status: 'PENDING' } } } };
test('Echo success cannot mask below-reference Character CR and ER', () => {
  const rows = simulatedCharacterTargets('augusta', { atk: 2500, critRate: .695, critDamage: 2.3, energyRegen: 1.184, heavyAttackDamageBonus: .4 }, settings);
  assert.equal(rows.find(row => row.metric === 'TOTAL_CRIT_RATE')?.status, 'BELOW');
  assert.equal(rows.find(row => row.metric === 'TOTAL_ENERGY_REGEN')?.target, 1.2);
  assert.equal(rows.find(row => row.metric === 'TOTAL_ENERGY_REGEN')?.status, 'BELOW');
  assert.equal(rows.find(row => row.metric === 'HEAVY_ATTACK_DMG_BONUS')?.status, 'MET');
});
test('missing projection/context and unsupported custom metrics do not become zero or success', () => {
  assert.ok(simulatedCharacterTargets('augusta', null, settings).every(row => row.status === 'PENDING'));
  assert.deepEqual(simulatedCharacterTargets('augusta', {}, { ...settings, compatibility: { context: 'MISMATCH' } }), []);
  const custom = { ...settings, presentation: { characterTarget: { numericTargets: { status: 'USER_DEFINED', value: [{ metric: 'TOTAL_ENERGY_REGEN', unit: 'RATIO', minimum: 1.3 }, { metric: 'UNKNOWN', minimum: 1 }] } } } };
  const rows = simulatedCharacterTargets('augusta', { energyRegen: 1.2 }, custom);
  assert.equal(rows[0].status, 'BELOW'); assert.equal(rows[0].target, 1.3); assert.equal(rows[1].status, 'PENDING');
  assert.deepEqual(simulatedCharacterTargets('chixia', {}, settings), []);
});
