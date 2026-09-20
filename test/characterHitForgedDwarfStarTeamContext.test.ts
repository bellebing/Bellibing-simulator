import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import {
  activateForgedDwarfStarTeamAtkWindow,
  isForgedDwarfStarTeamAtkWindowActive,
  listForgedDwarfStarTeamWindowSupport,
  validateForgedDwarfStarTeamContract,
} from '../src/combat/forgedDwarfStarTeamWindowAdapter.ts';
import {
  assembleCharacterHitContext,
  compareCharacterHitWithAssembledContext,
  listForgedDwarfStarTeamHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type {
  HitContextIncomingTransfers,
  ProvenHitForgedDwarfStarTeamWindow,
} from '../src/combat/hitContextIncomingTransfers.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `fds-team-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'fds-team-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(hitAtSeconds = 3): CharacterHitContextSelection {
  const character = CHARACTER_CATALOG.find(row => row.id === 'aemeath')!;
  const hit = listCharacterDirectHitSupport().find(row => row.characterId === 'aemeath')!;
  const weapon = WEAPON_CATALOG.find(row => row.releaseStatus === 'RELEASED'
    && row.verificationStatus === 'VERIFIED' && row.weaponType === character.weaponType
    && row.id !== 'abyss-surges' && Number.isFinite(row.level90BaseAtk) && row.secondary)!;
  assert.ok(character?.element && hit && weapon);
  return {
    hit: { characterId: 'aemeath', factId: hit.factId, componentIndex: 0, landedHitCount: 1,
      sequence: 0, maxSkills: true },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: 'fds-team-aemeath-hit',
    hitAtSeconds,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: weapon.id, level: 90, rank: 1 },
  };
}

function chainRow(
  patch: Partial<ProvenHitForgedDwarfStarTeamWindow> = {},
): ProvenHitForgedDwarfStarTeamWindow {
  return {
    effectId: 'FDS-TEAM',
    evidenceId: 'synthetic-fds-team-chain',
    sourceWielderId: 'denia',
    sourceEquipmentEvidenceId: 'synthetic-denia-fds-r1',
    sourceWeaponId: 'forged-dwarf-star',
    sourceWeaponRank: 1,
    sourceQualification: 'SOURCE_PROVEN_FORGED_DWARF_STAR_TEAM_CHAIN',
    sourceEquipmentAtEventQualified: true,
    teamMemberIds: ['aemeath', 'denia', 'chisa'],
    sourceSelfEvent: {
      kind: 'FUSION_BURST_APPLIED',
      actorId: 'denia',
      targetId: 'source-target',
      sourceFactId: 'caller-qualified-denia-fusion-burst',
      atSeconds: 1,
      sourceTriggerQualification: 'VERIFIED_FORGED_DWARF_STAR_STATUS_APPLICATION',
    },
    recipientEvent: {
      kind: 'TUNE_STRAIN_SHIFTING_APPLIED',
      actorId: 'aemeath',
      targetId: 'recipient-target',
      sourceFactId: 'caller-qualified-aemeath-tune-strain',
      atSeconds: 2,
      sourceTriggerQualification: 'VERIFIED_FORGED_DWARF_STAR_STATUS_APPLICATION',
    },
    sourceSelfPriorActivationState: 'NONE_ACTIVE',
    sourceSelfNoLaterActivationThroughRecipientEvent: true,
    sourceSelfOrderAtRecipientEvent: 'AFTER_TRIGGER',
    teamPriorActivationState: 'NONE_ACTIVE',
    teamNoLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
    ...patch,
  };
}

function incoming(
  equippedCards: ReturnType<typeof cards>,
  row = chainRow(),
): HitContextIncomingTransfers {
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    eventContextId: 'fds-team-aemeath-hit',
    evidenceId: 'synthetic-fds-team-incoming-context',
    sonataOutros: [],
    teamWeaponChainedStatusApplications: [row],
  };
}

