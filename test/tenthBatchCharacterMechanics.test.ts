import assert from 'node:assert/strict';
import test from 'node:test';

import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  DENIA_CHARACTER_MECHANICS_PROFILE,
  DENIA_TUNE_BREAK_FACT,
  HIYUKI_CHARACTER_MECHANICS_PROFILE,
  HIYUKI_TUNE_BREAK_FACT,
  QINGXIAO_CHARACTER_MECHANICS_PROFILE,
  QINGXIAO_TUNE_BREAK_FACT,
  ROVER_AERO_CHARACTER_MECHANICS_PROFILE,
  ROVER_AERO_TUNE_BREAK_FACT,
  TENTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  YANGYANG_XUANLING_CHARACTER_MECHANICS_PROFILE,
  YANGYANG_XUANLING_TUNE_BREAK_FACT,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';
import {
  DENIA_ACTION_FACTS,
  DENIA_CHARACTER_MECHANIC_FACTS,
  DENIA_RESOURCE_FACTS,
} from '../src/data/characterMechanics/deniaRawFacts.ts';
import {
  HIYUKI_ACTION_FACTS,
  HIYUKI_CHARACTER_MECHANIC_FACTS,
  HIYUKI_PASSIVE_FACTS,
  HIYUKI_RESOURCE_FACTS,
} from '../src/data/characterMechanics/hiyukiRawFacts.ts';
import {
  QINGXIAO_ACTION_FACTS,
  QINGXIAO_CHARACTER_MECHANIC_FACTS,
  QINGXIAO_RESOURCE_FACTS,
} from '../src/data/characterMechanics/qingxiaoRawFacts.ts';
import {
  ROVER_AERO_ACTION_FACTS,
  ROVER_AERO_CHARACTER_MECHANIC_FACTS,
  ROVER_AERO_PASSIVE_FACTS,
  ROVER_AERO_RESOURCE_FACTS,
} from '../src/data/characterMechanics/roverAeroRawFacts.ts';
import {
  YANGYANG_XUANLING_ACTION_FACTS,
  YANGYANG_XUANLING_CHARACTER_MECHANIC_FACTS,
  YANGYANG_XUANLING_RESOURCE_FACTS,
} from '../src/data/characterMechanics/yangyangXuanlingRawFacts.ts';
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

test('tenth Character Mechanics batch promotes five source-clean characters only after semantic review', () => {
  const rows = [
    ['denia', DENIA_CHARACTER_MECHANICS_PROFILE, 45],
    ['hiyuki', HIYUKI_CHARACTER_MECHANICS_PROFILE, 41],
    ['qingxiao', QINGXIAO_CHARACTER_MECHANICS_PROFILE, 38],
    ['rover-aero', ROVER_AERO_CHARACTER_MECHANICS_PROFILE, 28],
    ['yangyang-xuanling', YANGYANG_XUANLING_CHARACTER_MECHANICS_PROFILE, 41],
  ] as const;

  assert.equal(TENTH_BATCH_CHARACTER_MECHANICS_PROFILES.length, 5);
  for (const [characterId, profile, profileFactCount] of rows) {
    assert.equal(getCharacterMechanicsProfile(characterId), profile);
    assert.equal(profile.verificationStatus, 'VERIFIED');
    assert.deepEqual(profile.coverage.map((entry) => [entry.area, entry.status]), EXPECTED_AREAS);
    assert.equal(profile.factIds.length, profileFactCount);
    assert.match(profile.provenance.notes?.join(' ') ?? '', /CANDIDATE_ONLY|NOT_VERIFIED|no candidate status was promoted automatically/i);
  }

  assert.equal(DENIA_ACTION_FACTS.length, 27);
  assert.equal(HIYUKI_ACTION_FACTS.length, 24);
  assert.equal(QINGXIAO_ACTION_FACTS.length, 21);
  assert.equal(ROVER_AERO_ACTION_FACTS.length, 16);
  assert.equal(YANGYANG_XUANLING_ACTION_FACTS.length, 28);
  assert.equal(DENIA_CHARACTER_MECHANIC_FACTS.length, 44);
  assert.equal(HIYUKI_CHARACTER_MECHANIC_FACTS.length, 40);
  assert.equal(QINGXIAO_CHARACTER_MECHANIC_FACTS.length, 37);
  assert.equal(ROVER_AERO_CHARACTER_MECHANIC_FACTS.length, 27);
  assert.equal(YANGYANG_XUANLING_CHARACTER_MECHANIC_FACTS.length, 40);
});

