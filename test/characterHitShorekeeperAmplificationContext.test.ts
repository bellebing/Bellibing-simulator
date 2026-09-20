import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import {
  assembleCharacterHitContext,
  compareCharacterHitWithAssembledContext,
  listShorekeeperOutroAmplificationHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type {
  HitContextAmplificationEvents,
  ProvenHitShorekeeperOutroTeamAmplification,
} from '../src/combat/hitContextAmplificationEvents.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `shorekeeper-amp-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'shorekeeper-amp-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(hitAtSeconds = 2): CharacterHitContextSelection {
  const character = CHARACTER_CATALOG.find(row => row.id === 'augusta')!;
  const hit = listCharacterDirectHitSupport().find(row => row.characterId === 'augusta')!;
  const weapon = WEAPON_CATALOG.find(row => row.releaseStatus === 'RELEASED'
    && row.verificationStatus === 'VERIFIED' && row.weaponType === character.weaponType
    && row.id !== 'abyss-surges' && Number.isFinite(row.level90BaseAtk) && row.secondary)!;
  assert.ok(character?.element && hit && weapon);
  return {
    hit: { characterId: 'augusta', factId: hit.factId, componentIndex: 0, landedHitCount: 1,
      sequence: 0, maxSkills: true },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: 'shorekeeper-team-amplification-augusta',
    hitAtSeconds,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: weapon.id, level: 90, rank: 1 },
  };
}

function proof(
  equippedCards: ReturnType<typeof cards>,
  patch: Partial<ProvenHitShorekeeperOutroTeamAmplification> = {},
): HitContextAmplificationEvents {
  const row: ProvenHitShorekeeperOutroTeamAmplification = {
    sourceFactId: 'the-shorekeeper-outro-binary-butterfly',
    evidenceId: 'synthetic-shorekeeper-outro-window',
    sourceWielderId: 'the-shorekeeper',
    sourceQualification: 'SOURCE_PROVEN_SHOREKEEPER_OUTRO',
    teamMemberIds: ['augusta', 'iuno', 'the-shorekeeper'],
    event: { kind: 'OUTRO_SKILL_CAST', actorId: 'the-shorekeeper', atSeconds: 1 },
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
    ...patch,
  };
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    eventContextId: 'shorekeeper-team-amplification-augusta',
    evidenceId: 'synthetic-shorekeeper-team-amplification-context',
    shorekeeperOutros: [row],
  };
}

function remaining(
  a: ReturnType<typeof assembleCharacterHitContext>,
  amplification = 0,
): RemainingHitContext {
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
    amplification,
    defenseMultiplier: 0.5,
    resistanceMultiplier: 0.9,
    damageReduction: 0,
  };
}

test('Shorekeeper Outro hit support is identity/scope only and does not duplicate source values', () => {
  const support = listShorekeeperOutroAmplificationHitContextSupport();
  assert.equal(support.length, 1);
  assert.deepEqual(support[0], {
    sourceFactId: 'the-shorekeeper-outro-binary-butterfly',
    sourceCharacterId: 'the-shorekeeper',
    statOrEffect: 'DMG Amplification',
    scope: { kind: 'ALL_DAMAGE' },
    primitiveId: 'shorekeeper-outro-team-dmg-amplification-v1',
    contextScope: 'EXPLICIT_TEAM_OUTRO_SINGLE_ACTIVE_AMPLIFICATION',
    contextPrimitiveId: 'character-source-qualified-hit-context-v1',
    requiresPerBuildEventProof: true,
    requiresExplicitTeamMembershipProof: true,
    stackingPolicy: 'SINGLE_ACTIVE_APPLICABLE_TERM_ONLY',
    magnitudeDependsOnEchoStats: false,
  });
  assert.equal(Object.hasOwn(support[0], 'amplification'), false);
  assert.equal(Object.hasOwn(support[0], 'durationSeconds'), false);
});

