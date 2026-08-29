import type { StatTargetProfile } from '../profileDomain.ts';

export const STAT_TARGET_PROFILES: readonly StatTargetProfile[] = [
  {
    kind: 'STAT_TARGET',
    id: 'augusta-recommended-targets-v915-current',
    name: 'Augusta — Recommended Build Stats',
    characterId: 'augusta',
    verificationStatus: 'VERIFIED',
    provenance: {
      sourceLabels: ['V9.15 Build Simulator', 'V9.15 Strategy Cache', 'V9.15 DPS Contexts'],
      sourceUrls: [
        'https://docs.google.com/spreadsheets/d/1E_6YNe3OED6kihXWK6IQ8D-DcwdkuuAXvlG3ZtgkbP0/edit',
      ],
      checkedAt: '2026-08-25',
      notes: [
        'Build-stat priority is kept here; Roll Assistant minimum-roll thresholds and 2 Core + Any 1 Useful stopping requirements live separately in AUGUSTA_RECOMMENDED_V915.',
        'The V9.15 Strategy Cache live/cached fingerprint remains the historical parity evidence for that separate Roll policy.',
      ],
    },
    targetRules: [
      { stat: 'CRIT DMG', role: 'CORE' },
      { stat: 'CRIT Rate', role: 'CORE' },
      { stat: 'ATK%', role: 'USEFUL' },
      { stat: 'Energy Regen', role: 'USEFUL' },
      { stat: 'Heavy Attack DMG', role: 'USEFUL' },
    ],
    gates: [
      {
        stat: 'Energy Regen Total',
        minimum: 1.16,
        preferred: 1.25,
        notes: 'V9.15 Augusta standard context hard floor / preferred band for Iuno + Shorekeeper.',
      },
    ],
  },
];
