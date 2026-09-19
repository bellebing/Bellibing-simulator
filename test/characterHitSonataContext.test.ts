import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';
import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import { assembleCharacterHitContext, compareCharacterHitWithAssembledContext, listSonataCastHitContextSupport,
  type CharacterHitContextSelection, type RemainingHitContext } from '../src/combat/characterHitContext.ts';
import type { HitContextSonataEvents } from '../src/combat/hitContextSonataEvents.ts';

function fixture(effectId = 'S02_5PC_FUSION', characterId = 'changli', weaponId = 'blazing-brilliance') {
  const support = listSonataCastHitContextSupport().find(s => s.effectId === effectId)!;
  const species = ECHO_CATALOG.filter(e => e.sonataSetIds.some(id => id === support.sonataSetId))
    .sort((a, b) => a.cost - b.cost).slice(0, support.pieces);
  const filler = ECHO_CATALOG.filter(e => e.cost === 1 && !species.some(s => s.id === e.id)
    && !e.sonataSetIds.some(id => id === support.sonataSetId)).slice(0, 5 - species.length);
  const all = [...species, ...filler];
  assert.equal(all.length, 5);
  const current = all.map((s, i) => createRank5EchoAtLevel0({ id: `card-${i}`, cost: s.cost, primaryMainStat: 'ATK%' }));
  const candidate = structuredClone(current);
  candidate[0] = createRank5EchoAtLevel0({ id: 'candidate', cost: all[0].cost, primaryMainStat: 'HP%' });
  const hit = listCharacterDirectHitSupport().find(h => h.characterId === characterId)!;
  const selection: CharacterHitContextSelection = { hit: { characterId, factId: hit.factId, componentIndex: 0,
    landedHitCount: 1, sequence: 0, maxSkills: true }, damageElement: 'Fusion', eventContextId: 'synthetic-observed-hit',
    hitAtSeconds: 2, characterLevel: 90, maxMinorFortes: true, weapon: { id: weaponId, level: 90, rank: 1 },
    echoEquipment: { evidenceId: 'canonical-set-with-synthetic-cards', mainSlotIndex: 0,
      slots: all.map((s, i) => ({ echoId: s.id, sonataSetId: i < species.length ? support.sonataSetId : s.sonataSetIds[0] })) } };
  const events = (echoes: typeof current): { sonata: HitContextSonataEvents } => ({ sonata: {
    echoStatKey: projectRank5EchoStats(echoes).key, equipmentKey: JSON.stringify(selection.echoEquipment),
    eventContextId: selection.eventContextId, evidenceId: 'synthetic-per-build-event', casts: [{ effectId,
      event: { kind: support.triggerEvents[0], actorId: characterId, atSeconds: 1 }, evidenceId: 'synthetic-cast',
      sourceQualification: 'SOURCE_PROVEN_CAST', equipmentAtEventQualified: true, priorActivationState: 'NONE_ACTIVE',
      noLaterActivationThroughHit: true, sameTimestampOrder: 'AFTER_TRIGGER' }] } });
  return { selection, current, candidate, events };
}
function proof(a: ReturnType<typeof assembleCharacterHitContext>): RemainingHitContext {
  return { status: 'QUALIFIED', assemblyKey: a.assemblyKey, evidenceId: 'synthetic-other-effects-inactive',
    requirements: a.requirements.map(id => ({ id, evidenceId: 'synthetic-scope-proof' })), buildDependentEffectsRecomputed: true,
    scalingPercent: 0, scalingFlat: 0, critRate: 0, critDamage: 0, damageBonus: 0, amplification: 0,
    defenseMultiplier: 0.5, resistanceMultiplier: 0.9, damageReduction: 0 };
}
function comparison(f = fixture()) {
  const build = (echoes: typeof f.current) => { const events = f.events(echoes);
    return { echoes, events, remaining: proof(assembleCharacterHitContext(f.selection, echoes, events)) }; };
  return { selection: f.selection, slotIndex: 0, current: build(f.current), candidate: build(f.candidate) };
}

test('all six existing Sonata cast bindings feed exact hit context without new numeric facts', () => {
  const support = listSonataCastHitContextSupport(); assert.equal(support.length, 6);
  for (const s of support) {
    const f = fixture(s.effectId), e = f.events(f.current), a = assembleCharacterHitContext(f.selection, f.current, e);
    assert.equal(a.eventContributions[0].value, SONATA_EFFECT_MODELS.find(x => x.effectId === s.effectId)!.value);
    assert.ok(!a.requirements.includes(`sonata:${s.effectId}`));
    assert.equal(a.eventContributions[0].status, 'EVENT_QUALIFIED_ASSEMBLED');
    assert.equal(compareCharacterHitWithAssembledContext(comparison(f)).comparison.status, 'EVALUATED_HIT_COMPARISON');
    assert.ok(assembleCharacterHitContext(f.selection, f.current).pending.some(p => p.id === `sonata:${s.effectId}` && p.status === 'PENDING_EVENT'));
  }
});

