import { auditCharacterMechanicsCoverage } from './characterMechanicsAudit.ts';

export type CharacterMechanicsSourceBlockerKind =
  | 'MISSING_DAMAGE_CLASSIFICATION'
  | 'CONTRADICTORY_RESOURCE_THRESHOLD';

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
    characterId: 'buling',
    kind: 'MISSING_DAMAGE_CLASSIFICATION',
    checkedAt: '2026-08-29',
    upstreamCommit: '5fa70b11f1d84fb644e4dbed47873708da0fe66f',
    sourceEvidence: [
      'DommyMM/wuwabuild public/Data/Characters.json character 1307 move 1004303 value 1307031',
      'Five Thunders Spell Array Continuous DMG has an exact Lv1-Lv10 coefficient row, but the move text only states Electro DMG; the same source explicitly labels the separate team state as Resonance Skill DMG Bonus when that classification is intended.',
    ],
    reason: 'Five Thunders Spell Array Continuous DMG has no explicit current-source damage-bonus classification. Action ownership or the separate team Resonance Skill DMG Bonus must not be used to infer one.',
  },
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
  {
    characterId: 'xiangli-yao',
    kind: 'MISSING_DAMAGE_CLASSIFICATION',
    checkedAt: '2026-08-29',
    upstreamCommit: '5fa70b11f1d84fb644e4dbed47873708da0fe66f',
    sourceEvidence: [
      'DommyMM/wuwabuild public/Data/Characters.json character 1305 move 1002303 values 1305015-1305017',
      'Pivot - Impale is explicitly a replacement Basic Attack that deals Electro DMG. In the same move text, Unfathomed is explicitly considered Resonance Liberation DMG; Pivot - Impale receives no corresponding damage-bonus classification.',
    ],
    reason: 'Pivot - Impale has exact coefficient rows but no explicit current-source damage-bonus classification. Intuition/Resonance Liberation state ownership must not be used to infer Resonance Liberation DMG.',
  },
] as const;

export function auditCharacterMechanicsSourceReview(): CharacterMechanicsSourceReviewAudit {
  const coverage = auditCharacterMechanicsCoverage();
  const missingProfileIds = new Set(coverage.unstartedCharacterIds);
  const blockerIds = new Set<string>();
  const issues: string[] = [];

  for (const blocker of CHARACTER_MECHANICS_SOURCE_BLOCKERS) {
    if (blockerIds.has(blocker.characterId)) {
      issues.push(`duplicate source blocker for ${blocker.characterId}`);
      continue;
    }
    blockerIds.add(blocker.characterId);

    if (!missingProfileIds.has(blocker.characterId)) {
      issues.push(`source blocker ${blocker.characterId} does not correspond to a released character without a canonical mechanics profile`);
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
    .filter((characterId) => missingProfileIds.has(characterId))
    .sort();
  const unreviewedCharacterIds = coverage.unstartedCharacterIds
    .filter((characterId) => !blockerIds.has(characterId))
    .sort();

  return {
    verifiedCharacterIds: coverage.verifiedCharacterIds,
    sourceBlockedCharacterIds,
    unreviewedCharacterIds,
    sourceReviewComplete:
      coverage.partialCharacterIds.length === 0
      && unreviewedCharacterIds.length === 0
      && issues.length === 0,
    issues,
  };
}
