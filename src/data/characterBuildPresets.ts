import type { CharacterBuildPreset } from '../profileDomain.ts';

export const CHARACTER_BUILD_PRESETS: readonly CharacterBuildPreset[] = [
  {
    kind: 'CHARACTER_PRESET',
    id: 'augusta-standard',
    name: 'Augusta — Standard',
    characterId: 'augusta',
    modeKey: 'standard',
    displayLabel: 'Standard',
    sequence: 0,
    isDefault: true,
    uiSelectable: true,
    weaponRecommendationProfileId: 'augusta-standard-weapons',
    echoLoadoutProfileId: 'augusta-standard-echoes',
    statTargetProfileId: 'augusta-recommended-targets-v915-current',
    teamProfileId: 'augusta-iuno-shorekeeper',
    rotationProfileId: 'augusta-standard-iuno-shorekeeper',
    verificationStatus: 'VERIFIED',
    provenance: {
      sourceLabels: ['Bellibing composition layer', 'V9.15 current Augusta references'],
      sourceUrls: [
        'https://docs.google.com/spreadsheets/d/1E_6YNe3OED6kihXWK6IQ8D-DcwdkuuAXvlG3ZtgkbP0/edit',
      ],
      checkedAt: '2026-08-23',
      notes: [
        'Contains pointers only. Character/weapon/Echo/team/rotation numbers remain owned by their independent bases.',
      ],
    },
  },
];
