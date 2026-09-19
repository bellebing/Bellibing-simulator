import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { ECHO_EFFECT_MODELS } from '../src/data/echoEffects.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import {
  assembleCharacterHitContext,
  compareCharacterHitWithAssembledContext,
  listEchoIncomingTransferHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type {
  HitContextIncomingTransfers,
  ProvenHitEchoTransfer,
} from '../src/combat/hitContextIncomingTransfers.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `echo-incoming-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'echo-incoming-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

const cases = {
  VOIDWING_MOTH_INCOMING_ATK: {
    incomingId: 'luuk-herssen', sourceId: 'denia', mainEchoId: 'echo-60001985',
    rank: 5, armKind: 'ECHO_SKILL_USE', entry: 'DIRECT_SWITCH',
    normalizedStat: 'ATK%',
  },
  REMINISCENCE_DENIA_INCOMING_FUSION: {
    incomingId: 'changli', sourceId: 'aemeath', mainEchoId: 'echo-60002005',
    rank: null, armKind: 'ECHO_SKILL_SUMMON', entry: 'DIRECT_SWITCH',
    normalizedStat: 'Fusion DMG',
  },
  HYVATIA_INCOMING_ALL_ATTRIBUTE: {
    incomingId: 'carlotta', sourceId: 'zhezhi', mainEchoId: 'echo-60001895',
    rank: null, armKind: 'ECHO_SKILL_SUMMON', entry: 'INTRO_SKILL',
    normalizedStat: 'All Attribute DMG',
  },
} as const;

type EffectId = keyof typeof cases;

function selection(characterId: typeof cases[EffectId]['incomingId']): CharacterHitContextSelection {
  const character = CHARACTER_CATALOG.find(row => row.id === characterId)!;
  const hit = listCharacterDirectHitSupport().find(row => row.characterId === characterId)!;
  const weapon = WEAPON_CATALOG.find(row => row.releaseStatus === 'RELEASED'
    && row.verificationStatus === 'VERIFIED' && row.weaponType === character.weaponType
    && row.id !== 'abyss-surges' && Number.isFinite(row.level90BaseAtk) && row.secondary)!;
  assert.ok(character?.element && hit && weapon);
  return {
    hit: { characterId, factId: hit.factId, componentIndex: 0, landedHitCount: 1, sequence: 0, maxSkills: true },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: `echo-incoming-${characterId}`,
    hitAtSeconds: 3,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: weapon.id, level: 90, rank: 1 },
  };
}

