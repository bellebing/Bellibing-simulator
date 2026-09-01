import test from 'node:test';
import assert from 'node:assert/strict';

import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';
import { buildProfileAdapterDependencyMatrix } from '../src/profileAdapterDependencyMatrix.ts';

test('profile adapter matrix preserves every canonical pendingExecutionId exactly once', () => {
  const matrix = buildProfileAdapterDependencyMatrix();
  const sourcePendingIds = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.flatMap((review) =>
    review.pendingExecutionIds.map((pendingExecutionId) => `${review.reviewId}|${pendingExecutionId}`),
  ).sort();
  const matrixPendingIds = matrix.edges.map((edge) => `${edge.reviewId}|${edge.pendingExecutionId}`).sort();

  assert.deepEqual(matrixPendingIds, sourcePendingIds);
  assert.equal(matrix.reviewCount, 19);
  assert.equal(matrix.profileCount, 19);
  assert.equal(matrix.pendingProfileCount, 17);
  assert.equal(matrix.dependencyCount, 83);
  assert.equal(matrix.authorizesExecution, false);
  assert.equal(
    matrix.edges.some((edge) => edge.pendingExecutionId === 'echo:echo-60001065:fleurdelys-character-restriction-adapter'),
    false,
  );
  assert.equal(
    matrix.edges.some((edge) => edge.pendingExecutionId === 'weapon:woodland-aria:WA-AERO:trigger-uptime-adapter'),
    false,
  );
  assert.equal(
    matrix.edges.some((edge) => edge.pendingExecutionId === 'weapon:woodland-aria:WA-AERO-RES:target-state-adapter'),
    false,
  );
  assert.equal(
    matrix.edges.filter((edge) => edge.presetId === 'sigrika-standard').length,
    11,
  );
  for (const closedId of [
    'profile:sigrika-standard:energy-regen-hard-gate-adapter',
    'character:sigrika:decipher-elucidated-eligibility-adapter',
    'character:sigrika:runic-heavy-branch-selection-adapter',
    'character:sigrika:learn-my-true-name-full-stop-adapter',
  ]) {
    assert.equal(matrix.edges.some((edge) => edge.pendingExecutionId === closedId), false, closedId);
  }
});

test('reusable adapter priority is fanout-based while rotation engine models stay profile-specific', () => {
  const matrix = buildProfileAdapterDependencyMatrix();
  const rotation = matrix.primitives.find((row) => row.syntacticPrimitiveKey === 'rotation:engine-model');
  assert.ok(rotation);
  assert.equal(rotation.implementationScope, 'PROFILE_SPECIFIC_EXECUTION');
  assert.equal(rotation.profileCount, 17);
  assert.equal(matrix.reusablePriorityQueue.includes(rotation), false);

  const heron = matrix.primitives.find((row) => row.syntacticPrimitiveKey === 'echo:impermanence-heron-active-transfer-adapter');
  assert.ok(heron);
  assert.equal(heron.implementationScope, 'REUSABLE_PRIMITIVE_CANDIDATE');
  assert.equal(heron.profileCount, 5);
  assert.deepEqual(heron.characterIds, ['aalto', 'iuno', 'lumi', 'yinlin', 'zhezhi']);

  const weaponTrigger = matrix.primitives.find((row) => row.syntacticPrimitiveKey === 'weapon:trigger-uptime-adapter');
  assert.ok(weaponTrigger);
  assert.equal(weaponTrigger.profileCount, 4);
  assert.equal(weaponTrigger.dependencyCount, 5);
  assert.deepEqual(weaponTrigger.characterIds, ['calcharo', 'carlotta', 'iuno', 'lumi']);

  const outroTransfer = matrix.primitives.find((row) => row.syntacticPrimitiveKey === 'sonata:outro-transfer-adapter');
  assert.ok(outroTransfer);
  assert.equal(outroTransfer.profileCount, 4);
  assert.deepEqual(outroTransfer.characterIds, ['cantarella', 'lumi', 'yinlin', 'zhezhi']);

  const targetState = matrix.primitives.find((row) => row.syntacticPrimitiveKey === 'weapon:target-state-adapter');
  assert.equal(targetState, undefined, 'the tranche closed both canonical Aero-Erosion target-state edges');

  assert.equal(matrix.reusablePriorityQueue[0]?.syntacticPrimitiveKey, 'echo:impermanence-heron-active-transfer-adapter');
  assert.equal(matrix.reusablePriorityQueue[1]?.syntacticPrimitiveKey, 'weapon:trigger-uptime-adapter');
  assert.equal(matrix.reusablePriorityQueue[2]?.syntacticPrimitiveKey, 'sonata:outro-transfer-adapter');
});

test('new green-lane execution gaps stay grouped by generic mechanic where semantics actually match', () => {
  const matrix = buildProfileAdapterDependencyMatrix();
  const newPresetIds = new Set([
    'lumi-hybrid',
    'yinlin-moonlit',
    'calcharo-standard',
    'cantarella-standard',
    'carlotta-standard',
    'changli-standard',
    'chisa-standard',
  ]);
  const newEdges = matrix.edges.filter((edge) => newPresetIds.has(edge.presetId));
  assert.equal(newEdges.length, 32);

  const byPrimitive = new Map<string, Set<string>>();
  for (const edge of newEdges) {
    const profiles = byPrimitive.get(edge.syntacticPrimitiveKey) ?? new Set<string>();
    profiles.add(edge.presetId);
    byPrimitive.set(edge.syntacticPrimitiveKey, profiles);
  }

  assert.equal(byPrimitive.get('weapon:trigger-uptime-adapter')?.size, 3);
  assert.equal(byPrimitive.get('sonata:outro-transfer-adapter')?.size, 3);
  assert.equal(byPrimitive.get('echo:impermanence-heron-active-transfer-adapter')?.size, 2);
  assert.equal(byPrimitive.get('sonata:trigger-stack-adapter')?.size, 2);
  assert.equal(byPrimitive.get('sonata:trigger-uptime-adapter')?.size, 2);

  const changliEcho = newEdges.find((edge) => edge.presetId === 'changli-standard' && edge.layer === 'echo');
  assert.equal(changliEcho, undefined, 'Changli source rotation does not cast Nightmare: Inferno Rider, so no active-Echo dependency is invented.');
});

test('syntactic reuse grouping never claims semantic execution closure', () => {
  const matrix = buildProfileAdapterDependencyMatrix();
  assert.ok(matrix.notes.some((note) => /does not prove shared semantic behavior/.test(note)));
  assert.ok(matrix.notes.some((note) => /No dependency row authorizes ENGINE_MODELED or DPS_READY/.test(note)));
});
