import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import { listWeaponHealingWindowSupport } from '../src/combat/weaponHealingWindowAdapter.ts';
import { assembleCharacterHitContext, compareCharacterHitWithAssembledContext,
  type CharacterHitContextSelection, type CharacterHitContextEvents, type RemainingHitContext } from '../src/combat/characterHitContext.ts';
import type { HitContextWeaponEvents } from '../src/combat/hitContextWeaponEvents.ts';
import type { HitContextSonataEvents } from '../src/combat/hitContextSonataEvents.ts';

const card = (id: string, cost: 1 | 3 | 4, stat: 'ATK%' | 'CRIT Rate' = 'ATK%') =>
  createRank5EchoAtLevel0({ id, cost, primaryMainStat: stat });

function fixture(characterId: string, weaponId: string) {
  const hit = listCharacterDirectHitSupport().find(h => h.characterId === characterId)!;
  const selection: CharacterHitContextSelection = { hit: { characterId, factId: hit.factId, sequence: 0, maxSkills: true,
    componentIndex: 0, landedHitCount: 1 }, characterLevel: 90, maxMinorFortes: true,
    weapon: { id: weaponId, level: 90, rank: 1 }, damageElement: 'Aero', eventContextId: 'observed-heal-hit', hitAtSeconds: 2 };
  const current = [4, 3, 3, 1, 1].map((cost, i) => card(`current-${i}`, cost as 1 | 3 | 4));
  const candidate = structuredClone(current);
  candidate[0] = card('replacement', 4, 'CRIT Rate');
  return { selection, current, candidate };
}
function proof(a: ReturnType<typeof assembleCharacterHitContext>): RemainingHitContext {
  return { status: 'QUALIFIED', assemblyKey: a.assemblyKey, evidenceId: 'synthetic-explicit-residual-proof',
    requirements: a.requirements.map(id => ({ id, evidenceId: `synthetic:${id}` })), buildDependentEffectsRecomputed: true,
    scalingPercent: 0, scalingFlat: 0, critRate: 0, critDamage: 0, damageBonus: 0, amplification: 0,
    defenseMultiplier: 0.5, resistanceMultiplier: 0.9, damageReduction: 0 };
}
function weaponHealingFixture(effectId: string) {
  const support = listWeaponHealingWindowSupport().find(s => s.effectId === effectId)!;
  const weapon = WEAPON_CATALOG.find(w => w.id === support.weaponId)!;
  const character = CHARACTER_CATALOG.find(c => c.weaponType === weapon.weaponType
    && listCharacterDirectHitSupport().some(h => h.characterId === c.id))!;
  const f = fixture(character.id, weapon.id);
  const events = (cards: typeof f.current): CharacterHitContextEvents & { weapon: HitContextWeaponEvents } => ({ weapon: {
    echoStatKey: projectRank5EchoStats(cards).key, weapon: { id: weapon.id, rank: 1 }, eventContextId: f.selection.eventContextId,
    evidenceId: 'synthetic-heal-context', casts: [], heals: [{ effectId, evidenceId: 'synthetic-applied-heal',
      event: { kind: 'HEAL_APPLIED', healerId: character.id, targetId: 'explicit-ally', atSeconds: 1,
        sourceTriggerQualification: 'VERIFIED_HEAL_ALLY' }, teamMemberIds: [character.id, 'explicit-ally'],
      sourceQualification: 'SOURCE_PROVEN_HEAL', equipmentAtEventQualified: true, priorActivationState: 'NONE_ACTIVE',
      noLaterActivationThroughHit: true, sameTimestampOrder: 'AFTER_TRIGGER' }] } });
  return { ...f, effectId, characterId: character.id, events };
}
function rejuvenatingFixture() {
  const characterId = 'ciaccona', weaponId = 'woodland-aria', f = fixture(characterId, weaponId);
  const species = ECHO_CATALOG.filter(e => e.sonataSetIds.includes('sonata-7')).sort((a, b) => a.cost - b.cost).slice(0, 5);
  assert.equal(species.length, 5);
  f.current = species.map((s, i) => card(`rejuv-${i}`, s.cost));
  f.candidate = structuredClone(f.current);
  f.candidate[0] = card('rejuv-replacement', species[0].cost, 'CRIT Rate');
  f.selection.echoEquipment = { evidenceId: 'synthetic-explicit-rejuvenating-equipment', mainSlotIndex: 0,
    slots: species.map(s => ({ echoId: s.id, sonataSetId: 'sonata-7' })) };
  const events = (cards: typeof f.current): CharacterHitContextEvents & { sonata: HitContextSonataEvents } => ({ sonata: {
    echoStatKey: projectRank5EchoStats(cards).key, equipmentKey: JSON.stringify(f.selection.echoEquipment),
    eventContextId: f.selection.eventContextId, evidenceId: 'synthetic-rejuvenating-context', casts: [], heals: [{
      effectId: 'REJUV_ATK', evidenceId: 'synthetic-rejuvenating-applied-heal',
      event: { kind: 'HEAL_APPLIED', healerId: characterId, targetId: 'explicit-ally', atSeconds: 1,
        sourceTriggerQualification: 'VERIFIED_HEAL_ALLY' }, teamMemberIds: [characterId, 'explicit-ally'],
      sourceQualification: 'SOURCE_PROVEN_HEAL', equipmentAtEventQualified: true, priorActivationState: 'NONE_ACTIVE',
      noLaterActivationThroughHit: true, sameTimestampOrder: 'AFTER_TRIGGER' }] } });
  return { ...f, events };
}