function echoProof(
  effectId: EffectId,
  equippedCards: ReturnType<typeof cards>,
  patch: Partial<ProvenHitEchoTransfer> = {},
): HitContextIncomingTransfers {
  const row = cases[effectId];
  const transfer: ProvenHitEchoTransfer = {
    effectId,
    evidenceId: `synthetic-${effectId}-activation`,
    sourceWielderId: row.sourceId,
    sourceEquipmentEvidenceId: `synthetic-${row.sourceId}-main-echo-proof`,
    sourceMainEchoId: row.mainEchoId,
    sourceEchoRank: row.rank,
    sourceQualification: 'SOURCE_PROVEN_ECHO_TRANSFER',
    sourceMainSlotAtArmQualified: true,
    armEvent: {
      kind: row.armKind,
      echoId: row.mainEchoId,
      actorId: row.sourceId,
      atSeconds: 1,
    },
    outroEvent: {
      kind: 'OUTRO_SWITCH',
      actorId: row.sourceId,
      incomingResonatorId: row.incomingId,
      incomingEntry: row.entry,
      atSeconds: 2,
    },
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampArmOrder: 'NOT_TIED',
    sameTimestampOrder: 'AFTER_TRIGGER',
    ...patch,
  };
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    eventContextId: `echo-incoming-${row.incomingId}`,
    evidenceId: 'synthetic-cross-owner-echo-transfer-context',
    sonataOutros: [],
    echoTransfers: [transfer],
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

test('Echo incoming-transfer support is exactly the three reviewed ordinary-stat contracts with no copied values', () => {
  const support = listEchoIncomingTransferHitContextSupport();
  assert.deepEqual(support.map(row => row.effectId), [
    'VOIDWING_MOTH_INCOMING_ATK',
    'REMINISCENCE_DENIA_INCOMING_FUSION',
    'HYVATIA_INCOMING_ALL_ATTRIBUTE',
  ]);
  assert.deepEqual(support.map(row => row.statOrEffect), ['ATK%', 'Fusion DMG Bonus', 'All Attribute DMG Bonus']);
  assert.deepEqual(support.map(row => row.requiredRank), [5, null, null]);
  assert.ok(support.every(row => row.requiresPerBuildEventProof
    && row.requiresExplicitSourceEquipmentProof && !Object.hasOwn(row, 'value')));
});

test('all three Echo transfers compose into only the actual incoming Character hit with explicit source proof', () => {
  for (const effectId of Object.keys(cases) as EffectId[]) {
    const row = cases[effectId], sel = selection(row.incomingId), current = cards();
    const without = assembleCharacterHitContext(sel, current);
    assert.ok(!without.requirements.some(id => id.includes(effectId)),
      'incoming Character build alone never proves cross-owner Echo gear');

    const incoming = echoProof(effectId, current);
    const withTransfer = assembleCharacterHitContext(sel, current, { incoming });
    const sourceId = `team:echo:${effectId}:${row.sourceId}`;
    const contribution = withTransfer.eventContributions.find(item => item.sourceId === sourceId)!;
    const source = ECHO_EFFECT_MODELS.find(item => item.effectId === effectId)!;
    assert.equal(contribution.value, source.value);
    assert.equal(contribution.stat, source.statOrEffect);
    assert.ok(withTransfer.contributions.some(item => item.sourceId === sourceId && item.stat === row.normalizedStat));
    assert.ok(!withTransfer.requirements.includes(sourceId));
    assert.ok(withTransfer.requirements.includes('selected-team-effects'));
    assert.equal(withTransfer.authorizesRotationDps, false);
  }
});

test('Echo incoming transfers require independent current/candidate evidence', () => {
  const effectId = 'HYVATIA_INCOMING_ALL_ATTRIBUTE' as const, row = cases[effectId], sel = selection(row.incomingId);
  const current = cards(), candidate = candidateCards();
  const currentIncoming = echoProof(effectId, current), candidateIncoming = echoProof(effectId, candidate);
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

test('source main Echo, reviewed rank, arm occurrence and actual recipient fail closed', () => {
  const effectId = 'VOIDWING_MOTH_INCOMING_ATK' as const, row = cases[effectId];
  const sel = selection(row.incomingId), current = cards(), base = echoProof(effectId, current);
  const original = base.echoTransfers![0];
  const patches: Partial<ProvenHitEchoTransfer>[] = [
    { sourceWielderId: 'not-a-character' },
    { sourceEquipmentEvidenceId: '' },
    { sourceMainEchoId: 'echo-60002005' },
    { sourceEchoRank: 4 },
    { sourceQualification: 'UNKNOWN' as never },
    { sourceMainSlotAtArmQualified: false as true },
    { armEvent: { ...original.armEvent, kind: 'ECHO_SKILL_SUMMON' } },
    { armEvent: { ...original.armEvent, echoId: 'echo-60002005' } },
    { armEvent: { ...original.armEvent, actorId: 'aemeath' } },
    { outroEvent: { ...original.outroEvent, actorId: 'aemeath' } },
    { outroEvent: { ...original.outroEvent, incomingResonatorId: 'changli' } },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
  ];
  for (const patch of patches) {
    const bad = structuredClone(base);
    Object.assign(bad.echoTransfers![0], patch);
    assert.throws(() => assembleCharacterHitContext(sel, current, { incoming: bad }));
  }
});

test('non-rank-specific Echo transfer contracts do not invent a rank requirement and Hyvatia keeps its Intro gate', () => {
  for (const effectId of ['REMINISCENCE_DENIA_INCOMING_FUSION', 'HYVATIA_INCOMING_ALL_ATTRIBUTE'] as const) {
    const row = cases[effectId], sel = selection(row.incomingId), current = cards();
    assert.throws(() => assembleCharacterHitContext(sel, current, {
      incoming: echoProof(effectId, current, { sourceEchoRank: 5 }),
    }), /source main-Echo\/rank/);
  }
  const effectId = 'HYVATIA_INCOMING_ALL_ATTRIBUTE' as const, row = cases[effectId];
  assert.throws(() => assembleCharacterHitContext(selection(row.incomingId), cards(), {
    incoming: echoProof(effectId, cards(), {
      outroEvent: {
        kind: 'OUTRO_SWITCH', actorId: row.sourceId, incomingResonatorId: row.incomingId,
        incomingEntry: 'DIRECT_SWITCH', atSeconds: 2,
      },
    }),
  }), /do not activate/);
});

test('Echo arm/Outro tied ordering, hit ordering, expiry and duplicate stacking are explicit', () => {
  const effectId = 'REMINISCENCE_DENIA_INCOMING_FUSION' as const, row = cases[effectId], current = cards();
  const sel = selection(row.incomingId);
  const tiedBad = echoProof(effectId, current, {
    armEvent: { kind: row.armKind, echoId: row.mainEchoId, actorId: row.sourceId, atSeconds: 2 },
    sameTimestampArmOrder: 'NOT_TIED',
  });
  assert.throws(() => assembleCharacterHitContext(sel, current, { incoming: tiedBad }), /source main-Echo\/rank/);

  const tiedGood = echoProof(effectId, current, {
    armEvent: { kind: row.armKind, echoId: row.mainEchoId, actorId: row.sourceId, atSeconds: 2 },
    sameTimestampArmOrder: 'ECHO_BEFORE_OUTRO',
  });
  const atTrigger = { ...sel, hitAtSeconds: 2 };
  const before = structuredClone(tiedGood);
  before.echoTransfers![0].sameTimestampOrder = 'BEFORE_TRIGGER';
  const sourceId = `team:echo:${effectId}:${row.sourceId}`;
  assert.equal(assembleCharacterHitContext(atTrigger, current, { incoming: before })
    .eventContributions.find(item => item.sourceId === sourceId)!.value, 0);
  assert.ok(assembleCharacterHitContext(atTrigger, current, { incoming: tiedGood })
    .eventContributions.find(item => item.sourceId === sourceId)!.value > 0);

  assert.equal(assembleCharacterHitContext({ ...sel, hitAtSeconds: 17 }, current, {
    incoming: echoProof(effectId, current),
  }).eventContributions.find(item => item.sourceId === sourceId)!.active, false);

  const duplicateBase = echoProof(effectId, current);
  const duplicate: HitContextIncomingTransfers = { ...duplicateBase, echoTransfers: [
    duplicateBase.echoTransfers![0],
    { ...duplicateBase.echoTransfers![0], sourceWielderId: 'zhezhi',
      sourceEquipmentEvidenceId: 'synthetic-zhezhi-main-echo-proof',
      armEvent: { ...duplicateBase.echoTransfers![0].armEvent, actorId: 'zhezhi' },
      outroEvent: { ...duplicateBase.echoTransfers![0].outroEvent, actorId: 'zhezhi' } },
  ] };
  assert.throws(() => assembleCharacterHitContext(sel, current, { incoming: duplicate }), /duplicate stacking is unreviewed/);
});
