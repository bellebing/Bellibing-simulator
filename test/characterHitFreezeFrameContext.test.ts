import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import {
  assembleCharacterHitContext,
  compareCharacterHitWithAssembledContext,
  listFreezeFrameStatusHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type {
  HitContextWeaponEvents,
  ProvenHitFreezeFrameApplication,
} from '../src/combat/hitContextWeaponEvents.ts';
import type {
  HitContextIncomingTransfers,
  ProvenHitFreezeFrameTeamWindow,
} from '../src/combat/hitContextIncomingTransfers.ts';

const currentCards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `freeze-frame-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const cards = currentCards();
  cards[0] = createRank5EchoAtLevel0({ id: 'freeze-frame-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return cards;
};

function selection(characterId: string, hitAtSeconds = 2): CharacterHitContextSelection {
  const character = CHARACTER_CATALOG.find(row => row.id === characterId)!;
  const hit = listCharacterDirectHitSupport().find(row => row.characterId === characterId)!;
  assert.ok(character?.element && hit, `missing direct hit for ${characterId}`);
  const weapon = characterId === 'lucilla'
    ? WEAPON_CATALOG.find(row => row.id === 'freeze-frame')!
    : WEAPON_CATALOG.find(row => row.releaseStatus === 'RELEASED'
      && row.verificationStatus === 'VERIFIED' && row.weaponType === character.weaponType
      && row.id !== 'abyss-surges' && Number.isFinite(row.level90BaseAtk) && row.secondary)!;
  assert.ok(weapon);
  return {
    hit: { characterId, factId: hit.factId, componentIndex: 0, landedHitCount: 1,
      sequence: 0, maxSkills: true },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: `freeze-frame-hit-${characterId}`,
    hitAtSeconds,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: weapon.id, level: 90, rank: 1 },
  };
}

function application(
  patch: Partial<ProvenHitFreezeFrameApplication> = {},
): ProvenHitFreezeFrameApplication {
  return {
    evidenceId: 'synthetic-lucilla-freeze-frame-application',
    event: {
      kind: 'GLACIO_CHAFE_APPLIED',
      actorId: 'lucilla',
      targetId: 'enemy',
      sourceFactId: 'caller-qualified-lucilla-glacio-chafe-source-fact',
      stacksApplied: 1,
      atSeconds: 1,
      sourceTriggerQualification: 'VERIFIED_GLACIO_CHAFE_APPLICATION',
    },
    teamMemberIds: ['lucilla', 'hiyuki', 'chisa'],
    equipmentAtEventQualified: true,
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
    ...patch,
  };
}

function selfEvents(
  cards: ReturnType<typeof currentCards>,
  patch: Partial<ProvenHitFreezeFrameApplication> = {},
): HitContextWeaponEvents {
  return {
    echoStatKey: projectRank5EchoStats(cards).key,
    weapon: { id: 'freeze-frame', rank: 1 },
    eventContextId: 'freeze-frame-hit-lucilla',
    evidenceId: 'synthetic-lucilla-freeze-frame-context',
    casts: [],
    freezeFrameApplications: [application(patch)],
  };
}

function incomingRow(
  patch: Partial<ProvenHitFreezeFrameTeamWindow> = {},
): ProvenHitFreezeFrameTeamWindow {
  return {
    effectId: 'FF-TEAM-ATK',
    evidenceId: 'synthetic-lucilla-freeze-frame-team-window',
    sourceWielderId: 'lucilla',
    sourceEquipmentEvidenceId: 'synthetic-lucilla-freeze-frame-r1',
    sourceWeaponId: 'freeze-frame',
    sourceWeaponRank: 1,
    sourceQualification: 'SOURCE_PROVEN_GLACIO_CHAFE_APPLICATION',
    sourceEquipmentAtEventQualified: true,
    teamMemberIds: ['lucilla', 'hiyuki', 'chisa'],
    event: {
      kind: 'GLACIO_CHAFE_APPLIED',
      actorId: 'lucilla',
      targetId: 'enemy',
      sourceFactId: 'caller-qualified-lucilla-glacio-chafe-source-fact',
      stacksApplied: 1,
      atSeconds: 1,
      sourceTriggerQualification: 'VERIFIED_GLACIO_CHAFE_APPLICATION',
    },
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
    ...patch,
  };
}

function incomingEvents(
  cards: ReturnType<typeof currentCards>,
  characterId = 'hiyuki',
  row = incomingRow(),
): HitContextIncomingTransfers {
  return {
    echoStatKey: projectRank5EchoStats(cards).key,
    eventContextId: `freeze-frame-hit-${characterId}`,
    evidenceId: 'synthetic-cross-owner-freeze-frame-context',
    sonataOutros: [],
    teamWeaponStatusApplications: [row],
  };
}

function remaining(a: ReturnType<typeof assembleCharacterHitContext>): RemainingHitContext {
  return {
    status: 'QUALIFIED',
    assemblyKey: a.assemblyKey,
    evidenceId: 'synthetic-freeze-frame-remaining-context',
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

test('Freeze Frame hit support keeps the two canonical windows separate and value-free', () => {
  const support = listFreezeFrameStatusHitContextSupport();
  assert.deepEqual(support.map(row => [row.effectId, row.statOrEffect, row.appliesTo]), [
    ['FF-GLACIO', 'Glacio DMG', 'SELF'],
    ['FF-TEAM-ATK', 'ATK%', 'TEAM'],
  ]);
  assert.equal(support[0].requiresExplicitTeamMembershipProof, false);
  assert.equal(support[1].requiresExplicitTeamMembershipProof, true);
  assert.equal(support[1].sameNameStacking, 'REJECT_DUPLICATE_ACTIVE_SOURCE');
  assert.ok(support.every(row => !Object.hasOwn(row, 'value') && !Object.hasOwn(row, 'durationSeconds')));
});

test('Lucilla self-owned Freeze Frame resolves both paired requirements from one qualified application', () => {
  const sel = selection('lucilla'), cards = currentCards();
  const before = assembleCharacterHitContext(sel, cards);
  assert.equal(before.pending.find(row => row.id === 'weapon:FF-GLACIO')?.status, 'PENDING_EVENT');
  assert.equal(before.pending.find(row => row.id === 'weapon:FF-TEAM-ATK')?.status, 'PENDING_EVENT');

  const events = selfEvents(cards);
  const after = assembleCharacterHitContext(sel, cards, { weapon: events });
  const self = after.eventContributions.find(row => row.sourceId === 'weapon:FF-GLACIO')!;
  const team = after.eventContributions.find(row => row.sourceId === 'weapon:FF-TEAM-ATK')!;
  const selfSource = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'FF-GLACIO')!;
  const teamSource = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'FF-TEAM-ATK')!;
  assert.equal(self.value, selfSource.rankValues[0]);
  assert.equal(team.value, teamSource.rankValues[0]);
  assert.equal(self.active, true);
  assert.equal(team.active, true);
  assert.ok(!after.requirements.includes('weapon:FF-GLACIO'));
  assert.ok(!after.requirements.includes('weapon:FF-TEAM-ATK'));
  assert.equal(after.stats['Glacio DMG'], selfSource.rankValues[0]);
  assert.ok((after.stats['ATK%'] ?? 0) >= teamSource.rankValues[0]);
});

test('Lucilla current/candidate comparison requires independent exact application evidence', () => {
  const sel = selection('lucilla'), current = currentCards(), candidate = candidateCards();
  const currentEvents = selfEvents(current), candidateEvents = selfEvents(candidate);
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });
  const input = {
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { weapon: candidateEvents }, remaining: remaining(candidateAssembly) },
  };
  assert.equal(compareCharacterHitWithAssembledContext(input).comparison.status, 'EVALUATED_HIT_COMPARISON');
  assert.throws(() => compareCharacterHitWithAssembledContext({
    ...input,
    candidate: { ...input.candidate, events: { weapon: currentEvents } },
  }), /per-build event proof/);
});

test('cross-owner Freeze Frame exposes only TEAM ATK to the selected teammate', () => {
  const sel = selection('hiyuki'), cards = currentCards();
  const incoming = incomingEvents(cards);
  const after = assembleCharacterHitContext(sel, cards, { incoming });
  const sourceId = 'team:weapon-status:FF-TEAM-ATK:lucilla';
  const contribution = after.eventContributions.find(row => row.sourceId === sourceId)!;
  const source = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'FF-TEAM-ATK')!;
  assert.equal(contribution.value, source.rankValues[0]);
  assert.equal(contribution.stat, 'ATK%');
  assert.equal(contribution.active, true);
  assert.ok(!after.requirements.includes(sourceId));
  assert.ok(after.requirements.includes('selected-team-effects'));
  assert.ok(!after.eventContributions.some(row => row.canonicalEffectId === 'FF-GLACIO'));
  assert.equal(after.authorizesRotationDps, false);
});

test('cross-owner Freeze Frame is build-bound and source weapon/team/application proof fails closed', () => {
  const sel = selection('hiyuki'), current = currentCards(), candidate = candidateCards();
  const currentIncoming = incomingEvents(current), candidateIncoming = incomingEvents(candidate);
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

  const original = incomingRow();
  const patches: Partial<ProvenHitFreezeFrameTeamWindow>[] = [
    { sourceWielderId: 'not-a-character' },
    { sourceEquipmentEvidenceId: '' },
    { sourceWeaponId: 'stringmaster' as 'freeze-frame' },
    { sourceWeaponRank: 0 as 1 },
    { sourceQualification: 'UNKNOWN' as never },
    { sourceEquipmentAtEventQualified: false as true },
    { teamMemberIds: ['lucilla', 'chisa'] },
    { teamMemberIds: ['lucilla', 'hiyuki', 'not-a-character'] },
    { teamMemberIds: ['lucilla', 'hiyuki', 'lucilla'] },
    { event: { ...original.event, actorId: 'chisa' } },
    { event: { ...original.event, sourceFactId: '' } },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
  ];
  for (const patch of patches) {
    const bad = incomingEvents(current, 'hiyuki', incomingRow(patch));
    assert.throws(() => assembleCharacterHitContext(sel, current, { incoming: bad }));
  }
});

test('same-timestamp ordering, expiry and duplicate cross-owner source are explicit', () => {
  const current = currentCards();
  const atTrigger = selection('hiyuki', 1);
  const before = incomingEvents(current, 'hiyuki', incomingRow({ sameTimestampOrder: 'BEFORE_TRIGGER' }));
  assert.equal(assembleCharacterHitContext(atTrigger, current, { incoming: before })
    .eventContributions.find(row => row.sourceId === 'team:weapon-status:FF-TEAM-ATK:lucilla')!.value, 0);
  assert.ok(assembleCharacterHitContext(atTrigger, current, { incoming: incomingEvents(current) })
    .eventContributions.find(row => row.sourceId === 'team:weapon-status:FF-TEAM-ATK:lucilla')!.value > 0);

  const expired = selection('hiyuki', 31);
  assert.equal(assembleCharacterHitContext(expired, current, { incoming: incomingEvents(current) })
    .eventContributions.find(row => row.sourceId === 'team:weapon-status:FF-TEAM-ATK:lucilla')!.active, false);

  const base = incomingEvents(current);
  const duplicate: HitContextIncomingTransfers = {
    ...base,
    teamWeaponStatusApplications: [
      base.teamWeaponStatusApplications![0],
      { ...base.teamWeaponStatusApplications![0], sourceWielderId: 'the-shorekeeper',
        sourceEquipmentEvidenceId: 'synthetic-shorekeeper-freeze-frame-r1',
        teamMemberIds: ['the-shorekeeper', 'hiyuki', 'chisa'],
        event: { ...base.teamWeaponStatusApplications![0].event, actorId: 'the-shorekeeper' } },
    ],
  };
  assert.throws(() => assembleCharacterHitContext(selection('hiyuki'), current, { incoming: duplicate }),
    /same-name stacking is unreviewed/);
});

test('own and cross-owner FF-TEAM-ATK cannot be combined without reviewed same-name stacking', () => {
  const sel = selection('lucilla'), cards = currentCards();
  const cross: HitContextIncomingTransfers = {
    echoStatKey: projectRank5EchoStats(cards).key,
    eventContextId: sel.eventContextId,
    evidenceId: 'synthetic-shorekeeper-freeze-frame-cross-owner',
    sonataOutros: [],
    teamWeaponStatusApplications: [incomingRow({
      sourceWielderId: 'the-shorekeeper',
      sourceEquipmentEvidenceId: 'synthetic-shorekeeper-freeze-frame-r1',
      teamMemberIds: ['lucilla', 'the-shorekeeper', 'hiyuki'],
      event: {
        kind: 'GLACIO_CHAFE_APPLIED',
        actorId: 'the-shorekeeper',
        targetId: 'enemy',
        sourceFactId: 'caller-qualified-shorekeeper-glacio-chafe-source-fact',
        stacksApplied: 1,
        atSeconds: 1,
        sourceTriggerQualification: 'VERIFIED_GLACIO_CHAFE_APPLICATION',
      },
    })],
  };
  assert.throws(() => assembleCharacterHitContext(sel, cards, {
    weapon: selfEvents(cards),
    incoming: cross,
  }), /Freeze Frame team ATK own\/cross-owner activations/);
});
