import { CHARACTER_CATALOG } from './data/characters.ts';
import {
  CHARACTER_INTRINSIC_BY_ID,
  RELEASED_CHARACTER_INTRINSIC_PENDING,
} from './data/characterIntrinsicStats.ts';
import {
  auditCharacterMechanicsSourceReview,
} from './data/characterMechanicsSourceReview.ts';
import { PROFILE_BACKWARD_IMPACT_REVIEWS_V36 } from './data/profileBackwardImpactReviewCatalog.ts';
import {
  PROFILE_FREEZE_APPROVALS,
  PROFILE_READINESS_BASELINE,
  validateProfileFreezeAdapterClosure,
  type ProfileFreezeApproval,
} from './data/profileFreezeReview.ts';
import { PROFILE_CATALOGS, PROFILE_REGISTRY } from './data/profileCatalogs.ts';
import { resolveBuildPreset } from './profileRegistry.ts';
import type { CharacterBuildPreset, ResolvedBuildPreset } from './profileDomain.ts';

export type CharacterProfileReadinessDisposition =
  | 'DPS_READY'
  | 'PROFILE_COMPLETE_PENDING_FREEZE'
  | 'CHARACTER_MECHANICS_SOURCE_BLOCKED'
  | 'PROFILE_SOURCE_PENDING';

export interface CharacterProfileReadiness {
  readonly characterId: string;
  readonly disposition: CharacterProfileReadinessDisposition;
  readonly presetIds: readonly string[];
  readonly verifiedPresetIds: readonly string[];
  readonly rawDpsBlockers: readonly string[];
  readonly intrinsicDpsBlocked: boolean;
  readonly mechanicsSourceBlocked: boolean;
  readonly freezeApprovalPresetIds: readonly string[];
}

export interface ProfileReadinessSummary {
  readonly releasedCharacterCount: number;
  readonly profileCompletePendingFreezeCount: number;
  readonly characterMechanicsSourceBlockedCount: number;
  readonly profileSourcePendingCount: number;
  readonly dpsReadyCount: number;
  readonly rawDpsBlockedCharacterIds: readonly string[];
  readonly intrinsicDpsBlockedCharacterIds: readonly string[];
  readonly characterMechanicsSourceBlockedIds: readonly string[];
  readonly profileSourcePendingIds: readonly string[];
  readonly profileCompletePendingFreezeIds: readonly string[];
  readonly dpsReadyIds: readonly string[];
  readonly preDpsFreezeReady: boolean;
  readonly characters: readonly CharacterProfileReadiness[];
  readonly issues: readonly string[];
}

function verifiedPackage(preset: CharacterBuildPreset): ResolvedBuildPreset | null {
  if (preset.verificationStatus !== 'VERIFIED') return null;
  const resolved = resolveBuildPreset(PROFILE_REGISTRY, preset.id);
  return [
    resolved.weaponRecommendation,
    resolved.echoLoadout,
    resolved.statTarget,
    resolved.team,
    resolved.rotation,
  ].every((row) => row.verificationStatus === 'VERIFIED')
    ? resolved
    : null;
}

function rawDpsBlockers(character: (typeof CHARACTER_CATALOG)[number]): readonly string[] {
  const blockers: string[] = [];
  if (character.level90.hp === null) blockers.push('level90.hp');
  if (character.level90.atk === null) blockers.push('level90.atk');
  if (character.level90.def === null) blockers.push('level90.def');
  if (character.level90.maxEnergy === null) blockers.push('level90.maxEnergy');
  return blockers;
}

