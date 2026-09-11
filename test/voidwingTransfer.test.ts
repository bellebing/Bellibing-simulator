import assert from 'node:assert/strict';
import test from 'node:test';
import { ECHO_EFFECT_MODELS, VOIDWING_MOTH_TRANSFER_EFFECT as effect } from '../src/data/echoEffects.ts';
import { activateEchoTransferWindow } from '../src/combat/echoTransferWindowAdapter.ts';
import { isIncomingTransferWindowActive } from '../src/combat/incomingTransferState.ts';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';
import { buildProfileExecutionWorkQueue } from '../src/profileExecutionWorkQueue.ts';

const input = () => ({ effectId: effect.effectId, wielderId: 'denia', rank: 5, priorActivationState: 'NONE_ACTIVE' as const,
  armEvent: { kind: 'ECHO_SKILL_USE' as const, actorId: 'denia', echoId: effect.echoId, atSeconds: 2 },
  outroEvent: { kind: 'OUTRO_SWITCH' as const, actorId: 'denia', incomingResonatorId: 'luuk-herssen',
    incomingEntry: 'DIRECT_SWITCH' as const, atSeconds: 3 } });

test('Voidwing use-to-Outro reads canonical ATK and both windows without a damage or Intro prerequisite', () => {
  const window = activateEchoTransferWindow(input())!;
  assert.equal(window.value, effect.value);
  assert.equal(window.value, .12);
  assert.equal(window.statOrEffect, 'ATK%');
  assert.equal(window.incomingResonatorId, 'luuk-herssen');
  assert.equal(window.sourceId, effect.echoId);
  assert.equal(window.expiresAtSeconds, 18);
  assert.equal(window.endsOnIncomingSwitchOut, false);
  assert.equal(isIncomingTransferWindowActive(window, 'denia', 4), false);
  assert.equal(isIncomingTransferWindowActive(window, 'luuk-herssen', 17.999), true);
  assert.equal(isIncomingTransferWindowActive(window, 'luuk-herssen', 18), false);
  assert.equal(isIncomingTransferWindowActive(window, 'mornye', 4), false);
  const base = input();
  assert.ok(activateEchoTransferWindow({ ...base, outroEvent: { ...base.outroEvent, atSeconds: 17 } }));
  assert.equal(activateEchoTransferWindow({ ...base, outroEvent: { ...base.outroEvent, atSeconds: 17.001 } }), null);
  assert.equal(activateEchoTransferWindow({ ...base, outroEvent: { ...base.outroEvent, atSeconds: 1 } }), null);
});

test('Voidwing exact use identity rank prior state and tied-event order cannot be silently supplied', () => {
  const base = input();
  for (const rank of [undefined, 1, 4, 6]) assert.throws(() => activateEchoTransferWindow({ ...base, rank }), /Rank-5/);
  for (const priorActivationState of [undefined, 'UNKNOWN' as const]) {
    assert.throws(() => activateEchoTransferWindow({ ...base, priorActivationState }), /explicitly absent/);
  }
  assert.throws(() => activateEchoTransferWindow({ ...base, armEvent: { ...base.armEvent, kind: 'ECHO_SKILL_SUMMON' } }), /unsupported Echo transfer arm/);
  assert.equal(activateEchoTransferWindow({ ...base, armEvent: { ...base.armEvent, echoId: 'echo-60001895' } }), null);
  assert.equal(activateEchoTransferWindow({ ...base, armEvent: { ...base.armEvent, actorId: 'mornye' } }), null);
  assert.equal(activateEchoTransferWindow({ ...base, outroEvent: { ...base.outroEvent, actorId: 'mornye' } }), null);
  const tied = { ...base, outroEvent: { ...base.outroEvent, atSeconds: 2 } };
  assert.throws(() => activateEchoTransferWindow(tied), /order is unresolved/);
  assert.throws(() => activateEchoTransferWindow({ ...tied, sameTimestampArmOrder: 'UNKNOWN' }), /order is unresolved/);
  assert.equal(activateEchoTransferWindow({ ...tied, sameTimestampArmOrder: 'OUTRO_BEFORE_ECHO' }), null);
  assert.ok(activateEchoTransferWindow({ ...tied, sameTimestampArmOrder: 'ECHO_BEFORE_OUTRO' }));
  assert.throws(() => activateEchoTransferWindow({ ...base, armEvent: { ...base.armEvent, atSeconds: Number.MAX_VALUE } }), /not representable/);
});

