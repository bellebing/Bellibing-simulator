import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { defenseMultiplier } from '../src/combat/damageKernel.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import {
  assembleCharacterHitContext,
  compareCharacterHitWithAssembledContext,
  listWeaponDamageDefenseHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type { HitContextWeaponEvents } from '../src/combat/hitContextWeaponEvents.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `solsworn-def-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'solsworn-def-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(
  characterId: 'sigrika' | 'lingyang',
  hitAtSeconds = 2,
  rank: 1 | 2 | 3 | 4 | 5 = 1,
): CharacterHitContextSelection {
  const character = CHARACTER_CATALOG.find(row => row.id === characterId)!;
  const sourceWeapon = WEAPON_CATALOG.find(row => row.id === 'solsworn-ciphers')!;
  const hit = listCharacterDirectHitSupport().find(row => row.characterId === characterId)!;
  assert.ok(character && character.releaseStatus === 'RELEASED' && character.element && hit);
  assert.ok(sourceWeapon && sourceWeapon.releaseStatus === 'RELEASED'
    && sourceWeapon.verificationStatus === 'VERIFIED' && sourceWeapon.weaponType === character.weaponType);
  return {
    hit: { characterId, factId: hit.factId, componentIndex: 0, landedHitCount: 1,
      sequence: 0, maxSkills: true },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: `solsworn-def-${characterId}-${hit.factId}`,
    hitAtSeconds,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: 'solsworn-ciphers', level: 90, rank },
  };
}

function weaponProof(
  sel: CharacterHitContextSelection,
  equippedCards: ReturnType<typeof cards>,
  rank: 1 | 2 | 3 | 4 | 5 = 1,
  patch: Record<string, unknown> = {},
): HitContextWeaponEvents {
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    weapon: { id: 'solsworn-ciphers', rank },
    eventContextId: sel.eventContextId,
    evidenceId: 'synthetic-solsworn-defense-event-context',
    casts: [],
    damages: [{
      effectId: 'SCIP-AERO-DEF',
      evidenceId: 'synthetic-solsworn-echo-damage',
      event: {
        kind: 'DAMAGE_DEALT',
        actorId: sel.hit.characterId,
        damageClass: 'ECHO',
        atSeconds: 1,
        sourceTriggerQualification: 'VERIFIED_DAMAGE_DEALT',
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
  enemyDefense = 1200,
  options: { includeDefenseContext?: boolean; baselineOffset?: number } = {},
): RemainingHitContext {
  const baseline = defenseMultiplier({ attackerLevel: 90, enemyDefense });
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
    defenseMultiplier: baseline + (options.baselineOffset ?? 0),
    ...(options.includeDefenseContext === false ? {} : {
      defenseContext: {
        evidenceId: 'synthetic-enemy-defense-proof',
        enemyDefense,
        otherDefenseModifiersAbsent: true as const,
      },
    }),
    resistanceMultiplier: 0.9,
    damageReduction: 0,
  };
}

test('Solsworn defense support is explicit Aero-only DEF Ignore with no copied amount/duration', () => {
  const support = listWeaponDamageDefenseHitContextSupport();
  const solsworn = support.find(row => row.effectId === 'SCIP-AERO-DEF');
  assert.deepEqual(solsworn, {
    effectId: 'SCIP-AERO-DEF',
    weaponId: 'solsworn-ciphers',
    statOrEffect: 'Aero DMG DEF Ignore',
    damageClass: 'ECHO',
    primitiveId: 'weapon-damage-timed-self-window-v1',
    scope: 'EXPLICIT_DAMAGE_EVENT_ONLY',
    defenseScope: { kind: 'ELEMENT', element: 'Aero' },
    contextPrimitiveId: 'character-source-qualified-hit-context-v1',
    selectedHitScope: 'AERO_ELEMENT_DAMAGE',
    requiresPerBuildEventProof: true,
    requiresExplicitEnemyDefenseProof: true,
    requiresNoOtherDefenseModifiers: true,
    magnitudeDependsOnEchoStats: false,
    stackingPolicy: 'SINGLE_ACTIVE_DEF_IGNORE_ONLY',
  });
  assert.ok(solsworn);
  assert.equal(Object.hasOwn(solsworn, 'value'), false);
  assert.equal(Object.hasOwn(solsworn, 'durationSeconds'), false);
});

test('Solsworn R1-R5 Echo-damage window applies DEF Ignore only to explicit Aero Character hits', () => {
  const effect = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'SCIP-AERO-DEF')!;
  const enemyDefense = 1200;
  for (const rank of [1, 2, 3, 4, 5] as const) {
    const sel = selection('sigrika', 2, rank), current = cards(), candidate = candidateCards();
    const ce = weaponProof(sel, current, rank), ne = weaponProof(sel, candidate, rank);
    const ca = assembleCharacterHitContext(sel, current, { weapon: ce });
    const na = assembleCharacterHitContext(sel, candidate, { weapon: ne });
    const defense = ca.defenseContributions[0];
    assert.equal(defense.value, effect.rankValues[rank - 1]);
    assert.equal(defense.sourceWindowActive, true);
    assert.equal(defense.appliesToSelectedHit, true);
    assert.equal(defense.active, true);

    const result = compareCharacterHitWithAssembledContext({
      selection: sel,
      slotIndex: 0,
      current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca, enemyDefense) },
      candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na, enemyDefense) },
    });
    assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
    if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected comparison');
    assert.equal(result.comparison.current.snapshot.defenseMultiplier, defenseMultiplier({
      attackerLevel: 90,
      enemyDefense,
      defIgnore: effect.rankValues[rank - 1],
      defReduction: 0,
    }));
  }
});

