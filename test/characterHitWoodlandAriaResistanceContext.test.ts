import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { resistanceMultiplier } from '../src/combat/damageKernel.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import {
  assembleCharacterHitContext,
  compareCharacterHitWithAssembledContext,
  listWeaponTargetResistanceHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type { HitContextWeaponEvents, ProvenHitWeaponTarget } from '../src/combat/hitContextWeaponEvents.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `wa-res-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'wa-res-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(
  characterId: 'ciaccona' | 'chixia',
  hitAtSeconds = 2,
  rank: 1 | 2 | 3 | 4 | 5 = 1,
  targetId: string | undefined = 'enemy',
): CharacterHitContextSelection {
  const character = CHARACTER_CATALOG.find(row => row.id === characterId)!;
  const hit = listCharacterDirectHitSupport().find(row => row.characterId === characterId)!;
  assert.ok(character?.element && character.weaponType === 'Pistols' && hit);
  return {
    hit: { characterId, factId: hit.factId, componentIndex: 0, landedHitCount: 1,
      sequence: 0, maxSkills: true },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: `wa-res-${characterId}-${hit.factId}`,
    ...(targetId === undefined ? {} : { targetId }),
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
  patch: Partial<ProvenHitWeaponTarget> = {},
): HitContextWeaponEvents {
  const targetId = 'enemy';
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    weapon: { id: 'woodland-aria', rank },
    eventContextId: sel.eventContextId,
    evidenceId: 'synthetic-wa-resistance-event-context',
    casts: [],
    targets: [{
      effectId: 'WA-AERO-RES',
      evidenceId: 'synthetic-wa-aero-eroded-hit',
      event: {
        kind: 'HIT_TARGET',
        actorId: sel.hit.characterId,
        targetId,
        sourceFactId: sel.hit.factId,
        atSeconds: 1,
        sourceTriggerQualification: 'VERIFIED_SOURCE_TRIGGER',
      },
      target: {
        kind: 'AERO_EROSION',
        targetId,
        observedAtSeconds: 1,
        observationOrder: 'BEFORE_TRIGGER',
        affected: true,
      },
      equipmentAtEventQualified: true,
      priorActivationState: 'NONE_ACTIVE',
      noLaterActivationThroughHit: true,
      sameTimestampOrder: 'AFTER_TRIGGER',
      ...patch,
    }],
  };
}

function remaining(
  a: ReturnType<typeof assembleCharacterHitContext>,
  targetResistance = .1,
  options: { includeResistanceContext?: boolean; baselineOffset?: number; modifiersAbsent?: boolean } = {},
): RemainingHitContext {
  const baseline = resistanceMultiplier(targetResistance, 0);
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
    resistanceMultiplier: baseline + (options.baselineOffset ?? 0),
    ...(options.includeResistanceContext === false ? {} : {
      resistanceContext: {
        evidenceId: 'synthetic-target-base-resistance-proof',
        targetResistance,
        otherResistanceModifiersAbsent: (options.modifiersAbsent ?? true) as true,
      },
    }),
    damageReduction: 0,
  };
}

test('Woodland Aria resistance support is exactly the reviewed Aero target reduction without copied values', () => {
  const support = listWeaponTargetResistanceHitContextSupport();
  assert.deepEqual(support, [{
    effectId: 'WA-AERO-RES',
    weaponId: 'woodland-aria',
    statOrEffect: 'Aero RES Reduction',
    trigger: 'Hit target affected by Aero Erosion',
    condition: 'AERO_EROSION',
    primitiveId: 'weapon-explicit-target-hit-window-v1',
    scope: 'EXPLICIT_PRE_HIT_TARGET_STATE_ONLY',
    resistanceScope: { kind: 'ELEMENT', element: 'Aero' },
    contextPrimitiveId: 'character-source-qualified-hit-context-v1',
    selectedHitScope: 'AERO_ELEMENT_SAME_TARGET',
    requiresPerBuildEventProof: true,
    requiresExplicitTargetIdentity: true,
    requiresExplicitTargetResistanceProof: true,
    requiresNoOtherResistanceModifiers: true,
    magnitudeDependsOnEchoStats: false,
    stackingPolicy: 'SINGLE_ACTIVE_RES_REDUCTION_ONLY',
  }]);
  assert.equal(Object.hasOwn(support[0], 'value'), false);
  assert.equal(Object.hasOwn(support[0], 'durationSeconds'), false);
});

test('Woodland Aria R1-R5 reduces only explicit same-target Aero resistance', () => {
  const effect = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'WA-AERO-RES')!;
  const targetResistance = .1;
  for (const rank of [1, 2, 3, 4, 5] as const) {
    const sel = selection('ciaccona', 2, rank), current = cards(), candidate = candidateCards();
    const ce = weaponProof(sel, current, rank), ne = weaponProof(sel, candidate, rank);
    const ca = assembleCharacterHitContext(sel, current, { weapon: ce });
    const na = assembleCharacterHitContext(sel, candidate, { weapon: ne });
    const resistance = ca.resistanceContributions[0];
    assert.equal(resistance.value, effect.rankValues[rank - 1]);
    assert.equal(resistance.sourceWindowActive, true);
    assert.equal(resistance.appliesToSelectedHit, true);
    assert.equal(resistance.targetId, 'enemy');
    assert.equal(resistance.active, true);

    const result = compareCharacterHitWithAssembledContext({
      selection: sel,
      slotIndex: 0,
      current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca, targetResistance) },
      candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na, targetResistance) },
    });
    assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
    if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected comparison');
    assert.equal(result.comparison.current.snapshot.resistanceMultiplier,
      resistanceMultiplier(targetResistance, effect.rankValues[rank - 1]));
  }
});

