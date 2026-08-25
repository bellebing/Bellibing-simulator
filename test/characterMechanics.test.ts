import assert from 'node:assert/strict';
import test from 'node:test';

import { AUGUSTA_STANDARD_ACTIONS } from '../src/characters/augustaStandard.ts';
import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  AUGUSTA_CHARACTER_ACTION_FACTS,
  CHARACTER_MECHANIC_FACT_BY_ID,
  getCharacterActionFact,
} from '../src/data/characterMechanics.ts';
import { getCharacterPreflight } from '../src/data/characterPreflight.ts';
import { ECHO_ATTACK_PROFILES } from '../src/data/echoAttacks.ts';
import { totalMotionValue } from '../src/echoAttackDomain.ts';
import { createEchoAttackRegistry } from '../src/echoAttackRegistry.ts';

test('Augusta golden action facts are unique and own the canonical character motion values', () => {
  assert.equal(AUGUSTA_CHARACTER_ACTION_FACTS.length, 12);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 12);
  assert.equal(new Set(AUGUSTA_CHARACTER_ACTION_FACTS.map((fact) => fact.factId)).size, 12);

  const liberation = getCharacterActionFact('augusta-liberation-sword-of-eternal-oath');
  assert.ok(liberation);
  assert.equal(liberation.section, 'RESONANCE_LIBERATION');
  assert.equal(liberation.actionKind, 'LIBERATION');
  assert.equal(liberation.damageClass, 'HEAVY');
  assert.equal(liberation.motionValue, 10.9948);
});

test('Augusta rotation recipe reuses character facts instead of duplicating repeated action values', () => {
  const step2 = AUGUSTA_STANDARD_ACTIONS.find((action) => action.step === '2');
  const step5 = AUGUSTA_STANDARD_ACTIONS.find((action) => action.step === '5');
  const step3 = AUGUSTA_STANDARD_ACTIONS.find((action) => action.step === '3');
  const step6 = AUGUSTA_STANDARD_ACTIONS.find((action) => action.step === '6');
  assert.ok(step2 && step5 && step3 && step6);
  assert.equal(step2.sourceFactId, 'augusta-heavy-thunderoar-backstep');
  assert.equal(step5.sourceFactId, step2.sourceFactId);
  assert.equal(step2.motionValue, getCharacterActionFact(step2.sourceFactId)?.motionValue);
  assert.equal(step3.sourceFactId, 'augusta-heavy-thunderoar-spinslash');
  assert.equal(step6.sourceFactId, step3.sourceFactId);
  assert.equal(step3.motionValue, getCharacterActionFact(step3.sourceFactId)?.motionValue);
});

test('Augusta rotation consumes canonical False Sovereign Echo attack facts', () => {
  const registry = createEchoAttackRegistry(ECHO_ATTACK_PROFILES);
  const intro = registry.attackById.get('FALSE_SOV_INTRO_SUMMON');
  const active = registry.attackById.get('FALSE_SOV_ACTIVE_SPIN');
  assert.ok(intro && active);

  const step1E = AUGUSTA_STANDARD_ACTIONS.find((action) => action.step === '1E');
  const step14 = AUGUSTA_STANDARD_ACTIONS.find((action) => action.step === '14');
  assert.ok(step1E && step14);
  assert.equal(step1E.sourceFactId, intro.attackId);
  assert.equal(step1E.motionValue, totalMotionValue(intro));
  assert.equal(step1E.motionValue, 4.05);
  assert.equal(step14.sourceFactId, active.attackId);
  assert.equal(step14.motionValue, totalMotionValue(active));
  assert.equal(step14.motionValue, 2.214);
});

test('mechanics coverage audit makes unfinished released characters visible without hiding structural errors', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.equal(audit.releasedCount, 57);
  assert.equal(audit.profileCount, 1);
  assert.deepEqual(audit.verifiedCharacterIds, []);
  assert.deepEqual(audit.partialCharacterIds, ['augusta']);
  assert.equal(audit.unstartedCharacterIds.length, 56);
  assert.ok(audit.unstartedCharacterIds.includes('aalto'));
  assert.ok(audit.unstartedCharacterIds.includes('zhezhi'));
  assert.deepEqual(audit.structuralIssues, []);
});

test('executable preflight reports actual Augusta raw-fact blocker rather than trusting its existing DPS adapter', () => {
  const report = getCharacterPreflight('augusta', 'RAW_FACTS');
  assert.ok(report);
  assert.equal(report.ready, false);
  assert.equal(report.checks.find((check) => check.area === 'RELEASE_STATUS')?.status, 'PASS');
  assert.equal(report.checks.find((check) => check.area === 'IDENTITY_LEVEL90')?.status, 'PASS');
  assert.equal(report.checks.find((check) => check.area === 'INTRINSIC_STATS')?.status, 'PASS');
  assert.equal(report.checks.find((check) => check.area === 'CHARACTER_MECHANICS')?.status, 'PENDING');
  assert.deepEqual(report.blockers.map((check) => check.area), ['CHARACTER_MECHANICS']);
});

test('preflight preserves named raw pending fields for current released characters', () => {
  const qingxiao = getCharacterPreflight('qingxiao', 'RAW_FACTS');
  assert.ok(qingxiao);
  const raw = qingxiao.checks.find((check) => check.area === 'IDENTITY_LEVEL90');
  assert.equal(raw?.status, 'PENDING');
  assert.match(raw?.details.join(' ') ?? '', /maxEnergy/);
  assert.equal(qingxiao.ready, false);
});

test('preflight target levels add relationship/profile requirements only when needed', () => {
  const raw = getCharacterPreflight('aalto', 'RAW_FACTS');
  const build = getCharacterPreflight('aalto', 'BUILD_PROFILE');
  const dps = getCharacterPreflight('aalto', 'DPS_MODEL');
  assert.ok(raw && build && dps);

  assert.ok(raw.blockers.some((check) => check.area === 'CHARACTER_MECHANICS'));
  assert.equal(raw.blockers.some((check) => check.area === 'WEAPON_PROFILE'), false);
  assert.ok(build.blockers.some((check) => check.area === 'WEAPON_PROFILE'));
  assert.equal(build.blockers.some((check) => check.area === 'TEAM_PROFILE'), false);
  assert.ok(dps.blockers.some((check) => check.area === 'TEAM_PROFILE'));
  assert.ok(dps.blockers.some((check) => check.area === 'ROTATION_PROFILE'));
  assert.ok(dps.blockers.some((check) => check.area === 'BUILD_PRESET'));
});

test('unknown character preflight does not fabricate a record', () => {
  assert.equal(getCharacterPreflight('does-not-exist'), null);
});
