import test from 'node:test';
import assert from 'node:assert/strict';

import { SIGRIKA_CANONICAL_PREDECESSOR_ECHO_TRIGGER_REVIEW_20260901 } from '../src/data/sigrikaCanonicalPredecessorEchoTriggerReview20260901.ts';
import {
  SIGRIKA_PRYDWEN_CALCULATION_CONTEXT_20260901,
  validateSigrikaPrydwenCalculationContext,
} from '../src/data/sigrikaPrydwenCalculationContext20260901.ts';
import { SIGRIKA_STANDARD_PENDING_EXECUTION_IDS } from '../src/data/sigrikaExecutionPreflight20260901.ts';

test('Prydwen Sigrika calculation context source-proves exact five predecessor triggers', () => {
  assert.deepEqual(validateSigrikaPrydwenCalculationContext(), []);

  const context = SIGRIKA_PRYDWEN_CALCULATION_CONTEXT_20260901;
  assert.equal(context.registryBindingStatus, 'SOURCE_PROVEN_CALCULATION_CONTEXT_NOT_PROFILE_REGISTRY_BOUND');
  assert.deepEqual(context.supportEchoBindings, {
    qiuyuan: 'Impermanence Heron',
    ciaccona: 'Nightmare: Kelpie',
  });
  assert.deepEqual(context.predecessorTriggerAccounting, {
    qiuyuanDistinctTriggerCount: 4,
    ciacconaDistinctTriggerCount: 1,
    exactDistinctTriggerCount: 5,
    exactEntrySoliskinVitality: 50,
    exactEntryBlessingOfRunesStacks: 5,
  });
  assert.deepEqual(context.closesPendingExecutionIds, []);
});

test('exact Prydwen calculation point does not collapse canonical registry-bound predecessor interval', () => {
  const canonical = SIGRIKA_CANONICAL_PREDECESSOR_ECHO_TRIGGER_REVIEW_20260901.preSigrikaEntryBounds;
  assert.equal(canonical.guaranteedDistinctTriggerCount, 4);
  assert.equal(canonical.maximumSourceDescribedTriggerCount, 5);
  assert.equal(canonical.soliskinVitalityMin, 40);
  assert.equal(canonical.soliskinVitalityMax, 50);
  assert.equal(canonical.blessingOfRunesStacksMin, 4);
  assert.equal(canonical.blessingOfRunesStacksMax, 5);
  assert.equal(canonical.exactEntryGaugeStateKnown, false);
  assert.equal(SIGRIKA_STANDARD_PENDING_EXECUTION_IDS.length, 10);
});
