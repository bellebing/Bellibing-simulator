import { PROFILE_REGISTRY } from '../data/profileCatalogs.ts';
import type { SigrikaRuneType, SigrikaRunicBranch } from './sigrikaResourceState.ts';
import { SIGRIKA_STANDARD_CANONICAL_SOURCE_SEQUENCE } from './sigrikaStandardSourceCheckpoints.ts';

export const SIGRIKA_STANDARD_RUNE_SOURCE_PATH_ADAPTER_ID = 'sigrika-standard-rune-source-path-v1' as const;
export const SIGRIKA_STANDARD_RUNE_SOURCE_PATH_PENDING_ID = 'character:sigrika:rune-lifecycle-adapter' as const;

export type SigrikaStandardRuneSourceEvent =
  | 'INTRO_CAST'
  | 'FIRST_ELUCIDATED_DIRECT_HIT'
  | 'FIRST_SCHEMATA_CAST'
  | 'LIBERATION_CAST'
  | 'SECOND_ELUCIDATED_DIRECT_HIT'
  | 'SECOND_SCHEMATA_CAST';

export interface SigrikaStandardRuneSourcePathState {
  readonly phase:
    | 'START'
    | 'INTRO_CAST'
    | 'FIRST_RUNES_GAINED'
    | 'FIRST_SCHEMATA_CONSUMED'
    | 'LIBERATION_CAST'
    | 'SECOND_RUNES_GAINED'
    | 'SECOND_SCHEMATA_CONSUMED';
  readonly runes: readonly SigrikaRuneType[];
  readonly fullStop: 0 | 50 | 100;
  readonly firstRunicBranch: SigrikaRunicBranch | null;
  readonly secondRunicBranch: SigrikaRunicBranch | null;
  readonly exactActionTimestampsAvailable: false;
  readonly genericTimedStateSimulationUsed: false;
}

export const SIGRIKA_STANDARD_RUNE_SOURCE_EVENTS = Object.freeze([
  'INTRO_CAST',
  'FIRST_ELUCIDATED_DIRECT_HIT',
  'FIRST_SCHEMATA_CAST',
  'LIBERATION_CAST',
  'SECOND_ELUCIDATED_DIRECT_HIT',
  'SECOND_SCHEMATA_CAST',
] as const satisfies readonly SigrikaStandardRuneSourceEvent[]);

export const SIGRIKA_STANDARD_RUNE_SOURCE_STEP_INDEXES = Object.freeze({
  intro: 0,
  firstElucidated: 4,
  firstSchemata: 5,
  liberation: 6,
  secondElucidated: 10,
  secondSchemata: 11,
} as const);

function freezeRunes(runes: readonly SigrikaRuneType[]): readonly SigrikaRuneType[] {
  return Object.freeze([...runes]);
}

export function createInitialSigrikaStandardRuneSourcePathState(): SigrikaStandardRuneSourcePathState {
  return Object.freeze({
    phase: 'START',
    runes: freezeRunes([]),
    fullStop: 0,
    firstRunicBranch: null,
    secondRunicBranch: null,
    exactActionTimestampsAvailable: false,
    genericTimedStateSimulationUsed: false,
  });
}

/**
 * Profile-specific event path for the current Prydwen Standard Rotation only.
 *
 * Prydwen explicitly states that a full Basic chain produces two Runes when
 * Intro/Ultimate was used within the preceding 20s, that the post-Intro pair is
 * same-type, and that the post-Ultimate pair is opposite-type. Prydwen then
 * prescribes Intro -> Basic chain -> Heavy -> Ultimate -> Basic chain -> Heavy.
 *
 * Bellibing therefore consumes those source assertions at the exact canonical
 * checkpoints without inventing seconds. The generic sigrika-resource-state-v1
 * remains the owner of real 20s timers, arbitrary event timing, capacity/shift
 * rules, and >2-Rune fail-closed behavior outside this fixed source path.
 */
