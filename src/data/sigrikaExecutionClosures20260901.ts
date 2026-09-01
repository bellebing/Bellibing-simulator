import {
  SIGRIKA_CIACCONA_CANONICAL_ENTRY_ADAPTER_ID,
  SIGRIKA_CIACCONA_CANONICAL_ENTRY_SOURCE_REVIEW,
} from '../combat/sigrikaCiacconaCanonicalEntryState.ts';
import {
  SIGRIKA_STANDARD_SOURCE_CHECKPOINT_REVIEW,
  SIGRIKA_STANDARD_SOURCE_CHECKPOINTS_ADAPTER_ID,
} from '../combat/sigrikaStandardSourceCheckpoints.ts';
import {
  SIGRIKA_STANDARD_RUNE_SOURCE_PATH_ADAPTER_ID,
  SIGRIKA_STANDARD_RUNE_SOURCE_PATH_REVIEW,
} from '../combat/sigrikaStandardRuneSourcePath.ts';
import { SIGRIKA_STANDARD_ER_GATE_ADAPTER_ID } from '../combat/sigrikaEnergyRegenGate.ts';
import type { ProfileExecutionDependencyClosure } from './profileExecutionClosures20260830.ts';

export const SIGRIKA_EXECUTION_DEPENDENCY_CLOSURES_20260901: readonly ProfileExecutionDependencyClosure[] = [
  {
    closureId: 'PROFILE-CLOSURE-SIGRIKA-STANDARD-ER-GATE-2026-09-01-01',
    reviewedAt: '2026-09-01',
    pendingExecutionId: 'profile:sigrika-standard:energy-regen-hard-gate-adapter',
    presetIds: ['sigrika-standard'],
    primitiveId: SIGRIKA_STANDARD_ER_GATE_ADAPTER_ID,
    notes: [
      'Current Prydwen maps the lower 109% Energy Regen estimate to Qiuyuan + Ciaccona (or Phrolova) and the higher 119% estimate to Qiuyuan + Shorekeeper.',
      'Canonical sigrika-qiuyuan-ciaccona therefore resolves the existing VERIFIED stat-target minimum to 1.09; 1.19 remains the preferred reference.',
      'The intrinsic ER-over-125% Echo Skill bonus formula remains a separate Character mechanic and is not treated as the profile requirement.',
    ],
  },
  {
    closureId: 'PROFILE-CLOSURE-SIGRIKA-STANDARD-ELUCIDATED-CHECKPOINTS-2026-09-01-01',
    reviewedAt: SIGRIKA_STANDARD_SOURCE_CHECKPOINT_REVIEW.reviewedAt,
    pendingExecutionId: 'character:sigrika:decipher-elucidated-eligibility-adapter',
    presetIds: ['sigrika-standard'],
    primitiveId: SIGRIKA_STANDARD_SOURCE_CHECKPOINTS_ADAPTER_ID,
    notes: [
      ...SIGRIKA_STANDARD_SOURCE_CHECKPOINT_REVIEW.sourceEstablished,
      ...SIGRIKA_STANDARD_SOURCE_CHECKPOINT_REVIEW.boundaries,
    ],
  },
  {
    closureId: 'PROFILE-CLOSURE-SIGRIKA-STANDARD-RUNIC-BRANCH-CHECKPOINTS-2026-09-01-01',
    reviewedAt: SIGRIKA_STANDARD_SOURCE_CHECKPOINT_REVIEW.reviewedAt,
    pendingExecutionId: 'character:sigrika:runic-heavy-branch-selection-adapter',
    presetIds: ['sigrika-standard'],
    primitiveId: SIGRIKA_STANDARD_SOURCE_CHECKPOINTS_ADAPTER_ID,
    notes: [
      ...SIGRIKA_STANDARD_SOURCE_CHECKPOINT_REVIEW.sourceEstablished,
      ...SIGRIKA_STANDARD_SOURCE_CHECKPOINT_REVIEW.boundaries,
    ],
  },
  {
    closureId: 'PROFILE-CLOSURE-SIGRIKA-STANDARD-LEARN-CHECKPOINT-2026-09-01-01',
    reviewedAt: SIGRIKA_STANDARD_SOURCE_CHECKPOINT_REVIEW.reviewedAt,
    pendingExecutionId: 'character:sigrika:learn-my-true-name-full-stop-adapter',
    presetIds: ['sigrika-standard'],
    primitiveId: SIGRIKA_STANDARD_SOURCE_CHECKPOINTS_ADAPTER_ID,
    notes: [
      ...SIGRIKA_STANDARD_SOURCE_CHECKPOINT_REVIEW.sourceEstablished,
      ...SIGRIKA_STANDARD_SOURCE_CHECKPOINT_REVIEW.boundaries,
    ],
  },
  {
    closureId: 'PROFILE-CLOSURE-SIGRIKA-STANDARD-RUNE-SOURCE-PATH-2026-09-01-01',
    reviewedAt: SIGRIKA_STANDARD_RUNE_SOURCE_PATH_REVIEW.reviewedAt,
    pendingExecutionId: 'character:sigrika:rune-lifecycle-adapter',
    presetIds: ['sigrika-standard'],
    primitiveId: SIGRIKA_STANDARD_RUNE_SOURCE_PATH_ADAPTER_ID,
    notes: [
      ...SIGRIKA_STANDARD_RUNE_SOURCE_PATH_REVIEW.sourceEstablished,
      ...SIGRIKA_STANDARD_RUNE_SOURCE_PATH_REVIEW.boundaries,
    ],
  },
  {
    closureId: 'PROFILE-CLOSURE-SIGRIKA-CIACCONA-CANONICAL-ENTRY-2026-09-01-01',
    reviewedAt: SIGRIKA_CIACCONA_CANONICAL_ENTRY_SOURCE_REVIEW.reviewedAt,
    pendingExecutionId: SIGRIKA_CIACCONA_CANONICAL_ENTRY_SOURCE_REVIEW.pendingExecutionId,
    presetIds: ['sigrika-standard'],
    primitiveId: SIGRIKA_CIACCONA_CANONICAL_ENTRY_ADAPTER_ID,
    notes: [
      ...SIGRIKA_CIACCONA_CANONICAL_ENTRY_SOURCE_REVIEW.sourceEstablished,
      ...SIGRIKA_CIACCONA_CANONICAL_ENTRY_SOURCE_REVIEW.boundaries,
    ],
  },
] as const;
