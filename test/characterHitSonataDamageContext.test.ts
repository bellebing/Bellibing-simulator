import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import { assembleCharacterHitContext, compareCharacterHitWithAssembledContext, listSonataDamageHitContextSupport,
  type CharacterHitContextSelection, type RemainingHitContext } from '../src/combat/characterHitContext.ts';
import { evaluateHitContextSonataCasts, type HitContextSonataEvents } from '../src/combat/hitContextSonataEvents.ts';

function exactEquipment(setId: string, pieces: 3 | 5) {
  const targetCosts = pieces === 5 ? [4, 3, 3, 1, 1] : [4, 3, 1];
  const fillerCosts = pieces === 5 ? [] : [3, 1];
  const used = new Set<string>();
  const take = (cost: number, predicate: (sets: readonly string[]) => boolean) => {
    const echo = ECHO_CATALOG.find(e => e.releaseStatus === 'RELEASED' && e.cost === cost
      && !used.has(e.id) && predicate(e.sonataSetIds));
    assert.ok(echo, `missing canonical ${cost}-cost Echo for ${setId}`);
    used.add(echo.id);
    return echo;
  };
  const target = targetCosts.map(cost => take(cost, sets => sets.some(id => id === setId)));
  const filler = fillerCosts.map(cost => take(cost, sets => !sets.some(id => id === setId)));
  const species = [...target, ...filler];
  const slots = species.map((echo, index) => ({
    echoId: echo.id,
    sonataSetId: index < target.length ? setId : echo.sonataSetIds[0],
  }));
  return { species, slots };
}

function fixture(effectId: 'S22_3PC_HEAVY_CR' | 'S29_5PC_AERO') {
  const support = listSonataDamageHitContextSupport().find(s => s.effectId === effectId)!;
  const characterId = effectId === 'S22_3PC_HEAVY_CR' ? 'galbrena' : 'sigrika';
  const character = CHARACTER_CATALOG.find(c => c.id === characterId)!;
  assert.ok(character.element);
  const preset = PROFILE_CATALOGS.presets.find(p => p.characterId === characterId
    && PROFILE_CATALOGS.echoLoadouts.find(e => e.id === p.echoLoadoutProfileId)?.sonataSetIds.some(id => id === support.sonataSetId))!;
  assert.ok(preset);
  const weapons = PROFILE_CATALOGS.weaponRecommendations.find(w => w.id === preset.weaponRecommendationProfileId)!;
  const weaponId = weapons.options.find(w => w.weaponId !== 'abyss-surges')?.weaponId;
  assert.ok(weaponId);
  const hitSupport = listCharacterDirectHitSupport().find(h => h.characterId === characterId
    && (effectId !== 'S22_3PC_HEAVY_CR' || h.sourceDamageClass === 'HEAVY'))!;
  assert.ok(hitSupport);
  const exact = exactEquipment(support.sonataSetId, support.pieces as 3 | 5);
  const current = exact.species.map((s, i) => createRank5EchoAtLevel0({
    id: `current-${effectId}-${i}`, cost: s.cost, primaryMainStat: 'ATK%',
  }));
  const candidate = structuredClone(current);
  candidate[0] = createRank5EchoAtLevel0({ id: `candidate-${effectId}`, cost: 4, primaryMainStat: 'CRIT Rate' });
  const selection: CharacterHitContextSelection = {
    hit: { characterId, factId: hitSupport.factId, componentIndex: 0, landedHitCount: 1, sequence: 0, maxSkills: true },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: `synthetic-${effectId}-hit`, hitAtSeconds: 2,
    characterLevel: 90, maxMinorFortes: true, weapon: { id: weaponId, level: 90, rank: 1 },
    echoEquipment: { evidenceId: 'canonical-species-set-assignment', mainSlotIndex: 0, slots: exact.slots },
  };
  const events = (echoes: typeof current): { sonata: HitContextSonataEvents } => ({ sonata: {
    echoStatKey: projectRank5EchoStats(echoes).key, equipmentKey: JSON.stringify(selection.echoEquipment),
    eventContextId: selection.eventContextId, evidenceId: 'synthetic-per-build-sonata-damage-proof', casts: [],
    damages: [{ effectId, evidenceId: 'synthetic-qualified-damage',
      event: { kind: 'DAMAGE_DEALT', actorId: characterId, damageClass: support.damageClass, atSeconds: 1,
        sourceTriggerQualification: 'VERIFIED_DAMAGE_DEALT' },
      equipmentAtEventQualified: true, priorActivationState: 'NONE_ACTIVE',
      noLaterActivationThroughHit: true, sameTimestampOrder: 'AFTER_TRIGGER' }] } });
  return { support, selection, current, candidate, events };
}

