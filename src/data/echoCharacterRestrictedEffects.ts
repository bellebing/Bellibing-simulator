import type { EchoEffectModel } from '../echoEffectDomain.ts';

const SOURCE_COMMIT = '5fa70b11f1d84fb644e4dbed47873708da0fe66f';
const SOURCE_URL = `https://github.com/DommyMM/wuwabuild/blob/${SOURCE_COMMIT}/public/Data/Echoes.json`;

export const FLEURDELYS_CHARACTER_RESTRICTION_REVIEW = {
  reviewedAt: '2026-08-30',
  echoId: 'echo-60001065',
  effectId: 'ECHO_60001065_AERO_DMG_ROVER_CARTETHYIA',
  primitiveId: 'echo-character-restriction-v1',
  closesPendingExecutionId: 'echo:echo-60001065:fleurdelys-character-restriction-adapter',
  sourceConditionTokens: ['Aero', 'Cartethyia'],
  canonicalWielderCharacterIds: ['rover-aero', 'cartethyia'],
  sourceEvidence: [
    'Pinned structured bonus is +10% Aero DMG with characterCondition ["Aero", "Cartethyia"].',
    'The same pinned record resolves the ambiguous English token in multiple localizations: German says Rover: Aero, Spanish says Errante: Aero, Thai names Rover - Aero, and Chinese names 漂泊者·气动.',
    'Bellibing canonical character identities are rover-aero / Rover (Aero) and cartethyia / Cartethyia.',
    'This source condition is identity-specific; it must not be generalized to every Aero-element Resonator.',
  ],
  notes: [
    'The unconditional +10% Aero main-slot bonus remains its own generic EchoEffectModel row.',
    'This review only closes static character-restriction applicability. Fleurdelys active-skill damage remains a separate execution boundary where applicable.',
  ],
} as const;

/** Existing source-explicit pending rows migrated onto the same identity gate. */
export const ECHO_CHARACTER_RESTRICTION_REVIEWS = [
  FLEURDELYS_CHARACTER_RESTRICTION_REVIEW,
  {
    reviewedAt: '2026-09-08',
    echoId: 'echo-60002015',
    effectId: 'ECHO_60002015_CRIT_RATE_LUCY_REBECCA',
    primitiveId: 'echo-character-restriction-v1',
    sourceConditionTokens: ['Lucy', 'Rebecca'],
    canonicalWielderCharacterIds: ['lucy', 'rebecca'],
    sourceEvidence: [
      'The already-reviewed pinned structured row has Crit Rate 15 and characterCondition [Lucy, Rebecca].',
      'Rendered main-slot text binds the same restriction and parameter 4 is 15% at every source rank.',
      'Only the static CRIT Rate branch is migrated; identity-specific active Echo variants are separate pending execution work.',
    ],
  },
  {
    reviewedAt: '2026-09-08',
    echoId: 'echo-60001915',
    effectId: 'ECHO_60001915_LIBERATION_DMG_AEMEATH',
    primitiveId: 'echo-character-restriction-v1',
    sourceConditionTokens: ['Aemeath'],
    canonicalWielderCharacterIds: ['aemeath'],
    sourceEvidence: [
      'The already-reviewed pinned structured row has Resonance Liberation DMG Bonus 25 and characterCondition [Aemeath].',
      'Rendered main-slot text names Aemeath; parameter 2 is 25% at every source rank.',
      'This static bonus neither proves the scaling of the separate active Echo attacks nor supplies an Aemeath rotation.',
    ],
  },
] as const;

export const ECHO_CHARACTER_RESTRICTED_EFFECTS: readonly EchoEffectModel[] = [
  {
    effectId: 'ECHO_60002015_CRIT_RATE_LUCY_REBECCA',
    echoId: 'echo-60002015',
    statOrEffect: 'CRIT Rate',
    value: 0.15,
    activation: 'MAIN_SLOT_PASSIVE',
    trigger: 'Reminiscence - Nightmare: Adam Smasher equipped in the main Echo slot by Lucy or Rebecca',
    durationSeconds: null,
    appliesTo: 'WIELDER',
    wielderCharacterIds: ['lucy', 'rebecca'],
    mechanicsStatus: 'VERIFIED_CONDITIONAL',
    notes: 'Static identity-restricted CRIT Rate only. Special active Echo skills and loadout recommendations are not inferred.',
    provenance: {
      sourceLabels: ['wuwabuild pinned Echo structured characterCondition and rendered main-slot text'],
      sourceUrls: [SOURCE_URL],
      checkedAt: '2026-09-08',
      notes: ['Existing source-explicit pending fact migrated to echo-character-restriction-v1; the exact pinned blob was rechecked.'],
    },
  },
  {
    effectId: 'ECHO_60001915_LIBERATION_DMG_AEMEATH',
    echoId: 'echo-60001915',
    statOrEffect: 'Resonance Liberation DMG Bonus',
    value: 0.25,
    activation: 'MAIN_SLOT_PASSIVE',
    trigger: 'Sigillum equipped in the main Echo slot by Aemeath',
    durationSeconds: null,
    appliesTo: 'WIELDER',
    wielderCharacterIds: ['aemeath'],
    mechanicsStatus: 'VERIFIED_CONDITIONAL',
    notes: 'Static Aemeath-only Liberation bonus; not an all-Fusion-character bonus or active Echo damage claim.',
    provenance: {
      sourceLabels: ['wuwabuild pinned Echo structured characterCondition and rendered main-slot text'],
      sourceUrls: [SOURCE_URL],
      checkedAt: '2026-09-08',
      notes: ['Existing source-explicit pending fact migrated to echo-character-restriction-v1; the exact pinned blob was rechecked.'],
    },
  },
  {
    effectId: FLEURDELYS_CHARACTER_RESTRICTION_REVIEW.effectId,
    echoId: FLEURDELYS_CHARACTER_RESTRICTION_REVIEW.echoId,
    statOrEffect: 'Aero DMG Bonus',
    value: 0.10,
    activation: 'MAIN_SLOT_PASSIVE',
    trigger: 'Reminiscence: Fleurdelys equipped in the main Echo slot by Rover (Aero) or Cartethyia',
    durationSeconds: null,
    appliesTo: 'WIELDER',
    wielderCharacterIds: FLEURDELYS_CHARACTER_RESTRICTION_REVIEW.canonicalWielderCharacterIds,
    mechanicsStatus: 'VERIFIED_CONDITIONAL',
    notes: 'Additional source-explicit +10% Aero DMG. Identity-restricted to Rover (Aero) and Cartethyia; not an all-Aero-character bonus.',
    provenance: {
      sourceLabels: ['wuwabuild Echo skill structured characterCondition + multilingual rendered text'],
      sourceUrls: [SOURCE_URL],
      checkedAt: FLEURDELYS_CHARACTER_RESTRICTION_REVIEW.reviewedAt,
      notes: [
        `Pinned upstream source commit ${SOURCE_COMMIT}.`,
        'Structured characterCondition tokens are ["Aero", "Cartethyia"]; multilingual text independently identifies the first token as Rover: Aero.',
      ],
    },
  },
];
