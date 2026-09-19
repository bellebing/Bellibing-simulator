import test from 'node:test';
import assert from 'node:assert/strict';
import { createRank5EchoAtLevel0 } from '../src/echoCore.ts';
import { projectRank5EchoStats } from '../src/echoStatProjection.ts';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { WEAPON_CATALOG } from '../src/data/weapons.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';
import { defenseMultiplier } from '../src/combat/damageKernel.ts';
import { listCharacterDirectHitSupport, type DirectHitDamageClass } from '../src/combat/characterDirectHitAdapter.ts';
import {
  assembleCharacterHitContext,
  compareCharacterHitWithAssembledContext,
  listHackShiftingStatHitContextSupport,
  listHackShiftingAmplificationHitContextSupport,
  listHackShiftingDefenseHitContextSupport,
  type CharacterHitContextSelection,
  type RemainingHitContext,
} from '../src/combat/characterHitContext.ts';
import type {
  HitContextWeaponEvents,
  ProvenHitHackShiftingApplication,
} from '../src/combat/hitContextWeaponEvents.ts';
import {
  validateHackShiftingWeaponContracts,
  listHackShiftingWeaponWindowSupport,
} from '../src/combat/hackShiftingWeaponWindowAdapter.ts';

const cards = () => [4, 3, 3, 1, 1].map((cost, index) =>
  createRank5EchoAtLevel0({ id: `hack-shifting-${cost}-${index}`, cost, primaryMainStat: 'ATK%' }));
const candidateCards = () => {
  const rows = cards();
  rows[0] = createRank5EchoAtLevel0({ id: 'hack-shifting-candidate', cost: 4, primaryMainStat: 'CRIT Rate' });
  return rows;
};

function selection(
  characterId: 'lucy' | 'rebecca',
  weaponId: 'spectral-trigger' | 'skull-thrasher',
  damageClass: DirectHitDamageClass,
  hitAtSeconds = 2,
): CharacterHitContextSelection {
  const character = CHARACTER_CATALOG.find(row => row.id === characterId)!;
  const weapon = WEAPON_CATALOG.find(row => row.id === weaponId)!;
  const hit = listCharacterDirectHitSupport().find(row =>
    row.characterId === characterId && row.sourceDamageClass === damageClass)!;
  assert.ok(character?.element && weapon && hit, `missing ${characterId} ${damageClass} direct hit / ${weaponId}`);
  assert.equal(weapon.weaponType, character.weaponType);
  return {
    hit: { characterId, factId: hit.factId, componentIndex: 0, landedHitCount: 1,
      sequence: 0, maxSkills: true },
    damageElement: character.element as CharacterHitContextSelection['damageElement'],
    eventContextId: `hack-shifting-${characterId}-${damageClass}`,
    hitAtSeconds,
    characterLevel: 90,
    maxMinorFortes: true,
    weapon: { id: weaponId, level: 90, rank: 1 },
  };
}

function proof(
  sel: CharacterHitContextSelection,
  equippedCards: ReturnType<typeof cards>,
  patch: Partial<ProvenHitHackShiftingApplication> = {},
): HitContextWeaponEvents {
  const row: ProvenHitHackShiftingApplication = {
    evidenceId: 'synthetic-hack-shifting-application',
    event: {
      kind: 'HACK_SHIFTING_APPLIED',
      actorId: sel.hit.characterId,
      targetId: 'enemy',
      sourceFactId: `synthetic-${sel.hit.characterId}-hack-shifting`,
      atSeconds: 1,
      sourceTriggerQualification: 'VERIFIED_HACK_SHIFTING_APPLICATION',
    },
    teamMemberIds: sel.hit.characterId === 'rebecca'
      ? ['rebecca', 'lupa', 'mornye']
      : undefined,
    equipmentAtEventQualified: true,
    priorActivationState: 'NONE_ACTIVE',
    noLaterActivationThroughHit: true,
    sameTimestampOrder: 'AFTER_TRIGGER',
    ...patch,
  };
  return {
    echoStatKey: projectRank5EchoStats(equippedCards).key,
    weapon: { id: sel.weapon.id, rank: sel.weapon.rank },
    eventContextId: sel.eventContextId,
    evidenceId: 'synthetic-hack-shifting-context',
    casts: [],
    hackShiftingApplications: [row],
  };
}

