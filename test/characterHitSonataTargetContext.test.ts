import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { ECHO_CATALOG } from '../src/data/echoes.ts';
import { SONATA_EFFECT_MODELS } from '../src/data/sonataEffects.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import { assembleCharacterHitContext, compareCharacterHitWithAssembledContext, listSonataTargetHitContextSupport,
  type CharacterHitContextSelection, type RemainingHitContext } from '../src/combat/characterHitContext.ts';
import type { HitContextSonataEvents, ProvenHitSonataTarget } from '../src/combat/hitContextSonataEvents.ts';

function exactFivePieceEquipment(setId: string) {
  const targetCosts = [4, 3, 3, 1, 1];
  const used = new Set<string>();
  const species = targetCosts.map(cost => {
    const echo = ECHO_CATALOG.find(e => e.releaseStatus === 'RELEASED' && e.cost === cost
      && !used.has(e.id) && e.sonataSetIds.some(id => id === setId));
    assert.ok(echo, `missing canonical ${cost}-cost Echo for ${setId}`);
    used.add(echo.id);
    return echo;
  });
  return { species, slots: species.map(e => ({ echoId: e.id, sonataSetId: setId })) };
}

function targetProof(effectId: ProvenHitSonataTarget['effectId'], characterId: string, factId: string): ProvenHitSonataTarget {
  const support = listSonataTargetHitContextSupport().find(s => s.effectId === effectId)!;
  const base = {
    effectId, evidenceId: `synthetic-${effectId}-target-proof`,
    equipmentAtEventQualified: true as const, priorActivationState: 'NONE_ACTIVE' as const,
    noLaterActivationThroughHit: true as const, sameTimestampOrder: 'AFTER_TRIGGER' as const,
  };
  if (support.condition === 'ETERNAL_RADIANCE_STACKS') {
    return { ...base,
      event: { kind: 'ATTACK_ENEMY', actorId: characterId, targetId: 'enemy',
        sourceFactId: factId, atSeconds: 1, sourceTriggerQualification: 'VERIFIED_SOURCE_TRIGGER' },
      target: { kind: 'SPECTRO_FRAZZLE', targetId: 'enemy', observedAtSeconds: 1,
        observationOrder: 'BEFORE_TRIGGER', stacks: 10 } };
  }
  return { ...base,
    event: { kind: 'HIT_TARGET', actorId: characterId, targetId: 'enemy',
      sourceFactId: factId, atSeconds: 1, sourceTriggerQualification: 'VERIFIED_SOURCE_TRIGGER' },
    target: { kind: 'AERO_EROSION', targetId: 'enemy', observedAtSeconds: 1,
      observationOrder: 'BEFORE_TRIGGER', affected: true } };
}

