import type {
  CharacterBuildPreset,
  EchoLoadoutProfile,
  RotationProfile,
  StatTargetProfile,
  TeamProfile,
  WeaponRecommendationProfile,
} from '../profileDomain.ts';

const CHECKED_AT = '2026-08-29';
const PRYDWEN_URL = 'https://www.prydwen.gg/wuthering-waves/characters/aalto';
const GAME8_URL = 'https://game8.co/games/Wuthering-Waves/archives/454214';

const AALTO_HYBRID_SOURCE = {
  sourceLabels: [
    'Prydwen Aalto current build/profile',
    'Game8 Aalto Jiyan team',
  ],
  sourceUrls: [PRYDWEN_URL, GAME8_URL],
  checkedAt: CHECKED_AT,
  notes: [
    'Prydwen explicitly supports both Main DPS and Hybrid Aalto, but its current ratings and fixed endgame rotation are Hybrid-oriented.',
    'Prydwen identifies Static Mist as the best Hybrid weapon and Moonlit Clouds / Impermanence Heron as the supportive Echo path.',
    'Prydwen gives 145%-160% Energy Regen for Hybrid/support contexts and explicitly ties the upper estimate to Jiyan + Shorekeeper; this profile therefore uses 160% for that exact team context.',
    'Game8 independently exposes the Jiyan / Aalto / Shorekeeper team flow and has Aalto charge Concerto before switching to Jiyan for the Aero buff.',
    'The separate Main DPS Aalto mode remains real source truth but is intentionally not promoted here because the reviewed current sources do not provide a fixed Aalto DPS action sequence suitable for Bellibing canonical rotation transcription.',
  ],
} as const;

export const PROFILE_MULTIMODE_AALTO_WEAPONS: readonly WeaponRecommendationProfile[] = [
  {
    kind: 'WEAPON_RECOMMENDATION',
    id: 'aalto-hybrid-jiyan-weapons',
    name: 'Aalto — Hybrid / Jiyan Weapons',
    characterId: 'aalto',
    defaultWeaponId: 'static-mist',
    options: [
      {
        weaponId: 'static-mist',
        rank: 1,
        label: 'Prydwen Best weapon for Hybrid Aalto',
        relativePerformance: 1,
      },
    ],
    verificationStatus: 'VERIFIED',
    provenance: AALTO_HYBRID_SOURCE,
  },
];

export const PROFILE_MULTIMODE_AALTO_ECHOES: readonly EchoLoadoutProfile[] = [
  {
    kind: 'ECHO_LOADOUT',
    id: 'aalto-hybrid-moonlit-heron',
    name: 'Aalto — Hybrid / Moonlit Clouds / Impermanence Heron',
    characterId: 'aalto',
    slots: [
      {
        cost: 4,
        primaryMainStats: [
          { stat: 'CRIT Rate', priority: 1 },
          { stat: 'CRIT DMG', priority: 1 },
        ],
      },
      { cost: 3, primaryMainStats: [{ stat: 'Aero DMG', priority: 1 }] },
      {
        cost: 3,
        primaryMainStats: [
          { stat: 'Aero DMG', priority: 1 },
          { stat: 'Energy Regen', priority: 2 },
        ],
      },
      { cost: 1, primaryMainStats: [{ stat: 'ATK%', priority: 1 }] },
      { cost: 1, primaryMainStats: [{ stat: 'ATK%', priority: 1 }] },
    ],
    sonataSetIds: ['sonata-8'],
    mainEchoId: 'echo-60000525',
    verificationStatus: 'VERIFIED',
    provenance: AALTO_HYBRID_SOURCE,
  },
];

