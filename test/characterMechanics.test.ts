import assert from 'node:assert/strict';
import test from 'node:test';

import type { CharacterActionFact } from '../src/characterMechanicsDomain.ts';
import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  AUGUSTA_CHARACTER_ACTION_FACTS,
  AUGUSTA_CHARACTER_MECHANICS_PROFILE,
  CHARACTER_MECHANIC_FACT_BY_ID,
  getCharacterActionFact,
} from '../src/data/characterMechanics.ts';
import {
  AUGUSTA_PASSIVE_FACTS,
  AUGUSTA_RESOURCE_FACTS,
  AUGUSTA_SEQUENCE_FACTS,
} from '../src/data/characterMechanics/augustaRawFacts.ts';
import { getCharacterPreflight } from '../src/data/characterPreflight.ts';
import { ECHO_ATTACK_PROFILES } from '../src/data/echoAttacks.ts';
import { ROTATION_PROFILES } from '../src/data/rotationProfiles.ts';
import { auditRotationMechanicDependencies, findRotationsDependingOnMechanicFact } from '../src/data/rotationMechanicsAudit.ts';
import { totalMotionValue } from '../src/echoAttackDomain.ts';
import { createEchoAttackRegistry } from '../src/echoAttackRegistry.ts';

function sourceMotionValueAt(fact: CharacterActionFact, levelIndex: number): number | null {
  if (fact.actionRole !== 'DAMAGE') return null;
  if (fact.motionValueCurve) {
    assert.ok(fact.hitCount !== null);
    return fact.motionValueCurve[levelIndex] * fact.hitCount;
  }
  assert.ok(fact.motionValueComponents);
  return fact.motionValueComponents.reduce(
    (sum, component) => sum + component.curve[levelIndex] * component.hitCount,
    0,
  );
}

function assertNear(actual: number | null, expected: number, epsilon = 1e-10): void {
  assert.notEqual(actual, null);
  assert.ok(Math.abs((actual ?? 0) - expected) <= epsilon, `${String(actual)} != ${expected}`);
}

test('Augusta current Character-owned source action facts are exact Lv1-Lv10 representations', () => {
  assert.equal(AUGUSTA_CHARACTER_ACTION_FACTS.length, 24);
  assert.equal(new Set(AUGUSTA_CHARACTER_ACTION_FACTS.map((fact) => fact.factId)).size, 24);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1938);

  for (const fact of AUGUSTA_CHARACTER_ACTION_FACTS) {
    if (fact.actionRole === 'NON_DAMAGE') {
      assert.equal(fact.motionValue, null, fact.factId);
      assert.equal(fact.motionValueCurve ?? null, null, fact.factId);
      assert.equal(fact.motionValueComponents ?? null, null, fact.factId);
      continue;
    }
    assert.equal(fact.motionValue, null, fact.factId);
    assert.ok(fact.motionValueCurve || fact.motionValueComponents, fact.factId);
  }

  const warriorsBlade = getCharacterActionFact('augusta-skill-warriors-blade');
  assert.ok(warriorsBlade);
  assertNear(sourceMotionValueAt(warriorsBlade, 0), 3.3);
  assertNear(sourceMotionValueAt(warriorsBlade, 9), 6.561);

  const liberation = getCharacterActionFact('augusta-liberation-sword-of-eternal-oath');
  assert.ok(liberation);
  assert.equal(liberation.section, 'RESONANCE_LIBERATION');
  assert.equal(liberation.actionKind, 'LIBERATION');
  assert.equal(liberation.damageClass, 'HEAVY');
  assert.equal(liberation.motionValue, null);
  assert.equal(liberation.motionValueComponents?.length, 4);
  assertNear(sourceMotionValueAt(liberation, 9), 10.9948);

  const everbright = getCharacterActionFact('augusta-liberation-everbright-protector');
  assert.ok(everbright);
  assertNear(sourceMotionValueAt(everbright, 0), 6.0);
  assertNear(sourceMotionValueAt(everbright, 9), 11.9293);

  const plunge = getCharacterActionFact('augusta-forte-undying-sunlight-plunge');
  assert.ok(plunge);
  assert.equal(plunge.motionValueComponents?.length, 2);
  assertNear(sourceMotionValueAt(plunge, 0), 4.355);
  assertNear(sourceMotionValueAt(plunge, 9), 8.6583);
});

