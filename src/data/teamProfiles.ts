import type { TeamProfile } from '../profileDomain.ts';

export const TEAM_PROFILES: readonly TeamProfile[] = [
  {
    kind: 'TEAM',
    id: 'augusta-iuno-shorekeeper',
    name: 'Augusta / Iuno / Shorekeeper',
    verificationStatus: 'VERIFIED',
    provenance: {
      sourceLabels: ['V9.15 DPS Contexts', 'Prydwen Augusta build'],
      sourceUrls: [
        'https://docs.google.com/spreadsheets/d/1E_6YNe3OED6kihXWK6IQ8D-DcwdkuuAXvlG3ZtgkbP0/edit',
        'https://www.prydwen.gg/wuthering-waves/characters/augusta',
      ],
      checkedAt: '2026-08-23',
    },
    members: [
      { characterId: 'augusta', role: 'DPS' },
      { characterId: 'iuno', role: 'SUB_DPS' },
      { characterId: 'shorekeeper', role: 'SUPPORT' },
    ],
  },
];