function remaining(a: ReturnType<typeof assembleCharacterHitContext>): RemainingHitContext {
  return {
    status: 'QUALIFIED', provenance: 'CALLER_QUALIFIED',
    assemblyKey: a.assemblyKey,
    evidenceId: 'synthetic-fds-team-remaining-context',
    requirements: a.requirements.map(id => ({ id, evidenceId: `synthetic-proof:${id}` })),
    buildDependentEffectsRecomputed: true,
    scalingPercent: 0,
    scalingFlat: 0,
    critRate: 0,
    critDamage: 0,
    damageBonus: 0,
    amplification: 0,
    defenseMultiplier: 0.5,
    resistanceMultiplier: 0.9,
    damageReduction: 0,
  };
}

test('FDS-TEAM support is value-free and preserves the exact two-stage source chain', () => {
  assert.deepEqual(validateForgedDwarfStarTeamContract(), []);
  const source = listForgedDwarfStarTeamWindowSupport();
  const context = listForgedDwarfStarTeamHitContextSupport();
  assert.equal(source.length, 1);
  assert.equal(source[0].effectId, 'FDS-TEAM');
  assert.equal(source[0].statOrEffect, 'ATK%');
  assert.equal(source[0].chainMeaning,
    'ACTIVE_WIELDER_FDS_LIB_THEN_RECIPIENT_OWN_FUSION_BURST_OR_TUNE_STRAIN_SHIFTING');
  assert.equal(source[0].recipientPolicy, 'ONLY_THE_RESONATOR_WHO_INFLICTED_THE_STATUS');
  assert.equal(source[0].sameNameStacking, 'REJECT_DUPLICATE_ACTIVE_SOURCE');
  assert.equal(Object.hasOwn(source[0], 'value'), false);
  assert.equal(Object.hasOwn(source[0], 'durationSeconds'), false);
  assert.equal(context[0].requiresActiveSourceSelfWindowProof, true);
  assert.equal(context[0].requiresExplicitRecipientStatusApplication, true);
});

test('active source FDS-LIB prerequisite gates recipient R1-R5 ATK windows with exact lifetimes', () => {
  const source = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'FDS-TEAM')!;
  for (const rank of [1, 2, 3, 4, 5] as const) {
    const row = chainRow({ sourceWeaponRank: rank });
    const window = activateForgedDwarfStarTeamAtkWindow({
      selectedWeapon: { id: row.sourceWeaponId, rank },
      sourceWielderId: row.sourceWielderId,
      teamMemberIds: row.teamMemberIds,
      sourceSelfEvent: row.sourceSelfEvent,
      recipientEvent: row.recipientEvent,
      sourceSelfOrderAtRecipientEvent: row.sourceSelfOrderAtRecipientEvent,
    })!;
    assert.ok(window);
    assert.equal(window.value, source.rankValues[rank - 1]);
    assert.equal(window.sourceSelfStartedAtSeconds, 1);
    assert.equal(window.sourceSelfExpiresAtSeconds, 6);
    assert.equal(window.startedAtSeconds, 2);
    assert.equal(window.expiresAtSeconds, 17);
    assert.equal(window.recipientCharacterId, 'aemeath');
    assert.equal(window.sourceSelfTargetId, 'source-target');
    assert.equal(window.recipientTriggerTargetId, 'recipient-target',
      'source text does not require the two status applications to target the same enemy');
    assert.equal(isForgedDwarfStarTeamAtkWindowActive(window, {
      actorId: 'aemeath', atSeconds: 2, sameTimestampOrder: 'BEFORE_TRIGGER',
    }), false);
    assert.equal(isForgedDwarfStarTeamAtkWindowActive(window, {
      actorId: 'aemeath', atSeconds: 2, sameTimestampOrder: 'AFTER_TRIGGER',
    }), true);
    assert.equal(isForgedDwarfStarTeamAtkWindowActive(window, {
      actorId: 'chisa', atSeconds: 3, sameTimestampOrder: 'AFTER_TRIGGER',
    }), false);
    assert.equal(isForgedDwarfStarTeamAtkWindowActive(window, {
      actorId: 'aemeath', atSeconds: 17, sameTimestampOrder: 'AFTER_TRIGGER',
    }), false);
  }
});

