import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import {
  assembleCharacterHitContext,
  compareCharacterHitWithAssembledContext,
  listWeaponStatusApplicationHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type {
  HitContextWeaponEvents,
  ProvenHitWeaponStatusApplication,
} from '../src/combat/hitContextWeaponEvents.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `wa-aero-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'wa-aero-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(
  characterId: 'ciaccona' | 'chixia',
  hitAtSeconds = 2,
  rank: 1 | 2 | 3 | 4 | 5 = 1,
): CharacterHitContextSelection {
  const character = CHARACTER_CATALOG.find(row => row.id === characterId)!;
  const hit = listCharacterDirectHitSupport().find(row => row.characterId === characterId)!;
  assert.ok(character?.element && character.weaponType === 'Pistols' && hit);
  return {
    hit: { characterId, factId: hit.factId, componentIndex: 0, landedHitCount: 1,
      sequence: 0, maxSkills: true },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: `wa-aero-${characterId}-${hit.factId}`,
    hitAtSeconds,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: 'woodland-aria', level: 90, rank },
  };
}

function weaponProof(
  sel: CharacterHitContextSelection,
  equippedCards: ReturnType<typeof cards>,
  rank: 1 | 2 | 3 | 4 | 5 = 1,
  patch: Partial<ProvenHitWeaponStatusApplication> = {},
): HitContextWeaponEvents {
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    weapon: { id: 'woodland-aria', rank },
    eventContextId: sel.eventContextId,
    evidenceId: 'synthetic-wa-aero-event-context',
    casts: [],
    statusApplications: [{
      effectId: 'WA-AERO',
      evidenceId: 'synthetic-aero-erosion-application',
      event: {
        kind: 'AERO_EROSION_APPLIED',
        actorId: sel.hit.characterId,
        targetId: 'trigger-enemy',
        sourceFactId: 'synthetic-source-qualified-aero-erosion-fact',
        stacksApplied: 1,
        atSeconds: 1,
        sourceTriggerQualification: 'VERIFIED_AERO_EROSION_APPLICATION',
      },
      equipmentAtEventQualified: true,
      priorActivationState: 'NONE_ACTIVE',
      noLaterActivationThroughHit: true,
      sameTimestampOrder: 'AFTER_TRIGGER',
      ...patch,
    }],
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
    defenseMultiplier: .5,
    resistanceMultiplier: .9,
    damageReduction: 0,
  };
}

test('Woodland Aria self-window support is exact identity/trigger metadata without copied values', () => {
  const support = listWeaponStatusApplicationHitContextSupport();
  assert.deepEqual(support, [{
    effectId: 'WA-AERO',
    weaponId: 'woodland-aria',
    statOrEffect: 'Aero DMG',
    trigger: 'Inflict Aero Erosion on target',
    primitiveId: 'weapon-explicit-status-application-self-window-v1',
    scope: 'EXPLICIT_VERIFIED_AERO_EROSION_APPLICATION_ONLY',
    contextPrimitiveId: 'character-source-qualified-hit-context-v1',
    selectedHitScope: 'SELF_STAT_AFTER_VERIFIED_STATUS_APPLICATION',
    requiresPerBuildEventProof: true,
    requiresExplicitTriggerTargetIdentity: true,
    magnitudeDependsOnEchoStats: false,
  }]);
  assert.equal(Object.hasOwn(support[0], 'value'), false);
  assert.equal(Object.hasOwn(support[0], 'durationSeconds'), false);
});

test('Woodland Aria R1-R5 composes canonical Aero DMG only after explicit status application', () => {
  const effect = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'WA-AERO')!;
  for (const rank of [1, 2, 3, 4, 5] as const) {
    const sel = selection('ciaccona', 2, rank), current = cards(), candidate = candidateCards();
    const ce = weaponProof(sel, current, rank), ne = weaponProof(sel, candidate, rank);
    const ca = assembleCharacterHitContext(sel, current, { weapon: ce });
    const na = assembleCharacterHitContext(sel, candidate, { weapon: ne });
    const event = ca.eventContributions.find(row => row.sourceId === 'weapon:WA-AERO')!;
    assert.equal(event.value, effect.rankValues[rank - 1]);
    assert.equal(event.stat, 'Aero DMG');
    assert.equal(event.active, true);
    assert.equal(event.triggerTargetId, 'trigger-enemy');
    assert.equal(event.appliedStacks, 1);
    assert.equal(ca.stats['Aero DMG'], effect.rankValues[rank - 1]);

    const result = compareCharacterHitWithAssembledContext({
      selection: sel,
      slotIndex: 0,
      current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca) },
      candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na) },
    });
    assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
    if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected comparison');
    assert.equal(result.comparison.current.snapshot.damageBonus, effect.rankValues[rank - 1]);
  }
});

