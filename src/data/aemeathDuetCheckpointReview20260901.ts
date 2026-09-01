export interface AemeathDuetSourceCheckpoint {
  readonly step: 8 | 12;
  readonly sourceAction: 'Skill: Duet Encore' | 'Skill: Duet Overture';
  readonly prerequisiteBasicStage4Step: 7 | 11;
  readonly minimumSynchronizationRate: 100;
  readonly sourceSequenceAuthorizesCast: true;
  readonly exactSynchronizationRateBeforeCast: null;
}

/**
 * Source-sequence eligibility proof only.
 *
 * The current canonical Prydwen Standard Rotation explicitly prescribes both
 * Seraphic Duet casts at these checkpoints, while the same current source says
 * each Duet requires >=100 Synchronization Rate and consumes 100. That is enough
 * to source-prove that the guide sequence considers the casts eligible at the
 * two listed checkpoints.
 *
 * It is deliberately NOT a numeric Synchronization state model: current reviewed
 * mechanics text still does not expose exact routine Basic-attack gains, so an
 * executable combat timeline may not reconstruct the gauge from this record.
 */
export const AEMEATH_DUET_SOURCE_CHECKPOINT_REVIEW_20260901 = {
  reviewId: 'AEMEATH-DUET-SOURCE-CHECKPOINTS-2026-09-01-01',
  characterId: 'aemeath',
  presetId: 'aemeath-standard',
  rotationId: 'aemeath-standard-source-sequence',
  checkedAt: '2026-09-01',
  semantics: 'SOURCE_SEQUENCE_ELIGIBILITY_ONLY',
  engineResourceArithmeticAvailable: false,
  checkpoints: [
    {
      step: 8,
      sourceAction: 'Skill: Duet Encore',
      prerequisiteBasicStage4Step: 7,
      minimumSynchronizationRate: 100,
      sourceSequenceAuthorizesCast: true,
      exactSynchronizationRateBeforeCast: null,
    },
    {
      step: 12,
      sourceAction: 'Skill: Duet Overture',
      prerequisiteBasicStage4Step: 11,
      minimumSynchronizationRate: 100,
      sourceSequenceAuthorizesCast: true,
      exactSynchronizationRateBeforeCast: null,
    },
  ] satisfies readonly AemeathDuetSourceCheckpoint[],
  provenance: {
    sourceLabels: ['Prydwen Aemeath current Standard Rotation and Key Mechanics'],
    sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/aemeath'],
    notes: [
      'Current Standard Rotation explicitly places Duet Encore at step 8 after Mech Basic 4 and Duet Overture at step 12 after Aemeath Basic 4.',
      'The same current source states that Synchronization Rate enables Forte Skills at 100 points cost and that Basic Attack chains replenish that resource.',
      'This closes source eligibility at the prescribed guide checkpoints only; it does not supply missing per-action Synchronization gains, timestamps, or a DPS denominator.',
    ],
  },
} as const;
