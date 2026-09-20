import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { listCharacterDirectHitSupport } from '../src/combat/characterDirectHitAdapter.ts';
import { defenseMultiplier } from '../src/combat/damageKernel.ts';
import {
  assembleCharacterHitContext,
  compareCharacterHitWithAssembledContext,
  listDaybreakersSpineAmplificationHitContextSupport,
  listDaybreakersSpineDefenseHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import {
  validateDaybreakersSpineTuneStrainContracts,
} from '../src/combat/daybreakersSpineTuneStrainWindowAdapter.ts';
import type {
  HitContextWeaponEvents,
  ProvenHitDaybreakersSpineApplication,
} from '../src/combat/hitContextWeaponEvents.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `dbs-context-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'dbs-context-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(damageClass: 'BASIC' | 'HEAVY', hitAtSeconds = 2): CharacterHitContextSelection {
  const character = CHARACTER_CATALOG.find(row => row.id === 'luuk-herssen')!;
  const hit = listCharacterDirectHitSupport().find(row =>
    row.characterId === 'luuk-herssen' && row.sourceDamageClass === damageClass)!;
  assert.ok(character?.element && hit, `missing Luuk Herssen ${damageClass} direct hit`);
  return {
    hit: {
      characterId: 'luuk-herssen',
      factId: hit.factId,
      componentIndex: 0,
      landedHitCount: 1,
      sequence: 0,
      maxSkills: true,
    },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: `daybreakers-spine-${damageClass.toLowerCase()}-hit`,
    hitAtSeconds,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: 'daybreakers-spine', level: 90, rank: 1 },
  };
}

function application(
  patch: Partial<ProvenHitDaybreakersSpineApplication> = {},
): ProvenHitDaybreakersSpineApplication {
  return {
    evidenceId: 'synthetic-luuk-tune-strain-application',
    event: {
      kind: 'TUNE_STRAIN_SHIFTING_APPLIED',
      actorId: 'luuk-herssen',
      targetId: 'enemy',
      sourceFactId: 'caller-qualified-luuk-tune-strain-application',
      atSeconds: 1,
      sourceTriggerQualification: 'VERIFIED_DAYBREAKERS_SPINE_TUNE_STRAIN_APPLICATION',
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
  patch: Partial<ProvenHitDaybreakersSpineApplication> = {},
): HitContextWeaponEvents {
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    weapon: { id: 'daybreakers-spine', rank: 1 },
    eventContextId,
    evidenceId: 'synthetic-daybreakers-spine-hit-context',
    casts: [],
    daybreakersSpineApplications: [application(patch)],
  };
}

const ENEMY_DEF = 1000;
const BASE_DEFENSE = defenseMultiplier({ attackerLevel: 90, enemyDefense: ENEMY_DEF });

function remaining(a: ReturnType<typeof assembleCharacterHitContext>, amplification = 0): RemainingHitContext {
  const activeDefense = a.defenseContributions.some(row => row.active);
  return {
    status: 'QUALIFIED', provenance: 'CALLER_QUALIFIED',
    assemblyKey: a.assemblyKey,
    evidenceId: 'synthetic-daybreakers-spine-remaining-context',
    requirements: a.requirements.map(id => ({ id, evidenceId: `synthetic-proof:${id}` })),
    buildDependentEffectsRecomputed: true,
    scalingPercent: 0,
    scalingFlat: 0,
    critRate: 0,
    critDamage: 0,
    damageBonus: 0,
    amplification,
    defenseMultiplier: BASE_DEFENSE,
    ...(activeDefense ? {
      defenseContext: {
        evidenceId: 'synthetic-enemy-defense-proof',
        enemyDefense: ENEMY_DEF,
        otherDefenseModifiersAbsent: true as const,
      },
    } : {}),
    resistanceMultiplier: 0.9,
    damageReduction: 0,
  };
}

test("Daybreaker's Spine support exposes separate BASIC amplification and DEF Ignore scopes without copied values", () => {
  const amp = listDaybreakersSpineAmplificationHitContextSupport();
  const def = listDaybreakersSpineDefenseHitContextSupport();
  assert.deepEqual(amp.map(row => row.effectId), ['DBS-BASIC-AMP']);
  assert.deepEqual(def.map(row => row.effectId), ['DBS-BASIC-DEF']);
  assert.deepEqual(amp[0].amplificationScope, { kind: 'DAMAGE_CLASS', damageClass: 'BASIC' });
  assert.deepEqual(def[0].defenseScope, { kind: 'DAMAGE_CLASS', damageClass: 'BASIC' });
  assert.equal(amp[0].selectedHitScope, 'BASIC_DIRECT_HIT_ONLY');
  assert.equal(def[0].selectedHitScope, 'BASIC_DIRECT_HIT_ONLY');
  for (const row of [...amp, ...def]) {
    assert.equal(Object.hasOwn(row, 'value'), false);
    assert.equal(Object.hasOwn(row, 'rankValues'), false);
    assert.equal(Object.hasOwn(row, 'durationSeconds'), false);
  }
});

test("Daybreaker's Spine source drift fails closed instead of retaining stale Basic values", () => {
  const amp = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'DBS-BASIC-AMP')!;
  const def = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'DBS-BASIC-DEF')!;
  for (const [effectId, patch] of [
    ['DBS-BASIC-AMP', { durationSeconds: 5 }],
    ['DBS-BASIC-AMP', { trigger: 'Deal Basic Attack DMG' }],
    ['DBS-BASIC-AMP', { appliesTo: 'TEAM' as const }],
    ['DBS-BASIC-AMP', { mechanicsStatus: 'VERIFIED_MODELED' as const }],
    ['DBS-BASIC-DEF', { conditions: [] as readonly string[] }],
    ['DBS-BASIC-DEF', { statOrEffect: 'Aero DMG DEF Ignore' }],
  ] as const) {
    const base = effectId === 'DBS-BASIC-AMP' ? amp : def;
    const catalog = WEAPON_EFFECT_CATALOG.map(row => row.effectId === effectId ? { ...base, ...patch } : row);
    assert.ok(validateDaybreakersSpineTuneStrainContracts(catalog).length > 0, effectId);
  }
});