function fixture(effectId: ProvenHitSonataTarget['effectId'], characterId?: string) {
  const support = listSonataTargetHitContextSupport().find(s => s.effectId === effectId)!;
  const preset = PROFILE_CATALOGS.presets.find(p => (!characterId || p.characterId === characterId)
    && PROFILE_CATALOGS.echoLoadouts.find(e => e.id === p.echoLoadoutProfileId)?.sonataSetIds.some(id => id === support.sonataSetId))!;
  assert.ok(preset);
  const character = CHARACTER_CATALOG.find(c => c.id === preset.characterId)!;
  assert.ok(character.element);
  const weaponProfile = PROFILE_CATALOGS.weaponRecommendations.find(w => w.id === preset.weaponRecommendationProfileId)!;
  const weaponId = weaponProfile.options.find(w => w.weaponId !== 'abyss-surges')?.weaponId;
  assert.ok(weaponId);
  const hit = listCharacterDirectHitSupport().find(h => h.characterId === preset.characterId)!;
  assert.ok(hit);
  const exact = exactFivePieceEquipment(support.sonataSetId);
  const current = exact.species.map((s, i) => createRank5EchoAtLevel0({
    id: `target-current-${effectId}-${i}`, cost: s.cost, primaryMainStat: 'ATK%',
  }));
  const candidate = structuredClone(current);
  candidate[0] = createRank5EchoAtLevel0({ id: `target-candidate-${effectId}`, cost: 4, primaryMainStat: 'CRIT Rate' });
  const selection: CharacterHitContextSelection = {
    hit: { characterId: preset.characterId, factId: hit.factId, componentIndex: 0,
      landedHitCount: 1, sequence: 0, maxSkills: true },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: `synthetic-target-${effectId}-hit`, hitAtSeconds: 2,
    characterLevel: 90, maxMinorFortes: true, weapon: { id: weaponId, level: 90, rank: 1 },
    echoEquipment: { evidenceId: 'canonical-five-piece-target-set', mainSlotIndex: 0, slots: exact.slots },
  };
  const events = (echoes: typeof current): { sonata: HitContextSonataEvents } => ({ sonata: {
    echoStatKey: projectRank5EchoStats(echoes).key, equipmentKey: JSON.stringify(selection.echoEquipment),
    eventContextId: selection.eventContextId, evidenceId: 'synthetic-per-build-target-event',
    casts: [], targets: [targetProof(effectId, preset.characterId, hit.factId)],
  } });
  return { support, preset, selection, current, candidate, events };
}

function proof(a: ReturnType<typeof assembleCharacterHitContext>): RemainingHitContext {
  return { status: 'QUALIFIED', assemblyKey: a.assemblyKey, evidenceId: 'synthetic-other-effects-inactive',
    requirements: a.requirements.map(id => ({ id, evidenceId: 'synthetic-scope-proof' })), buildDependentEffectsRecomputed: true,
    scalingPercent: 0, scalingFlat: 0, critRate: 0, critDamage: 0, damageBonus: 0, amplification: 0,
    defenseMultiplier: 0.5, resistanceMultiplier: 0.9, damageReduction: 0 };
}

function comparison(f: ReturnType<typeof fixture>) {
  const build = (echoes: typeof f.current) => {
    const events = f.events(echoes);
    return { echoes, events, remaining: proof(assembleCharacterHitContext(f.selection, echoes, events)) };
  };
  return { selection: f.selection, slotIndex: 0, current: build(f.current), candidate: build(f.candidate) };
}

test('all three reviewed target-window stats are exposed without copying canonical values', () => {
  const support = listSonataTargetHitContextSupport();
  assert.deepEqual(support.map(s => s.effectId), ['S11_5PC_SPECTRO', 'S17_5PC_CR', 'S17_5PC_AERO']);
  assert.ok(support.every(s => s.requiresExplicitPreAttackTargetState && !Object.hasOwn(s, 'value')));
});

test('target-qualified Sonata context composes only from exact per-build target/event proof', () => {
  for (const effectId of ['S11_5PC_SPECTRO', 'S17_5PC_CR', 'S17_5PC_AERO'] as const) {
    const f = fixture(effectId), events = f.events(f.current);
    const before = assembleCharacterHitContext(f.selection, f.current);
    assert.equal(before.pending.find(p => p.id === `sonata:${effectId}`)?.status, 'PENDING_EVENT');
    const after = assembleCharacterHitContext(f.selection, f.current, events);
    const contribution = after.eventContributions.find(c => c.sourceId === `sonata:${effectId}`)!;
    assert.equal(contribution.value, SONATA_EFFECT_MODELS.find(e => e.effectId === effectId)!.value);
    assert.equal(contribution.status, 'EVENT_QUALIFIED_ASSEMBLED');
    assert.ok(!after.requirements.includes(`sonata:${effectId}`));
    assert.equal(compareCharacterHitWithAssembledContext(comparison(f)).comparison.status, 'EVALUATED_HIT_COMPARISON');
  }
});

