import {
  LINGYANG_STANDARD_SOURCE_SEQUENCE,
  resolveLingyangBurstComboStep,
  type LingyangBurstComboStepMapping,
} from './lingyangBurstComboActionMapping.ts';
import {
  LINGYANG_MOONGAZERS_SIGIL_CAST_TRIGGER_CHECKPOINTS,
} from './lingyangMoongazersSigilCastTriggerCheckpoints.ts';
import type { MechAbominationCastEvent } from './mechAbominationCastStateAdapter.ts';
import type { WeaponCastEvent } from './weaponCastWindowAdapter.ts';
import {
  evaluateLingyangDiligentPractice,
  type LingyangDiligentPracticeResult,
} from './lingyangDiligentPracticeAdapter.ts';
import type { LingyangLiberationCastEvent } from './lingyangLionsVigorWindowAdapter.ts';

export const LINGYANG_CALLER_SUPPLIED_TIMELINE_ADAPTER_ID =
  'lingyang-canonical-caller-timeline-v1' as const;

export interface LingyangCallerSuppliedTimelineStep {
  readonly sourceStepIndex: number;
  readonly sourceStep: string;
  readonly atSeconds: number;
  readonly mapping: LingyangBurstComboStepMapping;
}

export interface LingyangCallerSuppliedTimeline {
  readonly adapterId: typeof LINGYANG_CALLER_SUPPLIED_TIMELINE_ADAPTER_ID;
  readonly characterId: 'lingyang';
  readonly presetId: 'lingyang-standard';
  readonly rotationId: 'lingyang-standard-rotation';
  readonly canonicalExecutionStatus: 'SOURCE_SEQUENCE_ONLY';
  readonly steps: readonly LingyangCallerSuppliedTimelineStep[];
  readonly authorizesEngineModel: false;
  readonly authorizesRotationSeconds: false;
}

export const LINGYANG_CALLER_SUPPLIED_TIMELINE_REVIEW = {
  reviewId: 'LINGYANG-CALLER-SUPPLIED-TIMELINE-REVIEW-2026-09-01-01',
  reviewedAt: '2026-09-01',
  adapterId: LINGYANG_CALLER_SUPPLIED_TIMELINE_ADAPTER_ID,
  status: 'CALLER_TIMELINE_VALIDATION_ONLY',
  contributesToPendingExecutionIds: [
    'weapon:moongazers-sigil:MGS-LIB:trigger-uptime-adapter',
    'echo:echo-60000485:mech-abomination-cast-timeline-adapter',
    'character:lingyang:striding-lion-resource-state-adapter',
    'character:lingyang:diligent-practice-three-second-window-adapter',
    'rotation:lingyang-standard-rotation:engine-model',
  ] as const,
  closesPendingExecutionIds: [] as readonly string[],
  authorizesEngineModel: false,
  authorizesRotationSeconds: false,
  notes: [
    'This adapter accepts explicit caller-owned timestamps for the current repository-canonical 15-step Lingyang source sequence; it does not derive timestamps from source order.',
    'The first source step is not normalized to t=0. Caller timestamps are preserved exactly and need only remain finite, non-negative and non-decreasing in canonical sequence order.',
    'Canonical Feral Gyrate entries remain ambiguous P1/P2 mappings. The separate current-Prydwen 16-step evidence is not substituted underneath this canonical timeline contract.',
    'Projected Mech Abomination, MGS-LIB and Lion’s Vigor cast events become usable by their existing explicit-event primitives only because the caller supplied their numeric timestamps.',
    'Diligent Practice evaluation additionally requires caller-proven Striding Lion state at both events; this adapter never infers Striding Lion from the Feral Gyrate label or adjacency.',
    'A caller-supplied timeline is external execution input, not canonical profile timing. It does not create rotationSeconds, register a rotation engine, change SOURCE_SEQUENCE_ONLY, close any pending execution ID, authorize BuildContext, freeze, DPS readiness or product support.',
  ],
} as const;

