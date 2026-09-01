import { LINGYANG_ACTION_FACTS } from '../data/characterMechanics/lingyangRawFacts.ts';
import { PROFILE_HORIZONTAL_GREEN_LANE_ROTATIONS } from '../data/profileHorizontalGreenLane20260830.ts';

export const LINGYANG_BURST_COMBO_MAPPING_PENDING_EXECUTION_ID =
  'character:lingyang:burst-combo-action-mapping-adapter' as const;

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
  readonly reason: 'SOURCE_STEP_DOES_NOT_IDENTIFY_STAGE';
};

type ExactEchoMapping = {
  readonly status: 'EXACT_ECHO_EVENT';
  readonly sourceStep: 'Echo: Mech Abomination';
  readonly echoId: 'echo-60000485';
};

export type LingyangBurstComboStepMapping =
  | ExactCharacterActionMapping
  | AmbiguousCharacterActionMapping
  | ExactEchoMapping;

const EXACT_ACTION_BY_STEP = new Map<string, string>([
  ['Intro', 'lingyang-intro-lion-awakens'],
  ['Ultimate', 'lingyang-liberation-strive-lions-vigor'],
  ['Heavy: Glorious Plunge', 'lingyang-forte-glorious-plunge'],
  ['Skill: Mountain Roamer', 'lingyang-forte-mountain-roamer'],
  ['Skill: Stormy Kicks', 'lingyang-forte-stormy-kicks'],
  ['Skill: Tail Strike', 'lingyang-forte-tail-strike'],
  ['Outro', 'lingyang-outro-frosty-marks'],
]);

export const LINGYANG_BURST_COMBO_ACTION_MAPPING_REVIEW = {
  status: 'BLOCKED_SOURCE_SEMANTICS',
  blockerId: 'BUG-017',
  reviewedAt: '2026-09-01',
  primitiveId: 'lingyang-burst-combo-partial-action-map-v1',
  pendingExecutionId: LINGYANG_BURST_COMBO_MAPPING_PENDING_EXECUTION_ID,
  exactMappedStepIndexes: [0, 1, 2, 3, 5, 7, 9, 11, 12, 13, 14] as const,
  ambiguousStepIndexes: [4, 6, 8, 10] as const,
  closesPendingExecutionIds: [] as readonly string[],
  notes: [
    'The canonical 15-step source sequence is locked verbatim. Echo, Intro, Ultimate, Glorious Plunge, each Mountain Roamer, Stormy Kicks, Tail Strike and Outro have unique current canonical identities.',
    'All four source steps named only Basic: Feral Gyrate remain ambiguous because canonical mechanics expose distinct Stage 1 and Stage 2 facts and current source does not identify which stage each generic step means.',
    'Source text labeling Stormy Kicks and Tail Strike as Skill steps is preserved as sequence text only. Their canonical action facts remain Basic Attack DMG and this mapper does not rewrite damage class from the source-sequence prefix.',
    'The partial map does not infer timestamps, hit/cancel completion, Diligent Practice timing, Lion’s Spirit state or a DPS denominator. The canonical mapping pending ID therefore remains open.',
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
    issues.push(`Lingyang source sequence length drift: ${rotation.sourceSequence.length}`);
  } else {
    for (let index = 0; index < LINGYANG_STANDARD_SOURCE_SEQUENCE.length; index += 1) {
      if (rotation.sourceSequence[index] !== LINGYANG_STANDARD_SOURCE_SEQUENCE[index]) {
        issues.push(`Lingyang source step ${index} drift: expected "${LINGYANG_STANDARD_SOURCE_SEQUENCE[index]}", got "${rotation.sourceSequence[index]}"`);
      }
    }
  }

  for (const actionId of EXACT_ACTION_BY_STEP.values()) {
    if (!actionFactById(actionId)) issues.push(`missing exact Lingyang action fact ${actionId}`);
  }
  for (const actionId of ['lingyang-forte-feral-gyrate-1', 'lingyang-forte-feral-gyrate-2']) {
    if (!actionFactById(actionId)) issues.push(`missing ambiguous Feral Gyrate candidate ${actionId}`);
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

export function resolveLingyangBurstComboStep(index: number): LingyangBurstComboStepMapping {
  if (!Number.isInteger(index) || index < 0 || index >= LINGYANG_STANDARD_SOURCE_SEQUENCE.length) {
    throw new Error(`Lingyang Burst Combo step index must be an integer from 0 through ${LINGYANG_STANDARD_SOURCE_SEQUENCE.length - 1}: ${index}`);
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
      reason: 'SOURCE_STEP_DOES_NOT_IDENTIFY_STAGE',
    };
  }

  const actionFactId = EXACT_ACTION_BY_STEP.get(sourceStep);
  if (!actionFactId) throw new Error(`No reviewed Lingyang mapping for source step ${index}: ${sourceStep}`);
  return {
    status: 'EXACT_CHARACTER_ACTION',
    sourceStep,
    actionFactId,
  };
}
