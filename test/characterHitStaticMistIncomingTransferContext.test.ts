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
  listWeaponIncomingTransferHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type {
  HitContextIncomingTransfers,
  ProvenHitWeaponOutroTransfer,
} from '../src/combat/hitContextIncomingTransfers.ts';

const echoes = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `static-mist-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateEchoes = () => {
  const rows = echoes();
  rows[0] = createRank5EchoAtLevel0({ id: 'static-mist-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(): CharacterHitContextSelection {
  const characterId = 'jiyan';
  const character = CHARACTER_CATALOG.find(row => row.id === characterId)!;
  const hit = listCharacterDirectHitSupport().find(row => row.characterId === characterId)!;
  const weapon = WEAPON_CATALOG.find(row => row.releaseStatus === 'RELEASED'
    && row.verificationStatus === 'VERIFIED' && row.weaponType === character.weaponType
    && row.id !== 'abyss-surges' && Number.isFinite(row.level90BaseAtk) && row.secondary)!;
  assert.ok(character?.element && hit && weapon);
  return {
    hit: { characterId, factId: hit.factId, componentIndex: 0, landedHitCount: 1, sequence: 0, maxSkills: true },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: 'static-mist-incoming-jiyan',
    hitAtSeconds: 2,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: weapon.id, level: 90, rank: 1 },
  };
}

function proof(
  equippedEchoes: ReturnType<typeof echoes>,
  patch: Partial<ProvenHitWeaponOutroTransfer> = {},
): HitContextIncomingTransfers {
  const transfer: ProvenHitWeaponOutroTransfer = {
    effectId: 'STM-NEXT-ATK',
    evidenceId: 'synthetic-static-mist-transfer',
    sourceWielderId: 'aalto',
    sourceEquipmentEvidenceId: 'synthetic-aalto-static-mist-rank-proof',
    sourceWeaponId: 'static-mist',
    sourceWeaponRank: 1,
    sourceQualification: 'SOURCE_PROVEN_WEAPON_OUTRO_TRANSFER',
    sourceEquipmentAtEventQualified: true,
    event: {
      kind: 'OUTRO_SWITCH',
      actorId: 'aalto',
      incomingResonatorId: 'jiyan',
      incomingEntry: 'INTRO_SKILL',
      atSeconds: 1,
    },
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
    ...patch,
  };
  return {
    echoStatKey: projectRank5EchoStats(equippedEchoes).key,
    eventContextId: 'static-mist-incoming-jiyan',
    evidenceId: 'synthetic-cross-owner-weapon-transfer-context',
    sonataOutros: [],
    weaponOutros: [transfer],
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

test('Static Mist incoming-transfer support is identity-only and keeps rank truth in the canonical weapon effect', () => {
  const support = listWeaponIncomingTransferHitContextSupport();
  assert.equal(support.length, 1);
  assert.deepEqual(support[0], {
    effectId: 'STM-NEXT-ATK',
    weaponId: 'static-mist',
    statOrEffect: 'ATK%',
    primitiveId: 'weapon-outro-incoming-transfer-v1',
    scope: 'EXPLICIT_OUTRO_INCOMING_TRANSFER_ONLY',
    rankRange: [1, 5],
    contextPrimitiveId: 'character-source-qualified-hit-context-v1',
    requiresPerBuildEventProof: true,
    requiresExplicitSourceEquipmentProof: true,
    magnitudeDependsOnEchoStats: false,
  });
  assert.equal(Object.hasOwn(support[0], 'value'), false);
  assert.equal(Object.hasOwn(support[0], 'rankValues'), false);
});

test('Static Mist composes only from explicit compatible source weapon/rank and actual incoming recipient proof', () => {
  const sel = selection(), current = echoes();
  const without = assembleCharacterHitContext(sel, current);
  assert.ok(!without.requirements.some(id => id.includes('STM-NEXT-ATK')));

  const incoming = proof(current);
  const withTransfer = assembleCharacterHitContext(sel, current, { incoming });
  const sourceId = 'team:weapon:STM-NEXT-ATK:aalto';
  const contribution = withTransfer.eventContributions.find(row => row.sourceId === sourceId)!;
  const source = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'STM-NEXT-ATK')!;
  assert.equal(contribution.value, source.rankValues[0]);
  assert.equal(contribution.stat, 'ATK%');
  assert.ok(withTransfer.contributions.some(row => row.sourceId === sourceId && row.stat === 'ATK%'));
  assert.ok(!withTransfer.requirements.includes(sourceId));
  assert.ok(withTransfer.requirements.includes('selected-team-effects'));
  assert.equal(withTransfer.authorizesRotationDps, false);
});

test('Static Mist current/candidate builds require independent transfer evidence', () => {
  const sel = selection(), current = echoes(), candidate = candidateEchoes();
  const currentIncoming = proof(current), candidateIncoming = proof(candidate);
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

test('Static Mist source owner, compatible weapon/rank, recipient and lifecycle fail closed', () => {
  const sel = selection(), current = echoes(), base = proof(current);
  const original = base.weaponOutros![0];
  const patches: Partial<ProvenHitWeaponOutroTransfer>[] = [
    { sourceWielderId: 'not-a-character' },
    { sourceWielderId: 'jiyan', event: { ...original.event, actorId: 'jiyan' } },
    { sourceEquipmentEvidenceId: '' },
    { sourceWeaponId: 'stellar-symphony' as 'static-mist' },
    { sourceWeaponRank: 0 as 1 },
    { sourceQualification: 'UNKNOWN' as never },
    { sourceEquipmentAtEventQualified: false as true },
    { event: { ...original.event, actorId: 'mortefi' } },
    { event: { ...original.event, incomingResonatorId: 'carlotta' } },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
  ];
  for (const patch of patches) {
    const bad = structuredClone(base);
    Object.assign(bad.weaponOutros![0], patch);
    assert.throws(() => assembleCharacterHitContext(sel, current, { incoming: bad }));
  }
});

test('Static Mist rank values, same-timestamp ordering and expiration are read at query time without inferred uptime', () => {
  const source = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'STM-NEXT-ATK')!;
  for (const rank of [1, 2, 3, 4, 5] as const) {
    const current = echoes();
    const incoming = proof(current, { sourceWeaponRank: rank });
    const result = assembleCharacterHitContext(selection(), current, { incoming });
    assert.equal(result.eventContributions.find(row => row.sourceId === 'team:weapon:STM-NEXT-ATK:aalto')!.value,
      source.rankValues[rank - 1]);
  }

  const current = echoes(), atTrigger = { ...selection(), hitAtSeconds: 1 };
  const before = proof(current, { sameTimestampOrder: 'BEFORE_TRIGGER' });
  assert.equal(assembleCharacterHitContext(atTrigger, current, { incoming: before })
    .eventContributions.find(row => row.sourceId === 'team:weapon:STM-NEXT-ATK:aalto')!.value, 0);
  assert.ok(assembleCharacterHitContext(atTrigger, current, { incoming: proof(current) })
    .eventContributions.find(row => row.sourceId === 'team:weapon:STM-NEXT-ATK:aalto')!.value > 0);

  const expired = { ...selection(), hitAtSeconds: 15 };
  assert.equal(assembleCharacterHitContext(expired, current, { incoming: proof(current) })
    .eventContributions.find(row => row.sourceId === 'team:weapon:STM-NEXT-ATK:aalto')!.active, false);
});

test('duplicate Static Mist source activations cannot manufacture stacking semantics', () => {
  const sel = selection(), current = echoes(), base = proof(current);
  const duplicate: HitContextIncomingTransfers = { ...base, weaponOutros: [
    base.weaponOutros![0],
    { ...base.weaponOutros![0], sourceWielderId: 'mortefi',
      sourceEquipmentEvidenceId: 'synthetic-mortefi-static-mist-rank-proof',
      event: { ...base.weaponOutros![0].event, actorId: 'mortefi' } },
  ] };
  assert.throws(() => assembleCharacterHitContext(sel, current, { incoming: duplicate }), /duplicate stacking is unreviewed/);
});
