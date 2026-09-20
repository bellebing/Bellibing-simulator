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
  listAzureOathAmplificationHitContextSupport,
  listAzureOathDefenseHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type {
  HitContextWeaponEvents,
  ProvenHitAzureOathApplication,
} from '../src/combat/hitContextWeaponEvents.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `azure-oath-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'azure-oath-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(damageClass: 'HEAVY' | 'BASIC', hitAtSeconds = 2): CharacterHitContextSelection {
  const character = CHARACTER_CATALOG.find(row => row.id === 'yangyang-xuanling')!;
  const hit = listCharacterDirectHitSupport().find(row =>
    row.characterId === 'yangyang-xuanling' && row.sourceDamageClass === damageClass)!;
  assert.ok(character?.element && hit, `missing Xuanling ${damageClass} direct hit`);
  return {
    hit: { characterId: 'yangyang-xuanling', factId: hit.factId, componentIndex: 0, landedHitCount: 1,
      sequence: 0, maxSkills: true },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: `azure-oath-${damageClass.toLowerCase()}-hit`,
    targetId: 'enemy',
    hitAtSeconds,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: 'azure-oath', level: 90, rank: 1 },
  };
}

function application(
  patch: Partial<ProvenHitAzureOathApplication> = {},
): ProvenHitAzureOathApplication {
  return {
    evidenceId: 'synthetic-xuanling-havoc-bane-application',
    event: {
      kind: 'HAVOC_BANE_APPLIED',
      actorId: 'yangyang-xuanling',
      targetId: 'enemy',
      sourceFactId: 'caller-qualified-xuanling-havoc-bane-application',
      stacksApplied: 1,
      atSeconds: 1,
      sourceTriggerQualification: 'VERIFIED_AZURE_OATH_HAVOC_BANE_APPLICATION',
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
  patch: Partial<ProvenHitAzureOathApplication> = {},
): HitContextWeaponEvents {
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    weapon: { id: 'azure-oath', rank: 1 },
    eventContextId,
    evidenceId: 'synthetic-azure-oath-hit-context',
    casts: [],
    azureOathApplications: [application(patch)],
  };
}

const ENEMY_DEF = 1000;
const BASE_DEFENSE = defenseMultiplier({ attackerLevel: 90, enemyDefense: ENEMY_DEF });

function remaining(a: ReturnType<typeof assembleCharacterHitContext>): RemainingHitContext {
  const activeDefense = a.defenseContributions.some(row => row.active);
  return {
    status: 'QUALIFIED', provenance: 'CALLER_QUALIFIED',
    assemblyKey: a.assemblyKey,
    evidenceId: 'synthetic-azure-oath-remaining-context',
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

test('Azure Oath hit support keeps Heavy amplification and Heavy DEF Ignore distinct and value-free', () => {
  const amp = listAzureOathAmplificationHitContextSupport();
  const def = listAzureOathDefenseHitContextSupport();
  assert.deepEqual(amp.map(row => row.effectId), ['AO-HEAVY-AMP']);
  assert.deepEqual(def.map(row => row.effectId), ['AO-DEF']);
  assert.deepEqual(amp[0].amplificationScope, { kind: 'DAMAGE_CLASS', damageClass: 'HEAVY' });
  assert.deepEqual(def[0].defenseScope, { kind: 'DAMAGE_CLASS', damageClass: 'HEAVY' });
  assert.ok([...amp, ...def].every(row => row.selectedHitScope === 'HEAVY_DIRECT_HIT_ONLY'
    && !Object.hasOwn(row, 'value') && !Object.hasOwn(row, 'durationSeconds')));
});

test('missing Azure Oath Havoc Bane occurrence remains explicit PENDING_EVENT', () => {
  const sel = selection('HEAVY'), current = cards();
  const result = assembleCharacterHitContext(sel, current);
  assert.equal(result.pending.find(row => row.id === 'weapon:AO-HEAVY-AMP')?.status, 'PENDING_EVENT');
  assert.equal(result.pending.find(row => row.id === 'weapon:AO-DEF')?.status, 'PENDING_EVENT');
});

test('one qualified Havoc Bane application gives Heavy hit both exact R1 effects through separate arithmetic boundaries', () => {
  const sel = selection('HEAVY'), current = cards(), candidate = candidateCards();
  const currentEvents = events(current, sel.eventContextId), candidateEvents = events(candidate, sel.eventContextId);
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });

  const ampSource = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'AO-HEAVY-AMP')!;
  const defSource = WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'AO-DEF')!;
  const amp = currentAssembly.amplificationContributions.find(row => row.canonicalSourceId === 'AO-HEAVY-AMP')!;
  const def = currentAssembly.defenseContributions.find(row => row.canonicalSourceId === 'AO-DEF')!;
  assert.equal(amp.value, ampSource.rankValues[0]);
  assert.equal(amp.active, true);
  assert.equal(def.value, defSource.rankValues[0]);
  assert.equal(def.active, true);
  assert.deepEqual(def.defenseScope, { kind: 'DAMAGE_CLASS', damageClass: 'HEAVY' });
  assert.ok(!currentAssembly.requirements.includes('weapon:AO-HEAVY-AMP'));
  assert.ok(!currentAssembly.requirements.includes('weapon:AO-DEF'));

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

test('the same active Azure Oath windows do not leak Heavy amplification or DEF Ignore onto a Basic hit', () => {
  const sel = selection('BASIC'), current = cards(), candidate = candidateCards();
  const currentEvents = events(current, sel.eventContextId), candidateEvents = events(candidate, sel.eventContextId);
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });

  const amp = currentAssembly.amplificationContributions.find(row => row.canonicalSourceId === 'AO-HEAVY-AMP')!;
  const def = currentAssembly.defenseContributions.find(row => row.canonicalSourceId === 'AO-DEF')!;
  assert.equal(amp.active, true, 'source window itself is active before hit-scope filtering');
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
  assert.equal(result.comparison.current.snapshot.amplification, 0);
  assert.equal(result.comparison.current.snapshot.defenseMultiplier, BASE_DEFENSE);
});

