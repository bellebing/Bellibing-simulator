import assert from 'node:assert/strict';
import test from 'node:test';
import { readCharacterActionValues, sumCharacterActionCoefficients } from '../src/characterActionValues.ts';
import type { CharacterActionFact } from '../src/characterMechanicsDomain.ts';
import { CHARACTER_MECHANIC_FACTS, getCharacterActionFact } from '../src/data/characterMechanics.ts';

function action(id: string): CharacterActionFact {
  const fact = getCharacterActionFact(id);
  assert.ok(fact, id);
  return fact;
}

test('one reader preserves exact per-hit curves across the complete canonical Character batch', () => {
  const owners = new Set<string>();
  for (const fact of CHARACTER_MECHANIC_FACTS) {
    if (fact.kind !== 'ACTION' || fact.actionRole !== 'DAMAGE' || fact.verificationStatus !== 'VERIFIED') continue;
    owners.add(fact.characterId);
    for (const level of [1, 5, 10]) {
      const result = readCharacterActionValues(fact, level);
      assert.equal(result.status, 'SOURCE_VALUES', fact.factId);
      if (result.status !== 'SOURCE_VALUES') continue;
      if (fact.motionValueCurve) {
        assert.deepEqual(result, { status: 'SOURCE_VALUES', kind: 'COEFFICIENTS', components: [
          { coefficient: fact.motionValueCurve[level - 1], hitCount: fact.hitCount },
        ] });
      }
      if (fact.motionValueComponents) {
        assert.deepEqual(result, { status: 'SOURCE_VALUES', kind: 'COEFFICIENTS', components:
          fact.motionValueComponents.map((part) => ({ coefficient: part.curve[level - 1], hitCount: part.hitCount })),
        });
      }
    }
  }
  assert.equal(owners.size, 54);
});

test('mixed hits are retained and flat damage cannot be consumed as an ATK coefficient', () => {
  const mixed = action('aemeath-basic-infinity-calibration-3');
  const values = readCharacterActionValues(mixed);
  assert.equal(values.status, 'SOURCE_VALUES');
  assert.ok(values.status === 'SOURCE_VALUES' && values.kind === 'COEFFICIENTS');
  assert.deepEqual(values.components.map((part) => part.hitCount), [3, 1, 1]);
  const flat = action('galbrena-forte-circuit-beyond-threshold-hellstride-dmg');
  assert.deepEqual(readCharacterActionValues(flat), {
    status: 'SOURCE_VALUES', kind: 'FLAT_DAMAGE', damagePerHit: 666, hitCount: 1,
  });
  assert.throws(() => sumCharacterActionCoefficients(flat), /one supported scaling stat/);
  assert.equal(flat.modelingStatus, 'PENDING_INTERPRETATION');
  assert.equal(flat.conditional, true);
});

test('unknown or unverified data is unavailable, never silently zero or extrapolated', () => {
  const fact = action('aalto-basic-half-truths-1');
  assert.deepEqual(readCharacterActionValues({ ...fact, verificationStatus: 'PENDING' }), {
    status: 'UNAVAILABLE', reason: 'UNVERIFIED',
  });
  for (const actionRole of ['NON_DAMAGE', 'SHARED_SYSTEM_DAMAGE', 'UNKNOWN'] as const) {
    assert.deepEqual(readCharacterActionValues({ ...fact, actionRole }), {
      status: 'UNAVAILABLE', reason: 'NOT_CHARACTER_DAMAGE',
    });
  }
  assert.deepEqual(readCharacterActionValues({ ...fact, motionValueCurve: null, motionValue: 1.23 }), {
    status: 'UNAVAILABLE', reason: 'NO_EXACT_REPRESENTATION',
  });
  for (const level of [0, 11, 1.5, NaN]) assert.throws(() => readCharacterActionValues(fact, level), /integer 1-10/);
});

test('source drift fails closed instead of selecting the first representation', () => {
  const fact = action('aalto-basic-half-truths-1');
  assert.throws(() => readCharacterActionValues({ ...fact, sourceFixedMotionValue: 1 }), /ambiguous/);
  assert.throws(() => readCharacterActionValues({ ...fact, hitCount: 0 }), /hit count/);
  assert.throws(() => readCharacterActionValues({ ...fact, motionValueCurve: null, motionValueComponents: [], hitCount: null }), /empty/);
  assert.throws(() => readCharacterActionValues({ ...fact, motionValueCurve: null,
    sourceFixedMotionValueComponents: [{ coefficient: NaN, hitCount: 1 }], hitCount: null }), /invalid source damage value/);
  assert.throws(() => readCharacterActionValues({ ...fact, motionValueCurve: null,
    sourceFixedFlatDamage: 666 }), /FIXED scaling/);
  assert.throws(() => sumCharacterActionCoefficients({ ...fact, scalingStat: 'MIXED' }), /one supported scaling stat/);
  assert.throws(() => sumCharacterActionCoefficients({ ...fact, damageClass: null,
    damageClasses: ['BASIC', 'LIBERATION'] }), /simultaneous/);
});