export function applySigrikaStandardRuneSourceEvent(
  state: SigrikaStandardRuneSourcePathState,
  event: SigrikaStandardRuneSourceEvent,
): SigrikaStandardRuneSourcePathState {
  switch (event) {
    case 'INTRO_CAST': {
      if (state.phase !== 'START') throw new Error(`Sigrika Standard Rune path expected START before Intro, got ${state.phase}`);
      return Object.freeze({ ...state, phase: 'INTRO_CAST' });
    }
    case 'FIRST_ELUCIDATED_DIRECT_HIT': {
      if (state.phase !== 'INTRO_CAST') {
        throw new Error(`Sigrika Standard Rune path expected Intro before first Elucidated hit, got ${state.phase}`);
      }
      return Object.freeze({
        ...state,
        phase: 'FIRST_RUNES_GAINED',
        runes: freezeRunes(['TRUST', 'TRUST']),
      });
    }
    case 'FIRST_SCHEMATA_CAST': {
      if (state.phase !== 'FIRST_RUNES_GAINED' || state.runes.join('+') !== 'TRUST+TRUST') {
        throw new Error('Sigrika Standard first Schemata requires source-proven TRUST+TRUST');
      }
      return Object.freeze({
        ...state,
        phase: 'FIRST_SCHEMATA_CONSUMED',
        runes: freezeRunes([]),
        fullStop: 50,
        firstRunicBranch: 'RUNIC_CHAIN_WHIP',
      });
    }
    case 'LIBERATION_CAST': {
      if (state.phase !== 'FIRST_SCHEMATA_CONSUMED' || state.fullStop !== 50) {
        throw new Error('Sigrika Standard Liberation checkpoint requires first Schemata / 50 Full Stop');
      }
      return Object.freeze({ ...state, phase: 'LIBERATION_CAST' });
    }
    case 'SECOND_ELUCIDATED_DIRECT_HIT': {
      if (state.phase !== 'LIBERATION_CAST') {
        throw new Error(`Sigrika Standard Rune path expected Liberation before second Elucidated hit, got ${state.phase}`);
      }
      return Object.freeze({
        ...state,
        phase: 'SECOND_RUNES_GAINED',
        runes: freezeRunes(['TRUST', 'ANSWER']),
      });
    }
    case 'SECOND_SCHEMATA_CAST': {
      if (state.phase !== 'SECOND_RUNES_GAINED' || state.runes.join('+') !== 'TRUST+ANSWER') {
        throw new Error('Sigrika Standard second Schemata requires source-proven TRUST+ANSWER');
      }
      return Object.freeze({
        ...state,
        phase: 'SECOND_SCHEMATA_CONSUMED',
        runes: freezeRunes([]),
        fullStop: 100,
        secondRunicBranch: 'RUNIC_OUTBURST',
      });
    }
  }
}

export function resolveSigrikaStandardRuneSourcePath(): SigrikaStandardRuneSourcePathState {
  let state = createInitialSigrikaStandardRuneSourcePathState();
  for (const event of SIGRIKA_STANDARD_RUNE_SOURCE_EVENTS) {
    state = applySigrikaStandardRuneSourceEvent(state, event);
  }
  return state;
}

