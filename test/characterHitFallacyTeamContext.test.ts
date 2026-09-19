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
  listFallacyTeamHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type {
  HitContextIncomingTransfers,
  ProvenHitFallacyTeamWindow,
} from '../src/combat/hitContextIncomingTransfers.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `fallacy-team-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'fallacy-team-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(characterId = 'augusta'): CharacterHitContextSelection {
  const character = CHARACTER_CATALOG.find(row => row.id === characterId)!;
  const hit = listCharacterDirectHitSupport().find(row => row.characterId === characterId)!;
  const weapon = WEAPON_CATALOG.find(row => row.releaseStatus === 'RELEASED'
    && row.verificationStatus === 'VERIFIED' && row.weaponType === character.weaponType
    && row.id !== 'abyss-surges' && Number.isFinite(row.level90BaseAtk) && row.secondary)!;
  assert.ok(character?.element && hit && weapon);
  return {
    hit: { characterId, factId: hit.factId, componentIndex: 0, landedHitCount: 1, sequence: 0, maxSkills: true },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: `fallacy-team-${characterId}`,
    hitAtSeconds: 2,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: weapon.id, level: 90, rank: 1 },
  };
}

function proof(
  equippedCards: ReturnType<typeof cards>,
  patch: Partial<ProvenHitFallacyTeamWindow> = {},
  eventContextId = 'fallacy-team-augusta',
): HitContextIncomingTransfers {
  const row: ProvenHitFallacyTeamWindow = {
    effectId: 'FALLACY_TEAM_ATK',
    evidenceId: 'synthetic-fallacy-team-window',
    sourceWielderId: 'the-shorekeeper',
    sourceEquipmentEvidenceId: 'synthetic-shorekeeper-fallacy-main-slot',
    sourceMainEchoId: 'echo-60000605',
    sourceQualification: 'SOURCE_PROVEN_FALLACY_CAST',
    sourceMainSlotAtEventQualified: true,
    teamMemberIds: ['augusta', 'iuno', 'the-shorekeeper'],
    event: {
      kind: 'ECHO_SKILL_CAST',
      actorId: 'the-shorekeeper',
      echoId: 'echo-60000605',
      atSeconds: 1,
    },
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
    ...patch,
  };
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    eventContextId,
    evidenceId: 'synthetic-cross-owner-fallacy-context',
    sonataOutros: [],
    teamEchoCasts: [row],
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

test('Fallacy team support exposes only the reviewed team ATK stat and never wielder ER', () => {
  const support = listFallacyTeamHitContextSupport();
  assert.deepEqual(support, [{
    effectId: 'FALLACY_TEAM_ATK',
    echoId: 'echo-60000605',
    statOrEffect: 'ATK%',
    primitiveId: 'fallacy-support-windows-v1',
    scope: 'EXPLICIT_ECHO_CAST_TEAM_ATK_ONLY',
    contextPrimitiveId: 'character-source-qualified-hit-context-v1',
    requiresPerBuildEventProof: true,
    requiresExplicitSourceEquipmentProof: true,
    requiresExplicitTeamMembershipProof: true,
    magnitudeDependsOnEchoStats: false,
  }]);
  assert.equal(Object.hasOwn(support[0], 'value'), false);
  assert.equal(Object.hasOwn(support[0], 'durationSeconds'), false);
  assert.ok(!support.some(row => row.effectId === 'FALLACY_WIELDER_ER'));
});

test('Fallacy team ATK composes only from explicit source main-Echo, team and cast proof', () => {
  const sel = selection(), current = cards();
  const without = assembleCharacterHitContext(sel, current);
  assert.ok(!without.requirements.some(id => id.includes('FALLACY_TEAM_ATK')),
    'recipient Character/team identity does not prove teammate Fallacy equipment or cast');

  const incoming = proof(current);
  const withWindow = assembleCharacterHitContext(sel, current, { incoming });
  const sourceId = 'team:echo-cast:FALLACY_TEAM_ATK:the-shorekeeper';
  const contribution = withWindow.eventContributions.find(row => row.sourceId === sourceId)!;
  const source = ECHO_EFFECT_MODELS.find(row => row.effectId === 'FALLACY_TEAM_ATK')!;
  assert.equal(contribution.value, source.value);
  assert.equal(contribution.stat, 'ATK%');
  assert.ok(withWindow.contributions.some(row => row.sourceId === sourceId && row.stat === 'ATK%'));
  assert.ok(!withWindow.requirements.includes(sourceId));
  assert.ok(withWindow.requirements.includes('selected-team-effects'),
    'synthetic Fallacy proof is not the real Reference Team timing/overlap proof');
  assert.equal(withWindow.authorizesRotationDps, false);
});

test('Fallacy current/candidate builds require independent evidence', () => {
  const sel = selection(), current = cards(), candidate = candidateCards();
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

test('Fallacy source owner, main slot, team, cast and lifecycle fail closed', () => {
  const sel = selection(), current = cards(), base = proof(current);
  const original = base.teamEchoCasts![0];
  const patches: Partial<ProvenHitFallacyTeamWindow>[] = [
    { sourceWielderId: 'not-a-character' },
    { sourceWielderId: 'augusta', event: { ...original.event, actorId: 'augusta' } },
    { sourceEquipmentEvidenceId: '' },
    { sourceMainEchoId: 'echo-60001985' as 'echo-60000605' },
    { sourceQualification: 'UNKNOWN' as never },
    { sourceMainSlotAtEventQualified: false as true },
    { teamMemberIds: ['iuno', 'the-shorekeeper'] },
    { teamMemberIds: ['augusta', 'the-shorekeeper', 'not-a-character'] },
    { teamMemberIds: ['augusta', 'the-shorekeeper', 'augusta'] },
    { event: { ...original.event, actorId: 'iuno' } },
    { event: { ...original.event, echoId: 'echo-60001985' } },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
  ];
  for (const patch of patches) {
    const bad = structuredClone(base);
    Object.assign(bad.teamEchoCasts![0], patch);
    assert.throws(() => assembleCharacterHitContext(sel, current, { incoming: bad }));
  }
});

test('Fallacy same-timestamp ordering, expiry and duplicate stacking remain explicit', () => {
  const current = cards(), sel = selection();
  const sourceId = 'team:echo-cast:FALLACY_TEAM_ATK:the-shorekeeper';
  const atTrigger = { ...sel, hitAtSeconds: 1 };
  const before = proof(current, { sameTimestampOrder: 'BEFORE_TRIGGER' });
  assert.equal(assembleCharacterHitContext(atTrigger, current, { incoming: before })
    .eventContributions.find(row => row.sourceId === sourceId)!.value, 0);
  assert.ok(assembleCharacterHitContext(atTrigger, current, { incoming: proof(current) })
    .eventContributions.find(row => row.sourceId === sourceId)!.value > 0);

  const effect = ECHO_EFFECT_MODELS.find(row => row.effectId === 'FALLACY_TEAM_ATK')!;
  assert.ok(effect.durationSeconds);
  const expired = { ...sel, hitAtSeconds: 1 + effect.durationSeconds };
  assert.equal(assembleCharacterHitContext(expired, current, { incoming: proof(current) })
    .eventContributions.find(row => row.sourceId === sourceId)!.active, false);

  const base = proof(current);
  const duplicate: HitContextIncomingTransfers = { ...base, teamEchoCasts: [
    base.teamEchoCasts![0],
    { ...base.teamEchoCasts![0],
      sourceWielderId: 'iuno',
      sourceEquipmentEvidenceId: 'synthetic-iuno-fallacy-main-slot',
      event: { ...base.teamEchoCasts![0].event, actorId: 'iuno' } },
  ] };
  assert.throws(() => assembleCharacterHitContext(sel, current, { incoming: duplicate }), /duplicate stacking is unreviewed/);
});

test('Fallacy team bridge does not reinterpret the separate wielder Energy Regen effect', () => {
  const current = cards(), sel = selection();
  const result = assembleCharacterHitContext(sel, current, { incoming: proof(current) });
  assert.ok(result.eventContributions.some(row => row.canonicalEffectId === 'FALLACY_TEAM_ATK'));
  assert.ok(!result.eventContributions.some(row => row.canonicalEffectId === 'FALLACY_WIELDER_ER'));
  assert.ok(!result.contributions.some(row => row.sourceId.includes('FALLACY_WIELDER_ER')));
});
