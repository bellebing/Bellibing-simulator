import assert from 'node:assert/strict';
import test from 'node:test';

import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';
import {
  GALBRENA_EXECUTION_DEPENDENCY_IDS_20260831,
  GALBRENA_EXECUTION_PREFLIGHT_20260831,
} from '../src/data/galbrenaExecutionPreflight20260831.ts';
import { PROFILE_CATALOGS, PROFILE_REGISTRY } from '../src/data/profileCatalogs.ts';
import { PROFILE_ADAPTER_DEPENDENCY_MATRIX } from '../src/profileAdapterDependencyMatrix.ts';
import { auditProfileReadiness } from '../src/profileReadinessRegistry.ts';
import { resolveBuildPreset } from '../src/profileRegistry.ts';

test('Galbrena preflight pins the exact canonical profile package from current registry', () => {
  const resolved = resolveBuildPreset(PROFILE_REGISTRY, 'galbrena-standard');
  const expected = GALBRENA_EXECUTION_PREFLIGHT_20260831.canonicalPackage;

  assert.equal(resolved.preset.characterId, 'galbrena');
  assert.equal(resolved.preset.id, expected.presetId);
  assert.equal(resolved.weaponRecommendation.id, expected.weaponRecommendationProfileId);
  assert.equal(resolved.weaponRecommendation.defaultWeaponId, expected.weaponId);
  assert.equal(resolved.echoLoadout.id, expected.echoLoadoutProfileId);
  assert.deepEqual(resolved.echoLoadout.sonataSetIds, [expected.sonataSetId]);
  assert.equal(resolved.echoLoadout.mainEchoId, expected.mainEchoId);
  assert.equal(resolved.statTarget.id, expected.statTargetProfileId);
  assert.equal(resolved.team.id, expected.teamProfileId);
  assert.equal(resolved.rotation.id, expected.rotationProfileId);
  assert.equal(resolved.rotation.executionStatus, 'SOURCE_SEQUENCE_ONLY');
  assert.equal(resolved.rotation.sourceSequence?.length, expected.sourceSequenceActionCount);
  assert.equal(resolved.rotation.sourceSequence?.some((step) => /echo/i.test(step)), false);
});

test('Galbrena current source sequence remains exact and is not silently normalized around Corrosaurus', () => {
  const rotation = PROFILE_CATALOGS.rotations.find((row) => row.id === 'galbrena-standard-source-sequence')!;
  assert.deepEqual(rotation.sourceSequence, [
    'Intro',
    'Basic P2',
    'Basic P3',
    'Basic P4',
    'Basic P2',
    'Basic P3',
    'Skill: Ascent of Malice (interrupt on hit)',
    'Ultimate',
    'Forte: Basic P2',
    'Forte: Basic P3',
    'Forte: Basic P4',
    'Forte: Basic P5',
    'Forte: Basic P3',
    'Forte: Basic P4',
    'Forte: Basic P5 (Swap)',
    'Outro',
  ]);
});

test('Galbrena backward-impact review publishes the preflight dependency set into the generic queue', () => {
  const review = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.find(
    (row) => row.reviewId === 'PROFILE-IMPACT-GALBRENA-STANDARD-2026-08-31-01',
  )!;
  assert.equal(review.characterId, 'galbrena');
  assert.equal(review.presetId, 'galbrena-standard');
  assert.equal(review.result, 'REVIEWED_WITH_PENDING_EXECUTION');
  assert.deepEqual(review.pendingExecutionIds, GALBRENA_EXECUTION_DEPENDENCY_IDS_20260831);

  for (const dependencyId of GALBRENA_EXECUTION_DEPENDENCY_IDS_20260831) {
    assert.ok(
      PROFILE_ADAPTER_DEPENDENCY_MATRIX.edges.some(
        (edge) => edge.characterId === 'galbrena' && edge.pendingExecutionId === dependencyId,
      ),
      `missing Galbrena dependency edge ${dependencyId}`,
    );
  }
});

test('Galbrena preflight stays blocked instead of fabricating DPS readiness', () => {
  const preflight = GALBRENA_EXECUTION_PREFLIGHT_20260831;
  assert.equal(preflight.disposition, 'BLOCKED_AT_SOURCE_BOUNDARY');
  assert.ok(preflight.blockers.some((row) => row.blockerId === 'GALBRENA-BLOCK-RESOURCE-TRANSITIONS'));
  assert.ok(preflight.blockers.some((row) => row.blockerId === 'GALBRENA-BLOCK-ROTATION-TIMING'));
  assert.ok(preflight.blockers.some((row) => row.blockerId === 'GALBRENA-BLOCK-TEAM-UPTIME'));
  assert.ok(preflight.blockers.some((row) => row.blockerId === 'GALBRENA-BLOCK-COMBAT-CONTEXT'));
  assert.ok(preflight.blockers.some((row) => row.blockerId === 'GALBRENA-POLICY-PARTIAL-UPGRADE-STOP'));

  const readiness = auditProfileReadiness();
  const galbrena = readiness.characters.find((row) => row.characterId === 'galbrena')!;
  assert.equal(galbrena.disposition, 'PROFILE_COMPLETE_PENDING_FREEZE');
  assert.equal(galbrena.freezeApprovalPresetIds.length, 0);
});
