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
  listBloodpactsPledgeAmplificationHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type {
  HitContextAmplificationEvents,
  ProvenHitBloodpactsPledgeTeamAmplification,
  ProvenHitShorekeeperOutroTeamAmplification,
} from '../src/combat/hitContextAmplificationEvents.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `bpp-amp-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'bpp-amp-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(characterId = 'ciaccona', hitAtSeconds = 2): CharacterHitContextSelection {
  const character = CHARACTER_CATALOG.find(row => row.id === characterId)!;
  const hit = listCharacterDirectHitSupport().find(row => row.characterId === characterId)!;
  const weapon = WEAPON_CATALOG.find(row => row.releaseStatus === 'RELEASED'
    && row.verificationStatus === 'VERIFIED' && row.weaponType === character.weaponType
    && row.id !== 'abyss-surges' && Number.isFinite(row.level90BaseAtk) && row.secondary)!;
  assert.ok(character?.element && hit && weapon);
  return {
    hit: { characterId, factId: hit.factId, componentIndex: 0, landedHitCount: 1,
      sequence: 0, maxSkills: true },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: `bpp-amplification-${characterId}`,
    hitAtSeconds,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: weapon.id, level: 90, rank: 1 },
  };
}

function bppProof(
  equippedCards: ReturnType<typeof cards>,
  characterId = 'ciaccona',
  patch: Partial<ProvenHitBloodpactsPledgeTeamAmplification> = {},
): HitContextAmplificationEvents {
  const row: ProvenHitBloodpactsPledgeTeamAmplification = {
    effectId: 'BPP-TEAM-AERO',
    evidenceId: 'synthetic-bpp-team-amplification',
    sourceWielderId: 'rover-aero',
    sourceEquipmentEvidenceId: 'synthetic-rover-aero-bpp-r1',
    sourceWeaponId: 'bloodpacts-pledge',
    sourceWeaponRank: 1,
    sourceQualification: 'SOURCE_PROVEN_UNBOUND_FLOW_CAST',
    sourceEquipmentAtEventQualified: true,
    recipientEligibility: 'VERIFIED_ELIGIBLE',
    event: { kind: 'ROVER_AERO_UNBOUND_FLOW_CAST', actorId: 'rover-aero', atSeconds: 1 },
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
    ...patch,
  };
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    eventContextId: `bpp-amplification-${characterId}`,
    evidenceId: 'synthetic-bpp-amplification-context',
    weaponTeamAmplifications: [row],
  };
}

function shorekeeperRow(characterId: string): ProvenHitShorekeeperOutroTeamAmplification {
  return {
    sourceFactId: 'the-shorekeeper-outro-binary-butterfly',
    evidenceId: 'synthetic-shorekeeper-overlap',
    sourceWielderId: 'the-shorekeeper',
    sourceQualification: 'SOURCE_PROVEN_SHOREKEEPER_OUTRO',
    teamMemberIds: [characterId, 'rover-aero', 'the-shorekeeper'],
    event: { kind: 'OUTRO_SKILL_CAST', actorId: 'the-shorekeeper', atSeconds: 1 },
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
  };
}

function remaining(
  a: ReturnType<typeof assembleCharacterHitContext>,
  amplification = 0,
): RemainingHitContext {
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
    amplification,
    defenseMultiplier: 0.5,
    resistanceMultiplier: 0.9,
    damageReduction: 0,
  };
}

test('Bloodpact hit support preserves source scope and exposes typed Aero scope without copied values', () => {
  const support = listBloodpactsPledgeAmplificationHitContextSupport();
  assert.deepEqual(support, [{
    effectId: 'BPP-TEAM-AERO',
    weaponId: 'bloodpacts-pledge',
    sourceCharacterId: 'rover-aero',
    statOrEffect: 'Aero DMG Amplification',
    primitiveId: 'weapon-cast-team-amplify-window-v1',
    rankRange: [1, 5],
    sourceScope: 'EXPLICIT_UNBOUND_FLOW_NEARBY_ON_FIELD_AERO_ONLY',
    scope: { kind: 'ELEMENT', element: 'Aero' },
    contextScope: 'EXPLICIT_UNBOUND_FLOW_SINGLE_ACTIVE_AERO_AMPLIFICATION',
    contextPrimitiveId: 'character-source-qualified-hit-context-v1',
    requiresPerBuildEventProof: true,
    requiresExplicitSourceEquipmentProof: true,
    requiresExplicitRecipientEligibilityProof: true,
    stackingPolicy: 'SINGLE_ACTIVE_APPLICABLE_TERM_ONLY',
    magnitudeDependsOnEchoStats: false,
  }]);
  assert.equal(Object.hasOwn(support[0], 'value'), false);
  assert.equal(Object.hasOwn(support[0], 'durationSeconds'), false);
});