function remaining(
  assembly: ReturnType<typeof assembleCharacterHitContext>,
  options: { amplification?: number; enemyDefense?: number } = {},
): RemainingHitContext {
  const enemyDefense = options.enemyDefense ?? 1000;
  return {
    status: 'QUALIFIED',
    assemblyKey: assembly.assemblyKey,
    evidenceId: 'synthetic-residual-context',
    requirements: assembly.requirements.map(id => ({ id, evidenceId: `synthetic-proof:${id}` })),
    buildDependentEffectsRecomputed: true,
    scalingPercent: 0,
    scalingFlat: 0,
    critRate: 0,
    critDamage: 0,
    damageBonus: 0,
    amplification: options.amplification ?? 0,
    defenseMultiplier: defenseMultiplier({ attackerLevel: 90, enemyDefense }),
    defenseContext: {
      evidenceId: 'synthetic-enemy-defense',
      enemyDefense,
      otherDefenseModifiersAbsent: true,
    },
    resistanceMultiplier: 0.9,
    damageReduction: 0,
  };
}

test('Hack - Shifting source contracts expose exactly four bounded rows and park SPT-SPECTRO', () => {
  assert.deepEqual(validateHackShiftingWeaponContracts(), []);
  const support = listHackShiftingWeaponWindowSupport();
  assert.deepEqual(support.map(row => row.effectId),
    ['SPT-HEAVY-AMP', 'SPT-HEAVY-DEF', 'SKT-HACK-BASIC', 'SKT-HACK-TEAM']);
  assert.ok(support.every(row => !Object.hasOwn(row, 'value') && !Object.hasOwn(row, 'durationSeconds')));
  assert.deepEqual(listHackShiftingAmplificationHitContextSupport().map(row => row.effectId), ['SPT-HEAVY-AMP']);
  assert.deepEqual(listHackShiftingDefenseHitContextSupport().map(row => row.effectId), ['SPT-HEAVY-DEF']);
  assert.deepEqual(listHackShiftingStatHitContextSupport().map(row => row.effectId), ['SKT-HACK-BASIC', 'SKT-HACK-TEAM']);
  assert.ok(!support.some(row => row.effectId === 'SPT-SPECTRO'));
});

test('Spectral Trigger Hack proof composes Heavy amplification and inherited DEF only for Heavy hit arithmetic', () => {
  const sel = selection('lucy', 'spectral-trigger', 'HEAVY');
  const current = cards(), candidate = candidateCards();
  const currentEvents = proof(sel, current), candidateEvents = proof(sel, candidate);
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });
  const amp = currentAssembly.amplificationContributions.find(row => row.canonicalSourceId === 'SPT-HEAVY-AMP')!;
  const def = currentAssembly.defenseContributions.find(row => row.canonicalSourceId === 'SPT-HEAVY-DEF')!;
  assert.equal(amp.value, WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'SPT-HEAVY-AMP')!.rankValues[0]);
  assert.equal(def.value, WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'SPT-HEAVY-DEF')!.rankValues[0]);
  assert.equal(amp.active, true);
  assert.equal(def.active, true);
  assert.equal((def.window as { inheritedFromEffectId?: string }).inheritedFromEffectId, 'SPT-HEAVY-AMP');
  assert.ok(currentAssembly.requirements.includes('weapon:SPT-SPECTRO'),
    'separate stackable Spectro family remains an explicit obligation');
  assert.ok(!currentAssembly.requirements.includes('weapon:SPT-HEAVY-AMP'));
  assert.ok(!currentAssembly.requirements.includes('weapon:SPT-HEAVY-DEF'));

  const result = compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { weapon: candidateEvents }, remaining: remaining(candidateAssembly) },
  });
  assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
  if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected comparison');
  assert.equal(result.comparison.current.snapshot.amplification, amp.value);
  assert.ok(result.comparison.current.snapshot.defenseMultiplier > remaining(currentAssembly).defenseMultiplier);
});

