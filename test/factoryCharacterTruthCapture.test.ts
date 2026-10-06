import assert from 'node:assert/strict';
import test from 'node:test';
import {
  compareCharacterTruthToCanonical,
  reconcileCharacterTruthFacts,
  type CharacterTruthProviderFact,
} from '../src/factory/characterTruthCapture.ts';

const base = {
  providerCharacterId: 'augusta',
  bellibingCharacterId: 'augusta',
  family: 'IDENTITY',
  factId: 'weaponType',
  sourceVersion: 'test-v1',
  capturedAt: '2026-10-05T00:00:00Z',
  freshnessSensitive: false,
} as const;

function fact(providerId: string, value: unknown): CharacterTruthProviderFact {
  return { ...base, providerId, value, sourceRef: `https://example.invalid/${providerId}/augusta` };
}

test('one provider stays noncanonical single-provider evidence', () => {
  const [row] = reconcileCharacterTruthFacts([fact('provider-a', 'Broadblade')]);
  assert.equal(row?.evidenceState, 'CAPTURED_ONE_PROVIDER');
  assert.equal(row?.factoryEvidence?.canonicalPromotion, 'MANUAL_SOURCE_VALIDATION_REQUIRED');
});

test('two independent equal providers produce consensus without canonical promotion', () => {
  const [row] = reconcileCharacterTruthFacts([
    fact('provider-a', { value: 125, unit: 'energy' }),
    fact('provider-b', { unit: 'energy', value: 125 }),
  ]);
  assert.equal(row?.evidenceState, 'CONSENSUS_TWO_PROVIDERS');
  assert.equal(row?.factoryEvidence?.classification, 'CONSENSUS');
  assert.equal(row?.factoryEvidence?.canonicalPromotion, 'MANUAL_SOURCE_VALIDATION_REQUIRED');
});

test('provider disagreement is retained as a conflict', () => {
  const [row] = reconcileCharacterTruthFacts([fact('provider-a', 125), fact('provider-b', 140)]);
  assert.equal(row?.evidenceState, 'PROVIDER_CONFLICT');
  assert.equal(row?.providerFacts.length, 2);
});

test('unmapped provider identities never become canonical Character ids', () => {
  const unmapped = { ...fact('provider-a', 'Future Resonator'), bellibingCharacterId: null };
  const [row] = reconcileCharacterTruthFacts([unmapped]);
  assert.equal(row?.evidenceState, 'UNMAPPED_IDENTITY');
  assert.equal(row?.factoryEvidence, null);
});

test('canonical comparison reports agreement, provider-only and conflicts without overwriting', () => {
  assert.equal(compareCharacterTruthToCanonical({
    characterId: 'augusta', factId: 'weaponType', canonicalValue: 'Broadblade',
    providerFacts: [fact('provider-a', 'Broadblade')],
  }).state, 'EXACT_AGREEMENT');
  assert.equal(compareCharacterTruthToCanonical({
    characterId: 'augusta', factId: 'newField', canonicalValue: undefined,
    providerFacts: [fact('provider-a', 10)],
  }).state, 'PROVIDER_ONLY');
  assert.equal(compareCharacterTruthToCanonical({
    characterId: 'augusta', factId: 'maxEnergy', canonicalValue: 125,
    providerFacts: [fact('provider-a', 140)],
  }).state, 'CONFLICT');
});
