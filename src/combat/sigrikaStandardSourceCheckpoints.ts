import { PROFILE_REGISTRY } from '../data/profileCatalogs.ts';

export const SIGRIKA_STANDARD_SOURCE_CHECKPOINTS_ADAPTER_ID = 'sigrika-standard-source-checkpoints-v1' as const;
export const SIGRIKA_STANDARD_SOURCE_CHECKPOINTS_ROTATION_ID = 'sigrika-standard-source-sequence' as const;

export const SIGRIKA_STANDARD_SOURCE_CHECKPOINT_PENDING_IDS = [
  'character:sigrika:decipher-elucidated-eligibility-adapter',
  'character:sigrika:runic-heavy-branch-selection-adapter',
  'character:sigrika:learn-my-true-name-full-stop-adapter',
] as const;

export const SIGRIKA_STANDARD_CANONICAL_SOURCE_SEQUENCE = [
  'Intro',
  'Basic 2',
  'Basic 3',
  'Basic 4',
  'Basic: Elucidated',
  'Heavy: Chain Whip (cancel on hit via Ultimate)',
  'Ultimate',
  'Basic 2',
  'Basic 3',
  'Basic 4',
  'Basic: Elucidated',
  'Heavy: Outburst (cancel via Hold Skill)',
  'Hold Skill: Learn My True Name',
  'Outro',
] as const;

export interface SigrikaStandardSourceCheckpointResolution {
  readonly adapterId: typeof SIGRIKA_STANDARD_SOURCE_CHECKPOINTS_ADAPTER_ID;
  readonly rotationId: typeof SIGRIKA_STANDARD_SOURCE_CHECKPOINTS_ROTATION_ID;
  readonly scope: 'SOURCE_SEQUENCE_ELIGIBILITY_AND_BRANCH_IDENTITY_ONLY';
  readonly elucidatedStepIndexes: readonly [4, 10];
  readonly chainWhipStepIndex: 5;
  readonly outburstStepIndex: 11;
  readonly learnMyTrueNameStepIndex: 12;
  readonly numericRuneTimelineAvailable: false;
  readonly numericFullStopTimelineAvailable: false;
  readonly exactActionTimestampsAvailable: false;
  readonly cancelFrameTimingAvailable: false;
}

function sequenceMismatch(
  actual: readonly string[],
  expected: readonly string[],
): string | null {
  if (actual.length !== expected.length) {
    return `expected ${expected.length} canonical steps, got ${actual.length}`;
  }
  for (let index = 0; index < expected.length; index += 1) {
    if (actual[index] !== expected[index]) {
      return `step ${index + 1} drifted: expected "${expected[index]}", got "${actual[index]}"`;
    }
  }
  return null;
}

/**
 * Resolve only the action checkpoints that the current canonical source sequence
 * itself prescribes. This does not reconstruct Rune/Full Stop arithmetic and it
 * deliberately does not infer timestamps from step order.
 */
export function resolveSigrikaStandardSourceCheckpoints(
  sourceSequence: readonly string[],
): SigrikaStandardSourceCheckpointResolution {
  const mismatch = sequenceMismatch(sourceSequence, SIGRIKA_STANDARD_CANONICAL_SOURCE_SEQUENCE);
  if (mismatch) throw new Error(`Sigrika Standard source checkpoint sequence drift: ${mismatch}`);

  return Object.freeze({
    adapterId: SIGRIKA_STANDARD_SOURCE_CHECKPOINTS_ADAPTER_ID,
    rotationId: SIGRIKA_STANDARD_SOURCE_CHECKPOINTS_ROTATION_ID,
    scope: 'SOURCE_SEQUENCE_ELIGIBILITY_AND_BRANCH_IDENTITY_ONLY',
    elucidatedStepIndexes: Object.freeze([4, 10]) as readonly [4, 10],
    chainWhipStepIndex: 5,
    outburstStepIndex: 11,
    learnMyTrueNameStepIndex: 12,
    numericRuneTimelineAvailable: false,
    numericFullStopTimelineAvailable: false,
    exactActionTimestampsAvailable: false,
    cancelFrameTimingAvailable: false,
  });
}

