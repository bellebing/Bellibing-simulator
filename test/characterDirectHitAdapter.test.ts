import assert from 'node:assert/strict';
import test from 'node:test';
import { readCharacterActionValues } from '../src/characterActionValues.ts';
import { buildCharacterDatabase } from '../src/characterDatabase.ts';
import { CHARACTER_MECHANIC_FACTS, getCharacterActionFact } from '../src/data/characterMechanics.ts';
import { evaluateCharacterDirectHit, listCharacterDirectHitSupport, supportsCharacterDirectHit,
  type CharacterDirectHitSnapshot } from '../src/combat/characterDirectHitAdapter.ts';
import { evaluateCharacterBasicHit, listCharacterBasicHitSupport } from '../src/combat/characterBasicHitAdapter.ts';

const snapshot: CharacterDirectHitSnapshot = { scalingStat: 'ATK', damageClass: 'BASIC', totalScalingStat: 1000,
  damageBonus: 0, amplification: 0, critRate: 0, critDamage: 1.5, defenseMultiplier: 1,
  resistanceMultiplier: 1, damageReduction: 0 };
const context = { sequence: 0 as const, maxSkills: true, componentIndex: 0, landedHitCount: 1 };

test('standard direct-hit batch executes exact coefficients for 492 actions across 54 Characters', () => {
  const support = listCharacterDirectHitSupport();
  assert.equal(support.length, 492);
  assert.equal(new Set(support.map((row) => row.characterId)).size, 54);
  for (const row of support) {
    const fact = getCharacterActionFact(row.factId)!;
    const source = readCharacterActionValues(fact);
    assert.ok(source.status === 'SOURCE_VALUES' && source.kind === 'COEFFICIENTS');
    for (const [componentIndex, component] of source.components.entries()) {
      const result = evaluateCharacterDirectHit({ ...context, ...row, componentIndex,
        landedHitCount: component.hitCount, snapshot: { ...snapshot, scalingStat: row.scalingStat,
          damageClass: row.sourceDamageClass } });
      assert.equal(result.expectedDamage, 1000 * (component.coefficient * component.hitCount), row.factId);
      assert.equal(result.damageClass, fact.damageClass);
      assert.equal(result.scalingStat, fact.scalingStat);
      assert.equal(result.scope, 'EXPLICIT_HITS_ONLY');
      assert.equal('rotationSeconds' in result, false);
    }
  }
});

test('HP and DEF coefficients require the correct explicitly tagged total stat', () => {
  for (const [characterId, factId, scalingStat, damageClass] of [
    ['cartethyia', 'cartethyia-basic-attack-sword-to-carve-my-forms-stage-1-dmg', 'HP', 'BASIC'],
    ['taoqi', 'taoqi-skill-fortified-defense', 'DEF', 'SKILL'],
    ['yuanwu', 'yuanwu-liberation-blazing-might', 'DEF', 'LIBERATION'],
  ] as const) {
    const input = { ...context, characterId, factId, snapshot: { ...snapshot, scalingStat, damageClass } };
    assert.ok(evaluateCharacterDirectHit(input).expectedDamage > 0);
    assert.throws(() => evaluateCharacterDirectHit({ ...input, snapshot: { ...input.snapshot, scalingStat: 'ATK' } }),
      /canonical scaling stat/);
  }
});

test('source damage classification wins over button/action/section labels', () => {
  const factId = 'aemeath-heavy-charged-ii';
  const fact = getCharacterActionFact(factId)!;
  assert.equal(fact.actionKind, 'HEAVY');
  assert.equal(fact.damageClass, 'LIBERATION');
  const input = { ...context, characterId: 'aemeath', factId,
    snapshot: { ...snapshot, damageClass: 'LIBERATION' as const } };
  assert.equal(evaluateCharacterDirectHit(input).damageClass, 'LIBERATION');
  assert.throws(() => evaluateCharacterDirectHit({ ...input, snapshot: { ...snapshot, damageClass: 'HEAVY' } }),
    /source damage class/);
});

test('original narrow basic-hit API remains numerically identical to shared evaluation', () => {
  for (const row of listCharacterBasicHitSupport()) {
    const s = { ...snapshot, damageBonus: 0.2, amplification: 0.1, critRate: 0.65, critDamage: 2.1,
      defenseMultiplier: 0.5, resistanceMultiplier: 0.9 };
    const direct = evaluateCharacterDirectHit({ ...context, ...row, snapshot: s });
    const basic = evaluateCharacterBasicHit({ ...context, ...row, snapshot: { ...s, totalAttack: s.totalScalingStat } });
    assert.equal(basic.expectedDamage, direct.expectedDamage, row.factId);
    assert.equal(basic.primitiveId, 'character-atk-basic-explicit-hit-v1');
  }
});

test('source-only, conditional, special-system and unverified semantics are not enabled by batch coverage', () => {
  const fact = getCharacterActionFact('aalto-basic-half-truths-1')!;
  for (const patch of [
    { conditional: true }, { modelingStatus: 'PENDING_INTERPRETATION' as const },
    { modelingStatus: 'RAW_ONLY' as const }, { verificationStatus: 'PENDING' as const },
    { damageClass: null, damageClasses: ['BASIC', 'LIBERATION'] as const },
    { scalingStat: 'MIXED' as const },
  ]) assert.equal(supportsCharacterDirectHit({ ...fact, ...patch }), false);
  for (const row of CHARACTER_MECHANIC_FACTS) {
    if (row.kind === 'ACTION' && (row.actionRole === 'SHARED_SYSTEM_DAMAGE' || row.sourceFixedFlatDamage != null)) {
      assert.equal(supportsCharacterDirectHit(row), false, row.factId);
    }
  }
  assert.throws(() => evaluateCharacterDirectHit({ ...context, characterId: 'qiuyuan',
    factId: 'qiuyuan-resonance-skill-through-the-groves-skill-dmg', snapshot: { ...snapshot, damageClass: 'SKILL' } }),
    /unsupported/);
  const db = buildCharacterDatabase();
  assert.deepEqual(db.hitPrimitives.directHits, listCharacterDirectHitSupport());
  assert.equal(db.mechanicsFacts.length, 1868);
  assert.equal(db.characters.filter((row) => row.readiness?.disposition === 'DPS_READY').length, 2);
  assert.equal(db.referenceTeam01.dpsReady, false);
  assert.equal(db.referenceTeam01.unresolvedDependencies.length, 6);
});
