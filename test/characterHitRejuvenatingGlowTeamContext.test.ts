import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import {
  assembleCharacterHitContext,
  compareCharacterHitWithAssembledContext,
  listSonataTeamHealHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type { HitContextSonataEvents } from '../src/combat/hitContextSonataEvents.ts';
import type {
  HitContextIncomingTransfers,
  ProvenHitRejuvenatingGlowTeamWindow,
} from '../src/combat/hitContextIncomingTransfers.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `rejuv-team-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'rejuv-team-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(characterId = 'phrolova'): CharacterHitContextSelection {
  const character = CHARACTER_CATALOG.find(row => row.id === characterId)!;
  const hit = listCharacterDirectHitSupport().find(row => row.characterId === characterId)!;
  const weapon = WEAPON_CATALOG.find(row => row.releaseStatus === 'RELEASED'
    && row.verificationStatus === 'VERIFIED' && row.weaponType === character.weaponType
    && row.id !== 'abyss-surges' && Number.isFinite(row.level90BaseAtk) && row.secondary)!;
  assert.ok(character?.element && hit && weapon);
  return {
    hit: { characterId, factId: hit.factId, componentIndex: 0, landedHitCount: 1, sequence: 0, maxSkills: true },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: `rejuv-team-${characterId}`,
    hitAtSeconds: 2,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: weapon.id, level: 90, rank: 1 },
  };
}

function teamHealProof(
  equippedCards: ReturnType<typeof cards>,
  patch: Partial<ProvenHitRejuvenatingGlowTeamWindow> = {},
): HitContextIncomingTransfers {
  const row: ProvenHitRejuvenatingGlowTeamWindow = {
    effectId: 'REJUV_ATK',
    evidenceId: 'synthetic-cross-owner-rejuv',
    sourceWielderId: 'chisa',
    sourceEquipmentEvidenceId: 'synthetic-chisa-rejuv-five-piece',
    sourceSonataSetId: 'sonata-7',
    sourcePieces: 5,
    sourceQualification: 'SOURCE_PROVEN_HEAL',
    sourceEquipmentAtEventQualified: true,
    teamMemberIds: ['chisa', 'phrolova', 'cantarella'],
    event: {
      kind: 'HEAL_APPLIED',
      healerId: 'chisa',
      targetId: 'cantarella',
      atSeconds: 1,
      sourceTriggerQualification: 'VERIFIED_HEAL_ALLY',
    },
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
    ...patch,
  };
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    eventContextId: 'rejuv-team-phrolova',
    evidenceId: 'synthetic-cross-owner-team-heal-context',
    sonataOutros: [],
    teamHeals: [row],
  };
}

