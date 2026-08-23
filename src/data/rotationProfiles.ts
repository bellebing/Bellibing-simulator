import type { RotationProfile } from '../profileDomain.ts';

export const ROTATION_PROFILES: readonly RotationProfile[] = [
  {
    kind: 'ROTATION',
    id: 'augusta-standard-iuno-shorekeeper',
    name: 'Augusta — Standard Iuno + Shorekeeper Rotation',
    characterId: 'augusta',
    teamProfileId: 'augusta-iuno-shorekeeper',
    engineModelId: 'AUGUSTA_STD_V1',
    rotationSeconds: 11.17,
    variantKey: 'standard',
    verificationStatus: 'VERIFIED',
    provenance: {
      sourceLabels: ['V9.15 DPS Contexts', 'Prydwen Augusta Core Rotation', 'Augusta app parity fixtures'],
      sourceUrls: [
        'https://docs.google.com/spreadsheets/d/1E_6YNe3OED6kihXWK6IQ8D-DcwdkuuAXvlG3ZtgkbP0/edit',
        'https://www.prydwen.gg/wuthering-waves/characters/augusta',
      ],
      checkedAt: '2026-08-23',
      notes: [
        'Personal Augusta damage only; teammate damage is excluded in the existing golden engine context.',
        'The engineModelId points at the separately implemented combat model rather than duplicating rotation math here.',
      ],
    },
  },
];
