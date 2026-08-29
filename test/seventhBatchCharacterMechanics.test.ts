import assert from 'node:assert/strict';
import test from 'node:test';

import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  CAMELLYA_CHARACTER_MECHANICS_PROFILE,
  CAMELLYA_TUNE_BREAK_FACT,
  CARLOTTA_CHARACTER_MECHANICS_PROFILE,
  CARLOTTA_TUNE_BREAK_FACT,
  CHARACTER_MECHANIC_FACT_BY_ID,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';
import {
  CAMELLYA_ACTION_FACTS,
  CAMELLYA_CHARACTER_MECHANIC_FACTS,
  CAMELLYA_PASSIVE_FACTS,
  CAMELLYA_RESOURCE_FACTS,
  CAMELLYA_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/camellyaRawFacts.ts';
import {
  CARLOTTA_ACTION_FACTS,
  CARLOTTA_CHARACTER_MECHANIC_FACTS,
  CARLOTTA_PASSIVE_FACTS,
  CARLOTTA_RESOURCE_FACTS,
  CARLOTTA_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/carlottaRawFacts.ts';
import { getCharacterPreflight } from '../src/data/characterPreflight.ts';

const EXPECTED_AREAS = [
  ['ACTIONS', 'VERIFIED'],
  ['FORTE_RULES', 'VERIFIED'],
  ['INHERENT_PASSIVES', 'VERIFIED'],
  ['OUTRO_EFFECT', 'VERIFIED'],
  ['RESOURCE_RULES', 'VERIFIED'],
  ['SEQUENCES', 'VERIFIED'],
] as const;

function factById<T extends { factId: string }>(facts: readonly T[], factId: string): T {
  const fact = facts.find((entry) => entry.factId === factId);
  assert.ok(fact, factId);
  return fact;
}

test('seventh Character Mechanics batch promotes Camellya and Carlotta only after semantic review', () => {
  for (const [characterId, profile, expectedFactCount] of [
    ['camellya', CAMELLYA_CHARACTER_MECHANICS_PROFILE, 35],
    ['carlotta', CARLOTTA_CHARACTER_MECHANICS_PROFILE, 34],
  ] as const) {
    assert.equal(getCharacterMechanicsProfile(characterId), profile);
    assert.equal(profile.verificationStatus, 'VERIFIED');
    assert.deepEqual(profile.coverage.map((entry) => [entry.area, entry.status]), EXPECTED_AREAS);
    assert.equal(profile.factIds.length, expectedFactCount);
    assert.match(profile.provenance.notes?.join(' ') ?? '', /CANDIDATE_ONLY|NOT_VERIFIED|no generated candidate status was promoted automatically/i);
  }

  assert.equal(CAMELLYA_ACTION_FACTS.length, 22);
  assert.equal(CAMELLYA_RESOURCE_FACTS.length, 2);
  assert.equal(CAMELLYA_PASSIVE_FACTS.length, 4);
  assert.equal(CAMELLYA_SEQUENCE_FACTS.length, 6);
  assert.equal(CAMELLYA_CHARACTER_MECHANIC_FACTS.length, 34);

  assert.equal(CARLOTTA_ACTION_FACTS.length, 18);
  assert.equal(CARLOTTA_RESOURCE_FACTS.length, 3);
  assert.equal(CARLOTTA_PASSIVE_FACTS.length, 6);
  assert.equal(CARLOTTA_SEQUENCE_FACTS.length, 6);
  assert.equal(CARLOTTA_CHARACTER_MECHANIC_FACTS.length, 33);
});

test('Camellya preserves Seedbed/Blossom Basic Attack buckets and fixed Twining split', () => {
  const pruning = factById(CAMELLYA_ACTION_FACTS, 'camellya-basic-attack-burgeoning-heavy-attack-dmg');
  assert.equal(pruning.actionKind, 'HEAVY');
  assert.equal(pruning.damageClass, 'BASIC');
  assert.match(pruning.notes?.join(' ') ?? '', /Seedbed.*Basic Attack DMG/i);

  for (const factId of [
    'camellya-resonance-skill-valse-of-bloom-and-blight-crimson-blossom-dmg',
    'camellya-resonance-skill-valse-of-bloom-and-blight-floral-ravage-dmg',
    'camellya-forte-circuit-vegetative-universe-ephemeral-dmg',
  ]) {
    assert.equal(factById(CAMELLYA_ACTION_FACTS, factId).damageClass, 'BASIC', factId);
  }

  const baseOutro = factById(CAMELLYA_ACTION_FACTS, 'camellya-outro-twining-base');
  const enhancedOutro = factById(CAMELLYA_ACTION_FACTS, 'camellya-outro-twining-post-ephemeral');
  assert.equal(baseOutro.damageClass, 'OUTRO');
  assert.equal(baseOutro.sourceFixedMotionValue, 3.2924);
  assert.equal(enhancedOutro.sourceFixedMotionValue, 4.5902);
  assert.equal(enhancedOutro.conditional, true);

  assert.deepEqual(CAMELLYA_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [
    ['Crimson Pistils', 100],
    ['Crimson Buds', 10],
  ]);
  assert.deepEqual(CAMELLYA_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
});

test('Carlotta preserves Basic/Heavy versus Skill damage buckets and exact resource caps', () => {
  assert.equal(factById(CARLOTTA_ACTION_FACTS, 'carlotta-basic-attack-silent-execution-basic-attack-stage-1').damageClass, 'BASIC');
  assert.equal(factById(CARLOTTA_ACTION_FACTS, 'carlotta-basic-attack-silent-execution-containment-tactics-dmg').damageClass, 'HEAVY');

  for (const factId of [
    'carlotta-resonance-liberation-era-of-new-wave-skill-dmg',
    'carlotta-resonance-liberation-era-of-new-wave-death-knell-dmg',
    'carlotta-resonance-liberation-era-of-new-wave-fatal-finale-dmg',
    'carlotta-forte-circuit-lethal-repertoire-imminent-oblivion-dmg',
  ]) {
    assert.equal(factById(CARLOTTA_ACTION_FACTS, factId).damageClass, 'SKILL', factId);
  }

  assert.deepEqual(CARLOTTA_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [
    ['Substance', 120],
    ['Moldable Crystal', 6],
    ['Meta Vector', 4],
  ]);

  const outro = factById(CARLOTTA_ACTION_FACTS, 'carlotta-outro-closing-remark');
  assert.equal(outro.damageClass, 'OUTRO');
  assert.equal(outro.sourceFixedMotionValue, 7.942);
  assert.equal(outro.motionValueCurve ?? null, null);
  assert.equal(outro.motionValueComponents ?? null, null);
  assert.deepEqual(CARLOTTA_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
});

test('seventh-batch Tune Break facts stay at the shared-system boundary', () => {
  for (const fact of [CAMELLYA_TUNE_BREAK_FACT, CARLOTTA_TUNE_BREAK_FACT]) {
    assert.equal(fact.section, 'TUNE_BREAK', fact.factId);
    assert.equal(fact.actionKind, 'TUNE_BREAK', fact.factId);
    assert.equal(fact.actionRole, 'SHARED_SYSTEM_DAMAGE', fact.factId);
    assert.equal(fact.damageClass, 'OTHER', fact.factId);
    assert.equal(fact.scalingStat, 'SHARED_SYSTEM', fact.factId);
    assert.equal(fact.motionValue, null, fact.factId);
    assert.equal(fact.motionValueCurve ?? null, null, fact.factId);
    assert.equal(fact.motionValueComponents ?? null, null, fact.factId);
    assert.equal(fact.sourceFixedMotionValue ?? null, null, fact.factId);
    assert.equal(fact.sourceFixedMotionValueComponents ?? null, null, fact.factId);
    assert.equal(fact.hitCount, null, fact.factId);
  }
});

test('seventh Character Mechanics batch remains valid after ninth-batch coverage reaches 33 verified / 24 unstarted / 1068 facts', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.profileCount, 33);
  assert.deepEqual(audit.verifiedCharacterIds, [
    'aalto',
    'aemeath',
    'augusta',
    'baizhi',
    'brant',
    'calcharo',
    'camellya',
    'carlotta',
    'changli',
    'chisa',
    'chixia',
    'ciaccona',
    'encore',
    'iuno',
    'jianxin',
    'jinhsi',
    'jiyan',
    'lingyang',
    'lumi',
    'lupa',
    'mortefi',
    'phoebe',
    'roccia',
    'rover-havoc',
    'rover-spectro',
    'taoqi',
    'the-shorekeeper',
    'verina',
    'yangyang',
    'yinlin',
    'youhu',
    'yuanwu',
    'zhezhi',
  ]);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.equal(audit.unstartedCharacterIds.length, 24);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1068);
  assert.deepEqual(audit.structuralIssues, []);

  for (const characterId of ['camellya', 'carlotta']) {
    const raw = getCharacterPreflight(characterId, 'RAW_FACTS');
    const dps = getCharacterPreflight(characterId, 'DPS_MODEL');
    assert.ok(raw && dps, characterId);
    assert.equal(raw.checks.find((check) => check.area === 'CHARACTER_MECHANICS')?.status, 'PASS', characterId);
    assert.equal(raw.ready, true, characterId);
    assert.equal(dps.ready, false, characterId);
    assert.ok(dps.blockers.some((check) => check.area === 'ROTATION_PROFILE'), characterId);
    assert.ok(dps.blockers.some((check) => check.area === 'COMBAT_MODEL'), characterId);
  }
});
