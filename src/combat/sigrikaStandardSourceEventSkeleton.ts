import { SIGRIKA_ACTION_FACTS } from '../data/characterMechanics/sigrikaRawFacts.ts';
import { SIGRIKA_CANONICAL_PREDECESSOR_ECHO_TRIGGER_REVIEW_20260901 } from '../data/sigrikaCanonicalPredecessorEchoTriggerReview20260901.ts';
import {
  SIGRIKA_STANDARD_CANONICAL_SOURCE_SEQUENCE,
  SIGRIKA_STANDARD_SOURCE_CHECKPOINTS,
} from './sigrikaStandardSourceCheckpoints.ts';

export const SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON_ADAPTER_ID = 'sigrika-standard-source-event-skeleton-v1' as const;

export type SigrikaStandardDamageEventKind =
  | 'INTRO_DAMAGE'
  | 'BASIC_ATTACK_DAMAGE'
  | 'ECHO_SKILL_DAMAGE'
  | 'OUTRO_DAMAGE';

export type SigrikaStandardCastEventKind =
  | 'INTRO_SKILL_CAST'
  | 'RESONANCE_LIBERATION_CAST'
  | 'FORTE_HOLD_CAST'
  | 'OUTRO_SKILL_CAST';

export interface SigrikaStandardSourceEventStep {
  readonly stepIndex: number;
  readonly sourceLabel: string;
  readonly damageFactIds: readonly string[];
  readonly damageEventKind: SigrikaStandardDamageEventKind;
  readonly castEventKind: SigrikaStandardCastEventKind | null;
  readonly sourceStateFacts: readonly string[];
  readonly cancelIntoNext: 'ULTIMATE_ON_HIT' | 'HOLD_SKILL' | null;
  readonly exactTimestampSeconds: null;
}

const FACT = Object.freeze({
  intro: 'sigrika-intro-skill-solsworn-etymology-skill-dmg',
  basic2: 'sigrika-basic-attack-one-two-three-basic-attack-stage-2-dmg',
  basic3: 'sigrika-basic-attack-one-two-three-basic-attack-stage-3-dmg',
  basic4: 'sigrika-basic-attack-one-two-three-basic-attack-stage-4-dmg',
  elucidated: 'sigrika-basic-attack-one-two-three-basic-attack-elucidated-dmg',
  schemata: 'sigrika-forte-circuit-within-infinity-s-embrace-heavy-attack-schemata-of-runes-dmg',
  chainWhip: 'sigrika-forte-circuit-within-infinity-s-embrace-runic-chain-whip-dmg',
  liberation: 'sigrika-resonance-liberation-where-trust-leads-me-skill-dmg',
  outburst: 'sigrika-forte-circuit-within-infinity-s-embrace-runic-outburst-dmg',
  learn: 'sigrika-forte-circuit-within-infinity-s-embrace-forte-circuit-learn-my-true-name-dmg',
  outro: 'sigrika-outro-in-this-very-moment-dmg',
} as const);

function step(
  stepIndex: number,
  damageFactIds: readonly string[],
  damageEventKind: SigrikaStandardDamageEventKind,
  castEventKind: SigrikaStandardCastEventKind | null,
  sourceStateFacts: readonly string[] = [],
  cancelIntoNext: SigrikaStandardSourceEventStep['cancelIntoNext'] = null,
): SigrikaStandardSourceEventStep {
  return Object.freeze({
    stepIndex,
    sourceLabel: SIGRIKA_STANDARD_CANONICAL_SOURCE_SEQUENCE[stepIndex],
    damageFactIds: Object.freeze([...damageFactIds]),
    damageEventKind,
    castEventKind,
    sourceStateFacts: Object.freeze([...sourceStateFacts]),
    cancelIntoNext,
    exactTimestampSeconds: null,
  });
}

/**
 * Timestamp-free event graph for the fixed Prydwen Standard Rotation only.
 *
 * This skeleton binds source-sequence labels to already-verified Character
 * action facts and event semantics. It deliberately does not assign action
 * durations, cancel frames, timed-window uptime, a Nameless Explorer cast slot,
 * or a DPS denominator.
 */
