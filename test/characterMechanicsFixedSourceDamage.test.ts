import assert from 'node:assert/strict';
import test from 'node:test';

import type { CharacterMechanicFact } from '../src/characterMechanicsDomain.ts';
import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  AALTO_CHARACTER_MECHANICS_PROFILE,
  AEMEATH_CHARACTER_MECHANICS_PROFILE,
  CHARACTER_MECHANIC_FACT_BY_ID,
} from '../src/data/characterMechanics.ts';

function factMapWithOverride(
  factId: string,
  mutate: (fact: CharacterMechanicFact) => CharacterMechanicFact,
): ReadonlyMap<string, CharacterMechanicFact> {
  const map = new Map(CHARACTER_MECHANIC_FACT_BY_ID);
  const fact = map.get(factId);
  assert.ok(fact, factId);
  map.set(factId, mutate(fact));
  return map;
}

function issuesFor(
  profile = AALTO_CHARACTER_MECHANICS_PROFILE,
  factById: ReadonlyMap<string, CharacterMechanicFact> = CHARACTER_MECHANIC_FACT_BY_ID,
): readonly string[] {
  return auditCharacterMechanicsCoverage([profile], factById).structuralIssues
    .filter((issue) => issue.characterId === profile.characterId)
    .map((issue) => issue.issue);
}

test('VERIFIED ACTIONS accept one explicit source-fixed coefficient when the source has no Lv1-Lv10 table', () => {
  const factById = factMapWithOverride('aalto-basic-half-truths-1', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return {
      ...fact,
      motionValueCurve: null,
      motionValueComponents: null,
      sourceFixedMotionValue: 5.3,
      sourceFixedMotionValueComponents: null,
      hitCount: 1,
      motionValueContext: 'Current source-fixed coefficient declared directly in kit text; no Lv1-Lv10 skill table exists for this action.',
    };
  });

  assert.deepEqual(issuesFor(AALTO_CHARACTER_MECHANICS_PROFILE, factById), []);
  const audit = auditCharacterMechanicsCoverage([AALTO_CHARACTER_MECHANICS_PROFILE], factById);
  assert.deepEqual(audit.verifiedCharacterIds, ['aalto']);
});

test('VERIFIED ACTIONS accept exact mixed source-fixed components without pre-summing them', () => {
  const factById = factMapWithOverride('aemeath-basic-infinity-calibration-3', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return {
      ...fact,
      motionValueCurve: null,
      motionValueComponents: null,
      sourceFixedMotionValue: null,
      sourceFixedMotionValueComponents: [
        { coefficient: 1.9598, hitCount: 1 },
        { coefficient: 3.9196, hitCount: 1 },
      ],
      hitCount: null,
      motionValueContext: 'Current source-fixed mixed coefficients declared directly in kit text; no Lv1-Lv10 skill table exists for this action.',
    };
  });

  assert.deepEqual(issuesFor(AEMEATH_CHARACTER_MECHANICS_PROFILE, factById), []);
  const audit = auditCharacterMechanicsCoverage([AEMEATH_CHARACTER_MECHANICS_PROFILE], factById);
  assert.deepEqual(audit.verifiedCharacterIds, ['aemeath']);
});

test('source-fixed damage cannot coexist with an Lv1-Lv10 source representation', () => {
  const factById = factMapWithOverride('aalto-basic-half-truths-1', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return {
      ...fact,
      sourceFixedMotionValue: 5.3,
    };
  });

  assert.ok(issuesFor(AALTO_CHARACTER_MECHANICS_PROFILE, factById).includes(
    'verified ACTIONS fact aalto-basic-half-truths-1 mixes multiple source damage representations',
  ));
  assert.deepEqual(
    auditCharacterMechanicsCoverage([AALTO_CHARACTER_MECHANICS_PROFILE], factById).verifiedCharacterIds,
    [],
  );
});

test('source-fixed damage cannot masquerade as a selected-level parity scalar', () => {
  const factById = factMapWithOverride('aalto-basic-half-truths-1', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return {
      ...fact,
      motionValueCurve: null,
      motionValueComponents: null,
      sourceFixedMotionValue: 5.3,
      sourceFixedMotionValueComponents: null,
      motionValue: 5.3,
      hitCount: 1,
    };
  });

  assert.ok(issuesFor(AALTO_CHARACTER_MECHANICS_PROFILE, factById).includes(
    'verified ACTIONS fact aalto-basic-half-truths-1 mixes selected-level motionValue with a source-fixed representation',
  ));
});

test('source-fixed single coefficients require a finite non-negative coefficient and positive integer hitCount', () => {
  const factById = factMapWithOverride('aalto-basic-half-truths-1', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return {
      ...fact,
      motionValueCurve: null,
      motionValueComponents: null,
      sourceFixedMotionValue: Number.NaN,
      sourceFixedMotionValueComponents: null,
      hitCount: 0,
    };
  });

  const issues = issuesFor(AALTO_CHARACTER_MECHANICS_PROFILE, factById);
  assert.ok(issues.includes('verified ACTIONS fact aalto-basic-half-truths-1 has an invalid source-fixed motion value'));
  assert.ok(issues.includes('verified ACTIONS fact aalto-basic-half-truths-1 has an invalid source-fixed hitCount'));
});

test('source-fixed component expressions require component hit counts and reject action-level double counting', () => {
  const factById = factMapWithOverride('aalto-basic-half-truths-1', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return {
      ...fact,
      motionValueCurve: null,
      motionValueComponents: null,
      sourceFixedMotionValue: null,
      sourceFixedMotionValueComponents: [
        { coefficient: 1.9598, hitCount: 1 },
        { coefficient: 3.9196, hitCount: 0 },
      ],
      hitCount: 2,
    };
  });

  const issues = issuesFor(AALTO_CHARACTER_MECHANICS_PROFILE, factById);
  assert.ok(issues.includes(
    'verified ACTIONS fact aalto-basic-half-truths-1 uses source-fixed components and must not also define action-level hitCount',
  ));
  assert.ok(issues.includes(
    'verified ACTIONS fact aalto-basic-half-truths-1 has an invalid source-fixed motion-value component 2',
  ));
});

test('NON_DAMAGE and shared-system actions still reject source-fixed Character damage fields', () => {
  const nonDamageMap = factMapWithOverride('aalto-basic-half-truths-1', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return {
      ...fact,
      actionRole: 'NON_DAMAGE',
      damageClass: null,
      scalingStat: 'UNKNOWN',
      motionValue: null,
      motionValueCurve: null,
      motionValueComponents: null,
      sourceFixedMotionValue: 5.3,
      sourceFixedMotionValueComponents: null,
      hitCount: null,
      motionValueContext: null,
    };
  });
  assert.ok(issuesFor(AALTO_CHARACTER_MECHANICS_PROFILE, nonDamageMap).includes(
    'verified ACTIONS fact aalto-basic-half-truths-1 declares NON_DAMAGE but carries damage representation fields',
  ));

  const sharedMap = factMapWithOverride('aalto-tune-break-pistols', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return {
      ...fact,
      sourceFixedMotionValue: 5.3,
    };
  });
  assert.ok(issuesFor(AALTO_CHARACTER_MECHANICS_PROFILE, sharedMap).includes(
    'verified shared-system ACTION fact aalto-tune-break-pistols must not carry Character motion-value fields',
  ));
});
