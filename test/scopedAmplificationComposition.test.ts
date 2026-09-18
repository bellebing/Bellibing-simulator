import test from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyCharacterHitAmplificationScope,
  characterHitAmplificationScopeApplies,
  resolveSingleActiveCharacterHitAmplification,
  SCOPED_AMPLIFICATION_COMPOSITION_ID,
  type QualifiedScopedAmplificationTerm,
} from '../src/combat/scopedAmplificationComposition.ts';
import { listCharacterOutroTransferSupport } from '../src/combat/characterOutroTransferAdapter.ts';
import { resolveIunoOutroTransferContract } from '../src/combat/iunoOutroTransferAdapter.ts';
import { resolveShorekeeperOutroTeamWindowContract } from '../src/combat/shorekeeperOutroTeamWindowAdapter.ts';
import { WEAPON_EFFECT_CATALOG } from '../src/data/weaponEffectCatalog.ts';

const term = (
  sourceId: string,
  statOrEffect: string,
  value: number,
  active = true,
): QualifiedScopedAmplificationTerm => {
  const scope = classifyCharacterHitAmplificationScope(statOrEffect);
  assert.ok(scope, statOrEffect);
  return {
    sourceId,
    canonicalSourceId: sourceId,
    statOrEffect,
    value,
    active,
    evidenceId: `evidence:${sourceId}`,
    scope,
  };
};

test('reviewed Character-hit amplification labels map only to exact scopes', () => {
  assert.deepEqual(classifyCharacterHitAmplificationScope('DMG Amplification'), { kind: 'ALL_DAMAGE' });
  assert.deepEqual(classifyCharacterHitAmplificationScope('All DMG Amplification'), { kind: 'ALL_DAMAGE' });
  assert.deepEqual(classifyCharacterHitAmplificationScope('Aero DMG Amplification'), { kind: 'ELEMENT', element: 'Aero' });
  assert.deepEqual(classifyCharacterHitAmplificationScope('Heavy Attack DMG Amplification'),
    { kind: 'DAMAGE_CLASS', damageClass: 'HEAVY' });
  assert.deepEqual(classifyCharacterHitAmplificationScope('Resonance Skill DMG Amplification'),
    { kind: 'DAMAGE_CLASS', damageClass: 'SKILL' });
  assert.equal(classifyCharacterHitAmplificationScope('Echo Skill DMG Amplification'), null);
  assert.equal(classifyCharacterHitAmplificationScope('ATK%'), null);
  assert.equal(classifyCharacterHitAmplificationScope('made up amplification'), null);
});

test('all current reviewed source labels are classified or explicitly excluded from Character direct hits', () => {
  const labels = [
    resolveShorekeeperOutroTeamWindowContract().statOrEffect,
    resolveIunoOutroTransferContract().statOrEffect,
    ...listCharacterOutroTransferSupport().flatMap(row => row.amplifications.map(term => term.statOrEffect)),
    WEAPON_EFFECT_CATALOG.find(row => row.effectId === 'BPP-TEAM-AERO')!.statOrEffect,
  ];
  const unsupported = labels.filter(label => classifyCharacterHitAmplificationScope(label) === null);
  assert.deepEqual([...new Set(unsupported)], ['Echo Skill DMG Amplification']);
});

test('scope applicability is exact for all-damage, element and Character damage class', () => {
  assert.equal(characterHitAmplificationScopeApplies({ kind: 'ALL_DAMAGE' },
    { damageElement: 'Fusion', damageClass: 'BASIC' }), true);
  assert.equal(characterHitAmplificationScopeApplies({ kind: 'ELEMENT', element: 'Aero' },
    { damageElement: 'Aero', damageClass: 'LIBERATION' }), true);
  assert.equal(characterHitAmplificationScopeApplies({ kind: 'ELEMENT', element: 'Aero' },
    { damageElement: 'Fusion', damageClass: 'LIBERATION' }), false);
  assert.equal(characterHitAmplificationScopeApplies({ kind: 'DAMAGE_CLASS', damageClass: 'HEAVY' },
    { damageElement: 'Electro', damageClass: 'HEAVY' }), true);
  assert.equal(characterHitAmplificationScopeApplies({ kind: 'DAMAGE_CLASS', damageClass: 'HEAVY' },
    { damageElement: 'Electro', damageClass: 'BASIC' }), false);
});

test('zero or one active applicable term resolves without inventing stacking arithmetic', () => {
  const none = resolveSingleActiveCharacterHitAmplification({
    damageElement: 'Fusion',
    damageClass: 'BASIC',
    terms: [
      term('aero', 'Aero DMG Amplification', .2),
      term('inactive-all', 'DMG Amplification', .15, false),
    ],
  });
  assert.equal(none.status, 'RESOLVED_SINGLE_OR_NONE');
  assert.equal(none.primitiveId, SCOPED_AMPLIFICATION_COMPOSITION_ID);
  assert.equal(none.amplification, 0);

  const one = resolveSingleActiveCharacterHitAmplification({
    damageElement: 'Fusion',
    damageClass: 'BASIC',
    terms: [
      term('fusion', 'Fusion DMG Amplification', .2),
      term('heavy', 'Heavy Attack DMG Amplification', .38),
    ],
  });
  assert.equal(one.status, 'RESOLVED_SINGLE_OR_NONE');
  assert.equal(one.amplification, .2);
  assert.deepEqual(one.applicableTerms.map(row => row.sourceId), ['fusion']);
});

test('two active applicable terms are PENDING_STACKING instead of summed or multiplied', () => {
  const result = resolveSingleActiveCharacterHitAmplification({
    damageElement: 'Fusion',
    damageClass: 'LIBERATION',
    terms: [
      term('all', 'DMG Amplification', .15),
      term('fusion', 'Fusion DMG Amplification', .2),
      term('liberation', 'Resonance Liberation DMG Amplification', .25),
    ],
  });
  assert.equal(result.status, 'PENDING_STACKING');
  assert.deepEqual(result.applicableTerms.map(row => row.sourceId), ['all', 'fusion', 'liberation']);
  assert.match(result.reason, /stacking semantics/);
  assert.equal(Object.hasOwn(result, 'amplification'), false);
});

test('duplicate ids, scope drift and invalid values fail closed', () => {
  const duplicate = term('same', 'DMG Amplification', .15);
  assert.throws(() => resolveSingleActiveCharacterHitAmplification({
    damageElement: 'Aero', damageClass: 'BASIC', terms: [duplicate, duplicate],
  }), /source ids must be unique/);

  const drifted = { ...term('drift', 'Aero DMG Amplification', .2),
    scope: { kind: 'ELEMENT', element: 'Fusion' } as const };
  assert.throws(() => resolveSingleActiveCharacterHitAmplification({
    damageElement: 'Aero', damageClass: 'BASIC', terms: [drifted],
  }), /exact supported canonical scope/);

  const invalid = { ...term('bad', 'DMG Amplification', .15), value: 0 };
  assert.throws(() => resolveSingleActiveCharacterHitAmplification({
    damageElement: 'Aero', damageClass: 'BASIC', terms: [invalid],
  }), /exact supported canonical scope/);
});
