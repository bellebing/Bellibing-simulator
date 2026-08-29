import type { StatTargetProfile } from '../profileDomain.ts';

export const STAT_TARGET_PROFILES: readonly StatTargetProfile[] = [
  {
    kind: 'STAT_TARGET',
    id: 'augusta-recommended-targets-v915-current',
    name: 'Augusta — Recommended Build Stats',
    characterId: 'augusta',
    verificationStatus: 'VERIFIED',
    provenance: {
      sourceLabels: ['V9.15 Build Simulator', 'V9.15 Strategy Cache', 'V9.15 DPS Contexts', 'Prydwen Augusta build'],
      sourceUrls: [
        'https://docs.google.com/spreadsheets/d/1E_6YNe3OED6kihXWK6IQ8D-DcwdkuuAXvlG3ZtgkbP0/edit',
        'https://www.prydwen.gg/wuthering-waves/characters/augusta',
      ],
      checkedAt: '2026-08-29',
      notes: [
        'Current Prydwen build priority is Energy Regen (until satisfied) > CRIT Rate = CRIT DMG > ATK% = Heavy Attack DMG% before lower-priority stats.',
        'Build-stat priority is kept here; Roll Assistant minimum-roll thresholds and 2 Core + Any 1 Useful stopping requirements live separately in AUGUSTA_RECOMMENDED_V915.',
        'The V9.15 Strategy Cache live/cached fingerprint remains the historical parity evidence for that separate Roll policy.',
      ],
    },
    targetRules: [
      { stat: 'Energy Regen', priority: 1, notes: 'Until the source-backed total ER requirement is satisfied.' },
      { stat: 'CRIT Rate', priority: 2 },
      { stat: 'CRIT DMG', priority: 2 },
      { stat: 'ATK%', priority: 3 },
      { stat: 'Heavy Attack DMG', priority: 3 },
    ],
    gates: [
      {
        stat: 'Energy Regen Total',
        minimum: 1.16,
        preferred: 1.25,
        notes: 'Current Prydwen endgame band is 116%-125%; higher end is estimated for Iuno + Shorekeeper, matching the existing standard context.',
      },
    ],
  },
  {
    kind: 'STAT_TARGET',
    id: 'cartethyia-aero-erosion-build-stats',
    name: 'Cartethyia — Aero Erosion Build Stats',
    characterId: 'cartethyia',
    verificationStatus: 'VERIFIED',
    provenance: {
      sourceLabels: ['Prydwen Cartethyia build'],
      sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/cartethyia'],
      checkedAt: '2026-08-29',
      notes: [
        'Current source priority: Energy Regen until satisfied > CRIT Rate = CRIT DMG > HP% > Basic Attack DMG% = Liberation DMG% > HP.',
        'This is build-stat priority only; no Bellibing Roll Assistant minimum-roll or required-hit policy is inferred from it.',
      ],
    },
    targetRules: [
      { stat: 'Energy Regen', priority: 1 },
      { stat: 'CRIT Rate', priority: 2 },
      { stat: 'CRIT DMG', priority: 2 },
      { stat: 'HP%', priority: 3 },
      { stat: 'Basic Attack DMG', priority: 4 },
      { stat: 'Liberation DMG', priority: 4 },
      { stat: 'Flat HP', priority: 5 },
    ],
    gates: [
      {
        stat: 'Energy Regen Total',
        minimum: 1.1,
        notes: 'Current Prydwen endgame target is 110%+ Energy Regen.',
      },
    ],
  },
  {
    kind: 'STAT_TARGET',
    id: 'ciaccona-cartethyia-aero-build-stats',
    name: 'Ciaccona — Cartethyia Aero Build Stats',
    characterId: 'ciaccona',
    verificationStatus: 'VERIFIED',
    provenance: {
      sourceLabels: ['Prydwen Ciaccona build'],
      sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/ciaccona'],
      checkedAt: '2026-08-29',
      notes: [
        'Current source priority: Energy Regen until satisfied > CRIT Rate = CRIT DMG > ATK% > ATK.',
        'Bellibing maps source flat ATK substat wording to the existing Flat ATK StatName.',
        'This is build-stat priority only; no Roll Assistant stopping thresholds are inferred.',
      ],
    },
    targetRules: [
      { stat: 'Energy Regen', priority: 1 },
      { stat: 'CRIT Rate', priority: 2 },
      { stat: 'CRIT DMG', priority: 2 },
      { stat: 'ATK%', priority: 3 },
      { stat: 'Flat ATK', priority: 4 },
    ],
    gates: [
      {
        stat: 'Energy Regen Total',
        minimum: 1.15,
        notes: 'Current Prydwen endgame target is 115%+ Energy Regen.',
      },
    ],
  },
  {
    kind: 'STAT_TARGET',
    id: 'rover-aero-cartethyia-ciaccona-build-stats',
    name: 'Rover (Aero) — Cartethyia + Ciaccona Build Stats',
    characterId: 'rover-aero',
    verificationStatus: 'VERIFIED',
    provenance: {
      sourceLabels: ['Prydwen Rover (Aero) build'],
      sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/rover-aero'],
      checkedAt: '2026-08-29',
      notes: [
        'Current source priority: Energy Regen until satisfied > CRIT Rate = CRIT DMG > ATK% > Resonance Skill DMG% > ATK.',
        'The source ER band is 128%-138%; it places Cartethyia + Ciaccona at the higher end. The profile therefore records 138% for this exact team context instead of applying the lower band globally.',
        'Bloodpact’s Pledge supplies enough source-listed ER that the guide does not require ER substats in this exact setup; this does not become a Roll Assistant rule.',
      ],
    },
    targetRules: [
      { stat: 'Energy Regen', priority: 1 },
      { stat: 'CRIT Rate', priority: 2 },
      { stat: 'CRIT DMG', priority: 2 },
      { stat: 'ATK%', priority: 3 },
      { stat: 'Skill DMG', priority: 4 },
      { stat: 'Flat ATK', priority: 5 },
    ],
    gates: [
      {
        stat: 'Energy Regen Total',
        minimum: 1.38,
        notes: 'Current source gives 128%-138%; the reviewed Cartethyia + Ciaccona context uses the high end, 138%. Bloodpact’s Pledge supplies enough ER that source guidance does not require ER substats in this setup.',
      },
    ],
  },
  {
    kind: 'STAT_TARGET',
    id: 'iuno-augusta-hybrid-build-stats',
    name: 'Iuno — Augusta Hybrid Build Stats',
    characterId: 'iuno',
    verificationStatus: 'VERIFIED',
    provenance: {
      sourceLabels: ['Prydwen Iuno build'],
      sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/iuno'],
      checkedAt: '2026-08-29',
      notes: [
        'Current Hybrid/Sub DPS source priority: Energy Regen until satisfied > CRIT Rate = CRIT DMG > Resonance Liberation DMG% ≥ ATK% > ATK.',
        'The source ≥ relation is preserved conservatively as Liberation DMG ahead of ATK%, not silently converted into an exact tie.',
        'This is build-stat priority only; no Roll Assistant stopping thresholds are inferred.',
      ],
    },
    targetRules: [
      { stat: 'Energy Regen', priority: 1 },
      { stat: 'CRIT Rate', priority: 2 },
      { stat: 'CRIT DMG', priority: 2 },
      { stat: 'Liberation DMG', priority: 3 },
      { stat: 'ATK%', priority: 4 },
      { stat: 'Flat ATK', priority: 5 },
    ],
    gates: [
      {
        stat: 'Energy Regen Total',
        minimum: 1.2,
        preferred: 1.3,
        notes: 'Current Hybrid/Sub DPS source band is 120%-130%+ ER and is estimated in an Augusta team context.',
      },
    ],
  },
  {
    kind: 'STAT_TARGET',
    id: 'shorekeeper-augusta-iuno-build-stats',
    name: 'The Shorekeeper — Augusta + Iuno Support Build Stats',
    characterId: 'the-shorekeeper',
    verificationStatus: 'VERIFIED',
    provenance: {
      sourceLabels: ['Prydwen The Shorekeeper build'],
      sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/the-shorekeeper'],
      checkedAt: '2026-08-29',
      notes: [
        'Current source priority: Energy Regen until 230% > CRIT DMG ≥ Resonance Liberation DMG% > HP% > CRIT Rate > HP > ATK% = ATK.',
        'The source ≥ relation is preserved conservatively as CRIT DMG ahead of Liberation DMG, while ATK% = flat ATK remains an explicit tie.',
        'The 230% target is explicitly before the +10% Fallacy of No Return Echo effect and Shorekeeper’s +10% passive contribution; the profile note preserves that source semantic instead of treating 230% as a post-buff universal threshold.',
      ],
    },
    targetRules: [
      { stat: 'Energy Regen', priority: 1 },
      { stat: 'CRIT DMG', priority: 2 },
      { stat: 'Liberation DMG', priority: 3 },
      { stat: 'HP%', priority: 4 },
      { stat: 'CRIT Rate', priority: 5 },
      { stat: 'Flat HP', priority: 6 },
      { stat: 'ATK%', priority: 7 },
      { stat: 'Flat ATK', priority: 7 },
    ],
    gates: [
      {
        stat: 'Energy Regen Total',
        minimum: 2.3,
        notes: 'Current source target is 230% ER before the +10% Fallacy of No Return Echo effect and Shorekeeper’s +10% passive contribution.',
      },
    ],
  },
];