function validateCatalogIntegrity(issues: string[]): void {
  const referenced = {
    weaponRecommendations: new Set(PROFILE_CATALOGS.presets.map((row) => row.weaponRecommendationProfileId)),
    echoLoadouts: new Set(PROFILE_CATALOGS.presets.map((row) => row.echoLoadoutProfileId)),
    statTargets: new Set(PROFILE_CATALOGS.presets.map((row) => row.statTargetProfileId)),
    teams: new Set(PROFILE_CATALOGS.presets.map((row) => row.teamProfileId)),
    rotations: new Set(PROFILE_CATALOGS.presets.map((row) => row.rotationProfileId)),
  };
  for (const row of PROFILE_CATALOGS.weaponRecommendations) {
    if (!referenced.weaponRecommendations.has(row.id)) issues.push(`orphan weapon recommendation profile ${row.id}`);
  }
  for (const row of PROFILE_CATALOGS.echoLoadouts) {
    if (!referenced.echoLoadouts.has(row.id)) issues.push(`orphan Echo loadout profile ${row.id}`);
  }
  for (const row of PROFILE_CATALOGS.statTargets) {
    if (!referenced.statTargets.has(row.id)) issues.push(`orphan stat target profile ${row.id}`);
  }
  for (const row of PROFILE_CATALOGS.teams) {
    if (!referenced.teams.has(row.id)) issues.push(`orphan team profile ${row.id}`);
  }
  for (const row of PROFILE_CATALOGS.rotations) {
    if (!referenced.rotations.has(row.id)) issues.push(`orphan rotation profile ${row.id}`);
  }
}

function validateFreezeApprovals(
  approvals: readonly ProfileFreezeApproval[],
  mechanicsBlockedIds: ReadonlySet<string>,
  rawBlockedIds: ReadonlySet<string>,
  intrinsicBlockedIds: ReadonlySet<string>,
  issues: string[],
): ReadonlyMap<string, readonly ProfileFreezeApproval[]> {
  const byCharacter = new Map<string, ProfileFreezeApproval[]>();
  const approvalKeys = new Set<string>();
  const releasedIds = new Set(CHARACTER_CATALOG.filter((row) => row.releaseStatus === 'RELEASED').map((row) => row.id));
  const impactReviewById = new Map<string, (typeof PROFILE_BACKWARD_IMPACT_REVIEWS_V36)[number]>();

  for (const review of PROFILE_BACKWARD_IMPACT_REVIEWS_V36) {
    if (impactReviewById.has(review.reviewId)) issues.push(`duplicate profile backward-impact review ${review.reviewId}`);
    impactReviewById.set(review.reviewId, review);
  }

  for (const approval of approvals) {
    const key = `${approval.characterId}:${approval.presetId}`;
    if (approvalKeys.has(key)) issues.push(`duplicate profile freeze approval ${key}`);
    approvalKeys.add(key);

    if (!releasedIds.has(approval.characterId)) issues.push(`freeze approval references non-released character ${approval.characterId}`);
    if (approval.status !== 'DPS_READY') issues.push(`${key}: unsupported freeze status ${String(approval.status)}`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(approval.checkedAt)) issues.push(`${key}: invalid checkedAt`);
    if (approval.patch !== PROFILE_READINESS_BASELINE.patch) issues.push(`${key}: approval patch ${approval.patch} does not match baseline ${PROFILE_READINESS_BASELINE.patch}`);
    if (!approval.backwardImpactReview.trim()) issues.push(`${key}: missing backward-impact review evidence`);
    if (approval.notes.length === 0 || approval.notes.some((row) => row.trim().length === 0)) issues.push(`${key}: missing freeze notes`);
    for (const adapterIssue of validateProfileFreezeAdapterClosure(approval)) {
      issues.push(`${key}: ${adapterIssue}`);
    }

    const impactReview = impactReviewById.get(approval.backwardImpactReview);
    if (!impactReview) {
      issues.push(`${key}: unknown backward-impact review ${approval.backwardImpactReview}`);
    } else {
      if (impactReview.characterId !== approval.characterId) issues.push(`${key}: backward-impact review belongs to ${impactReview.characterId}`);
      if (impactReview.presetId !== approval.presetId) issues.push(`${key}: backward-impact review targets preset ${impactReview.presetId}`);
      if (impactReview.patch !== approval.patch) issues.push(`${key}: backward-impact review patch ${impactReview.patch} does not match approval patch ${approval.patch}`);
      if (impactReview.result !== 'REVIEWED_NO_BLOCKING_PROFILE_CHANGE') issues.push(`${key}: backward-impact review still has pending execution`);
      if (impactReview.pendingExecutionIds.length > 0) issues.push(`${key}: backward-impact review has ${impactReview.pendingExecutionIds.length} pending execution id(s)`);
    }

    const preset = PROFILE_REGISTRY.presets.get(approval.presetId);
    if (!preset) {
      issues.push(`${key}: unknown preset`);
    } else {
      if (preset.characterId !== approval.characterId) issues.push(`${key}: preset belongs to ${preset.characterId}`);
      if (!preset.uiSelectable) issues.push(`${key}: preset is not UI-selectable`);
      const resolved = verifiedPackage(preset);
      if (!resolved) {
        issues.push(`${key}: preset package is not fully VERIFIED`);
      } else if (resolved.rotation.executionStatus !== 'ENGINE_MODELED') {
        issues.push(`${key}: rotation ${resolved.rotation.id} is SOURCE_SEQUENCE_ONLY and not executable for DPS freeze`);
      }
    }

    if (mechanicsBlockedIds.has(approval.characterId)) issues.push(`${key}: Character Mechanics is source-blocked`);
    if (rawBlockedIds.has(approval.characterId)) issues.push(`${key}: released raw Character data has unresolved DPS fields`);
    if (intrinsicBlockedIds.has(approval.characterId)) issues.push(`${key}: Character intrinsic stats have unresolved source fields`);

    const rows = byCharacter.get(approval.characterId) ?? [];
    rows.push(approval);
    byCharacter.set(approval.characterId, rows);
  }

  return byCharacter;
}

