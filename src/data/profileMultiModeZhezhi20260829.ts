import type {
  CharacterBuildPreset,
  EchoLoadoutProfile,
  RotationProfile,
  StatTargetProfile,
  TeamProfile,
  WeaponRecommendationProfile,
} from '../profileDomain.ts';

const CHECKED_AT = '2026-08-29';
const PRYDWEN_URL = 'https://www.prydwen.gg/wuthering-waves/characters/zhezhi';

const ZHEZHI_SOURCE = {
  sourceLabels: ['Prydwen Zhezhi current build/profile'],
  sourceUrls: [PRYDWEN_URL],
  checkedAt: CHECKED_AT,
  notes: [
    'Prydwen explicitly treats Zhezhi as Hybrid and gives one standard action sequence with set-specific Echo timing.',
    'Empyrean Anthem is better than Moonlit Clouds if and only if the build has endgame Echo investment with 9 or 10 CRIT substats total and a 5-star weapon equipped; otherwise Moonlit Clouds is better.',
    'Rime-Draped Sprouts R1 is the reviewed 5-star default weapon and the calculation context is Carlotta + The Shorekeeper.',
    'The reviewed Energy Regen range is 116%-128% in the Carlotta + Shorekeeper context: 116% for Moonlit Clouds and 128% for Empyrean Anthem.',
    'The two presets below preserve that source condition instead of averaging the sets or pretending one universal build is optimal for every investment level.',
  ],
} as const;

const critSlot = {
  cost: 4 as const,
  primaryMainStats: [
    { stat: 'CRIT Rate', priority: 1 },
    { stat: 'CRIT DMG', priority: 1 },
  ],
};
const glacioSlot = { cost: 3 as const, primaryMainStats: [{ stat: 'Glacio DMG', priority: 1 }] };
const glacioAtkSlot = {
  cost: 3 as const,
  primaryMainStats: [
    { stat: 'Glacio DMG', priority: 1 },
    { stat: 'ATK%', priority: 2 },
  ],
};
const atkSlot = { cost: 1 as const, primaryMainStats: [{ stat: 'ATK%', priority: 1 }] };

export const PROFILE_MULTIMODE_ZHEZHI_WEAPONS: readonly WeaponRecommendationProfile[] = [
  {
    kind: 'WEAPON_RECOMMENDATION',
    id: 'zhezhi-carlotta-weapons',
    name: 'Zhezhi — Carlotta Hybrid Weapons',
    characterId: 'zhezhi',
    defaultWeaponId: 'rime-draped-sprouts',
    options: [
      {
        weaponId: 'rime-draped-sprouts',
        rank: 1,
        label: 'Signature / current calculation reference',
        relativePerformance: 1,
      },
    ],
    verificationStatus: 'VERIFIED',
    provenance: ZHEZHI_SOURCE,
  },
];

export const PROFILE_MULTIMODE_ZHEZHI_ECHOES: readonly EchoLoadoutProfile[] = [
  {
    kind: 'ECHO_LOADOUT',
    id: 'zhezhi-empyrean-endgame-echoes',
    name: 'Zhezhi — Endgame Empyrean Anthem / Nightmare: Lampylumen Myriad',
    characterId: 'zhezhi',
    slots: [critSlot, glacioSlot, glacioAtkSlot, atkSlot, atkSlot],
    sonataSetIds: ['sonata-13'],
    mainEchoId: 'echo-60001055',
    verificationStatus: 'VERIFIED',
    provenance: {
      ...ZHEZHI_SOURCE,
      notes: [
        ...ZHEZHI_SOURCE.notes,
        'This Echo shell is conditional on the source-explicit endgame threshold: 9 or 10 CRIT substats total plus a 5-star weapon.',
      ],
    },
  },
  {
    kind: 'ECHO_LOADOUT',
    id: 'zhezhi-moonlit-fallback-echoes',
    name: 'Zhezhi — Moonlit Clouds / Impermanence Heron Fallback',
    characterId: 'zhezhi',
    slots: [critSlot, glacioSlot, glacioAtkSlot, atkSlot, atkSlot],
    sonataSetIds: ['sonata-8'],
    mainEchoId: 'echo-60000525',
    verificationStatus: 'VERIFIED',
    provenance: {
      ...ZHEZHI_SOURCE,
      notes: [
        ...ZHEZHI_SOURCE.notes,
        'Moonlit Clouds is the source-preferred fallback when either the 9-10 CRIT-substat endgame threshold or the 5-star-weapon condition is not met.',
      ],
    },
  },
];

function statProfile(id: string, name: string, er: number, notes: string): StatTargetProfile {
  return {
    kind: 'STAT_TARGET',
    id,
    name,
    characterId: 'zhezhi',
    targetRules: [
      { stat: 'Energy Regen', priority: 1 },
      { stat: 'CRIT Rate', priority: 2 },
      { stat: 'CRIT DMG', priority: 2 },
      { stat: 'ATK%', priority: 3 },
      { stat: 'Basic Attack DMG', priority: 4 },
      { stat: 'Flat ATK', priority: 5 },
    ],
    gates: [
      {
        stat: 'Energy Regen Total',
        minimum: er,
        preferred: er,
        notes,
      },
    ],
    verificationStatus: 'VERIFIED',
    provenance: ZHEZHI_SOURCE,
  };
}