test("missing Tune Strain occurrence leaves both DBS Basic conditional rows pending", () => {
  const sel = selection('BASIC'), current = cards();
  const result = assembleCharacterHitContext(sel, current);
  assert.equal(result.pending.find(row => row.id === 'weapon:DBS-BASIC-AMP')?.status, 'PENDING_EVENT');
  assert.equal(result.pending.find(row => row.id === 'weapon:DBS-BASIC-DEF')?.status, 'PENDING_EVENT');
  assert.equal(result.pending.find(row => row.id === 'weapon:DBS-SPECTRO')?.status, 'PENDING_EVENT',
    'the separate Basic-damage Spectro window remains its own event obligation');
});

test("qualified Tune Strain application composes exact R1 BASIC amplification and DEF Ignore for Luuk", () => {
  const ampSource = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'DBS-BASIC-AMP')!;
  const defSource = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'DBS-BASIC-DEF')!;
  const sel = selection('BASIC'), current = cards(), candidate = candidateCards();
  const currentEvents = events(current, sel.eventContextId);
  const candidateEvents = events(candidate, sel.eventContextId);
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });

  const amp = currentAssembly.amplificationContributions.find(row => row.canonicalSourceId === 'DBS-BASIC-AMP')!;
  const def = currentAssembly.defenseContributions.find(row => row.canonicalSourceId === 'DBS-BASIC-DEF')!;
  assert.equal(amp.value, ampSource.rankValues[0]);
  assert.equal(amp.active, true);
  assert.deepEqual(amp.scope, { kind: 'DAMAGE_CLASS', damageClass: 'BASIC' });
  assert.equal(def.value, defSource.rankValues[0]);
  assert.equal(def.active, true);
  assert.deepEqual(def.defenseScope, { kind: 'DAMAGE_CLASS', damageClass: 'BASIC' });
  assert.ok(!currentAssembly.requirements.includes('weapon:DBS-BASIC-AMP'));
  assert.ok(!currentAssembly.requirements.includes('weapon:DBS-BASIC-DEF'));
  assert.ok(currentAssembly.requirements.includes('weapon:DBS-SPECTRO'));

  const result = compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { weapon: candidateEvents }, remaining: remaining(candidateAssembly) },
  });
  assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
  if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected evaluated comparison');
  assert.equal(result.comparison.current.snapshot.amplification, ampSource.rankValues[0]);
  assert.equal(result.comparison.current.snapshot.defenseMultiplier,
    defenseMultiplier({ attackerLevel: 90, enemyDefense: ENEMY_DEF, defIgnore: defSource.rankValues[0] }));
});

