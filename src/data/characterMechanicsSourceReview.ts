import { auditCharacterMechanicsCoverage } from './characterMechanicsAudit.ts';

export type CharacterMechanicsSourceBlockerKind =
  | 'MISSING_DAMAGE_CLASSIFICATION'
  | 'CONTRADICTORY_RESOURCE_THRESHOLD'
  | 'MISSING_REVIEWED_MECHANICS';

export interface CharacterMechanicsSourceBlocker {
  characterId: string;
  kind: CharacterMechanicsSourceBlockerKind;
  checkedAt: string;
  upstreamCommit: string;
  sourceEvidence: readonly string[];
  reason: string;
}

export interface CharacterMechanicsSourceReviewAudit {
  verifiedCharacterIds: readonly string[];
  sourceBlockedCharacterIds: readonly string[];
  unreviewedCharacterIds: readonly string[];
  sourceReviewComplete: boolean;
  issues: readonly string[];
}

export const CHARACTER_MECHANICS_SOURCE_BLOCKERS: readonly CharacterMechanicsSourceBlocker[] = [
  {
    characterId: 'danjin',
    kind: 'CONTRADICTORY_RESOURCE_THRESHOLD',
    checkedAt: '2026-08-29',
    upstreamCommit: '5fa70b11f1d84fb644e4dbed47873708da0fe66f',
    sourceEvidence: [
      'DommyMM/wuwabuild public/Data/Characters.json character 1602 Ruby Blossom descriptionParams [60, 120, 120, 120]',
      'The same current move text says full-power behavior occurs when Ruby Blossom reaches over 120 while also stating the resource can hold up to 120.',
    ],
    reason: 'Ruby Blossom full-power semantics are internally impossible as written: current source requires over 120 while the same source caps the resource at 120. No threshold normalization is source-justified.',
  },
] as const;

export function auditCharacterMechanicsSourceReview(): CharacterMechanicsSourceReviewAudit {
  const coverage = auditCharacterMechanicsCoverage();
  const unresolvedCharacterIds = new Set([...coverage.partialCharacterIds, ...coverage.unstartedCharacterIds]);
  const blockerIds = new Set<string>();
  const issues: string[] = [];

  for (const blocker of CHARACTER_MECHANICS_SOURCE_BLOCKERS) {
    if (blockerIds.has(blocker.characterId)) {
      issues.push(`duplicate source blocker for ${blocker.characterId}`);
      continue;
    }
    blockerIds.add(blocker.characterId);

    if (!unresolvedCharacterIds.has(blocker.characterId)) {
      issues.push(`source blocker ${blocker.characterId} does not correspond to a released Character with unresolved full mechanics coverage`);
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(blocker.checkedAt)) {
      issues.push(`source blocker ${blocker.characterId} has invalid checkedAt`);
    }
    if (!/^[0-9a-f]{40}$/.test(blocker.upstreamCommit)) {
      issues.push(`source blocker ${blocker.characterId} has invalid upstream commit`);
    }
    if (blocker.sourceEvidence.length === 0 || blocker.sourceEvidence.some((entry) => entry.trim().length === 0)) {
      issues.push(`source blocker ${blocker.characterId} is missing source evidence`);
    }
    if (blocker.reason.trim().length === 0) {
      issues.push(`source blocker ${blocker.characterId} is missing reason`);
    }
  }

  const sourceBlockedCharacterIds = [...blockerIds]
    .filter((characterId) => unresolvedCharacterIds.has(characterId))
    .sort();
  const unreviewedCharacterIds = [...coverage.partialCharacterIds, ...coverage.unstartedCharacterIds]
    .filter((characterId) => !blockerIds.has(characterId))
    .sort();

  return {
    verifiedCharacterIds: coverage.verifiedCharacterIds,
    sourceBlockedCharacterIds,
    unreviewedCharacterIds,
    sourceReviewComplete:
      unreviewedCharacterIds.length === 0
      && issues.length === 0,
    issues,
  };
}
