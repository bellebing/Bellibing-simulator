import test from 'node:test';
import assert from 'node:assert/strict';
import { activateStaticMistOutroTransfer, activateSharedRejuvenatingGlowWindow,
  isSharedHealingTeamWindowActive, validateSharedSupportStatWindowContracts,
  SHARED_SUPPORT_STAT_WINDOW_REVIEW } from '../src/combat/sharedSupportStatWindows.ts';
import { isIncomingTransferWindowActive } from '../src/combat/incomingTransferState.ts';
import { activateRejuvenatingGlowTeamAtkWindow } from '../src/combat/shorekeeperHealingSupportWindowAdapter.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import { getCharacterMechanicFact } from '../src/data/characterMechanics.ts';
import { buildProfileExecutionWorkQueue } from '../src/profileExecutionWorkQueue.ts';

const outro = { kind: 'OUTRO_SWITCH' as const, actorId: 'aalto', incomingResonatorId: 'jiyan',
  incomingEntry: 'INTRO_SKILL' as const, atSeconds: 2 };
const heal = { kind: 'HEAL_APPLIED' as const, healerId: 'chisa', targetId: 'phrolova', atSeconds: 3,
  sourceTriggerQualification: 'VERIFIED_HEAL_ALLY' as const };
const healingInput = { ownerId: 'chisa', event: heal, selectedSet: { id: 'sonata-7', pieces: 5 },
  teamMemberIds: ['chisa', 'phrolova', 'cantarella'] };

test('Static Mist binds canonical rank values to the actual incoming recipient through the shared core', () => {
  assert.deepEqual(validateSharedSupportStatWindowContracts(), []);
  const effect = WEAPON_EFFECT_CATALOG.find((row) => row.effectId === 'STM-NEXT-ATK')!;
  for (const rank of [1, 2, 3, 4, 5]) {
    const window = activateStaticMistOutroTransfer({ selectedWeapon: { id: 'static-mist', rank }, wielderId: 'aalto', event: outro })!;
    assert.equal(window.coreId, 'incoming-transfer-state-v1');
    assert.equal(window.value, effect.rankValues[rank - 1]);
    assert.equal(window.statOrEffect, 'ATK%');
    assert.equal(window.expiresAtSeconds, 16);
    assert.equal(isIncomingTransferWindowActive(window, 'jiyan', 1.999), false);
    assert.equal(isIncomingTransferWindowActive(window, 'jiyan', 2), true);
    assert.equal(isIncomingTransferWindowActive(window, 'jiyan', 15.999), true);
    assert.equal(isIncomingTransferWindowActive(window, 'jiyan', 16), false);
    assert.equal(isIncomingTransferWindowActive(window, 'aalto', 3), false);
    assert.equal(isIncomingTransferWindowActive(window, 'mortefi', 3), false);
  }
  assert.ok(activateStaticMistOutroTransfer({ selectedWeapon: { id: 'static-mist', rank: 1 }, wielderId: 'aalto',
    event: { ...outro, incomingEntry: 'DIRECT_SWITCH' } }));
});

test('Static Mist requires its wielder Outro and valid rank, recipient and timestamp', () => {
  const input = { selectedWeapon: { id: 'static-mist', rank: 1 }, wielderId: 'aalto', event: outro };
  assert.equal(activateStaticMistOutroTransfer({ ...input, selectedWeapon: { id: 'woodland-aria', rank: 1 } }), null);
  assert.equal(activateStaticMistOutroTransfer({ ...input, wielderId: 'mortefi' }), null);
  assert.equal(activateStaticMistOutroTransfer({ ...input, event: { ...outro, incomingResonatorId: 'aalto' } }), null);
  assert.throws(() => activateStaticMistOutroTransfer({ ...input, event: { ...outro, kind: 'DIRECT_SWITCH' as never } }), /event/);
  for (const rank of [0, 6, 1.5, NaN]) assert.throws(() => activateStaticMistOutroTransfer({ ...input, selectedWeapon: { id: 'static-mist', rank } }), /rank/);
  for (const atSeconds of [-1, NaN, Infinity, Number.MAX_VALUE]) assert.throws(() => activateStaticMistOutroTransfer({ ...input, event: { ...outro, atSeconds } }));
});

