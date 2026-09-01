export const JINHSI_STANDARD_OPENER_FIRST_UNISON_PRIMITIVE_ID = 'jinhsi-standard-opener-first-unison-v1';
export const JINHSI_STANDARD_OPENER_UNISON_PENDING_EXECUTION_ID =
  'character:jinhsi:jinhsi-resource-unison:availability-adapter';

export interface JinhsiStandardOpenerFirstUnisonResolution {
  readonly primitiveId: typeof JINHSI_STANDARD_OPENER_FIRST_UNISON_PRIMITIVE_ID;
  readonly presetId: 'jinhsi-standard-opener';
  readonly rotationId: 'jinhsi-standard-opener-source-sequence';
  readonly sourceScope: 'COMBAT_START_STANDARD_OPENER_FIRST_ILLUMINOUS_ONLY';
  readonly firstIlluminousGrantReady: true;
  readonly canonicalOutroUsesUnison: true;
  readonly concertoRequiredForCanonicalOutro: false;
  readonly laterLoopTimingAuthorized: false;
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

/**
 * Source-specific bridge for the first Unison in the canonical Standard Opener.
 *
 * Current Prydwen source explicitly describes this exact Standard Opener as
 * starting combat and getting Jinhsi's Unison Outro immediately. Combined with
 * the source-explicit kit rule that Illuminous Epiphany grants Unison once every
 * 25 seconds, the first Illuminous -> Outro path is source-proven without a
 * predecessor cooldown timestamp. This proof is deliberately limited to the
 * combat-start opener and does not authorize any later loop cadence/timing.
 */
export function resolveJinhsiStandardOpenerFirstUnison(
  sourceSequence: readonly string[],
): JinhsiStandardOpenerFirstUnisonResolution {
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

  return {
    primitiveId: JINHSI_STANDARD_OPENER_FIRST_UNISON_PRIMITIVE_ID,
    presetId: 'jinhsi-standard-opener',
    rotationId: 'jinhsi-standard-opener-source-sequence',
    sourceScope: 'COMBAT_START_STANDARD_OPENER_FIRST_ILLUMINOUS_ONLY',
    firstIlluminousGrantReady: true,
    canonicalOutroUsesUnison: true,
    concertoRequiredForCanonicalOutro: false,
    laterLoopTimingAuthorized: false,
  };
}

export const JINHSI_STANDARD_OPENER_FIRST_UNISON_SOURCE_REVIEW = {
  reviewedAt: '2026-09-01',
  sourceUrl: 'https://www.prydwen.gg/wuthering-waves/characters/jinhsi',
  sourceLastUpdated: '2026-08-20',
  presetId: 'jinhsi-standard-opener',
  rotationId: 'jinhsi-standard-opener-source-sequence',
  primitiveId: JINHSI_STANDARD_OPENER_FIRST_UNISON_PRIMITIVE_ID,
  closesPendingExecutionId: JINHSI_STANDARD_OPENER_UNISON_PENDING_EXECUTION_ID,
  sourceEstablished: [
    'The current Standard Opener is explicitly framed as Jinhsi starting combat and getting her Unison Outro immediately.',
    'The exact promoted opener places Illuminous Epiphany immediately before Outro.',
    'Jinhsi kit source says Illuminous Epiphany grants Unison and that this grant can trigger once every 25 seconds.',
    'Unison is consumed in priority instead of Concerto when Concerto is full, so unknown Concerto state does not block this source-proven first Unison Outro path.',
  ],
  boundaries: [
    'This closes only the first-combat Standard Opener Unison availability path.',
    'No exact Illuminous timestamp, later 25-second cadence placement, loop timing, Incandescence amount, teammate predecessor state, or DPS denominator is inferred.',
  ],
} as const;
