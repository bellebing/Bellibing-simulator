import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import { validateSonataOutroTransferContracts } from '../src/combat/sonataOutroTransferAdapter.ts';
import {
  assembleCharacterHitContext,
  compareCharacterHitWithAssembledContext,
  listSonataIncomingTransferHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type {
  HitContextIncomingTransfers,
  ProvenHitSonataOutroTransfer,
} from '../src/combat/hitContextIncomingTransfers.ts';

const echoes = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `incoming-transfer-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateEchoes = () => {
  const rows = echoes();
  rows[0] = createRank5EchoAtLevel0({ id: 'incoming-transfer-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(characterId: 'augusta' | 'phrolova'): CharacterHitContextSelection {
  const character = CHARACTER_CATALOG.find(row => row.id === characterId)!;
  const hit = listCharacterDirectHitSupport().find(row => row.characterId === characterId)!;
  const weapon = WEAPON_CATALOG.find(row => row.releaseStatus === 'RELEASED'
    && row.verificationStatus === 'VERIFIED' && row.weaponType === character.weaponType
    && row.id !== 'abyss-surges' && Number.isFinite(row.level90BaseAtk) && row.secondary)!;
  assert.ok(character?.element && hit && weapon);
  return {
    hit: { characterId, factId: hit.factId, componentIndex: 0, landedHitCount: 1, sequence: 0, maxSkills: true },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: `incoming-transfer-${characterId}`,
    hitAtSeconds: 2,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: weapon.id, level: 90, rank: 1 },
  };
}

function transfer(effectId: ProvenHitSonataOutroTransfer['effectId']): {
  readonly incomingId: 'augusta' | 'phrolova';
  readonly sourceId: 'iuno' | 'cantarella';
  readonly setId: 'sonata-8' | 'sonata-12';
} {
  return effectId === 'S08_5PC_INCOMING_ATK'
    ? { incomingId: 'augusta', sourceId: 'iuno', setId: 'sonata-8' }
    : { incomingId: 'phrolova', sourceId: 'cantarella', setId: 'sonata-12' };
}

function events(
  effectId: ProvenHitSonataOutroTransfer['effectId'],
  cards: ReturnType<typeof echoes>,
  patch: Partial<ProvenHitSonataOutroTransfer> = {},
): HitContextIncomingTransfers {
  const ids = transfer(effectId);
  const row: ProvenHitSonataOutroTransfer = {
    effectId,
    evidenceId: `synthetic-${effectId}-activation`,
    sourceWielderId: ids.sourceId,
    sourceEquipmentEvidenceId: `synthetic-${ids.sourceId}-five-piece-proof`,
    sourceSonataSetId: ids.setId,
    sourcePieces: 5,
    sourceQualification: 'SOURCE_PROVEN_OUTRO_TRANSFER',
    sourceEquipmentAtEventQualified: true,
    event: {
      kind: 'OUTRO_SWITCH',
      actorId: ids.sourceId,
      incomingResonatorId: ids.incomingId,
      incomingEntry: 'INTRO_SKILL',
      atSeconds: 1,
    },
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
    ...patch,
  };
  return {
    echoStatKey: projectRank5EchoStats(cards).key,
    eventContextId: `incoming-transfer-${ids.incomingId}`,
    evidenceId: 'synthetic-cross-owner-transfer-context',
    sonataOutros: [row],
  };
}

function remaining(a: ReturnType<typeof assembleCharacterHitContext>): RemainingHitContext {
  return {
    status: 'QUALIFIED', provenance: 'CALLER_QUALIFIED',
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

test('incoming-transfer support is exactly the two reviewed ordinary Sonata stats without copied values', () => {
  const support = listSonataIncomingTransferHitContextSupport();
  assert.deepEqual(support.map(row => row.effectId), ['S08_5PC_INCOMING_ATK', 'S12_5PC_INCOMING_HAVOC']);
  assert.deepEqual(support.map(row => row.statOrEffect), ['ATK%', 'Havoc DMG Bonus']);
  assert.ok(support.every(row => row.pieces === 5
    && row.requiresPerBuildEventProof && row.requiresExplicitSourceEquipmentProof
    && !Object.hasOwn(row, 'value') && !Object.hasOwn(row, 'durationSeconds')));
});

test('S08 and S12 compose only into the actual incoming Character build and preserve broad team obligations', () => {
  for (const effectId of ['S08_5PC_INCOMING_ATK', 'S12_5PC_INCOMING_HAVOC'] as const) {
    const ids = transfer(effectId);
    const sel = selection(ids.incomingId);
    const cards = echoes();
    const without = assembleCharacterHitContext(sel, cards);
    assert.ok(without.pending.some(row => row.id === 'selected-team-effects' && row.status === 'PENDING_TIMELINE'));
    assert.ok(!without.requirements.some(id => id.includes(effectId)),
      'cross-owner contribution is never inferred merely from a selected incoming build');

    const incoming = events(effectId, cards);
    const withTransfer = assembleCharacterHitContext(sel, cards, { incoming });
    const sourceId = `team:sonata:${effectId}:${ids.sourceId}`;
    const contribution = withTransfer.eventContributions.find(row => row.sourceId === sourceId)!;
    const source = SONATA_EFFECT_MODELS.find(row => row.effectId === effectId)!;
    assert.equal(contribution.value, source.value);
    assert.equal(contribution.stat, effectId === 'S08_5PC_INCOMING_ATK' ? 'ATK%' : 'Havoc DMG Bonus');
    assert.ok(withTransfer.contributions.some(row => row.sourceId === sourceId
      && row.stat === (effectId === 'S08_5PC_INCOMING_ATK' ? 'ATK%' : 'Havoc DMG')),
      'assembled stat projection normalizes the canonical source label separately');
    assert.equal(contribution.status, 'EVENT_QUALIFIED_ASSEMBLED');
    assert.ok(!withTransfer.requirements.includes(sourceId));
    assert.ok(withTransfer.requirements.includes('selected-team-effects'),
      'one proven transfer does not prove all selected-team effects');
    assert.equal(withTransfer.authorizesRotationDps, false);
  }
});

test('current and candidate require independent exact incoming-transfer evidence', () => {
  const effectId = 'S08_5PC_INCOMING_ATK' as const;
  const ids = transfer(effectId), sel = selection(ids.incomingId);
  const current = echoes(), candidate = candidateEchoes();
  const currentEvents = events(effectId, current), candidateEvents = events(effectId, candidate);
  const currentAssembly = assembleCharacterHitContext(sel, current, { incoming: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { incoming: candidateEvents });
  const input = {
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { incoming: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { incoming: candidateEvents }, remaining: remaining(candidateAssembly) },
  };
  assert.equal(compareCharacterHitWithAssembledContext(input).comparison.status, 'EVALUATED_HIT_COMPARISON');
  assert.throws(() => compareCharacterHitWithAssembledContext({
    ...input,
    candidate: { ...input.candidate, events: { incoming: currentEvents } },
  }), /per-build incoming-transfer proof/);
});

test('source owner, recipient, five-piece equipment and lifecycle proof fail closed', () => {
  const effectId = 'S08_5PC_INCOMING_ATK' as const, ids = transfer(effectId);
  const sel = selection(ids.incomingId), cards = echoes();
  const base = events(effectId, cards);
  const patches: Partial<ProvenHitSonataOutroTransfer>[] = [
    { sourceWielderId: 'not-a-character' },
    { sourceSonataSetId: 'sonata-12' },
    { sourcePieces: 4 as 5 },
    { sourceEquipmentEvidenceId: '' },
    { sourceQualification: 'UNKNOWN' as never },
    { sourceEquipmentAtEventQualified: false as true },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
    { event: { ...base.sonataOutros[0].event, actorId: 'cantarella' } },
    { event: { ...base.sonataOutros[0].event, incomingResonatorId: 'phrolova' } },
  ];
  for (const patch of patches) {
    const bad = structuredClone(base);
    Object.assign(bad.sonataOutros[0], patch);
    assert.throws(() => assembleCharacterHitContext(sel, cards, { incoming: bad }));
  }
});

test('duplicate same-effect sources do not manufacture stacking semantics', () => {
  const effectId = 'S08_5PC_INCOMING_ATK' as const, ids = transfer(effectId);
  const sel = selection(ids.incomingId), cards = echoes(), proof = events(effectId, cards);
  const duplicate: HitContextIncomingTransfers = { ...proof, sonataOutros: [
    proof.sonataOutros[0],
    { ...proof.sonataOutros[0], sourceWielderId: 'lumi',
      event: { ...proof.sonataOutros[0].event, actorId: 'lumi' },
      sourceEquipmentEvidenceId: 'synthetic-lumi-five-piece-proof' },
  ] };
  assert.throws(() => assembleCharacterHitContext(sel, cards, { incoming: duplicate }), /duplicate stacking is unreviewed/);
});

test('same-timestamp order and expiry are explicit for incoming transfer windows', () => {
  const effectId = 'S12_5PC_INCOMING_HAVOC' as const, ids = transfer(effectId);
  const cards = echoes();
  const atTrigger = { ...selection(ids.incomingId), hitAtSeconds: 1 };
  const before = events(effectId, cards, { sameTimestampOrder: 'BEFORE_TRIGGER' });
  const after = events(effectId, cards, { sameTimestampOrder: 'AFTER_TRIGGER' });
  const sourceId = `team:sonata:${effectId}:${ids.sourceId}`;
  assert.equal(assembleCharacterHitContext(atTrigger, cards, { incoming: before })
    .eventContributions.find(row => row.sourceId === sourceId)!.value, 0);
  assert.ok(assembleCharacterHitContext(atTrigger, cards, { incoming: after })
    .eventContributions.find(row => row.sourceId === sourceId)!.value > 0);
  const expired = { ...selection(ids.incomingId), hitAtSeconds: 16 };
  assert.equal(assembleCharacterHitContext(expired, cards, { incoming: events(effectId, cards) })
    .eventContributions.find(row => row.sourceId === sourceId)!.active, false);
});

test('canonical Sonata Outro source contract remains fail-closed and profile readiness is not changed here', () => {
  assert.deepEqual(validateSonataOutroTransferContracts(), []);
  const drifted = SONATA_EFFECT_MODELS.map(row => row.effectId === 'S08_5PC_INCOMING_ATK'
    ? { ...row, pieces: 3 }
    : row);
  assert.ok(validateSonataOutroTransferContracts(drifted).some(issue => issue.includes('piece threshold drift')));
});
