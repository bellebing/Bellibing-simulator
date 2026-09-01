import test from 'node:test';
import assert from 'node:assert/strict';

import {
  evaluateSigrikaStandardEnergyRegenGate,
  SIGRIKA_STANDARD_ER_GATE_CONTRACT,
  validateSigrikaStandardEnergyRegenGateContract,
} from '../src/combat/sigrikaEnergyRegenGate.ts';

test('Sigrika canonical ER gate stays locked to verified Qiuyuan+Ciaccona source context', () => {
  assert.deepEqual(validateSigrikaStandardEnergyRegenGateContract(), []);
  assert.deepEqual(SIGRIKA_STANDARD_ER_GATE_CONTRACT, {
    adapterId: 'sigrika-standard-er-gate-v1',
    statTargetProfileId: 'sigrika-standard-build-stats',
    teamProfileId: 'sigrika-qiuyuan-ciaccona',
    sourceCharacterId: 'sigrika',
    sourceTeamMembers: ['sigrika', 'qiuyuan', 'ciaccona'],
    minimum: 1.09,
    preferred: 1.19,
    sourceDisposition: '109% maps to Qiuyuan + Ciaccona; 119% maps to Qiuyuan + Shorekeeper in current Prydwen Sigrika source.',
  });
});

test('Sigrika canonical ER gate evaluates minimum and preferred independently', () => {
  assert.deepEqual(evaluateSigrikaStandardEnergyRegenGate(1.089), {
    adapterId: 'sigrika-standard-er-gate-v1',
    statTargetProfileId: 'sigrika-standard-build-stats',
    teamProfileId: 'sigrika-qiuyuan-ciaccona',
    totalEnergyRegen: 1.089,
    minimum: 1.09,
    preferred: 1.19,
    passesMinimum: false,
    meetsPreferred: false,
  });
  assert.equal(evaluateSigrikaStandardEnergyRegenGate(1.09).passesMinimum, true);
  assert.equal(evaluateSigrikaStandardEnergyRegenGate(1.09).meetsPreferred, false);
  assert.equal(evaluateSigrikaStandardEnergyRegenGate(1.19).meetsPreferred, true);
});

test('Sigrika canonical ER gate rejects invalid numeric input', () => {
  assert.throws(() => evaluateSigrikaStandardEnergyRegenGate(Number.NaN), /finite and non-negative/);
  assert.throws(() => evaluateSigrikaStandardEnergyRegenGate(-1), /finite and non-negative/);
});
