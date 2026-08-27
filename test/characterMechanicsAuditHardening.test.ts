import assert from 'node:assert/strict';
import test from 'node:test';

import type { CharacterMechanicFact, CharacterMechanicsProfile } from '../src/characterMechanicsDomain.ts';
import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  AALTO_CHARACTER_MECHANICS_PROFILE,
  AEMEATH_CHARACTER_MECHANICS_PROFILE,
  AUGUSTA_CHARACTER_ACTION_FACTS,
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
  profile: CharacterMechanicsProfile,
  factById: ReadonlyMap<string, CharacterMechanicFact> = CHARACTER_MECHANIC_FACT_BY_ID,
): readonly string[] {
  return auditCharacterMechanicsCoverage([profile], factById).structuralIssues
    .filter((issue) => issue.characterId === profile.characterId)
    .map((issue) => issue.issue);
}

test('current verified Character Mechanics profiles remain structurally clean under the hardened audit', () => {
  const audit = auditCharacterMechanicsCoverage();
  assert.deepEqual(audit.structuralIssues, []);
  assert.deepEqual(audit.verifiedCharacterIds, ['aalto', 'aemeath', 'augusta', 'baizhi', 'brant', 'changli', 'chixia', 'jiyan', 'mortefi', 'yangyang']);
});

test('current action facts classify Character damage, shared-system Tune Break damage and non-damage explicitly', () => {
  const nonDamageIds = new Set([
    'augusta-liberation-sublime-is-the-sun-state',
    'augusta-outro-battlesong-of-the-unyielding',
    'jiyan-liberation-emerald-storm-prelude',
  ]);
  const tuneBreakIds = new Set([
    'aalto-tune-break-pistols',
    'aemeath-tune-break-unlanded-melody',
    'augusta-tune-break-broadblade',
    'baizhi-tune-break-rectifier',
    'brant-tune-break-sword',
    'changli-tune-break-sword',
    'chixia-tune-break-pistols',
    'jiyan-tune-break-broadblade',
    'mortefi-tune-break-pistols',
    'yangyang-tune-break-sword',
  ]);

  for (const fact of CHARACTER_MECHANIC_FACT_BY_ID.values()) {
    if (fact.kind !== 'ACTION') continue;
    if (nonDamageIds.has(fact.factId)) {
      assert.equal(fact.actionRole, 'NON_DAMAGE', fact.factId);
    } else if (tuneBreakIds.has(fact.factId)) {
      assert.equal(fact.actionRole, 'SHARED_SYSTEM_DAMAGE', fact.factId);
      assert.equal(fact.section, 'TUNE_BREAK', fact.factId);
      assert.equal(fact.actionKind, 'TUNE_BREAK', fact.factId);
      assert.equal(fact.scalingStat, 'SHARED_SYSTEM', fact.factId);
    } else {
      assert.equal(fact.actionRole, 'DAMAGE', fact.factId);
    }
  }

  for (const fact of AUGUSTA_CHARACTER_ACTION_FACTS) {
    assert.equal(fact.actionRole, nonDamageIds.has(fact.factId) ? 'NON_DAMAGE' : 'DAMAGE', fact.factId);
  }
});

test('VERIFIED ACTIONS require exactly one current Tune Break fact', () => {
  const withoutTuneBreak: CharacterMechanicsProfile = {
    ...AALTO_CHARACTER_MECHANICS_PROFILE,
    factIds: AALTO_CHARACTER_MECHANICS_PROFILE.factIds.filter((factId) => factId !== 'aalto-tune-break-pistols'),
  };
  const issues = issuesFor(withoutTuneBreak);
  assert.ok(issues.includes('verified ACTIONS must include exactly one current Tune Break fact; found 0'));

  const duplicatedTuneBreak: CharacterMechanicsProfile = {
    ...AALTO_CHARACTER_MECHANICS_PROFILE,
    factIds: [...AALTO_CHARACTER_MECHANICS_PROFILE.factIds, 'aalto-tune-break-pistols'],
  };
  const duplicatedIssues = issuesFor(duplicatedTuneBreak);
  assert.ok(duplicatedIssues.includes('duplicate mechanics fact link'));
  assert.ok(duplicatedIssues.includes('verified ACTIONS must include exactly one current Tune Break fact; found 2'));
});