test('four existing preset Sonata target cohorts consume the bridge without becoming profile execution', () => {
  const reached = new Set<string>();
  for (const p of PROFILE_CATALOGS.presets) {
    const shell = PROFILE_CATALOGS.echoLoadouts.find(e => e.id === p.echoLoadoutProfileId)!;
    const support = listSonataTargetHitContextSupport().find(s => shell.sonataSetIds.some(id => id === s.sonataSetId));
    if (!support) continue;
    const f = fixture(support.effectId as ProvenHitSonataTarget['effectId'], p.characterId);
    const result = compareCharacterHitWithAssembledContext(comparison(f));
    assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
    assert.equal(result.currentAssembly.authorizesRotationDps, false);
    reached.add(p.characterId);
  }
  assert.deepEqual([...reached].sort(), ['cartethyia', 'jiyan', 'rover-aero', 'zani']);
});

test('target state, actor, source occurrence, equipment and isolated lifecycle all fail closed', () => {
  const f = fixture('S17_5PC_CR'), events = f.events(f.current);
  const patches = [
    { event: { ...events.sonata.targets![0].event, actorId: 'jiyan' } },
    { event: { ...events.sonata.targets![0].event, sourceTriggerQualification: 'UNKNOWN' } },
    { target: { ...events.sonata.targets![0].target, affected: false } },
    { target: { ...events.sonata.targets![0].target, targetId: 'other' } },
    { target: { ...events.sonata.targets![0].target, observationOrder: 'UNKNOWN' } },
    { equipmentAtEventQualified: false }, { priorActivationState: 'UNKNOWN' },
    { noLaterActivationThroughHit: false }, { sameTimestampOrder: 'UNKNOWN' },
  ];
  for (const patch of patches) {
    const bad = structuredClone(events);
    Object.assign(bad.sonata.targets![0], patch);
    assert.throws(() => assembleCharacterHitContext(f.selection, f.current, bad));
  }
  const duplicate = structuredClone(events);
  duplicate.sonata.targets = [events.sonata.targets![0], events.sonata.targets![0]];
  assert.throws(() => assembleCharacterHitContext(f.selection, f.current, duplicate), /unique/);
  const wrongEquipment = structuredClone(f.selection);
  const slot = wrongEquipment.echoEquipment!.slots.find(s => ECHO_CATALOG.find(e => e.id === s.echoId)!.sonataSetIds.length > 1)!;
  slot.sonataSetId = ECHO_CATALOG.find(e => e.id === slot.echoId)!.sonataSetIds.find(id => id !== f.support.sonataSetId)!;
  const fresh = structuredClone(events);
  fresh.sonata.equipmentKey = JSON.stringify(wrongEquipment.echoEquipment);
  assert.throws(() => assembleCharacterHitContext(wrongEquipment, f.current, fresh));
});

test('same-timestamp ordering, expiry and independent candidate evidence remain explicit', () => {
  const f = fixture('S11_5PC_SPECTRO'), events = f.events(f.current);
  const before = structuredClone(events);
  before.sonata.targets![0].sameTimestampOrder = 'BEFORE_TRIGGER';
  assert.equal(assembleCharacterHitContext({ ...f.selection, hitAtSeconds: 1 }, f.current, before)
    .eventContributions.find(c => c.sourceId === 'sonata:S11_5PC_SPECTRO')!.value, 0);
  assert.ok(assembleCharacterHitContext({ ...f.selection, hitAtSeconds: 1 }, f.current, events)
    .eventContributions.find(c => c.sourceId === 'sonata:S11_5PC_SPECTRO')!.value > 0);
  const effect = SONATA_EFFECT_MODELS.find(e => e.effectId === 'S11_5PC_SPECTRO')!;
  assert.equal(assembleCharacterHitContext({ ...f.selection, hitAtSeconds: 1 + effect.durationSeconds! }, f.current, events)
    .eventContributions.find(c => c.sourceId === 'sonata:S11_5PC_SPECTRO')!.active, false);
  const input = comparison(f);
  assert.throws(() => compareCharacterHitWithAssembledContext({
    ...input, candidate: { ...input.candidate, events },
  }), /per-build/);
});