function remaining(a: ReturnType<typeof assembleCharacterHitContext>): RemainingHitContext {
  return {
    status: 'QUALIFIED',
    assemblyKey: a.assemblyKey,
    evidenceId: 'synthetic-residual-context',
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

function exactFivePieceRejuvenatingEquipment() {
  const used = new Set<string>();
  const species = [4, 3, 3, 1, 1].map(cost => {
    const echo = ECHO_CATALOG.find(row => row.releaseStatus === 'RELEASED' && row.cost === cost
      && !used.has(row.id) && row.sonataSetIds.includes('sonata-7'));
    assert.ok(echo);
    used.add(echo.id);
    return echo;
  });
  return {
    species,
    equipment: {
      evidenceId: 'synthetic-selected-rejuv-five-piece',
      mainSlotIndex: 0,
      slots: species.map(row => ({ echoId: row.id, sonataSetId: 'sonata-7' })),
    },
  };
}

test('cross-owner Rejuvenating Glow support is identity-only and source-bound', () => {
  const support = listSonataTeamHealHitContextSupport();
  assert.equal(support.length, 1);
  assert.deepEqual(support[0], {
    effectId: 'REJUV_ATK',
    sonataSetId: 'sonata-7',
    pieces: 5,
    statOrEffect: 'ATK%',
    primitiveId: 'heal-applied-team-atk-window-v1',
    scope: 'EXPLICIT_APPLIED_HEAL_TEAM_WINDOW_ONLY',
    contextPrimitiveId: 'character-source-qualified-hit-context-v1',
    requiresPerBuildEventProof: true,
    requiresExplicitSourceEquipmentProof: true,
    requiresExplicitTeamMembershipProof: true,
    magnitudeDependsOnEchoStats: false,
  });
  assert.equal(Object.hasOwn(support[0], 'value'), false);
  assert.equal(Object.hasOwn(support[0], 'durationSeconds'), false);
});

test('cross-owner Rejuvenating Glow applies to an explicit team member even when another ally was healed', () => {
  const sel = selection(), current = cards();
  const without = assembleCharacterHitContext(sel, current);
  assert.ok(!without.requirements.some(id => id.includes('REJUV_ATK')),
    'selected incoming Character does not prove a teammate Rejuvenating set or heal');

  const incoming = teamHealProof(current);
  const withWindow = assembleCharacterHitContext(sel, current, { incoming });
  const sourceId = 'team:sonata-heal:REJUV_ATK:chisa';
  const contribution = withWindow.eventContributions.find(row => row.sourceId === sourceId)!;
  const source = SONATA_EFFECT_MODELS.find(row => row.effectId === 'REJUV_ATK')!;
  assert.equal(contribution.value, source.value);
  assert.equal(contribution.stat, 'ATK%');
  assert.ok(withWindow.contributions.some(row => row.sourceId === sourceId && row.stat === 'ATK%'));
  assert.ok(!withWindow.requirements.includes(sourceId));
  assert.ok(withWindow.requirements.includes('selected-team-effects'),
    'one proven team window cannot prove all selected-team effects');
  assert.equal(withWindow.authorizesRotationDps, false);
});

test('cross-owner Rejuvenating Glow requires independent current/candidate proof', () => {
  const sel = selection(), current = cards(), candidate = candidateCards();
  const currentIncoming = teamHealProof(current), candidateIncoming = teamHealProof(candidate);
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

test('source owner, five-piece set, selected team, applied heal and lifecycle all fail closed', () => {
  const sel = selection(), current = cards(), base = teamHealProof(current);
  const original = base.teamHeals![0];
  const patches: Partial<ProvenHitRejuvenatingGlowTeamWindow>[] = [
    { sourceWielderId: 'not-a-character' },
    { sourceEquipmentEvidenceId: '' },
    { sourceSonataSetId: 'sonata-8' as 'sonata-7' },
    { sourcePieces: 4 as 5 },
    { sourceQualification: 'UNKNOWN' as never },
    { sourceEquipmentAtEventQualified: false as true },
    { teamMemberIds: ['chisa', 'cantarella'] },
    { teamMemberIds: ['chisa', 'phrolova', 'not-a-character'] },
    { teamMemberIds: ['chisa', 'phrolova', 'phrolova'] },
    { event: { ...original.event, healerId: 'cantarella' } },
    { event: { ...original.event, targetId: 'jiyan' } },
    { event: { ...original.event, sourceTriggerQualification: 'UNKNOWN' } },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
  ];
  for (const patch of patches) {
    const bad = structuredClone(base);
    Object.assign(bad.teamHeals![0], patch);
    assert.throws(() => assembleCharacterHitContext(sel, current, { incoming: bad }));
  }
});

test('same-timestamp query ordering, expiry and duplicate team sources remain explicit', () => {
  const current = cards(), sel = selection();
  const atTrigger = { ...sel, hitAtSeconds: 1 };
  const before = teamHealProof(current, { sameTimestampOrder: 'BEFORE_TRIGGER' });
  const sourceId = 'team:sonata-heal:REJUV_ATK:chisa';
  assert.equal(assembleCharacterHitContext(atTrigger, current, { incoming: before })
    .eventContributions.find(row => row.sourceId === sourceId)!.value, 0);
  assert.ok(assembleCharacterHitContext(atTrigger, current, { incoming: teamHealProof(current) })
    .eventContributions.find(row => row.sourceId === sourceId)!.value > 0);

  const expired = { ...sel, hitAtSeconds: 31 };
  assert.equal(assembleCharacterHitContext(expired, current, { incoming: teamHealProof(current) })
    .eventContributions.find(row => row.sourceId === sourceId)!.active, false);

  const base = teamHealProof(current);
  const duplicate: HitContextIncomingTransfers = { ...base, teamHeals: [
    base.teamHeals![0],
    { ...base.teamHeals![0],
      sourceWielderId: 'the-shorekeeper',
      sourceEquipmentEvidenceId: 'synthetic-shorekeeper-rejuv-five-piece',
      teamMemberIds: ['the-shorekeeper', 'phrolova', 'augusta'],
      event: { ...base.teamHeals![0].event, healerId: 'the-shorekeeper', targetId: 'augusta' } },
  ] };
  assert.throws(() => assembleCharacterHitContext(sel, current, { incoming: duplicate }), /duplicate stacking is unreviewed/);
});

test('self-owned and cross-owner Rejuvenating Glow cannot double count without stacking review', () => {
  const { species, equipment } = exactFivePieceRejuvenatingEquipment();
  const selectedCards = species.map((row, index) =>
    createRank5EchoAtLevel0({ id: `selected-rejuv-${index}`, cost: row.cost, primaryMainStat: 'ATK%' }));
  const sel = { ...selection('ciaccona'), eventContextId: 'rejuv-team-ciaccona', echoEquipment: equipment };
  const own: HitContextSonataEvents = {
    echoStatKey: projectRank5EchoStats(selectedCards).key,
    equipmentKey: JSON.stringify(equipment),
    eventContextId: sel.eventContextId,
    evidenceId: 'synthetic-self-rejuv-context',
    casts: [],
    heals: [{
      effectId: 'REJUV_ATK',
      evidenceId: 'synthetic-self-rejuv-heal',
      event: { kind: 'HEAL_APPLIED', healerId: 'ciaccona', targetId: 'ciaccona', atSeconds: 1,
        sourceTriggerQualification: 'VERIFIED_HEAL_ALLY' },
      teamMemberIds: ['ciaccona'],
      sourceQualification: 'SOURCE_PROVEN_HEAL',
      equipmentAtEventQualified: true,
      priorActivationState: 'NONE_ACTIVE',
      noLaterActivationThroughHit: true,
      sameTimestampOrder: 'AFTER_TRIGGER',
    }],
  };
  const incoming: HitContextIncomingTransfers = {
    echoStatKey: projectRank5EchoStats(selectedCards).key,
    eventContextId: sel.eventContextId,
    evidenceId: 'synthetic-cross-owner-rejuv-context',
    sonataOutros: [],
    teamHeals: [{
      effectId: 'REJUV_ATK',
      evidenceId: 'synthetic-chisa-rejuv-heal',
      sourceWielderId: 'chisa',
      sourceEquipmentEvidenceId: 'synthetic-chisa-rejuv-five-piece',
      sourceSonataSetId: 'sonata-7',
      sourcePieces: 5,
      sourceQualification: 'SOURCE_PROVEN_HEAL',
      sourceEquipmentAtEventQualified: true,
      teamMemberIds: ['chisa', 'ciaccona'],
      event: { kind: 'HEAL_APPLIED', healerId: 'chisa', targetId: 'ciaccona', atSeconds: 1,
        sourceTriggerQualification: 'VERIFIED_HEAL_ALLY' },
      priorActivationState: 'NONE_ACTIVE',
      noLaterActivationThroughHit: true,
      sameTimestampOrder: 'AFTER_TRIGGER',
    }],
  };
  assert.throws(() => assembleCharacterHitContext(sel, selectedCards, { sonata: own, incoming }),
    /duplicate owner activations/);
});
