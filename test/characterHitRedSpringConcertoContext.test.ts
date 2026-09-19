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
  listRedSpringConcertoHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import {
  validateRedSpringConcertoWindowContract,
} from '../src/combat/redSpringConcertoWindowAdapter.ts';
import type {
  HitContextWeaponEvents,
  ProvenHitRedSpringConcertoConsume,
} from '../src/combat/hitContextWeaponEvents.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `red-spring-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'red-spring-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(
  characterId: 'camellya' | 'rover-havoc',
  damageClass: 'BASIC' | 'SKILL' = 'BASIC',
  hitAtSeconds = 2,
): CharacterHitContextSelection {
  const character = CHARACTER_CATALOG.find(row => row.id === characterId)!;
  const hit = listCharacterDirectHitSupport().find(row =>
    row.characterId === characterId && row.sourceDamageClass === damageClass)!;
  assert.ok(character?.element && hit, `missing ${characterId} ${damageClass} direct hit`);
  return {
    hit: {
      characterId,
      factId: hit.factId,
      componentIndex: 0,
      landedHitCount: 1,
      sequence: 0,
      maxSkills: true,
    },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: `red-spring-${characterId}-${damageClass.toLowerCase()}`,
    hitAtSeconds,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: 'red-spring', level: 90, rank: 1 },
  };
}

function consume(
  characterId: 'camellya' | 'rover-havoc',
  patch: Partial<ProvenHitRedSpringConcertoConsume> = {},
): ProvenHitRedSpringConcertoConsume {
  return {
    effectId: 'RS-CONCERTO-BASIC',
    evidenceId: `synthetic-${characterId}-concerto-consume`,
    event: {
      kind: 'CONCERTO_ENERGY_CONSUMED',
      actorId: characterId,
      sourceFactId: `caller-qualified-${characterId}-concerto-consumption`,
      atSeconds: 1,
      sourceTriggerQualification: 'VERIFIED_RED_SPRING_CONCERTO_CONSUMPTION',
    },
    equipmentAtEventQualified: true,
    cooldownReadyAtEventQualified: true,
    cooldownReadyAtSeconds: 0,
    switchOutEvents: [],
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
    sameTimestampSwitchOutOrder: 'NOT_TIED',
    ...patch,
  };
}

function events(
  equippedCards: ReturnType<typeof cards>,
  sel: CharacterHitContextSelection,
  patch: Partial<ProvenHitRedSpringConcertoConsume> = {},
): HitContextWeaponEvents {
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    weapon: { id: 'red-spring', rank: 1 },
    eventContextId: sel.eventContextId,
    evidenceId: 'synthetic-red-spring-hit-context',
    casts: [],
    concertoConsumes: [consume(sel.hit.characterId as 'camellya' | 'rover-havoc', patch)],
  };
}

