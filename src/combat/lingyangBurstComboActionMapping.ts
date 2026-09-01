import { LINGYANG_ACTION_FACTS } from '../data/characterMechanics/lingyangRawFacts.ts';
import { LINGYANG_BURST_COMBO_SOURCE_REVIEW_20260901 } from '../data/lingyangBurstComboSourceReview20260901.ts';
import { PROFILE_HORIZONTAL_GREEN_LANE_ROTATIONS } from '../data/profileHorizontalGreenLane20260830.ts';

export const LINGYANG_BURST_COMBO_MAPPING_PENDING_EXECUTION_ID =
  'character:lingyang:burst-combo-action-mapping-adapter' as const;

/**
 * Current repository-canonical sequence generated from the reviewer-authored
 * 2026-08-30 semantic review. It remains source-of-truth for current code until
 * that review is source-resolved and deterministically regenerated.
 */
export const LINGYANG_STANDARD_SOURCE_SEQUENCE = [
  'Echo: Mech Abomination',
  'Intro',
  'Ultimate',
  'Heavy: Glorious Plunge',
  'Basic: Feral Gyrate',
  'Skill: Mountain Roamer',
  'Basic: Feral Gyrate',
  'Skill: Mountain Roamer',
  'Basic: Feral Gyrate',
  'Skill: Mountain Roamer',
  'Basic: Feral Gyrate',
  'Skill: Mountain Roamer',
  'Skill: Stormy Kicks',
  'Skill: Tail Strike',
  'Outro',
] as const;

export const LINGYANG_CURRENT_PRYDWEN_SOURCE_SEQUENCE =
  LINGYANG_BURST_COMBO_SOURCE_REVIEW_20260901.currentSourceSequence;

type ExactCharacterActionMapping = {
  readonly status: 'EXACT_CHARACTER_ACTION';
  readonly sourceStep: string;
  readonly actionFactId: string;
};

type AmbiguousCharacterActionMapping = {
  readonly status: 'AMBIGUOUS_CHARACTER_ACTION';
  readonly sourceStep: 'Basic: Feral Gyrate';
  readonly candidateActionFactIds: readonly [
    'lingyang-forte-feral-gyrate-1',
    'lingyang-forte-feral-gyrate-2',
  ];
  readonly reason: 'CANONICAL_SEQUENCE_DOES_NOT_IDENTIFY_STAGE';
};

type ExactEchoMapping = {
  readonly status: 'EXACT_ECHO_EVENT';
  readonly sourceStep: string;
  readonly echoId: 'echo-60000485';
};

export type LingyangBurstComboStepMapping =
  | ExactCharacterActionMapping
  | AmbiguousCharacterActionMapping
  | ExactEchoMapping;

const CANONICAL_EXACT_ACTION_BY_STEP = new Map<string, string>([
  ['Intro', 'lingyang-intro-lion-awakens'],
  ['Ultimate', 'lingyang-liberation-strive-lions-vigor'],
  ['Heavy: Glorious Plunge', 'lingyang-forte-glorious-plunge'],
  ['Skill: Mountain Roamer', 'lingyang-forte-mountain-roamer'],
  ['Skill: Stormy Kicks', 'lingyang-forte-stormy-kicks'],
  ['Skill: Tail Strike', 'lingyang-forte-tail-strike'],
  ['Outro', 'lingyang-outro-frosty-marks'],
]);