test('Spectral Trigger active source window does not leak Heavy effects onto non-Heavy hit', () => {
  const sel = selection('lucy', 'spectral-trigger', 'BASIC');
  const current = cards(), candidate = candidateCards();
  const currentEvents = proof(sel, current), candidateEvents = proof(sel, candidate);
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });
  const amp = currentAssembly.amplificationContributions.find(row => row.canonicalSourceId === 'SPT-HEAVY-AMP')!;
  const def = currentAssembly.defenseContributions.find(row => row.canonicalSourceId === 'SPT-HEAVY-DEF')!;
  assert.equal(amp.active, true, 'source window itself is active');
  assert.equal(def.sourceWindowActive, true);
  assert.equal(def.appliesToSelectedHit, false);
  assert.equal(def.active, false);

  const result = compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly, { amplification: .04 }) },
    candidate: { echoes: candidate, events: { weapon: candidateEvents }, remaining: remaining(candidateAssembly, { amplification: .04 }) },
  });
  assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
  if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected comparison');
  assert.equal(result.comparison.current.snapshot.amplification, .04);
  assert.equal(result.comparison.current.snapshot.defenseMultiplier, remaining(currentAssembly).defenseMultiplier);
});

test('Skull Thrasher Hack proof activates self Basic and selected-team ATK as separate ordinary stats', () => {
  const sel = selection('rebecca', 'skull-thrasher', 'BASIC');
  const current = cards(), candidate = candidateCards();
  const currentEvents = proof(sel, current), candidateEvents = proof(sel, candidate);
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });
  const basic = currentAssembly.eventContributions.find(row => row.sourceId === 'weapon:SKT-HACK-BASIC')!;
  const team = currentAssembly.eventContributions.find(row => row.sourceId === 'weapon:SKT-HACK-TEAM')!;
  assert.equal(basic.active, true);
  assert.equal(team.active, true);
  assert.equal(basic.stat, 'Basic Attack DMG');
  assert.equal(team.stat, 'ATK%');
  assert.ok(!currentAssembly.requirements.includes('weapon:SKT-HACK-BASIC'));
  assert.ok(!currentAssembly.requirements.includes('weapon:SKT-HACK-TEAM'));

  const result = compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { weapon: candidateEvents }, remaining: remaining(candidateAssembly) },
  });
  assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
});

test('Skull Basic DMG does not leak to Skill hit while TEAM ATK remains applicable', () => {
  const sel = selection('rebecca', 'skull-thrasher', 'SKILL');
  const current = cards(), candidate = candidateCards();
  const currentEvents = proof(sel, current), candidateEvents = proof(sel, candidate);
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });
  assert.ok(currentAssembly.stats['Basic Attack DMG'] > 0);
  assert.ok(currentAssembly.stats['ATK%'] > 0);
  const result = compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { weapon: candidateEvents }, remaining: remaining(candidateAssembly) },
  });
  assert.equal(result.comparison.status, 'EVALUATED_HIT_COMPARISON');
  if (result.comparison.status !== 'EVALUATED_HIT_COMPARISON') throw new Error('Expected comparison');
  assert.equal(result.comparison.current.snapshot.damageClass, 'SKILL');
});

