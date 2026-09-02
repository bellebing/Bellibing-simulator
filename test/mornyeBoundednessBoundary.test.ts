import assert from 'node:assert/strict';
import test from 'node:test';

import { createMornyeBoundednessState } from '../src/combat/mornyeSupportEvents.ts';
import { MORNYE_CHARACTER_MECHANIC_FACTS } from '../src/data/characterMechanics/mornyeRawFacts.ts';

test('Mornye Boundedness preserves source OR semantics and keeps consumption unresolved', () => {
  const fact = MORNYE_CHARACTER_MECHANIC_FACTS.find(
    (row) => row.factId === 'mornye-inherent-boundedness',
  );
  assert.ok(fact && fact.kind === 'PASSIVE');
  if (!fact || fact.kind !== 'PASSIVE') throw new Error('Mornye Boundedness fact missing');

  assert.equal(fact.modelingStatus, 'PENDING_INTERPRETATION');
  assert.match(fact.effectSummary, /up to 3 times or prevents one fatal blow/);

  const state = createMornyeBoundednessState({
    atSeconds: 4,
    sourceActionId: 'DISTRIBUTED_ARRAY',
    cooldownReady: true,
  });
  assert.ok(state);
  assert.equal(state.sourceLimitRelationship, 'OR');
  assert.equal(state.consumptionModelingStatus, 'PENDING_INTERPRETATION');
  assert.equal(state.canResolveIncomingDamage, false);
  assert.equal(state.maxCappedHits, 3);
  assert.equal(state.cappedIncomingDamageMaxHpFraction, 0.30);
  assert.equal(state.maxFatalPreventions, 1);
  assert.equal(state.removalHealDefMultiplier, 1.50);
});
