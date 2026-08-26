import assert from 'node:assert/strict';
import test from 'node:test';

import type { CharacterMechanicFact, CharacterMechanicsProfile } from '../src/characterMechanicsDomain.ts';
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
  assert.deepEqual(audit.verifiedCharacterIds, ['aalto', 'aemeath']);
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

test('damage motion-value data cannot bypass the VERIFIED ACTION gate through damageClass null', () => {
  const factById = factMapWithOverride('aalto-basic-half-truths-1', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return { ...fact, damageClass: null };
  });

  const audit = auditCharacterMechanicsCoverage([AALTO_CHARACTER_MECHANICS_PROFILE], factById);
  assert.ok(issuesFor(AALTO_CHARACTER_MECHANICS_PROFILE, factById).includes(
    'verified ACTIONS fact aalto-basic-half-truths-1 has damage motion-value data while damageClass is null',
  ));
  assert.deepEqual(audit.verifiedCharacterIds, []);
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