test('Hack proof is build-bound and owner/team/source/lifecycle evidence fails closed', () => {
  const sel = selection('rebecca', 'skull-thrasher', 'BASIC');
  const current = cards(), candidate = candidateCards();
  const currentEvents = proof(sel, current), candidateEvents = proof(sel, candidate);
  const currentAssembly = assembleCharacterHitContext(sel, current, { weapon: currentEvents });
  const candidateAssembly = assembleCharacterHitContext(sel, candidate, { weapon: candidateEvents });
  assert.throws(() => compareCharacterHitWithAssembledContext({
    selection: sel,
    slotIndex: 0,
    current: { echoes: current, events: { weapon: currentEvents }, remaining: remaining(currentAssembly) },
    candidate: { echoes: candidate, events: { weapon: currentEvents }, remaining: remaining(candidateAssembly) },
  }), /per-build event proof/);

  const original = currentEvents.hackShiftingApplications![0];
  const patches: Partial<ProvenHitHackShiftingApplication>[] = [
    { evidenceId: '' },
    { equipmentAtEventQualified: false as true },
    { teamMemberIds: [] },
    { teamMemberIds: ['rebecca', 'not-a-character'] },
    { teamMemberIds: ['rebecca', 'rebecca'] },
    { event: { ...original.event, actorId: 'lucy' } },
    { event: { ...original.event, targetId: '' } },
    { event: { ...original.event, sourceFactId: '' } },
    { event: { ...original.event, sourceTriggerQualification: 'UNKNOWN' } },
    { priorActivationState: 'UNKNOWN' as never },
    { noLaterActivationThroughHit: false as true },
    { sameTimestampOrder: 'UNKNOWN' as never },
  ];
  for (const patch of patches) {
    const bad = structuredClone(currentEvents);
    Object.assign(bad.hackShiftingApplications![0], patch);
    assert.throws(() => assembleCharacterHitContext(sel, current, { weapon: bad }));
  }
});

test('same-timestamp order, expiry and repeated Hack application fail closed', () => {
  const current = cards();
  const atTrigger = selection('lucy', 'spectral-trigger', 'HEAVY', 1);
  const before = proof(atTrigger, current, { sameTimestampOrder: 'BEFORE_TRIGGER' });
  const beforeAssembly = assembleCharacterHitContext(atTrigger, current, { weapon: before });
  assert.equal(beforeAssembly.amplificationContributions.find(row => row.canonicalSourceId === 'SPT-HEAVY-AMP')!.active, false);
  assert.equal(beforeAssembly.defenseContributions.find(row => row.canonicalSourceId === 'SPT-HEAVY-DEF')!.active, false);

  const afterAssembly = assembleCharacterHitContext(atTrigger, current, { weapon: proof(atTrigger, current) });
  assert.equal(afterAssembly.amplificationContributions.find(row => row.canonicalSourceId === 'SPT-HEAVY-AMP')!.active, true);

  const expired = selection('lucy', 'spectral-trigger', 'HEAVY', 15);
  const expiredAssembly = assembleCharacterHitContext(expired, current, { weapon: proof(expired, current) });
  assert.equal(expiredAssembly.amplificationContributions.find(row => row.canonicalSourceId === 'SPT-HEAVY-AMP')!.active, false);

  const base = proof(atTrigger, current);
  const duplicate: HitContextWeaponEvents = {
    ...base,
    hackShiftingApplications: [
      base.hackShiftingApplications![0],
      { ...base.hackShiftingApplications![0], evidenceId: 'duplicate-hack' },
    ],
  };
  assert.throws(() => assembleCharacterHitContext(atTrigger, current, { weapon: duplicate }),
    /refresh\/reapplication is outside one isolated application proof/);
});

test('Hack contract drift fails rather than retaining stale trigger/state semantics', () => {
  for (const [effectId, patch] of [
    ['SPT-HEAVY-AMP', { durationSeconds: 15 }],
    ['SPT-HEAVY-DEF', { conditions: [] }],
    ['SKT-HACK-BASIC', { trigger: 'Cast Resonance Skill' }],
    ['SKT-HACK-TEAM', { sourceEffectText: 'Inflicting Hack - Shifting grants team ATK.' }],
  ] as const) {
    const drifted = WEAPON_EFFECT_CATALOG.map(row => row.effectId === effectId ? { ...row, ...patch } : row);
    assert.ok(validateHackShiftingWeaponContracts(drifted).length > 0, effectId);
  }
});