export const PROFILE_MULTIMODE_ZHEZHI_STATS: readonly StatTargetProfile[] = [
  statProfile(
    'zhezhi-empyrean-endgame-stats',
    'Zhezhi — Endgame Empyrean Stats',
    1.28,
    'Prydwen high estimate is 128% Energy Regen for Empyrean Anthem in the Carlotta + Shorekeeper context.',
  ),
  statProfile(
    'zhezhi-moonlit-fallback-stats',
    'Zhezhi — Moonlit Fallback Stats',
    1.16,
    'Prydwen low estimate is 116% Energy Regen for Moonlit Clouds in the Carlotta + Shorekeeper context.',
  ),
];

export const PROFILE_MULTIMODE_ZHEZHI_TEAMS: readonly TeamProfile[] = [
  {
    kind: 'TEAM',
    id: 'carlotta-zhezhi-shorekeeper',
    name: 'Carlotta / Zhezhi / Shorekeeper',
    members: [
      { characterId: 'carlotta', role: 'DPS' },
      { characterId: 'zhezhi', role: 'SUB_DPS' },
      { characterId: 'the-shorekeeper', role: 'SUPPORT' },
    ],
    verificationStatus: 'VERIFIED',
    provenance: ZHEZHI_SOURCE,
  },
];

const COMMON_SEQUENCE = [
  'Intro',
  'Basic 1',
  'Basic 2',
  'Basic 3',
  'Skill',
  'Heavy: Conjuration',
  'Skill: Stroke of Genius (Jump Cancel)',
  'Skill: Stroke of Genius (Cancel animation endlag via Ultimate)',
  'Ultimate',
] as const;

export const PROFILE_MULTIMODE_ZHEZHI_ROTATIONS: readonly RotationProfile[] = [
  {
    kind: 'ROTATION',
    id: 'zhezhi-empyrean-carlotta-standard',
    name: 'Zhezhi — Empyrean / Carlotta Standard Rotation',
    characterId: 'zhezhi',
    teamProfileId: 'carlotta-zhezhi-shorekeeper',
    executionStatus: 'SOURCE_SEQUENCE_ONLY',
    sourceSequence: [
      ...COMMON_SEQUENCE,
      'Echo: Nightmare: Lampylumen Myriad (flexible timing; source allows any point in the rotation)',
      "Skill: Creation's Zenith (Swap)",
      'Outro to Carlotta',
    ],
    variantKey: 'empyrean-endgame-carlotta',
    modeledMechanicFactIds: [],
    assumedMechanicFactIds: [],
    verificationStatus: 'VERIFIED',
    provenance: ZHEZHI_SOURCE,
  },
  {
    kind: 'ROTATION',
    id: 'zhezhi-moonlit-carlotta-standard',
    name: 'Zhezhi — Moonlit / Carlotta Standard Rotation',
    characterId: 'zhezhi',
    teamProfileId: 'carlotta-zhezhi-shorekeeper',
    executionStatus: 'SOURCE_SEQUENCE_ONLY',
    sourceSequence: [
      ...COMMON_SEQUENCE,
      "Skill: Creation's Zenith (Dash cancel into Echo)",
      'Echo: Impermanence Heron (immediate switch cancel)',
      'Outro to Carlotta',
    ],
    variantKey: 'moonlit-fallback-carlotta',
    modeledMechanicFactIds: [],
    assumedMechanicFactIds: [],
    verificationStatus: 'VERIFIED',
    provenance: ZHEZHI_SOURCE,
  },
];

export const PROFILE_MULTIMODE_ZHEZHI_PRESETS: readonly CharacterBuildPreset[] = [
  {
    kind: 'CHARACTER_PRESET',
    id: 'zhezhi-empyrean-endgame',
    name: 'Zhezhi — Endgame Empyrean / Carlotta',
    characterId: 'zhezhi',
    modeKey: 'empyrean-endgame',
    displayLabel: 'Endgame 5★ — Empyrean',
    sequence: 0,
    isDefault: true,
    uiSelectable: true,
    weaponRecommendationProfileId: 'zhezhi-carlotta-weapons',
    echoLoadoutProfileId: 'zhezhi-empyrean-endgame-echoes',
    statTargetProfileId: 'zhezhi-empyrean-endgame-stats',
    teamProfileId: 'carlotta-zhezhi-shorekeeper',
    rotationProfileId: 'zhezhi-empyrean-carlotta-standard',
    verificationStatus: 'VERIFIED',
    provenance: {
      ...ZHEZHI_SOURCE,
      notes: [
        ...ZHEZHI_SOURCE.notes,
        'This is the canonical default only for Bellibing\'s explicit endgame 5-star-weapon context: Rime-Draped Sprouts R1 plus the source-defined 9-10 CRIT-substat investment threshold. It is not a claim that Empyrean is universally better at lower investment.',
      ],
    },
  },
  {
    kind: 'CHARACTER_PRESET',
    id: 'zhezhi-moonlit-fallback',
    name: 'Zhezhi — Moonlit Fallback / Carlotta',
    characterId: 'zhezhi',
    modeKey: 'moonlit-fallback',
    displayLabel: 'Fallback — Moonlit',
    sequence: 0,
    isDefault: false,
    uiSelectable: true,
    weaponRecommendationProfileId: 'zhezhi-carlotta-weapons',
    echoLoadoutProfileId: 'zhezhi-moonlit-fallback-echoes',
    statTargetProfileId: 'zhezhi-moonlit-fallback-stats',
    teamProfileId: 'carlotta-zhezhi-shorekeeper',
    rotationProfileId: 'zhezhi-moonlit-carlotta-standard',
    verificationStatus: 'VERIFIED',
    provenance: ZHEZHI_SOURCE,
  },
];