test('self Aero window does not require the later hit target and does not buff a Fusion hit', () => {
  const current = cards(), candidate = candidateCards();
  const sel = selection('chixia');
  assert.equal(sel.targetId, undefined);
  assert.equal(sel.damageElement, 'Fusion');
  const ce = weaponProof(sel, current), ne = weaponProof(sel, candidate);
  const ca = assembleCharacterHitContext(sel, current, { weapon: ce });
  const na = assembleCharacterHitContext(sel, candidate, { weapon: ne });
  assert.equal(ca.eventContributions.find(row => row.sourceId === 'weapon:WA-AERO')?.active, true);
  assert.ok((ca.stats['Aero DMG'] ?? 0) > 0);

  const result = compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca) },
    candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na) },
  });
  assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
  if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected comparison');

  const baselineCurrent = assembleCharacterHitContext(sel, current);
  const baselineCandidate = assembleCharacterHitContext(sel, candidate);
  const baseline = compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, remaining: remaining(baselineCurrent) },
    candidate: { echoes: candidate, remaining: remaining(baselineCandidate) },
  });
  assert.equal(baseline.comparison.status, 'EVALUATED_HIT_COMPARISON');
  if (baseline.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected baseline comparison');
  assert.equal(result.comparison.current.snapshot.damageBonus, baseline.comparison.current.snapshot.damageBonus);
  assert.equal(result.comparison.current.expectedDamage, baseline.comparison.current.expectedDamage);
});

test('application source identity, qualification, equipment and lifecycle fail closed', () => {
  const current = cards(), sel = selection('ciaccona');
  const base = weaponProof(sel, current), original = base.statusApplications![0];
  const patches: Partial<ProvenHitWeaponStatusApplication>[] = [
    { evidenceId: '' },
    { event: { ...original.event, actorId: 'chixia' } },
    { event: { ...original.event, targetId: '' } },
    { event: { ...original.event, sourceFactId: '' } },
    { event: { ...original.event, stacksApplied: 0 } },
    { event: { ...original.event, sourceTriggerQualification: 'UNKNOWN' } },
    { equipmentAtEventQualified: false as true },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
  ];
  for (const patch of patches) {
    const bad = structuredClone(base);
    Object.assign(bad.statusApplications![0], patch);
    assert.throws(() => assembleCharacterHitContext(sel, current, { weapon: bad }));
  }
});

test('same-timestamp ordering, expiry, duplicate activation and per-build evidence are explicit', () => {
  const current = cards(), candidate = candidateCards();
  const atTrigger = selection('ciaccona', 1);
  const before = weaponProof(atTrigger, current, 1, { sameTimestampOrder: 'BEFORE_TRIGGER' });
  assert.equal(assembleCharacterHitContext(atTrigger, current, { weapon: before })
    .eventContributions.find(row => row.sourceId === 'weapon:WA-AERO')?.active, false);
  assert.equal(assembleCharacterHitContext(atTrigger, current, { weapon: weaponProof(atTrigger, current) })
    .eventContributions.find(row => row.sourceId === 'weapon:WA-AERO')?.active, true);

  const effect = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'WA-AERO')!;
  const expired = selection('ciaccona', 1 + effect.durationSeconds!);
  assert.equal(assembleCharacterHitContext(expired, current, { weapon: weaponProof(expired, current) })
    .eventContributions.find(row => row.sourceId === 'weapon:WA-AERO')?.active, false);

  const duplicateBase = weaponProof(selection('ciaccona'), current);
  const duplicate: HitContextWeaponEvents = {
    ...duplicateBase,
    statusApplications: [duplicateBase.statusApplications![0], duplicateBase.statusApplications![0]],
  };
  assert.throws(() => assembleCharacterHitContext(selection('ciaccona'), current, { weapon: duplicate }),
    /unique effect activations/);

  const sel = selection('ciaccona'), ce = weaponProof(sel, current), ne = weaponProof(sel, candidate);
  const ca = assembleCharacterHitContext(sel, current, { weapon: ce });
  const na = assembleCharacterHitContext(sel, candidate, { weapon: ne });
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel, slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca) },
    candidate: { echoes: candidate, events: { weapon: ce }, remaining: remaining(na) },
  }), /exact per-build event proof/);
});

test('missing Woodland Aria application stays PENDING_EVENT independently from WA-AERO-RES', () => {
  const without = assembleCharacterHitContext(selection('ciaccona'), cards());
  assert.equal(without.pending.find(row => row.id === 'weapon:WA-AERO')?.status, 'PENDING_EVENT');
  assert.equal(without.pending.find(row => row.id === 'weapon:WA-AERO-RES')?.status, 'PENDING_EVENT');
});
