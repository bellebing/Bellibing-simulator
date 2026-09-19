import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import { assembleCharacterHitContext, compareCharacterHitWithAssembledContext, listWeaponCastHitContextSupport,
  type CharacterHitContextSelection, type CharacterHitContextEvents, type RemainingHitContext } from '../src/combat/characterHitContext.ts';
import type { HitContextWeaponEvents } from '../src/combat/hitContextWeaponEvents.ts';

function fixture(effectId = 'TFD-HEAVY', characterId = 'augusta') {
  const effect = WEAPON_EFFECT_CATALOG.find(e => e.effectId === effectId)!;
  const support = listWeaponCastHitContextSupport().find(e => e.effectId === effectId)!;
  const hit = listCharacterDirectHitSupport().find(h => h.characterId === characterId)!;
  const selection: CharacterHitContextSelection = { hit: { characterId, factId: hit.factId, sequence: 0, maxSkills: true,
    componentIndex: 0, landedHitCount: 1 }, characterLevel: 90, maxMinorFortes: true,
    weapon: { id: effect.weaponId, level: 90, rank: 1 }, damageElement: 'Electro', eventContextId: 'observed-hit', hitAtSeconds: 2 };
  const current = [4, 3, 3, 1, 1].map((cost, i) => createRank5EchoAtLevel0({ id: `current-${i}`, cost: cost as 1 | 3 | 4, primaryMainStat: 'ATK%' }));
  const candidate = structuredClone(current);
  candidate[0] = createRank5EchoAtLevel0({ id: 'replacement', cost: 4, primaryMainStat: 'CRIT Rate' });
  const events = (cards: typeof current): CharacterHitContextEvents & { weapon: HitContextWeaponEvents } => ({ weapon: { echoStatKey: projectRank5EchoStats(cards).key, weapon: { ...selection.weapon },
    eventContextId: selection.eventContextId, evidenceId: 'synthetic-per-build-event-proof', casts: [{ effectId,
      evidenceId: 'synthetic-single-cast', event: { kind: support.triggerEvents[0], actorId: characterId, atSeconds: 1 },
      sourceQualification: 'SOURCE_PROVEN_CAST', equipmentAtEventQualified: true, priorActivationState: 'NONE_ACTIVE',
      noLaterActivationThroughHit: true, sameTimestampOrder: 'AFTER_TRIGGER' }] } });
  return { selection, current, candidate, events };
}
function proof(a: ReturnType<typeof assembleCharacterHitContext>): RemainingHitContext {
  return { status: 'QUALIFIED', assemblyKey: a.assemblyKey, evidenceId: 'synthetic-rest-inactive',
    requirements: a.requirements.map(id => ({ id, evidenceId: 'synthetic-explicit-scope-proof' })), buildDependentEffectsRecomputed: true,
    scalingPercent: 0, scalingFlat: 0, critRate: 0, critDamage: 0, damageBonus: 0, amplification: 0,
    defenseMultiplier: 0.5, resistanceMultiplier: 0.9, damageReduction: 0 };
}

test('33 existing cast-window stat bindings compose through the current Character comparison boundary', () => {
  const support = listWeaponCastHitContextSupport();
  assert.equal(support.length, 33);
  for (const s of support) {
    const weapon = WEAPON_CATALOG.find(w => w.id === s.weaponId)!;
    const character = CHARACTER_CATALOG.find(c => c.weaponType === weapon.weaponType
      && listCharacterDirectHitSupport().some(h => h.characterId === c.id))!;
    const f = fixture(s.effectId, character.id);
    const side = (echoes: typeof f.current) => { const events = f.events(echoes);
      return { echoes, events, remaining: proof(assembleCharacterHitContext(f.selection, echoes, events)) }; };
    const result = compareCharacterHitWithAssembledContext({ selection: f.selection, slotIndex: 0, current: side(f.current), candidate: side(f.candidate) });
    assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
    assert.ok(!result.currentAssembly.requirements.includes(`weapon:${s.effectId}`));
    assert.equal(result.currentAssembly.eventContributions[0].value, WEAPON_EFFECT_CATALOG.find(e => e.effectId === s.effectId)!.rankValues[0]);
    assert.equal(result.currentAssembly.eventContributions[0].status, 'EVENT_QUALIFIED_ASSEMBLED');
  }
});

test('missing events remain pending and cast/query ordering never grants the triggering hit automatic uptime', () => {
  const f = fixture(), e = f.events(f.current), base = assembleCharacterHitContext(f.selection, f.current);
  assert.ok(base.pending.some(p => p.id === 'weapon:TFD-HEAVY' && p.status === 'PENDING_EVENT'));
  const selection = { ...f.selection, hitAtSeconds: 1 };
  const before = structuredClone(e); before.weapon.casts[0].sameTimestampOrder = 'BEFORE_TRIGGER';
  assert.equal(assembleCharacterHitContext(selection, f.current, before).eventContributions[0].value, 0);
  assert.ok(assembleCharacterHitContext(selection, f.current, e).eventContributions[0].value > 0);
  const duration = WEAPON_EFFECT_CATALOG.find(x => x.effectId === 'TFD-HEAVY')!.durationSeconds!;
  assert.equal(assembleCharacterHitContext({ ...selection, hitAtSeconds: 1 + duration }, f.current, e).eventContributions[0].active, false);
  assert.throws(() => assembleCharacterHitContext({ ...selection, hitAtSeconds: 0 }, f.current, e), /ordering/);
});

