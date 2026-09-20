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
import {
  validateLuxUmbraDefenseStateContract,
} from '../src/combat/luxUmbraDefenseStateAdapter.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `lux-def-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'lux-def-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(hitAtSeconds = 2, rank: 1 | 2 | 3 | 4 | 5 = 1): CharacterHitContextSelection {
  const sourceWeapon = WEAPON_CATALOG.find(row => row.id === 'lux-and-umbra')!;
  const hit = listCharacterDirectHitSupport().find(row => {
    const character = CHARACTER_CATALOG.find(c => c.id === row.characterId);
    return row.sourceDamageClass === 'BASIC' && character?.releaseStatus === 'RELEASED'
      && character.weaponType === sourceWeapon.weaponType;
  });
  assert.ok(hit, 'No BASIC direct-hit consumer can equip Lux & Umbra');
  const character = CHARACTER_CATALOG.find(row => row.id === hit.characterId)!;
  assert.ok(character.element);
  return {
    hit: { characterId: character.id, factId: hit.factId, componentIndex: 0, landedHitCount: 1,
      sequence: 0, maxSkills: true },
    damageElement: character.element,
    eventContextId: `lux-def-${character.id}-${hit.factId}`,
    hitAtSeconds,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: 'lux-and-umbra', level: 90, rank },
  };
}

function pairProof(
  sel: CharacterHitContextSelection,
  equippedCards: ReturnType<typeof cards>,
  rank: 1 | 2 | 3 | 4 | 5 = 1,
  options: {
    heavyAt?: number;
    echoAt?: number;
    heavyOrder?: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
    echoOrder?: 'BEFORE_TRIGGER' | 'AFTER_TRIGGER';
    omit?: 'LU-HEAVY-AMP' | 'LU-ECHO-AMP';
  } = {},
): HitContextWeaponEvents {
  const rows = [{
    effectId: 'LU-HEAVY-AMP',
    evidenceId: 'synthetic-lux-heavy-window',
    event: {
      kind: 'DAMAGE_DEALT' as const,
      actorId: sel.hit.characterId,
      damageClass: 'ECHO' as const,
      atSeconds: options.heavyAt ?? 0.5,
      sourceTriggerQualification: 'VERIFIED_DAMAGE_DEALT' as const,
    },
    equipmentAtEventQualified: true as const,
    priorActivationState: 'NONE_ACTIVE' as const,
    noLaterActivationThroughHit: true as const,
    sameTimestampOrder: options.heavyOrder ?? 'AFTER_TRIGGER' as const,
  }, {
    effectId: 'LU-ECHO-AMP',
    evidenceId: 'synthetic-lux-echo-window',
    event: {
      kind: 'DAMAGE_DEALT' as const,
      actorId: sel.hit.characterId,
      damageClass: 'HEAVY' as const,
      atSeconds: options.echoAt ?? 1,
      sourceTriggerQualification: 'VERIFIED_DAMAGE_DEALT' as const,
    },
    equipmentAtEventQualified: true as const,
    priorActivationState: 'NONE_ACTIVE' as const,
    noLaterActivationThroughHit: true as const,
    sameTimestampOrder: options.echoOrder ?? 'AFTER_TRIGGER' as const,
  }].filter(row => row.effectId !== options.omit);
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    weapon: { id: 'lux-and-umbra', rank },
    eventContextId: sel.eventContextId,
    evidenceId: 'synthetic-lux-defense-overlap-context',
    casts: [],
    damages: rows,
  };
}

function remaining(
  a: ReturnType<typeof assembleCharacterHitContext>,
  enemyDefense = 1200,
  includeDefenseContext = true,
): RemainingHitContext {
  const baseline = defenseMultiplier({ attackerLevel: 90, enemyDefense });
  return {
    status: 'QUALIFIED', provenance: 'CALLER_QUALIFIED',
    assemblyKey: a.assemblyKey,
    evidenceId: 'synthetic-residual-context',
    requirements: a.requirements.map(id => ({ id, evidenceId: `synthetic-proof:${id}` })),
    buildDependentEffectsRecomputed: true,
    scalingPercent: 0, scalingFlat: 0, critRate: 0, critDamage: 0,
    damageBonus: 0, amplification: 0, defenseMultiplier: baseline,
    ...(includeDefenseContext ? {
      defenseContext: {
        evidenceId: 'synthetic-enemy-defense-proof',
        enemyDefense,
        otherDefenseModifiersAbsent: true as const,
      },
    } : {}),
    resistanceMultiplier: 0.9, damageReduction: 0,
  };
}

test('Lux DEF support is a two-window state overlap with no invented duration/value', () => {
  const support = listWeaponDamageDefenseHitContextSupport();
  const lux = support.find(row => row.effectId === 'LU-DEF');
  assert.deepEqual(lux, {
    effectId: 'LU-DEF',
    weaponId: 'lux-and-umbra',
    statOrEffect: 'DEF Ignore',
    primitiveId: 'lux-umbra-defense-overlap-v1',
    prerequisiteEffectIds: ['LU-HEAVY-AMP', 'LU-ECHO-AMP'],
    scope: 'BOTH_REVIEWED_LUX_WINDOWS_ACTIVE_AT_SELECTED_HIT',
    rankRange: [1, 5],
    defenseScope: { kind: 'ALL_DAMAGE' },
    contextPrimitiveId: 'character-source-qualified-hit-context-v1',
    selectedHitScope: 'ALL_CHARACTER_DIRECT_HITS',
    requiresPerBuildEventProof: true,
    requiresExplicitEnemyDefenseProof: true,
    requiresNoOtherDefenseModifiers: true,
    magnitudeDependsOnEchoStats: false,
    stackingPolicy: 'SINGLE_ACTIVE_DEF_IGNORE_ONLY',
  });
  assert.ok(lux);
  assert.equal(Object.hasOwn(lux, 'value'), false);
  assert.equal(Object.hasOwn(lux, 'durationSeconds'), false);
});

