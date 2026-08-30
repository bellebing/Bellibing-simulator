export const CHANGLI_STANDARD_ROTATION_EXECUTION_REVIEW_20260830 = {
  reviewId: 'ROTATION-EXECUTION-CHANGLI-2026-08-30-01',
  rotationId: 'changli-standard-rotation',
  checkedAt: '2026-08-30',
  disposition: 'SOURCE_SEMANTICS_BLOCKED',
  blockerId: 'BUG-014',
  rotationSeconds: null,
  sourceLabels: ['Prydwen — Changli gameplay'],
  sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/changli'],
  sourceEstablished: [
    'Current Prydwen Standard Rotation matches the canonical Changli sequence: Intro -> True Sight Charge -> Skill -> Heavy -> True Sight Charge -> Mid-air interrupt/Dash -> Mid-air 4 -> True Sight Charge -> Skill -> True Sight Conquest -> Flaming Sacrifice -> Ultimate -> Flaming Sacrifice (Swap) -> Outro.',
    'Prydwen explicitly states that allowing the final Heavy to occur naturally without the swap extends the rotation by 1.37 seconds.',
    'The reviewed Changli + Brant + Lupa context is specifically called out by the source as a reason the no-swap Standard Rotation can be useful.',
  ],
  unresolvedSemantics: [
    'The current source does not publish the exact total duration for this Standard Rotation, so the 1.37-second statement is only a relative delta and cannot be used as rotationSeconds.',
    'Optional quickswapping and the alternate no-swap final Heavy create execution variants, but the source does not provide one exact total duration for the canonical fixed path.',
    'Without an exact source-backed total duration or an explicitly approved measurement method, Bellibing cannot produce a verified Changli DPS denominator.',
  ],
  closesPendingExecutionIds: [] as readonly string[],
} as const;
