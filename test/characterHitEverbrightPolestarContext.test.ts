import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import { defenseMultiplier } from '../src/combat/damageKernel.ts';
import {
  listEverbrightPolestarStatusWindowSupport,
  validateEverbrightPolestarStatusWindowContract,
} from '../src/combat/everbrightPolestarStatusWindowAdapter.ts';
import {
  assembleCharacterHitContext,
  compareCharacterHitWithAssembledContext,
  listEverbrightPolestarDefenseHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type {
  HitContextWeaponEvents,
  ProvenHitEverbrightPolestarApplication,
} from '../src/combat/hitContextWeaponEvents.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `everbright-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'everbright-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(damageClass: 'LIBERATION' | 'BASIC', hitAtSeconds = 2): CharacterHitContextSelection {
  const character = CHARACTER_CATALOG.find(row => row.id === 'aemeath')!;
  const hit = listCharacterDirectHitSupport().find(row =>
    row.characterId === 'aemeath' && row.sourceDamageClass === damageClass)!;
  assert.ok(character?.element && hit, `missing Aemeath ${damageClass} direct hit`);
  return {
    hit: { characterId: 'aemeath', factId: hit.factId, componentIndex: 0, landedHitCount: 1,
      sequence: 0, maxSkills: true },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: `everbright-${damageClass.toLowerCase()}-hit`,
    targetId: 'enemy',
    hitAtSeconds,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: 'everbright-polestar', level: 90, rank: 1 },
  };
}

function application(
  kind: 'FUSION_BURST_APPLIED' | 'TUNE_RUPTURE_SHIFTING_APPLIED' = 'TUNE_RUPTURE_SHIFTING_APPLIED',
  patch: Partial<ProvenHitEverbrightPolestarApplication> = {},
): ProvenHitEverbrightPolestarApplication {
  return {
    effectId: 'EP-LIB-DEF',
    evidenceId: 'synthetic-everbright-status-application',
    event: {
      kind,
      actorId: 'aemeath',
      targetId: 'enemy',
      sourceFactId: 'caller-qualified-aemeath-negative-status-application',
      atSeconds: 1,
      sourceTriggerQualification: 'VERIFIED_EVERBRIGHT_POLESTAR_STATUS_APPLICATION',
    },
    equipmentAtEventQualified: true,
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
    ...patch,
  };
}

function events(
  equippedCards: ReturnType<typeof cards>,
  eventContextId: string,
  row: ProvenHitEverbrightPolestarApplication = application(),
): HitContextWeaponEvents {
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    weapon: { id: 'everbright-polestar', rank: 1 },
    eventContextId,
    evidenceId: 'synthetic-everbright-hit-context',
    casts: [],
    everbrightPolestarApplications: [row],
  };
}

const ENEMY_DEF = 1000;
const BASE_DEFENSE = defenseMultiplier({ attackerLevel: 90, enemyDefense: ENEMY_DEF });

function remaining(a: ReturnType<typeof assembleCharacterHitContext>): RemainingHitContext {
  const activeDefense = a.defenseContributions.some(row => row.active);
  return {
    status: 'QUALIFIED',
    assemblyKey: a.assemblyKey,
    evidenceId: 'synthetic-everbright-remaining-context',
    requirements: a.requirements.map(id => ({ id, evidenceId: `synthetic-proof:${id}` })),
    buildDependentEffectsRecomputed: true,
    scalingPercent: 0,
    scalingFlat: 0,
    critRate: 0,
    critDamage: 0,
    damageBonus: 0,
    amplification: 0,
    defenseMultiplier: BASE_DEFENSE,
    ...(activeDefense ? { defenseContext: {
      evidenceId: 'synthetic-enemy-defense-proof',
      enemyDefense: ENEMY_DEF,
      otherDefenseModifiersAbsent: true as const,
    } } : {}),
    resistanceMultiplier: 0.9,
    damageReduction: 0,
  };
}

test('Everbright support exposes only Liberation DEF Ignore; sibling RES Ignore remains outside arithmetic', () => {
  assert.deepEqual(validateEverbrightPolestarStatusWindowContract(), []);
  const primitive = listEverbrightPolestarStatusWindowSupport();
  const support = listEverbrightPolestarDefenseHitContextSupport();
  assert.deepEqual(primitive.map(row => row.effectId), ['EP-LIB-DEF']);
  assert.deepEqual(support.map(row => row.effectId), ['EP-LIB-DEF']);
  assert.equal(support[0].statOrEffect, 'Resonance Liberation DMG DEF Ignore');
  assert.deepEqual(support[0].defenseScope, { kind: 'DAMAGE_CLASS', damageClass: 'LIBERATION' });
  assert.equal(support[0].siblingEffectOutsideThisPrimitive, 'EP-LIB-FUSION-RES');
  assert.equal(support[0].siblingReason, 'RES_IGNORE_ARITHMETIC_NOT_REVIEWED');
  assert.equal(Object.hasOwn(support[0], 'value'), false);
  assert.equal(Object.hasOwn(support[0], 'rankValues'), false);
});

test('Everbright source-contract drift fails closed instead of retaining stale DEF values', () => {
  const source = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'EP-LIB-DEF')!;
  for (const patch of [
    { durationSeconds: 7 },
    { statOrEffect: 'DEF Ignore' },
    { trigger: 'Inflict Tune Strain - Shifting or Fusion Burst' },
    { appliesTo: 'TARGET' as const },
    { conditions: [] as readonly string[] },
    { mechanicsStatus: 'VERIFIED_RAW_PENDING_MODEL' as const },
  ]) {
    assert.ok(validateEverbrightPolestarStatusWindowContract(
      WEAPON_EFFECT_CATALOG.map(row => row.effectId === source.effectId ? { ...row, ...patch } : row),
    ).length > 0);
  }
});

