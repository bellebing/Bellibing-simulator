import assert from 'node:assert/strict';
import test from 'node:test';

import type { CharacterMechanicFact } from '../src/characterMechanicsDomain.ts';
import { auditCharacterMechanicsCoverage } from '../src/data/characterMechanicsAudit.ts';
import {
  AALTO_CHARACTER_MECHANICS_PROFILE,
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

function issuesFor(factById: ReadonlyMap<string, CharacterMechanicFact>): readonly string[] {
  return auditCharacterMechanicsCoverage([AALTO_CHARACTER_MECHANICS_PROFILE], factById).structuralIssues
    .filter((issue) => issue.characterId === 'aalto')
    .map((issue) => issue.issue);
}

test('VERIFIED Character damage can preserve simultaneous source damage classes without inventing a primary class', () => {
  const factById = factMapWithOverride('aalto-basic-half-truths-1', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return {
      ...fact,
      damageClass: null,
      damageClasses: ['BASIC', 'HEAVY'],
    };
  });

  assert.deepEqual(issuesFor(factById), []);
});

test('VERIFIED Character damage cannot mix a single damageClass with simultaneous damageClasses', () => {
  const factById = factMapWithOverride('aalto-basic-half-truths-1', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return {
      ...fact,
      damageClasses: ['BASIC', 'HEAVY'],
    };
  });

  assert.ok(issuesFor(factById).includes(
    'verified DAMAGE ACTION fact aalto-basic-half-truths-1 mixes single and simultaneous damage classification',
  ));
});

test('simultaneous damageClasses fail closed when there is only one class, a duplicate or OTHER', () => {
  for (const [damageClasses, expected] of [
    [
      ['BASIC'],
      'verified DAMAGE ACTION fact aalto-basic-half-truths-1 simultaneous damageClasses must contain at least two classes',
    ],
    [
      ['BASIC', 'BASIC'],
      'verified DAMAGE ACTION fact aalto-basic-half-truths-1 simultaneous damageClasses contain duplicates',
    ],
    [
      ['BASIC', 'OTHER'],
      'verified DAMAGE ACTION fact aalto-basic-half-truths-1 simultaneous damageClasses must use explicit source classes instead of OTHER',
    ],
  ] as const) {
    const factById = factMapWithOverride('aalto-basic-half-truths-1', (fact) => {
      assert.equal(fact.kind, 'ACTION');
      return {
        ...fact,
        damageClass: null,
        damageClasses,
      };
    });
    assert.ok(issuesFor(factById).includes(expected), damageClasses.join(','));
  }
});

test('shared-system Tune Break facts reject simultaneous Character damage classes', () => {
  const factById = factMapWithOverride('aalto-tune-break-pistols', (fact) => {
    assert.equal(fact.kind, 'ACTION');
    return {
      ...fact,
      damageClasses: ['BASIC', 'HEAVY'],
    };
  });

  assert.ok(issuesFor(factById).includes(
    'verified shared-system ACTION fact aalto-tune-break-pistols must use the explicit Tune Break/system classification',
  ));
});