test('Azure Oath event evidence is build-bound and source qualification/lifecycle fail closed', () => {
  const sel = selection('HEAVY'), current = cards(), candidate = candidateCards();
  const currentEvents = events(current, sel.eventContextId), candidateEvents = events(candidate, sel.eventContextId);
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { weapon: currentEvents }, remaining: remaining(candidateAssembly) },
  }), /per-build event proof/);

  const patches: Partial<ProvenHitAzureOathApplication>[] = [
    { evidenceId: '' },
    { equipmentAtEventQualified: false as true },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
    { event: { ...application().event, actorId: 'chisa' } },
    { event: { ...application().event, sourceFactId: '' } },
    { event: { ...application().event, stacksApplied: 0 } },
    { event: { ...application().event, sourceTriggerQualification: 'UNKNOWN' } },
  ];
  for (const patch of patches) {
    assert.throws(() => assembleCharacterHitContext(sel, current, {
      weapon: events(current, sel.eventContextId, patch),
    }));
  }
});

test('same-timestamp ordering, expiry and duplicate Azure Oath application are explicit', () => {
  const current = cards();
  const atTrigger = selection('HEAVY', 1);
  const before = events(current, atTrigger.eventContextId, { sameTimestampOrder: 'BEFORE_TRIGGER' });
  const beforeAssembly = assembleCharacterHitContext(atTrigger, current, { weapon: before });
  assert.equal(beforeAssembly.amplificationContributions.find(row => row.canonicalSourceId === 'AO-HEAVY-AMP')!.active, false);
  assert.equal(beforeAssembly.defenseContributions.find(row => row.canonicalSourceId === 'AO-DEF')!.active, false);

  const after = assembleCharacterHitContext(atTrigger, current, {
    weapon: events(current, atTrigger.eventContextId),
  });
  assert.equal(after.amplificationContributions.find(row => row.canonicalSourceId === 'AO-HEAVY-AMP')!.active, true);
  assert.equal(after.defenseContributions.find(row => row.canonicalSourceId === 'AO-DEF')!.active, true);

  const expired = selection('HEAVY', 9);
  const expiredAssembly = assembleCharacterHitContext(expired, current, {
    weapon: events(current, expired.eventContextId),
  });
  assert.equal(expiredAssembly.amplificationContributions.find(row => row.canonicalSourceId === 'AO-HEAVY-AMP')!.active, false);
  assert.equal(expiredAssembly.defenseContributions.find(row => row.canonicalSourceId === 'AO-DEF')!.active, false);

  const base = events(current, selection('HEAVY').eventContextId);
  const duplicate: HitContextWeaponEvents = {
    ...base,
    azureOathApplications: [application(), application({ evidenceId: 'duplicate' })],
  };
  assert.throws(() => assembleCharacterHitContext(selection('HEAVY'), current, { weapon: duplicate }),
    /Azure Oath refresh\/stacking is unreviewed/);
});
