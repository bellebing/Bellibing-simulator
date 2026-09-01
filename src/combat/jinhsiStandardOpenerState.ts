export type JinhsiStandardOpenerPhase =
  | 'NORMAL'
  | 'OVERFLOWING_AVAILABLE'
  | 'INCARNATION'
  | 'ORDINATION_GLOW'
  | 'POST_ILLUMINOUS'
  | 'OUTRO_REQUESTED';

export type JinhsiUnknownResourceState = 'UNRESOLVED_PREDECESSOR_STATE';
export type JinhsiStandardOpenerUnisonAvailability =
  | 'NOT_YET_GRANTED_IN_COMBAT_START_OPENER'
  | 'AVAILABLE_FROM_FIRST_ILLUMINOUS'
  | 'CONSUMED_BY_CANONICAL_UNISON_OUTRO';

export interface JinhsiStandardOpenerStateSnapshot {
  readonly step: number;
  readonly sourceStep: string;
  readonly phaseBefore: JinhsiStandardOpenerPhase;
  readonly phaseAfter: JinhsiStandardOpenerPhase;
  readonly incandescence: JinhsiUnknownResourceState;
  readonly unisonAvailability: JinhsiStandardOpenerUnisonAvailability;
  readonly notes: readonly string[];
}

export interface JinhsiStandardOpenerActionMapRow {
  readonly step: number;
  readonly sourceStep: string;
  readonly factIds: readonly string[];
  readonly phaseBefore: JinhsiStandardOpenerPhase;
  readonly phaseAfter: JinhsiStandardOpenerPhase;
  readonly notes: readonly string[];
}

/**
 * Canonical source-sequence mapping only. No action duration, swap cadence,
 * Incandescence amount, teammate predecessor timeline, Intro carry-in or Echo
 * cast is inferred. The first combat-start Unison path is source-closed by the
 * dedicated Standard Opener source review and is reflected symbolically here.
 */
