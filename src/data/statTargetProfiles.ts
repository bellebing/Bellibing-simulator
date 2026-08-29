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
];