test('shared Rejuvenating window supports source-qualified Chisa ally healing without a Shorekeeper-specific path', () => {
  assert.equal(getCharacterMechanicFact('chisa-utility-heal-shield-curves')?.verificationStatus, 'VERIFIED');
  const input = structuredClone(healingInput);
  const window = activateSharedRejuvenatingGlowWindow(input)!;
  assert.equal(window.value, .15);
  assert.equal(window.sourceCharacterId, 'chisa');
  assert.equal(window.expiresAtSeconds, 33);
  assert.equal(isSharedHealingTeamWindowActive(window, 'chisa', 3), true);
  assert.equal(isSharedHealingTeamWindowActive(window, 'phrolova', 32.99), true);
  assert.equal(isSharedHealingTeamWindowActive(window, 'phrolova', 33), false);
  assert.equal(isSharedHealingTeamWindowActive(window, 'jiyan', 5), false);
  input.teamMemberIds.push('jiyan');
  assert.equal(isSharedHealingTeamWindowActive(window, 'jiyan', 5), false, 'caller mutation must not alter an existing window');
});

test('healing trigger qualification, set activation, owner and team are explicit', () => {
  assert.throws(() => activateSharedRejuvenatingGlowWindow({ ...healingInput, event: { ...heal, sourceTriggerQualification: 'UNKNOWN' } }), /unresolved/);
  assert.throws(() => activateSharedRejuvenatingGlowWindow({ ...healingInput, event: { ...heal, kind: 'RESONANCE_SKILL_CAST' as never } }), /applied-heal/);
  assert.equal(activateSharedRejuvenatingGlowWindow({ ...healingInput, selectedSet: { id: 'sonata-7', pieces: 2 } }), null);
  assert.equal(activateSharedRejuvenatingGlowWindow({ ...healingInput, event: { ...heal, healerId: 'cantarella' } }), null);
  assert.equal(activateSharedRejuvenatingGlowWindow({ ...healingInput, event: { ...heal, targetId: 'jiyan' } }), null);
  assert.throws(() => activateSharedRejuvenatingGlowWindow({ ...healingInput, teamMemberIds: ['phrolova'] }), /owner/);
  assert.throws(() => activateSharedRejuvenatingGlowWindow({ ...healingInput, teamMemberIds: ['chisa', 'chisa'] }), /unique/);
  for (const atSeconds of [-1, NaN, Infinity, Number.MAX_VALUE]) assert.throws(() => activateSharedRejuvenatingGlowWindow({ ...healingInput, event: { ...heal, atSeconds } }));
});

test('existing Shorekeeper Rejuvenating API preserves output while delegating to shared healing execution', () => {
  const teamMemberIds = ['augusta', 'iuno', 'the-shorekeeper'];
  const event = { ...heal, healerId: 'the-shorekeeper', targetId: 'augusta',
    healingSourceFactId: 'the-shorekeeper-skill-chaos-theory-healing' as const };
  const legacy = activateRejuvenatingGlowTeamAtkWindow({ event, selectedSonataSetIds: ['sonata-7'], teamMemberIds });
  const shared = activateSharedRejuvenatingGlowWindow({ ...healingInput, ownerId: 'the-shorekeeper', event, teamMemberIds })!;
  assert.deepEqual(legacy, { ...shared, adapterId: 'shorekeeper-healing-support-team-windows-v1' });
});

test('source drift rejects changed trigger/scope/rank/activation and neither primitive closes profile dependencies', () => {
  const weapon = WEAPON_EFFECT_CATALOG.find((row) => row.effectId === 'STM-NEXT-ATK')!;
  const sonata = SONATA_EFFECT_MODELS.find((row) => row.effectId === 'REJUV_ATK')!;
  assert.ok(validateSharedSupportStatWindowContracts([{ ...weapon, appliesTo: 'TEAM' }], [sonata]).length);
  assert.ok(validateSharedSupportStatWindowContracts([{ ...weapon, conditions: ['Requires Intro'] }], [sonata]).length);
  assert.ok(validateSharedSupportStatWindowContracts([weapon], [{ ...sonata, pieces: 2 }]).length);
  assert.ok(validateSharedSupportStatWindowContracts([weapon], [{ ...sonata, trigger: 'Cast Skill' }]).length);
  assert.ok(validateSharedSupportStatWindowContracts([weapon], [{ ...sonata, value: .2 }]).length);
  assert.ok(validateSharedSupportStatWindowContracts([weapon, weapon], [sonata]).length);
  const queue = buildProfileExecutionWorkQueue();
  for (const id of [SHARED_SUPPORT_STAT_WINDOW_REVIEW.weaponPendingId, SHARED_SUPPORT_STAT_WINDOW_REVIEW.healingPendingId]) {
    assert.equal(queue.edges.find((row) => row.pendingExecutionId === id)?.semanticStatus, 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE');
  }
  assert.equal(queue.summary.totalEdges, 83);
  assert.deepEqual(SHARED_SUPPORT_STAT_WINDOW_REVIEW.closesPendingExecutionIds, []);
});
