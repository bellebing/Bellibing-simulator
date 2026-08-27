import assert from 'node:assert/strict';
import test from 'node:test';

import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  AALTO_ACTION_FACTS,
  AALTO_CHARACTER_MECHANIC_FACTS,
  AALTO_PASSIVE_FACTS,
  AALTO_RESOURCE_FACTS,
  AALTO_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/aaltoRawFacts.ts';
import {
  AALTO_CHARACTER_MECHANICS_PROFILE,
  AUGUSTA_CHARACTER_MECHANICS_PROFILE,
  CHARACTER_MECHANIC_FACT_BY_ID,
  getCharacterMechanicsProfile,
} from '../src/data/characterMechanics.ts';
import { getCharacterPreflight } from '../src/data/characterPreflight.ts';

function actionFact(factId: string) {
  const fact = AALTO_ACTION_FACTS.find((entry) => entry.factId === factId);
  assert.ok(fact, factId);
  return fact;
}

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
  assert.equal(AALTO_ACTION_FACTS.length, 13);
  assert.equal(AALTO_RESOURCE_FACTS.length, 1);
  assert.equal(AALTO_PASSIVE_FACTS.length, 6);
  assert.equal(AALTO_SEQUENCE_FACTS.length, 6);
  assert.equal(AALTO_CHARACTER_MECHANIC_FACTS.length, 26);
  assert.equal(profile?.factIds.length, 27);
});

test('Aalto damaging action facts carry exact Lv1-Lv10 source curves without selecting a talent level', () => {
  const basic1 = actionFact('aalto-basic-half-truths-1');
  assert.equal(basic1.actionRole, 'DAMAGE');
  assert.equal(basic1.damageClass, 'BASIC');
  assert.equal(basic1.hitCount, 1);
  assert.deepEqual(basic1.motionValueCurve, [.16, .1732, .1863, .2047, .2178, .2329, .2539, .2749, .2959, .3182]);
  assert.equal(basic1.motionValue, null);

  const basic3 = actionFact('aalto-basic-half-truths-3');
  assert.equal(basic3.hitCount, 2);
  assert.deepEqual(basic3.motionValueCurve, [.12, .1299, .1397, .1535, .1633, .1746, .1903, .2061, .2218, .2386]);

  const skill = actionFact('aalto-skill-shift-trick');
  assert.equal(skill.damageClass, 'SKILL');
  assert.equal(skill.hitCount, 1);
  assert.deepEqual(skill.motionValueCurve, [.30, .3246, .3492, .3837, .4083, .4366, .4759, .5153, .5546, .5966]);

  const liberation = actionFact('aalto-liberation-flower-in-the-mist');
  assert.equal(liberation.damageClass, 'LIBERATION');
  assert.equal(liberation.hitCount, 1);
  assert.deepEqual(liberation.motionValueCurve, [2.00, 2.164, 2.328, 2.558, 2.722, 2.911, 3.173, 3.435, 3.698, 3.977]);
});

test('Aalto raw facts preserve Mist Drop, Gate, Outro and S1-S6 semantics without inventing execution', () => {
  const mistDrops = AALTO_RESOURCE_FACTS[0];
  assert.equal(mistDrops?.resourceName, 'Mist Drops');
  assert.equal(mistDrops?.maxValue, 6);
  assert.match(mistDrops?.ruleSummary ?? '', /Basic Attack.*Dodge Counter.*Intro Skill/i);
  assert.match(mistDrops?.ruleSummary ?? '', /6 Mist Drops/i);

  const mistAvatar = AALTO_PASSIVE_FACTS.find((fact) => fact.factId === 'aalto-skill-mist-avatar-utility');
  assert.ok(mistAvatar);
  assert.equal(mistAvatar.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(mistAvatar.effectSummary, /Taunt/i);

  const gate = AALTO_PASSIVE_FACTS.find((fact) => fact.factId === 'aalto-forte-gate-of-quandary');
  assert.ok(gate);
  assert.equal(gate.durationSeconds, 10);
  assert.equal(gate.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(gate.effectSummary, /10%.*ATK/i);

  const outro = AALTO_PASSIVE_FACTS.find((fact) => fact.factId === 'aalto-outro-dissolving-mist');
  assert.ok(outro);
  assert.equal(outro.scope, 'NEXT_CHARACTER');
  assert.equal(outro.durationSeconds, 14);
  assert.match(outro.effectSummary, /23% Aero DMG Amplification/i);

  assert.deepEqual(AALTO_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);
  assert.match(AALTO_SEQUENCE_FACTS[0]?.effectSummary ?? '', /2 additional charges/i);
  assert.match(AALTO_SEQUENCE_FACTS[1]?.effectSummary ?? '', /60%.*ATK/i);
  assert.match(AALTO_SEQUENCE_FACTS[2]?.effectSummary ?? '', /3 bullets.*50%/i);
  assert.match(AALTO_SEQUENCE_FACTS[3]?.effectSummary ?? '', /Mist Avatar.*100%/i);
  assert.match(AALTO_SEQUENCE_FACTS[4]?.effectSummary ?? '', /15% Aero DMG Bonus/i);
  assert.match(AALTO_SEQUENCE_FACTS[5]?.effectSummary ?? '', /8%.*Aero DMG Bonus.*4/i);
});

test('fact-backed coverage audit reports Aalto, Aemeath, Augusta, Baizhi and Brant verified with 52 released characters unstarted', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.profileCount, 5);
  assert.deepEqual(audit.verifiedCharacterIds, ['aalto', 'aemeath', 'augusta', 'baizhi', 'brant']);
  assert.deepEqual(audit.partialCharacterIds, []);
  assert.equal(audit.unstartedCharacterIds.length, 52);
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
  assert.ok(dps.blockers.some((check) => check.area === 'TEAM_PROFILE'));
  assert.ok(dps.blockers.some((check) => check.area === 'ROTATION_PROFILE'));
});