test('source self window must already be active at the recipient status event, including tied ordering', () => {
  const base = chainRow();
  assert.equal(activateForgedDwarfStarTeamAtkWindow({
    selectedWeapon: { id: base.sourceWeaponId, rank: base.sourceWeaponRank },
    sourceWielderId: base.sourceWielderId,
    teamMemberIds: base.teamMemberIds,
    sourceSelfEvent: base.sourceSelfEvent,
    recipientEvent: { ...base.recipientEvent, atSeconds: 6 },
    sourceSelfOrderAtRecipientEvent: 'AFTER_TRIGGER',
  }), null, 'FDS-LIB expires exactly at 6s');

  const tiedRecipient = { ...base.recipientEvent, atSeconds: 1 };
  assert.equal(activateForgedDwarfStarTeamAtkWindow({
    selectedWeapon: { id: base.sourceWeaponId, rank: base.sourceWeaponRank },
    sourceWielderId: base.sourceWielderId,
    teamMemberIds: base.teamMemberIds,
    sourceSelfEvent: base.sourceSelfEvent,
    recipientEvent: tiedRecipient,
    sourceSelfOrderAtRecipientEvent: 'BEFORE_TRIGGER',
  }), null);
  assert.ok(activateForgedDwarfStarTeamAtkWindow({
    selectedWeapon: { id: base.sourceWeaponId, rank: base.sourceWeaponRank },
    sourceWielderId: base.sourceWielderId,
    teamMemberIds: base.teamMemberIds,
    sourceSelfEvent: base.sourceSelfEvent,
    recipientEvent: tiedRecipient,
    sourceSelfOrderAtRecipientEvent: 'AFTER_TRIGGER',
  }));
});

test('cross-owner FDS-TEAM contributes only to the selected triggering recipient and leaves profile timeline pending', () => {
  const sel = selection(), current = cards();
  const proof = incoming(current);
  const after = assembleCharacterHitContext(sel, current, { incoming: proof });
  const sourceId = 'team:weapon-chain:FDS-TEAM:denia';
  const contribution = after.eventContributions.find(row => row.sourceId === sourceId)!;
  const source = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'FDS-TEAM')!;
  assert.equal(contribution.value, source.rankValues[0]);
  assert.equal(contribution.stat, 'ATK%');
  assert.equal(contribution.active, true);
  assert.equal(contribution.sourceSelfFactId, 'caller-qualified-denia-fusion-burst');
  assert.equal(contribution.recipientSourceFactId, 'caller-qualified-aemeath-tune-strain');
  assert.ok(!after.requirements.includes(sourceId));
  assert.ok(after.requirements.includes('selected-team-effects'));
  assert.equal(after.authorizesRotationDps, false);
});

test('FDS-TEAM current and candidate require independent exact chained evidence', () => {
  const sel = selection(), current = cards(), candidate = candidateCards();
  const currentIncoming = incoming(current), candidateIncoming = incoming(candidate);
  const currentAssembly = assembleCharacterHitContext(sel, current, { incoming: currentIncoming });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { incoming: candidateIncoming });
  const input = {
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { incoming: currentIncoming }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { incoming: candidateIncoming }, remaining: remaining(candidateAssembly) },
  };
  assert.equal(compareCharacterHitWithAssembledContext(input).comparison.status, 'EVALUATED_HIT_COMPARISON');
  assert.throws(() => compareCharacterHitWithAssembledContext({
    ...input,
    candidate: { ...input.candidate, events: { incoming: currentIncoming } },
  }), /per-build incoming-transfer proof/);
});