test('known Woodland Aria target window is inactive for a non-Aero Character hit', () => {
  const sel = selection('chixia'), current = cards(), candidate = candidateCards();
  assert.notEqual(sel.damageElement, 'Aero');
  const ce = weaponProof(sel, current), ne = weaponProof(sel, candidate);
  const ca = assembleCharacterHitContext(sel, current, { weapon: ce });
  const na = assembleCharacterHitContext(sel, candidate, { weapon: ne });
  assert.equal(ca.resistanceContributions[0].sourceWindowActive, true);
  assert.equal(ca.resistanceContributions[0].appliesToSelectedHit, false);
  assert.equal(ca.resistanceContributions[0].active, false);

  const baseline = resistanceMultiplier(.1, 0);
  const result = compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca, .1, { includeResistanceContext: false }) },
    candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na, .1, { includeResistanceContext: false }) },
  });
  assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
  if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected comparison');
  assert.equal(result.comparison.current.snapshot.resistanceMultiplier, baseline);
});

test('active target RES reduction requires exact target identity, base resistance and clean baseline', () => {
  const current = cards(), candidate = candidateCards();

  const missingTarget = selection('ciaccona', 2, 1, undefined);
  assert.throws(() => assembleCharacterHitContext(missingTarget, current, {
    weapon: weaponProof(missingTarget, current),
  }), /explicit selected hit target identity/);

  const wrongTarget = selection('ciaccona', 2, 1, 'other-enemy');
  assert.throws(() => assembleCharacterHitContext(wrongTarget, current, {
    weapon: weaponProof(wrongTarget, current),
  }), /canonical target\/scope\/value/);

  const sel = selection('ciaccona'), ce = weaponProof(sel, current), ne = weaponProof(sel, candidate);
  const ca = assembleCharacterHitContext(sel, current, { weapon: ce });
  const na = assembleCharacterHitContext(sel, candidate, { weapon: ne });

  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel, slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca, .1, { includeResistanceContext: false }) },
    candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na) },
  }), /explicit selected target\/base RES/);

  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel, slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca, .1, { baselineOffset: .01 }) },
    candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na) },
  }), /no-modifier target RES baseline/);

  const dirty = remaining(ca) as Extract<RemainingHitContext, { status: 'QUALIFIED' }>;
  const dirtyProof = { ...dirty, resistanceContext: { ...dirty.resistanceContext!, otherResistanceModifiersAbsent: false as true } };
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel, slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: dirtyProof },
    candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na) },
  }), /other resistance modifiers are absent/);
});

test('Woodland Aria target state, trigger, ordering and lifecycle fail closed', () => {
  const current = cards(), sel = selection('ciaccona');
  const base = weaponProof(sel, current), original = base.targets![0];
  const patches: Partial<ProvenHitWeaponTarget>[] = [
    { target: { ...original.target, affected: false } as ProvenHitWeaponTarget['target'] },
    { target: { ...original.target, observationOrder: 'UNKNOWN' } as ProvenHitWeaponTarget['target'] },
    { target: { ...original.target, targetId: 'other-enemy' } as ProvenHitWeaponTarget['target'] },
    { event: { ...original.event, actorId: 'chixia' } },
    { event: { ...original.event, sourceTriggerQualification: 'UNKNOWN' } },
    { equipmentAtEventQualified: false as true },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
  ];
  for (const patch of patches) {
    const bad = structuredClone(base);
    Object.assign(bad.targets![0], patch);
    assert.throws(() => assembleCharacterHitContext(sel, current, { weapon: bad }));
  }
});

test('same-timestamp ordering, expiry, duplicate activation and per-build proof are explicit', () => {
  const current = cards(), candidate = candidateCards();
  const atTrigger = selection('ciaccona', 1);
  const before = weaponProof(atTrigger, current, 1, { sameTimestampOrder: 'BEFORE_TRIGGER' });
  assert.equal(assembleCharacterHitContext(atTrigger, current, { weapon: before }).resistanceContributions[0].active, false);
  assert.equal(assembleCharacterHitContext(atTrigger, current, { weapon: weaponProof(atTrigger, current) })
    .resistanceContributions[0].active, true);

  const effect = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'WA-AERO-RES')!;
  const expired = selection('ciaccona', 1 + effect.durationSeconds!);
  assert.equal(assembleCharacterHitContext(expired, current, { weapon: weaponProof(expired, current) })
    .resistanceContributions[0].active, false);

  const duplicateBase = weaponProof(selection('ciaccona'), current);
  const duplicate: HitContextWeaponEvents = {
    ...duplicateBase,
    targets: [duplicateBase.targets![0], duplicateBase.targets![0]],
  };
  assert.throws(() => assembleCharacterHitContext(selection('ciaccona'), current, { weapon: duplicate }), /unique effect activations/);

  const sel = selection('ciaccona'), ce = weaponProof(sel, current), ne = weaponProof(sel, candidate);
  const ca = assembleCharacterHitContext(sel, current, { weapon: ce });
  const na = assembleCharacterHitContext(sel, candidate, { weapon: ne });
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel, slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca) },
    candidate: { echoes: candidate, events: { weapon: ce }, remaining: remaining(na) },
  }), /exact per-build event proof/);
});

test('missing Woodland Aria target event stays PENDING_EVENT', () => {
  const sel = selection('ciaccona'), current = cards();
  const without = assembleCharacterHitContext(sel, current);
  assert.equal(without.pending.find(row => row.id === 'weapon:WA-AERO-RES')?.status, 'PENDING_EVENT');
});
