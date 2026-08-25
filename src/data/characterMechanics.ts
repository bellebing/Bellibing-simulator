import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterMechanicsProfile,
} from '../characterMechanicsDomain.ts';
import { AUGUSTA_NON_ACTION_MECHANIC_FACTS } from './characterMechanics/augustaRawFacts.ts';

const CHECKED_AT = '2026-08-25';
const AUGUSTA_VALUE_CONTEXT = 'V9.15 Augusta Standard Lv90/S0/10-10-10-10-10 exact-parity fixture';

function augustaAction(
  input: Omit<
    CharacterActionFact,
    | 'characterId'
    | 'kind'
    | 'verificationStatus'
    | 'modelingStatus'
    | 'provenance'
  >,
): CharacterActionFact {
  return {
    ...input,
    characterId: 'augusta',
    kind: 'ACTION',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'MODELED',
    provenance: {
      sourceLabels: ['V9.15 Augusta Standard', 'Bellibing exact Augusta parity regressions'],
      checkedAt: CHECKED_AT,
      notes: [
        'Lv90/S0 with all five relevant skill levels at 10 is the active spreadsheet-oracle context.',
        'These values are migrated from the exact-parity model; they are not inferred from a Lv1 public multiplier table.',
      ],
    },
  };
}

/**
 * Exact S0 Standard-rotation action facts. Repeated rotation steps reuse these
 * records. Full-kit action/multiplier-curve ingestion is tracked separately by
 * the mechanics coverage profile below and must not be implied by this subset.
 */
export const AUGUSTA_CHARACTER_ACTION_FACTS: readonly CharacterActionFact[] = [
  augustaAction({ factId: 'augusta-intro-stride-of-goldenflare', name: 'Intro Skill — Stride of Goldenflare', section: 'INTRO_SKILL', actionKind: 'INTRO', damageClass: 'INTRO', scalingStat: 'ATK', motionValue: 1.9882, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: false }),
  augustaAction({ factId: 'augusta-heavy-thunderoar-backstep', name: 'Heavy Attack — Thunderoar: Backstep', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValue: 0.5368, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: false }),
  augustaAction({ factId: 'augusta-heavy-thunderoar-spinslash', name: 'Heavy Attack — Thunderoar: Spinslash', section: 'BASIC_ATTACK', actionKind: 'HEAVY', damageClass: 'HEAVY', scalingStat: 'ATK', motionValue: 4.2516, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: false }),
  augustaAction({ factId: 'augusta-skill-warriors-blade', name: "Resonance Skill — Warrior's Blade", section: 'RESONANCE_SKILL', actionKind: 'SKILL', damageClass: 'SKILL', scalingStat: 'ATK', motionValue: 6.561, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: false }),
  augustaAction({ factId: 'augusta-liberation-sword-of-eternal-oath', name: 'Resonance Liberation — Sword of Eternal Oath', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'HEAVY', scalingStat: 'ATK', motionValue: 10.9948, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: false, notes: ['Kit section is Resonance Liberation while the game classifies its damage as Heavy Attack DMG.'] }),
  augustaAction({ factId: 'augusta-forte-undying-sunlight-strike', name: 'Forte Skill — Undying Sunlight: Strike', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'SKILL', scalingStat: 'ATK', motionValue: 2.7834, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: false }),
  augustaAction({ factId: 'augusta-forte-undying-sunlight-leap', name: 'Forte Skill — Undying Sunlight: Leap', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'SKILL', scalingStat: 'ATK', motionValue: 2.7835, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: false }),
  augustaAction({ factId: 'augusta-forte-undying-sunlight-plunge', name: 'Forte Skill — Undying Sunlight: Plunge', section: 'FORTE_CIRCUIT', actionKind: 'FORTE', damageClass: 'HEAVY', scalingStat: 'ATK', motionValue: 8.6583, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: false }),
  augustaAction({ factId: 'augusta-liberation-sublime-is-the-sun-state', name: 'Resonance Liberation — Sublime is the Sun', section: 'RESONANCE_LIBERATION', actionKind: 'STATE_CHANGE', damageClass: null, scalingStat: 'UNKNOWN', motionValue: null, motionValueContext: null, hitCount: null, conditional: false, notes: ['Non-damaging state/setup action in the exact-parity rotation.'] }),
  augustaAction({ factId: 'augusta-liberation-sunborne', name: 'Sublime is the Sun — Sunborne', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'HEAVY', scalingStat: 'ATK', motionValue: 10.7361, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: true, notes: ['Available during Sworn Allegiance and classified as Heavy Attack DMG.'] }),
  augustaAction({ factId: 'augusta-liberation-everbright-protector', name: 'Sublime is the Sun — Everbright Protector', section: 'RESONANCE_LIBERATION', actionKind: 'LIBERATION', damageClass: 'HEAVY', scalingStat: 'ATK', motionValue: 11.9293, motionValueContext: AUGUSTA_VALUE_CONTEXT, hitCount: null, conditional: true, notes: ['Available during Sworn Allegiance and classified as Heavy Attack DMG.'] }),
  augustaAction({ factId: 'augusta-outro-battlesong-of-the-unyielding', name: 'Outro — Battlesong of the Unyielding', section: 'OUTRO_SKILL', actionKind: 'OUTRO', damageClass: null, scalingStat: 'UNKNOWN', motionValue: null, motionValueContext: null, hitCount: null, conditional: false, notes: ['The team-facing Outro effect is owned by a separate verified passive fact.'] }),
] as const;