test('qualified Bloodpact R1-R5 feeds one Aero hit only with zero residual amplification', () => {
  const sel = selection(), current = cards(), candidate = candidateCards();
  const effect = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'BPP-TEAM-AERO')!;
  for (const rank of [1, 2, 3, 4, 5] as const) {
    const currentEvents = bppProof(current, 'ciaccona', { sourceWeaponRank: rank });
    const candidateEvents = bppProof(candidate, 'ciaccona', { sourceWeaponRank: rank });
    const currentAssembly = assembleCharacterHitContext(sel, current, { amplification: currentEvents });
    const candidateAssembly = assembleCharacterHitContext(sel, candidate, { amplification: candidateEvents });
    assert.equal(currentAssembly.amplificationContributions[0].value, effect.rankValues[rank - 1]);
    assert.equal(currentAssembly.amplificationContributions[0].active, true);

    const result = compareCharacterHitWithAssembledContext({
      selection: sel,
      slotIndex: 0,
      current: { echoes: current, events: { amplification: currentEvents }, remaining: remaining(currentAssembly) },
      candidate: { echoes: candidate, events: { amplification: candidateEvents }, remaining: remaining(candidateAssembly) },
    });
    assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
    if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected comparison');
    assert.equal(result.comparison.current.snapshot.amplification, effect.rankValues[rank - 1]);
  }

  const events = bppProof(current);
  const assembly = assembleCharacterHitContext(sel, current, { amplification: events });
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { amplification: events }, remaining: remaining(assembly, .03) },
    candidate: { echoes: candidate, remaining: { status: 'PENDING', reason: 'not part of residual stacking test' } },
  }), /Residual amplification must be zero/);
});

test('non-Aero or explicitly ineligible Bloodpact window is known inactive and does not erase residual proof', () => {
  const current = cards();
  for (const [sel, events] of [
    [selection('changli'), bppProof(current, 'changli')],
    [selection(), bppProof(current, 'ciaccona', { recipientEligibility: 'VERIFIED_INELIGIBLE' })],
  ] as const) {
    const assembly = assembleCharacterHitContext(sel, current, { amplification: events });
    assert.equal(assembly.amplificationContributions[0].active, false);
    const candidate = candidateCards();
    const result = compareCharacterHitWithAssembledContext({
      selection: sel,
      slotIndex: 0,
      current: { echoes: current, events: { amplification: events }, remaining: remaining(assembly, .07) },
      candidate: { echoes: candidate, remaining: { status: 'PENDING', reason: 'candidate intentionally pending' } },
    });
    assert.equal(result.comparison.status, 'PENDING');
  }
});

test('Bloodpact current/candidate evidence is build-bound and source equipment/lifecycle fail closed', () => {
  const sel = selection(), current = cards(), candidate = candidateCards();
  const currentEvents = bppProof(current), candidateEvents = bppProof(candidate);
  const currentAssembly = assembleCharacterHitContext(sel, current, { amplification: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { amplification: candidateEvents });
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { amplification: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { amplification: currentEvents }, remaining: remaining(candidateAssembly) },
  }), /per-build scoped amplification proof/);

  const original = currentEvents.weaponTeamAmplifications![0];
  const patches: Partial<ProvenHitBloodpactsPledgeTeamAmplification>[] = [
    { sourceWielderId: 'rover-spectro' as 'rover-aero' },
    { sourceEquipmentEvidenceId: '' },
    { sourceWeaponId: 'emerald-of-genesis' as 'bloodpacts-pledge' },
    { sourceWeaponRank: 0 as 1 },
    { sourceQualification: 'UNKNOWN' as never },
    { sourceEquipmentAtEventQualified: false as true },
    { recipientEligibility: 'UNKNOWN' as never },
    { event: { ...original.event, actorId: 'iuno' } },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
  ];
  for (const patch of patches) {
    const bad = structuredClone(currentEvents);
    Object.assign(bad.weaponTeamAmplifications![0], patch);
    assert.throws(() => assembleCharacterHitContext(sel, current, { amplification: bad }));
  }
});

test('same-timestamp ordering, expiry and duplicate Bloodpact activation are explicit', () => {
  const current = cards();
  const atTrigger = selection('ciaccona', 1);
  const before = bppProof(current, 'ciaccona', { sameTimestampOrder: 'BEFORE_TRIGGER' });
  assert.equal(assembleCharacterHitContext(atTrigger, current, { amplification: before })
    .amplificationContributions[0].active, false);
  assert.equal(assembleCharacterHitContext(atTrigger, current, { amplification: bppProof(current) })
    .amplificationContributions[0].active, true);

  const expired = selection('ciaccona', 31);
  assert.equal(assembleCharacterHitContext(expired, current, { amplification: bppProof(current) })
    .amplificationContributions[0].active, false);

  const base = bppProof(current);
  const duplicate: HitContextAmplificationEvents = {
    ...base,
    weaponTeamAmplifications: [
      base.weaponTeamAmplifications![0],
      { ...base.weaponTeamAmplifications![0], evidenceId: 'duplicate-bpp' },
    ],
  };
  assert.throws(() => assembleCharacterHitContext(selection(), current, { amplification: duplicate }),
    /duplicate stacking is unreviewed/);
});

test('simultaneous Shorekeeper all-DMG and Bloodpact Aero amplification is PENDING_STACKING, never guessed', () => {
  const sel = selection(), current = cards(), candidate = candidateCards();
  const currentEvents: HitContextAmplificationEvents = {
    ...bppProof(current),
    shorekeeperOutros: [shorekeeperRow('ciaccona')],
  };
  const candidateEvents: HitContextAmplificationEvents = {
    ...bppProof(candidate),
    shorekeeperOutros: [shorekeeperRow('ciaccona')],
  };
  const currentAssembly = assembleCharacterHitContext(sel, current, { amplification: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { amplification: candidateEvents });
  assert.equal(currentAssembly.amplificationContributions.filter(row => row.active).length, 2);
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { amplification: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { amplification: candidateEvents }, remaining: remaining(candidateAssembly) },
  }), /Multiple active applicable amplification terms/);
});