test('shared-system Tune Break damage cannot smuggle Character motion values or classification', () => {
  const factById = factMapWithOverride('aalto-tune-break-pistols', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return {
      ...fact,
      damageClass: 'BASIC',
      scalingStat: 'ATK',
      motionValue: .5,
      hitCount: 1,
    };
  });
  const issues = issuesFor(AALTO_CHARACTER_MECHANICS_PROFILE, factById);
  assert.ok(issues.includes(
    'verified shared-system ACTION fact aalto-tune-break-pistols must use the explicit Tune Break/system classification',
  ));
  assert.ok(issues.includes(
    'verified shared-system ACTION fact aalto-tune-break-pistols must not carry Character motion-value fields',
  ));
});

test('VERIFIED ACTIONS cannot leave damage intent UNKNOWN', () => {
  const factById = factMapWithOverride('aalto-basic-half-truths-1', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return { ...fact, actionRole: 'UNKNOWN' };
  });

  const audit = auditCharacterMechanicsCoverage([AALTO_CHARACTER_MECHANICS_PROFILE], factById);
  assert.ok(issuesFor(AALTO_CHARACTER_MECHANICS_PROFILE, factById).includes(
    'verified ACTIONS fact aalto-basic-half-truths-1 has UNKNOWN actionRole',
  ));
  assert.deepEqual(audit.verifiedCharacterIds, []);
  assert.deepEqual(audit.partialCharacterIds, ['aalto']);
});

test('NON_DAMAGE ACTIONS cannot smuggle damage fields through the VERIFIED gate', () => {
  const factById = factMapWithOverride('aalto-basic-half-truths-1', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return { ...fact, actionRole: 'NON_DAMAGE' };
  });

  const audit = auditCharacterMechanicsCoverage([AALTO_CHARACTER_MECHANICS_PROFILE], factById);
  assert.ok(issuesFor(AALTO_CHARACTER_MECHANICS_PROFILE, factById).includes(
    'verified ACTIONS fact aalto-basic-half-truths-1 declares NON_DAMAGE but carries damage representation fields',
  ));
  assert.deepEqual(audit.verifiedCharacterIds, []);
  assert.deepEqual(audit.partialCharacterIds, ['aalto']);
});

test('NON_DAMAGE ACTIONS reject an explicitly present empty component field', () => {
  const factById = factMapWithOverride('aalto-basic-half-truths-1', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return {
      ...fact,
      actionRole: 'NON_DAMAGE',
      damageClass: null,
      scalingStat: 'UNKNOWN',
      motionValue: null,
      motionValueCurve: null,
      motionValueComponents: [],
      hitCount: null,
      motionValueContext: null,
    };
  });

  const audit = auditCharacterMechanicsCoverage([AALTO_CHARACTER_MECHANICS_PROFILE], factById);
  assert.ok(issuesFor(AALTO_CHARACTER_MECHANICS_PROFILE, factById).includes(
    'verified ACTIONS fact aalto-basic-half-truths-1 declares NON_DAMAGE but carries damage representation fields',
  ));
  assert.deepEqual(audit.verifiedCharacterIds, []);
  assert.deepEqual(audit.partialCharacterIds, ['aalto']);
});

test('VERIFIED single-curve ACTIONS require a positive integer action-level hitCount', () => {
  const factById = factMapWithOverride('aalto-basic-half-truths-1', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return { ...fact, hitCount: null };
  });

  const audit = auditCharacterMechanicsCoverage([AALTO_CHARACTER_MECHANICS_PROFILE], factById);
  assert.ok(issuesFor(AALTO_CHARACTER_MECHANICS_PROFILE, factById).includes(
    'verified ACTIONS fact aalto-basic-half-truths-1 has an invalid single-curve hitCount',
  ));
  assert.deepEqual(audit.verifiedCharacterIds, []);
  assert.deepEqual(audit.partialCharacterIds, ['aalto']);
});

