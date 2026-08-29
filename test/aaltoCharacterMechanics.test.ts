import assert from 'node:assert/strict';
import test from 'node:test';

import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  AALTO_CHARACTER_MECHANICS_PROFILE,
  AUGUSTA_CHARACTER_MECHANICS_PROFILE,
  CHARACTER_MECHANIC_FACT_BY_ID,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';
import {
  AALTO_ACTION_FACTS,
  AALTO_PASSIVE_FACTS,
  AALTO_RESOURCE_FACTS,
  AALTO_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/aaltoRawFacts.ts';
import { getCharacterPreflight } from '../src/data/characterPreflight.ts';

test('Aalto source profile covers every required mechanics area with linked verified facts', () => {
  const profile = getCharacterMechanicsProfile('aalto');
  assert.equal(profile, AALTO_CHARACTER_MECHANICS_PROFILE);
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
  assert.equal(profile?.factIds.length, 27);
});

test('Aalto damaging action facts carry exact Lv1-Lv10 source curves without selecting a talent level', () => {
  assert.equal(AALTO_ACTION_FACTS.length, 13);

  for (const fact of AALTO_ACTION_FACTS) {
    assert.equal(fact.verificationStatus, 'VERIFIED', fact.factId);
    assert.equal(fact.modelingStatus, 'MODEL_READY', fact.factId);
    assert.equal(fact.motionValue, null, fact.factId);
    assert.equal(fact.motionValueCurve?.length, 10, fact.factId);
    assert.ok(fact.motionValueCurve?.every((value) => Number.isFinite(value) && value >= 0), fact.factId);
    assert.match(fact.motionValueContext ?? '', /Lv1-Lv10/);
  }

  const basic3 = AALTO_ACTION_FACTS.find((fact) => fact.factId === 'aalto-basic-half-truths-3');
  assert.ok(basic3);
  assert.deepEqual(basic3.motionValueCurve, [.24, .2597, .2794, .307, .3266, .3493, .3808, .4122, .4437, .4772]);
  assert.equal(basic3.hitCount, 2);
  assert.match(basic3.provenance.notes?.join(' ') ?? '', /Fandom.*Lv6.*conflict/i);

  const skill = AALTO_ACTION_FACTS.find((fact) => fact.factId === 'aalto-skill-shift-trick-mist-bullet');
  assert.ok(skill);
  assert.deepEqual(skill.motionValueCurve, [.30, .3246, .3492, .3837, .4083, .4366, .4759, .5153, .5547, .5965]);
  assert.equal(skill.hitCount, 6);

  const liberation = AALTO_ACTION_FACTS.find((fact) => fact.factId === 'aalto-liberation-flower-in-the-mist');
  assert.ok(liberation);
  assert.deepEqual(liberation.motionValueCurve, [2, 2.164, 2.328, 2.5576, 2.7216, 2.9102, 3.1726, 3.435, 3.6974, 3.9762]);

  const intro = AALTO_ACTION_FACTS.find((fact) => fact.factId === 'aalto-intro-feint-shot');
  assert.ok(intro);
  assert.equal(intro.hitCount, 3);
  assert.deepEqual(intro.motionValueCurve, [.3334, .3607, .388, .4263, .4536, .4851, .5288, .5725, .6163, .6627]);
});

test('Aalto raw facts preserve Mist Drop, Gate, Outro and S1-S6 semantics without inventing execution', () => {
  assert.equal(AALTO_RESOURCE_FACTS.length, 1);
  const drops = AALTO_RESOURCE_FACTS[0];
  assert.equal(drops?.resourceName, 'Mist Drops');
  assert.equal(drops?.maxValue, 6);
  assert.match(drops?.ruleSummary ?? '', /Mistcloak Dash.*consumed/i);
  assert.match(drops?.ruleSummary ?? '', /Mist Missile/i);

  const gate = AALTO_PASSIVE_FACTS.find((fact) => fact.factId === 'aalto-liberation-gate-of-quandary');
  assert.ok(gate);
  assert.equal(gate.durationSeconds, 10);
  assert.equal(gate.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(gate.effectSummary, /10%/);
  assert.match(gate.notes?.join(' ') ?? '', /ATK increase.*increased DMG/i);

  const outro = AALTO_PASSIVE_FACTS.find((fact) => fact.factId === 'aalto-outro-dissolving-mist');
  assert.ok(outro);
  assert.equal(outro.scope, 'NEXT_CHARACTER');
  assert.equal(outro.durationSeconds, 14);
  assert.equal(outro.modelingStatus, 'MODEL_READY');
  assert.match(outro.effectSummary, /23% Aero DMG Amplification/);
  assert.match(outro.effectSummary, /switches out/);

  assert.deepEqual(AALTO_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
  assert.equal(AALTO_SEQUENCE_FACTS.every((fact) => fact.verificationStatus === 'VERIFIED'), true);
});

test('fact-backed coverage audit reports thirty-eight source-complete characters with 24 released characters unstarted', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.profileCount, 38);
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
    'denia',
    'encore',
    'hiyuki',
    'iuno',
    'jianxin',
    'jinhsi',
    'jiyan',
    'lingyang',
    'lumi',
    'lupa',
    'mortefi',
    'phoebe',
    'qingxiao',
    'roccia',
    'rover-aero',
    'rover-havoc',
    'rover-spectro',
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
  assert.equal(audit.unstartedCharacterIds.length, 19);
  assert.deepEqual(audit.structuralIssues, []);
});

test('VERIFIED ACTIONS cannot regress from source curves to selected-level parity scalars', () => {
  const factById = new Map(CHARACTER_MECHANIC_FACT_BY_ID);
  const intro = factById.get('augusta-intro-stride-of-goldenflare');
  assert.ok(intro?.kind === 'ACTION');
  factById.set(intro.factId, {
    ...intro,
    motionValue: 1.9882,
    motionValueCurve: null,
    motionValueComponents: null,
    motionValueContext: 'V9.15 selected-level parity scalar only',
    hitCount: null,
  });

  const audit = auditCharacterMechanicsCoverage([AUGUSTA_CHARACTER_MECHANICS_PROFILE], factById);
  const issues = audit.structuralIssues.map((issue) => issue.issue);

  assert.ok(issues.some((issue) => /augusta-intro-stride-of-goldenflare.*missing an exact source motion-value representation/.test(issue)));
  assert.deepEqual(audit.verifiedCharacterIds, []);
  assert.deepEqual(audit.partialCharacterIds, ['augusta']);
});

test('Aalto RAW_FACTS preflight becomes ready without claiming build or DPS readiness', () => {
  const raw = getCharacterPreflight('aalto', 'RAW_FACTS');
  const build = getCharacterPreflight('aalto', 'BUILD_PROFILE');
  const dps = getCharacterPreflight('aalto', 'DPS_MODEL');
  assert.ok(raw && build && dps);

  assert.equal(raw.ready, true);
  assert.deepEqual(raw.blockers, []);
  assert.equal(raw.checks.find((check) => check.area === 'CHARACTER_MECHANICS')?.status, 'PASS');

  assert.equal(build.ready, false);
  assert.ok(build.blockers.some((check) => check.area === 'WEAPON_PROFILE'));
  assert.equal(dps.ready, false);
  assert.ok(dps.blockers.some((check) => check.area === 'ROTATION_PROFILE'));
  assert.ok(dps.blockers.some((check) => check.area === 'COMBAT_MODEL'));
});