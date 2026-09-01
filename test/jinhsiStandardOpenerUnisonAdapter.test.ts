import assert from 'node:assert/strict';
import test from 'node:test';

import {
  JINHSI_STANDARD_OPENER_FIRST_UNISON_SOURCE_REVIEW,
  JINHSI_STANDARD_OPENER_UNISON_PENDING_EXECUTION_ID,
  resolveJinhsiStandardOpenerFirstUnison,
} from '../src/combat/jinhsiStandardOpenerUnisonAdapter.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';
import { PROFILE_EXECUTION_DEPENDENCY_CLOSURES_20260901 } from '../src/data/profileExecutionClosures20260901.ts';
import { PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { resolveBuildPreset } from '../src/profileRegistry.ts';

const resolved = resolveBuildPreset(PROFILE_REGISTRY, 'jinhsi-standard-opener');

test('canonical combat-start Standard Opener source proves the first Illuminous -> Unison Outro path only', () => {
  const result = resolveJinhsiStandardOpenerFirstUnison(resolved.rotation.sourceSequence ?? []);
  assert.equal(result.firstIlluminousGrantReady, true);
  assert.equal(result.canonicalOutroUsesUnison, true);
  assert.equal(result.concertoRequiredForCanonicalOutro, false);
  assert.equal(result.laterLoopTimingAuthorized, false);
  assert.equal(result.sourceScope, 'COMBAT_START_STANDARD_OPENER_FIRST_ILLUMINOUS_ONLY');
});

test('first-Unison resolver fails closed on opener drift and never accepts loop-like variants', () => {
  const source = resolved.rotation.sourceSequence ?? [];
  assert.throws(
    () => resolveJinhsiStandardOpenerFirstUnison(source.slice(1)),
    /source sequence length drift/,
  );
  assert.throws(
    () => resolveJinhsiStandardOpenerFirstUnison(source.map((step, index) => index === 0 ? 'Intro' : step)),
    /source sequence drift at step 1/,
  );
});

test('canonical backward-impact catalog removes exactly the Jinhsi Unison availability dependency', () => {
  const closure = PROFILE_EXECUTION_DEPENDENCY_CLOSURES_20260901[0];
  assert.ok(closure);
  assert.equal(closure.pendingExecutionId, JINHSI_STANDARD_OPENER_UNISON_PENDING_EXECUTION_ID);
  assert.equal(closure.primitiveId, JINHSI_STANDARD_OPENER_FIRST_UNISON_SOURCE_REVIEW.primitiveId);
  assert.deepEqual(closure.presetIds, ['jinhsi-standard-opener']);

  const review = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.presetId === 'jinhsi-standard-opener');
  assert.ok(review);
  assert.equal(review.pendingExecutionIds.includes(JINHSI_STANDARD_OPENER_UNISON_PENDING_EXECUTION_ID), false);
  assert.equal(review.pendingExecutionIds.length, 7);
  assert.ok(review.notes.some((note) => note.includes(closure.closureId)));
  assert.ok(review.pendingExecutionIds.includes('character:jinhsi:jinhsi-forte-incandescence-damage-multiplier:resource-timeline-adapter'));
  assert.ok(review.pendingExecutionIds.includes('rotation:jinhsi-standard-opener-source-sequence:engine-model'));
});