export const LINGYANG_BURST_COMBO_ACTION_MAPPING_REVIEW = {
  status: 'BLOCKED_CANONICAL_SOURCE_MISMATCH',
  blockerId: 'BUG-017',
  reviewedAt: '2026-09-01',
  primitiveId: 'lingyang-burst-combo-source-mismatch-aware-action-map-v2',
  pendingExecutionId: LINGYANG_BURST_COMBO_MAPPING_PENDING_EXECUTION_ID,
  canonicalSequenceStepCount: 15,
  currentSourceSequenceStepCount: 16,
  canonicalExactMappedStepIndexes: [0, 1, 2, 3, 5, 7, 9, 11, 12, 13, 14] as const,
  canonicalAmbiguousStepIndexes: [4, 6, 8, 10] as const,
  currentSourceExactMappedStepIndexes: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] as const,
  closesPendingExecutionIds: [] as readonly string[],
  notes: [
    'Current-repo canonical truth remains the generated 15-step lingyang-standard-rotation until the canonical semantic review is source-resolved and deterministically regenerated.',
    'A 2026-09-01 source re-check found that the cited current Prydwen page publishes a 16-step Burst Combo with explicit Feral Gyrate P1/P2/P1/P2/P1 identities, Basic Attack: Stormy Kicks and Mid-Air Attack: Tail Strike.',
    'Prydwen reports Last profile update 20/August/2026, but Bellibing does not retain an immutable 2026-08-30 rotation snapshot from that page. The current source/canonical mismatch is confirmed while its historical cause remains unresolved.',
    'The current source resolves all action identities, but Bellibing must not silently substitute that sequence underneath the generated canonical profile. The action-mapping pending ID remains open until canonical source resolution and deterministic regeneration close the mismatch.',
    'Neither sequence supplies timestamps, hit/cancel completion, Diligent Practice timing, Lion’s Spirit state or a DPS denominator.',
  ],
} as const;

function actionFactById(id: string) {
  return LINGYANG_ACTION_FACTS.find((fact) => fact.factId === id) ?? null;
}

export function validateLingyangBurstComboActionMapping(): readonly string[] {
  const issues: string[] = [];
  const rotations = PROFILE_HORIZONTAL_GREEN_LANE_ROTATIONS.filter((row) => row.id === 'lingyang-standard-rotation');
  if (rotations.length !== 1) {
    issues.push(`expected one lingyang-standard-rotation, got ${rotations.length}`);
    return issues;
  }
  const rotation = rotations[0];
  if (rotation.executionStatus !== 'SOURCE_SEQUENCE_ONLY') {
    issues.push(`Lingyang rotation execution status drift: ${rotation.executionStatus}`);
  }
  if (rotation.sourceSequence.length !== LINGYANG_STANDARD_SOURCE_SEQUENCE.length) {
    issues.push(`Lingyang canonical source sequence length drift: ${rotation.sourceSequence.length}`);
  } else {
    for (let index = 0; index < LINGYANG_STANDARD_SOURCE_SEQUENCE.length; index += 1) {
      if (rotation.sourceSequence[index] !== LINGYANG_STANDARD_SOURCE_SEQUENCE[index]) {
        issues.push(`Lingyang canonical source step ${index} drift: expected "${LINGYANG_STANDARD_SOURCE_SEQUENCE[index]}", got "${rotation.sourceSequence[index]}"`);
      }
    }
  }

  if (LINGYANG_CURRENT_PRYDWEN_SOURCE_SEQUENCE.length !== LINGYANG_BURST_COMBO_ACTION_MAPPING_REVIEW.currentSourceSequenceStepCount) {
    issues.push(`Lingyang current-source review length drift: ${LINGYANG_CURRENT_PRYDWEN_SOURCE_SEQUENCE.length}`);
  }
  if (LINGYANG_BURST_COMBO_SOURCE_REVIEW_20260901.status !== 'CURRENT_SOURCE_CANONICAL_MISMATCH_CONFIRMED') {
    issues.push(`Lingyang source-review status drift: ${LINGYANG_BURST_COMBO_SOURCE_REVIEW_20260901.status}`);
  }
  if (LINGYANG_BURST_COMBO_SOURCE_REVIEW_20260901.sourcePageLastUpdated !== '2026-08-20') {
    issues.push(`Lingyang current-source page-update metadata drift: ${LINGYANG_BURST_COMBO_SOURCE_REVIEW_20260901.sourcePageLastUpdated}`);
  }
  if (LINGYANG_BURST_COMBO_SOURCE_REVIEW_20260901.canonicalSemanticReviewCheckedAt !== '2026-08-30') {
    issues.push(`Lingyang canonical semantic-review date drift: ${LINGYANG_BURST_COMBO_SOURCE_REVIEW_20260901.canonicalSemanticReviewCheckedAt}`);
  }

  for (const actionId of CANONICAL_EXACT_ACTION_BY_STEP.values()) {
    if (!actionFactById(actionId)) issues.push(`missing exact Lingyang action fact ${actionId}`);
  }
  for (const actionId of ['lingyang-forte-feral-gyrate-1', 'lingyang-forte-feral-gyrate-2']) {
    if (!actionFactById(actionId)) issues.push(`missing Feral Gyrate source-stage action fact ${actionId}`);
  }
  for (const actionId of LINGYANG_BURST_COMBO_SOURCE_REVIEW_20260901.currentSourceExactActionFactIdsByStep) {
    if (actionId != null && !actionFactById(actionId)) issues.push(`missing current-source Lingyang action fact ${actionId}`);
  }

  const stormy = actionFactById('lingyang-forte-stormy-kicks');
  const tail = actionFactById('lingyang-forte-tail-strike');
  if (stormy && stormy.damageClass !== 'BASIC') issues.push(`Stormy Kicks damage class drift: ${stormy.damageClass}`);
  if (tail && tail.damageClass !== 'BASIC') issues.push(`Tail Strike damage class drift: ${tail.damageClass}`);

  return issues;
}

