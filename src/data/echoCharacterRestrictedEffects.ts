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

export const SIGILLUM_CHARACTER_RESTRICTION_REVIEW = {
  reviewedAt: '2026-09-01',
  echoId: 'echo-60001915',
  effectId: 'ECHO_60001915_RESONANCE_LIBERATION_DMG_AEMEATH',
  primitiveId: 'echo-character-restriction-v1',
  closesPendingExecutionId: 'echo:echo-60001915:sigillum-character-restriction-adapter',
  canonicalWielderCharacterIds: ['aemeath'],
  sourceEvidence: [
    'Pinned Echo skill text explicitly grants 25% Resonance Liberation DMG Bonus when Sigillum is equipped in the main slot by Aemeath.',
    'Aemeath is named directly by the source condition; no element-wide or team-wide interpretation is required.',
  ],
  notes: [
    'This static main-slot restriction is separate from Sigillum active attack damage and its 20-second cooldown.',
    'The canonical aemeath-standard source sequence contains no Echo cast; modeling this passive does not insert an Echo action or authorize active damage.',
  ],
} as const;

export const ECHO_CHARACTER_RESTRICTED_EFFECTS: readonly EchoEffectModel[] = [
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
  {
    effectId: SIGILLUM_CHARACTER_RESTRICTION_REVIEW.effectId,
    echoId: SIGILLUM_CHARACTER_RESTRICTION_REVIEW.echoId,
    statOrEffect: 'Resonance Liberation DMG Bonus',
    value: 0.25,
    activation: 'MAIN_SLOT_PASSIVE',
    trigger: 'Sigillum equipped in the main Echo slot by Aemeath',
    durationSeconds: null,
    appliesTo: 'WIELDER',
    wielderCharacterIds: SIGILLUM_CHARACTER_RESTRICTION_REVIEW.canonicalWielderCharacterIds,
    mechanicsStatus: 'VERIFIED_CONDITIONAL',
    notes: 'Source-explicit permanent main-slot bonus. Identity-restricted to Aemeath; no active Echo cast or uptime assumption is required for this passive.',
    provenance: {
      sourceLabels: ['wuwabuild Echo skill rendered English text'],
      sourceUrls: [SOURCE_URL],
      checkedAt: SIGILLUM_CHARACTER_RESTRICTION_REVIEW.reviewedAt,
      notes: [
        `Pinned upstream source commit ${SOURCE_COMMIT}.`,
        'Rendered source text names Aemeath directly and grants 25% Resonance Liberation DMG Bonus only when Sigillum is equipped in the main slot by Aemeath.',
      ],
    },
  },
];