test('a proven Solsworn source window is known inactive for a non-Aero selected hit', () => {
  const sel = selection('lingyang'), current = cards(), candidate = candidateCards();
  assert.notEqual(sel.damageElement, 'Aero');
  const ce = weaponProof(sel, current), ne = weaponProof(sel, candidate);
  const ca = assembleCharacterHitContext(sel, current, { weapon: ce });
  const na = assembleCharacterHitContext(sel, candidate, { weapon: ne });
  assert.equal(ca.defenseContributions[0].sourceWindowActive, true);
  assert.equal(ca.defenseContributions[0].appliesToSelectedHit, false);
  assert.equal(ca.defenseContributions[0].active, false);

  const baseline = defenseMultiplier({ attackerLevel: 90, enemyDefense: 1200 });
  const result = compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca) },
    candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na) },
  });
  assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
  if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected comparison');
  assert.equal(result.comparison.current.snapshot.defenseMultiplier, baseline);
});

test('active Aero DEF Ignore requires exact enemy DEF baseline and independent build proof', () => {
  const sel = selection('sigrika'), current = cards(), candidate = candidateCards();
  const ce = weaponProof(sel, current), ne = weaponProof(sel, candidate);
  const ca = assembleCharacterHitContext(sel, current, { weapon: ce });
  const na = assembleCharacterHitContext(sel, candidate, { weapon: ne });

  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: ce },
      remaining: remaining(ca, 1200, { includeDefenseContext: false }) },
    candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na) },
  }), /explicit enemy DEF/);

  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: ce },
      remaining: remaining(ca, 1200, { baselineOffset: .01 }) },
    candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na) },
  }), /no-modifier enemy DEF baseline/);

  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca) },
    candidate: { echoes: candidate, events: { weapon: ce }, remaining: remaining(na) },
  }), /exact per-build event proof/);
});

test('Solsworn trigger, ordering, expiry and lifecycle remain owned by qualified damage evidence', () => {
  const current = cards();
  const atTrigger = selection('sigrika', 1);
  const before = weaponProof(atTrigger, current, 1, { sameTimestampOrder: 'BEFORE_TRIGGER' });
  assert.equal(assembleCharacterHitContext(atTrigger, current, { weapon: before }).defenseContributions[0].active, false);

  const wrongDamage = weaponProof(atTrigger, current, 1, {
    event: {
      kind: 'DAMAGE_DEALT',
      actorId: atTrigger.hit.characterId,
      damageClass: 'BASIC',
      atSeconds: 1,
      sourceTriggerQualification: 'VERIFIED_DAMAGE_DEALT',
    },
  });
  assert.throws(() => assembleCharacterHitContext(atTrigger, current, { weapon: wrongDamage }), /does not activate/);

  const effect = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'SCIP-AERO-DEF')!;
  const expired = selection('sigrika', 1 + effect.durationSeconds!);
  assert.equal(assembleCharacterHitContext(expired, current, { weapon: weaponProof(expired, current) })
    .defenseContributions[0].active, false);

  for (const patch of [
    { equipmentAtEventQualified: false },
    { priorActivationState: 'UNKNOWN' },
    { noLaterActivationThroughHit: false },
    { sameTimestampOrder: 'UNKNOWN' },
  ]) {
    assert.throws(() => assembleCharacterHitContext(selection('sigrika'), current, {
      weapon: weaponProof(selection('sigrika'), current, 1, patch),
    }));
  }
});

test('missing Solsworn event is PENDING_EVENT rather than assumed uptime', () => {
  const sel = selection('sigrika'), current = cards();
  const without = assembleCharacterHitContext(sel, current);
  assert.equal(without.pending.find(row => row.id === 'weapon:SCIP-AERO-DEF')?.status, 'PENDING_EVENT');
});
