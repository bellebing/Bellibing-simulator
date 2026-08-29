import assert from 'node:assert/strict';
import test from 'node:test';

import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  ELEVENTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  MORNYE_CHARACTER_MECHANICS_PROFILE,
  MORNYE_TUNE_BREAK_FACT,
  PHROLOVA_CHARACTER_MECHANICS_PROFILE,
  PHROLOVA_TUNE_BREAK_FACT,
  QIUYUAN_CHARACTER_MECHANICS_PROFILE,
  QIUYUAN_TUNE_BREAK_FACT,
  SANHUA_CHARACTER_MECHANICS_PROFILE,
  SANHUA_TUNE_BREAK_FACT,
  SIGRIKA_CHARACTER_MECHANICS_PROFILE,
  SIGRIKA_TUNE_BREAK_FACT,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';
import {
  MORNYE_ACTION_FACTS,
  MORNYE_CHARACTER_MECHANIC_FACTS,
  MORNYE_RESOURCE_FACTS,
} from '../src/data/characterMechanics/mornyeRawFacts.ts';
import {
  PHROLOVA_ACTION_FACTS,
  PHROLOVA_CHARACTER_MECHANIC_FACTS,
  PHROLOVA_PASSIVE_FACTS,
  PHROLOVA_RESOURCE_FACTS,
} from '../src/data/characterMechanics/phrolovaRawFacts.ts';
import {
  QIUYUAN_ACTION_FACTS,
  QIUYUAN_CHARACTER_MECHANIC_FACTS,
  QIUYUAN_RESOURCE_FACTS,
} from '../src/data/characterMechanics/qiuyuanRawFacts.ts';
import {
  SANHUA_ACTION_FACTS,
  SANHUA_CHARACTER_MECHANIC_FACTS,
  SANHUA_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/sanhuaRawFacts.ts';
import {
  SIGRIKA_ACTION_FACTS,
  SIGRIKA_CHARACTER_MECHANIC_FACTS,
  SIGRIKA_RESOURCE_FACTS,
} from '../src/data/characterMechanics/sigrikaRawFacts.ts';
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

test('eleventh Character Mechanics batch promotes five blocker-resolved profiles only after source review', () => {
  const rows = [
    ['sanhua', SANHUA_CHARACTER_MECHANICS_PROFILE, 27],
    ['qiuyuan', QIUYUAN_CHARACTER_MECHANICS_PROFILE, 31],
    ['sigrika', SIGRIKA_CHARACTER_MECHANICS_PROFILE, 36],
    ['phrolova', PHROLOVA_CHARACTER_MECHANICS_PROFILE, 32],
    ['mornye', MORNYE_CHARACTER_MECHANICS_PROFILE, 33],
  ] as const;

  assert.equal(ELEVENTH_BATCH_CHARACTER_MECHANICS_PROFILES.length, 5);
  for (const [characterId, profile, profileFactCount] of rows) {
    assert.equal(getCharacterMechanicsProfile(characterId), profile);
    assert.equal(profile.verificationStatus, 'VERIFIED');
    assert.deepEqual(profile.coverage.map((entry) => [entry.area, entry.status]), EXPECTED_AREAS);
    assert.equal(profile.factIds.length, profileFactCount);
    assert.match(profile.provenance.notes?.join(' ') ?? '', /CANDIDATE_ONLY|NOT_VERIFIED|no candidate status was promoted automatically/i);
  }

  assert.equal(SANHUA_ACTION_FACTS.length, 15);
  assert.equal(QIUYUAN_ACTION_FACTS.length, 18);
  assert.equal(SIGRIKA_ACTION_FACTS.length, 21);
  assert.equal(PHROLOVA_ACTION_FACTS.length, 18);
  assert.equal(MORNYE_ACTION_FACTS.length, 19);
  assert.equal(SANHUA_CHARACTER_MECHANIC_FACTS.length, 26);
  assert.equal(QIUYUAN_CHARACTER_MECHANIC_FACTS.length, 30);
  assert.equal(SIGRIKA_CHARACTER_MECHANIC_FACTS.length, 35);
  assert.equal(PHROLOVA_CHARACTER_MECHANIC_FACTS.length, 31);
  assert.equal(MORNYE_CHARACTER_MECHANIC_FACTS.length, 32);
});

test('raw Character damage taxonomy represents source-explicit Echo and Tune Rupture buckets without coercing them to OTHER', () => {
  const echoFacts = [
    factById(QIUYUAN_ACTION_FACTS, 'qiuyuan-resonance-skill-through-the-groves-skill-dmg'),
    factById(QIUYUAN_ACTION_FACTS, 'qiuyuan-resonance-liberation-sundering-strike-skill-dmg'),
    factById(SIGRIKA_ACTION_FACTS, 'sigrika-resonance-skill-royan-close-quarters-combat-big-boomy-boom-dmg'),
    factById(PHROLOVA_ACTION_FACTS, 'phrolova-resonance-liberation-waltz-of-forsaken-depths-basic-attack-hecate-stage-1-dmg'),
  ];
  for (const fact of echoFacts) assert.equal(fact.damageClass, 'ECHO', fact.factId);
  assert.equal(factById(MORNYE_ACTION_FACTS, 'mornye-forte-circuit-mass-energy-equivalence-tune-rupture-response-particle-jet-dmg').damageClass, 'TUNE_RUPTURE');
  assert.equal(echoFacts.some((fact) => fact.damageClass === 'OTHER'), false);
});

test('Qiuyuan separates Echo Skill cast identity from Heavy Attack damage classification', () => {
  assert.equal(factById(QIUYUAN_ACTION_FACTS, 'qiuyuan-resonance-skill-through-the-groves-undaunted-wayfarer-dmg').damageClass, 'ECHO');
  assert.equal(factById(QIUYUAN_ACTION_FACTS, 'qiuyuan-forte-circuit-verdant-edge-thus-spoke-the-blade-to-teach-dmg').damageClass, 'HEAVY');
  assert.equal(factById(QIUYUAN_ACTION_FACTS, 'qiuyuan-forte-circuit-verdant-edge-thus-spoke-the-blade-to-sacrifice-dmg').damageClass, 'HEAVY');
  const outro = factById(QIUYUAN_ACTION_FACTS, 'qiuyuan-outro-strike-before-ready-dmg');
  assert.equal(outro.damageClass, 'ECHO');
  assert.equal(outro.sourceFixedMotionValue, 1);
  assert.deepEqual(QIUYUAN_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [["Swordster's Soliloquy", 600]]);
});

test('Sigrika preserves ordinary versus Echo Skill damage buckets and fixed Outro separately', () => {
  assert.equal(factById(SIGRIKA_ACTION_FACTS, 'sigrika-resonance-skill-royan-close-quarters-combat-boomy-boom-dmg').damageClass, 'SKILL');
  assert.equal(factById(SIGRIKA_ACTION_FACTS, 'sigrika-resonance-skill-royan-close-quarters-combat-big-boomy-boom-dmg').damageClass, 'ECHO');
  assert.equal(factById(SIGRIKA_ACTION_FACTS, 'sigrika-forte-circuit-within-infinity-s-embrace-heavy-attack-schemata-of-runes-dmg').damageClass, 'ECHO');
  const outro = factById(SIGRIKA_ACTION_FACTS, 'sigrika-outro-in-this-very-moment-dmg');
  assert.equal(outro.sourceFixedMotionValue, 7.95);
  assert.equal(outro.damageClass, 'OUTRO');
  assert.deepEqual(SIGRIKA_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [
    ['Rune', 4],
    ['Full Stop', 100],
    ['Soliskin Vitality', 60],
    ['Innate Gift?', 2],
  ]);
});

test('Phrolova keeps Scarlet Coda Skill classification, Hecate Echo classification and Aftersound modifier out of ACTION damage', () => {
  const scarlet = factById(PHROLOVA_ACTION_FACTS, 'phrolova-basic-attack-movement-of-life-and-death-scarlet-coda-dmg');
  assert.equal(scarlet.actionKind, 'HEAVY');
  assert.equal(scarlet.damageClass, 'SKILL');
  for (const id of [
    'phrolova-resonance-liberation-waltz-of-forsaken-depths-basic-attack-hecate-stage-1-dmg',
    'phrolova-resonance-liberation-waltz-of-forsaken-depths-enhanced-attack-hecate-cadenza-dmg',
  ]) assert.equal(factById(PHROLOVA_ACTION_FACTS, id).damageClass, 'ECHO', id);
  assert.equal(PHROLOVA_ACTION_FACTS.some((fact) => fact.factId === 'phrolova-forte-aftersound-scarlet-coda-modifier'), false);
  const modifier = factById(PHROLOVA_PASSIVE_FACTS, 'phrolova-forte-aftersound-scarlet-coda-modifier');
  assert.equal(modifier.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(modifier.effectSummary, /not standalone damage/i);
  assert.deepEqual(PHROLOVA_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [['Aftersound', 24], ['Volatile Note', 6]]);
});

test('Mornye keeps Syntony Liberation damage separate from Particle Jet Tune Rupture damage', () => {
  assert.equal(factById(MORNYE_ACTION_FACTS, 'mornye-forte-circuit-mass-energy-equivalence-syntony-field-dmg').damageClass, 'LIBERATION');
  const jet = factById(MORNYE_ACTION_FACTS, 'mornye-forte-circuit-mass-energy-equivalence-tune-rupture-response-particle-jet-dmg');
  assert.equal(jet.damageClass, 'TUNE_RUPTURE');
  assert.equal(jet.scalingStat, 'TUNE_AMP');
  assert.deepEqual(MORNYE_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [['Rest Mass Energy', 100], ['Relative Momentum', 100]]);
});

test('Sanhua current S2 is canonical 10s while stale pinned 5s stays discrepancy provenance only', () => {
  const s2 = factById(SANHUA_SEQUENCE_FACTS, 'sanhua-s2-snowy-clarity');
  assert.match(s2.effectSummary, /10s/i);
  assert.doesNotMatch(s2.effectSummary, /for 5s/i);
  assert.match(s2.effectSummary, /pinned.*5s|stale.*5s|discrepancy/i);
  assert.equal(factById(SANHUA_ACTION_FACTS, 'sanhua-forte-circuit-clarity-of-mind-detonate-damage').damageClass, 'HEAVY');
  assert.equal(factById(SANHUA_ACTION_FACTS, 'sanhua-forte-circuit-clarity-of-mind-glacier-burst-damage').damageClass, 'SKILL');
});

test('eleventh-batch Tune Break facts remain shared-system damage and do not inherit Echo/Tune Rupture Character coefficients', () => {
  for (const fact of [
    SANHUA_TUNE_BREAK_FACT,
    QIUYUAN_TUNE_BREAK_FACT,
    SIGRIKA_TUNE_BREAK_FACT,
    PHROLOVA_TUNE_BREAK_FACT,
    MORNYE_TUNE_BREAK_FACT,
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

test('eleventh batch remains valid after canonical Character Mechanics coverage advances to 54 verified / 3 unstarted / 1866 facts', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.profileCount, 54);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.equal(audit.unstartedCharacterIds.length, 3);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1866);
  assert.deepEqual(audit.structuralIssues, []);

  for (const characterId of ['sanhua', 'qiuyuan', 'sigrika', 'phrolova', 'mornye']) {
    assert.ok(audit.verifiedCharacterIds.includes(characterId), characterId);
    const raw = getCharacterPreflight(characterId, 'RAW_FACTS');
    const dps = getCharacterPreflight(characterId, 'DPS_MODEL');
    assert.ok(raw && dps, characterId);
    assert.equal(raw.checks.find((check) => check.area === 'CHARACTER_MECHANICS')?.status, 'PASS', characterId);
    assert.equal(dps.ready, false, characterId);
  }
});
