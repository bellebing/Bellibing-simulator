import assert from 'node:assert/strict';
import test from 'node:test';

import {
  REFERENCE_TEAM_01_GOLDEN_PENDING_IDS,
  assertReferenceTeam01GoldenRegression,
  getReferenceTeam01GoldenRegressionSnapshot,
} from '../src/factory/referenceTeam01GoldenRegression.ts';

test('Factory keeps Reference Team 01 as the exact fail-closed golden regression', () => {
  assert.doesNotThrow(() => assertReferenceTeam01GoldenRegression());

  const snapshot = getReferenceTeam01GoldenRegressionSnapshot();
  assert.equal(snapshot.teamProfileId, 'augusta-iuno-shorekeeper');
  assert.equal(snapshot.dependencyCoverageStatus, 'PARTIAL');
  assert.equal(snapshot.dpsReady, false);
  assert.deepEqual(snapshot.unresolvedDependencyIds, [...REFERENCE_TEAM_01_GOLDEN_PENDING_IDS]);
});
