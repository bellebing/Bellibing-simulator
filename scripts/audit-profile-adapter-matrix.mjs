import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from '../src/data/profileBackwardImpactReviewCatalog.ts';
import { buildProfileAdapterDependencyMatrix } from '../src/profileAdapterDependencyMatrix.ts';
import {
  buildProfileExecutionWorkQueue,
  validateExecutionSemanticReviews,
} from '../src/profileExecutionWorkQueue.ts';

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

const semanticIssues = validateExecutionSemanticReviews(matrix);
if (semanticIssues.length > 0) {
  throw new Error(`Execution semantic review coverage invalid: ${semanticIssues.join('; ')}`);
}
const workQueue = buildProfileExecutionWorkQueue(matrix);
if (workQueue.authorizesExecution !== false) {
  throw new Error('Profile execution work queue must never authorize execution.');
}
if (workQueue.summary.totalEdges !== matrix.dependencyCount) {
  throw new Error(`Execution work queue coverage mismatch: ${workQueue.summary.totalEdges}/${matrix.dependencyCount}.`);
}
const classifiedTotal = workQueue.summary.unreviewedEdges
  + workQueue.summary.semanticallyReviewedImplementationPendingEdges
  + workQueue.summary.primitiveAvailableRequiresTimelineEdges
  + workQueue.summary.blockedSourceConflictEdges
  + workQueue.summary.profileSpecificExecutionEdges;
if (classifiedTotal !== matrix.dependencyCount) {
  throw new Error(`Execution semantic disposition mismatch: ${classifiedTotal}/${matrix.dependencyCount}.`);
}
if (workQueue.actionableSharedQueue.some((row) =>
  row.semanticStatus !== 'UNREVIEWED'
  && row.semanticStatus !== 'SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING')) {
  throw new Error('Actionable shared queue contains a covered, blocked or profile-specific row.');
}

console.log(`Profile adapter dependency matrix: ${matrix.profileCount} profiles / ${matrix.dependencyCount} pending dependencies`);
console.log(`Pending profiles: ${matrix.pendingProfileCount}`);
console.log(`Semantic edge disposition: actionable=${workQueue.summary.actionableSharedEdges}, primitive-needs-timeline=${workQueue.summary.primitiveAvailableRequiresTimelineEdges}, source-blocked=${workQueue.summary.blockedSourceConflictEdges}, profile-specific=${workQueue.summary.profileSpecificExecutionEdges}`);
console.log('Top actionable shared execution work:');
for (const row of workQueue.actionableSharedQueue.slice(0, 10)) {
  console.log(`- ${row.actionKey}: status=${row.semanticStatus}, profiles=${row.profileCount}, characters=${row.characterCount}, dependencies=${row.dependencyCount}`);
}
