// Explicit owner interpretation, reaffirmed 2026-10-22 for Issue #348.
// Preserve the original English raw text ("over 120") as translation evidence.
// This resolves that wording only; it does not qualify a combat engine or team.
export const DANJIN_RUBY_BLOSSOM_INTERPRETATION = {
  authority: 'EXPLICIT_OWNER_DECISION',
  recordedAt: '2026-10-22',
  sourceMoveId: 1000807,
  maximum: 120,
  fullPowerThreshold: 120,
  fullPowerConsumption: 120,
  comparison: 'AT_LEAST',
  translationIssue: 'The English source says over 120 while capping Ruby Blossom at 120. The owner has resolved this as full meter: exactly 120 qualifies for full power.',
} as const;