test('Voidwing canonical source drift fails closed and projected capability has no copied numeric truth', () => {
  for (const patch of [{ trigger: 'Land a hit' }, { appliesTo: 'TEAM' }, { mechanicsStatus: 'UNKNOWN' },
    { activationWindowSeconds: 14 }, { durationSeconds: null }, { requiresIncomingIntro: true }]) {
    const catalog = ECHO_EFFECT_MODELS.map((e) => e.effectId === effect.effectId ? { ...e, ...patch } : e);
    assert.throws(() => activateEchoTransferWindow({ ...input(), catalog: catalog as never }), /Invalid Echo transfer source/);
  }
  const catalog = ECHO_EFFECT_MODELS.map((e) => e.effectId === effect.effectId ? { ...e, value: .13 } : e);
  assert.equal(activateEchoTransferWindow({ ...input(), catalog })?.value, .13, 'canonical amount is read, not copied into adapter');
  const db = buildCharacterDatabase();
  const support = db.gear.echoTransferWindows.find((r) => r.effectId === effect.effectId)!;
  assert.equal(support.armEventKind, 'ECHO_SKILL_USE');
  assert.equal(support.requiredRank, 5);
  assert.equal(support.priorActivationRequirement, 'NONE_ACTIVE');
  assert.equal(Object.hasOwn(support, 'value'), false);
  support.echoId = 'mutated';
  assert.equal(buildCharacterDatabase().gear.echoTransferWindows.find((r) => r.effectId === effect.effectId)?.echoId, effect.echoId);
});

test('Denia Tune discovers exact transfer capability while attack scaling and all six execution dependencies remain open', () => {
  const db = buildCharacterDatabase(), q = buildProfileExecutionWorkQueue();
  const preset = db.profiles.presets.find((p) => p.id === 'denia-tune-strain-luuk')!;
  assert.equal(db.profiles.echoLoadouts.find((p) => p.id === preset.echoLoadoutProfileId)?.mainEchoId, effect.echoId);
  assert.ok(db.gear.echoTransferWindows.some((r) => r.echoId === effect.echoId));
  assert.equal(db.gear.echoAttacks.some((r) => r.echoId === effect.echoId), false);
  const edges = q.edges.filter((e) => e.presetId === preset.id);
  assert.equal(edges.length, 6);
  assert.equal(edges.find((e) => e.pendingExecutionId.endsWith('voidwing-moth-outro-transfer-adapter'))?.semanticStatus, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  assert.equal(edges.find((e) => e.pendingExecutionId.endsWith('voidwing-moth-active-skill-damage-adapter'))?.semanticStatus, 'UNREVIEWED');
  assert.equal(q.summary.totalEdges, 83);
  assert.equal(db.referenceTeam01.unresolvedDependencies.length, 6);
  assert.deepEqual(db.characters.filter((c) => c.readiness?.disposition === 'DPS_READY').map((c) => c.id), ['augusta', 'ciaccona']);
});

test('Voidwing rejects changed effect semantics and missing reviewed provenance in caller catalogs', () => {
  for (const patch of [{ statOrEffect: 'Havoc DMG Bonus' }, { wielderCharacterIds: ['mornye'] },
    { value: 0 }, { value: -0.12 }, { provenance: { ...effect.provenance, sourceUrls: [] } },
    { provenance: { ...effect.provenance, checkedAt: 'UNREVIEWED' } }]) {
    const catalog = ECHO_EFFECT_MODELS.map((row) => row.effectId === effect.effectId ? { ...row, ...patch } : row);
    assert.throws(() => activateEchoTransferWindow({ ...input(), catalog }), /Invalid Echo transfer source/);
  }
});

test('Voidwing rejects ambiguous duplicate source rows and returns detached activation values', () => {
  for (const rows of [[effect, { ...effect, value: .24 }], [{ ...effect, value: .24 }, effect]]) {
    const catalog = [...ECHO_EFFECT_MODELS.filter((row) => row.effectId !== effect.effectId), ...rows];
    assert.throws(() => activateEchoTransferWindow({ ...input(), catalog }), /Invalid Echo transfer source/);
  }
  const catalog = ECHO_EFFECT_MODELS.map((row) => ({ ...row }));
  const first = activateEchoTransferWindow({ ...input(), catalog })!;
  catalog.find((row) => row.effectId === effect.effectId)!.value = .24;
  assert.equal(first.value, .12);
  assert.equal(activateEchoTransferWindow(input())!.value, .12);
});