export const SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON: readonly SigrikaStandardSourceEventStep[] = Object.freeze([
  step(0, [FACT.intro], 'INTRO_DAMAGE', 'INTRO_SKILL_CAST', ['Convergent is gained for 20s; elapsed-time eligibility is not inferred here.']),
  step(1, [FACT.basic2], 'BASIC_ATTACK_DAMAGE', null),
  step(2, [FACT.basic3], 'BASIC_ATTACK_DAMAGE', null),
  step(3, [FACT.basic4], 'BASIC_ATTACK_DAMAGE', null, ['Basic 4 enters Decipher; the following Elucidated checkpoint is source-prescribed.']),
  step(4, [FACT.elucidated], 'ECHO_SKILL_DAMAGE', null, ['First source-prescribed Elucidated direct hit grants Rune: Trust.']),
  step(
    5,
    [FACT.schemata, FACT.chainWhip],
    'ECHO_SKILL_DAMAGE',
    null,
    [
      'The source-prescribed branch is Runic Chain Whip.',
      'Canonical predecessor evidence guarantees the first Schemata enters the >=30 Soliskin Vitality branch.',
      'The current Runic Chain Whip therefore receives the source +50% DMG Multiplier increase and the Schemata event grants at least one Innate Gift stack.',
      'Whether the newly granted Innate Gift stack also amplifies this same Runic hit is not resolved by this skeleton.',
    ],
    'ULTIMATE_ON_HIT',
  ),
  step(6, [FACT.liberation], 'ECHO_SKILL_DAMAGE', 'RESONANCE_LIBERATION_CAST', ['Liberation grants Divergent for 20s; no elapsed-time lifetime is inferred.']),
  step(7, [FACT.basic2], 'BASIC_ATTACK_DAMAGE', null),
  step(8, [FACT.basic3], 'BASIC_ATTACK_DAMAGE', null),
  step(9, [FACT.basic4], 'BASIC_ATTACK_DAMAGE', null, ['Basic 4 enters Decipher; the following Elucidated checkpoint is source-prescribed.']),
  step(10, [FACT.elucidated], 'ECHO_SKILL_DAMAGE', null, ['Second source-prescribed Elucidated direct hit grants Rune: Trust.']),
  step(
    11,
    [FACT.schemata, FACT.outburst],
    'ECHO_SKILL_DAMAGE',
    null,
    [
      'The source-prescribed branch is Runic Outburst.',
      'At least one Innate Gift stack from the first Schemata is active before this checkpoint.',
      'The second Schemata Soliskin Vitality branch and any second Innate Gift stack remain unresolved because the canonical Nameless Explorer cast has no fixed sequence slot.',
    ],
    'HOLD_SKILL',
  ),
  step(
    12,
    [FACT.learn],
    'ECHO_SKILL_DAMAGE',
    'FORTE_HOLD_CAST',
    [
      'Learn My True Name is source-prescribed at this checkpoint.',
      'At least one and at most two S0 Innate Gift stacks can be active before Learn; exact amplification remains unresolved.',
      'Casting Learn clears S0 Innate Gift after the cast.',
    ],
  ),
  step(13, [FACT.outro], 'OUTRO_DAMAGE', 'OUTRO_SKILL_CAST', ['Outro resets the Soliskin Vitality same-name Echo trigger record.']),
]);

export const SIGRIKA_STANDARD_SOURCE_EVENT_BOUNDARIES = Object.freeze({
  firstEchoSkillDamageStepIndex: 4,
  echoSkillDamageStepIndexes: Object.freeze([4, 5, 6, 10, 11, 12]) as readonly [4, 5, 6, 10, 11, 12],
  introSkillCastStepIndex: 0,
  fixedMainEchoCastStepIndex: null,
  mainEchoPlacement: 'FLEXIBLE_NOT_PART_OF_FIXED_SOURCE_SEQUENCE' as const,
  firstSchemataHighVitalityPathGuaranteed:
    SIGRIKA_CANONICAL_PREDECESSOR_ECHO_TRIGGER_REVIEW_20260901.preSigrikaEntryBounds.firstSchemataHighVitalityPathGuaranteed,
  secondSchemataHighVitalityPathGuaranteed:
    SIGRIKA_CANONICAL_PREDECESSOR_ECHO_TRIGGER_REVIEW_20260901.downstreamImplications.secondSchemataHighVitalityPathGuaranteed,
  exactActionTimestampsAvailable: false,
  exactTimedWindowOverlapAvailable: false,
  exactRotationSecondsAvailable: false,
} as const);

export const SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON_REVIEW = Object.freeze({
  reviewId: 'SIGRIKA-STANDARD-SOURCE-EVENT-SKELETON-2026-09-01-01',
  reviewedAt: '2026-09-01',
  adapterId: SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON_ADAPTER_ID,
  rotationId: 'sigrika-standard-source-sequence',
  sourceLabels: [
    'Bellibing verified Sigrika raw Character Mechanics',
    'Prydwen — current Sigrika Standard Rotation',
    'Sigrika canonical predecessor Echo-trigger source review',
  ] as const,
  sourceUrls: [
    'https://github.com/bellebing/Bellibing-simulator/blob/main/src/data/characterMechanics/sigrikaRawFacts.ts',
    'https://www.prydwen.gg/wuthering-waves/characters/sigrika',
    'https://github.com/bellebing/Bellibing-simulator/blob/worker/sigrika-dps-closure-2026-09-01/src/data/sigrikaCanonicalPredecessorEchoTriggerReview20260901.ts',
  ] as const,
  sourceEstablished: [
    'All 14 fixed canonical Prydwen steps are bound to already-verified Sigrika Character damage facts without selecting a talent level.',
    'The fixed sequence has six source-proven Echo Skill DMG checkpoints: Elucidated, Chain Whip, Liberation, Elucidated, Outburst and Learn My True Name.',
    'The first fixed Echo Skill DMG event is the first Elucidated checkpoint at zero-based step index 4.',
    'The fixed sequence opens Solsworn SCIP-ECHO-AMP from its Intro cast event at zero-based step index 0, while no fixed Nameless Explorer Echo cast checkpoint exists.',
    'Predecessor bounds guarantee only the first Schemata high-Vitality branch; the second Schemata modifier branch remains unresolved.',
  ] as const,
  boundaries: [
    'This is an event-order skeleton, not a timeline. Every exactTimestampSeconds remains null.',
    'Step order does not prove seconds elapsed, cancel frames, 5s/6s/14s/15s window coverage or the DPS denominator.',
    'Echo Skill DMG classification is not treated as an equipped Echo Skill cast. Nameless Explorer remains a separate flexible cast event.',
    'The review closes no additional pendingExecutionId and does not authorize ENGINE_MODELED, BuildContext, freeze, DPS_READY or product support.',
  ] as const,
  closesPendingExecutionIds: [] as const,
} as const);

