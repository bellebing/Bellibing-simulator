import test from 'node:test';
import assert from 'node:assert/strict';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import {
  activateAzureOathHavocBaneWindows,
  AZURE_OATH_HAVOC_BANE_SOURCE_REVIEW,
  isAzureOathHavocBaneWindowActive,
  listAzureOathHavocBaneWindowSupport,
  validateAzureOathHavocBaneContracts,
} from '../src/combat/azureOathHavocBaneWindowAdapter.ts';

const event = {
  kind: 'HAVOC_BANE_APPLIED' as const,
  actorId: 'yangyang-xuanling',
  targetId: 'enemy',
  sourceFactId: 'caller-qualified-xuanling-havoc-bane-application',
  stacksApplied: 1,
  atSeconds: 5,
  sourceTriggerQualification: 'VERIFIED_AZURE_OATH_HAVOC_BANE_APPLICATION' as const,
};

test('Azure Oath source review locks infliction semantics without inferring stack history', () => {
  assert.equal(AZURE_OATH_HAVOC_BANE_SOURCE_REVIEW.sourceTriggerMeaning, 'AFTER_INFLICTING_HAVOC_BANE');
  assert.equal(AZURE_OATH_HAVOC_BANE_SOURCE_REVIEW.occurrencePolicy, 'CALLER_QUALIFIED_TIMESTAMP_ONLY');
  assert.equal(AZURE_OATH_HAVOC_BANE_SOURCE_REVIEW.stackPolicy, 'NO_STACK_OR_UPTIME_INFERENCE');
  assert.equal(AZURE_OATH_HAVOC_BANE_SOURCE_REVIEW.sourceUrls.length, 3);
});

test('Azure Oath support exposes paired Heavy-only contracts without copied values', () => {
  assert.deepEqual(validateAzureOathHavocBaneContracts(), []);
  const support = listAzureOathHavocBaneWindowSupport();
  assert.deepEqual(support.map(row => [row.effectId, row.statOrEffect, row.selectedHitScope]), [
    ['AO-HEAVY-AMP', 'Heavy Attack DMG Amplification', 'HEAVY_DIRECT_HIT_ONLY'],
    ['AO-DEF', 'DEF Ignore', 'HEAVY_DIRECT_HIT_ONLY'],
  ]);
  assert.ok(support.every(row => row.trigger === 'Havoc Bane'
    && row.triggerSemantics === 'AFTER_INFLICTING_HAVOC_BANE'
    && !Object.hasOwn(row, 'value') && !Object.hasOwn(row, 'durationSeconds')));
});

test('one qualified Havoc Bane application reads both canonical R1-R5 values and exact expiry', () => {
  const amp = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'AO-HEAVY-AMP')!;
  const def = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'AO-DEF')!;
  for (const rank of [1, 2, 3, 4, 5] as const) {
    const windows = activateAzureOathHavocBaneWindows({
      selectedWeapon: { id: 'azure-oath', rank },
      wielderId: 'yangyang-xuanling',
      event,
    })!;
    assert.equal(windows.heavyAmplification.value, amp.rankValues[rank - 1]);
    assert.equal(windows.heavyDefenseIgnore.value, def.rankValues[rank - 1]);
    assert.equal(windows.heavyAmplification.expiresAtSeconds, 13);
    assert.equal(windows.heavyDefenseIgnore.expiresAtSeconds, 13);
    assert.equal(windows.heavyAmplification.triggerTargetId, 'enemy');
    assert.equal(windows.heavyDefenseIgnore.sourceFactId, event.sourceFactId);
  }
});

test('same-timestamp order and exact expiry are explicit', () => {
  const windows = activateAzureOathHavocBaneWindows({
    selectedWeapon: { id: 'azure-oath', rank: 1 },
    wielderId: 'yangyang-xuanling',
    event,
  })!;
  for (const window of [windows.heavyAmplification, windows.heavyDefenseIgnore]) {
    assert.equal(isAzureOathHavocBaneWindowActive(window, {
      actorId: 'yangyang-xuanling', atSeconds: 5, sameTimestampOrder: 'BEFORE_TRIGGER',
    }), false);
    assert.equal(isAzureOathHavocBaneWindowActive(window, {
      actorId: 'yangyang-xuanling', atSeconds: 5, sameTimestampOrder: 'AFTER_TRIGGER',
    }), true);
    assert.equal(isAzureOathHavocBaneWindowActive(window, {
      actorId: 'yangyang-xuanling', atSeconds: 13, sameTimestampOrder: 'AFTER_TRIGGER',
    }), false);
  }
});

test('weapon/rank/application proof and canonical source drift fail closed', () => {
  assert.throws(() => activateAzureOathHavocBaneWindows({
    selectedWeapon: { id: 'emerald-of-genesis', rank: 1 },
    wielderId: 'yangyang-xuanling', event,
  }), /exact Azure Oath/);
  assert.throws(() => activateAzureOathHavocBaneWindows({
    selectedWeapon: { id: 'azure-oath', rank: 0 },
    wielderId: 'yangyang-xuanling', event,
  }), /R1 through R5/);
  assert.equal(activateAzureOathHavocBaneWindows({
    selectedWeapon: { id: 'azure-oath', rank: 1 },
    wielderId: 'yangyang-xuanling', event: { ...event, actorId: 'chisa' },
  }), null);
  assert.throws(() => activateAzureOathHavocBaneWindows({
    selectedWeapon: { id: 'azure-oath', rank: 1 },
    wielderId: 'yangyang-xuanling',
    event: { ...event, sourceTriggerQualification: 'UNKNOWN' },
  }), /source-qualified Havoc Bane/);

  const amp = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'AO-HEAVY-AMP')!;
  const def = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'AO-DEF')!;
  assert.ok(validateAzureOathHavocBaneContracts(WEAPON_EFFECT_CATALOG.map(row =>
    row.effectId === amp.effectId ? { ...row, durationSeconds: 9 } : row)).some(issue => issue.includes('contract drift')));
  assert.ok(validateAzureOathHavocBaneContracts(WEAPON_EFFECT_CATALOG.map(row =>
    row.effectId === def.effectId ? { ...row, trigger: 'Unknown' } : row)).some(issue => issue.includes('contract drift')));
});
