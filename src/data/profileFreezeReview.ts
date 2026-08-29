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
const PROFILE_FREEZE_APPROVAL_ROWS: readonly ProfileFreezeApproval[] = [
  {
    characterId: 'augusta',
    presetId: 'augusta-standard',
    status: 'DPS_READY',
    checkedAt: '2026-08-29',
    patch: '3.6',
    backwardImpactReview: 'PROFILE-IMPACT-AUGUSTA-2026-08-29-01',
    requiredAdapterIds: ['profile-build-context-v1'],
    verifiedAdapterIds: ['profile-build-context-v1'],
    notes: [
      'Supported scope is S0 Augusta / Thunderflare Dominion R1 / Iuno + Shorekeeper / AUGUSTA_STD_V1 personal rotation DPS.',
      'The verified profile-build-context-v1 adapter resolves the canonical profile package into the exact existing Augusta evaluator context and is covered by the parity regression.',
      'This freeze does not imply teammate DPS or reusable generic versions of the locked Augusta team, shield-stack, buff-window, or state assumptions.',
    ],
  },
] as const;

export const PROFILE_FREEZE_APPROVALS: readonly ProfileFreezeApproval[] = PROFILE_FREEZE_APPROVAL_ROWS.map((approval) => {
  const issues = validateProfileFreezeAdapterClosure(approval);
  if (issues.length > 0) {
    throw new Error(`Invalid profile freeze adapter closure for ${approval.characterId}:${approval.presetId}: ${issues.join('; ')}`);
  }
  return approval;
});

/**
 * Semantic freeze checkpoint only. Catalog and readiness counts are intentionally
 * derived from the live registries instead of copied here by hand. This baseline
 * exists for compatibility-sensitive freeze metadata such as patch identity.
 */
export const PROFILE_READINESS_BASELINE = {
  patch: '3.6',
  checkedAt: '2026-08-29',
  notes: [
    'Catalog sizes and readiness disposition counts are derived from current registries and are not manual snapshot gates.',
    'Structural registry validation owns duplicate/default/cross-reference/raw-id failures; readiness owns source/preflight/freeze semantics.',
    'SOURCE_SEQUENCE_ONLY rotations remain ineligible for DPS_READY until an executable engine model and required adapters are verified.',
    'DommyMM/wuwabuild /builds is explicitly community-submitted build data and is not promoted to Bellibing canonical profile truth.',
  ],
} as const;
