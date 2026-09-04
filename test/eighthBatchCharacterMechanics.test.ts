import assert from 'node:assert/strict';
import test from 'node:test';

import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
} from '../src/characterMechanicsDomain.ts';
import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  CIACCONA_CHARACTER_MECHANICS_PROFILE,
  CIACCONA_TUNE_BREAK_FACT,
  JIANXIN_CHARACTER_MECHANICS_PROFILE,
  JIANXIN_TUNE_BREAK_FACT,
  JINHSI_CHARACTER_MECHANICS_PROFILE,
  JINHSI_TUNE_BREAK_FACT,
  LUMI_CHARACTER_MECHANICS_PROFILE,
  LUMI_TUNE_BREAK_FACT,
  PHOEBE_CHARACTER_MECHANICS_PROFILE,
  PHOEBE_TUNE_BREAK_FACT,
  THE_SHOREKEEPER_CHARACTER_MECHANICS_PROFILE,
  THE_SHOREKEEPER_TUNE_BREAK_FACT,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';
import { getCharacterPreflight } from '../src/data/characterPreflight.ts';

const EXPECTED_AREAS = [
  ['ACTIONS', 'VERIFIED'],
  ['FORTE_RULES', 'VERIFIED'],
  ['INHERENT_PASSIVES', 'VERIFIED'],
  ['OUTRO_EFFECT', 'VERIFIED'],
  ['RESOURCE_RULES', 'VERIFIED'],
  ['SEQUENCES', 'VERIFIED'],
] as const;

function factById(factId: string): CharacterMechanicFact {
  const fact = CHARACTER_MECHANIC_FACT_BY_ID.get(factId);
  assert.ok(fact, factId);
  return fact;
}

function actionById(factId: string): CharacterActionFact {
  const fact = factById(factId);
  assert.equal(fact.kind, 'ACTION', factId);
  return fact as CharacterActionFact;
}

function passiveById(factId: string): CharacterPassiveFact {
  const fact = factById(factId);
  assert.equal(fact.kind, 'PASSIVE', factId);
  return fact as CharacterPassiveFact;
}

function resourceById(factId: string): CharacterResourceFact {
  const fact = factById(factId);
  assert.equal(fact.kind, 'RESOURCE', factId);
  return fact as CharacterResourceFact;
}

test('eighth Character Mechanics batch promotes six source-reviewed profiles', () => {
  for (const [characterId, profile] of [
    ['ciaccona', CIACCONA_CHARACTER_MECHANICS_PROFILE],
    ['phoebe', PHOEBE_CHARACTER_MECHANICS_PROFILE],
    ['the-shorekeeper', THE_SHOREKEEPER_CHARACTER_MECHANICS_PROFILE],
    ['jianxin', JIANXIN_CHARACTER_MECHANICS_PROFILE],
    ['lumi', LUMI_CHARACTER_MECHANICS_PROFILE],
    ['jinhsi', JINHSI_CHARACTER_MECHANICS_PROFILE],
  ] as const) {
    assert.equal(getCharacterMechanicsProfile(characterId), profile);
    assert.equal(profile.verificationStatus, 'VERIFIED');
    assert.deepEqual(profile.coverage.map((entry) => [entry.area, entry.status]), EXPECTED_AREAS);
    assert.match(
      profile.provenance.notes?.join(' ') ?? '',
      /CANDIDATE_ONLY|NOT_VERIFIED|no generated candidate status was promoted automatically/i,
      characterId,
    );

    const sequences = [...CHARACTER_MECHANIC_FACT_BY_ID.values()]
      .filter((fact) => fact.characterId === characterId && fact.kind === 'SEQUENCE')
      .map((fact) => fact.kind === 'SEQUENCE' ? fact.sequence : 0)
      .sort((a, b) => a - b);
    assert.deepEqual(sequences, [1, 2, 3, 4, 5, 6], characterId);
  }
});

test('Jinhsi keeps Incarnation ownership separate from damage buckets and Incandescence math', () => {
  assert.equal(
    actionById('jinhsi-forte-circuit-luminal-synthesis-incarnation-basic-attack-1-dmg').damageClass,
    'SKILL',
  );

  for (const factId of [
    'jinhsi-forte-circuit-luminal-synthesis-incarnation-heavy-attack-dmg',
    'jinhsi-forte-circuit-luminal-synthesis-incarnation-dodge-counter-dmg',
  ]) {
    assert.equal(actionById(factId).damageClass, 'BASIC', factId);
  }

  const stella = actionById('jinhsi-forte-circuit-luminal-synthesis-illuminous-epiphany-stella-glamor-dmg');
  assert.equal(stella.damageClass, 'SKILL');
  assert.equal(stella.motionValueCurve?.[0], 1.75);
  assert.equal(stella.motionValueCurve?.[9], 3.4792);

  const incandescenceModifier = passiveById('jinhsi-forte-incandescence-damage-multiplier');
  assert.equal(incandescenceModifier.modelingStatus, 'PENDING_INTERPRETATION');
  assert.equal(incandescenceModifier.maxStacks, 50);
  assert.match(incandescenceModifier.effectSummary, /22\.40%.*44\.54%/);
  assert.match(incandescenceModifier.effectSummary, /separate.*not pre-summed/i);
  assert.equal(resourceById('jinhsi-resource-incandescence').maxValue, 50);
  assert.equal(resourceById('jinhsi-resource-unison').maxValue, 1);
});