function remaining(a: ReturnType<typeof assembleCharacterHitContext>): RemainingHitContext {
  return {
    status: 'QUALIFIED',
    assemblyKey: a.assemblyKey,
    evidenceId: 'synthetic-red-spring-remaining-context',
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

test('Red Spring Concerto support is BASIC-only identity/lifecycle metadata without copied source values', () => {
  const support = listRedSpringConcertoHitContextSupport();
  assert.deepEqual(support, [{
    effectId: 'RS-CONCERTO-BASIC',
    weaponId: 'red-spring',
    statOrEffect: 'Basic Attack DMG',
    primitiveId: 'red-spring-explicit-concerto-consume-basic-window-v1',
    selectedHitScope: 'BASIC_DIRECT_HIT_ONLY',
    occurrencePolicy: 'CALLER_QUALIFIED_CONCERTO_CONSUMPTION_ONLY',
    lifecyclePolicy: 'ENDS_ON_WIELDER_SWITCH_OUT',
    contextPrimitiveId: 'character-source-qualified-hit-context-v1',
    requiresPerBuildEventProof: true,
    requiresExplicitCooldownReadyState: true,
    requiresExplicitSwitchOutHistory: true,
    magnitudeDependsOnEchoStats: false,
  }]);
  assert.equal(Object.hasOwn(support[0], 'value'), false);
  assert.equal(Object.hasOwn(support[0], 'rankValues'), false);
  assert.equal(Object.hasOwn(support[0], 'durationSeconds'), false);
  assert.equal(Object.hasOwn(support[0], 'triggerCooldownSeconds'), false);
});

test('Red Spring source drift in duration, cooldown, lifecycle or trigger fails closed', () => {
  const source = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'RS-CONCERTO-BASIC')!;
  for (const patch of [
    { durationSeconds: 9 },
    { triggerCooldownSeconds: 2 },
    { trigger: 'Deal Basic Attack DMG' },
    { appliesTo: 'TEAM' as const },
    { conditions: [] as readonly string[] },
    { mechanicsStatus: 'VERIFIED_MODELED' as const },
  ]) {
    const catalog = WEAPON_EFFECT_CATALOG.map(row =>
      row.effectId === source.effectId ? { ...source, ...patch } : row);
    assert.ok(validateRedSpringConcertoWindowContract(catalog).length > 0);
  }
});

test('missing Concerto consumption leaves RS-CONCERTO-BASIC pending and does not resolve RS-BASIC stack state', () => {
  const sel = selection('camellya'), current = cards();
  const result = assembleCharacterHitContext(sel, current);
  assert.equal(result.pending.find(row => row.id === 'weapon:RS-CONCERTO-BASIC')?.status, 'PENDING_EVENT');
  assert.notEqual(result.pending.find(row => row.id === 'weapon:RS-BASIC')?.status, undefined,
    'the separate three-stack Basic family remains unresolved');
});

test('source-qualified Red Spring window composes for Camellya and Rover Havoc BASIC hits', () => {
  const source = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'RS-CONCERTO-BASIC')!;
  for (const characterId of ['camellya', 'rover-havoc'] as const) {
    const sel = selection(characterId), current = cards(), candidate = candidateCards();
    const currentEvents = events(current, sel);
    const candidateEvents = events(candidate, sel);
    const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
    const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });
    const contribution = currentAssembly.eventContributions.find(row => row.sourceId === 'weapon:RS-CONCERTO-BASIC')!;
    assert.equal(contribution.value, source.rankValues[0]);
    assert.equal(contribution.active, true);
    assert.equal(contribution.nextCooldownReadyAtSeconds, 2);
    assert.ok(!currentAssembly.requirements.includes('weapon:RS-CONCERTO-BASIC'));
    assert.ok(currentAssembly.requirements.includes('weapon:RS-BASIC'));

    const result = compareCharacterHitWithAssembledContext({
      selection: sel,
      slotIndex: 0,
      current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly) },
      candidate: { echoes: candidate, events: { weapon: candidateEvents }, remaining: remaining(candidateAssembly) },
    });
    assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
    if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected comparison');
    const stat = (key: string) => currentAssembly.stats[key] ?? 0;
    assert.equal(result.comparison.current.snapshot.damageBonus,
      stat(sel.damageElement + ' DMG') + stat('All Attribute DMG') + stat('Basic Attack DMG'));
    assert.ok(stat('Basic Attack DMG') >= source.rankValues[0]);
  }
});

test('known active Red Spring window does not leak Basic Attack DMG onto non-BASIC direct hits', () => {
  const sel = selection('rover-havoc', 'SKILL'), current = cards(), candidate = candidateCards();
  const currentEvents = events(current, sel), candidateEvents = events(candidate, sel);
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });
  assert.equal(currentAssembly.eventContributions.find(row => row.sourceId === 'weapon:RS-CONCERTO-BASIC')!.active, true);
  const result = compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { weapon: candidateEvents }, remaining: remaining(candidateAssembly) },
  });
  assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
  if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected comparison');
  const stat = (key: string) => currentAssembly.stats[key] ?? 0;
  assert.equal(result.comparison.current.snapshot.damageBonus,
    stat(sel.damageElement + ' DMG') + stat('All Attribute DMG') + stat('Skill DMG'));
});