test('Augusta verified non-action raw facts cover resources, passives and all six sequences', () => {
  assert.equal(AUGUSTA_RESOURCE_FACTS.length, 4);
  assert.equal(AUGUSTA_PASSIVE_FACTS.length, 6);
  assert.equal(AUGUSTA_SEQUENCE_FACTS.length, 6);
  assert.deepEqual(AUGUSTA_SEQUENCE_FACTS.map((fact) => fact.sequence), [1, 2, 3, 4, 5, 6]);

  const prowess = CHARACTER_MECHANIC_FACT_BY_ID.get('augusta-resource-prowess');
  const ascendancy = CHARACTER_MECHANIC_FACT_BY_ID.get('augusta-resource-ascendancy');
  const majesty = CHARACTER_MECHANIC_FACT_BY_ID.get('augusta-resource-majesty');
  const crown = CHARACTER_MECHANIC_FACT_BY_ID.get('augusta-resource-crown-of-wills');
  assert.ok(prowess?.kind === 'RESOURCE' && ascendancy?.kind === 'RESOURCE' && majesty?.kind === 'RESOURCE' && crown?.kind === 'RESOURCE');
  assert.equal(prowess.maxValue, 100);
  assert.equal(ascendancy.maxValue, 100);
  assert.equal(majesty.maxValue, 2);
  assert.equal(crown.maxValue, 1);

  const outro = CHARACTER_MECHANIC_FACT_BY_ID.get('augusta-outro-battlesong-effect');
  assert.ok(outro?.kind === 'PASSIVE');
  assert.equal(outro.durationSeconds, 14);
  assert.match(outro.effectSummary, /15% DMG Amplification/);
  assert.match(outro.effectSummary, /casts Outro during the effect/);

  const s6 = CHARACTER_MECHANIC_FACT_BY_ID.get('augusta-s6-engraved-in-radiant-light');
  assert.ok(s6?.kind === 'SEQUENCE');
  assert.match(s6.effectSummary, /two Electro-DMG instances/);
  assert.match(s6.effectSummary, /100% ATK/);
  assert.match(s6.effectSummary, /Heavy Attack DMG/);
});

test('mechanics coverage reports fifty-four released characters fully source-complete with three partial ACTION profiles', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.equal(audit.releasedCount, 59);
  assert.equal(audit.profileCount, 57);
  assert.equal(audit.verifiedCharacterIds.length, 54);
  assert.deepEqual(audit.partialCharacterIds, ['buling', 'danjin', 'xiangli-yao']);
  assert.deepEqual(audit.unstartedCharacterIds, ['hsin', 'jingran']);
  assert.equal(CHARACTER_MECHANIC_FACT_BY_ID.size, 1938);
  assert.deepEqual(audit.structuralIssues, []);
});