test('both reviewed weapon healing windows compose only from an exact applied-heal proof', () => {
  const support = listWeaponHealingWindowSupport();
  assert.deepEqual(support.map(s => s.effectId), ['BPP-SKILL', 'SC-TEAM-CD']);
  for (const s of support) {
    const f = weaponHealingFixture(s.effectId), events = f.events(f.current);
    const before = assembleCharacterHitContext(f.selection, f.current);
    assert.ok(before.requirements.includes(`weapon:${s.effectId}`));
    const after = assembleCharacterHitContext(f.selection, f.current, events);
    const contribution = after.eventContributions.find(c => c.sourceId === `weapon:${s.effectId}`)!;
    assert.ok(contribution.value > 0);
    assert.equal(contribution.status, 'EVENT_QUALIFIED_ASSEMBLED');
    assert.ok(!after.requirements.includes(`weapon:${s.effectId}`));
    const candidateEvents = f.events(f.candidate), result = compareCharacterHitWithAssembledContext({ selection: f.selection, slotIndex: 0,
      current: { echoes: f.current, events, remaining: proof(after) }, candidate: { echoes: f.candidate, events: candidateEvents,
        remaining: proof(assembleCharacterHitContext(f.selection, f.candidate, candidateEvents)) } });
    assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
  }
});

test('weapon heal/query ordering, team membership and source qualification fail closed', () => {
  const f = weaponHealingFixture('BPP-SKILL'), events = f.events(f.current), heal = events.weapon.heals![0];
  const atTrigger = { ...f.selection, hitAtSeconds: 1 };
  const before = structuredClone(events); before.weapon.heals![0].sameTimestampOrder = 'BEFORE_TRIGGER';
  assert.equal(assembleCharacterHitContext(atTrigger, f.current, before).eventContributions[0].value, 0);
  assert.ok(assembleCharacterHitContext(atTrigger, f.current, events).eventContributions[0].value > 0);
  for (const patch of [{ sourceQualification: 'ASSUMED' }, { equipmentAtEventQualified: false },
    { priorActivationState: 'UNKNOWN' }, { noLaterActivationThroughHit: false }, { sameTimestampOrder: undefined },
    { teamMemberIds: ['someone-else'] }, { event: { ...heal.event, healerId: 'someone-else' } },
    { event: { ...heal.event, sourceTriggerQualification: 'UNKNOWN' } }]) {
    const bad = structuredClone(events); Object.assign(bad.weapon.heals![0], patch);
    assert.throws(() => assembleCharacterHitContext(f.selection, f.current, bad));
  }
  const duplicate = structuredClone(events); duplicate.weapon.casts = [{ ...heal, sourceQualification: 'SOURCE_PROVEN_CAST',
    event: { kind: 'RESONANCE_SKILL_CAST', actorId: f.characterId, atSeconds: 1 } } as never];
  assert.throws(() => assembleCharacterHitContext(f.selection, f.current, duplicate), /unique/);
});

