import assert from 'node:assert/strict';
import test from 'node:test';

import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  YOUHU_CHARACTER_MECHANICS_PROFILE,
  YOUHU_TUNE_BREAK_FACT,
  YUANWU_CHARACTER_MECHANICS_PROFILE,
  YUANWU_TUNE_BREAK_FACT,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';
import {
  YOUHU_ACTION_FACTS,
  YOUHU_CHARACTER_MECHANIC_FACTS,
  YOUHU_PASSIVE_FACTS,
  YOUHU_RESOURCE_FACTS,
  YOUHU_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/youhuRawFacts.ts';
import {
  YUANWU_ACTION_FACTS,
  YUANWU_CHARACTER_MECHANIC_FACTS,
  YUANWU_PASSIVE_FACTS,
  YUANWU_RESOURCE_FACTS,
  YUANWU_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/yuanwuRawFacts.ts';
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

test('fifth Character Mechanics batch promotes Youhu and Yuanwu only after semantic review', () => {
  for (const [characterId, profile, expectedFactCount] of [
    ['youhu', YOUHU_CHARACTER_MECHANICS_PROFILE, 30],
    ['yuanwu', YUANWU_CHARACTER_MECHANICS_PROFILE, 36],
  ] as const) {
    assert.equal(getCharacterMechanicsProfile(characterId), profile);
    assert.equal(profile.verificationStatus, 'VERIFIED');
    assert.deepEqual(profile.coverage.map((entry) => [entry.area, entry.status]), EXPECTED_AREAS);
    assert.equal(profile.factIds.length, expectedFactCount);
    assert.match(profile.provenance.notes?.join(' ') ?? '', /CANDIDATE_ONLY|NOT_VERIFIED|no generated candidate status was promoted automatically/i);
  }

  assert.equal(YOUHU_ACTION_FACTS.length, 15);
  assert.equal(YOUHU_RESOURCE_FACTS.length, 3);
  assert.equal(YOUHU_PASSIVE_FACTS.length, 5);
  assert.equal(YOUHU_SEQUENCE_FACTS.length, 6);
  assert.equal(YOUHU_CHARACTER_MECHANIC_FACTS.length, 29);

  assert.equal(YUANWU_ACTION_FACTS.length, 23);
  assert.equal(YUANWU_RESOURCE_FACTS.length, 1);
  assert.equal(YUANWU_PASSIVE_FACTS.length, 5);
  assert.equal(YUANWU_SEQUENCE_FACTS.length, 6);
  assert.equal(YUANWU_CHARACTER_MECHANIC_FACTS.length, 35);
});

test('Youhu preserves Poetic Essence Skill classification, resource limits and utility semantics', () => {
  const poetic = factById(YOUHU_ACTION_FACTS, 'youhu-forte-poetic-essence');
  assert.equal(poetic.damageClass, 'SKILL');
  assert.equal(poetic.scalingStat, 'ATK');
  assert.equal(poetic.hitCount, 10);

  assert.deepEqual(YOUHU_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [
    ['Frost', null],
    ['Antique', 1],
    ['Auspice', 4],
  ]);

  const outro = factById(YOUHU_PASSIVE_FACTS, 'youhu-outro-timeless-classics');
  assert.equal(outro.scope, 'NEXT_CHARACTER');
  assert.equal(outro.durationSeconds, 28);
  assert.match(outro.effectSummary, /100%/);
  assert.match(outro.effectSummary, /Coordinated Attack DMG/i);

  const utility = factById(YOUHU_PASSIVE_FACTS, 'youhu-forte-poetic-essence-effects');
  assert.match(utility.effectSummary, /Free Verse/i);
  assert.match(utility.effectSummary, /Antithesis/i);
  assert.match(utility.effectSummary, /Double Pun/i);
  assert.match(utility.effectSummary, /Triplet/i);
  assert.match(utility.effectSummary, /Perfect Rhyme/i);
  assert.deepEqual(YOUHU_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
});

test('Yuanwu keeps source-backed ATK/DEF scaling, coordinated trigger separation and Forte buckets', () => {
  const basic = factById(YUANWU_ACTION_FACTS, 'yuanwu-basic-leihuangquan-1');
  assert.equal(basic.scalingStat, 'ATK');
  assert.equal(basic.damageClass, 'BASIC');

  const coordinated = factById(YUANWU_ACTION_FACTS, 'yuanwu-skill-thunder-wedge-coordinated');
  assert.equal(coordinated.scalingStat, 'DEF');
  assert.equal(coordinated.damageClass, 'SKILL');
  assert.match(coordinated.notes?.join(' ') ?? '', /Coordinated/i);

  const liberation = factById(YUANWU_ACTION_FACTS, 'yuanwu-liberation-blazing-might');
  assert.equal(liberation.scalingStat, 'DEF');
  assert.equal(liberation.damageClass, 'LIBERATION');
  assert.equal(liberation.hitCount, 2);

  assert.equal(factById(YUANWU_ACTION_FACTS, 'yuanwu-forte-rumbling-spark').damageClass, 'SKILL');
  assert.equal(factById(YUANWU_ACTION_FACTS, 'yuanwu-forte-thunder-uprising').damageClass, 'SKILL');
  assert.equal(factById(YUANWU_ACTION_FACTS, 'yuanwu-forte-lightning-infused-basic-1').damageClass, 'BASIC');
  assert.equal(factById(YUANWU_ACTION_FACTS, 'yuanwu-forte-lightning-infused-heavy').damageClass, 'HEAVY');
  assert.equal(factById(YUANWU_ACTION_FACTS, 'yuanwu-forte-thunderweaver').damageClass, 'BASIC');

  assert.equal(YUANWU_RESOURCE_FACTS[0]?.resourceName, 'Readiness');
  assert.equal(YUANWU_RESOURCE_FACTS[0]?.maxValue, 100);
  assert.match(YUANWU_RESOURCE_FACTS[0]?.ruleSummary ?? '', /6 Readiness every second/i);
  assert.match(YUANWU_RESOURCE_FACTS[0]?.ruleSummary ?? '', /5 Readiness/i);

  const determination = factById(YUANWU_PASSIVE_FACTS, 'yuanwu-inherent-thunderous-determination');
  assert.match(determination.effectSummary, /40%/);
  assert.equal(YUANWU_ACTION_FACTS.some((fact) => fact.factId.includes('enhanced-thunder-uprising')), false);

  const outro = factById(YUANWU_PASSIVE_FACTS, 'yuanwu-outro-lightning-manipulation');
  assert.equal(outro.scope, 'TARGET');
  assert.match(outro.effectSummary, /Vibration Strength/i);
  assert.equal(YUANWU_ACTION_FACTS.some((fact) => fact.section === 'OUTRO_SKILL'), false);
  assert.deepEqual(YUANWU_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
});

test('fifth-batch Tune Break facts stay at the shared-system boundary', () => {
  for (const fact of [YOUHU_TUNE_BREAK_FACT, YUANWU_TUNE_BREAK_FACT]) {
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

test('fifth Character Mechanics batch remains valid after later batches advance canonical coverage', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.profileCount, 48);
  assert.deepEqual(audit.verifiedCharacterIds, [
    'aalto',
    'aemeath',
    'augusta',
    'baizhi',
    'brant',
    'calcharo',
    'camellya',
    'cantarella',
    'carlotta',
    'cartethyia',
    'changli',
    'chisa',
    'chixia',
    'ciaccona',
    'denia',
    'encore',
    'galbrena',
    'hiyuki',
    'iuno',
    'jianxin',
    'jinhsi',
    'jiyan',
    'lingyang',
    'lucilla',
    'lumi',
    'lupa',
    'lynae',
    'mornye',
    'mortefi',
    'phoebe',
    'phrolova',
    'qingxiao',
    'qiuyuan',
    'roccia',
    'rover-aero',
    'rover-havoc',
    'rover-spectro',
    'sanhua',
    'sigrika',
    'taoqi',
    'the-shorekeeper',
    'verina',
    'yangyang',
    'yangyang-xuanling',
    'yinlin',
    'youhu',
    'yuanwu',
    'zhezhi',
  ]);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.equal(audit.unstartedCharacterIds.length, 9);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1623);
  assert.deepEqual(audit.structuralIssues, []);

  for (const characterId of ['youhu', 'yuanwu']) {
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