export const JINHSI_STANDARD_OPENER_ACTION_MAP: readonly JinhsiStandardOpenerActionMapRow[] = Object.freeze([
  { step: 1, sourceStep: 'Basic P1', factIds: ['jinhsi-basic-attack-slash-of-breaking-dawn-stage-1-dmg'], phaseBefore: 'NORMAL', phaseAfter: 'NORMAL', notes: [] },
  { step: 2, sourceStep: 'Basic P2', factIds: ['jinhsi-basic-attack-slash-of-breaking-dawn-stage-2-dmg'], phaseBefore: 'NORMAL', phaseAfter: 'NORMAL', notes: [] },
  { step: 3, sourceStep: 'Basic P3', factIds: ['jinhsi-basic-attack-slash-of-breaking-dawn-stage-3-dmg'], phaseBefore: 'NORMAL', phaseAfter: 'NORMAL', notes: [] },
  {
    step: 4,
    sourceStep: 'Basic P4',
    factIds: ['jinhsi-basic-attack-slash-of-breaking-dawn-stage-4-dmg', 'jinhsi-skill-overflowing-radiance-window'],
    phaseBefore: 'NORMAL',
    phaseAfter: 'OVERFLOWING_AVAILABLE',
    notes: ['Basic Attack Stage 4 source-explicitly opens Overflowing Radiance for 5s.'],
  },
  {
    step: 5,
    sourceStep: 'Skill: Overflowing Radiance',
    factIds: ['jinhsi-resonance-skill-trailing-lights-of-eons-overflowing-radiance-dmg', 'jinhsi-forte-incarnation-ordination-glow'],
    phaseBefore: 'OVERFLOWING_AVAILABLE',
    phaseAfter: 'INCARNATION',
    notes: ['Casting Overflowing Radiance enters Incarnation.'],
  },
  {
    step: 6,
    sourceStep: 'Ultimate',
    factIds: ['jinhsi-resonance-liberation-purge-of-light-skill-dmg'],
    phaseBefore: 'INCARNATION',
    phaseAfter: 'INCARNATION',
    notes: ['No source-backed Incarnation exit or resource fill is attached to this Liberation action.'],
  },
  { step: 7, sourceStep: 'Incarnation Basic P1', factIds: ['jinhsi-forte-circuit-luminal-synthesis-incarnation-basic-attack-1-dmg'], phaseBefore: 'INCARNATION', phaseAfter: 'INCARNATION', notes: ['Incarnation Basic Attack is Resonance Skill DMG.'] },
  { step: 8, sourceStep: 'Incarnation Basic P2', factIds: ['jinhsi-forte-circuit-luminal-synthesis-incarnation-basic-attack-2-dmg'], phaseBefore: 'INCARNATION', phaseAfter: 'INCARNATION', notes: ['Incarnation Basic Attack is Resonance Skill DMG.'] },
  { step: 9, sourceStep: 'Incarnation Basic P3', factIds: ['jinhsi-forte-circuit-luminal-synthesis-incarnation-basic-attack-3-dmg'], phaseBefore: 'INCARNATION', phaseAfter: 'INCARNATION', notes: ['Incarnation Basic Attack is Resonance Skill DMG.'] },
  {
    step: 10,
    sourceStep: 'Incarnation Basic P4',
    factIds: ['jinhsi-forte-circuit-luminal-synthesis-incarnation-basic-attack-4-dmg', 'jinhsi-forte-incarnation-ordination-glow'],
    phaseBefore: 'INCARNATION',
    phaseAfter: 'ORDINATION_GLOW',
    notes: ['After Incarnation Basic Attack Stage 4, Incarnation ends; Ordination Glow lasts 5s and Resonance Skill becomes Illuminous Epiphany.'],
  },
  {
    step: 11,
    sourceStep: 'Skill: Illuminous Epiphany',
    factIds: [
      'jinhsi-forte-circuit-luminal-synthesis-illuminous-epiphany-solar-flare-dmg',
      'jinhsi-forte-circuit-luminal-synthesis-illuminous-epiphany-stella-glamor-dmg',
      'jinhsi-forte-incandescence-damage-multiplier',
      'jinhsi-resource-incandescence',
      'jinhsi-resource-unison',
    ],
    phaseBefore: 'ORDINATION_GLOW',
    phaseAfter: 'POST_ILLUMINOUS',
    notes: [
      'Illuminous Epiphany consumes up to 50 Incandescence before Stella Glamor resolves; the source sequence does not establish the starting/earned amount.',
      'Current Standard Opener source explicitly starts combat and obtains the Unison Outro from this first Illuminous Epiphany, so the first 25s grant gate is source-proven ready without a predecessor timestamp.',
    ],
  },
  {
    step: 12,
    sourceStep: 'Outro',
    factIds: ['jinhsi-outro-temporal-bender', 'jinhsi-resource-unison'],
    phaseBefore: 'POST_ILLUMINOUS',
    phaseAfter: 'OUTRO_REQUESTED',
    notes: [
      'The canonical Standard Opener Outro is source-proven as the Unison path; unknown Concerto state is not required for this first combat-start Outro.',
      'The incoming Resonator identity/timestamp and later 25s Unison cadence placement remain outside this opener-state map.',
    ],
  },
]);

export function getJinhsiStandardOpenerStateSnapshots(): readonly JinhsiStandardOpenerStateSnapshot[] {
  return JINHSI_STANDARD_OPENER_ACTION_MAP.map((row) => ({
    step: row.step,
    sourceStep: row.sourceStep,
    phaseBefore: row.phaseBefore,
    phaseAfter: row.phaseAfter,
    incandescence: 'UNRESOLVED_PREDECESSOR_STATE',
    unisonAvailability: row.step < 11
      ? 'NOT_YET_GRANTED_IN_COMBAT_START_OPENER'
      : row.step === 11
        ? 'AVAILABLE_FROM_FIRST_ILLUMINOUS'
        : 'CONSUMED_BY_CANONICAL_UNISON_OUTRO',
    notes: row.notes,
  }));
}