test('Rejuvenating Glow team ATK composes only from exact five-piece equipment and qualified ally healing', () => {
  const f = rejuvenatingFixture(), events = f.events(f.current);
  const effect = SONATA_EFFECT_MODELS.find(e => e.effectId === 'REJUV_ATK')!;
  const before = assembleCharacterHitContext(f.selection, f.current);
  assert.ok(before.requirements.includes('sonata:REJUV_ATK'));
  const after = assembleCharacterHitContext(f.selection, f.current, events);
  const contribution = after.eventContributions.find(c => c.sourceId === 'sonata:REJUV_ATK')!;
  assert.equal(contribution.value, effect.value);
  assert.equal(contribution.stat, 'ATK%');
  assert.ok(!after.requirements.includes('sonata:REJUV_ATK'));
  const sameTime = { ...f.selection, hitAtSeconds: 1 }, prior = structuredClone(events);
  prior.sonata.heals![0].sameTimestampOrder = 'BEFORE_TRIGGER';
  assert.equal(assembleCharacterHitContext(sameTime, f.current, prior).eventContributions[0].value, 0);
  const candidateEvents = f.events(f.candidate);
  assert.equal(compareCharacterHitWithAssembledContext({ selection: f.selection, slotIndex: 0,
    current: { echoes: f.current, events, remaining: proof(after) }, candidate: { echoes: f.candidate, events: candidateEvents,
      remaining: proof(assembleCharacterHitContext(f.selection, f.candidate, candidateEvents)) } }).comparison.status,
  'EVALUATED_HIT_COMPARISON');
});

test('Rejuvenating Glow rejects wrong owner/team/equipment/source and per-build evidence reuse', () => {
  const f = rejuvenatingFixture(), events = f.events(f.current), heal = events.sonata.heals![0];
  for (const patch of [{ sourceQualification: 'ASSUMED' }, { equipmentAtEventQualified: false },
    { priorActivationState: 'UNKNOWN' }, { noLaterActivationThroughHit: false }, { sameTimestampOrder: undefined },
    { teamMemberIds: ['someone-else'] }, { event: { ...heal.event, healerId: 'someone-else' } },
    { event: { ...heal.event, sourceTriggerQualification: 'UNKNOWN' } }]) {
    const bad = structuredClone(events); Object.assign(bad.sonata.heals![0], patch);
    assert.throws(() => assembleCharacterHitContext(f.selection, f.current, bad));
  }
  const wrongSet = structuredClone(f.selection);
  wrongSet.echoEquipment!.slots[0].sonataSetId = 'sonata-1';
  assert.throws(() => assembleCharacterHitContext(wrongSet, f.current, events));
  const candidateEvents = f.events(f.candidate);
  assert.throws(() => assembleCharacterHitContext(f.selection, f.candidate, events), /per-build/);
  assert.doesNotThrow(() => assembleCharacterHitContext(f.selection, f.candidate, candidateEvents));
});

test('healing source drift invalidates the reviewed bridge rather than silently reusing stale context', () => {
  const f = weaponHealingFixture('SC-TEAM-CD'), events = f.events(f.current);
  const effect = WEAPON_EFFECT_CATALOG.find(e => e.effectId === 'SC-TEAM-CD')!, old = effect.trigger;
  try {
    effect.trigger = 'Cast Echo Skill';
    assert.throws(() => assembleCharacterHitContext(f.selection, f.current, events), /contract drift/);
  } finally { effect.trigger = old; }
});
