import assert from 'node:assert/strict';
import test from 'node:test';
import { evaluateCharacterBasicHit, listCharacterBasicHitSupport } from '../src/combat/characterBasicHitAdapter.ts';
import { getCharacterActionFact } from '../src/data/characterMechanics.ts';
import { readCharacterActionValues } from '../src/characterActionValues.ts';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';

const snapshot = { totalAttack: 1000, damageBonus: 0, amplification: 0, critRate: 0,
  critDamage: 1.5, defenseMultiplier: 1, resistanceMultiplier: 1, damageReduction: 0 };
const base = { characterId: 'aalto', factId: 'aalto-basic-half-truths-3', sequence: 0 as const,
  maxSkills: true, componentIndex: 0, landedHitCount: 1, snapshot };

test('canonical ATK basic family has executable isolated hit coverage for 52 Characters / 268 actions', () => {
  const coverage = listCharacterBasicHitSupport();
  assert.equal(coverage.length, 268);
  assert.equal(new Set(coverage.map((row) => row.characterId)).size, 52);
  for (const row of coverage) {
    const fact = getCharacterActionFact(row.factId)!;
    const values = readCharacterActionValues(fact);
    assert.ok(values.status === 'SOURCE_VALUES' && values.kind === 'COEFFICIENTS');
    for (const [componentIndex, component] of values.components.entries()) {
      const result = evaluateCharacterBasicHit({ ...base, ...row, componentIndex,
        landedHitCount: component.hitCount });
      assert.equal(result.expectedDamage, 1000 * (component.coefficient * component.hitCount), row.factId);
      assert.equal(result.scope, 'EXPLICIT_HITS_ONLY');
      assert.equal('rotationSeconds' in result, false);
      assert.equal('dps' in result, false);
    }
  }
});

test('landed hits are explicit and mixed source components are independently selected', () => {
  const fact = getCharacterActionFact(base.factId)!;
  assert.equal(fact.hitCount, 2);
  const one = evaluateCharacterBasicHit(base);
  const two = evaluateCharacterBasicHit({ ...base, landedHitCount: 2 });
  assert.equal(two.expectedDamage, 2 * one.expectedDamage);
  assert.equal(evaluateCharacterBasicHit({ ...base, landedHitCount: 0 }).expectedDamage, 0);
  assert.throws(() => evaluateCharacterBasicHit({ ...base, landedHitCount: 3 }), /Landed hit count/);
  const mixed = { ...base, characterId: 'aemeath', factId: 'aemeath-basic-infinity-calibration-3' };
  const values = readCharacterActionValues(getCharacterActionFact(mixed.factId)!);
  assert.ok(values.status === 'SOURCE_VALUES' && values.kind === 'COEFFICIENTS');
  assert.equal(evaluateCharacterBasicHit({ ...mixed, componentIndex: 1 }).motionValue, values.components[1].coefficient);
  assert.throws(() => evaluateCharacterBasicHit({ ...mixed, componentIndex: 1, landedHitCount: 2 }), /Landed hit count/);
});

test('all stat/effect/target inputs are explicit and cannot survive the next independent hit snapshot', () => {
  const ordinary = evaluateCharacterBasicHit(base);
  const buffed = evaluateCharacterBasicHit({ ...base, snapshot: { ...snapshot,
    damageBonus: 0.5, amplification: 0.2, critRate: 1, critDamage: 2,
    defenseMultiplier: 0.5, resistanceMultiplier: 0.8, damageReduction: 0.1 } });
  assert.ok(Math.abs(buffed.expectedDamage - ordinary.expectedDamage * 1.5 * 1.2 * 2 * 0.5 * 0.8 * 0.9) < 1e-9);
  assert.deepEqual(evaluateCharacterBasicHit(base), ordinary);
  assert.throws(() => evaluateCharacterBasicHit({ ...base, snapshot: { ...snapshot, amplification: NaN } }), /finite/);
  assert.throws(() => evaluateCharacterBasicHit({ ...base, snapshot: { ...snapshot, damageReduction: 2 } }), /bounds/);
  assert.throws(() => evaluateCharacterBasicHit({ ...base, snapshot: { ...snapshot,
    totalAttack: Number.MAX_VALUE, damageBonus: Number.MAX_VALUE } }), /numeric range/);
});

test('ownership, conditional actions, other scaling and unmodeled sequences fail closed', () => {
  assert.throws(() => evaluateCharacterBasicHit({ ...base, characterId: 'buling' }), /unsupported/);
  assert.throws(() => evaluateCharacterBasicHit({ ...base, factId: 'aalto-dodge-counter-half-truths' }), /unsupported/);
  assert.throws(() => evaluateCharacterBasicHit({ ...base, factId: 'aalto-liberation-flower-in-the-mist' }), /unsupported/);
  assert.throws(() => evaluateCharacterBasicHit({ ...base, characterId: 'cartethyia',
    factId: 'cartethyia-basic-attack-sword-to-carve-my-forms-stage-1-dmg' }), /unsupported/);
  for (const sequence of [1, 2] as const) assert.throws(() => evaluateCharacterBasicHit({ ...base, sequence }), /S0/);
  assert.throws(() => evaluateCharacterBasicHit({ ...base, maxSkills: false }), /max skills/);
  assert.throws(() => evaluateCharacterBasicHit({ ...base, componentIndex: -1 }), /component/);
  assert.throws(() => evaluateCharacterBasicHit({ ...base, landedHitCount: 0.5 }), /Landed hit count/);
});

test('database advertises hit support separately from canonical modeling and DPS readiness', () => {
  const db = buildCharacterDatabase();
  assert.deepEqual(db.hitPrimitives.basicHits, listCharacterBasicHitSupport());
  assert.deepEqual(db.characters.filter((row) => row.readiness?.disposition === 'DPS_READY').map((row) => row.id),
    ['augusta', 'ciaccona']);
  assert.equal(db.referenceTeam01.dpsReady, false);
  assert.equal(db.referenceTeam01.unresolvedDependencies.length, 6);
  assert.equal(db.mechanicsFacts.find((fact) => fact.factId === base.factId)?.modelingStatus, 'MODEL_READY');
});
