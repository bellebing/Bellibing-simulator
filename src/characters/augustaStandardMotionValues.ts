/**
 * Historical/executable Augusta Standard parity values.
 *
 * These are the locked V9.15 Lv90/S0/10-10-10-10-10 aggregate motion values
 * used by the existing Augusta Standard combat oracle. They intentionally do
 * not live on CharacterActionFact: canonical Character Mechanics facts own the
 * current source-facing Lv1-Lv10 representation, while this fixture owns the
 * selected-level/rotation aggregate required for exact parity regression.
 */
export const AUGUSTA_STANDARD_PARITY_MOTION_VALUE_BY_FACT_ID: ReadonlyMap<string, number | null> = new Map([
  ['augusta-intro-stride-of-goldenflare', 1.9882],
  ['augusta-heavy-thunderoar-backstep', .5368],
  ['augusta-heavy-thunderoar-spinslash', 4.2516],
  ['augusta-skill-warriors-blade', 6.561],
  ['augusta-liberation-sword-of-eternal-oath', 10.9948],
  ['augusta-forte-undying-sunlight-strike', 2.7834],
  ['augusta-forte-undying-sunlight-leap', 2.7835],
  ['augusta-forte-undying-sunlight-plunge', 8.6583],
  ['augusta-liberation-sublime-is-the-sun-state', null],
  ['augusta-liberation-sunborne', 10.7361],
  ['augusta-liberation-everbright-protector', 11.9293],
  ['augusta-outro-battlesong-of-the-unyielding', null],
] as const);

export const AUGUSTA_STANDARD_PARITY_CONTEXT = {
  label: 'V9.15 Augusta Standard Lv90/S0/10-10-10-10-10 exact-parity fixture',
  notes: [
    'Values are preserved from the exact-parity model and are not recomputed from the current raw source catalog.',
    'Sunborne is intentionally the historical nine-cast aggregate (119.29% × 9 = 1073.61%), while the canonical raw CharacterActionFact stores one source action coefficient per skill level.',
  ],
} as const;