export function validateSigrikaStandardSourceEventSkeleton(): readonly string[] {
  const issues: string[] = [];
  if (SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON.length !== SIGRIKA_STANDARD_CANONICAL_SOURCE_SEQUENCE.length) {
    issues.push('Sigrika source event skeleton step count drifted');
  }

  const actionById = new Map(SIGRIKA_ACTION_FACTS.map((fact) => [fact.factId, fact] as const));
  for (const eventStep of SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON) {
    if (eventStep.sourceLabel !== SIGRIKA_STANDARD_CANONICAL_SOURCE_SEQUENCE[eventStep.stepIndex]) {
      issues.push(`Sigrika source event label drifted at step ${eventStep.stepIndex}`);
    }
    if (eventStep.exactTimestampSeconds !== null) {
      issues.push(`Sigrika source event step ${eventStep.stepIndex} must not invent a timestamp`);
    }
    for (const factId of eventStep.damageFactIds) {
      const fact = actionById.get(factId);
      if (!fact) {
        issues.push(`Missing Sigrika damage fact ${factId}`);
        continue;
      }
      if (fact.characterId !== 'sigrika' || fact.verificationStatus !== 'VERIFIED' || fact.modelingStatus !== 'MODEL_READY') {
        issues.push(`Sigrika damage fact ${factId} is no longer verified/model-ready`);
      }
      if (eventStep.damageEventKind === 'ECHO_SKILL_DAMAGE' && fact.damageClass !== 'ECHO') {
        issues.push(`Sigrika Echo Skill DMG step ${eventStep.stepIndex} mapped non-ECHO fact ${factId}`);
      }
      if (eventStep.damageEventKind === 'INTRO_DAMAGE' && fact.damageClass !== 'INTRO') {
        issues.push(`Sigrika Intro step mapped non-INTRO fact ${factId}`);
      }
      if (eventStep.damageEventKind === 'BASIC_ATTACK_DAMAGE' && fact.damageClass !== 'BASIC') {
        issues.push(`Sigrika Basic step ${eventStep.stepIndex} mapped non-BASIC fact ${factId}`);
      }
      if (eventStep.damageEventKind === 'OUTRO_DAMAGE' && fact.damageClass !== 'OUTRO') {
        issues.push(`Sigrika Outro step mapped non-OUTRO fact ${factId}`);
      }
    }
  }

  const echoIndexes = SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON
    .filter((row) => row.damageEventKind === 'ECHO_SKILL_DAMAGE')
    .map((row) => row.stepIndex);
  if (echoIndexes.join('|') !== SIGRIKA_STANDARD_SOURCE_EVENT_BOUNDARIES.echoSkillDamageStepIndexes.join('|')) {
    issues.push(`Sigrika Echo Skill DMG checkpoint drift: ${echoIndexes.join(',')}`);
  }
  if (SIGRIKA_STANDARD_SOURCE_EVENT_BOUNDARIES.firstEchoSkillDamageStepIndex !== SIGRIKA_STANDARD_SOURCE_CHECKPOINTS.elucidatedStepIndexes[0]) {
    issues.push('first fixed Sigrika Echo Skill DMG checkpoint must remain the first Elucidated step');
  }
  if (!SIGRIKA_STANDARD_SOURCE_EVENT_BOUNDARIES.firstSchemataHighVitalityPathGuaranteed) {
    issues.push('Sigrika first Schemata high-Vitality guarantee drifted');
  }
  if (SIGRIKA_STANDARD_SOURCE_EVENT_BOUNDARIES.secondSchemataHighVitalityPathGuaranteed) {
    issues.push('Sigrika second Schemata high-Vitality path must remain unresolved');
  }
  if (SIGRIKA_STANDARD_SOURCE_EVENT_SKELETON_REVIEW.closesPendingExecutionIds.length !== 0) {
    issues.push('Sigrika source event skeleton must not close execution dependencies');
  }

  return Object.freeze(issues);
}

const SKELETON_ISSUES = validateSigrikaStandardSourceEventSkeleton();
if (SKELETON_ISSUES.length > 0) {
  throw new Error(`Invalid Sigrika Standard source event skeleton: ${SKELETON_ISSUES.join('; ')}`);
}
