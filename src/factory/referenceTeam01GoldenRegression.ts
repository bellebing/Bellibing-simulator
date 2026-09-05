import { REFERENCE_TEAM_01_EXECUTION_CONTEXT } from '../data/referenceTeam01ExecutionContext.ts';

export const REFERENCE_TEAM_01_GOLDEN_PENDING_IDS = [
  'iuno-wan-light-at-cap-trigger-semantics',
  'iuno-wan-light-augusta-event-overlap',
  'shorekeeper-stellar-symphony-augusta-window-overlap',
  'shorekeeper-rejuvenating-augusta-window-overlap',
  'shorekeeper-fallacy-team-atk-augusta-window-overlap',
  'shorekeeper-fallacy-wielder-er-stellarealm-state',
] as const;

export interface ReferenceTeam01GoldenRegressionSnapshot {
  readonly teamProfileId: string;
  readonly dependencyCoverageStatus: string;
  readonly dpsReady: boolean;
  readonly unresolvedDependencyIds: readonly string[];
}

export function getReferenceTeam01GoldenRegressionSnapshot(): ReferenceTeam01GoldenRegressionSnapshot {
  return {
    teamProfileId: REFERENCE_TEAM_01_EXECUTION_CONTEXT.teamProfileId,
    dependencyCoverageStatus: REFERENCE_TEAM_01_EXECUTION_CONTEXT.dependencyCoverageStatus,
    dpsReady: REFERENCE_TEAM_01_EXECUTION_CONTEXT.dpsReady,
    unresolvedDependencyIds: REFERENCE_TEAM_01_EXECUTION_CONTEXT.unresolvedDependencies.map((dependency) => dependency.id),
  };
}

export function assertReferenceTeam01GoldenRegression(): void {
  const snapshot = getReferenceTeam01GoldenRegressionSnapshot();
  if (snapshot.teamProfileId !== 'augusta-iuno-shorekeeper') {
    throw new Error(`Factory golden regression: unexpected team ${snapshot.teamProfileId}`);
  }
  if (snapshot.dependencyCoverageStatus !== 'PARTIAL') {
    throw new Error(
      `Factory golden regression: Reference Team coverage unexpectedly became ${snapshot.dependencyCoverageStatus}`,
    );
  }
  if (snapshot.dpsReady !== false) {
    throw new Error('Factory golden regression: Reference Team must remain dpsReady=false until all required evidence closes');
  }

  const actual = snapshot.unresolvedDependencyIds;
  if (actual.length !== REFERENCE_TEAM_01_GOLDEN_PENDING_IDS.length) {
    throw new Error(
      `Factory golden regression: expected ${REFERENCE_TEAM_01_GOLDEN_PENDING_IDS.length} pending dependencies, got ${actual.length}`,
    );
  }
  for (let index = 0; index < REFERENCE_TEAM_01_GOLDEN_PENDING_IDS.length; index += 1) {
    if (actual[index] !== REFERENCE_TEAM_01_GOLDEN_PENDING_IDS[index]) {
      throw new Error(
        `Factory golden regression: pending dependency mismatch at ${index}: expected ${REFERENCE_TEAM_01_GOLDEN_PENDING_IDS[index]}, got ${actual[index]}`,
      );
    }
  }
}
