import type {
  CharacterBuildPreset,
  EchoLoadoutProfile,
  RotationProfile,
  StatTargetProfile,
  WeaponRecommendationProfile,
} from '../profileDomain.ts';

const CHECKED_AT = '2026-08-29';
const PRYDWEN_URL = 'https://www.prydwen.gg/wuthering-waves/characters/denia';

const DENIA_SOURCE = {
  sourceLabels: ['Prydwen Denia current build/profile'],
  sourceUrls: [PRYDWEN_URL],
  checkedAt: CHECKED_AT,
  notes: [
    'Denia is a 5-star Hybrid whose Resonance Mode is configured before combat and explicitly changes her Fusion Burst versus Tune Strain team-facing kit.',
    'The reviewed source calls Aemeath the best and only DPS choice for Fusion Burst Denia and the main reason to get/use Denia; Tune Strain Denia is the Luuk Herssen path when Aemeath already has a strong team but Luuk needs the premium upgrade.',
    'Forged Dwarf Star R1 is the 100% current reference weapon in both source calculation columns.',
    'The source standard rotation covers both Resonance Modes; Echo timing differs by mode.',
    'The published 108%-122% Energy Regen range is explicitly estimated from Aemeath + Lupa and Aemeath + Shorekeeper. It is therefore not promoted as a numeric gate for the exact Aemeath + Chisa or Luuk + Mornye presets below.',
    'Current source endgame recommendations use S0 for 5-star characters unless otherwise specified.',
  ],
} as const;

const critSlot = {
  cost: 4 as const,
  primaryMainStats: [
    { stat: 'CRIT Rate', priority: 1 },
    { stat: 'CRIT DMG', priority: 1 },
  ],
};
const fusionSlot = { cost: 3 as const, primaryMainStats: [{ stat: 'Fusion DMG', priority: 1 }] };
const fusionAtkSlot = {
  cost: 3 as const,
  primaryMainStats: [
    { stat: 'Fusion DMG', priority: 1 },
    { stat: 'ATK%', priority: 2 },
  ],
};
const atkSlot = { cost: 1 as const, primaryMainStats: [{ stat: 'ATK%', priority: 1 }] };

export const PROFILE_MULTIMODE_DENIA_WEAPONS: readonly WeaponRecommendationProfile[] = [
  {
    kind: 'WEAPON_RECOMMENDATION',
    id: 'denia-multimode-weapons',
    name: 'Denia — Multi-mode Weapons',
    characterId: 'denia',
    defaultWeaponId: 'forged-dwarf-star',
    options: [
      {
        weaponId: 'forged-dwarf-star',
        rank: 1,
        label: 'Signature / current reference in both Resonance Modes',
        relativePerformance: 1,
      },
    ],
    verificationStatus: 'VERIFIED',
    provenance: DENIA_SOURCE,
  },
];

export const PROFILE_MULTIMODE_DENIA_ECHOES: readonly EchoLoadoutProfile[] = [
  {
    kind: 'ECHO_LOADOUT',
    id: 'denia-fusion-burst-echoes',
    name: 'Denia — Fusion Burst / Chromatic Foam / Reminiscence: Denia',
    characterId: 'denia',
    slots: [critSlot, fusionSlot, fusionAtkSlot, atkSlot, atkSlot],
    sonataSetIds: ['sonata-28'],
    mainEchoId: 'echo-60002005',
    verificationStatus: 'VERIFIED',
    provenance: {
      ...DENIA_SOURCE,
      notes: [
        ...DENIA_SOURCE.notes,
        'Chromatic Foam is the reviewed generalist Fusion Burst option; Reminiscence: Denia is the reviewed main Echo for its incoming Fusion transfer.',
      ],
    },
  },
  {
    kind: 'ECHO_LOADOUT',
    id: 'denia-tune-strain-echoes',
    name: 'Denia — Tune Strain / Reel of Spliced Memories / Voidwing Moth',
    characterId: 'denia',
    slots: [critSlot, fusionSlot, fusionAtkSlot, atkSlot, atkSlot],
    sonataSetIds: ['sonata-31'],
    mainEchoId: 'echo-60001985',
    verificationStatus: 'VERIFIED',
    provenance: {
      ...DENIA_SOURCE,
      notes: [
        ...DENIA_SOURCE.notes,
        'Reel of Spliced Memories is the reviewed best Tune Strain set; Voidwing Moth is the reviewed main Echo and is cast at the end of Denia\'s rotation before Outro.',
      ],
    },
  },
];

function statTarget(
  id: string,
  name: string,
  modeNote: string,
): StatTargetProfile {
  return {
    kind: 'STAT_TARGET',
    id,
    name,
    characterId: 'denia',
    targetRules: [
      {
        stat: 'Energy Regen',
        priority: 1,
        notes: 'Source priority is Energy Regen until satisfied. No numeric total-ER gate is promoted for this exact selected team context.',
      },
      { stat: 'CRIT Rate', priority: 2 },
      { stat: 'CRIT DMG', priority: 2 },
      {
        stat: 'Liberation DMG',
        priority: 3,
        notes: modeNote,
      },
      {
        stat: 'ATK%',
        priority: 3,
        notes: modeNote,
      },
      { stat: 'Flat ATK', priority: 4 },
    ],
    gates: [],
    verificationStatus: 'VERIFIED',
    provenance: DENIA_SOURCE,
  };
}

