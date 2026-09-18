import test from 'node:test';
import assert from 'node:assert/strict';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import {
  activateFreezeFrameGlacioChafeWindows,
  isFreezeFrameGlacioChafeWindowActive,
  listFreezeFrameGlacioChafeWindowSupport,
  validateFreezeFrameGlacioChafeContracts,
} from '../src/combat/freezeFrameGlacioChafeWindowAdapter.ts';

const team = ['lucilla', 'hiyuki', 'chisa'] as const;
const event = {
  kind: 'GLACIO_CHAFE_APPLIED' as const,
  actorId: 'lucilla',
  targetId: 'enemy',
  sourceFactId: 'caller-qualified-lucilla-glacio-chafe-application',
  stacksApplied: 1,
  atSeconds: 5,
  sourceTriggerQualification: 'VERIFIED_GLACIO_CHAFE_APPLICATION' as const,
};

test('Freeze Frame support exposes exactly separate SELF Glacio and TEAM ATK contracts without copied values', () => {
  assert.deepEqual(validateFreezeFrameGlacioChafeContracts(), []);
  const support = listFreezeFrameGlacioChafeWindowSupport();
  assert.deepEqual(support.map(row => [row.effectId, row.statOrEffect, row.appliesTo]), [
    ['FF-GLACIO', 'Glacio DMG', 'SELF'],
    ['FF-TEAM-ATK', 'ATK%', 'TEAM'],
  ]);
  assert.equal(support[0].sameNameStacking, null);
  assert.equal(support[1].sameNameStacking, 'REJECT_DUPLICATE_ACTIVE_SOURCE');
  assert.ok(support.every(row => !Object.hasOwn(row, 'value') && !Object.hasOwn(row, 'durationSeconds')));
});

test('one explicit Glacio Chafe application reads both canonical rank values and separate expiries', () => {
  const selfEffect = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'FF-GLACIO')!;
  const teamEffect = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'FF-TEAM-ATK')!;
  for (const rank of [1, 2, 3, 4, 5] as const) {
    const windows = activateFreezeFrameGlacioChafeWindows({
      selectedWeapon: { id: 'freeze-frame', rank },
      wielderId: 'lucilla',
      teamMemberIds: team,
      event,
    })!;
    assert.equal(windows.selfGlacio.value, selfEffect.rankValues[rank - 1]);
    assert.equal(windows.teamAtk.value, teamEffect.rankValues[rank - 1]);
    assert.equal(windows.selfGlacio.expiresAtSeconds, 5 + selfEffect.durationSeconds!);
    assert.equal(windows.teamAtk.expiresAtSeconds, 5 + teamEffect.durationSeconds!);
    assert.equal(windows.selfGlacio.sourceFactId, event.sourceFactId);
    assert.equal(windows.teamAtk.triggerTargetId, 'enemy');
  }
});

test('SELF and TEAM recipient scopes remain distinct', () => {
  const windows = activateFreezeFrameGlacioChafeWindows({
    selectedWeapon: { id: 'freeze-frame', rank: 1 },
    wielderId: 'lucilla',
    teamMemberIds: team,
    event,
  })!;
  assert.equal(isFreezeFrameGlacioChafeWindowActive(windows.selfGlacio, {
    actorId: 'lucilla', atSeconds: 6, sameTimestampOrder: 'AFTER_TRIGGER',
  }), true);
  assert.equal(isFreezeFrameGlacioChafeWindowActive(windows.selfGlacio, {
    actorId: 'hiyuki', atSeconds: 6, sameTimestampOrder: 'AFTER_TRIGGER',
  }), false);
  assert.equal(isFreezeFrameGlacioChafeWindowActive(windows.teamAtk, {
    actorId: 'lucilla', atSeconds: 6, sameTimestampOrder: 'AFTER_TRIGGER',
  }), true);
  assert.equal(isFreezeFrameGlacioChafeWindowActive(windows.teamAtk, {
    actorId: 'hiyuki', atSeconds: 6, sameTimestampOrder: 'AFTER_TRIGGER',
  }), true);
  assert.equal(isFreezeFrameGlacioChafeWindowActive(windows.teamAtk, {
    actorId: 'augusta', atSeconds: 6, sameTimestampOrder: 'AFTER_TRIGGER',
  }), false);
});

test('same-timestamp ordering and both exact expiries are fail-closed', () => {
  const windows = activateFreezeFrameGlacioChafeWindows({
    selectedWeapon: { id: 'freeze-frame', rank: 1 },
    wielderId: 'lucilla',
    teamMemberIds: team,
    event,
  })!;
  for (const window of [windows.selfGlacio, windows.teamAtk]) {
    assert.equal(isFreezeFrameGlacioChafeWindowActive(window, {
      actorId: 'lucilla', atSeconds: 5, sameTimestampOrder: 'BEFORE_TRIGGER',
    }), false);
    assert.equal(isFreezeFrameGlacioChafeWindowActive(window, {
      actorId: 'lucilla', atSeconds: 5, sameTimestampOrder: 'AFTER_TRIGGER',
    }), true);
    assert.equal(isFreezeFrameGlacioChafeWindowActive(window, {
      actorId: 'lucilla', atSeconds: window.expiresAtSeconds, sameTimestampOrder: 'AFTER_TRIGGER',
    }), false);
  }
});

test('weapon/rank/team/application proof and source contract drift fail closed', () => {
  assert.throws(() => activateFreezeFrameGlacioChafeWindows({
    selectedWeapon: { id: 'stringmaster', rank: 1 }, wielderId: 'lucilla', teamMemberIds: team, event,
  }), /exact selected Freeze Frame/);
  assert.throws(() => activateFreezeFrameGlacioChafeWindows({
    selectedWeapon: { id: 'freeze-frame', rank: 0 }, wielderId: 'lucilla', teamMemberIds: team, event,
  }), /R1 through R5/);
  assert.throws(() => activateFreezeFrameGlacioChafeWindows({
    selectedWeapon: { id: 'freeze-frame', rank: 1 }, wielderId: 'lucilla',
    teamMemberIds: ['hiyuki', 'chisa'], event,
  }), /including the wielder/);
  assert.equal(activateFreezeFrameGlacioChafeWindows({
    selectedWeapon: { id: 'freeze-frame', rank: 1 }, wielderId: 'lucilla', teamMemberIds: team,
    event: { ...event, actorId: 'hiyuki' },
  }), null);
  assert.throws(() => activateFreezeFrameGlacioChafeWindows({
    selectedWeapon: { id: 'freeze-frame', rank: 1 }, wielderId: 'lucilla', teamMemberIds: team,
    event: { ...event, sourceTriggerQualification: 'UNKNOWN' },
  }), /source-qualified Glacio Chafe/);

  const self = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'FF-GLACIO')!;
  const teamEffect = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'FF-TEAM-ATK')!;
  assert.ok(validateFreezeFrameGlacioChafeContracts(WEAPON_EFFECT_CATALOG.map(row =>
    row.effectId === self.effectId ? { ...row, durationSeconds: 13 } : row)).some(issue => issue.includes('duration drift')));
  assert.ok(validateFreezeFrameGlacioChafeContracts(WEAPON_EFFECT_CATALOG.map(row =>
    row.effectId === teamEffect.effectId ? { ...row, notes: 'stacking semantics intentionally removed' } : row))
    .some(issue => issue.includes('non-stacking source note drift')));
});
