import assert from 'node:assert/strict';
import test from 'node:test';

import { buildContextFromVerifiedPreset } from '../src/profileBuildContext.ts';
import {
  AEMEATH_STANDARD_EXECUTION_PREFLIGHT_20260901,
  AEMEATH_STANDARD_SOURCE_ACTION_FACT_MAP_20260901,
} from '../src/data/aemeathExecutionPreflight20260901.ts';
import { AEMEATH_DUET_SOURCE_CHECKPOINT_REVIEW_20260901 } from '../src/data/aemeathDuetCheckpointReview20260901.ts';
import { AEMEATH_CHARACTER_MECHANIC_FACTS } from '../src/data/characterMechanics/aemeathRawFacts.ts';
import { PROFILE_CATALOGS } from '../src/data/profileCatalogs.ts';

test('Aemeath execution preflight maps the canonical source sequence one-for-one to current mechanics facts', () => {
  const rotation = PROFILE_CATALOGS.rotations.find((row) => row.id === 'aemeath-standard-source-sequence');
  assert.ok(rotation);
  assert.equal(rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.deepEqual(
    AEMEATH_STANDARD_SOURCE_ACTION_FACT_MAP_20260901.map((row) => row.sourceAction),
    rotation.sourceSequence,
  );
  assert.deepEqual(
    AEMEATH_STANDARD_SOURCE_ACTION_FACT_MAP_20260901.map((row) => row.step),
    Array.from({ length: rotation.sourceSequence.length }, (_, index) => index + 1),
  );

  const factIds = new Set(AEMEATH_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId));
  for (const step of AEMEATH_STANDARD_SOURCE_ACTION_FACT_MAP_20260901) {
    assert.ok(step.factIds.length > 0, `step ${step.step}`);
    for (const factId of step.factIds) assert.equal(factIds.has(factId), true, `${step.step}:${factId}`);
  }
});

test('Aemeath form transitions are explicit and never made globally persistent', () => {
  const byStep = new Map(AEMEATH_STANDARD_SOURCE_ACTION_FACT_MAP_20260901.map((row) => [row.step, row]));
  assert.deepEqual([byStep.get(1)?.formBefore, byStep.get(1)?.formAfter], ['SOURCE_DEPENDENT', 'MECH']);
  assert.deepEqual([byStep.get(8)?.formBefore, byStep.get(8)?.formAfter], ['MECH', 'AEMEATH']);
  assert.deepEqual([byStep.get(12)?.formBefore, byStep.get(12)?.formAfter], ['AEMEATH', 'MECH']);
  assert.deepEqual([byStep.get(14)?.formBefore, byStep.get(14)?.formAfter], ['MECH', 'AEMEATH']);
  assert.deepEqual([byStep.get(15)?.formBefore, byStep.get(15)?.formAfter], ['AEMEATH', 'MECH']);
});

test('current canonical source rotation authorizes both Duet checkpoints without inventing Synchronization arithmetic', () => {
  const rotation = PROFILE_CATALOGS.rotations.find((row) => row.id === 'aemeath-standard-source-sequence');
  assert.ok(rotation);

  const review = AEMEATH_DUET_SOURCE_CHECKPOINT_REVIEW_20260901;
  assert.equal(review.semantics, 'SOURCE_SEQUENCE_ELIGIBILITY_ONLY');
  assert.equal(review.engineResourceArithmeticAvailable, false);
  assert.deepEqual(
    review.checkpoints.map((checkpoint) => ({
      step: checkpoint.step,
      sourceAction: checkpoint.sourceAction,
      sourceSequenceAction: rotation.sourceSequence[checkpoint.step - 1],
      prerequisiteSourceAction: rotation.sourceSequence[checkpoint.prerequisiteBasicStage4Step - 1],
      minimumSynchronizationRate: checkpoint.minimumSynchronizationRate,
      sourceSequenceAuthorizesCast: checkpoint.sourceSequenceAuthorizesCast,
      exactSynchronizationRateBeforeCast: checkpoint.exactSynchronizationRateBeforeCast,
    })),
    [
      {
        step: 8,
        sourceAction: 'Skill: Duet Encore',
        sourceSequenceAction: 'Skill: Duet Encore',
        prerequisiteSourceAction: 'Basic: Mech 4 (cancel first slash via Skill)',
        minimumSynchronizationRate: 100,
        sourceSequenceAuthorizesCast: true,
        exactSynchronizationRateBeforeCast: null,
      },
      {
        step: 12,
        sourceAction: 'Skill: Duet Overture',
        sourceSequenceAction: 'Skill: Duet Overture',
        prerequisiteSourceAction: 'Basic: Aemeath 4 (cancel endlag via Skill)',
        minimumSynchronizationRate: 100,
        sourceSequenceAuthorizesCast: true,
        exactSynchronizationRateBeforeCast: null,
      },
    ],
  );
});

test('Aemeath preflight closes predecessor entry states and source Duet checkpoints while numeric Synchronization, timing, denominator and ER remain fail-closed', () => {
  const review = AEMEATH_STANDARD_EXECUTION_PREFLIGHT_20260901;
  assert.equal(review.sourceSequenceStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.equal(review.engineModeled, false);
  assert.equal(review.dpsReady, false);
  assert.equal(review.exactRotationDurationSeconds, null);
  assert.equal(review.exactDpsDenominatorSeconds, null);
  assert.equal(review.exactTeamSpecificEnergyRegenGate, null);
  assert.equal(review.buildContextAllowed, false);
  assert.equal(review.freezeAllowed, false);

  for (const closed of [
    'incoming:denia:aemeath-fusion-burst-predecessor-state',
    'incoming:chisa:aemeath-negative-status-predecessor-state',
    'character:aemeath:duet-threshold-proof',
  ]) {
    assert.equal(review.closedExecutionIds.includes(closed), true, closed);
    assert.equal(review.blockedExecutionIds.includes(closed), false, closed);
  }

  for (const blocker of [
    'echo:echo-60001915:sigillum-active-skill-scaling-stat',
    'character:aemeath:synchronization-routine-gain-values',
    'rotation:aemeath-standard-source-sequence:timing-denominator',
    'rotation:aemeath-standard-source-sequence:engine-model',
  ]) {
    assert.equal(review.blockedExecutionIds.includes(blocker), true, blocker);
  }

  assert.deepEqual(
    review.incomingStateDependencies.map((dependency) => [dependency.producerCharacterId, dependency.status]),
    [['denia', 'SOURCE_PROVEN'], ['chisa', 'SOURCE_PROVEN']],
  );
});

test('Aemeath reusable semantic closures do not manufacture a BuildContext', () => {
  const review = AEMEATH_STANDARD_EXECUTION_PREFLIGHT_20260901;
  assert.ok(review.closedExecutionIds.includes('echo:echo-60001915:sigillum-character-restriction-adapter'));
  assert.ok(review.closedExecutionIds.some((id) => id.includes('EP-LIB-DEF:status-infliction-window-semantics')));
  assert.ok(review.closedExecutionIds.some((id) => id.includes('S27_5PC_CR:status-infliction-window-semantics')));
  assert.ok(review.closedExecutionIds.includes('incoming:denia:aemeath-fusion-burst-predecessor-state'));
  assert.ok(review.closedExecutionIds.includes('incoming:chisa:aemeath-negative-status-predecessor-state'));
  assert.ok(review.closedExecutionIds.includes('character:aemeath:duet-threshold-proof'));

  assert.throws(
    () => buildContextFromVerifiedPreset('aemeath-standard', []),
    /SOURCE_SEQUENCE_ONLY|ENGINE_MODELED|executable/i,
  );
});