const CONTRACT_ISSUES = validateLingyangBurstComboActionMapping();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Lingyang Burst Combo action mapping: ${CONTRACT_ISSUES.join('; ')}`);
}

/**
 * Resolve only the current repository-canonical generated sequence. Generic
 * Feral Gyrate entries remain ambiguous because that sequence does not identify
 * P1/P2. The separate current-source evidence is intentionally not substituted
 * into runtime underneath the generated profile.
 */
export function resolveLingyangBurstComboStep(index: number): LingyangBurstComboStepMapping {
  if (!Number.isInteger(index) || index < 0 || index >= LINGYANG_STANDARD_SOURCE_SEQUENCE.length) {
    throw new Error(`Lingyang canonical Burst Combo step index must be an integer from 0 through ${LINGYANG_STANDARD_SOURCE_SEQUENCE.length - 1}: ${index}`);
  }
  const sourceStep = LINGYANG_STANDARD_SOURCE_SEQUENCE[index];

  if (sourceStep === 'Echo: Mech Abomination') {
    return {
      status: 'EXACT_ECHO_EVENT',
      sourceStep,
      echoId: 'echo-60000485',
    };
  }
  if (sourceStep === 'Basic: Feral Gyrate') {
    return {
      status: 'AMBIGUOUS_CHARACTER_ACTION',
      sourceStep,
      candidateActionFactIds: [
        'lingyang-forte-feral-gyrate-1',
        'lingyang-forte-feral-gyrate-2',
      ],
      reason: 'CANONICAL_SEQUENCE_DOES_NOT_IDENTIFY_STAGE',
    };
  }

  const actionFactId = CANONICAL_EXACT_ACTION_BY_STEP.get(sourceStep);
  if (!actionFactId) throw new Error(`No reviewed Lingyang canonical mapping for source step ${index}: ${sourceStep}`);
  return {
    status: 'EXACT_CHARACTER_ACTION',
    sourceStep,
    actionFactId,
  };
}

/**
 * Resolve the separately reviewed current Prydwen source sequence. This is
 * evidence for canonical source resolution only; it does not replace the
 * generated profile sequence or authorize execution timing.
 */
export function resolveLingyangCurrentPrydwenBurstComboStep(index: number): LingyangBurstComboStepMapping {
  if (!Number.isInteger(index) || index < 0 || index >= LINGYANG_CURRENT_PRYDWEN_SOURCE_SEQUENCE.length) {
    throw new Error(`Lingyang current-source Burst Combo step index must be an integer from 0 through ${LINGYANG_CURRENT_PRYDWEN_SOURCE_SEQUENCE.length - 1}: ${index}`);
  }

  const sourceStep = LINGYANG_CURRENT_PRYDWEN_SOURCE_SEQUENCE[index];
  if (index === 0) {
    return {
      status: 'EXACT_ECHO_EVENT',
      sourceStep,
      echoId: 'echo-60000485',
    };
  }

  const actionFactId = LINGYANG_BURST_COMBO_SOURCE_REVIEW_20260901.currentSourceExactActionFactIdsByStep[index];
  if (actionFactId == null) throw new Error(`No reviewed current-source Lingyang action mapping for step ${index}: ${sourceStep}`);
  return {
    status: 'EXACT_CHARACTER_ACTION',
    sourceStep,
    actionFactId,
  };
}
