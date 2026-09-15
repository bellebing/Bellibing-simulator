import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import { assembleCharacterHitContext, compareCharacterHitWithAssembledContext, listWeaponDamageHitContextSupport,
  type CharacterHitContextSelection, type RemainingHitContext } from '../src/combat/characterHitContext.ts';
import type { HitContextWeaponEvents } from '../src/combat/hitContextWeaponEvents.ts';

function fixture(effectId = 'LE-SKILL', characterId = 'phrolova', rank = 1) {
  const support = listWeaponDamageHitContextSupport().find(s => s.effectId === effectId)!;
  const hit = listCharacterDirectHitSupport().find(h => h.characterId === characterId)!;
  const selection: CharacterHitContextSelection = { hit: { characterId, factId: hit.factId, sequence: 0, maxSkills: true,
    componentIndex: 0, landedHitCount: 1 }, characterLevel: 90, maxMinorFortes: true,
    weapon: { id: support.weaponId, level: 90, rank }, damageElement: 'Havoc', eventContextId: 'synthetic-selected-hit', hitAtSeconds: 2 };
  const current = [4, 3, 3, 1, 1].map((cost, i) => createRank5EchoAtLevel0({ id: `current-${i}`, cost: cost as 1 | 3 | 4, primaryMainStat: 'ATK%' }));
  const candidate = structuredClone(current);
  candidate[0] = createRank5EchoAtLevel0({ id: 'replacement', cost: 4, primaryMainStat: 'CRIT Rate' });
  const events = (cards: typeof current): { weapon: HitContextWeaponEvents } => ({ weapon: {
    weapon: { ...selection.weapon }, echoStatKey: projectRank5EchoStats(cards).key, eventContextId: selection.eventContextId,
    evidenceId: 'synthetic-independent-build', casts: [], damages: [{ effectId, evidenceId: 'synthetic-landed-damage',
      event: { kind: 'DAMAGE_DEALT', damageClass: support.damageClass, actorId: characterId, atSeconds: 1,
        sourceTriggerQualification: 'VERIFIED_DAMAGE_DEALT' }, equipmentAtEventQualified: true,
      priorActivationState: 'NONE_ACTIVE', noLaterActivationThroughHit: true, sameTimestampOrder: 'AFTER_TRIGGER' }] } });
  return { selection, current, candidate, events };
}
function proof(a: ReturnType<typeof assembleCharacterHitContext>): RemainingHitContext {
  return { status: 'QUALIFIED', assemblyKey: a.assemblyKey, evidenceId: 'synthetic-qualified-rest',
    requirements: a.requirements.map(id => ({ id, evidenceId: 'synthetic-explicit-scope' })), buildDependentEffectsRecomputed: true,
    scalingPercent: 0, scalingFlat: 0, critRate: 0, critDamage: 0, damageBonus: 0, amplification: 0,
    defenseMultiplier: 0.5, resistanceMultiplier: 0.9, damageReduction: 0 };
}
function comparison(f = fixture()) {
  const side = (echoes: typeof f.current) => { const events = f.events(echoes);
    return { echoes, events, remaining: proof(assembleCharacterHitContext(f.selection, echoes, events)) }; };
  return { selection: f.selection, slotIndex: 0, current: side(f.current), candidate: side(f.candidate) };
}

test('damage stat context reaches Phrolova and Luuk Herssen existing weapon cohorts at all ranks', () => {
  const reached = new Set<string>();
  assert.equal(listWeaponDamageHitContextSupport().length, 3);
  for (const p of PROFILE_CATALOGS.presets) {
    const weapons = PROFILE_CATALOGS.weaponRecommendations.find(w => w.id === p.weaponRecommendationProfileId)!;
    for (const s of listWeaponDamageHitContextSupport().filter(s => weapons.options.some(w => w.weaponId === s.weaponId))) {
      for (let rank = 1; rank <= 5; rank++) {
        const result = compareCharacterHitWithAssembledContext(comparison(fixture(s.effectId, p.characterId, rank)));
        assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
        assert.equal(result.currentAssembly.eventContributions[0].value,
          WEAPON_EFFECT_CATALOG.find(e => e.effectId === s.effectId)!.rankValues[rank - 1]);
        assert.ok(!result.currentAssembly.requirements.includes(`weapon:${s.effectId}`));
        reached.add(p.characterId);
      }
    }
  }
  assert.deepEqual([...reached].sort(), ['luuk-herssen', 'phrolova']);
});