test('six real preset set/weapon configurations consume qualified Sonata context without becoming profile execution', () => {
  const reached = new Set<string>();
  for (const p of PROFILE_CATALOGS.presets) {
    const shell = PROFILE_CATALOGS.echoLoadouts.find(s => s.id === p.echoLoadoutProfileId)!;
    const weapon = PROFILE_CATALOGS.weaponRecommendations.find(w => w.id === p.weaponRecommendationProfileId)!.options[0].weaponId;
    for (const s of listSonataCastHitContextSupport().filter(s => shell.sonataSetIds.some(id => id === s.sonataSetId))) {
      const result = compareCharacterHitWithAssembledContext(comparison(fixture(s.effectId, p.characterId, weapon)));
      assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
      assert.equal(result.currentAssembly.authorizesRotationDps, false);
      reached.add(p.characterId);
    }
  }
  assert.equal(reached.size, 6);
  assert.ok(reached.has('encore') && reached.has('changli') && reached.has('jinhsi'));
});

test('Sonata events require exact species/set/count evidence and reject wrong owner, trigger and lifecycle', () => {
  const f = fixture(), e = f.events(f.current);
  assert.throws(() => assembleCharacterHitContext({ ...f.selection, echoEquipment: undefined }, f.current, e), /explicit equipped/);
  for (const patch of [{ effectId: 'S04_5PC_AERO' }, { event: { ...e.sonata.casts[0].event, actorId: 'encore' } },
    { event: { ...e.sonata.casts[0].event, kind: 'INTRO_SKILL_CAST' } }, { priorActivationState: 'UNKNOWN' },
    { sourceQualification: 'UNKNOWN' }, { equipmentAtEventQualified: false }, { noLaterActivationThroughHit: false },
    { sameTimestampOrder: 'UNKNOWN' }]) {
    const bad = structuredClone(e); Object.assign(bad.sonata.casts[0], patch);
    assert.throws(() => assembleCharacterHitContext(f.selection, f.current, bad));
  }
  const duplicate = structuredClone(e); duplicate.sonata.casts = [...e.sonata.casts, e.sonata.casts[0]];
  assert.throws(() => assembleCharacterHitContext(f.selection, f.current, duplicate), /unique/);
  assert.throws(() => assembleCharacterHitContext({ ...f.selection, echoEquipment: { ...f.selection.echoEquipment!, mainSlotIndex: 1 } }, f.current, e), /per-build/);
  const missing = structuredClone(f.selection);
  const slot = missing.echoEquipment!.slots.find(s => ECHO_CATALOG.find(e => e.id === s.echoId)!.sonataSetIds.length > 1)!;
  slot.sonataSetId = ECHO_CATALOG.find(e => e.id === slot.echoId)!.sonataSetIds.find(id => id !== slot.sonataSetId)!;
  const fresh = { sonata: { ...e.sonata, equipmentKey: JSON.stringify(missing.echoEquipment) } };
  assert.throws(() => assembleCharacterHitContext(missing, f.current, fresh), /pieces/);
});

test('Sonata ordering, expiration, source drift and independent build evidence remain fail closed', () => {
  const f = fixture(), e = f.events(f.current), before = structuredClone(e);
  before.sonata.casts[0].sameTimestampOrder = 'BEFORE_TRIGGER';
  assert.equal(assembleCharacterHitContext({ ...f.selection, hitAtSeconds: 1 }, f.current, before).eventContributions[0].value, 0);
  assert.ok(assembleCharacterHitContext({ ...f.selection, hitAtSeconds: 1 }, f.current, e).eventContributions[0].value > 0);
  const effect = SONATA_EFFECT_MODELS.find(s => s.effectId === e.sonata.casts[0].effectId)!;
  assert.equal(assembleCharacterHitContext({ ...f.selection, hitAtSeconds: 1 + effect.durationSeconds! }, f.current, e).eventContributions[0].active, false);
  const input = comparison(f);
  assert.throws(() => compareCharacterHitWithAssembledContext({ ...input, candidate: { ...input.candidate, events: e } }), /per-build/);
  const saved = effect.trigger;
  try { effect.trigger = 'Unreviewed new trigger'; assert.throws(() => compareCharacterHitWithAssembledContext(input), /drift/); }
  finally { effect.trigger = saved; }
  const pristine = structuredClone(input), output = compareCharacterHitWithAssembledContext(input);
  assert.deepEqual(input, pristine);
  output.currentAssembly.eventContributions[0].window.value = 999;
  assert.notEqual(compareCharacterHitWithAssembledContext(input).currentAssembly.eventContributions[0].value, 999);
});
