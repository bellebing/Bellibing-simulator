import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import {
  listWeaponCooldownCastWindowSupport,
  validateWeaponCooldownCastWindowContracts,
  type CooldownCastWindowEffectId,
} from '../src/combat/weaponCooldownCastWindowAdapter.ts';
import {
  assembleCharacterHitContext,
  compareCharacterHitWithAssembledContext,
  listWeaponCooldownCastHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type {
  HitContextWeaponEvents,
  ProvenHitWeaponCooldownCast,
} from '../src/combat/hitContextWeaponEvents.ts';

const EFFECT_IDS = ['CS-ATK', 'EC-ATK', 'FA-ATK', 'RJ-ATK', 'WR-ATK'] as const;

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `cooldown-cast-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'cooldown-cast-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function fixture(effectId: CooldownCastWindowEffectId, rank: 1 | 2 | 3 | 4 | 5 = 1) {
  const effect = WEAPON_EFFECT_CATALOG.find(row => row.effectId === effectId)!;
  const weapon = WEAPON_CATALOG.find(row => row.id === effect.weaponId)!;
  const hitSupport = listCharacterDirectHitSupport().find(row => {
    const character = CHARACTER_CATALOG.find(c => c.id === row.characterId);
    return character?.releaseStatus === 'RELEASED' && character.weaponType === weapon.weaponType;
  })!;
  const character = CHARACTER_CATALOG.find(row => row.id === hitSupport.characterId)!;
  assert.ok(effect && weapon && hitSupport && character.element);
  const selection: CharacterHitContextSelection = {
    hit: { characterId: character.id, factId: hitSupport.factId, componentIndex: 0,
      landedHitCount: 1, sequence: 0, maxSkills: true },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: `cooldown-cast-${effectId}-${character.id}`,
    hitAtSeconds: 2,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: weapon.id, level: 90, rank },
  };
  return { effect, weapon, character, selection };
}

function weaponProof(
  f: ReturnType<typeof fixture>,
  equippedCards: ReturnType<typeof cards>,
  patch: Partial<ProvenHitWeaponCooldownCast> = {},
): HitContextWeaponEvents {
  const row: ProvenHitWeaponCooldownCast = {
    effectId: f.effect.effectId as CooldownCastWindowEffectId,
    evidenceId: `synthetic-${f.effect.effectId}-cast-window`,
    event: { kind: 'RESONANCE_SKILL_CAST', actorId: f.character.id, atSeconds: 1 },
    sourceQualification: 'SOURCE_PROVEN_CAST',
    equipmentAtEventQualified: true,
    cooldownReadyAtEventQualified: true,
    cooldownReadyAtSeconds: 1,
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
    ...patch,
  };
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    weapon: { id: f.weapon.id, rank: f.selection.weapon.rank },
    eventContextId: f.selection.eventContextId,
    evidenceId: 'synthetic-cooldown-cast-context',
    casts: [],
    cooldownCasts: [row],
  };
}

function remaining(a: ReturnType<typeof assembleCharacterHitContext>): RemainingHitContext {
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
    amplification: 0,
    defenseMultiplier: .5,
    resistanceMultiplier: .9,
    damageReduction: 0,
  };
}

test('cooldown-cast support is exactly the five reviewed 16s ATK windows and copies no values', () => {
  assert.deepEqual(validateWeaponCooldownCastWindowContracts(), []);
  const primitive = listWeaponCooldownCastWindowSupport();
  const support = listWeaponCooldownCastHitContextSupport();
  assert.deepEqual(primitive.map(row => row.effectId), [...EFFECT_IDS]);
  assert.deepEqual(support.map(row => row.effectId), [...EFFECT_IDS]);
  assert.ok(support.every(row => row.statOrEffect === 'ATK%'
    && row.triggerEvent === 'RESONANCE_SKILL_CAST'
    && row.requiresExplicitCooldownReadyState
    && row.requiresPerBuildEventProof
    && !Object.hasOwn(row, 'value')
    && !Object.hasOwn(row, 'durationSeconds')
    && !Object.hasOwn(row, 'triggerCooldownSeconds')));
});

test('all five cooldown-cast effects read exact canonical R1-R5 values', () => {
  for (const effectId of EFFECT_IDS) {
    for (const rank of [1, 2, 3, 4, 5] as const) {
      const f = fixture(effectId, rank), current = cards(), events = weaponProof(f, current);
      const assembly = assembleCharacterHitContext(f.selection, current, { weapon: events });
      const contribution = assembly.eventContributions.find(row => row.sourceId === `weapon:${effectId}`)!;
      assert.equal(contribution.value, f.effect.rankValues[rank - 1]);
      assert.equal(contribution.stat, 'ATK%');
      assert.equal(contribution.active, true);
      assert.equal(contribution.cooldownReadyAtSeconds, 1);
      assert.equal(contribution.nextCooldownReadyAtSeconds, 21);
      assert.ok(!assembly.requirements.includes(`weapon:${effectId}`));
      assert.ok(!assembly.eventContributions.some(row =>
        row.stat === 'Resonance Energy' || row.stat === 'Concerto Energy'),
      'stat-window proof never fabricates the companion resource event');
    }
  }
});

test('cooldown readiness, exact weapon/actor/event and lifecycle proof fail closed', () => {
  const f = fixture('WR-ATK'), current = cards(), base = weaponProof(f, current);
  const original = base.cooldownCasts![0];
  const patches: Partial<ProvenHitWeaponCooldownCast>[] = [
    { evidenceId: '' },
    { event: { ...original.event, kind: 'RESONANCE_LIBERATION_CAST' } },
    { event: { ...original.event, actorId: 'not-the-wielder' } },
    { sourceQualification: 'UNKNOWN' as never },
    { equipmentAtEventQualified: false as true },
    { cooldownReadyAtEventQualified: false as true },
    { cooldownReadyAtSeconds: 2 },
    { cooldownReadyAtSeconds: Number.NaN },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
  ];
  for (const patch of patches) {
    const bad = structuredClone(base);
    Object.assign(bad.cooldownCasts![0], patch);
    assert.throws(() => assembleCharacterHitContext(f.selection, current, { weapon: bad }));
  }
  const wrongWeapon = structuredClone(base);
  wrongWeapon.weapon.id = 'celestial-spiral';
  assert.throws(() => assembleCharacterHitContext(f.selection, current, { weapon: wrongWeapon }));
});

test('same-timestamp ordering, exact expiry and duplicate activation stay explicit', () => {
  const f = fixture('EC-ATK'), current = cards();
  const atTrigger = { ...f.selection, hitAtSeconds: 1 };
  const before = weaponProof(f, current, { sameTimestampOrder: 'BEFORE_TRIGGER' });
  assert.equal(assembleCharacterHitContext(atTrigger, current, { weapon: before })
    .eventContributions.find(row => row.sourceId === 'weapon:EC-ATK')?.active, false);
  assert.equal(assembleCharacterHitContext(atTrigger, current, { weapon: weaponProof(f, current) })
    .eventContributions.find(row => row.sourceId === 'weapon:EC-ATK')?.active, true);

  const expired = { ...f.selection, hitAtSeconds: 17 };
  assert.equal(assembleCharacterHitContext(expired, current, { weapon: weaponProof(f, current) })
    .eventContributions.find(row => row.sourceId === 'weapon:EC-ATK')?.active, false);

  const base = weaponProof(f, current);
  const duplicate: HitContextWeaponEvents = {
    ...base,
    cooldownCasts: [base.cooldownCasts![0], base.cooldownCasts![0]],
  };
  assert.throws(() => assembleCharacterHitContext(f.selection, current, { weapon: duplicate }),
    /unique effect activations/);
});

test('current and candidate builds require independent cooldown-cast evidence', () => {
  const f = fixture('FA-ATK'), current = cards(), candidate = candidateCards();
  const ce = weaponProof(f, current), ne = weaponProof(f, candidate);
  const ca = assembleCharacterHitContext(f.selection, current, { weapon: ce });
  const na = assembleCharacterHitContext(f.selection, candidate, { weapon: ne });
  const result = compareCharacterHitWithAssembledContext({
    selection: f.selection,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca) },
    candidate: { echoes: candidate, events: { weapon: ne }, remaining: remaining(na) },
  });
  assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');

  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: f.selection,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: ce }, remaining: remaining(ca) },
    candidate: { echoes: candidate, events: { weapon: ce }, remaining: remaining(na) },
  }), /exact per-build event proof/);
});

test('source drift in trigger, duration, cooldown, scope or conditions fails contract validation', () => {
  const source = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'RJ-ATK')!;
  for (const patch of [
    { trigger: 'Cast Resonance Liberation' },
    { durationSeconds: 15 },
    { triggerCooldownSeconds: 19 },
    { appliesTo: 'TEAM' as const },
    { conditions: ['Unknown extra state'] },
    { maxStacks: 2 },
  ]) {
    const catalog = WEAPON_EFFECT_CATALOG.map(row => row.effectId === source.effectId ? { ...row, ...patch } : row);
    assert.ok(validateWeaponCooldownCastWindowContracts(catalog).length > 0);
  }
});

test('missing cooldown-qualified cast remains PENDING_EVENT rather than guessed uptime', () => {
  for (const effectId of EFFECT_IDS) {
    const f = fixture(effectId), without = assembleCharacterHitContext(f.selection, cards());
    assert.equal(without.pending.find(row => row.id === `weapon:${effectId}`)?.status, 'PENDING_EVENT');
  }
});
