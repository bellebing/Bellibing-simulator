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
  createRank5EchoAtLevel0({ id: `lethean-def-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'lethean-def-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(hitAtSeconds = 2, rank: 1 | 2 | 3 | 4 | 5 = 1): CharacterHitContextSelection {
  const sourceWeapon = WEAPON_CATALOG.find(row => row.id === 'lethean-elegy')!;
  assert.ok(sourceWeapon && sourceWeapon.releaseStatus === 'RELEASED' && sourceWeapon.verificationStatus === 'VERIFIED');
  const support = listCharacterDirectHitSupport().find(row => {
    const character = CHARACTER_CATALOG.find(c => c.id === row.characterId);
    return character?.releaseStatus === 'RELEASED' && character.weaponType === sourceWeapon.weaponType;
  });
  assert.ok(support, 'No direct-hit consumer can equip Lethean Elegy');
  const character = CHARACTER_CATALOG.find(row => row.id === support.characterId)!;
  return {
    hit: { characterId: character.id, factId: support.factId, componentIndex: 0, landedHitCount: 1,
      sequence: 0, maxSkills: true },
    damageElement: character.element!,
    eventContextId: `lethean-def-${character.id}-${support.factId}`,
    hitAtSeconds,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: 'lethean-elegy', level: 90, rank },
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
    weapon: { id: 'lethean-elegy', rank },
    eventContextId: sel.eventContextId,
    evidenceId: 'synthetic-lethean-defense-event-context',
    casts: [],
    damages: [{
      effectId: 'LE-DEF',
      evidenceId: 'synthetic-lethean-echo-damage',
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
    scalingPercent: 0, scalingFlat: 0, critRate: 0, critDamage: 0, damageBonus: 0, amplification: 0,
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

test('Lethean Elegy defense support exposes only LE-DEF and copies no amount or duration', () => {
  const support = listWeaponDamageDefenseHitContextSupport();
  assert.deepEqual(support, [{
    effectId: 'LE-DEF',
    weaponId: 'lethean-elegy',
    statOrEffect: 'DEF Ignore',
    damageClass: 'ECHO',
    primitiveId: 'weapon-damage-timed-self-window-v1',
    scope: 'EXPLICIT_DAMAGE_EVENT_ONLY',
    contextPrimitiveId: 'character-source-qualified-hit-context-v1',
    selectedHitScope: 'ALL_CHARACTER_DIRECT_HITS',
    requiresPerBuildEventProof: true,
    requiresExplicitEnemyDefenseProof: true,
    requiresNoOtherDefenseModifiers: true,
    magnitudeDependsOnEchoStats: false,
    stackingPolicy: 'SINGLE_ACTIVE_DEF_IGNORE_ONLY',
  }]);
  assert.equal(Object.hasOwn(support[0], 'value'), false);
  assert.equal(Object.hasOwn(support[0], 'durationSeconds'), false);
});

test('Lethean Elegy R1-R5 DEF Ignore reuses the existing Echo-damage window and exact defense kernel', () => {
  const effect = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'LE-DEF')!;
  const enemyDefense = 1200;
  for (const rank of [1, 2, 3, 4, 5] as const) {
    const sel = selection(2, rank), current = cards(), candidate = candidateCards();
    const ce = weaponProof(sel, current, rank), ne = weaponProof(sel, candidate, rank);
    const ca = assembleCharacterHitContext(sel, current, { weapon: ce });
    const na = assembleCharacterHitContext(sel, candidate, { weapon: ne });
    assert.equal(ca.defenseContributions.length, 1);
    assert.equal(ca.defenseContributions[0].value, effect.rankValues[rank - 1]);
    assert.equal(ca.defenseContributions[0].active, true);

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

test('active DEF Ignore requires explicit enemy DEF and a no-other-defense-modifier baseline', () => {
  const sel = selection(), current = cards(), candidate = candidateCards();
  const ce = weaponProof(sel, current), ne = weaponProof(sel, candidate);
  const ca = assembleCharacterHitContext(sel, current, { weapon: ce });
  const na = assembleCharacterHitContext(sel, candidate, { weapon: ne });

  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel, slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca, 1200, { includeDefenseContext: false }) },
    candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na) },
  }), /explicit enemy DEF/);

  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel, slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca, 1200, { baselineOffset: .01 }) },
    candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na) },
  }), /no-modifier enemy DEF baseline/);
});

test('Lethean defense proof is per-build and missing LE-DEF remains PENDING_EVENT', () => {
  const sel = selection(), current = cards(), candidate = candidateCards();
  const ce = weaponProof(sel, current), ne = weaponProof(sel, candidate);
  const ca = assembleCharacterHitContext(sel, current, { weapon: ce });
  const na = assembleCharacterHitContext(sel, candidate, { weapon: ne });
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel, slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca) },
    candidate: { echoes: candidate, events: { weapon: ce }, remaining: remaining(na) },
  }), /exact per-build event proof/);

  const without = assembleCharacterHitContext(sel, current);
  assert.equal(without.pending.find(row => row.id === 'weapon:LE-DEF')?.status, 'PENDING_EVENT');
});

test('same-timestamp ordering and expiry remain owned by the existing weapon damage primitive', () => {
  const current = cards();
  const atTrigger = selection(1);
  const before = weaponProof(atTrigger, current, 1, { sameTimestampOrder: 'BEFORE_TRIGGER' });
  assert.equal(assembleCharacterHitContext(atTrigger, current, { weapon: before }).defenseContributions[0].active, false);

  const effect = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'LE-DEF')!;
  const expiredSel = selection(1 + effect.durationSeconds!);
  assert.equal(assembleCharacterHitContext(expiredSel, current, { weapon: weaponProof(expiredSel, current) })
    .defenseContributions[0].active, false);
});

test('wrong trigger/lifecycle cannot manufacture a DEF Ignore window', () => {
  const sel = selection(), current = cards();
  const wrongDamage = weaponProof(sel, current, 1, {
    event: { kind: 'DAMAGE_DEALT', actorId: sel.hit.characterId, damageClass: 'BASIC', atSeconds: 1,
      sourceTriggerQualification: 'VERIFIED_DAMAGE_DEALT' },
  });
  assert.throws(() => assembleCharacterHitContext(sel, current, { weapon: wrongDamage }), /does not activate/);

  for (const patch of [
    { equipmentAtEventQualified: false },
    { priorActivationState: 'UNKNOWN' },
    { noLaterActivationThroughHit: false },
    { sameTimestampOrder: 'UNKNOWN' },
  ]) {
    assert.throws(() => assembleCharacterHitContext(sel, current, {
      weapon: weaponProof(sel, current, 1, patch),
    }));
  }
});