export const PROFILE_MULTIMODE_AALTO_STATS: readonly StatTargetProfile[] = [
  {
    kind: 'STAT_TARGET',
    id: 'aalto-hybrid-jiyan-build-stats',
    name: 'Aalto — Hybrid / Jiyan Build Stats',
    characterId: 'aalto',
    targetRules: [
      { stat: 'Energy Regen', priority: 1 },
      { stat: 'CRIT Rate', priority: 2 },
      { stat: 'CRIT DMG', priority: 2 },
      { stat: 'ATK%', priority: 3 },
      { stat: 'Flat ATK', priority: 4 },
      { stat: 'Basic Attack DMG', priority: 4 },
      { stat: 'Skill DMG', priority: 5 },
    ],
    gates: [
      {
        stat: 'Energy Regen Total',
        minimum: 1.6,
        preferred: 1.6,
        notes: 'Prydwen upper Hybrid estimate is explicitly based on Jiyan + Shorekeeper. The lower 145% estimate belongs to Iuno + Shorekeeper and is not silently reused for this exact team.',
      },
    ],
    verificationStatus: 'VERIFIED',
    provenance: AALTO_HYBRID_SOURCE,
  },
];

export const PROFILE_MULTIMODE_AALTO_TEAMS: readonly TeamProfile[] = [
  {
    kind: 'TEAM',
    id: 'jiyan-aalto-shorekeeper',
    name: 'Jiyan / Aalto / Shorekeeper',
    members: [
      { characterId: 'jiyan', role: 'DPS' },
      { characterId: 'aalto', role: 'SUB_DPS' },
      { characterId: 'the-shorekeeper', role: 'SUPPORT' },
    ],
    verificationStatus: 'VERIFIED',
    provenance: AALTO_HYBRID_SOURCE,
  },
];

export const PROFILE_MULTIMODE_AALTO_ROTATIONS: readonly RotationProfile[] = [
  {
    kind: 'ROTATION',
    id: 'aalto-hybrid-jiyan-shorekeeper',
    name: 'Aalto — Hybrid Jiyan + Shorekeeper Rotation',
    characterId: 'aalto',
    teamProfileId: 'jiyan-aalto-shorekeeper',
    executionStatus: 'SOURCE_SEQUENCE_ONLY',
    sourceSequence: [
      "Skill: Mist Avatar (during another character's rotation to allow for cooldown)",
      'Intro',
      'Ultimate',
      'Skill: Mist Avatar (after Basics if still on cooldown)',
      'Basic P1',
      'Basic P2',
      'Basic P3',
      'Basic P4',
      'Basic P5',
      'Echo: Impermanence Heron',
      'Outro to Jiyan',
    ],
    variantKey: 'hybrid-jiyan-shorekeeper',
    modeledMechanicFactIds: [],
    assumedMechanicFactIds: [],
    verificationStatus: 'VERIFIED',
    provenance: AALTO_HYBRID_SOURCE,
  },
];

export const PROFILE_MULTIMODE_AALTO_PRESETS: readonly CharacterBuildPreset[] = [
  {
    kind: 'CHARACTER_PRESET',
    id: 'aalto-hybrid-jiyan',
    name: 'Aalto — Hybrid / Jiyan',
    characterId: 'aalto',
    modeKey: 'hybrid-jiyan',
    displayLabel: 'Hybrid — Jiyan',
    sequence: 6,
    isDefault: true,
    uiSelectable: true,
    weaponRecommendationProfileId: 'aalto-hybrid-jiyan-weapons',
    echoLoadoutProfileId: 'aalto-hybrid-moonlit-heron',
    statTargetProfileId: 'aalto-hybrid-jiyan-build-stats',
    teamProfileId: 'jiyan-aalto-shorekeeper',
    rotationProfileId: 'aalto-hybrid-jiyan-shorekeeper',
    verificationStatus: 'VERIFIED',
    provenance: {
      ...AALTO_HYBRID_SOURCE,
      notes: [
        ...AALTO_HYBRID_SOURCE.notes,
        'Sequence 6 matches Prydwen current endgame-stat convention for 4-star Characters. The source rotation is still valid at lower Sequences but this preset does not claim S0 endgame ER equivalence.',
        'Hybrid is the canonical UI default because the current Prydwen rating/profile and fixed endgame rotation are Hybrid-oriented. Main DPS remains a separate unpromoted mode until a fixed source sequence is reviewed.',
      ],
    },
  },
];
