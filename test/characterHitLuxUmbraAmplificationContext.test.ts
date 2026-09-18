import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { listCharacterDirectHitSupport, type DirectHitDamageClass } from '../src/combat/characterDirectHitAdapter.ts';
import {
  assembleCharacterHitContext,
  compareCharacterHitWithAssembledContext,
  listWeaponDamageAmplificationHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type { HitContextWeaponEvents } from '../src/combat/hitContextWeaponEvents.ts';
import type {
  HitContextAmplificationEvents,
  ProvenHitShorekeeperOutroTeamAmplification,
} from '../src/combat/hitContextAmplificationEvents.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `lux-umbra-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'lux-umbra-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(damageClass: DirectHitDamageClass, hitAtSeconds = 2): CharacterHitContextSelection {
  const sourceWeapon = WEAPON_CATALOG.find(row => row.id === 'lux-and-umbra')!;
  assert.ok(sourceWeapon && sourceWeapon.releaseStatus === 'RELEASED' && sourceWeapon.verificationStatus === 'VERIFIED');
  const support = listCharacterDirectHitSupport().find(row => {
    const character = CHARACTER_CATALOG.find(c => c.id === row.characterId);
    return row.sourceDamageClass === damageClass && character?.releaseStatus === 'RELEASED'
      && character.weaponType === sourceWeapon.weaponType;
  });
  assert.ok(support, `No ${damageClass} direct-hit consumer can equip Lux & Umbra`);
  const character = CHARACTER_CATALOG.find(row => row.id === support.characterId)!;
  return {
    hit: { characterId: character.id, factId: support.factId, componentIndex: 0, landedHitCount: 1,
      sequence: 0, maxSkills: true },
    damageElement: character.element!,
    eventContextId: `lux-umbra-${character.id}-${support.factId}`,
    hitAtSeconds,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: 'lux-and-umbra', level: 90, rank: 1 },
  };
}

function weaponProof(
  sel: CharacterHitContextSelection,
  equippedCards: ReturnType<typeof cards>,
  rank: 1 | 2 | 3 | 4 | 5 = 1,
  effectId = 'LU-HEAVY-AMP',
  patch: Record<string, unknown> = {},
): HitContextWeaponEvents {
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    weapon: { id: 'lux-and-umbra', rank },
    eventContextId: sel.eventContextId,
    evidenceId: 'synthetic-lux-umbra-event-context',
    casts: [],
    damages: [{
      effectId,
      evidenceId: `synthetic-${effectId}-echo-damage`,
      event: {
        kind: 'DAMAGE_DEALT',
        actorId: sel.hit.characterId,
        damageClass: effectId === 'LU-ECHO-AMP' ? 'HEAVY' : 'ECHO',
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

function remaining(a: ReturnType<typeof assembleCharacterHitContext>, amplification = 0): RemainingHitContext {
  return {
    status: 'QUALIFIED',
    assemblyKey: a.assemblyKey,
    evidenceId: 'synthetic-residual-context',
    requirements: a.requirements.map(id => ({ id, evidenceId: `synthetic-proof:${id}` })),
    buildDependentEffectsRecomputed: true,
    scalingPercent: 0, scalingFlat: 0, critRate: 0, critDamage: 0, damageBonus: 0,
    amplification, defenseMultiplier: 0.5, resistanceMultiplier: 0.9, damageReduction: 0,
  };
}

test('Lux & Umbra support exposes exactly Heavy amplification from the existing Echo-damage window proof', () => {
  const support = listWeaponDamageAmplificationHitContextSupport();
  assert.deepEqual(support, [{
    effectId: 'LU-HEAVY-AMP',
    weaponId: 'lux-and-umbra',
    statOrEffect: 'Heavy Attack DMG Amplification',
    damageClass: 'ECHO',
    primitiveId: 'weapon-damage-timed-self-window-v1',
    scope: 'EXPLICIT_DAMAGE_EVENT_ONLY',
    amplificationScope: { kind: 'DAMAGE_CLASS', damageClass: 'HEAVY' },
    contextPrimitiveId: 'character-source-qualified-hit-context-v1',
    selectedHitScope: 'TYPED_SCOPED_CHARACTER_HIT',
    requiresPerBuildEventProof: true,
    magnitudeDependsOnEchoStats: false,
    stackingPolicy: 'SINGLE_ACTIVE_APPLICABLE_TERM_ONLY',
  }]);
  assert.equal(Object.hasOwn(support[0], 'value'), false);
  assert.equal(Object.hasOwn(support[0], 'durationSeconds'), false);
});

test('Lux & Umbra R1-R5 Echo-damage window feeds only later Character Heavy hits', () => {
  const heavy = selection('HEAVY'), effect = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'LU-HEAVY-AMP')!;
  for (const rank of [1, 2, 3, 4, 5] as const) {
    const current = cards(), candidate = candidateCards();
    const ce = weaponProof(heavy, current, rank), ne = weaponProof(heavy, candidate, rank);
    const ranked = { ...heavy, weapon: { ...heavy.weapon, rank } };
    const ca = assembleCharacterHitContext(ranked, current, { weapon: ce });
    const na = assembleCharacterHitContext(ranked, candidate, { weapon: ne });
    assert.equal(ca.amplificationContributions[0].value, effect.rankValues[rank - 1]);
    assert.equal(ca.amplificationContributions[0].active, true);
    const result = compareCharacterHitWithAssembledContext({
      selection: ranked, slotIndex: 0,
      current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca) },
      candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na) },
    });
    assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
    if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected comparison');
    assert.equal(result.comparison.current.snapshot.amplification, effect.rankValues[rank - 1]);
  }

  const basic = selection('BASIC'), current = cards(), candidate = candidateCards();
  const ce = weaponProof(basic, current), ne = weaponProof(basic, candidate);
  const ca = assembleCharacterHitContext(basic, current, { weapon: ce });
  const na = assembleCharacterHitContext(basic, candidate, { weapon: ne });
  const result = compareCharacterHitWithAssembledContext({
    selection: basic, slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca) },
    candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na) },
  });
  assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
  if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected basic comparison');
  assert.equal(result.comparison.current.snapshot.amplification, 0);
});

