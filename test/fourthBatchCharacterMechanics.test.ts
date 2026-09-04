import assert from 'node:assert/strict';
import test from 'node:test';

import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  CALCHARO_CHARACTER_MECHANICS_PROFILE,
  CALCHARO_TUNE_BREAK_FACT,
  CHARACTER_MECHANIC_FACT_BY_ID,
  LINGYANG_CHARACTER_MECHANICS_PROFILE,
  LINGYANG_TUNE_BREAK_FACT,
  YINLIN_CHARACTER_MECHANICS_PROFILE,
  YINLIN_TUNE_BREAK_FACT,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';
import {
  CALCHARO_ACTION_FACTS,
  CALCHARO_CHARACTER_MECHANIC_FACTS,
  CALCHARO_PASSIVE_FACTS,
  CALCHARO_RESOURCE_FACTS,
  CALCHARO_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/calcharoRawFacts.ts';
import {
  LINGYANG_ACTION_FACTS,
  LINGYANG_CHARACTER_MECHANIC_FACTS,
  LINGYANG_PASSIVE_FACTS,
  LINGYANG_RESOURCE_FACTS,
  LINGYANG_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/lingyangRawFacts.ts';
import {
  YINLIN_ACTION_FACTS,
  YINLIN_CHARACTER_MECHANIC_FACTS,
  YINLIN_PASSIVE_FACTS,
  YINLIN_RESOURCE_FACTS,
  YINLIN_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/yinlinRawFacts.ts';
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

test('fourth Character Mechanics batch promotes Yinlin, Lingyang and Calcharo only after semantic review', () => {
  for (const [characterId, profile, expectedFactCount] of [
    ['yinlin', YINLIN_CHARACTER_MECHANICS_PROFILE, 27],
    ['lingyang', LINGYANG_CHARACTER_MECHANICS_PROFILE, 32],
    ['calcharo', CALCHARO_CHARACTER_MECHANICS_PROFILE, 35],
  ] as const) {
    assert.equal(getCharacterMechanicsProfile(characterId), profile);
    assert.equal(profile.verificationStatus, 'VERIFIED');
    assert.deepEqual(profile.coverage.map((entry) => [entry.area, entry.status]), EXPECTED_AREAS);
    assert.equal(profile.factIds.length, expectedFactCount);
    assert.match(profile.provenance.notes?.join(' ') ?? '', /CANDIDATE_ONLY|NOT_VERIFIED|no generated candidate status was promoted automatically/i);
  }

  assert.equal(YINLIN_ACTION_FACTS.length, 14);
  assert.equal(YINLIN_RESOURCE_FACTS.length, 1);
  assert.equal(YINLIN_PASSIVE_FACTS.length, 5);
  assert.equal(YINLIN_SEQUENCE_FACTS.length, 6);
  assert.equal(YINLIN_CHARACTER_MECHANIC_FACTS.length, 26);

  assert.equal(LINGYANG_ACTION_FACTS.length, 20);
  assert.equal(LINGYANG_RESOURCE_FACTS.length, 1);
  assert.equal(LINGYANG_PASSIVE_FACTS.length, 4);
  assert.equal(LINGYANG_SEQUENCE_FACTS.length, 6);
  assert.equal(LINGYANG_CHARACTER_MECHANIC_FACTS.length, 31);

  assert.equal(CALCHARO_ACTION_FACTS.length, 23);
  assert.equal(CALCHARO_RESOURCE_FACTS.length, 2);
  assert.equal(CALCHARO_PASSIVE_FACTS.length, 3);
  assert.equal(CALCHARO_SEQUENCE_FACTS.length, 6);
  assert.equal(CALCHARO_CHARACTER_MECHANIC_FACTS.length, 34);
});

test('Yinlin preserves coordinated Punishment Mark triggering without losing Skill damage classification', () => {
  const judgmentStrike = factById(YINLIN_ACTION_FACTS, 'yinlin-forte-judgment-strike');
  assert.equal(judgmentStrike.damageClass, 'SKILL');
  assert.equal(judgmentStrike.scalingStat, 'ATK');
  assert.equal(judgmentStrike.conditional, true);
  assert.match(judgmentStrike.notes?.join(' ') ?? '', /coordinated/i);

  const cipher = factById(YINLIN_ACTION_FACTS, 'yinlin-forte-chameleon-cipher');
  assert.equal(cipher.damageClass, 'HEAVY');
  assert.equal(YINLIN_RESOURCE_FACTS[0]?.resourceName, 'Judgment Points');
  assert.equal(YINLIN_RESOURCE_FACTS[0]?.maxValue, 100);

  const marks = factById(YINLIN_PASSIVE_FACTS, 'yinlin-forte-marks');
  assert.equal(marks.durationSeconds, 18);
  assert.match(marks.effectSummary, /once per second/i);
  assert.match(marks.effectSummary, /Resonance Skill DMG/i);

  const s6 = factById(YINLIN_SEQUENCE_FACTS, 'yinlin-s6-pursuit-of-justice');
  assert.match(s6.effectSummary, /419\.59%/);
  assert.match(s6.effectSummary, /up to 4 times/i);
  assert.match(s6.effectSummary, /Resonance Skill DMG/i);
});

test('Lingyang preserves Striding Lion source timing, Forte damage buckets and fixed Outro damage', () => {
  assert.equal(factById(LINGYANG_ACTION_FACTS, 'lingyang-forte-glorious-plunge').damageClass, 'HEAVY');
  assert.equal(factById(LINGYANG_ACTION_FACTS, 'lingyang-forte-feral-gyrate-1').damageClass, 'BASIC');
  assert.deepEqual(factById(LINGYANG_ACTION_FACTS, 'lingyang-forte-feral-gyrate-1').motionValueComponents?.map((component) => component.hitCount), [2, 1]);
  assert.equal(factById(LINGYANG_ACTION_FACTS, 'lingyang-forte-mountain-roamer').damageClass, 'SKILL');
  assert.equal(factById(LINGYANG_ACTION_FACTS, 'lingyang-forte-stormy-kicks').damageClass, 'BASIC');

  assert.equal(LINGYANG_RESOURCE_FACTS[0]?.resourceName, "Lion's Spirit");
  assert.equal(LINGYANG_RESOURCE_FACTS[0]?.maxValue, 100);
  const state = factById(LINGYANG_PASSIVE_FACTS, 'lingyang-forte-striding-lion');
  assert.match(state.effectSummary, /5s/);
  assert.match(state.effectSummary, /up to 10s/);

  const outro = factById(LINGYANG_ACTION_FACTS, 'lingyang-outro-frosty-marks');
  assert.equal(outro.damageClass, 'OUTRO');
  assert.equal(outro.sourceFixedMotionValue, 5.8794);
  assert.equal(outro.motionValueCurve ?? null, null);
  assert.equal(outro.motionValueComponents ?? null, null);
  assert.deepEqual(LINGYANG_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
});

test('Calcharo keeps Deathblade damage buckets, gauge boundaries and mixed fixed Outro components explicit', () => {
  assert.equal(factById(CALCHARO_ACTION_FACTS, 'calcharo-deathblade-hounds-roar-1').damageClass, 'BASIC');
  assert.equal(factById(CALCHARO_ACTION_FACTS, 'calcharo-deathblade-heavy').damageClass, 'LIBERATION');
  assert.equal(factById(CALCHARO_ACTION_FACTS, 'calcharo-deathblade-dodge-counter').damageClass, 'LIBERATION');
  assert.equal(factById(CALCHARO_ACTION_FACTS, 'calcharo-forte-mercy').damageClass, 'HEAVY');
  assert.equal(factById(CALCHARO_ACTION_FACTS, 'calcharo-forte-death-messenger').damageClass, 'LIBERATION');

  assert.deepEqual(CALCHARO_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [['Cruelty', 3], ['Killing Intent', 5]]);
  assert.equal(factById(CALCHARO_PASSIVE_FACTS, 'calcharo-state-deathblade-gear').durationSeconds, 11);

  const outro = factById(CALCHARO_ACTION_FACTS, 'calcharo-outro-shadowy-raid');
  assert.equal(outro.damageClass, 'OUTRO');
  assert.deepEqual(outro.sourceFixedMotionValueComponents, [
    { coefficient: 1.9598, hitCount: 1 },
    { coefficient: 3.9196, hitCount: 1 },
  ]);
  assert.equal(outro.hitCount, null);
  assert.match(CALCHARO_CHARACTER_MECHANICS_PROFILE.provenance.notes?.join(' ') ?? '', /Wanted Outlaw.*Wanted Criminal/i);
  assert.deepEqual(CALCHARO_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
});

test('fourth-batch Tune Break facts stay at the shared-system boundary', () => {
  for (const fact of [YINLIN_TUNE_BREAK_FACT, LINGYANG_TUNE_BREAK_FACT, CALCHARO_TUNE_BREAK_FACT]) {
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

test('fourth Character Mechanics batch remains valid after later batches advance canonical coverage', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.profileCount, 54);
  assert.equal(audit.verifiedCharacterIds.length, 54);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.equal(audit.unstartedCharacterIds.length, 3);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1867);
  assert.deepEqual(audit.structuralIssues, []);

  for (const characterId of ['yinlin', 'lingyang', 'calcharo']) {
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