test('eleven existing preset weapon cohorts support a qualified isolated-hit delta at each exact rank', () => {
  const reached = new Set<string>();
  for (const preset of PROFILE_CATALOGS.presets) {
    const weapons = PROFILE_CATALOGS.weaponRecommendations.find(w => w.id === preset.weaponRecommendationProfileId)!;
    const effects = listWeaponCastHitContextSupport().filter(e => weapons.options.some(w => w.weaponId === e.weaponId));
    for (const effect of effects) for (let rank = 1; rank <= 5; rank++) {
      // Canonical configuration plus explicit synthetic events/residuals tests the
      // consumer boundary; it does not supply this preset's missing timeline.
      const f = fixture(effect.effectId, preset.characterId);
      f.selection.weapon = { ...f.selection.weapon, rank };
      const build = (echoes: typeof f.current) => { const events = f.events(echoes);
        return { echoes, events, remaining: proof(assembleCharacterHitContext(f.selection, echoes, events)) }; };
      const result = compareCharacterHitWithAssembledContext({ selection: f.selection, slotIndex: 0,
        current: build(f.current), candidate: build(f.candidate) });
      assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
      assert.equal(result.currentAssembly.eventContributions[0].value,
        WEAPON_EFFECT_CATALOG.find(e => e.effectId === effect.effectId)!.rankValues[rank - 1]);
      assert.equal(result.currentAssembly.authorizesRotationDps, false);
      reached.add(preset.characterId);
    }
  }
  assert.equal(reached.size, 11);
  assert.ok(reached.has('jinhsi') && reached.has('chixia') && reached.has('rebecca'));
});

test('wrong event/owner/weapon/source qualification, duplicates and unknown lifecycle are rejected', () => {
  const f = fixture(), e = f.events(f.current);
  const patches = [{ event: { ...e.weapon.casts[0].event, kind: 'HEAL_APPLIED' } },
    { event: { ...e.weapon.casts[0].event, actorId: 'jiyan' } }, { effectId: 'AH-INTRO' },
    { sourceQualification: 'ASSUMED' }, { priorActivationState: 'UNKNOWN' },
    { noLaterActivationThroughHit: false }, { sameTimestampOrder: undefined }, { equipmentAtEventQualified: false }];
  for (const patch of patches) {
    const bad = structuredClone(e); Object.assign(bad.weapon.casts[0], patch);
    assert.throws(() => assembleCharacterHitContext(f.selection, f.current, bad));
  }
  const duplicate = { ...e, weapon: { ...e.weapon, casts: [...e.weapon.casts, e.weapon.casts[0]] } };
  assert.throws(() => assembleCharacterHitContext(f.selection, f.current, duplicate), /unique/);
  assert.throws(() => assembleCharacterHitContext({ ...f.selection, hitAtSeconds: undefined }, f.current, e), /query time/);
  assert.throws(() => assembleCharacterHitContext({ ...f.selection, weapon: { ...f.selection.weapon, rank: 2 } }, f.current, e), /per-build/);
});

test('event proofs are isolated per build and source changes invalidate remaining context evidence', () => {
  const f = fixture(), ce = f.events(f.current), ne = f.events(f.candidate);
  const ca = assembleCharacterHitContext(f.selection, f.current, ce), na = assembleCharacterHitContext(f.selection, f.candidate, ne);
  const input = { selection: f.selection, slotIndex: 0,
    current: { echoes: f.current, events: ce, remaining: proof(ca) }, candidate: { echoes: f.candidate, events: ne, remaining: proof(na) } };
  assert.throws(() => compareCharacterHitWithAssembledContext({ ...input, candidate: { ...input.candidate, events: ce } }), /per-build/);
  const effect = WEAPON_EFFECT_CATALOG.find(e => e.effectId === 'TFD-HEAVY')!, previous = effect.rankValues;
  try {
    effect.rankValues = previous.map(x => x + 0.01) as unknown as typeof previous;
    assert.throws(() => compareCharacterHitWithAssembledContext(input), /fresh per-build/);
  } finally { effect.rankValues = previous; }
  const before = structuredClone(input), result = compareCharacterHitWithAssembledContext(input);
  assert.deepEqual(input, before);
  result.currentAssembly.eventContributions[0].window.value = 999;
  assert.notEqual(compareCharacterHitWithAssembledContext(input).currentAssembly.eventContributions[0].window.value, 999);
});
