import type { ProfileBackwardImpactReview } from './profileBackwardImpactReview.ts';
import { GALBRENA_EXECUTION_DEPENDENCY_IDS_20260831 } from './galbrenaExecutionPreflight20260831.ts';

export const GALBRENA_BACKWARD_IMPACT_REVIEWS_20260831: readonly ProfileBackwardImpactReview[] = [
  {
    reviewId: 'PROFILE-IMPACT-GALBRENA-STANDARD-2026-08-31-01',
    characterId: 'galbrena',
    presetId: 'galbrena-standard',
    weaponRecommendationProfileId: 'galbrena-standard-weapons',
    checkedAt: '2026-08-31',
    patch: '3.6',
    reviewedWeaponEffectIds: ['LU-ATK', 'LU-HEAVY-AMP', 'LU-ECHO-AMP', 'LU-DEF'],
    reviewedSonataSetIds: ['sonata-22'],
    reviewedEchoIds: ['echo-60001205', 'echo-60000525', 'echo-60000605'],
    pendingExecutionIds: GALBRENA_EXECUTION_DEPENDENCY_IDS_20260831,
    result: 'REVIEWED_WITH_PENDING_EXECUTION',
    notes: [
      "Canonical package resolves to Galbrena S0 / Lux & Umbra R1 / Flamewing's Shadow / Corrosaurus / Qiuyuan + The Shorekeeper / galbrena-standard-source-sequence.",
      'Lux & Umbra and Flamewing’s Shadow have source-backed reciprocal Heavy/Echo 6s damage-event windows. Their exact uptime and overlap remain dependent on an executable timestamped rotation; cast-window semantics are not substituted.',
      'Pinned Corrosaurus Rank-5 source safely closes its active damage and missing permanent main-slot Echo Skill bonus as generic Echo data, but the canonical sourceSequence itself does not contain the required Echo cast event.',
      'Galbrena Character Mechanics remains composition-safe: Sinflame/Afterflame and pending multiplier semantics stay on Galbrena, while Qiuyuan/Shorekeeper effects remain teammate-owned with source/target scope preserved.',
      'Exact duration, resource transitions, teammate uptime, inherited Impermanence Heron transfer semantics, versioned enemy context and one exact team-specific ER gate remain unresolved. No DPS freeze or owned-Echo upgrade output is authorized.',
    ],
  },
];