test('Jianxin preserves the Forte Heavy Attack damage classification', () => {
  for (const factId of [
    'jianxin-forte-circuit-primordial-chi-spiral-pushing-punch-damage',
    'jianxin-forte-circuit-primordial-chi-spiral-zhoutian-progress-continuous-damage',
    'jianxin-forte-circuit-primordial-chi-spiral-minor-zhoutian-shock-damage',
    'jianxin-forte-circuit-primordial-chi-spiral-major-zhoutian-inner-shock-damage',
    'jianxin-forte-circuit-primordial-chi-spiral-major-zhoutian-outer-shock-damage',
    'jianxin-forte-circuit-primordial-chi-spiral-yielding-pull-damage',
  ]) {
    assert.equal(actionById(factId).damageClass, 'HEAVY', factId);
  }
  assert.equal(resourceById('jianxin-resource-chi').maxValue, 120);
});

test('Phoebe keeps fixed Outro damage and conditional state modifiers separate', () => {
  const refracted = actionById('phoebe-resonance-skill-to-where-light-shines-ring-of-mirrors-refracted-holy-light-dmg');
  assert.equal(refracted.section, 'RESONANCE_SKILL');
  assert.equal(refracted.damageClass, 'BASIC');

  const outro = actionById('phoebe-outro-attentive-heart-base');
  assert.equal(outro.damageClass, 'OUTRO');
  assert.equal(outro.sourceFixedMotionValue, 5.2841);
  assert.equal(outro.motionValueCurve ?? null, null);
  assert.equal(outro.motionValueComponents ?? null, null);

  assert.equal(resourceById('phoebe-resource-prayer').maxValue, 120);
  assert.equal(resourceById('phoebe-resource-divine-voice').maxValue, 60);
});

test('The Shorekeeper preserves HP-scaling Discernment and raw resource caps', () => {
  const discernment = actionById('the-shorekeeper-intro-skill-proof-of-existence-discernment-dmg');
  assert.equal(discernment.actionKind, 'INTRO');
  assert.equal(discernment.damageClass, 'LIBERATION');
  assert.equal(discernment.scalingStat, 'HP');

  assert.deepEqual([
    ['Collapsed Core', resourceById('the-shorekeeper-resource-collapsed-core').maxValue],
    ['Empirical Data', resourceById('the-shorekeeper-resource-empirical-data').maxValue],
    ['Deductive Data', resourceById('the-shorekeeper-resource-deductive-data').maxValue],
  ], [
    ['Collapsed Core', 5],
    ['Empirical Data', 5],
    ['Deductive Data', null],
  ]);
});

test('Lumi preserves Basic Attack conversions and separate Spark gauges', () => {
  const redHeavy = actionById('lumi-basic-attack-navigation-support-red-light-heavy-attack-dmg');
  assert.equal(redHeavy.actionKind, 'HEAVY');
  assert.equal(redHeavy.damageClass, 'BASIC');

  assert.equal(resourceById('lumi-resource-yellow-light-spark').maxValue, 100);
  assert.equal(resourceById('lumi-resource-red-light-spark').maxValue, 100);
});

test('Ciaccona preserves Heavy Downbeat, source resource caps and target-facing Outro', () => {
  const downbeat = actionById('ciaccona-forte-circuit-symphony-of-wind-and-verse-quadruple-downbeat-dmg');
  assert.equal(downbeat.actionKind, 'HEAVY');
  assert.equal(downbeat.damageClass, 'HEAVY');

  assert.equal(resourceById('ciaccona-resource-musical-essence').maxValue, 3);
  assert.equal(resourceById('ciaccona-resource-ensemble-sylph').maxValue, 2);

  const outro = passiveById('ciaccona-outro-windcalling-tune');
  assert.equal(outro.scope, 'TARGET');
  assert.equal(outro.durationSeconds, 30);
  assert.match(outro.effectSummary, /Aero Erosion.*100%.*30s/i);
});

test('eighth-batch Tune Break facts stay at the shared-system boundary', () => {
  for (const fact of [
    CIACCONA_TUNE_BREAK_FACT,
    PHOEBE_TUNE_BREAK_FACT,
    THE_SHOREKEEPER_TUNE_BREAK_FACT,
    JIANXIN_TUNE_BREAK_FACT,
    LUMI_TUNE_BREAK_FACT,
    JINHSI_TUNE_BREAK_FACT,
  ]) {
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

test('eighth Character Mechanics batch remains valid after later coverage reaches 54 verified / 3 unstarted / 1867 facts', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.profileCount, 54);
  assert.equal(audit.verifiedCharacterIds.length, 54);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.equal(audit.unstartedCharacterIds.length, 3);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1867);
  assert.deepEqual(audit.structuralIssues, []);

  for (const characterId of ['phoebe', 'the-shorekeeper', 'jianxin', 'lumi', 'jinhsi']) {
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

  const ciacconaRaw = getCharacterPreflight('ciaccona', 'RAW_FACTS');
  const ciacconaDps = getCharacterPreflight('ciaccona', 'DPS_MODEL');
  assert.ok(ciacconaRaw && ciacconaDps);
  assert.equal(ciacconaRaw.checks.find((check) => check.area === 'CHARACTER_MECHANICS')?.status, 'PASS');
  assert.equal(ciacconaRaw.ready, true);
  assert.equal(ciacconaDps.ready, true);
  assert.deepEqual(ciacconaDps.blockers, []);
});
