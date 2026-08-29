import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';
import { buildProfileAdapterDependencyMatrix } from '../src/profileAdapterDependencyMatrix.ts';

const matrix = buildProfileAdapterDependencyMatrix();
const expectedDependencyCount = PROFILE_BACKWARD_IMPACT_REVIEWS_V36.reduce(
  (sum, review) => sum + review.pendingExecutionIds.length,
  0,
);

if (matrix.authorizesExecution !== false) {
  throw new Error('Profile adapter dependency matrix must never authorize execution.');
}
if (matrix.dependencyCount !== expectedDependencyCount) {
  throw new Error(`Adapter dependency coverage mismatch: ${matrix.dependencyCount}/${expectedDependencyCount}.`);
}
if (matrix.reusablePriorityQueue.some((row) => row.implementationScope !== 'REUSABLE_PRIMITIVE_CANDIDATE')) {
  throw new Error('Reusable priority queue contains a profile-specific execution row.');
}
if (matrix.reusablePriorityQueue.some((row) => row.syntacticPrimitiveKey === 'rotation:engine-model')) {
  throw new Error('Profile-specific rotation engine models must not be prioritized as one generic adapter.');
}

console.log(`Profile adapter dependency matrix: ${matrix.profileCount} profiles / ${matrix.dependencyCount} pending dependencies`);
console.log(`Pending profiles: ${matrix.pendingProfileCount}`);
console.log('Top reusable primitive candidates:');
for (const row of matrix.reusablePriorityQueue.slice(0, 10)) {
  console.log(`- ${row.syntacticPrimitiveKey}: profiles=${row.profileCount}, characters=${row.characterCount}, dependencies=${row.dependencyCount}`);
}
