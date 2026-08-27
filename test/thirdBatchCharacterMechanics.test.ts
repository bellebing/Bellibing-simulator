import assert from 'node:assert/strict';
import test from 'node:test';

import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  CHARACTER_MECHANIC_FACT_BY_ID,
  ENCORE_CHARACTER_MECHANICS_PROFILE,
  ENCORE_TUNE_BREAK_FACT,
  TAOQI_CHARACTER_MECHANICS_PROFILE,
  TAOQI_TUNE_BREAK_FACT,
  VERINA_CHARACTER_MECHANICS_PROFILE,
  VERINA_TUNE_BREAK_FACT,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';
import {
  ENCORE_ACTION_FACTS,
  ENCORE_CHARACTER_MECHANIC_FACTS,
  ENCORE_PASSIVE_FACTS,
  ENCORE_RESOURCE_FACTS,
  ENCORE_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/encoreRawFacts.ts';
import {
  TAOQI_ACTION_FACTS,
  TAOQI_CHARACTER_MECHANIC_FACTS,
  TAOQI_PASSIVE_FACTS,
  TAOQI_RESOURCE_FACTS,
  TAOQI_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/taoqiRawFacts.ts';
import {
  VERINA_ACTION_FACTS,
  VERINA_CHARACTER_MECHANIC_FACTS,
  VERINA_PASSIVE_FACTS,
  VERINA_RESOURCE_FACTS,
  VERINA_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/verinaRawFacts.ts';
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

test('third Character Mechanics batch promotes Taoqi, Verina and Encore only after semantic review', () => {
  for (const [characterId, profile, expectedFactCount] of [
    ['taoqi', TAOQI_CHARACTER_MECHANICS_PROFILE, 29],
    ['verina', VERINA_CHARACTER_MECHANICS_PROFILE, 32],
    ['encore', ENCORE_CHARACTER_MECHANICS_PROFILE, 33],
  ] as const) {
    assert.equal(getCharacterMechanicsProfile(characterId), profile);
    assert.equal(profile.verificationStatus, 'VERIFIED');
    assert.deepEqual(profile.coverage.map((entry) => [entry.area, entry.status]), EXPECTED_AREAS);
    assert.equal(profile.factIds.length, expectedFactCount);
    assert.match(profile.provenance.notes?.join(' ') ?? '', /CANDIDATE_ONLY|NOT_VERIFIED|no generated candidate status was promoted automatically/i);
  }

  assert.equal(TAOQI_ACTION_FACTS.length, 14);
  assert.equal(TAOQI_RESOURCE_FACTS.length, 2);
  assert.equal(TAOQI_PASSIVE_FACTS.length, 6);
  assert.equal(TAOQI_SEQUENCE_FACTS.length, 6);
  assert.equal(TAOQI_CHARACTER_MECHANIC_FACTS.length, 28);

  assert.equal(VERINA_ACTION_FACTS.length, 19);
  assert.equal(VERINA_RESOURCE_FACTS.length, 1);
  assert.equal(VERINA_PASSIVE_FACTS.length, 5);
  assert.equal(VERINA_SEQUENCE_FACTS.length, 6);
  assert.equal(VERINA_CHARACTER_MECHANIC_FACTS.length, 31);

  assert.equal(ENCORE_ACTION_FACTS.length, 21);
  assert.equal(ENCORE_RESOURCE_FACTS.length, 1);
  assert.equal(ENCORE_PASSIVE_FACTS.length, 4);
  assert.equal(ENCORE_SEQUENCE_FACTS.length, 6);
  assert.equal(ENCORE_CHARACTER_MECHANIC_FACTS.length, 32);
});

test('Taoqi preserves DEF scaling, Basic damage buckets and utility separation', () => {
  const strategicParry = factById(TAOQI_ACTION_FACTS, 'taoqi-heavy-strategic-parry');
  assert.equal(strategicParry.actionKind, 'HEAVY');
  assert.equal(strategicParry.damageClass, 'BASIC');
  assert.equal(strategicParry.scalingStat, 'DEF');

  const fortifiedDefense = factById(TAOQI_ACTION_FACTS, 'taoqi-skill-fortified-defense');
  assert.equal(fortifiedDefense.damageClass, 'SKILL');
  assert.equal(fortifiedDefense.scalingStat, 'DEF');

  const unmovable = factById(TAOQI_ACTION_FACTS, 'taoqi-liberation-unmovable');
  assert.equal(unmovable.damageClass, 'LIBERATION');
  assert.equal(unmovable.scalingStat, 'DEF');

  for (const factId of ['taoqi-forte-timed-counter-1', 'taoqi-forte-timed-counter-2', 'taoqi-forte-timed-counter-3']) {
    const fact = factById(TAOQI_ACTION_FACTS, factId);
    assert.equal(fact.damageClass, 'BASIC', factId);
    assert.equal(fact.scalingStat, 'DEF', factId);
  }

  assert.equal(TAOQI_ACTION_FACTS.some((fact) => /Damage Reduction/i.test(fact.name)), false);
  const fortifiedUtility = factById(TAOQI_PASSIVE_FACTS, 'taoqi-skill-fortified-defense-utility');
  assert.match(fortifiedUtility.effectSummary, /950\+45%/);
  assert.match(fortifiedUtility.effectSummary, /15%/);

  const caliber = TAOQI_RESOURCE_FACTS.find((fact) => fact.resourceName === 'Resolving Caliber');
  assert.equal(caliber?.maxValue, 3);
  assert.deepEqual(TAOQI_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
});

test('Verina keeps coordinated trigger semantics separate from Liberation damage classification', () => {
  const botany = factById(VERINA_ACTION_FACTS, 'verina-skill-botany-experiment');
  assert.deepEqual(botany.motionValueComponents?.map((component) => component.hitCount), [3, 1]);
  assert.deepEqual(botany.motionValueComponents?.map((component) => component.curve[0]), [.18, .36]);

  const coordinated = factById(VERINA_ACTION_FACTS, 'verina-liberation-photosynthesis-mark-coordinated');
  assert.equal(coordinated.damageClass, 'LIBERATION');
  assert.equal(coordinated.scalingStat, 'ATK');
  assert.equal(coordinated.conditional, true);
  assert.match(coordinated.notes?.join(' ') ?? '', /Coordinated/i);

  const heavyStarflower = factById(VERINA_ACTION_FACTS, 'verina-forte-starflower-heavy');
  assert.equal(heavyStarflower.damageClass, 'HEAVY');
  for (const factId of ['verina-forte-starflower-mid-air-1', 'verina-forte-starflower-mid-air-2', 'verina-forte-starflower-mid-air-3']) {
    assert.equal(factById(VERINA_ACTION_FACTS, factId).damageClass, 'BASIC', factId);
  }

  assert.equal(VERINA_RESOURCE_FACTS[0]?.resourceName, 'Photosynthesis Energy');
  assert.equal(VERINA_RESOURCE_FACTS[0]?.maxValue, 4);
  const outro = factById(VERINA_PASSIVE_FACTS, 'verina-outro-blossom');
  assert.match(outro.effectSummary, /19%.*6s/i);
  assert.match(outro.effectSummary, /15%.*30s/i);
  assert.deepEqual(VERINA_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
});

test('Encore preserves Cosmos buckets, Mayhem nomenclature provenance and fixed Outro damage', () => {
  assert.equal(ENCORE_RESOURCE_FACTS[0]?.resourceName, 'Mayhem');
  assert.equal(ENCORE_RESOURCE_FACTS[0]?.maxValue, 100);

  for (const factId of ['encore-cosmos-frolicking-1', 'encore-cosmos-frolicking-2', 'encore-cosmos-frolicking-3', 'encore-cosmos-frolicking-4', 'encore-cosmos-dodge-counter']) {
    assert.equal(factById(ENCORE_ACTION_FACTS, factId).damageClass, 'BASIC', factId);
  }
  assert.equal(factById(ENCORE_ACTION_FACTS, 'encore-cosmos-heavy-attack').damageClass, 'HEAVY');
  assert.equal(factById(ENCORE_ACTION_FACTS, 'encore-cosmos-rampage').damageClass, 'SKILL');
  assert.equal(factById(ENCORE_ACTION_FACTS, 'encore-forte-cloudy-frenzy').damageClass, 'LIBERATION');
  assert.equal(factById(ENCORE_ACTION_FACTS, 'encore-forte-cosmos-rupture').damageClass, 'LIBERATION');

  const thermalField = factById(ENCORE_ACTION_FACTS, 'encore-outro-thermal-field');
  assert.equal(thermalField.actionKind, 'OUTRO');
  assert.equal(thermalField.damageClass, 'OUTRO');
  assert.equal(thermalField.sourceFixedMotionValue, 1.7676);
  assert.equal(thermalField.motionValueCurve ?? null, null);
  assert.equal(thermalField.motionValueComponents ?? null, null);
  assert.match(thermalField.notes?.join(' ') ?? '', /every 1\.5s for 6s/i);

  const mayhemState = factById(ENCORE_PASSIVE_FACTS, 'encore-state-mayhem');
  assert.match(mayhemState.notes?.join(' ') ?? '', /Dissonance/i);
  assert.match(ENCORE_CHARACTER_MECHANICS_PROFILE.provenance.notes?.join(' ') ?? '', /nomenclature discrepancy/i);
  assert.match(factById(ENCORE_SEQUENCE_FACTS, 'encore-s6-woolies-save-the-world').effectSummary, /up to 5 times/i);
});

test('third-batch Tune Break facts stay at the shared-system boundary', () => {
  for (const fact of [TAOQI_TUNE_BREAK_FACT, VERINA_TUNE_BREAK_FACT, ENCORE_TUNE_BREAK_FACT]) {
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

test('third Character Mechanics batch advances canonical coverage to 13 verified / 44 unstarted / 413 facts', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.profileCount, 13);
  assert.deepEqual(audit.verifiedCharacterIds, ['aalto', 'aemeath', 'augusta', 'baizhi', 'brant', 'changli', 'chixia', 'encore', 'jiyan', 'mortefi', 'taoqi', 'verina', 'yangyang']);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.equal(audit.unstartedCharacterIds.length, 44);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 413);
  assert.deepEqual(audit.structuralIssues, []);

  for (const characterId of ['taoqi', 'verina', 'encore']) {
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
