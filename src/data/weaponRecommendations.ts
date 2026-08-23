import type { WeaponRecommendationProfile } from '../profileDomain.ts';

const AUGUSTA_SOURCES = {
  sourceLabels: ['V9.15 Character Weapons', 'Prydwen Augusta build'],
  sourceUrls: [
    'https://docs.google.com/spreadsheets/d/1E_6YNe3OED6kihXWK6IQ8D-DcwdkuuAXvlG3ZtgkbP0/edit',
    'https://www.prydwen.gg/wuthering-waves/characters/augusta',
  ],
  checkedAt: '2026-08-23',
} as const;

export const WEAPON_RECOMMENDATION_PROFILES: readonly WeaponRecommendationProfile[] = [
  {
    kind: 'WEAPON_RECOMMENDATION',
    id: 'augusta-standard-weapons',
    name: 'Augusta — Standard Weapons',
    characterId: 'augusta',
    defaultWeaponId: 'thunderflare-dominion',
    verificationStatus: 'VERIFIED',
    provenance: AUGUSTA_SOURCES,
    options: [
      { weaponId: 'thunderflare-dominion', rank: 1, label: 'Signature / Best in Slot', relativePerformance: 1 },
      { weaponId: 'verdant-summit', rank: 1, label: 'Best limited alternative', relativePerformance: 0.903 },
      { weaponId: 'ages-of-harvest', rank: 1, label: 'Strong limited alternative', relativePerformance: 0.804 },
      { weaponId: 'wildfire-mark', rank: 1, label: 'Limited alternative', relativePerformance: 0.773 },
      { weaponId: 'radiance-cleaver', rank: 1, label: 'Permanent 5-star alternative', relativePerformance: 0.773 },
      { weaponId: 'kumokiri', rank: 1, label: 'Limited alternative', relativePerformance: 0.772 },
      { weaponId: 'lustrous-razor', rank: 1, label: 'Standard 5-star alternative', relativePerformance: 0.743 },
      { weaponId: 'aureate-zenith', rank: 5, label: 'Best 4-star option', relativePerformance: 0.732 },
      { weaponId: 'autumntrace', rank: 5, label: 'Battle Pass alternative', relativePerformance: 0.71 },
      { weaponId: 'waning-redshift', rank: 5, label: 'Best non-BP 4-star', relativePerformance: 0.665 },
      { weaponId: 'helios-cleaver', rank: 5, label: '4-star alternative', relativePerformance: 0.639 },
      { weaponId: 'meditations-on-mercy', rank: 5, label: 'Craftable fallback', relativePerformance: 0.607 },
    ],
  },
];