test('mixed component ACTIONS cannot also define an action-level hitCount', () => {
  const factById = factMapWithOverride('aemeath-basic-infinity-calibration-3', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return { ...fact, hitCount: 1 };
  });

  const audit = auditCharacterMechanicsCoverage([AEMEATH_CHARACTER_MECHANICS_PROFILE], factById);
  assert.ok(issuesFor(AEMEATH_CHARACTER_MECHANICS_PROFILE, factById).includes(
    'verified ACTIONS fact aemeath-basic-infinity-calibration-3 uses component curves and must not also define action-level hitCount',
  ));
  assert.deepEqual(audit.verifiedCharacterIds, []);
  assert.deepEqual(audit.partialCharacterIds, ['aemeath']);
});

test('DAMAGE ACTIONS cannot bypass the VERIFIED gate through damageClass null', () => {
  const factById = factMapWithOverride('aalto-basic-half-truths-1', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return { ...fact, damageClass: null };
  });

  const audit = auditCharacterMechanicsCoverage([AALTO_CHARACTER_MECHANICS_PROFILE], factById);
  assert.ok(issuesFor(AALTO_CHARACTER_MECHANICS_PROFILE, factById).includes(
    'verified DAMAGE ACTION fact aalto-basic-half-truths-1 is missing damageClass',
  ));
  assert.deepEqual(audit.verifiedCharacterIds, []);
});

test('VERIFIED damaging ACTIONS retain explicit source-level scaling and do not mix selected-level motion values', () => {
  const factById = factMapWithOverride('aalto-basic-half-truths-1', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return {
      ...fact,
      scalingStat: 'UNKNOWN',
      motionValueContext: null,
      motionValue: .16,
    };
  });

  const issues = issuesFor(AALTO_CHARACTER_MECHANICS_PROFILE, factById);
  assert.ok(issues.includes('verified ACTIONS fact aalto-basic-half-truths-1 has invalid Character damage scaling'));
  assert.ok(issues.includes('verified ACTIONS fact aalto-basic-half-truths-1 is missing motion-value level/source context'));
  assert.ok(issues.includes('verified ACTIONS fact aalto-basic-half-truths-1 mixes selected-level motionValue with an Lv1-Lv10 source representation'));

  const audit = auditCharacterMechanicsCoverage([AALTO_CHARACTER_MECHANICS_PROFILE], factById);
  assert.deepEqual(audit.verifiedCharacterIds, []);
  assert.deepEqual(audit.partialCharacterIds, ['aalto']);
});

test('VERIFIED profiles cannot hide non-VERIFIED linked utility facts outside the six coverage buckets', () => {
  const factById = factMapWithOverride('aalto-skill-mist-avatar-utility', (fact) => ({
    ...fact,
    verificationStatus: 'PARTIALLY_VERIFIED',
  }));

  const audit = auditCharacterMechanicsCoverage([AALTO_CHARACTER_MECHANICS_PROFILE], factById);
  assert.ok(issuesFor(AALTO_CHARACTER_MECHANICS_PROFILE, factById).includes(
    'VERIFIED profile links non-VERIFIED facts: aalto-skill-mist-avatar-utility',
  ));
  assert.deepEqual(audit.verifiedCharacterIds, []);
});

test('duplicate mechanics fact links are structural errors instead of duplicate evidence', () => {
  const firstFactId = AALTO_CHARACTER_MECHANICS_PROFILE.factIds[0];
  assert.ok(firstFactId);
  const duplicatedProfile: CharacterMechanicsProfile = {
    ...AALTO_CHARACTER_MECHANICS_PROFILE,
    factIds: [...AALTO_CHARACTER_MECHANICS_PROFILE.factIds, firstFactId],
  };

  const audit = auditCharacterMechanicsCoverage([duplicatedProfile]);
  assert.ok(issuesFor(duplicatedProfile).includes('duplicate mechanics fact link'));
  assert.deepEqual(audit.verifiedCharacterIds, []);
});