test('VERIFIED mechanics coverage requires linked source-verified supporting facts', () => {
  const invalidVerified = {
    ...AUGUSTA_CHARACTER_MECHANICS_PROFILE,
    verificationStatus: 'VERIFIED' as const,
    coverage: AUGUSTA_CHARACTER_MECHANICS_PROFILE.coverage.map((area) => ({ ...area, status: 'VERIFIED' as const })),
    factIds: ['augusta-s1-stained-in-scorched-earth'],
  };
  const audit = auditCharacterMechanicsCoverage([invalidVerified]);
  const issues = audit.structuralIssues.filter((issue) => issue.characterId === 'augusta').map((issue) => issue.issue);

  assert.ok(issues.includes('verified mechanics area ACTIONS has no supporting fact'));
  assert.ok(issues.includes('verified mechanics area FORTE_RULES has no supporting fact'));
  assert.ok(issues.includes('verified mechanics area INHERENT_PASSIVES has no supporting fact'));
  assert.ok(issues.includes('verified mechanics area OUTRO_EFFECT has no supporting fact'));
  assert.ok(issues.includes('verified mechanics area RESOURCE_RULES has no supporting fact'));
  assert.ok(issues.includes('verified mechanics area SEQUENCES must include exact S1-S6 facts; found 1'));
  assert.deepEqual(audit.verifiedCharacterIds, []);
  assert.deepEqual(audit.partialCharacterIds, ['augusta']);
});

test('historical rotation dependencies retain game facts while the retired runtime fails closed', () => {
  const rotation = ROTATION_PROFILES.find((profile) => profile.id === 'augusta-standard-iuno-shorekeeper');
  assert.ok(rotation);
  const audit = auditRotationMechanicDependencies(rotation);
  assert.equal(audit.modeledFactCount, 12);
  assert.equal(audit.assumedFactCount, 8);
  assert.deepEqual(audit.issues, [{ factId: '*', issue: 'unknown engine model AUGUSTA_STD_V1' }]);

  assert.deepEqual(
    findRotationsDependingOnMechanicFact('augusta-resource-majesty', ROTATION_PROFILES).map((profile) => profile.id),
    ['augusta-standard-iuno-shorekeeper'],
  );
  assert.deepEqual(
    findRotationsDependingOnMechanicFact('augusta-s6-engraved-in-radiant-light', ROTATION_PROFILES),
    [],
  );
});

test('executable preflight recognizes Augusta raw mechanics as source-complete without changing the existing combat-model boundary', () => {
  const raw = getCharacterPreflight('augusta', 'RAW_FACTS');
  const dps = getCharacterPreflight('augusta', 'DPS_MODEL');
  assert.ok(raw && dps);
  assert.equal(raw.ready, true);
  assert.equal(raw.checks.find((check) => check.area === 'IDENTITY_LEVEL90')?.status, 'PASS');
  assert.equal(raw.checks.find((check) => check.area === 'INTRINSIC_STATS')?.status, 'PASS');
  assert.equal(raw.checks.find((check) => check.area === 'CHARACTER_MECHANICS')?.status, 'PASS');
  assert.deepEqual(raw.blockers, []);

  assert.equal(dps.checks.find((check) => check.area === 'COMBAT_MODEL')?.status, 'PENDING');
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
  const raw = getCharacterPreflight('baizhi', 'RAW_FACTS');
  const build = getCharacterPreflight('baizhi', 'BUILD_PROFILE');
  const dps = getCharacterPreflight('baizhi', 'DPS_MODEL');
  assert.ok(raw && build && dps);

  assert.equal(raw.ready, true);
  assert.equal(raw.blockers.some((check) => check.area === 'CHARACTER_MECHANICS'), false);
  assert.equal(raw.blockers.some((check) => check.area === 'WEAPON_PROFILE'), false);
  assert.ok(build.blockers.some((check) => check.area === 'WEAPON_PROFILE'));
  assert.equal(build.blockers.some((check) => check.area === 'TEAM_PROFILE'), false);
  assert.ok(dps.blockers.some((check) => check.area === 'TEAM_PROFILE'));
  assert.ok(dps.blockers.some((check) => check.area === 'ROTATION_PROFILE'));
  assert.ok(dps.blockers.some((check) => check.area === 'COMBAT_MODEL'));
  assert.ok(dps.blockers.some((check) => check.area === 'BUILD_PRESET'));
});

test('unknown character preflight does not fabricate a record', () => {
  assert.equal(getCharacterPreflight('does-not-exist'), null);
});
