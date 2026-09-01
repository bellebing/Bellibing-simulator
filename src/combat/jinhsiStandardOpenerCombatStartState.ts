export const JINHSI_STANDARD_OPENER_COMBAT_START_PRIMITIVE_ID =
  'jinhsi-standard-opener-combat-start-prebuff-v1';

export const JINHSI_STANDARD_OPENER_COMBAT_START_CLOSED_PENDING_EXECUTION_IDS = [
  'weapon:ages-of-harvest:AH-INTRO:trigger-uptime-adapter',
  'sonata:sonata-5:S05_5PC_SPECTRO:trigger-uptime-adapter',
] as const;

export interface JinhsiStandardOpenerCombatStartResolution {
  readonly primitiveId: typeof JINHSI_STANDARD_OPENER_COMBAT_START_PRIMITIVE_ID;
  readonly presetId: 'jinhsi-standard-opener';
  readonly rotationId: 'jinhsi-standard-opener-source-sequence';
  readonly sourceScope: 'SOURCE_DEFINED_COMBAT_START_BEFORE_TEAM_SETUP';
  readonly canonicalIntroSkillCastPresent: false;
  readonly agesIntroWindowActive: false;
  readonly celestialIntroWindowActive: false;
  readonly zhezhiIncomingStateActive: false;
  readonly verinaIncomingStateActive: false;
  readonly teamIncomingStateActive: false;
  readonly agesSkillWindowResolved: false;
  readonly jueCastResolved: false;
  readonly incandescenceTimelineResolved: false;
  readonly exactTimelineResolved: false;
}

const EXPECTED_STANDARD_OPENER = [
  'Basic P1',
  'Basic P2',
  'Basic P3',
  'Basic P4',
  'Skill: Overflowing Radiance',
  'Ultimate',
  'Incarnation Basic P1',
  'Incarnation Basic P2',
  'Incarnation Basic P3',
  'Incarnation Basic P4',
  'Skill: Illuminous Epiphany',
  'Outro',
] as const;

function validateExactStandardOpener(sourceSequence: readonly string[]): void {
  if (sourceSequence.length !== EXPECTED_STANDARD_OPENER.length) {
    throw new Error(`Jinhsi Standard Opener source sequence length drift: ${sourceSequence.length}`);
  }
  for (let index = 0; index < EXPECTED_STANDARD_OPENER.length; index += 1) {
    if (sourceSequence[index] !== EXPECTED_STANDARD_OPENER[index]) {
      throw new Error(
        `Jinhsi Standard Opener source sequence drift at step ${index + 1}: ${String(sourceSequence[index])}`,
      );
    }
  }
}

/**
 * Source-specific combat-start boundary for the canonical Standard Opener.
 *
 * Current Prydwen source explicitly says Jinhsi starts combat with this exact
 * opener and performs a quick low-power Forte Skill before the rest of the team
 * applies their buffs. The exact opener contains no Intro Skill. Therefore the
 * Intro-triggered Ages of Harvest and Celestial Light windows are source-proven
 * inactive for this opener rather than merely "timeline unknown".
 *
 * The same source also establishes that teammate setup happens after this
 * opener, so the resolved opener state exposes no active Zhezhi/Verina incoming
 * window. That observation is kept as evidence only: the broader team incoming
 * dependency remains pending until later-cycle team-state execution is closed.
 *
 * This does not infer anything about the Skill-triggered Ages window, Jué's
 * free-flow Echo timing, Incandescence gained during the opener, or exact action
 * timestamps/duration.
 */
export function resolveJinhsiStandardOpenerCombatStartState(
  sourceSequence: readonly string[],
): JinhsiStandardOpenerCombatStartResolution {
  validateExactStandardOpener(sourceSequence);

  return {
    primitiveId: JINHSI_STANDARD_OPENER_COMBAT_START_PRIMITIVE_ID,
    presetId: 'jinhsi-standard-opener',
    rotationId: 'jinhsi-standard-opener-source-sequence',
    sourceScope: 'SOURCE_DEFINED_COMBAT_START_BEFORE_TEAM_SETUP',
    canonicalIntroSkillCastPresent: false,
    agesIntroWindowActive: false,
    celestialIntroWindowActive: false,
    zhezhiIncomingStateActive: false,
    verinaIncomingStateActive: false,
    teamIncomingStateActive: false,
    agesSkillWindowResolved: false,
    jueCastResolved: false,
    incandescenceTimelineResolved: false,
    exactTimelineResolved: false,
  };
}

export const JINHSI_STANDARD_OPENER_COMBAT_START_SOURCE_REVIEW = {
  reviewedAt: '2026-09-01',
  sourceUrl: 'https://www.prydwen.gg/wuthering-waves/characters/jinhsi',
  sourceLastUpdated: '2026-08-20',
  presetId: 'jinhsi-standard-opener',
  rotationId: 'jinhsi-standard-opener-source-sequence',
  primitiveId: JINHSI_STANDARD_OPENER_COMBAT_START_PRIMITIVE_ID,
  closesPendingExecutionIds: JINHSI_STANDARD_OPENER_COMBAT_START_CLOSED_PENDING_EXECUTION_IDS,
  sourceEstablished: [
    'Current Standard Opener source explicitly says Jinhsi starts combat and then lists the exact promoted 12-step sequence; that sequence contains no Intro Skill.',
    'Current rotation-concept source says the first opener is a quick low-power Forte Skill performed before the rest of the team applies buffs onto Jinhsi.',
    'Ages of Harvest AH-INTRO and Celestial Light S05_5PC_SPECTRO require an actual Jinhsi Intro Skill cast, so neither window is entered in this source-defined combat-start opener.',
    'The source-defined opener occurs before Zhezhi/Verina team setup, so no teammate incoming window is treated as active inside the opener; the broader team dependency is deliberately not closed by this review.',
  ],
  boundaries: [
    'AH-SKILL remains pending because the opener contains Resonance Skill casts but has no exact timestamps proving the 12-second window overlap for every affected action.',
    'Jué remains pending because current source describes Echo timing as free-flow and does not pin an exact Jué cast to the Standard Opener sequence.',
    'The Jinhsi + Zhezhi + Verina incoming-state dependency remains pending for later-cycle team-state execution even though the combat-start opener itself is pre-buff.',
    'Incandescence remains pending because combat-start source does not establish the exact amount gained across the opener or its per-Attribute cadence timestamps.',
    'No exact action timestamps, opener duration, opener DPS denominator, loop timing, BuildContext, freeze, DPS_READY, product DPS or Roll Assist policy is authorized by this closure.',
  ],
} as const;