function proof(a: ReturnType<typeof assembleCharacterHitContext>): RemainingHitContext {
  return { status: 'QUALIFIED', assemblyKey: a.assemblyKey, evidenceId: 'synthetic-other-effects-inactive',
    requirements: a.requirements.map(id => ({ id, evidenceId: 'synthetic-scope-proof' })), buildDependentEffectsRecomputed: true,
    scalingPercent: 0, scalingFlat: 0, critRate: 0, critDamage: 0, damageBonus: 0, amplification: 0,
    defenseMultiplier: 0.5, resistanceMultiplier: 0.9, damageReduction: 0 };
}

function comparison(f = fixture('S22_3PC_HEAVY_CR')) {
  const build = (echoes: typeof f.current) => {
    const events = f.events(echoes);
    return { echoes, events, remaining: proof(assembleCharacterHitContext(f.selection, echoes, events)) };
  };
  return { selection: f.selection, slotIndex: 0, current: build(f.current), candidate: build(f.candidate) };
}

test('Character direct-hit Sonata damage bridge exposes only the two source-valid target-stat contracts', () => {
  const support = listSonataDamageHitContextSupport();
  assert.deepEqual(support.map(s => s.effectId), ['S22_3PC_HEAVY_CR', 'S29_5PC_AERO']);
  assert.deepEqual(support.map(s => s.selectedHitScope), ['HEAVY_DIRECT_HIT_ONLY', 'AERO_ELEMENT_DAMAGE']);
  assert.ok(!support.some(s => s.effectId === 'S22_3PC_ECHO_CR' || s.effectId === 'S29_5PC_ECHO_CR'));
});

test('both supported Sonata damage windows compose from exact per-build damage evidence', () => {
  for (const effectId of ['S22_3PC_HEAVY_CR', 'S29_5PC_AERO'] as const) {
    const f = fixture(effectId), events = f.events(f.current);
    const before = assembleCharacterHitContext(f.selection, f.current);
    assert.equal(before.pending.find(p => p.id === `sonata:${effectId}`)?.status, 'PENDING_EVENT');
    const after = assembleCharacterHitContext(f.selection, f.current, events);
    const contribution = after.eventContributions.find(c => c.sourceId === `sonata:${effectId}`)!;
    assert.equal(contribution.value, SONATA_EFFECT_MODELS.find(e => e.effectId === effectId)!.value);
    assert.equal(contribution.status, 'EVENT_QUALIFIED_ASSEMBLED');
    assert.equal(contribution.appliesToSelectedHit, true);
    assert.ok(!after.requirements.includes(`sonata:${effectId}`));
    assert.equal(compareCharacterHitWithAssembledContext(comparison(f)).comparison.status, 'EVALUATED_HIT_COMPARISON');
  }
});