test('source weapon/team, both status occurrences and both lifecycle stages fail closed', () => {
  const sel = selection(), current = cards(), original = chainRow();
  const patches: Partial<ProvenHitForgedDwarfStarTeamWindow>[] = [
    { sourceWielderId: 'not-a-character' },
    { sourceEquipmentEvidenceId: '' },
    { sourceWeaponId: 'stringmaster' as 'forged-dwarf-star' },
    { sourceWeaponRank: 0 as 1 },
    { sourceQualification: 'UNKNOWN' as never },
    { sourceEquipmentAtEventQualified: false as true },
    { teamMemberIds: ['denia', 'chisa'] },
    { teamMemberIds: ['aemeath', 'denia', 'not-a-character'] },
    { teamMemberIds: ['aemeath', 'denia', 'aemeath'] },
    { sourceSelfEvent: { ...original.sourceSelfEvent, actorId: 'aemeath' } },
    { recipientEvent: { ...original.recipientEvent, actorId: 'chisa' } },
    { recipientEvent: { ...original.recipientEvent, sourceTriggerQualification: 'UNKNOWN' } },
    { sourceSelfPriorActivationState: 'UNKNOWN' as never },
    { sourceSelfNoLaterActivationThroughRecipientEvent: false as true },
    { sourceSelfOrderAtRecipientEvent: 'UNKNOWN' as never },
    { teamPriorActivationState: 'UNKNOWN' as never },
    { teamNoLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
  ];
  for (const patch of patches) {
    const bad = incoming(current, chainRow(patch));
    assert.throws(() => assembleCharacterHitContext(sel, current, { incoming: bad }));
  }
});

test('same-name FDS-TEAM stacking is rejected and the cross-owner adapter cannot masquerade as self-owned', () => {
  const sel = selection(), current = cards(), base = incoming(current);
  const duplicate: HitContextIncomingTransfers = {
    ...base,
    teamWeaponChainedStatusApplications: [
      base.teamWeaponChainedStatusApplications![0],
      { ...base.teamWeaponChainedStatusApplications![0],
        sourceWielderId: 'the-shorekeeper',
        sourceEquipmentEvidenceId: 'synthetic-shorekeeper-fds-r1',
        teamMemberIds: ['aemeath', 'the-shorekeeper', 'chisa'],
        sourceSelfEvent: { ...base.teamWeaponChainedStatusApplications![0].sourceSelfEvent,
          actorId: 'the-shorekeeper', sourceFactId: 'caller-qualified-shorekeeper-fusion-burst' } },
    ],
  };
  assert.throws(() => assembleCharacterHitContext(sel, current, { incoming: duplicate }),
    /same-name stacking is unreviewed/);

  const self = chainRow({
    sourceWielderId: 'aemeath',
    sourceEquipmentEvidenceId: 'synthetic-aemeath-fds-r1',
    teamMemberIds: ['aemeath', 'denia', 'chisa'],
    sourceSelfEvent: { ...chainRow().sourceSelfEvent, actorId: 'aemeath' },
    recipientEvent: { ...chainRow().recipientEvent, actorId: 'aemeath' },
  });
  assert.throws(() => assembleCharacterHitContext(sel, current, { incoming: incoming(current, self) }));
});

test('FDS-TEAM structural source drift fails while numeric rank truth stays single-owned', () => {
  const source = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'FDS-TEAM')!;
  for (const patch of [
    { durationSeconds: 14 },
    { appliesTo: 'SELF' as const },
    { trigger: 'Any status' },
    { maxStacks: 2 },
  ]) {
    const drifted = WEAPON_EFFECT_CATALOG.map(row => row.effectId === source.effectId
      ? { ...row, ...patch }
      : row);
    assert.ok(validateForgedDwarfStarTeamContract(drifted).length > 0);
  }
});