test('Lux R1-R5 DEF Ignore exists only when both reviewed weapon windows overlap', () => {
  const source = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'LU-DEF')!;
  const enemyDefense = 1200;
  for (const rank of [1, 2, 3, 4, 5] as const) {
    const sel = selection(2, rank), current = cards(), candidate = candidateCards();
    const ce = pairProof(sel, current, rank), ne = pairProof(sel, candidate, rank);
    const ca = assembleCharacterHitContext(sel, current, { weapon: ce });
    const na = assembleCharacterHitContext(sel, candidate, { weapon: ne });
    const defense = ca.defenseContributions.find(row => row.canonicalSourceId === 'LU-DEF')!;
    assert.equal(defense.value, source.rankValues[rank - 1]);
    assert.equal(defense.active, true);
    assert.equal(ca.stateOnlyWeaponContributions[0].sourceId, 'weapon:LU-ECHO-AMP');
    assert.ok(!ca.requirements.includes('weapon:LU-DEF'));
    assert.ok(!ca.requirements.includes('weapon:LU-ECHO-AMP'));

    const result = compareCharacterHitWithAssembledContext({
      selection: sel, slotIndex: 0,
      current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca, enemyDefense) },
      candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na, enemyDefense) },
    });
    assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
    if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected comparison');
    assert.equal(result.comparison.current.snapshot.amplification, 0,
      'Heavy amplification source window is active but does not apply to this BASIC selected hit');
    assert.equal(result.comparison.current.snapshot.defenseMultiplier, defenseMultiplier({
      attackerLevel: 90, enemyDefense, defIgnore: source.rankValues[rank - 1], defReduction: 0,
    }));
  }
});

test('one Lux prerequisite window never manufactures the overlap state', () => {
  const sel = selection(), current = cards();
  for (const omit of ['LU-HEAVY-AMP', 'LU-ECHO-AMP'] as const) {
    const assembly = assembleCharacterHitContext(sel, current, { weapon: pairProof(sel, current, 1, { omit }) });
    assert.ok(!assembly.defenseContributions.some(row => row.canonicalSourceId === 'LU-DEF'));
    assert.ok(assembly.requirements.includes('weapon:LU-DEF'));
  }
});

test('known non-overlap resolves LU-DEF as inactive instead of borrowing an independent timer', () => {
  const current = cards();
  const expiredSel = selection(6.5);
  const expired = assembleCharacterHitContext(expiredSel, current, {
    weapon: pairProof(expiredSel, current),
  });
  const defense = expired.defenseContributions.find(row => row.canonicalSourceId === 'LU-DEF')!;
  assert.equal(defense.active, false,
    'Heavy window started at 0.5 and expires exactly at 6.5; no LU-DEF duration is invented');
  assert.ok(!expired.requirements.includes('weapon:LU-DEF'));

  const tiedSel = selection(1);
  const tied = assembleCharacterHitContext(tiedSel, current, {
    weapon: pairProof(tiedSel, current, 1, { echoAt: 1, echoOrder: 'BEFORE_TRIGGER' }),
  });
  assert.equal(tied.defenseContributions.find(row => row.canonicalSourceId === 'LU-DEF')!.active, false);
});

test('active Lux DEF Ignore requires explicit defense baseline and build-bound window evidence', () => {
  const sel = selection(), current = cards(), candidate = candidateCards();
  const ce = pairProof(sel, current), ne = pairProof(sel, candidate);
  const ca = assembleCharacterHitContext(sel, current, { weapon: ce });
  const na = assembleCharacterHitContext(sel, candidate, { weapon: ne });

  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel, slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca, 1200, false) },
    candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na) },
  }), /explicit enemy DEF/);

  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel, slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca) },
    candidate: { echoes: candidate, events: { weapon: ce }, remaining: remaining(na) },
  }), /exact per-build event proof/);
});

test('LU-DEF canonical overlap contract fails closed on independent-duration or prerequisite drift', () => {
  assert.deepEqual(validateLuxUmbraDefenseStateContract(), []);
  const durationDrift = WEAPON_EFFECT_CATALOG.map(row => row.effectId === 'LU-DEF'
    ? { ...row, durationSeconds: 6 }
    : row);
  assert.ok(validateLuxUmbraDefenseStateContract(durationDrift)
    .some(issue => issue.includes('must not invent an independent duration')));

  const prerequisiteDrift = WEAPON_EFFECT_CATALOG.map(row => row.effectId === 'LU-DEF'
    ? { ...row, conditions: ['LU-HEAVY-AMP is active'] }
    : row);
  assert.ok(validateLuxUmbraDefenseStateContract(prerequisiteDrift)
    .some(issue => issue.includes('prerequisite-window contract drift')));
});