export const SIGRIKA_STANDARD_RUNE_SOURCE_PATH_REVIEW = Object.freeze({
  reviewId: 'SIGRIKA-STANDARD-RUNE-SOURCE-PATH-2026-09-01-01',
  reviewedAt: '2026-09-01',
  adapterId: SIGRIKA_STANDARD_RUNE_SOURCE_PATH_ADAPTER_ID,
  rotationId: 'sigrika-standard-source-sequence',
  closesPendingExecutionIds: [SIGRIKA_STANDARD_RUNE_SOURCE_PATH_PENDING_ID] as const,
  sourceLabels: ['Prydwen — current Sigrika Key Mechanics and Standard Rotation'],
  sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/sigrika'],
  scope: 'CANONICAL_SOURCE_PRESCRIBED_RUNE_CHECKPOINTS_ONLY' as const,
  sourceEstablished: [
    'Current Prydwen states that a full Basic Attack chain generates one Rune, upgraded to two Runes per chain when Sigrika has cast Intro or Ultimate within the preceding 20 seconds.',
    'Current Prydwen states that the post-Intro Heavy has two Runes of the same type and that Ultimate causes the next Heavy to use two opposite-type Runes.',
    'Current Prydwen practical gameplay explicitly prescribes Intro -> full Basic chain -> Heavy -> Ultimate -> full Basic chain -> Heavy as the simple rotation path.',
    'Raw Character mechanics source-proves Elucidated direct hit -> Trust, Convergent duplicates the same type, Divergent duplicates the opposite type, TRUST+TRUST -> Runic Chain Whip, TRUST+ANSWER -> Runic Outburst, and each Schemata grants 50 Full Stop.',
    'For this exact canonical path the first Elucidated checkpoint therefore yields TRUST+TRUST, first Schemata consumes exactly those two and leaves zero Runes / 50 Full Stop, second Elucidated yields TRUST+ANSWER, and second Schemata consumes exactly those two and leaves zero Runes / 100 Full Stop.',
  ] as const,
  boundaries: [
    'No numeric timestamp is invented. Timed Convergent/Divergent eligibility is accepted only because the current source itself describes these Rune outcomes for the prescribed Standard path.',
    'This adapter does not replace sigrika-resource-state-v1 and does not authorize arbitrary timing, dodge substitutions, Skill-based Answer generation, Rune overwrite/capacity scenarios or any off-sequence execution.',
    'The generic >2-Rune Schemata selection remains UNMODELED_FAIL_CLOSED. This canonical path never stores more than the exact two source-prescribed Runes before either Schemata.',
    'Soliskin Vitality, Innate Gift, Blessing of Runes, equipped-Echo timing, timed gear windows, cancel frames and DPS denominator remain separate dependencies.',
    'The rotation remains SOURCE_SEQUENCE_ONLY; this closure does not authorize ENGINE_MODELED, BuildContext, freeze, DPS_READY or product support.',
  ] as const,
} as const);

export function validateSigrikaStandardRuneSourcePathContract(): readonly string[] {
  const issues: string[] = [];
  const rotation = PROFILE_REGISTRY.rotations.get(SIGRIKA_STANDARD_RUNE_SOURCE_PATH_REVIEW.rotationId);
  if (!rotation) return Object.freeze(['Missing canonical Sigrika Standard rotation']);
  if (rotation.characterId !== 'sigrika') issues.push('Sigrika Rune source path character drifted');
  if (rotation.teamProfileId !== 'sigrika-qiuyuan-ciaccona') issues.push('Sigrika Rune source path team drifted');
  if (rotation.executionStatus !== 'SOURCE_SEQUENCE_ONLY') issues.push('Sigrika Rune source path expects SOURCE_SEQUENCE_ONLY');
  if (rotation.verificationStatus !== 'VERIFIED') issues.push('Sigrika Rune source path expects VERIFIED rotation');
  if (rotation.sourceSequence.length !== SIGRIKA_STANDARD_CANONICAL_SOURCE_SEQUENCE.length
    || rotation.sourceSequence.some((step, index) => step !== SIGRIKA_STANDARD_CANONICAL_SOURCE_SEQUENCE[index])) {
    issues.push('Sigrika Rune source path canonical sequence drifted');
  }

  const resolved = resolveSigrikaStandardRuneSourcePath();
  if (resolved.phase !== 'SECOND_SCHEMATA_CONSUMED'
    || resolved.runes.length !== 0
    || resolved.fullStop !== 100
    || resolved.firstRunicBranch !== 'RUNIC_CHAIN_WHIP'
    || resolved.secondRunicBranch !== 'RUNIC_OUTBURST'
    || resolved.exactActionTimestampsAvailable
    || resolved.genericTimedStateSimulationUsed) {
    issues.push('Sigrika Rune source path final checkpoint drifted');
  }

  return Object.freeze(issues);
}

const CONTRACT_ISSUES = validateSigrikaStandardRuneSourcePathContract();
if (CONTRACT_ISSUES.length > 0) {
  throw new Error(`Invalid Sigrika Standard Rune source path contract: ${CONTRACT_ISSUES.join('; ')}`);
}

export const SIGRIKA_STANDARD_RUNE_SOURCE_PATH = resolveSigrikaStandardRuneSourcePath();