export const LINGYANG_CANONICAL_DILIGENT_PAIRS = [
  { basicStepIndex: 4, mountainRoamerStepIndex: 5 },
  { basicStepIndex: 6, mountainRoamerStepIndex: 7 },
  { basicStepIndex: 8, mountainRoamerStepIndex: 9 },
  { basicStepIndex: 10, mountainRoamerStepIndex: 11 },
] as const;

function assertCanonicalTimelineTimes(stepTimesSeconds: readonly number[]): void {
  if (stepTimesSeconds.length !== LINGYANG_STANDARD_SOURCE_SEQUENCE.length) {
    throw new Error(
      `Lingyang caller timeline requires exactly ${LINGYANG_STANDARD_SOURCE_SEQUENCE.length} canonical step timestamps, got ${stepTimesSeconds.length}`,
    );
  }
  for (let index = 0; index < stepTimesSeconds.length; index += 1) {
    const atSeconds = stepTimesSeconds[index];
    if (!Number.isFinite(atSeconds) || atSeconds < 0) {
      throw new Error(`Lingyang caller timeline step ${index} time must be finite and non-negative: ${String(atSeconds)}`);
    }
    if (index > 0 && atSeconds < stepTimesSeconds[index - 1]) {
      throw new Error(
        `Lingyang caller timeline must preserve canonical source order: step ${index} time ${atSeconds} precedes step ${index - 1} time ${stepTimesSeconds[index - 1]}`,
      );
    }
  }
}

export function createLingyangCallerSuppliedTimeline(
  stepTimesSeconds: readonly number[],
): LingyangCallerSuppliedTimeline {
  assertCanonicalTimelineTimes(stepTimesSeconds);
  const steps = LINGYANG_STANDARD_SOURCE_SEQUENCE.map((_, sourceStepIndex) => {
    const atSeconds = stepTimesSeconds[sourceStepIndex];
    if (atSeconds === undefined) throw new Error(`Missing Lingyang caller timeline step ${sourceStepIndex}`);
    const mapping = resolveLingyangBurstComboStep(sourceStepIndex);
    return {
      sourceStepIndex,
      sourceStep: mapping.sourceStep,
      atSeconds,
      mapping,
    } satisfies LingyangCallerSuppliedTimelineStep;
  });

  return {
    adapterId: LINGYANG_CALLER_SUPPLIED_TIMELINE_ADAPTER_ID,
    characterId: 'lingyang',
    presetId: 'lingyang-standard',
    rotationId: 'lingyang-standard-rotation',
    canonicalExecutionStatus: 'SOURCE_SEQUENCE_ONLY',
    steps,
    authorizesEngineModel: false,
    authorizesRotationSeconds: false,
  };
}

function timelineStep(
  timeline: LingyangCallerSuppliedTimeline,
  sourceStepIndex: number,
): LingyangCallerSuppliedTimelineStep {
  if (!Number.isInteger(sourceStepIndex) || sourceStepIndex < 0 || sourceStepIndex >= timeline.steps.length) {
    throw new Error(`Lingyang caller timeline step index out of range: ${sourceStepIndex}`);
  }
  const step = timeline.steps[sourceStepIndex];
  if (!step) throw new Error(`Missing Lingyang caller timeline step ${sourceStepIndex}`);
  return step;
}

export function lingyangMechCastEventFromCallerTimeline(
  timeline: LingyangCallerSuppliedTimeline,
): MechAbominationCastEvent {
  const step = timelineStep(timeline, 0);
  if (step.mapping.status !== 'EXACT_ECHO_EVENT' || step.mapping.echoId !== 'echo-60000485') {
    throw new Error('Lingyang caller timeline step 0 is no longer the exact Mech Abomination Echo event');
  }
  return {
    kind: 'ECHO_ACTIVE_CAST',
    actorId: 'lingyang',
    echoId: 'echo-60000485',
    atSeconds: step.atSeconds,
  };
}

