import test from 'node:test';
import assert from 'node:assert/strict';

import {
  resolveSigrikaCiacconaCanonicalEntryState,
  SIGRIKA_CIACCONA_CANONICAL_ENTRY_SOURCE_REVIEW,
  validateSigrikaCiacconaCanonicalEntryContract,
} from '../src/combat/sigrikaCiacconaCanonicalEntryState.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';

test('canonical Sigrika team entry projects source-proven Ciaccona Solo Concert at relative t=0 only', () => {
  assert.deepEqual(validateSigrikaCiacconaCanonicalEntryContract(), []);
  const state = resolveSigrikaCiacconaCanonicalEntryState();
  assert.equal(state.adapterId, 'sigrika-ciaccona-canonical-entry-state-v1');
  assert.equal(state.presetId, 'sigrika-standard');
  assert.equal(state.teamProfileId, 'sigrika-qiuyuan-ciaccona');
  assert.equal(state.relativeEntrySeconds, 0);
  assert.equal(state.provesEntryStateOnly, true);
  assert.equal(state.provesActionTimestamps, false);
  assert.deepEqual(state.soloConcert, {
    adapterId: 'ciaccona-solo-concert-external-team-state-v1',
    sourceFactId: 'ciaccona-basic-solo-concert',
    sourceCharacterId: 'ciaccona',
    targetCharacterId: 'sigrika',
    statOrEffect: 'Aero DMG Bonus',
    value: 0.24,
    observedAtSeconds: 0,
    extrapolatesBeyondSnapshot: false,
  });
});

test('Ciaccona entry closure stays narrow and removes only its exact dependency', () => {
  assert.equal(
    SIGRIKA_CIACCONA_CANONICAL_ENTRY_SOURCE_REVIEW.pendingExecutionId,
    'team:ciaccona:solo-concert-aero-bonus-incoming-state-adapter',
  );
  assert.ok(SIGRIKA_CIACCONA_CANONICAL_ENTRY_SOURCE_REVIEW.boundaries.some((note) => note.includes('Qiuyuan 14-second transfer')));
  assert.ok(SIGRIKA_CIACCONA_CANONICAL_ENTRY_SOURCE_REVIEW.boundaries.some((note) => note.includes('Ciaccona remains the owner')));

  const live = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find((row) => row.presetId === 'sigrika-standard');
  assert.ok(live);
  assert.equal(live.pendingExecutionIds.includes('team:ciaccona:solo-concert-aero-bonus-incoming-state-adapter'), false);
  assert.equal(live.pendingExecutionIds.includes('team:qiuyuan:outro-echo-skill-amplification-incoming-state-adapter'), true);
  assert.equal(live.pendingExecutionIds.includes('rotation:sigrika-standard-source-sequence:denominator-timeline-adapter'), true);
});
