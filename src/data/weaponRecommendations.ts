import type { WeaponRecommendationProfile } from '../profileDomain.ts';

const AUGUSTA_SOURCES = {
  sourceLabels: ['V9.15 Character Weapons', 'Prydwen Augusta build'],
  sourceUrls: [
    'https://docs.google.com/spreadsheets/d/1E_6YNe3OED6kihXWK6IQ8D-DcwdkuuAXvlG3ZtgkbP0/edit',
    'https://www.prydwen.gg/wuthering-waves/characters/augusta',
  ],
  checkedAt: '2026-08-23',
} as const;

const CARTETHYIA_SOURCES = {
  sourceLabels: ['Prydwen Cartethyia build'],
  sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/cartethyia'],
  checkedAt: '2026-08-29',
  notes: [
    "Current Prydwen Cartethyia calculations use Ciaccona + Woodland Aria + Gusts of Welkin + Nightmare: Kelpie and Rover (Aero) + Bloodpact's Pledge + Windward Pilgrimage + Reminiscence: Fleurdelys.",
    "Defier's Thorn R1 is the current 100% reference weapon in that context.",
  ],
} as const;

const CIACCONA_SOURCES = {
  sourceLabels: ['Prydwen Ciaccona build'],
  sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/ciaccona'],
  checkedAt: '2026-08-29',
  notes: [
    "Current Prydwen Ciaccona calculations use Cartethyia + Defier's Thorn + Windward Pilgrimage + Reminiscence: Fleurdelys and Rover (Aero) + Bloodpact's Pledge + Windward Pilgrimage + Reminiscence: Fleurdelys.",
    'Woodland Aria R1 is the current 100% reference weapon and also provides team-facing Aero RES shred in Aero teams.',
  ],
} as const;

const ROVER_AERO_SOURCES = {
  sourceLabels: ['Prydwen Rover (Aero) build'],
  sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/rover-aero'],
  checkedAt: '2026-08-29',
  notes: [
    "The reviewed Rover (Aero) context is Cartethyia + Ciaccona, where Bloodpact's Pledge is the source-recommended signature/reference weapon.",
    'The weapon supplies a large Energy Regen secondary and a Rover-specific team Aero amplification trigger after Unbound Flow; trigger execution remains separate from recommendation truth.',
  ],
} as const;

const IUNO_SOURCES = {
  sourceLabels: ['Prydwen Iuno build'],
  sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/iuno'],
  checkedAt: '2026-08-29',
  notes: [
    "The reviewed mode is Iuno Hybrid/Sub DPS with Augusta, not Iuno Main DPS. Moongazer's Sigil R1 is the current 100% weapon reference for both Hybrid and DPS source calculations.",
  ],
} as const;

const SHOREKEEPER_SOURCES = {
  sourceLabels: ['Prydwen The Shorekeeper build'],
  sourceUrls: ['https://www.prydwen.gg/wuthering-waves/characters/the-shorekeeper'],
  checkedAt: '2026-08-29',
  notes: [
    'Stellar Symphony R1 is the current best-source weapon for Shorekeeper; the page rates it above Variation R5 and documents its team ATK plus Concerto utility.',
    'Only the source-best default is promoted here; no Bellibing roll/stopping weight is inferred from weapon ranking.',
  ],
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
  {
    kind: 'WEAPON_RECOMMENDATION',
    id: 'cartethyia-aero-erosion-weapons',
    name: 'Cartethyia — Aero Erosion Weapons',
    characterId: 'cartethyia',
    defaultWeaponId: 'defiers-thorn',
    verificationStatus: 'VERIFIED',
    provenance: CARTETHYIA_SOURCES,
    options: [
      { weaponId: 'defiers-thorn', rank: 1, label: 'Signature / current reference', relativePerformance: 1 },
    ],
  },
  {
    kind: 'WEAPON_RECOMMENDATION',
    id: 'ciaccona-cartethyia-aero-weapons',
    name: 'Ciaccona — Cartethyia Aero Weapons',
    characterId: 'ciaccona',
    defaultWeaponId: 'woodland-aria',
    verificationStatus: 'VERIFIED',
    provenance: CIACCONA_SOURCES,
    options: [
      { weaponId: 'woodland-aria', rank: 1, label: 'Signature / current reference', relativePerformance: 1 },
    ],
  },
  {
    kind: 'WEAPON_RECOMMENDATION',
    id: 'rover-aero-cartethyia-ciaccona-weapons',
    name: 'Rover (Aero) — Cartethyia + Ciaccona Support Weapons',
    characterId: 'rover-aero',
    defaultWeaponId: 'bloodpacts-pledge',
    verificationStatus: 'VERIFIED',
    provenance: ROVER_AERO_SOURCES,
    options: [
      { weaponId: 'bloodpacts-pledge', rank: 1, label: 'Signature / reviewed support reference', relativePerformance: 1 },
    ],
  },
  {
    kind: 'WEAPON_RECOMMENDATION',
    id: 'iuno-augusta-hybrid-weapons',
    name: 'Iuno — Augusta Hybrid Weapons',
    characterId: 'iuno',
    defaultWeaponId: 'moongazers-sigil',
    verificationStatus: 'VERIFIED',
    provenance: IUNO_SOURCES,
    options: [
      { weaponId: 'moongazers-sigil', rank: 1, label: 'Signature / current reference', relativePerformance: 1 },
    ],
  },
  {
    kind: 'WEAPON_RECOMMENDATION',
    id: 'shorekeeper-augusta-iuno-weapons',
    name: 'The Shorekeeper — Augusta + Iuno Support Weapons',
    characterId: 'the-shorekeeper',
    defaultWeaponId: 'stellar-symphony',
    verificationStatus: 'VERIFIED',
    provenance: SHOREKEEPER_SOURCES,
    options: [
      { weaponId: 'stellar-symphony', rank: 1, label: 'Signature / current best source option', relativePerformance: 1 },
    ],
  },
];
