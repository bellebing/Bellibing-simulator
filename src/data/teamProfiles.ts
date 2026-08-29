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
      { characterId: 'the-shorekeeper', role: 'SUPPORT' },
    ],
  },
  {
    kind: 'TEAM',
    id: 'cartethyia-ciaccona-rover-aero',
    name: 'Cartethyia / Ciaccona / Rover (Aero)',
    verificationStatus: 'VERIFIED',
    provenance: {
      sourceLabels: ['Prydwen Cartethyia build', 'Prydwen Ciaccona build'],
      sourceUrls: [
        'https://www.prydwen.gg/wuthering-waves/characters/cartethyia',
        'https://www.prydwen.gg/wuthering-waves/characters/ciaccona',
      ],
      checkedAt: '2026-08-29',
      notes: [
        'Ciaccona is the current best Sub DPS partner for Cartethyia in the reviewed source.',
        'Rover (Aero) is one of the current recommended third-slot supports and appears explicitly in both characters\' calculation contexts.',
        'Chisa can outperform Rover (Aero) only with Chisa Signature in the reviewed source, so this default context avoids a hidden support-signature dependency.',
      ],
    },
    members: [
      { characterId: 'cartethyia', role: 'DPS' },
      { characterId: 'ciaccona', role: 'SUB_DPS' },
      { characterId: 'rover-aero', role: 'SUPPORT' },
    ],
  },
];
