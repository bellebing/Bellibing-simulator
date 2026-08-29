import assert from 'node:assert/strict';
import test from 'node:test';

import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  CHISA_CHARACTER_MECHANICS_PROFILE,
  CHISA_TUNE_BREAK_FACT,
  IUNO_CHARACTER_MECHANICS_PROFILE,
  IUNO_TUNE_BREAK_FACT,
  LUPA_CHARACTER_MECHANICS_PROFILE,
  LUPA_TUNE_BREAK_FACT,
  NINTH_BATCH_CHARACTER_MECHANICS_PROFILES,
  ROVER_HAVOC_CHARACTER_MECHANICS_PROFILE,
  ROVER_HAVOC_TUNE_BREAK_FACT,
  ROVER_SPECTRO_CHARACTER_MECHANICS_PROFILE,
  ROVER_SPECTRO_TUNE_BREAK_FACT,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';
import {
  CHISA_ACTION_FACTS,
  CHISA_CHARACTER_MECHANIC_FACTS,
  CHISA_PASSIVE_FACTS,
  CHISA_RESOURCE_FACTS,
} from '../src/data/characterMechanics/chisaRawFacts.ts';
import {
  LUPA_ACTION_FACTS,
  LUPA_CHARACTER_MECHANIC_FACTS,
  LUPA_RESOURCE_FACTS,
} from '../src/data/characterMechanics/lupaRawFacts.ts';
import {
  IUNO_ACTION_FACTS,
  IUNO_CHARACTER_MECHANIC_FACTS,
  IUNO_PASSIVE_FACTS,
  IUNO_RESOURCE_FACTS,
} from '../src/data/characterMechanics/iunoRawFacts.ts';
import {
  ROVER_HAVOC_ACTION_FACTS,
  ROVER_HAVOC_CHARACTER_MECHANIC_FACTS,
  ROVER_HAVOC_RESOURCE_FACTS,
} from '../src/data/characterMechanics/roverHavocRawFacts.ts';
import {
  ROVER_SPECTRO_ACTION_FACTS,
  ROVER_SPECTRO_CHARACTER_MECHANIC_FACTS,
  ROVER_SPECTRO_PASSIVE_FACTS,
  ROVER_SPECTRO_RESOURCE_FACTS,
} from '../src/data/characterMechanics/roverSpectroRawFacts.ts';
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

test('ninth Character Mechanics batch promotes five source-clean characters only after semantic review', () => {
  const rows = [
    ['chisa', CHISA_CHARACTER_MECHANICS_PROFILE, 44],
    ['lupa', LUPA_CHARACTER_MECHANICS_PROFILE, 37],
    ['iuno', IUNO_CHARACTER_MECHANICS_PROFILE, 36],
    ['rover-havoc', ROVER_HAVOC_CHARACTER_MECHANICS_PROFILE, 34],
    ['rover-spectro', ROVER_SPECTRO_CHARACTER_MECHANICS_PROFILE, 28],
  ] as const;

  assert.equal(NINTH_BATCH_CHARACTER_MECHANICS_PROFILES.length, 5);
  for (const [characterId, profile, profileFactCount] of rows) {
    assert.equal(getCharacterMechanicsProfile(characterId), profile);
    assert.equal(profile.verificationStatus, 'VERIFIED');
    assert.deepEqual(profile.coverage.map((entry) => [entry.area, entry.status]), EXPECTED_AREAS);
    assert.equal(profile.factIds.length, profileFactCount);
    assert.match(profile.provenance.notes?.join(' ') ?? '', /CANDIDATE_ONLY|NOT_VERIFIED|no generated candidate status was promoted automatically/i);
  }

  assert.equal(CHISA_ACTION_FACTS.length, 27);
  assert.equal(LUPA_ACTION_FACTS.length, 23);
  assert.equal(IUNO_ACTION_FACTS.length, 24);
  assert.equal(ROVER_HAVOC_ACTION_FACTS.length, 23);
  assert.equal(ROVER_SPECTRO_ACTION_FACTS.length, 16);
  assert.equal(CHISA_CHARACTER_MECHANIC_FACTS.length, 43);
  assert.equal(LUPA_CHARACTER_MECHANIC_FACTS.length, 36);
  assert.equal(IUNO_CHARACTER_MECHANIC_FACTS.length, 35);
  assert.equal(ROVER_HAVOC_CHARACTER_MECHANIC_FACTS.length, 33);
  assert.equal(ROVER_SPECTRO_CHARACTER_MECHANIC_FACTS.length, 27);
});

