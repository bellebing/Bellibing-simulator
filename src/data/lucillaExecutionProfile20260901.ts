import type { RotationProfile } from '../profileDomain.ts';
import {
  LUCILLA_STANDARD_ASSUMED_MECHANIC_FACT_IDS,
  LUCILLA_STANDARD_ENGINE_MODEL_ID,
  LUCILLA_STANDARD_MODELED_MECHANIC_FACT_IDS,
  LUCILLA_STANDARD_ROTATION_SECONDS,
} from '../characters/lucillaStandard.ts';

export const LUCILLA_STANDARD_ROTATION_ID = 'lucilla-standard-rotation';

export const LUCILLA_STANDARD_EXECUTION_REVIEW_20260901 = {
  reviewId: 'ROTATION-EXECUTION-LUCILLA-2026-09-01-01',
  rotationId: LUCILLA_STANDARD_ROTATION_ID,
  checkedAt: '2026-09-01',
  disposition: 'ENGINE_MODEL_AUTHORIZED_WITH_UNRESOLVED_DAMAGE_EDGES',
  engineModelId: LUCILLA_STANDARD_ENGINE_MODEL_ID,
  rotationSeconds: LUCILLA_STANDARD_ROTATION_SECONDS,
  sourceLabels: [
    'Prydwen — Lucilla current Standard Rotation / Glacio Chafe build',
    'Arab Wuwa — Hiyuki and Chisa with Lucilla Fast Rotation',
    'Arab Wuwa — Hiyuki + Lucilla + Chisa team timing',
  ],
  sourceUrls: [
    'https://www.prydwen.gg/wuthering-waves/characters/lucilla',
    'https://arabwuwa.com/rotations/hiyuki-and-chisa-with-lucilla-fast-rotation-107/',
    'https://arabwuwa.com/teams/hiyuki-lucilla-chisa-136/',
  ],
  notes: [
    'Prydwen supplies the canonical Standard Rotation skeleton and requires Spotlight Perfect Release. For Glacio Chafe, Glommoth may be summoned at any point in the rotation.',
    'Arab Wuwa independently publishes the exact supported fast Hiyuki + Lucilla + Chisa route as Intro -> Hold Skill -> Glommoth -> Liberation -> Hold Basic to consume the 3 Fortes -> Outro and measures Lucilla Fast at 7.34 seconds.',
    'The engine uses ordered events and the exact total duration only. It does not fabricate individual action timestamps or animation frames.',
    'Internal Phantom Frame, Spotlight, Tracing Forms and Memory Palace: Oblivion damage/resource events are executed from canonical Character Mechanics; they are not expanded into fake guide timestamps.',
    'The exact Glommoth active hit remains unresolved because current reviewed sources publish 273.60% Glacio DMG without an explicit scaling-stat grammar. ENGINE_MODELED therefore does not imply full Personal Rotation DPS closure.',
    'Glacio Chafe system damage and dynamic Chisa/Kumokiri target-state effects remain separate execution boundaries and are not flattened into constant uptime.',
  ],
} as const;

const EXECUTABLE_SOURCE_SEQUENCE = [
  'Intro',
  'Hold Skill: Spotlight (Perfect Release)',
  'Echo: Glommoth',
  'Ultimate: Clear As Day',
  'Hold Basic: Tracing Forms 1 -> 2 -> 3 (consume 3 Photos)',
  'Letting It Go',
  'Outro',
] as const;

/**
 * Preserve the generated 2026-08-31 source snapshot byte-for-byte while
 * promoting only the canonical registry projection to the independently
 * reviewed executable Lucilla fast route.
 */
export function applyLucillaStandardExecutionOverride(
  rotations: readonly RotationProfile[],
): readonly RotationProfile[] {
  let matched = 0;

  const next = rotations.map((rotation) => {
    if (rotation.id !== LUCILLA_STANDARD_ROTATION_ID) return rotation;
    matched += 1;

    if (rotation.characterId !== 'lucilla') {
      throw new Error(`${LUCILLA_STANDARD_ROTATION_ID}: execution override resolved character ${rotation.characterId}.`);
    }
    if (rotation.teamProfileId !== 'lucilla-standard-team') {
      throw new Error(`${LUCILLA_STANDARD_ROTATION_ID}: unexpected team profile ${rotation.teamProfileId}.`);
    }
    if (rotation.variantKey !== 'standard') {
      throw new Error(`${LUCILLA_STANDARD_ROTATION_ID}: unexpected variant ${rotation.variantKey}.`);
    }
    if (rotation.executionStatus !== 'SOURCE_SEQUENCE_ONLY') {
      throw new Error(`${LUCILLA_STANDARD_ROTATION_ID}: generated source baseline is no longer SOURCE_SEQUENCE_ONLY.`);
    }

    return {
      ...rotation,
      name: 'Lucilla — standard Engine-Modeled Rotation',
      executionStatus: 'ENGINE_MODELED' as const,
      sourceSequence: EXECUTABLE_SOURCE_SEQUENCE,
      engineModelId: LUCILLA_STANDARD_ENGINE_MODEL_ID,
      rotationSeconds: LUCILLA_STANDARD_ROTATION_SECONDS,
      modeledMechanicFactIds: LUCILLA_STANDARD_MODELED_MECHANIC_FACT_IDS,
      assumedMechanicFactIds: LUCILLA_STANDARD_ASSUMED_MECHANIC_FACT_IDS,
      provenance: {
        sourceLabels: [
          ...rotation.provenance.sourceLabels,
          ...LUCILLA_STANDARD_EXECUTION_REVIEW_20260901.sourceLabels,
        ],
        sourceUrls: [
          ...new Set([
            ...(rotation.provenance.sourceUrls ?? []),
            ...LUCILLA_STANDARD_EXECUTION_REVIEW_20260901.sourceUrls,
          ]),
        ],
        checkedAt: LUCILLA_STANDARD_EXECUTION_REVIEW_20260901.checkedAt,
        notes: [
          ...(rotation.provenance.notes ?? []),
          ...LUCILLA_STANDARD_EXECUTION_REVIEW_20260901.notes,
        ],
      },
    } satisfies RotationProfile;
  });

  if (matched !== 1) {
    throw new Error(`Lucilla execution override expected exactly one ${LUCILLA_STANDARD_ROTATION_ID}, found ${matched}.`);
  }
  return next;
}
