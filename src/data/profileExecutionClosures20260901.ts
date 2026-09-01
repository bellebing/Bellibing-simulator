import {
  JINHSI_STANDARD_OPENER_FIRST_UNISON_PRIMITIVE_ID,
  JINHSI_STANDARD_OPENER_FIRST_UNISON_SOURCE_REVIEW,
  JINHSI_STANDARD_OPENER_UNISON_PENDING_EXECUTION_ID,
} from '../combat/jinhsiStandardOpenerUnisonAdapter.ts';
import type { ProfileExecutionDependencyClosure } from './profileExecutionClosures20260830.ts';

export const PROFILE_EXECUTION_DEPENDENCY_CLOSURES_20260901: readonly ProfileExecutionDependencyClosure[] = [
  {
    closureId: 'PROFILE-CLOSURE-JINHSI-STANDARD-OPENER-FIRST-UNISON-2026-09-01-01',
    reviewedAt: JINHSI_STANDARD_OPENER_FIRST_UNISON_SOURCE_REVIEW.reviewedAt,
    pendingExecutionId: JINHSI_STANDARD_OPENER_UNISON_PENDING_EXECUTION_ID,
    presetIds: ['jinhsi-standard-opener'],
    primitiveId: JINHSI_STANDARD_OPENER_FIRST_UNISON_PRIMITIVE_ID,
    notes: [
      ...JINHSI_STANDARD_OPENER_FIRST_UNISON_SOURCE_REVIEW.sourceEstablished,
      ...JINHSI_STANDARD_OPENER_FIRST_UNISON_SOURCE_REVIEW.boundaries,
    ],
  },
] as const;