export const PROFILE_MULTIMODE_DENIA_STATS: readonly StatTargetProfile[] = [
  statTarget(
    'denia-fusion-burst-stats',
    'Denia — Fusion Burst Build Stats',
    'The source writes Liberation DMG% ≥ ATK% overall, then notes ATK% is equal/slightly stronger outside Tune Strain. Equal priority preserves the non-strict/contextual relationship instead of inventing a universal strict ordering.',
  ),
  statTarget(
    'denia-tune-strain-stats',
    'Denia — Tune Strain Build Stats',
    'The source notes Liberation DMG can provide higher benefit in Tune Strain due to higher Liberation-DMG reliance, but does not establish a strict universal inequality. Equal priority preserves that uncertainty; the note retains the mode-specific edge.',
  ),
];

const STANDARD_CORE_SEQUENCE = [
  'Intro',
  'Basic: Stagecraft 4 (cancel animation endlag via Skill)',
  'Skill: Phantom Bubble (cancel animation instantly via Ultimate)',
  'Ultimate: Stagecraft',
  'Basic: Breakdown 1',
  'Basic: Breakdown 2 (cancel animation endlag via Jump)',
  'Jump',
  'Basic: Breakdown Midair 1',
  'Basic: Breakdown Midair 2 (cancel animation endlag via Skill)',
  'Skill: Banish 1',
  'Skill: Banish 2 (cancel animation instantly via Ultimate)',
  'Ultimate: Breakdown',
] as const;

export const PROFILE_MULTIMODE_DENIA_ROTATIONS: readonly RotationProfile[] = [
  {
    kind: 'ROTATION',
    id: 'denia-fusion-burst-aemeath-standard',
    name: 'Denia — Fusion Burst / Aemeath Standard Rotation',
    characterId: 'denia',
    teamProfileId: 'aemeath-denia-chisa',
    executionStatus: 'SOURCE_SEQUENCE_ONLY',
    sourceSequence: [
      'Echo: Reminiscence: Denia (source timing is flexible — any point in the rotation)',
      ...STANDARD_CORE_SEQUENCE,
      'Outro to Aemeath',
    ],
    variantKey: 'fusion-burst-aemeath',
    modeledMechanicFactIds: [],
    assumedMechanicFactIds: [],
    verificationStatus: 'VERIFIED',
    provenance: DENIA_SOURCE,
  },
  {
    kind: 'ROTATION',
    id: 'denia-tune-strain-luuk-standard',
    name: 'Denia — Tune Strain / Luuk Standard Rotation',
    characterId: 'denia',
    teamProfileId: 'luuk-herssen-denia-mornye',
    executionStatus: 'SOURCE_SEQUENCE_ONLY',
    sourceSequence: [
      ...STANDARD_CORE_SEQUENCE,
      'Echo: Voidwing Moth (swap-cancel immediately before switching out)',
      'Outro to Luuk Herssen',
    ],
    variantKey: 'tune-strain-luuk',
    modeledMechanicFactIds: [],
    assumedMechanicFactIds: [],
    verificationStatus: 'VERIFIED',
    provenance: DENIA_SOURCE,
  },
];

export const PROFILE_MULTIMODE_DENIA_PRESETS: readonly CharacterBuildPreset[] = [
  {
    kind: 'CHARACTER_PRESET',
    id: 'denia-fusion-burst-aemeath',
    name: 'Denia — Fusion Burst / Aemeath',
    characterId: 'denia',
    modeKey: 'fusion-burst',
    displayLabel: 'Fusion Burst — Aemeath',
    sequence: 0,
    isDefault: true,
    uiSelectable: true,
    weaponRecommendationProfileId: 'denia-multimode-weapons',
    echoLoadoutProfileId: 'denia-fusion-burst-echoes',
    statTargetProfileId: 'denia-fusion-burst-stats',
    teamProfileId: 'aemeath-denia-chisa',
    rotationProfileId: 'denia-fusion-burst-aemeath-standard',
    verificationStatus: 'VERIFIED',
    provenance: {
      ...DENIA_SOURCE,
      notes: [
        ...DENIA_SOURCE.notes,
        'This is Bellibing\'s default because the current source calls Aemeath the best/only Fusion Burst DPS partner and the main reason to get/use Denia. It does not claim Fusion Burst is universally superior when the user is building around Luuk.',
      ],
    },
  },
  {
    kind: 'CHARACTER_PRESET',
    id: 'denia-tune-strain-luuk',
    name: 'Denia — Tune Strain / Luuk Herssen',
    characterId: 'denia',
    modeKey: 'tune-strain',
    displayLabel: 'Tune Strain — Luuk',
    sequence: 0,
    isDefault: false,
    uiSelectable: true,
    weaponRecommendationProfileId: 'denia-multimode-weapons',
    echoLoadoutProfileId: 'denia-tune-strain-echoes',
    statTargetProfileId: 'denia-tune-strain-stats',
    teamProfileId: 'luuk-herssen-denia-mornye',
    rotationProfileId: 'denia-tune-strain-luuk-standard',
    verificationStatus: 'VERIFIED',
    provenance: {
      ...DENIA_SOURCE,
      notes: [
        ...DENIA_SOURCE.notes,
        'The current source frames Tune Strain Denia as Luuk\'s best-in-slot path when Aemeath already has a strong team but Luuk needs the stronger premium partner; Mornye is the reviewed support requirement.',
      ],
    },
  },
];
