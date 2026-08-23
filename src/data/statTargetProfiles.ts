import type { StatTargetProfile } from '../profileDomain.ts';

export const STAT_TARGET_PROFILES: readonly StatTargetProfile[] = [
  {
    kind: 'STAT_TARGET',
    id: 'augusta-recommended-targets-v915-current',
    name: 'Augusta — Recommended Targets',
    characterId: 'augusta',
    verificationStatus: 'VERIFIED',
    provenance: {
      sourceLabels: ['V9.15 Build Simulator', 'V9.15 DPS Contexts'],
      sourceUrls: [
        'https://docs.google.com/spreadsheets/d/1E_6YNe3OED6kihXWK6IQ8D-DcwdkuuAXvlG3ZtgkbP0/edit',
      ],
      checkedAt: '2026-08-23',
      notes: [
        'Current active V9.15 requirement is 2 Core + Any 2 Useful.',
        'This supersedes the earlier app-port fixture that required only Any 1 Useful.',
      ],
    },
    targetRules: [
      { stat: 'CRIT DMG', role: 'CORE', minimumRoll: 0.21 },
      { stat: 'CRIT Rate', role: 'CORE', minimumRoll: 0.093 },
      { stat: 'ATK%', role: 'USEFUL', minimumRoll: 0.064 },
      { stat: 'Energy Regen', role: 'USEFUL', minimumRoll: 0.068 },
      { stat: 'Heavy Attack DMG', role: 'USEFUL', minimumRoll: 0.064 },
    ],
    requiredCoreHits: 2,
    requiredUsefulHits: 2,
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
