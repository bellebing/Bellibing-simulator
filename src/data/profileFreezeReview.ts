export type ProfileFreezeApprovalStatus = 'DPS_READY';

export interface ProfileFreezeApproval {
  readonly characterId: string;
  readonly presetId: string;
  readonly status: ProfileFreezeApprovalStatus;
  readonly checkedAt: string;
  readonly patch: string;
  readonly backwardImpactReview: string;
  readonly requiredAdapterIds: readonly string[];
  readonly verifiedAdapterIds: readonly string[];
  readonly notes: readonly string[];
}

export function validateProfileFreezeAdapterClosure(approval: ProfileFreezeApproval): readonly string[] {
  const issues: string[] = [];
  const required = new Set<string>();
  const verified = new Set<string>();

  for (const id of approval.requiredAdapterIds) {
    if (!id.trim()) issues.push('required adapter id is blank');
    if (required.has(id)) issues.push(`duplicate required adapter id ${id}`);
    required.add(id);
  }
  for (const id of approval.verifiedAdapterIds) {
    if (!id.trim()) issues.push('verified adapter id is blank');
    if (verified.has(id)) issues.push(`duplicate verified adapter id ${id}`);
    verified.add(id);
  }
  for (const id of required) {
    if (!verified.has(id)) issues.push(`required adapter ${id} is not verified`);
  }
  for (const id of verified) {
    if (!required.has(id)) issues.push(`verified adapter ${id} is not declared required`);
  }

  return issues;
}

/**
 * Explicit final approvals only.
 *
 * A verified composable profile package is not automatically DPS-ready. A row
 * belongs here only after the current-patch backward-impact review, required
 * specialized adapters and preflight blockers have all been closed.
 */
const PROFILE_FREEZE_APPROVAL_ROWS: readonly ProfileFreezeApproval[] = [] as const;

export const PROFILE_FREEZE_APPROVALS: readonly ProfileFreezeApproval[] = PROFILE_FREEZE_APPROVAL_ROWS.map((approval) => {
  const issues = validateProfileFreezeAdapterClosure(approval);
  if (issues.length > 0) {
    throw new Error(`Invalid profile freeze adapter closure for ${approval.characterId}:${approval.presetId}: ${issues.join('; ')}`);
  }
  return approval;
});

/**
 * Current roster/profile snapshot used to make silent coverage drift fail closed.
 * Update these expectations only as part of a reviewed profile/freeze change.
 */
export const PROFILE_READINESS_BASELINE = {
  patch: '3.6',
  checkedAt: '2026-08-29',
  expectedReleasedCharacterCount: 57,
  expectedCatalogCounts: {
    weaponRecommendations: 1,
    echoLoadouts: 1,
    statTargets: 1,
    teams: 1,
    rotations: 1,
    presets: 1,
  },
  expectedProfileCompletePendingFreezeCount: 1,
  expectedCharacterMechanicsSourceBlockedCount: 3,
  expectedProfileSourcePendingCount: 53,
  expectedDpsReadyCount: 0,
  notes: [
    'Current composable profile catalogs contain only the Augusta standard package.',
    'DommyMM/wuwabuild /builds is explicitly community-submitted build data and is not promoted to Bellibing canonical profile truth.',
    'Profile source backlog remains explicit until recommendation/team/rotation sources are reviewed in compatible contexts.',
  ],
} as const;
