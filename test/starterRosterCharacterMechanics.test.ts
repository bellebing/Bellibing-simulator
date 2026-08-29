import assert from 'node:assert/strict';
import test from 'node:test';

import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  CHIXIA_CHARACTER_MECHANICS_PROFILE,
  CHIXIA_TUNE_BREAK_FACT,
  MORTEFI_CHARACTER_MECHANICS_PROFILE,
  MORTEFI_TUNE_BREAK_FACT,
  YANGYANG_CHARACTER_MECHANICS_PROFILE,
  YANGYANG_TUNE_BREAK_FACT,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';
import {
  CHIXIA_ACTION_FACTS,
  CHIXIA_CHARACTER_MECHANIC_FACTS,
  CHIXIA_PASSIVE_FACTS,
  CHIXIA_RESOURCE_FACTS,
  CHIXIA_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/chixiaRawFacts.ts';
import {
  MORTEFI_ACTION_FACTS,
  MORTEFI_CHARACTER_MECHANIC_FACTS,
  MORTEFI_PASSIVE_FACTS,
  MORTEFI_RESOURCE_FACTS,
  MORTEFI_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/mortefiRawFacts.ts';
import {
  YANGYANG_ACTION_FACTS,
  YANGYANG_CHARACTER_MECHANIC_FACTS,
  YANGYANG_PASSIVE_FACTS,
  YANGYANG_RESOURCE_FACTS,
  YANGYANG_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/yangyangRawFacts.ts';
import { getCharacterPreflight } from '../src/data/characterPreflight.ts';

const EXPECTED_AREAS = [
  ['ACTIONS', 'VERIFIED'],
  ['FORTE_RULES', 'VERIFIED'],
  ['INHERENT_PASSIVES', 'VERIFIED'],
  ['OUTRO_EFFECT', 'VERIFIED'],
  ['RESOURCE_RULES', 'VERIFIED'],
  ['SEQUENCES', 'VERIFIED'],
] as const;

function actionById<T extends { factId: string }>(facts: readonly T[], factId: string): T {
  const fact = facts.find((entry) => entry.factId === factId);
  assert.ok(fact, factId);
  return fact;
}

test('starter roster batch promotes three complete source profiles without changing the raw/executable boundary', () => {
  for (const [characterId, profile, expectedFactCount] of [
    ['chixia', CHIXIA_CHARACTER_MECHANICS_PROFILE, 26],
    ['mortefi', MORTEFI_CHARACTER_MECHANICS_PROFILE, 26],
    ['yangyang', YANGYANG_CHARACTER_MECHANICS_PROFILE, 24],
  ] as const) {
    assert.equal(getCharacterMechanicsProfile(characterId), profile);
    assert.equal(profile.verificationStatus, 'VERIFIED');
    assert.deepEqual(profile.coverage.map((entry) => [entry.area, entry.status]), EXPECTED_AREAS);
    assert.equal(profile.factIds.length, expectedFactCount);
  }

  assert.equal(CHIXIA_ACTION_FACTS.length, 14);
  assert.equal(CHIXIA_RESOURCE_FACTS.length, 1);
  assert.equal(CHIXIA_PASSIVE_FACTS.length, 4);
  assert.equal(CHIXIA_SEQUENCE_FACTS.length, 6);
  assert.equal(CHIXIA_CHARACTER_MECHANIC_FACTS.length, 25);

  assert.equal(MORTEFI_ACTION_FACTS.length, 14);
  assert.equal(MORTEFI_RESOURCE_FACTS.length, 1);
  assert.equal(MORTEFI_PASSIVE_FACTS.length, 4);
  assert.equal(MORTEFI_SEQUENCE_FACTS.length, 6);
  assert.equal(MORTEFI_CHARACTER_MECHANIC_FACTS.length, 25);

  assert.equal(YANGYANG_ACTION_FACTS.length, 13);
  assert.equal(YANGYANG_RESOURCE_FACTS.length, 1);
  assert.equal(YANGYANG_PASSIVE_FACTS.length, 3);
  assert.equal(YANGYANG_SEQUENCE_FACTS.length, 6);
  assert.equal(YANGYANG_CHARACTER_MECHANIC_FACTS.length, 23);
});

test('Chixia keeps source-fixed Outro damage and Thermobaric Bullet semantics explicit', () => {
  const outro = actionById(CHIXIA_ACTION_FACTS, 'chixia-outro-leaping-flames');
  assert.equal(outro.actionRole, 'DAMAGE');
  assert.equal(outro.damageClass, 'OUTRO');
  assert.equal(outro.scalingStat, 'ATK');
  assert.equal(outro.sourceFixedMotionValue, 5.3);
  assert.equal(outro.motionValueCurve ?? null, null);
  assert.equal(outro.motionValueComponents ?? null, null);
  assert.equal(outro.hitCount, 1);

  const bullets = CHIXIA_RESOURCE_FACTS[0];
  assert.equal(bullets?.resourceName, 'Thermobaric Bullets');
  assert.equal(bullets?.maxValue, null);
  assert.match(bullets?.ruleSummary ?? '', /up to 60 Thermobaric Bullets/i);
  assert.match(bullets?.ruleSummary ?? '', /increases Max Thermobaric Bullets by 10/i);
  assert.match(bullets?.ruleSummary ?? '', /after 30 bullets have been fired.*Boom Boom/i);

  const conflict = CHIXIA_CHARACTER_MECHANIC_FACTS[0]?.provenance.notes?.join(' ') ?? '';
  assert.match(conflict, /Wutheringlab.*14\.67%.*200%/i);
  assert.match(conflict, /10\.00%.*220\.00%/i);
  assert.deepEqual(CHIXIA_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
});

test('Yangyang preserves source damage buckets and only the stated Melody consumption rule', () => {
  const stormy = actionById(YANGYANG_ACTION_FACTS, 'yangyang-forte-stormy-strike');
  assert.equal(stormy.damageClass, 'HEAVY');
  assert.equal(stormy.actionKind, 'FORTE');

  const feather = actionById(YANGYANG_ACTION_FACTS, 'yangyang-forte-feather-release');
  assert.equal(feather.damageClass, 'BASIC');
  assert.deepEqual(feather.motionValueComponents?.map((component) => component.hitCount), [5, 2]);

  const melodies = YANGYANG_RESOURCE_FACTS[0];
  assert.equal(melodies?.resourceName, 'Melodies');
  assert.equal(melodies?.maxValue, 3);
  assert.match(melodies?.ruleSummary ?? '', /Feather Release explicitly consumes all Melodies/i);
  assert.doesNotMatch(melodies?.ruleSummary ?? '', /Stormy Strike consumes/i);

  const outro = YANGYANG_PASSIVE_FACTS.find((fact) => fact.factId === 'yangyang-outro-whispering-breeze');
  assert.ok(outro);
  assert.equal(outro.durationSeconds, 5);
  assert.match(outro.effectSummary, /4 Resonance Energy per second for 5 seconds/i);
  assert.deepEqual(YANGYANG_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
});

test('Mortefi preserves Annoyance, Burning Rhapsody coordinated cadence and current Fury Fugue label boundary', () => {
  const annoyance = MORTEFI_RESOURCE_FACTS[0];
  assert.equal(annoyance?.resourceName, 'Annoyance');
  assert.equal(annoyance?.maxValue, 100);
  assert.match(annoyance?.ruleSummary ?? '', /For 5 seconds after casting Passionate Variation/i);
  assert.match(annoyance?.ruleSummary ?? '', /At 100 Annoyance.*Fury Fugue/i);
  assert.match(annoyance?.ruleSummary ?? '', /consumes all Annoyance/i);

  const marcato = actionById(MORTEFI_ACTION_FACTS, 'mortefi-liberation-marcato');
  assert.equal(marcato.damageClass, 'LIBERATION');
  assert.equal(marcato.conditional, true);
  assert.match(marcato.notes?.join(' ') ?? '', /Coordinated Attack/i);
  assert.match(marcato.notes?.join(' ') ?? '', /0\.35s/i);

  const fury = actionById(MORTEFI_ACTION_FACTS, 'mortefi-forte-fury-fugue');
  assert.equal(fury.damageClass, 'SKILL');
  assert.equal(fury.scalingStat, 'ATK');

  const burning = MORTEFI_PASSIVE_FACTS.find((fact) => fact.factId === 'mortefi-liberation-burning-rhapsody');
  assert.ok(burning);
  assert.equal(burning.durationSeconds, 10);
  assert.equal(burning.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(burning.effectSummary, /Basic Attack.*1 Marcato/i);
  assert.match(burning.effectSummary, /Heavy Attack.*2 Marcato/i);
  assert.match(burning.effectSummary, /0\.35 seconds/i);

  const outro = MORTEFI_PASSIVE_FACTS.find((fact) => fact.factId === 'mortefi-outro-rage-transposition');
  assert.ok(outro);
  assert.equal(outro.durationSeconds, 14);
  assert.match(outro.effectSummary, /38% Heavy Attack DMG Amplification/i);

  const provenance = MORTEFI_CHARACTER_MECHANIC_FACTS[0]?.provenance.notes?.join(' ') ?? '';
  assert.match(provenance, /Fury Fudge/i);
  assert.match(provenance, /Fury Fugue/i);
  assert.deepEqual(MORTEFI_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
});

test('starter-batch Tune Break facts stay at the shared-system boundary', () => {
  for (const fact of [CHIXIA_TUNE_BREAK_FACT, MORTEFI_TUNE_BREAK_FACT, YANGYANG_TUNE_BREAK_FACT]) {
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

test('starter roster remains verified after later Character Mechanics batches advance canonical coverage', () => {
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

  for (const characterId of ['chixia', 'mortefi', 'yangyang']) {
    const raw = getCharacterPreflight(characterId, 'RAW_FACTS');
    const dps = getCharacterPreflight(characterId, 'DPS_MODEL');
    assert.ok(raw && dps, characterId);
    assert.equal(raw.ready, true, characterId);
    assert.equal(raw.checks.find((check) => check.area === 'CHARACTER_MECHANICS')?.status, 'PASS', characterId);
    assert.equal(dps.ready, false, characterId);
    assert.ok(dps.blockers.some((check) => check.area === 'ROTATION_PROFILE'), characterId);
    assert.ok(dps.blockers.some((check) => check.area === 'COMBAT_MODEL'), characterId);
  }
});