test('Lux & Umbra reuses per-build weapon evidence and rejects residual double counting', () => {
  const sel = selection('HEAVY'), current = cards(), candidate = candidateCards();
  const ce = weaponProof(sel, current), ne = weaponProof(sel, candidate);
  const ca = assembleCharacterHitContext(sel, current, { weapon: ce });
  const na = assembleCharacterHitContext(sel, candidate, { weapon: ne });
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel, slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca) },
    candidate: { echoes: candidate, events: { weapon: ce }, remaining: remaining(na) },
  }), /exact per-build event proof/);
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel, slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca, .1) },
    candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na) },
  }), /Residual amplification must be zero/);
});

test('weapon damage trigger, lifecycle, same-timestamp ordering and expiry remain owned by the existing primitive', () => {
  const current = cards(), sel = selection('HEAVY', 1);
  const before = weaponProof(sel, current, 1, 'LU-HEAVY-AMP', { sameTimestampOrder: 'BEFORE_TRIGGER' });
  assert.equal(assembleCharacterHitContext(sel, current, { weapon: before }).amplificationContributions[0].active, false);

  const wrongDamage = weaponProof(sel, current, 1, 'LU-HEAVY-AMP', {
    event: { kind: 'DAMAGE_DEALT', actorId: sel.hit.characterId, damageClass: 'HEAVY', atSeconds: 1,
      sourceTriggerQualification: 'VERIFIED_DAMAGE_DEALT' },
  });
  assert.throws(() => assembleCharacterHitContext(sel, current, { weapon: wrongDamage }), /does not activate/);

  const effect = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'LU-HEAVY-AMP')!;
  const expiredSel = selection('HEAVY', 1 + effect.durationSeconds!);
  assert.equal(assembleCharacterHitContext(expiredSel, current, { weapon: weaponProof(expiredSel, current) })
    .amplificationContributions[0].active, false);
});

test('Echo Skill amplification and DEF Ignore weapon windows remain outside Character-hit amplification', () => {
  const sel = selection('HEAVY'), current = cards();
  assert.throws(() => assembleCharacterHitContext(sel, current, {
    weapon: weaponProof(sel, current, 1, 'LU-ECHO-AMP'),
  }), /outside reviewed Character-hit stat\/amplification scope/);
});

test('Lux Heavy amplification overlapping Shorekeeper all-DMG remains PENDING_STACKING', () => {
  const sel = selection('HEAVY'), current = cards(), candidate = candidateCards();
  const ce = weaponProof(sel, current), ne = weaponProof(sel, candidate);
  const shorekeeper: ProvenHitShorekeeperOutroTeamAmplification = {
    sourceFactId: 'the-shorekeeper-outro-binary-butterfly',
    evidenceId: 'synthetic-shorekeeper-lux-overlap',
    sourceWielderId: 'the-shorekeeper',
    sourceQualification: 'SOURCE_PROVEN_SHOREKEEPER_OUTRO',
    teamMemberIds: [sel.hit.characterId, 'iuno', 'the-shorekeeper'],
    event: { kind: 'OUTRO_SKILL_CAST', actorId: 'the-shorekeeper', atSeconds: 1 },
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
  };
  const ampCurrent: HitContextAmplificationEvents = {
    echoStatKey: projectRank5EchoStats(current).key,
    eventContextId: sel.eventContextId,
    evidenceId: 'synthetic-shorekeeper-lux-context',
    shorekeeperOutros: [shorekeeper],
  };
  const ampCandidate: HitContextAmplificationEvents = {
    ...ampCurrent,
    echoStatKey: projectRank5EchoStats(candidate).key,
  };
  const ca = assembleCharacterHitContext(sel, current, { weapon: ce, amplification: ampCurrent });
  const na = assembleCharacterHitContext(sel, candidate, { weapon: ne, amplification: ampCandidate });
  assert.equal(ca.amplificationContributions.filter(row => row.active).length, 2);
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel, slotIndex: 0,
    current: { echoes: current, events: { weapon: ce, amplification: ampCurrent }, remaining: remaining(ca) },
    candidate: { echoes: candidate, events: { weapon: ne, amplification: ampCandidate }, remaining: remaining(na) },
  }), /Multiple active applicable amplification terms/);
});