export const CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...AUGUSTA_CHARACTER_ACTION_FACTS,
  ...AUGUSTA_NON_ACTION_MECHANIC_FACTS,
] as const;

export const CHARACTER_MECHANIC_FACT_BY_ID: ReadonlyMap<string, CharacterMechanicFact> = (() => {
  const map = new Map<string, CharacterMechanicFact>();
  for (const fact of CHARACTER_MECHANIC_FACTS) {
    if (map.has(fact.factId)) throw new Error(`Duplicate character mechanic fact: ${fact.factId}`);
    map.set(fact.factId, fact);
  }
  return map;
})();

export function getCharacterMechanicFact(factId: string): CharacterMechanicFact | null {
  return CHARACTER_MECHANIC_FACT_BY_ID.get(factId) ?? null;
}

export function getCharacterActionFact(factId: string): CharacterActionFact | null {
  const fact = getCharacterMechanicFact(factId);
  return fact?.kind === 'ACTION' ? fact : null;
}

/**
 * Raw mechanics coverage is intentionally independent from executable combat
 * coverage. Non-action S0/S1-S6 mechanics are now source-audited; full action
 * coverage still needs the remaining non-standard actions and source-level
 * multiplier curves before the Character Raw gate can call Augusta complete.
 */
export const AUGUSTA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'augusta',
  verificationStatus: 'PARTIALLY_VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'PARTIAL', notes: 'Exact S0 Standard Lv10 action set is verified. Full-kit non-rotation actions and their skill-level multiplier curves are still pending raw ingestion.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'Prowess/Ascendancy/Majesty, Undying Sunlight gating and Sworn Allegiance rules are source-audited.' },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED' },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'S1-S6 raw text is verified; sequence effects remain RAW_ONLY until a sequence-aware combat adapter consumes them.' },
  ],
  factIds: CHARACTER_MECHANIC_FACTS.filter((fact) => fact.characterId === 'augusta').map((fact) => fact.factId),
  provenance: {
    sourceLabels: ['V9.15 Augusta Standard', 'Prydwen — current Augusta kit', 'Wutheringlab — current Augusta kit'],
    sourceUrls: [
      'https://www.prydwen.gg/wuthering-waves/characters/augusta',
      'https://wutheringlab.com/character/augusta-build/',
    ],
    checkedAt: CHECKED_AT,
    notes: ['Raw resource/passive/Outro/S1-S6 coverage is complete. ACTIONS remains partial until complete current skill-level multiplier coverage is ingested without mixing Lv1 public tables into the Lv10 parity fixture.'],
  },
};

export const CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [
  AUGUSTA_CHARACTER_MECHANICS_PROFILE,
] as const;

export const CHARACTER_MECHANICS_PROFILE_BY_ID: ReadonlyMap<string, CharacterMechanicsProfile> = (() => {
  const map = new Map<string, CharacterMechanicsProfile>();
  for (const profile of CHARACTER_MECHANICS_PROFILES) {
    if (map.has(profile.characterId)) throw new Error(`Duplicate character mechanics profile: ${profile.characterId}`);
    for (const factId of profile.factIds) {
      const fact = CHARACTER_MECHANIC_FACT_BY_ID.get(factId);
      if (!fact) throw new Error(`${profile.characterId} references unknown mechanic fact ${factId}`);
      if (fact.characterId !== profile.characterId) throw new Error(`${profile.characterId} references mechanic fact owned by ${fact.characterId}: ${factId}`);
    }
    map.set(profile.characterId, profile);
  }
  return map;
})();

export function getCharacterMechanicsProfile(characterId: string): CharacterMechanicsProfile | null {
  return CHARACTER_MECHANICS_PROFILE_BY_ID.get(characterId) ?? null;
}