test('source-qualified Shorekeeper Outro populates the existing scalar only with zero residual amplification', () => {
  const sel = selection(), current = cards(), candidate = candidateCards();
  const currentEvents = proof(current), candidateEvents = proof(candidate);
  const currentAssembly = assembleCharacterHitContext(sel, current, { amplification: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { amplification: candidateEvents });

  assert.equal(currentAssembly.amplificationContributions.length, 1);
  assert.equal(currentAssembly.amplificationContributions[0].statOrEffect, 'DMG Amplification');
  assert.equal(currentAssembly.amplificationContributions[0].value, .15);
  assert.equal(currentAssembly.amplificationContributions[0].active, true);
  assert.ok(currentAssembly.requirements.includes('selected-team-effects'),
    'generic source proof does not establish the full Reference Team timeline');

  const result = compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { amplification: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { amplification: candidateEvents }, remaining: remaining(candidateAssembly) },
  });
  assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
  if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected comparison');
  assert.equal(result.comparison.current.snapshot.amplification, .15);
  assert.equal(result.comparison.candidate.snapshot.amplification, .15);

  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { amplification: currentEvents }, remaining: remaining(currentAssembly, .1) },
    candidate: { echoes: candidate, events: { amplification: candidateEvents }, remaining: remaining(candidateAssembly) },
  }), /Residual amplification must be zero/);
});

test('current and candidate require independent exact amplification proof', () => {
  const sel = selection(), current = cards(), candidate = candidateCards();
  const currentEvents = proof(current), candidateEvents = proof(candidate);
  const currentAssembly = assembleCharacterHitContext(sel, current, { amplification: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { amplification: candidateEvents });
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { amplification: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { amplification: currentEvents }, remaining: remaining(candidateAssembly) },
  }), /per-build scoped amplification proof/);
});

test('Shorekeeper owner, selected team, cast and lifecycle evidence fail closed', () => {
  const current = cards(), sel = selection(), base = proof(current);
  const original = base.shorekeeperOutros![0];
  const patches: Partial<ProvenHitShorekeeperOutroTeamAmplification>[] = [
    { evidenceId: '' },
    { sourceWielderId: 'iuno' as 'the-shorekeeper' },
    { sourceQualification: 'UNKNOWN' as never },
    { teamMemberIds: ['iuno', 'the-shorekeeper'] },
    { teamMemberIds: ['augusta', 'the-shorekeeper', 'not-a-character'] },
    { teamMemberIds: ['augusta', 'the-shorekeeper', 'augusta'] },
    { event: { ...original.event, actorId: 'iuno' } },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
  ];
  for (const patch of patches) {
    const bad = structuredClone(base);
    Object.assign(bad.shorekeeperOutros![0], patch);
    assert.throws(() => assembleCharacterHitContext(sel, current, { amplification: bad }));
  }
});

test('same-timestamp order and expiry are explicit; inactive known window may coexist with residual proof', () => {
  const current = cards();
  const atTrigger = selection(1);
  const before = proof(current, { sameTimestampOrder: 'BEFORE_TRIGGER' });
  const beforeAssembly = assembleCharacterHitContext(atTrigger, current, { amplification: before });
  assert.equal(beforeAssembly.amplificationContributions[0].active, false);

  const after = proof(current);
  const afterAssembly = assembleCharacterHitContext(atTrigger, current, { amplification: after });
  assert.equal(afterAssembly.amplificationContributions[0].active, true);

  const expiredSel = selection(31);
  const expired = proof(current);
  const expiredAssembly = assembleCharacterHitContext(expiredSel, current, { amplification: expired });
  assert.equal(expiredAssembly.amplificationContributions[0].active, false);
  const result = compareCharacterHitWithAssembledContext({
    selection: expiredSel,
    slotIndex: 0,
    current: { echoes: current, events: { amplification: expired }, remaining: remaining(expiredAssembly, .07) },
    candidate: { echoes: candidateCards(), events: { amplification: proof(candidateCards()) },
      remaining: { status: 'PENDING', reason: 'candidate not evaluated in expiry residual test' } },
  });
  assert.equal(result.comparison.status, 'PENDING');
});

test('duplicate Shorekeeper activation is rejected before any stacking arithmetic', () => {
  const current = cards(), sel = selection(), base = proof(current);
  const duplicate: HitContextAmplificationEvents = {
    ...base,
    shorekeeperOutros: [base.shorekeeperOutros![0], { ...base.shorekeeperOutros![0], evidenceId: 'duplicate' }],
  };
  assert.throws(() => assembleCharacterHitContext(sel, current, { amplification: duplicate }), /duplicate stacking is unreviewed/);
});