test('missing Everbright occurrence leaves DEF event pending and RES-ignore sibling unassembled', () => {
  const sel = selection('LIBERATION'), current = cards();
  const result = assembleCharacterHitContext(sel, current);
  assert.equal(result.pending.find(row => row.id === 'weapon:EP-LIB-DEF')?.status, 'PENDING_EVENT');
  assert.equal(result.pending.find(row => row.id === 'weapon:EP-LIB-FUSION-RES')?.status, 'PENDING_SOURCE');
});

test('both reviewed status kinds activate exact R1 Liberation DEF Ignore for Aemeath', () => {
  const source = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'EP-LIB-DEF')!;
  for (const kind of ['FUSION_BURST_APPLIED', 'TUNE_RUPTURE_SHIFTING_APPLIED'] as const) {
    const sel = selection('LIBERATION'), current = cards(), candidate = candidateCards();
    const currentEvents = events(current, sel.eventContextId, application(kind));
    const candidateEvents = events(candidate, sel.eventContextId, application(kind));
    const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
    const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });
    const def = currentAssembly.defenseContributions.find(row => row.canonicalSourceId === 'EP-LIB-DEF')!;
    assert.equal(def.value, source.rankValues[0]);
    assert.equal(def.active, true);
    assert.deepEqual(def.defenseScope, { kind: 'DAMAGE_CLASS', damageClass: 'LIBERATION' });
    assert.ok(!currentAssembly.requirements.includes('weapon:EP-LIB-DEF'));
    assert.ok(currentAssembly.requirements.includes('weapon:EP-LIB-FUSION-RES'));

    const result = compareCharacterHitWithAssembledContext({
      selection: sel,
      slotIndex: 0,
      current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly) },
      candidate: { echoes: candidate, events: { weapon: candidateEvents }, remaining: remaining(candidateAssembly) },
    });
    assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
    if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected evaluated comparison');
    assert.equal(result.comparison.current.snapshot.defenseMultiplier,
      defenseMultiplier({ attackerLevel: 90, enemyDefense: ENEMY_DEF, defIgnore: source.rankValues[0] }));
  }
});

test('active Everbright source window does not leak Liberation DEF Ignore onto a Basic hit', () => {
  const sel = selection('BASIC'), current = cards(), candidate = candidateCards();
  const currentEvents = events(current, sel.eventContextId);
  const candidateEvents = events(candidate, sel.eventContextId);
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });
  const def = currentAssembly.defenseContributions.find(row => row.canonicalSourceId === 'EP-LIB-DEF')!;
  assert.equal(def.sourceWindowActive, true);
  assert.equal(def.appliesToSelectedHit, false);
  assert.equal(def.active, false);

  const result = compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { weapon: candidateEvents }, remaining: remaining(candidateAssembly) },
  });
  assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
  if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected evaluated comparison');
  assert.equal(result.comparison.current.snapshot.defenseMultiplier, BASE_DEFENSE);
});

test('Everbright event evidence is build-bound and owner/source/lifecycle fail closed', () => {
  const sel = selection('LIBERATION'), current = cards(), candidate = candidateCards();
  const currentEvents = events(current, sel.eventContextId), candidateEvents = events(candidate, sel.eventContextId);
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });

  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { weapon: currentEvents }, remaining: remaining(candidateAssembly) },
  }), /per-build event proof/);

  const base = application();
  const patches: Partial<ProvenHitEverbrightPolestarApplication>[] = [
    { evidenceId: '' },
    { equipmentAtEventQualified: false as true },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
    { event: { ...base.event, actorId: 'denia' } },
    { event: { ...base.event, targetId: '' } },
    { event: { ...base.event, sourceFactId: '' } },
    { event: { ...base.event, sourceTriggerQualification: 'UNKNOWN' } },
    { event: { ...base.event, kind: 'TUNE_STRAIN_SHIFTING_APPLIED' as never } },
  ];
  for (const patch of patches) {
    assert.throws(() => assembleCharacterHitContext(sel, current, {
      weapon: events(current, sel.eventContextId, { ...base, ...patch }),
    }));
  }
});

test('Everbright same-timestamp order, expiry and duplicate application remain explicit', () => {
  const current = cards();
  const atTrigger = selection('LIBERATION', 1);
  const before = events(current, atTrigger.eventContextId,
    application('TUNE_RUPTURE_SHIFTING_APPLIED', { sameTimestampOrder: 'BEFORE_TRIGGER' }));
  assert.equal(assembleCharacterHitContext(atTrigger, current, { weapon: before })
    .defenseContributions.find(row => row.canonicalSourceId === 'EP-LIB-DEF')!.active, false);

  const after = events(current, atTrigger.eventContextId);
  assert.equal(assembleCharacterHitContext(atTrigger, current, { weapon: after })
    .defenseContributions.find(row => row.canonicalSourceId === 'EP-LIB-DEF')!.active, true);

  const expired = selection('LIBERATION', 9);
  assert.equal(assembleCharacterHitContext(expired, current, { weapon: events(current, expired.eventContextId) })
    .defenseContributions.find(row => row.canonicalSourceId === 'EP-LIB-DEF')!.active, false);

  const base = events(current, selection('LIBERATION').eventContextId);
  const duplicate: HitContextWeaponEvents = {
    ...base,
    everbrightPolestarApplications: [
      application(),
      application('FUSION_BURST_APPLIED', { evidenceId: 'duplicate-everbright' }),
    ],
  };
  assert.throws(() => assembleCharacterHitContext(selection('LIBERATION'), current, { weapon: duplicate }),
    /Everbright Polestar refresh\/stacking is unreviewed/);
});
