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
  listStellarSymphonyTeamHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type {
  HitContextIncomingTransfers,
  ProvenHitStellarSymphonyTeamWindow,
} from '../src/combat/hitContextIncomingTransfers.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `stellar-team-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'stellar-team-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
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
    eventContextId: `stellar-team-${characterId}`,
    hitAtSeconds: 2,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: weapon.id, level: 90, rank: 1 },
  };
}

function proof(
  equippedCards: ReturnType<typeof cards>,
  patch: Partial<ProvenHitStellarSymphonyTeamWindow> = {},
  eventContextId = 'stellar-team-augusta',
): HitContextIncomingTransfers {
  const row: ProvenHitStellarSymphonyTeamWindow = {
    effectId: 'SSY-TEAM-ATK',
    evidenceId: 'synthetic-stellar-team-window',
    sourceWielderId: 'the-shorekeeper',
    sourceEquipmentEvidenceId: 'synthetic-shorekeeper-stellar-r1',
    sourceWeaponId: 'stellar-symphony',
    sourceWeaponRank: 1,
    sourceQualification: 'SOURCE_PROVEN_HEALING_SKILL_CAST',
    sourceEquipmentAtEventQualified: true,
    teamMemberIds: ['augusta', 'iuno', 'the-shorekeeper'],
    event: {
      kind: 'RESONANCE_SKILL_CAST',
      actorId: 'the-shorekeeper',
      healingSourceFactId: 'the-shorekeeper-skill-chaos-theory-healing',
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
    evidenceId: 'synthetic-cross-owner-stellar-context',
    sonataOutros: [],
    teamWeaponCasts: [row],
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

test('Stellar Symphony team support is identity-only and preserves the exact Shorekeeper source contract', () => {
  const support = listStellarSymphonyTeamHitContextSupport();
  assert.equal(support.length, 1);
  assert.deepEqual(support[0], {
    effectId: 'SSY-TEAM-ATK',
    weaponId: 'stellar-symphony',
    sourceCharacterId: 'the-shorekeeper',
    statOrEffect: 'ATK%',
    primitiveId: 'shorekeeper-healing-support-team-windows-v1',
    scope: 'EXPLICIT_HEALING_SKILL_TEAM_WINDOW_ONLY',
    rankRange: [1, 5],
    sourceFactId: 'the-shorekeeper-skill-chaos-theory-healing',
    contextPrimitiveId: 'character-source-qualified-hit-context-v1',
    requiresPerBuildEventProof: true,
    requiresExplicitSourceEquipmentProof: true,
    requiresExplicitTeamMembershipProof: true,
    magnitudeDependsOnEchoStats: false,
  });
  assert.equal(Object.hasOwn(support[0], 'value'), false);
  assert.equal(Object.hasOwn(support[0], 'durationSeconds'), false);
});

test('Stellar Symphony team ATK composes only from explicit source equipment, team and healing Skill cast proof', () => {
  const sel = selection(), current = cards();
  const without = assembleCharacterHitContext(sel, current);
  assert.ok(!without.requirements.some(id => id.includes('SSY-TEAM-ATK')));

  const incoming = proof(current);
  const withWindow = assembleCharacterHitContext(sel, current, { incoming });
  const sourceId = 'team:weapon-cast:SSY-TEAM-ATK:the-shorekeeper';
  const contribution = withWindow.eventContributions.find(row => row.sourceId === sourceId)!;
  const source = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'SSY-TEAM-ATK')!;
  assert.equal(contribution.value, source.rankValues[0]);
  assert.equal(contribution.stat, 'ATK%');
  assert.ok(withWindow.contributions.some(row => row.sourceId === sourceId && row.stat === 'ATK%'));
  assert.ok(withWindow.requirements.includes('selected-team-effects'),
    'one proven Shorekeeper window cannot prove the rest of team context');
  assert.equal(withWindow.authorizesRotationDps, false);
});

test('Stellar Symphony current/candidate builds require independent proof', () => {
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

test('Stellar Symphony source owner, rank, team, source fact and lifecycle fail closed', () => {
  const sel = selection(), current = cards(), base = proof(current);
  const original = base.teamWeaponCasts![0];
  const patches: Partial<ProvenHitStellarSymphonyTeamWindow>[] = [
    { sourceEquipmentEvidenceId: '' },
    { sourceWeaponId: 'variation' as 'stellar-symphony' },
    { sourceWeaponRank: 0 as 1 },
    { sourceQualification: 'UNKNOWN' as never },
    { sourceEquipmentAtEventQualified: false as true },
    { teamMemberIds: ['iuno', 'the-shorekeeper'] },
    { teamMemberIds: ['augusta', 'the-shorekeeper', 'not-a-character'] },
    { teamMemberIds: ['augusta', 'the-shorekeeper', 'augusta'] },
    { event: { ...original.event, actorId: 'iuno' } },
    { event: { ...original.event, healingSourceFactId: 'wrong-fact' as never } },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
  ];
  for (const patch of patches) {
    const bad = structuredClone(base);
    Object.assign(bad.teamWeaponCasts![0], patch);
    assert.throws(() => assembleCharacterHitContext(sel, current, { incoming: bad }));
  }
});

test('Stellar Symphony rank values, same-timestamp ordering, expiry and duplicate stacking stay explicit', () => {
  const current = cards(), sel = selection();
  const effect = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'SSY-TEAM-ATK')!;
  for (const rank of [1, 2, 3, 4, 5] as const) {
    const incoming = proof(current, { sourceWeaponRank: rank });
    const result = assembleCharacterHitContext(sel, current, { incoming });
    assert.equal(result.eventContributions
      .find(row => row.sourceId === 'team:weapon-cast:SSY-TEAM-ATK:the-shorekeeper')!.value,
    effect.rankValues[rank - 1]);
  }

  const atTrigger = { ...sel, hitAtSeconds: 1 };
  const before = proof(current, { sameTimestampOrder: 'BEFORE_TRIGGER' });
  const sourceId = 'team:weapon-cast:SSY-TEAM-ATK:the-shorekeeper';
  assert.equal(assembleCharacterHitContext(atTrigger, current, { incoming: before })
    .eventContributions.find(row => row.sourceId === sourceId)!.value, 0);
  assert.ok(assembleCharacterHitContext(atTrigger, current, { incoming: proof(current) })
    .eventContributions.find(row => row.sourceId === sourceId)!.value > 0);

  const expired = { ...sel, hitAtSeconds: 31 };
  assert.equal(assembleCharacterHitContext(expired, current, { incoming: proof(current) })
    .eventContributions.find(row => row.sourceId === sourceId)!.active, false);

  const base = proof(current);
  const duplicate: HitContextIncomingTransfers = { ...base, teamWeaponCasts: [
    base.teamWeaponCasts![0],
    { ...base.teamWeaponCasts![0], evidenceId: 'second-source-proof' },
  ] };
  assert.throws(() => assembleCharacterHitContext(sel, current, { incoming: duplicate }), /duplicate stacking is unreviewed/);
});

test('Stellar Symphony team bridge cannot bypass the selected Shorekeeper own-equipment path', () => {
  const current = cards();
  const sel = selection('the-shorekeeper');
  const incoming = proof(current, {
    teamMemberIds: ['the-shorekeeper', 'augusta', 'iuno'],
  }, sel.eventContextId);
  assert.throws(() => assembleCharacterHitContext(sel, current, { incoming }), /Stellar Symphony rank\/team/);
});