export function lingyangMoongazersSigilCastEventsFromCallerTimeline(
  timeline: LingyangCallerSuppliedTimeline,
): readonly WeaponCastEvent[] {
  return LINGYANG_MOONGAZERS_SIGIL_CAST_TRIGGER_CHECKPOINTS.map((checkpoint) => {
    const step = timelineStep(timeline, checkpoint.sourceStepIndex);
    if (step.mapping.status !== 'EXACT_CHARACTER_ACTION' || step.mapping.actionFactId !== checkpoint.actionFactId) {
      throw new Error(`Lingyang caller timeline MGS-LIB checkpoint drift at step ${checkpoint.sourceStepIndex}`);
    }
    return {
      kind: checkpoint.eventKind,
      actorId: 'lingyang',
      atSeconds: step.atSeconds,
    } satisfies WeaponCastEvent;
  });
}

export function lingyangLionsVigorCastEventFromCallerTimeline(
  timeline: LingyangCallerSuppliedTimeline,
): LingyangLiberationCastEvent {
  const step = timelineStep(timeline, 2);
  if (
    step.mapping.status !== 'EXACT_CHARACTER_ACTION'
    || step.mapping.actionFactId !== 'lingyang-liberation-strive-lions-vigor'
  ) {
    throw new Error('Lingyang caller timeline step 2 is no longer the exact Strive: Lion’s Vigor action');
  }
  return {
    kind: 'RESONANCE_LIBERATION_CAST',
    actorId: 'lingyang',
    atSeconds: step.atSeconds,
    actionFactId: 'lingyang-liberation-strive-lions-vigor',
  };
}

export function evaluateLingyangDiligentPairFromCallerTimeline(params: {
  readonly timeline: LingyangCallerSuppliedTimeline;
  readonly pairIndex: number;
  readonly stridingLionActiveAtBasic: boolean;
  readonly stridingLionActiveAtMountainRoamer: boolean;
}): LingyangDiligentPracticeResult {
  const {
    timeline,
    pairIndex,
    stridingLionActiveAtBasic,
    stridingLionActiveAtMountainRoamer,
  } = params;
  if (!Number.isInteger(pairIndex) || pairIndex < 0 || pairIndex >= LINGYANG_CANONICAL_DILIGENT_PAIRS.length) {
    throw new Error(`Lingyang canonical Diligent pair index must be an integer from 0 through ${LINGYANG_CANONICAL_DILIGENT_PAIRS.length - 1}: ${pairIndex}`);
  }
  const pair = LINGYANG_CANONICAL_DILIGENT_PAIRS[pairIndex];
  if (!pair) throw new Error(`Missing Lingyang canonical Diligent pair ${pairIndex}`);
  const basic = timelineStep(timeline, pair.basicStepIndex);
  const mountain = timelineStep(timeline, pair.mountainRoamerStepIndex);

  if (basic.sourceStep !== 'Basic: Feral Gyrate') {
    throw new Error(`Lingyang canonical Diligent basic step drift at ${pair.basicStepIndex}: ${basic.sourceStep}`);
  }
  if (
    mountain.mapping.status !== 'EXACT_CHARACTER_ACTION'
    || mountain.mapping.actionFactId !== 'lingyang-forte-mountain-roamer'
  ) {
    throw new Error(`Lingyang canonical Diligent Mountain Roamer step drift at ${pair.mountainRoamerStepIndex}`);
  }

  return evaluateLingyangDiligentPractice({
    ownerId: 'lingyang',
    basic: {
      actorId: 'lingyang',
      atSeconds: basic.atSeconds,
      stridingLionActive: stridingLionActiveAtBasic,
      actionRole: 'BASIC_ATTACK_DURING_STRIDING_LION',
    },
    mountainRoamer: {
      actorId: 'lingyang',
      atSeconds: mountain.atSeconds,
      stridingLionActive: stridingLionActiveAtMountainRoamer,
      actionFactId: 'lingyang-forte-mountain-roamer',
    },
  });
}