test('Denia keeps base ownership separate from conditional Void Particle Liberation override', () => {
  const base = factById(DENIA_ACTION_FACTS, 'denia-basic-attack-dreamweaver-s-banquet-basic-attack-breakdown-form-stage-3-dmg');
  assert.equal(base.actionKind, 'BASIC');
  assert.equal(base.damageClass, 'BASIC');
  const banish = factById(DENIA_ACTION_FACTS, 'denia-resonance-skill-bubbles-and-baits-banish-breakdown-form-stage-2-dmg');
  assert.equal(banish.damageClass, 'LIBERATION');
  assert.deepEqual(DENIA_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [
    ['Dark Core', 3],
    ['Void Particle', 100],
    ['Conformal Charge', 100],
  ]);
});

test('Hiyuki keeps Glacio Bite and the Snowforged modifier out of Character ACTION damage', () => {
  assert.equal(HIYUKI_ACTION_FACTS.some((fact) => /increase-per-snowforged-blade/i.test(fact.factId)), false);
  assert.equal(factById(HIYUKI_ACTION_FACTS, 'hiyuki-intro-skill-frostedge-skill-dmg').damageClass, 'LIBERATION');
  assert.equal(factById(HIYUKI_ACTION_FACTS, 'hiyuki-forte-circuit-everfrost-dominion-basic-attack-iai-dmg').damageClass, 'LIBERATION');
  const modifier = factById(HIYUKI_PASSIVE_FACTS, 'hiyuki-forte-blade-liberation-snowforged-modifier');
  assert.equal(modifier.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(modifier.effectSummary, /not standalone damage/i);
  const bite = factById(HIYUKI_PASSIVE_FACTS, 'hiyuki-forte-glacio-bite-and-fine-snow');
  assert.equal(bite.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(bite.effectSummary, /Negative-Status\/system damage mechanic/i);
  assert.deepEqual(HIYUKI_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [
    ['Dedication', 300],
    ['Frostheart', 300],
    ['Frostharden Iai', 3],
    ['Whiteout Bitterfrost', 3],
    ['Snowforged Blade', 3],
  ]);
});

test('Qingxiao preserves gauges, Mindlock state and source-fixed Outro damage', () => {
  const outro = factById(QINGXIAO_ACTION_FACTS, 'qingxiao-outro-lingering-song');
  assert.equal(outro.actionKind, 'OUTRO');
  assert.equal(outro.damageClass, 'OUTRO');
  assert.equal(outro.sourceFixedMotionValue, 8);
  assert.deepEqual(QINGXIAO_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [
    ['Qin Heart', 100],
    ['Sword Cadence', 100],
    ['Heart Sword Intent', 100],
  ]);
});

test('Rover Aero keeps Cloudburst ownership separate from Skill damage and preserves utility healing raw', () => {
  const cloudburst = factById(ROVER_AERO_ACTION_FACTS, 'rover-aero-forte-circuit-cycle-of-wind-cloudburst-dance-stage-1-dmg');
  assert.equal(cloudburst.actionKind, 'BASIC');
  assert.equal(cloudburst.damageClass, 'SKILL');
  assert.deepEqual(ROVER_AERO_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [['Windstrings', 120]]);
  assert.match(factById(ROVER_AERO_PASSIVE_FACTS, 'rover-aero-utility-healing-curves').effectSummary, /1100.*2090.*330.*627/);
  assert.match(factById(ROVER_AERO_PASSIVE_FACTS, 'rover-aero-outro-storms-echo').effectSummary, /Aero Erosion.*3.*10s/i);
});

test('Yangyang Xuanling preserves Heavy Attack overrides and fixed Outro separately from Tonal Switch', () => {
  for (const factId of [
    'yangyang-xuanling-resonance-skill-feather-s-edge-sword-stance-switch-feather',
    'yangyang-xuanling-resonance-liberation-hush-of-a-thousand-voices-hush-of-a-thousand-voices',
    'yangyang-xuanling-forte-circuit-the-way-of-ten-thousand-voices-feather-sword-stance-enhanced-plunging-attack',
    'yangyang-xuanling-forte-circuit-the-way-of-ten-thousand-voices-havoc-in-bloom-stage-1',
  ]) {
    assert.equal(factById(YANGYANG_XUANLING_ACTION_FACTS, factId).damageClass, 'HEAVY', factId);
  }
  const outro = factById(YANGYANG_XUANLING_ACTION_FACTS, 'yangyang-xuanling-outro-as-the-wind-wills');
  assert.equal(outro.sourceFixedMotionValue, 3);
  assert.match(outro.notes?.join(' ') ?? '', /Tonal Switch/i);
  assert.deepEqual(YANGYANG_XUANLING_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [
    ['Melody', 100],
    ['Azure Plume', 2],
  ]);
});

test('tenth-batch Tune Break facts remain at the shared-system boundary', () => {
  for (const fact of [
    DENIA_TUNE_BREAK_FACT,
    HIYUKI_TUNE_BREAK_FACT,
    QINGXIAO_TUNE_BREAK_FACT,
    ROVER_AERO_TUNE_BREAK_FACT,
    YANGYANG_XUANLING_TUNE_BREAK_FACT,
  ]) {
    assert.equal(fact.section, 'TUNE_BREAK', fact.factId);
    assert.equal(fact.actionRole, 'SHARED_SYSTEM_DAMAGE', fact.factId);
    assert.equal(fact.damageClass, 'OTHER', fact.factId);
    assert.equal(fact.scalingStat, 'SHARED_SYSTEM', fact.factId);
    assert.equal(fact.motionValue, null, fact.factId);
    assert.equal(fact.motionValueCurve ?? null, null, fact.factId);
    assert.equal(fact.motionValueComponents ?? null, null, fact.factId);
    assert.equal(fact.sourceFixedMotionValue ?? null, null, fact.factId);
    assert.equal(fact.hitCount, null, fact.factId);
  }
});

test('tenth Character Mechanics batch remains valid as current coverage reaches 54 verified / 3 unstarted / 1868 facts', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.profileCount, 54);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.equal(audit.unstartedCharacterIds.length, 3);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1868);
  assert.deepEqual(audit.structuralIssues, []);

  for (const characterId of ['denia', 'hiyuki', 'qingxiao', 'rover-aero', 'yangyang-xuanling']) {
    assert.ok(audit.verifiedCharacterIds.includes(characterId), characterId);
    const raw = getCharacterPreflight(characterId, 'RAW_FACTS');
    const dps = getCharacterPreflight(characterId, 'DPS_MODEL');
    assert.ok(raw && dps, characterId);
    assert.equal(raw.checks.find((check) => check.area === 'CHARACTER_MECHANICS')?.status, 'PASS', characterId);
    if (characterId === 'qingxiao') {
      assert.equal(raw.ready, false, characterId);
      assert.ok(raw.blockers.some((check) => check.area === 'IDENTITY_LEVEL90' && check.status === 'PENDING'), characterId);
    } else {
      assert.equal(raw.ready, true, characterId);
    }
    assert.equal(dps.ready, false, characterId);
    assert.ok(dps.blockers.some((check) => check.area === 'ROTATION_PROFILE'), characterId);
    assert.ok(dps.blockers.some((check) => check.area === 'COMBAT_MODEL'), characterId);
  }
});
