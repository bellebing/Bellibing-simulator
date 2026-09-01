import test from 'node:test';
import assert from 'node:assert/strict';

import {
  createLingyangCallerSuppliedTimeline,
  evaluateLingyangDiligentPairFromCallerTimeline,
  lingyangLionsVigorCastEventFromCallerTimeline,
  lingyangMechCastEventFromCallerTimeline,
  lingyangMoongazersSigilCastEventsFromCallerTimeline,
  LINGYANG_CALLER_SUPPLIED_TIMELINE_REVIEW,
} from '../src/combat/lingyangCallerSuppliedTimeline.ts';
import { LINGYANG_STANDARD_SOURCE_SEQUENCE } from '../src/combat/lingyangBurstComboActionMapping.ts';
import { ROTATION_ENGINE_REGISTRATIONS } from '../src/rotationEngineRegistry.ts';
import { PROFILE_HORIZONTAL_GREEN_LANE_ROTATIONS } from '../src/data/profileHorizontalGreenLane20260830.ts';

const BASE_TIMES = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19] as const;

test('caller-supplied Lingyang timeline preserves exact external times without promoting canonical execution', () => {
  const timeline = createLingyangCallerSuppliedTimeline(BASE_TIMES);
  assert.equal(timeline.adapterId, 'lingyang-canonical-caller-timeline-v1');
  assert.equal(timeline.steps.length, 15);
  assert.equal(timeline.steps.length, LINGYANG_STANDARD_SOURCE_SEQUENCE.length);
  assert.equal(timeline.steps[0]?.atSeconds, 5);
  assert.equal(timeline.steps[14]?.atSeconds, 19);
  assert.equal(timeline.canonicalExecutionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.equal(timeline.authorizesEngineModel, false);
  assert.equal(timeline.authorizesRotationSeconds, false);

  const canonical = PROFILE_HORIZONTAL_GREEN_LANE_ROTATIONS.find((row) => row.id === 'lingyang-standard-rotation');
  assert.ok(canonical);
  assert.equal(canonical.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.equal(canonical.engineModelId, undefined);
  assert.equal(ROTATION_ENGINE_REGISTRATIONS.some((row) => row.characterId === 'lingyang'), false);
  assert.deepEqual(LINGYANG_CALLER_SUPPLIED_TIMELINE_REVIEW.closesPendingExecutionIds, []);
});

test('timeline retains canonical Feral ambiguity instead of substituting the current 16-step source', () => {
  const timeline = createLingyangCallerSuppliedTimeline(BASE_TIMES);
  assert.equal(timeline.steps.length, 15);
  const feral = timeline.steps[4];
  assert.ok(feral);
  assert.equal(feral.sourceStep, 'Basic: Feral Gyrate');
  assert.equal(feral.mapping.status, 'AMBIGUOUS_CHARACTER_ACTION');
  if (feral.mapping.status !== 'AMBIGUOUS_CHARACTER_ACTION') return;
  assert.deepEqual(feral.mapping.candidateActionFactIds, [
    'lingyang-forte-feral-gyrate-1',
    'lingyang-forte-feral-gyrate-2',
  ]);
});

test('caller timeline projects exact Mech, Moongazer and Lion’s Vigor event identities at caller times only', () => {
  const timeline = createLingyangCallerSuppliedTimeline(BASE_TIMES);
  assert.deepEqual(lingyangMechCastEventFromCallerTimeline(timeline), {
    kind: 'ECHO_ACTIVE_CAST',
    actorId: 'lingyang',
    echoId: 'echo-60000485',
    atSeconds: 5,
  });
  assert.deepEqual(lingyangMoongazersSigilCastEventsFromCallerTimeline(timeline), [
    { kind: 'INTRO_SKILL_CAST', actorId: 'lingyang', atSeconds: 6 },
    { kind: 'RESONANCE_LIBERATION_CAST', actorId: 'lingyang', atSeconds: 7 },
  ]);
  assert.deepEqual(lingyangLionsVigorCastEventFromCallerTimeline(timeline), {
    kind: 'RESONANCE_LIBERATION_CAST',
    actorId: 'lingyang',
    atSeconds: 7,
    actionFactId: 'lingyang-liberation-strive-lions-vigor',
  });
});

test('caller timeline evaluates canonical Diligent pairs only with caller-proven Striding state', () => {
  const timeline = createLingyangCallerSuppliedTimeline(BASE_TIMES);
  assert.deepEqual(evaluateLingyangDiligentPairFromCallerTimeline({
    timeline,
    pairIndex: 0,
    stridingLionActiveAtBasic: true,
    stridingLionActiveAtMountainRoamer: true,
  }), {
    status: 'TRIGGERED',
    deltaSeconds: 1,
    additionalDamageRatioOfMountainRoamer: 1.5,
    additionalDamageClass: 'RESONANCE_SKILL',
  });
  assert.deepEqual(evaluateLingyangDiligentPairFromCallerTimeline({
    timeline,
    pairIndex: 0,
    stridingLionActiveAtBasic: false,
    stridingLionActiveAtMountainRoamer: true,
  }), { status: 'NOT_DURING_STRIDING_LION' });
});

test('Diligent exact 3.000s boundary remains unresolved and >3s remains outside under explicit timestamps', () => {
  const exactTimeline = createLingyangCallerSuppliedTimeline([
    5, 6, 7, 8, 9, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  ]);
  const exact = evaluateLingyangDiligentPairFromCallerTimeline({
    timeline: exactTimeline,
    pairIndex: 0,
    stridingLionActiveAtBasic: true,
    stridingLionActiveAtMountainRoamer: true,
  });
  assert.equal(exact.status, 'SOURCE_BOUNDARY_UNRESOLVED');
  if (exact.status === 'SOURCE_BOUNDARY_UNRESOLVED') assert.equal(exact.deltaSeconds, 3);

  const outsideTimeline = createLingyangCallerSuppliedTimeline([
    5, 6, 7, 8, 9, 12.5, 13, 14, 15, 16, 17, 18, 19, 20, 21,
  ]);
  assert.deepEqual(evaluateLingyangDiligentPairFromCallerTimeline({
    timeline: outsideTimeline,
    pairIndex: 0,
    stridingLionActiveAtBasic: true,
    stridingLionActiveAtMountainRoamer: true,
  }), { status: 'OUTSIDE_WINDOW', deltaSeconds: 3.5 });
});

test('caller timeline validates only length, finite non-negative time and canonical non-decreasing order', () => {
  assert.throws(() => createLingyangCallerSuppliedTimeline(BASE_TIMES.slice(0, 14)), /exactly 15 canonical step timestamps/);
  assert.throws(() => createLingyangCallerSuppliedTimeline([
    5, 6, 7, 8, 9, 10, Number.NaN, 12, 13, 14, 15, 16, 17, 18, 19,
  ]), /finite and non-negative/);
  assert.throws(() => createLingyangCallerSuppliedTimeline([
    5, 6, 7, 8, 9, 10, 9.5, 12, 13, 14, 15, 16, 17, 18, 19,
  ]), /preserve canonical source order/);

  const equalTimeTimeline = createLingyangCallerSuppliedTimeline([
    5, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  ]);
  assert.equal(equalTimeTimeline.steps[0]?.atSeconds, 5);
  assert.equal(equalTimeTimeline.steps[1]?.atSeconds, 5);
  assert.throws(() => evaluateLingyangDiligentPairFromCallerTimeline({
    timeline: equalTimeTimeline,
    pairIndex: 4,
    stridingLionActiveAtBasic: true,
    stridingLionActiveAtMountainRoamer: true,
  }), /pair index must be an integer from 0 through 3/);
});