export const SIGRIKA_STANDARD_SOURCE_CHECKPOINT_REVIEW = Object.freeze({
  reviewId: 'SIGRIKA-STANDARD-SOURCE-CHECKPOINTS-2026-09-01-01',
  reviewedAt: '2026-09-01',
  adapterId: SIGRIKA_STANDARD_SOURCE_CHECKPOINTS_ADAPTER_ID,
  rotationId: SIGRIKA_STANDARD_SOURCE_CHECKPOINTS_ROTATION_ID,
  sourceLabels: ['Prydwen — current Sigrika Standard Rotation'],
  sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/sigrika'],
  closesPendingExecutionIds: SIGRIKA_STANDARD_SOURCE_CHECKPOINT_PENDING_IDS,
  sourceEstablished: [
    'The current canonical Standard Rotation explicitly prescribes Basic: Elucidated twice, immediately after each Basic 4 checkpoint.',
    'The same source explicitly prescribes Heavy: Chain Whip for the first Runic Heavy and Heavy: Outburst for the second Runic Heavy.',
    'The same source explicitly prescribes Hold Skill: Learn My True Name immediately after the Outburst checkpoint.',
    'These source-sequence labels prove eligibility/branch identity for these exact canonical checkpoints without requiring Bellibing to derive the hidden numeric Rune or Full Stop state independently.',
  ],
  boundaries: [
    'This closure is SOURCE_SEQUENCE_ELIGIBILITY_AND_BRANCH_IDENTITY_ONLY; it does not prove a general Rune lifecycle or arbitrary off-sequence eligibility.',
    'Rune count/type history, >2-Rune Schemata selection, Soliskin Vitality, Innate Gift and Blessing of Runes remain separate state concerns.',
    'No action timestamp, Decipher elapsed time, Full Stop timestamp, cancel frame or DPS denominator is inferred from source sequence order.',
    'The canonical rotation remains SOURCE_SEQUENCE_ONLY until the remaining timeline/effect-state and engine-model dependencies close.',
  ],
} as const);

export function validateSigrikaStandardSourceCheckpointContract(): readonly string[] {
  const issues: string[] = [];
  const rotation = PROFILE_REGISTRY.rotations.get(SIGRIKA_STANDARD_SOURCE_CHECKPOINTS_ROTATION_ID);
  if (!rotation) return Object.freeze([`Missing canonical rotation ${SIGRIKA_STANDARD_SOURCE_CHECKPOINTS_ROTATION_ID}`]);
  if (rotation.characterId !== 'sigrika') issues.push('Sigrika source checkpoint rotation character drifted');
  if (rotation.teamProfileId !== 'sigrika-qiuyuan-ciaccona') issues.push('Sigrika source checkpoint team drifted');
  if (rotation.executionStatus !== 'SOURCE_SEQUENCE_ONLY') issues.push('Sigrika source checkpoint review expects SOURCE_SEQUENCE_ONLY rotation');
  if (rotation.verificationStatus !== 'VERIFIED') issues.push('Sigrika source checkpoint review expects VERIFIED rotation');
  const mismatch = sequenceMismatch(rotation.sourceSequence, SIGRIKA_STANDARD_CANONICAL_SOURCE_SEQUENCE);
  if (mismatch) issues.push(mismatch);
  return Object.freeze(issues);
}

const CONTRACT_ISSUES = validateSigrikaStandardSourceCheckpointContract();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Sigrika Standard source checkpoint contract: ${CONTRACT_ISSUES.join('; ')}`);
}

export const SIGRIKA_STANDARD_SOURCE_CHECKPOINTS = resolveSigrikaStandardSourceCheckpoints(
  SIGRIKA_STANDARD_CANONICAL_SOURCE_SEQUENCE,
);