export function auditProfileReadiness(
  approvals: readonly ProfileFreezeApproval[] = PROFILE_FREEZE_APPROVALS,
): ProfileReadinessSummary {
  const issues: string[] = [];
  const released = CHARACTER_CATALOG.filter((row) => row.releaseStatus === 'RELEASED');

  validateCatalogIntegrity(issues);

  const mechanicsReview = auditCharacterMechanicsSourceReview();
  if (!mechanicsReview.sourceReviewComplete || mechanicsReview.issues.length > 0) {
    issues.push('Character Mechanics source review is not in a closed reviewed state');
    issues.push(...mechanicsReview.issues.map((issue) => `Character Mechanics: ${issue}`));
  }
  const mechanicsBlockedIds = new Set(mechanicsReview.sourceBlockedCharacterIds);

  const rawBlockedIds = new Set(
    released.filter((row) => rawDpsBlockers(row).length > 0).map((row) => row.id),
  );
  const intrinsicPendingIds = new Set(RELEASED_CHARACTER_INTRINSIC_PENDING.map((row) => row.characterId));
  const intrinsicBlockedIds = new Set(
    released
      .filter((row) => CHARACTER_INTRINSIC_BY_ID.get(row.id)?.verificationStatus !== 'VERIFIED' || intrinsicPendingIds.has(row.id))
      .map((row) => row.id),
  );

  const approvalsByCharacter = validateFreezeApprovals(
    approvals,
    mechanicsBlockedIds,
    rawBlockedIds,
    intrinsicBlockedIds,
    issues,
  );

  const characters: CharacterProfileReadiness[] = released.map((character) => {
    const presets = [...PROFILE_REGISTRY.presets.values()]
      .filter((preset) => preset.characterId === character.id)
      .sort((a, b) => a.sequence - b.sequence || a.id.localeCompare(b.id));
    const verifiedPresets = presets.filter((preset) => verifiedPackage(preset));
    const defaults = presets.filter((preset) => preset.isDefault && preset.uiSelectable);
    if (presets.length > 0 && defaults.length !== 1) {
      issues.push(`${character.id}: expected exactly one UI-selectable default preset when profile rows exist, got ${defaults.length}`);
    }

    const approvalsForCharacter = approvalsByCharacter.get(character.id) ?? [];
    let disposition: CharacterProfileReadinessDisposition;
    if (approvalsForCharacter.length > 0) disposition = 'DPS_READY';
    else if (mechanicsBlockedIds.has(character.id)) disposition = 'CHARACTER_MECHANICS_SOURCE_BLOCKED';
    else if (verifiedPresets.length > 0 && defaults.some((preset) => verifiedPresets.some((verified) => verified.id === preset.id))) {
      disposition = 'PROFILE_COMPLETE_PENDING_FREEZE';
    } else disposition = 'PROFILE_SOURCE_PENDING';

    return {
      characterId: character.id,
      disposition,
      presetIds: presets.map((preset) => preset.id),
      verifiedPresetIds: verifiedPresets.map((preset) => preset.id),
      rawDpsBlockers: rawDpsBlockers(character),
      intrinsicDpsBlocked: intrinsicBlockedIds.has(character.id),
      mechanicsSourceBlocked: mechanicsBlockedIds.has(character.id),
      freezeApprovalPresetIds: approvalsForCharacter.map((approval) => approval.presetId),
    };
  });

  const count = (disposition: CharacterProfileReadinessDisposition) => characters.filter((row) => row.disposition === disposition).length;
  const ids = (disposition: CharacterProfileReadinessDisposition) => characters.filter((row) => row.disposition === disposition).map((row) => row.characterId).sort();

  const profileCompletePendingFreezeCount = count('PROFILE_COMPLETE_PENDING_FREEZE');
  const characterMechanicsSourceBlockedCount = count('CHARACTER_MECHANICS_SOURCE_BLOCKED');
  const profileSourcePendingCount = count('PROFILE_SOURCE_PENDING');
  const dpsReadyCount = count('DPS_READY');

  if (characters.length !== released.length) issues.push('profile readiness did not classify every released Character exactly once');
  const classified = profileCompletePendingFreezeCount + characterMechanicsSourceBlockedCount + profileSourcePendingCount + dpsReadyCount;
  if (classified !== released.length) issues.push(`readiness dispositions classify ${classified}/${released.length} released Characters`);

  return {
    releasedCharacterCount: released.length,
    profileCompletePendingFreezeCount,
    characterMechanicsSourceBlockedCount,
    profileSourcePendingCount,
    dpsReadyCount,
    rawDpsBlockedCharacterIds: [...rawBlockedIds].sort(),
    intrinsicDpsBlockedCharacterIds: [...intrinsicBlockedIds].sort(),
    characterMechanicsSourceBlockedIds: ids('CHARACTER_MECHANICS_SOURCE_BLOCKED'),
    profileSourcePendingIds: ids('PROFILE_SOURCE_PENDING'),
    profileCompletePendingFreezeIds: ids('PROFILE_COMPLETE_PENDING_FREEZE'),
    dpsReadyIds: ids('DPS_READY'),
    preDpsFreezeReady: profileSourcePendingCount === 0 && profileCompletePendingFreezeCount === 0,
    characters,
    issues,
  };
}

export function assertProfileReadinessAudit(): ProfileReadinessSummary {
  const summary = auditProfileReadiness();
  if (summary.issues.length > 0) {
    throw new Error(`Profile readiness audit failed:\n${summary.issues.map((issue) => `- ${issue}`).join('\n')}`);
  }
  return summary;
}

export function assertCharacterDpsReady(characterId: string): CharacterProfileReadiness {
  const summary = assertProfileReadinessAudit();
  const row = summary.characters.find((entry) => entry.characterId === characterId);
  if (!row) throw new Error(`Unknown released Character for DPS preflight: ${characterId}`);
  if (row.disposition !== 'DPS_READY') {
    throw new Error(`${characterId} is not DPS-ready: ${row.disposition}`);
  }
  return row;
}
