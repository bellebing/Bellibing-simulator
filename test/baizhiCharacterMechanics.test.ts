import assert from 'node:assert/strict';
import test from 'node:test';

import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  BAIZHI_CHARACTER_MECHANICS_PROFILE,
  BAIZHI_TUNE_BREAK_FACT,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';
import {
  BAIZHI_ACTION_FACTS,
  BAIZHI_CHARACTER_MECHANIC_FACTS,
  BAIZHI_PASSIVE_FACTS,
  BAIZHI_RESOURCE_FACTS,
  BAIZHI_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/baizhiRawFacts.ts';
import { getCharacterPreflight } from '../src/data/characterPreflight.ts';

function actionFact(factId: string) {
  const fact = BAIZHI_ACTION_FACTS.find((entry) => entry.factId === factId);
  assert.ok(fact, factId);
  return fact;
}

test('Baizhi source profile covers all six required mechanics areas plus current Tune Break', () => {
  const profile = getCharacterMechanicsProfile('baizhi');
  assert.equal(profile, BAIZHI_CHARACTER_MECHANICS_PROFILE);
  assert.equal(profile?.verificationStatus, 'VERIFIED');
  assert.deepEqual(
    profile?.coverage.map((entry) => [entry.area, entry.status]),
    [
      ['ACTIONS', 'VERIFIED'],
      ['FORTE_RULES', 'VERIFIED'],
      ['INHERENT_PASSIVES', 'VERIFIED'],
      ['OUTRO_EFFECT', 'VERIFIED'],
      ['RESOURCE_RULES', 'VERIFIED'],
      ['SEQUENCES', 'VERIFIED'],
    ],
  );
  assert.equal(BAIZHI_ACTION_FACTS.length, 10);
  assert.equal(BAIZHI_RESOURCE_FACTS.length, 1);
  assert.equal(BAIZHI_PASSIVE_FACTS.length, 8);
  assert.equal(BAIZHI_SEQUENCE_FACTS.length, 6);
  assert.equal(BAIZHI_CHARACTER_MECHANIC_FACTS.length, 25);
  assert.equal(profile?.factIds.length, 26);
});

test('Baizhi damage facts preserve source scaling, hit shape and Lv1-Lv10 curves', () => {
  const basic3 = actionFact('baizhi-basic-destined-promise-3');
  assert.equal(basic3.scalingStat, 'ATK');
  assert.equal(basic3.damageClass, 'BASIC');
  assert.equal(basic3.hitCount, 7);
  assert.deepEqual(basic3.motionValueCurve, [.0659, .0713, .0767, .0843, .0897, .0959, .1045, .1132, .1218, .131]);

  const skill = actionFact('baizhi-skill-emergency-plan-damage');
  assert.equal(skill.scalingStat, 'HP');
  assert.equal(skill.damageClass, 'SKILL');
  assert.deepEqual(skill.motionValueCurve, [.0802, .0868, .0934, .1026, .1091, .1167, .1272, .1377, .1482, .1594]);

  const remnants = actionFact('baizhi-liberation-remnant-entities-damage');
  assert.equal(remnants.scalingStat, 'HP');
  assert.equal(remnants.damageClass, 'LIBERATION');
  assert.equal(remnants.conditional, true);
  assert.deepEqual(remnants.motionValueCurve, [.0205, .0222, .0239, .0262, .0279, .0298, .0325, .0352, .0379, .0407]);
  assert.match(remnants.notes?.join(' ') ?? '', /Coordinated.*LIBERATION/i);

  const intro = actionFact('baizhi-intro-overflowing-frost-damage');
  assert.equal(intro.scalingStat, 'ATK');
  assert.equal(intro.damageClass, 'INTRO');
  assert.deepEqual(intro.motionValueCurve, [.4, .4328, .4656, .5116, .5444, .5821, .6346, .687, .7395, .7953]);
});

test('Baizhi healing and Concentration remain raw utility semantics instead of damage-field reuse', () => {
  const concentration = BAIZHI_RESOURCE_FACTS[0];
  assert.equal(concentration?.resourceName, 'Concentration');
  assert.equal(concentration?.maxValue, 4);
  assert.match(concentration?.ruleSummary ?? '', /gains 1 Concentration.*Basic Attack/i);
  assert.match(concentration?.ruleSummary ?? '', /consumes all Concentration/i);

  const emergencyHealing = BAIZHI_PASSIVE_FACTS.find((fact) => fact.factId === 'baizhi-skill-emergency-plan-healing');
  assert.ok(emergencyHealing);
  assert.match(emergencyHealing.effectSummary, /575\+2\.90%/);
  assert.match(emergencyHealing.effectSummary, /1144\+5\.76%/);

  const concentrationHealing = BAIZHI_PASSIVE_FACTS.find((fact) => fact.factId === 'baizhi-forte-concentration-consumption');
  assert.ok(concentrationHealing);
  assert.equal(concentrationHealing.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(concentrationHealing.effectSummary, /63\+0\.31%/);
  assert.match(concentrationHealing.effectSummary, /4 Concerto Energy/);
  assert.match(concentrationHealing.effectSummary, /8 Concerto Energy/);
  assert.match(concentrationHealing.notes?.join(' ') ?? '', /per consumed Concentration.*consuming cast/i);

  const provenance = emergencyHealing.provenance.notes?.join(' ') ?? '';
  assert.match(provenance, /5\.76%.*5\.77%/);
  assert.match(provenance, /0\.75%.*0\.76%/);
  assert.match(provenance, /0\.31%.*0\.32%/);
});

test('Baizhi Tune Break is explicit shared-system damage with no fabricated Character multiplier', () => {
  assert.equal(BAIZHI_TUNE_BREAK_FACT.section, 'TUNE_BREAK');
  assert.equal(BAIZHI_TUNE_BREAK_FACT.actionKind, 'TUNE_BREAK');
  assert.equal(BAIZHI_TUNE_BREAK_FACT.actionRole, 'SHARED_SYSTEM_DAMAGE');
  assert.equal(BAIZHI_TUNE_BREAK_FACT.damageClass, 'OTHER');
  assert.equal(BAIZHI_TUNE_BREAK_FACT.scalingStat, 'SHARED_SYSTEM');
  assert.equal(BAIZHI_TUNE_BREAK_FACT.motionValue, null);
  assert.equal(BAIZHI_TUNE_BREAK_FACT.motionValueCurve ?? null, null);
  assert.equal(BAIZHI_TUNE_BREAK_FACT.motionValueComponents ?? null, null);
  assert.equal(BAIZHI_TUNE_BREAK_FACT.hitCount, null);
  assert.match(BAIZHI_TUNE_BREAK_FACT.motionValueContext ?? '', /shared Tune Break combat-system damage/i);
});

test('Baizhi Inherents, Outro and exact S1-S6 stay source-verified without executable uptime guesses', () => {
  const harmonic = BAIZHI_PASSIVE_FACTS.find((fact) => fact.factId === 'baizhi-inherent-harmonic-range');
  assert.ok(harmonic);
  assert.equal(harmonic.durationSeconds, 20);
  assert.match(harmonic.effectSummary, /15% ATK.*20s/i);
  assert.match(harmonic.notes?.join(' ') ?? '', /15s.*20s/i);

  const outro = BAIZHI_PASSIVE_FACTS.find((fact) => fact.factId === 'baizhi-outro-rejuvinating-flow');
  assert.ok(outro);
  assert.equal(outro.durationSeconds, 30);
  assert.equal(outro.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(outro.effectSummary, /1\.54%.*every 3s.*30s/i);
  assert.match(outro.effectSummary, /15%.*6s/i);

  assert.deepEqual(BAIZHI_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
  assert.match(BAIZHI_SEQUENCE_FACTS[0]?.effectSummary ?? '', /2\.5 Resonance Energy.*every 1 Concentration/i);
  assert.match(BAIZHI_SEQUENCE_FACTS[3]?.effectSummary ?? '', /2 additional times.*20%.*1\.20%/i);
  assert.match(BAIZHI_SEQUENCE_FACTS[4]?.effectSummary ?? '', /100%.*10 minutes/i);
  assert.match(BAIZHI_SEQUENCE_FACTS[5]?.effectSummary ?? '', /Glacio DMG Bonus.*12%.*20s/i);
});

test('Baizhi RAW_FACTS preflight passes while broad roster mechanics remains incomplete', () => {
  const raw = getCharacterPreflight('baizhi', 'RAW_FACTS');
  assert.ok(raw);
  assert.equal(raw.ready, true);
  assert.deepEqual(raw.blockers, []);
  assert.equal(raw.checks.find((check) => check.area === 'CHARACTER_MECHANICS')?.status, 'PASS');

  const audit = auditCharacterMechanicsCoverage();
  assert.deepEqual(audit.verifiedCharacterIds, ['aalto', 'aemeath', 'augusta', 'baizhi', 'brant', 'calcharo', 'camellya', 'carlotta', 'changli', 'chixia', 'encore', 'jiyan', 'lingyang', 'mortefi', 'roccia', 'taoqi', 'verina', 'yangyang', 'yinlin', 'youhu', 'yuanwu', 'zhezhi']);
  assert.equal(audit.unstartedCharacterIds.length, 35);
  assert.deepEqual(audit.structuralIssues, []);
});