test('Red Spring proof is build-bound and exact owner/source/cooldown/lifecycle evidence fails closed', () => {
  const sel = selection('camellya'), current = cards(), candidate = candidateCards();
  const currentEvents = events(current, sel), candidateEvents = events(candidate, sel);
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { weapon: currentEvents }, remaining: remaining(candidateAssembly) },
  }), /per-build event proof/);

  const base = consume('camellya');
  const patches: Partial<ProvenHitRedSpringConcertoConsume>[] = [
    { evidenceId: '' },
    { equipmentAtEventQualified: false as true },
    { cooldownReadyAtEventQualified: false as true },
    { cooldownReadyAtSeconds: -1 },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
    { sameTimestampSwitchOutOrder: 'UNKNOWN' as never },
    { switchOutEvents: [{ kind: 'UNKNOWN' as never, actorId: 'camellya', atSeconds: 1.5 }] },
    { event: { ...base.event, actorId: 'rover-havoc' } },
    { event: { ...base.event, sourceFactId: '' } },
    { event: { ...base.event, sourceTriggerQualification: 'UNKNOWN' } },
    { event: { ...base.event, kind: 'CONCERTO_ENERGY_GAINED' as never } },
  ];
  for (const patch of patches) {
    assert.throws(() => assembleCharacterHitContext(sel, current, {
      weapon: events(current, sel, patch),
    }));
  }
  assert.throws(() => assembleCharacterHitContext(sel, current, {
    weapon: events(current, sel, { cooldownReadyAtSeconds: 2 }),
  }), /does not activate Red Spring/);
});

test('trigger ordering, switch-out termination, tied switch/query ordering and exact expiry are explicit', () => {
  const current = cards();

  const atTrigger = selection('camellya', 'BASIC', 1);
  assert.equal(assembleCharacterHitContext(atTrigger, current, {
    weapon: events(current, atTrigger, { sameTimestampOrder: 'BEFORE_TRIGGER' }),
  }).eventContributions.find(row => row.sourceId === 'weapon:RS-CONCERTO-BASIC')!.active, false);
  assert.equal(assembleCharacterHitContext(atTrigger, current, {
    weapon: events(current, atTrigger),
  }).eventContributions.find(row => row.sourceId === 'weapon:RS-CONCERTO-BASIC')!.active, true);

  const afterSwitch = selection('camellya', 'BASIC', 3);
  assert.equal(assembleCharacterHitContext(afterSwitch, current, {
    weapon: events(current, afterSwitch, {
      switchOutEvents: [{ kind: 'RESONATOR_SWITCH_OUT', actorId: 'camellya', atSeconds: 2 }],
    }),
  }).eventContributions.find(row => row.sourceId === 'weapon:RS-CONCERTO-BASIC')!.active, false);

  const tied = selection('camellya', 'BASIC', 2);
  const tiedHistory = [{ kind: 'RESONATOR_SWITCH_OUT' as const, actorId: 'camellya', atSeconds: 2 }];
  assert.equal(assembleCharacterHitContext(tied, current, {
    weapon: events(current, tied, { switchOutEvents: tiedHistory, sameTimestampSwitchOutOrder: 'BEFORE_QUERY' }),
  }).eventContributions.find(row => row.sourceId === 'weapon:RS-CONCERTO-BASIC')!.active, false);
  assert.equal(assembleCharacterHitContext(tied, current, {
    weapon: events(current, tied, { switchOutEvents: tiedHistory, sameTimestampSwitchOutOrder: 'AFTER_QUERY' }),
  }).eventContributions.find(row => row.sourceId === 'weapon:RS-CONCERTO-BASIC')!.active, true);
  assert.throws(() => assembleCharacterHitContext(tied, current, {
    weapon: events(current, tied, { switchOutEvents: tiedHistory, sameTimestampSwitchOutOrder: 'NOT_TIED' }),
  }), /ordering must match supplied history/);

  const expired = selection('camellya', 'BASIC', 11);
  assert.equal(assembleCharacterHitContext(expired, current, {
    weapon: events(current, expired),
  }).eventContributions.find(row => row.sourceId === 'weapon:RS-CONCERTO-BASIC')!.active, false);
});

test('repeated Red Spring Concerto activations are not used as a refresh model', () => {
  const sel = selection('camellya'), current = cards();
  const base = events(current, sel);
  const duplicate: HitContextWeaponEvents = {
    ...base,
    concertoConsumes: [
      consume('camellya'),
      consume('camellya', {
        evidenceId: 'second-concerto-consume',
        event: { ...consume('camellya').event, atSeconds: 1.5 },
      }),
    ],
  };
  assert.throws(() => assembleCharacterHitContext(sel, current, { weapon: duplicate }),
    /repeated Concerto activation\/refresh is outside one isolated activation proof/);
});