test("active DBS source windows do not leak Basic amplification or DEF Ignore onto Luuk Heavy hits", () => {
  const sel = selection('HEAVY'), current = cards(), candidate = candidateCards();
  const currentEvents = events(current, sel.eventContextId);
  const candidateEvents = events(candidate, sel.eventContextId);
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });
  const amp = currentAssembly.amplificationContributions.find(row => row.canonicalSourceId === 'DBS-BASIC-AMP')!;
  const def = currentAssembly.defenseContributions.find(row => row.canonicalSourceId === 'DBS-BASIC-DEF')!;
  assert.equal(amp.active, true, 'source window itself is active; typed scope excludes Heavy at composition');
  assert.equal(def.sourceWindowActive, true);
  assert.equal(def.appliesToSelectedHit, false);
  assert.equal(def.active, false);

  const result = compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly, .07) },
    candidate: { echoes: candidate, events: { weapon: candidateEvents }, remaining: remaining(candidateAssembly, .07) },
  });
  assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
  if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected evaluated comparison');
  assert.equal(result.comparison.current.snapshot.amplification, .07);
  assert.equal(result.comparison.current.snapshot.defenseMultiplier, BASE_DEFENSE);
});

test("DBS Tune Strain proof is build-bound and owner/source/lifecycle evidence fail closed", () => {
  const sel = selection('BASIC'), current = cards(), candidate = candidateCards();
  const currentEvents = events(current, sel.eventContextId);
  const candidateEvents = events(candidate, sel.eventContextId);
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });

  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { weapon: currentEvents }, remaining: remaining(candidateAssembly) },
  }), /per-build event proof/);

  const base = application();
  const patches: Partial<ProvenHitDaybreakersSpineApplication>[] = [
    { evidenceId: '' },
    { equipmentAtEventQualified: false as true },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
    { event: { ...base.event, actorId: 'augusta' } },
    { event: { ...base.event, targetId: '' } },
    { event: { ...base.event, sourceFactId: '' } },
    { event: { ...base.event, sourceTriggerQualification: 'UNKNOWN' } },
    { event: { ...base.event, kind: 'FUSION_BURST_APPLIED' as never } },
  ];
  for (const patch of patches) {
    assert.throws(() => assembleCharacterHitContext(sel, current, {
      weapon: events(current, sel.eventContextId, { ...base, ...patch }),
    }));
  }
});

test("DBS same-timestamp ordering, exact expiry and duplicate application remain explicit", () => {
  const current = cards();
  const atTrigger = selection('BASIC', 1);
  const before = events(current, atTrigger.eventContextId, { sameTimestampOrder: 'BEFORE_TRIGGER' });
  const beforeAssembly = assembleCharacterHitContext(atTrigger, current, { weapon: before });
  assert.equal(beforeAssembly.amplificationContributions
    .find(row => row.canonicalSourceId === 'DBS-BASIC-AMP')!.active, false);
  assert.equal(beforeAssembly.defenseContributions
    .find(row => row.canonicalSourceId === 'DBS-BASIC-DEF')!.active, false);

  const after = events(current, atTrigger.eventContextId);
  const afterAssembly = assembleCharacterHitContext(atTrigger, current, { weapon: after });
  assert.equal(afterAssembly.amplificationContributions
    .find(row => row.canonicalSourceId === 'DBS-BASIC-AMP')!.active, true);
  assert.equal(afterAssembly.defenseContributions
    .find(row => row.canonicalSourceId === 'DBS-BASIC-DEF')!.active, true);

  const expired = selection('BASIC', 7);
  const expiredAssembly = assembleCharacterHitContext(expired, current, {
    weapon: events(current, expired.eventContextId),
  });
  assert.equal(expiredAssembly.amplificationContributions
    .find(row => row.canonicalSourceId === 'DBS-BASIC-AMP')!.active, false);
  assert.equal(expiredAssembly.defenseContributions
    .find(row => row.canonicalSourceId === 'DBS-BASIC-DEF')!.active, false);

  const base = events(current, selection('BASIC').eventContextId);
  const duplicate: HitContextWeaponEvents = {
    ...base,
    daybreakersSpineApplications: [
      application(),
      application({ evidenceId: 'duplicate-daybreakers-spine' }),
    ],
  };
  assert.throws(() => assembleCharacterHitContext(selection('BASIC'), current, { weapon: duplicate }),
    /Daybreaker's Spine refresh\/stacking is unreviewed/);
});

test("active DBS Basic amplification cannot be combined with residual amplification without reviewed stacking", () => {
  const sel = selection('BASIC'), current = cards(), candidate = candidateCards();
  const currentEvents = events(current, sel.eventContextId);
  const candidateEvents = events(candidate, sel.eventContextId);
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly, .01) },
    candidate: { echoes: candidate, events: { weapon: candidateEvents }, remaining: remaining(candidateAssembly) },
  }), /Residual amplification must be zero/);
});