test('casts, wrong damage classes/actors and unknown state cannot activate damage context', () => {
  const f = fixture(), e = f.events(f.current), damage = e.weapon.damages![0];
  assert.ok(assembleCharacterHitContext(f.selection, f.current).pending.some(p => p.id === 'weapon:LE-SKILL' && p.status === 'PENDING_EVENT'));
  for (const patch of [{ event: { ...damage.event, kind: 'ECHO_SKILL_CAST' } },
    { event: { ...damage.event, damageClass: 'BASIC' } }, { event: { ...damage.event, actorId: 'cantarella' } },
    { event: { ...damage.event, sourceTriggerQualification: 'UNKNOWN' } }, { priorActivationState: 'UNKNOWN' },
    { equipmentAtEventQualified: false }, { noLaterActivationThroughHit: false }, { sameTimestampOrder: 'UNKNOWN' },
    { effectId: 'LE-DEF' }, { effectId: 'LE-ECHO' }]) {
    const bad = structuredClone(e); Object.assign(bad.weapon.damages![0], patch);
    assert.throws(() => assembleCharacterHitContext(f.selection, f.current, bad));
  }
  const duplicate = structuredClone(e); duplicate.weapon.damages = [damage, damage];
  assert.throws(() => assembleCharacterHitContext(f.selection, f.current, duplicate), /unique/);
  const a = assembleCharacterHitContext(f.selection, f.current, e);
  assert.ok(a.requirements.includes('weapon:LE-DEF') && a.requirements.includes('weapon:LE-ECHO'));
});

test('damage context orders the triggering hit explicitly and independently queries both builds', () => {
  const f = fixture(), e = f.events(f.current), before = structuredClone(e);
  before.weapon.damages![0].sameTimestampOrder = 'BEFORE_TRIGGER';
  assert.equal(assembleCharacterHitContext({ ...f.selection, hitAtSeconds: 1 }, f.current, before).eventContributions[0].value, 0);
  assert.ok(assembleCharacterHitContext({ ...f.selection, hitAtSeconds: 1 }, f.current, e).eventContributions[0].value > 0);
  const duration = WEAPON_EFFECT_CATALOG.find(w => w.effectId === 'LE-SKILL')!.durationSeconds!;
  assert.equal(assembleCharacterHitContext({ ...f.selection, hitAtSeconds: 1 + duration }, f.current, e).eventContributions[0].active, false);
  const input = comparison(f);
  assert.throws(() => compareCharacterHitWithAssembledContext({ ...input, candidate: { ...input.candidate, events: e } }), /per-build/);
  const effect = WEAPON_EFFECT_CATALOG.find(w => w.effectId === 'LE-SKILL')!, original = effect.trigger;
  try { effect.trigger = 'Cast Echo Skill'; assert.throws(() => compareCharacterHitWithAssembledContext(input), /drift/); }
  finally { effect.trigger = original; }
  const pristine = structuredClone(input), output = compareCharacterHitWithAssembledContext(input);
  assert.deepEqual(input, pristine);
  output.currentAssembly.eventContributions[0].window.value = 999;
  assert.notEqual(compareCharacterHitWithAssembledContext(input).currentAssembly.eventContributions[0].value, 999);
  assert.equal(output.currentAssembly.authorizesRotationDps, false);
});