test('Heavy Attack CRIT Rate never becomes generic CRIT Rate for a non-Heavy Character hit', () => {
  const f = fixture('S22_3PC_HEAVY_CR');
  const proof = f.events(f.current).sonata;
  const contributions = evaluateHitContextSonataCasts({
    characterId: f.selection.hit.characterId, hitAtSeconds: f.selection.hitAtSeconds!,
    eventContextId: f.selection.eventContextId, echoStatKey: projectRank5EchoStats(f.current).key,
    equipmentKey: JSON.stringify(f.selection.echoEquipment),
    pieceCounts: new Map([[f.support.sonataSetId, f.support.pieces]]),
    hitDamageClass: 'BASIC', proof,
  });
  const contribution = contributions.find(c => c.sourceId === 'sonata:S22_3PC_HEAVY_CR')!;
  assert.equal(contribution.active, true);
  assert.equal(contribution.appliesToSelectedHit, false);
  assert.equal(contribution.value, 0);
});

test('Sonata damage proof rejects wrong source event, owner, equipment and lifecycle', () => {
  const f = fixture('S29_5PC_AERO'), events = f.events(f.current);
  const patches = [
    { event: { ...events.sonata.damages![0].event, actorId: 'galbrena' } },
    { event: { ...events.sonata.damages![0].event, damageClass: 'HEAVY' } },
    { event: { ...events.sonata.damages![0].event, sourceTriggerQualification: 'UNKNOWN' } },
    { equipmentAtEventQualified: false }, { priorActivationState: 'UNKNOWN' },
    { noLaterActivationThroughHit: false }, { sameTimestampOrder: 'UNKNOWN' },
  ];
  for (const patch of patches) {
    const bad = structuredClone(events);
    Object.assign(bad.sonata.damages![0], patch);
    assert.throws(() => assembleCharacterHitContext(f.selection, f.current, bad));
  }
  const duplicate = structuredClone(events);
  duplicate.sonata.damages = [events.sonata.damages![0], events.sonata.damages![0]];
  assert.throws(() => assembleCharacterHitContext(f.selection, f.current, duplicate), /unique/);
  const wrongEquipment = structuredClone(f.selection);
  wrongEquipment.echoEquipment!.slots[0].sonataSetId = wrongEquipment.echoEquipment!.slots[0].sonataSetId === 'sonata-29'
    ? ECHO_CATALOG.find(e => e.id === wrongEquipment.echoEquipment!.slots[0].echoId)!.sonataSetIds.find(id => id !== 'sonata-29')!
    : wrongEquipment.echoEquipment!.slots[0].sonataSetId;
  assert.throws(() => assembleCharacterHitContext(wrongEquipment, f.current, events));
});

test('same-timestamp ordering, expiry, source drift and build isolation remain fail closed', () => {
  const f = fixture('S29_5PC_AERO'), events = f.events(f.current);
  const before = structuredClone(events);
  before.sonata.damages![0].sameTimestampOrder = 'BEFORE_TRIGGER';
  assert.equal(assembleCharacterHitContext({ ...f.selection, hitAtSeconds: 1 }, f.current, before)
    .eventContributions.find(c => c.sourceId === 'sonata:S29_5PC_AERO')!.value, 0);
  assert.ok(assembleCharacterHitContext({ ...f.selection, hitAtSeconds: 1 }, f.current, events)
    .eventContributions.find(c => c.sourceId === 'sonata:S29_5PC_AERO')!.value > 0);
  const effect = SONATA_EFFECT_MODELS.find(e => e.effectId === 'S29_5PC_AERO')!;
  assert.equal(assembleCharacterHitContext({ ...f.selection, hitAtSeconds: 1 + effect.durationSeconds! }, f.current, events)
    .eventContributions.find(c => c.sourceId === 'sonata:S29_5PC_AERO')!.active, false);
  const input = comparison(f);
  assert.throws(() => compareCharacterHitWithAssembledContext({
    ...input, candidate: { ...input.candidate, events },
  }), /per-build/);
  const saved = effect.statOrEffect;
  try {
    effect.statOrEffect = 'Echo Skill CRIT Rate';
    assert.throws(() => compareCharacterHitWithAssembledContext(input), /contract drift/);
  } finally {
    effect.statOrEffect = saved;
  }
});