test('Chisa preserves Liberation damage overrides and keeps per-Ring multiplier separate', () => {
  for (const factId of [
    'chisa-basic-attack-reign-of-silence-death-snip-dmg',
    'chisa-basic-attack-reign-of-silence-death-snip-additional-dmg',
    'chisa-forte-circuit-sight-of-unraveling-oblivion-sawring-blitz-stage-1-dmg',
    'chisa-forte-circuit-sight-of-unraveling-oblivion-sawring-eradication-dmg',
    'chisa-forte-circuit-sight-of-unraveling-oblivion-chainsaw-mode-dodge-counter-dmg',
  ]) {
    assert.equal(factById(CHISA_ACTION_FACTS, factId).damageClass, 'LIBERATION', factId);
  }
  assert.equal(CHISA_ACTION_FACTS.some((fact) => /bonus-dmg-multiplier-per-ring/.test(fact.factId)), false);
  const modifier = factById(CHISA_PASSIVE_FACTS, 'chisa-forte-eradication-ring-multiplier');
  assert.equal(modifier.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(modifier.effectSummary, /1\.30.*2\.59.*not pre-summed/i);
  assert.deepEqual(CHISA_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [
    ['Ring of Chainsaw', 100],
    ['Lifethread - Jetstream', 100],
  ]);
});

test('Lupa preserves trigger ownership separately from explicit damage buckets', () => {
  const firestrike = factById(LUPA_ACTION_FACTS, 'lupa-basic-attack-flaming-star-mid-air-attack-firestrike-dmg');
  assert.equal(firestrike.actionKind, 'HEAVY');
  assert.equal(firestrike.damageClass, 'HEAVY');

  for (const factId of [
    'lupa-forte-circuit-ignis-lupa-dance-with-the-wolf-dmg',
    'lupa-forte-circuit-ignis-lupa-dance-with-the-wolf-climax-dmg',
    'lupa-intro-skill-try-focusing-eh-nowhere-to-run-dmg',
  ]) {
    assert.equal(factById(LUPA_ACTION_FACTS, factId).damageClass, 'LIBERATION', factId);
  }
  assert.equal(factById(LUPA_ACTION_FACTS, 'lupa-forte-circuit-ignis-lupa-set-the-arena-ablaze-dmg').damageClass, 'SKILL');
  assert.deepEqual(LUPA_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [
    ['Wolflame', 100],
    ['Wolfaith', 2],
  ]);
});

test('Iuno preserves Liberation conversions, fixed Outro damage and healing as utility facts', () => {
  for (const factId of [
    'iuno-basic-attack-moon-steps-moonbow-basic-attack-1-dmg',
    'iuno-resonance-skill-foresight-fugue-arc-beyond-the-edge-dmg',
    'iuno-forte-circuit-ebb-and-flow-absolute-fullness-dmg',
  ]) {
    assert.equal(factById(IUNO_ACTION_FACTS, factId).damageClass, 'LIBERATION', factId);
  }
  const outro = factById(IUNO_ACTION_FACTS, 'iuno-outro-from-gloom-to-gleam');
  assert.equal(outro.actionKind, 'OUTRO');
  assert.equal(outro.sourceFixedMotionValue, 1);
  assert.match(factById(IUNO_PASSIVE_FACTS, 'iuno-forte-healing-curves').effectSummary, /97\.71.*194\.26/);
  assert.deepEqual(IUNO_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [['Sentience', 100]]);
});

test('Rover Havoc preserves Dark Surge Basic/Heavy/Skill boundaries and fixed Soundweaver', () => {
  assert.equal(factById(ROVER_HAVOC_ACTION_FACTS, 'rover-havoc-forte-circuit-umbra-eclipse-devastation-damage').damageClass, 'HEAVY');
  assert.equal(factById(ROVER_HAVOC_ACTION_FACTS, 'rover-havoc-forte-circuit-umbra-eclipse-umbra-thwackblade-damage').damageClass, 'HEAVY');
  assert.equal(factById(ROVER_HAVOC_ACTION_FACTS, 'rover-havoc-forte-circuit-umbra-eclipse-umbra-lifetaker-damage').damageClass, 'SKILL');
  assert.equal(factById(ROVER_HAVOC_ACTION_FACTS, 'rover-havoc-outro-soundweaver').sourceFixedMotionValue, 1.433);
  assert.deepEqual(ROVER_HAVOC_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [['Umbra', 100]]);
});

test('Rover Spectro keeps Forte action identity separate from Skill damage classification and non-damage Outro', () => {
  assert.equal(factById(ROVER_SPECTRO_ACTION_FACTS, 'rover-spectro-forte-circuit-world-in-a-grain-of-sand-resonating-spin-dmg').damageClass, 'SKILL');
  const echoes = factById(ROVER_SPECTRO_ACTION_FACTS, 'rover-spectro-forte-circuit-world-in-a-grain-of-sand-resonating-echoes-stage-1-dmg');
  assert.equal(echoes.actionKind, 'BASIC');
  assert.equal(echoes.damageClass, 'SKILL');
  assert.match(factById(ROVER_SPECTRO_PASSIVE_FACTS, 'rover-spectro-outro-instant').effectSummary, /NON_DAMAGE|no damage coefficient/i);
  assert.deepEqual(ROVER_SPECTRO_RESOURCE_FACTS.map((fact) => [fact.resourceName, fact.maxValue]), [['Diminutive Sound', 100]]);
});

test('ninth-batch Tune Break facts remain at the shared-system boundary', () => {
  for (const fact of [
    CHISA_TUNE_BREAK_FACT,
    LUPA_TUNE_BREAK_FACT,
    IUNO_TUNE_BREAK_FACT,
    ROVER_HAVOC_TUNE_BREAK_FACT,
    ROVER_SPECTRO_TUNE_BREAK_FACT,
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

test('ninth Character Mechanics batch remains valid as current coverage reaches 52 verified / 5 unstarted / 1787 facts', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.profileCount, 52);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.equal(audit.unstartedCharacterIds.length, 5);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1787);
  assert.deepEqual(audit.structuralIssues, []);

  for (const characterId of ['chisa', 'lupa', 'iuno', 'rover-havoc', 'rover-spectro']) {
    assert.ok(audit.verifiedCharacterIds.includes(characterId), characterId);
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
