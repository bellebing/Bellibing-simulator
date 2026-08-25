import type {
  CharacterActionFact,
  CharacterMechanicFact,
  CharacterMechanicsProfile,
} from '../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-25';
const AUGUSTA_VALUE_CONTEXT = 'V9.15 Augusta Standard exact-parity fixture';

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
        'Migrated from the already exact-parity Augusta rotation model; this change does not introduce new game values.',
      ],
    },
  };
}

/**
 * Golden-reference character action facts extracted from the existing Augusta
 * exact-parity rotation. The rotation may repeat a fact; the source value lives
 * here once.
 *
 * Echo attacks (for example The False Sovereign) are intentionally excluded:
 * they belong to the Echo attack fact layer even when Augusta triggers them.
 */
export const AUGUSTA_CHARACTER_ACTION_FACTS: readonly CharacterActionFact[] = [
  augustaAction({
    factId: 'augusta-intro-stride-of-goldenflare',
    name: 'Intro Skill — Stride of Goldenflare',
    section: 'INTRO_SKILL',
    actionKind: 'INTRO',
    damageClass: 'INTRO',
    scalingStat: 'ATK',
    motionValue: 1.9882,
    motionValueContext: AUGUSTA_VALUE_CONTEXT,
    hitCount: null,
    conditional: false,
  }),
  augustaAction({
    factId: 'augusta-heavy-thunderoar-backstep',
    name: 'Heavy Attack — Thunderoar: Backstep',
    section: 'BASIC_ATTACK',
    actionKind: 'HEAVY',
    damageClass: 'HEAVY',
    scalingStat: 'ATK',
    motionValue: 0.5368,
    motionValueContext: AUGUSTA_VALUE_CONTEXT,
    hitCount: null,
    conditional: false,
  }),
  augustaAction({
    factId: 'augusta-heavy-thunderoar-spinslash',
    name: 'Heavy Attack — Thunderoar: Spinslash',
    section: 'BASIC_ATTACK',
    actionKind: 'HEAVY',
    damageClass: 'HEAVY',
    scalingStat: 'ATK',
    motionValue: 4.2516,
    motionValueContext: AUGUSTA_VALUE_CONTEXT,
    hitCount: null,
    conditional: false,
  }),
  augustaAction({
    factId: 'augusta-skill-warriors-blade',
    name: "Resonance Skill — Warrior's Blade",
    section: 'RESONANCE_SKILL',
    actionKind: 'SKILL',
    damageClass: 'SKILL',
    scalingStat: 'ATK',
    motionValue: 6.561,
    motionValueContext: AUGUSTA_VALUE_CONTEXT,
    hitCount: null,
    conditional: false,
  }),
  augustaAction({
    factId: 'augusta-liberation-sword-of-eternal-oath',
    name: 'Resonance Liberation — Sword of Eternal Oath',
    section: 'RESONANCE_LIBERATION',
    actionKind: 'LIBERATION',
    damageClass: 'HEAVY',
    scalingStat: 'ATK',
    motionValue: 10.9948,
    motionValueContext: AUGUSTA_VALUE_CONTEXT,
    hitCount: null,
    conditional: false,
    notes: ['Kit section is Resonance Liberation while the modeled damage bucket is Heavy Attack DMG.'],
  }),
  augustaAction({
    factId: 'augusta-forte-undying-sunlight-strike',
    name: 'Forte Skill — Undying Sunlight: Strike',
    section: 'FORTE_CIRCUIT',
    actionKind: 'FORTE',
    damageClass: 'SKILL',
    scalingStat: 'ATK',
    motionValue: 2.7834,
    motionValueContext: AUGUSTA_VALUE_CONTEXT,
    hitCount: null,
    conditional: false,
  }),
  augustaAction({
    factId: 'augusta-forte-undying-sunlight-leap',
    name: 'Forte Skill — Undying Sunlight: Leap',
    section: 'FORTE_CIRCUIT',
    actionKind: 'FORTE',
    damageClass: 'SKILL',
    scalingStat: 'ATK',
    motionValue: 2.7835,
    motionValueContext: AUGUSTA_VALUE_CONTEXT,
    hitCount: null,
    conditional: false,
  }),
  augustaAction({
    factId: 'augusta-forte-undying-sunlight-plunge',
    name: 'Forte Skill — Undying Sunlight: Plunge',
    section: 'FORTE_CIRCUIT',
    actionKind: 'FORTE',
    damageClass: 'HEAVY',
    scalingStat: 'ATK',
    motionValue: 8.6583,
    motionValueContext: AUGUSTA_VALUE_CONTEXT,
    hitCount: null,
    conditional: false,
  }),
  augustaAction({
    factId: 'augusta-liberation-sublime-is-the-sun-state',
    name: 'Resonance Liberation — Sublime is the Sun',
    section: 'RESONANCE_LIBERATION',
    actionKind: 'STATE_CHANGE',
    damageClass: null,
    scalingStat: 'UNKNOWN',
    motionValue: null,
    motionValueContext: null,
    hitCount: null,
    conditional: false,
    notes: ['Non-damaging state/setup action in the current exact-parity rotation.'],
  }),
  augustaAction({
    factId: 'augusta-liberation-sunborne',
    name: 'Sublime is the Sun — Sunborne',
    section: 'RESONANCE_LIBERATION',
    actionKind: 'LIBERATION',
    damageClass: 'HEAVY',
    scalingStat: 'ATK',
    motionValue: 10.7361,
    motionValueContext: AUGUSTA_VALUE_CONTEXT,
    hitCount: null,
    conditional: true,
    notes: ['Available in the Sublime is the Sun state; damage is modeled as Heavy Attack DMG.'],
  }),
  augustaAction({
    factId: 'augusta-liberation-everbright-protector',
    name: 'Sublime is the Sun — Everbright Protector',
    section: 'RESONANCE_LIBERATION',
    actionKind: 'LIBERATION',
    damageClass: 'HEAVY',
    scalingStat: 'ATK',
    motionValue: 11.9293,
    motionValueContext: AUGUSTA_VALUE_CONTEXT,
    hitCount: null,
    conditional: true,
    notes: ['Available in the Sublime is the Sun state; damage is modeled as Heavy Attack DMG.'],
  }),
  augustaAction({
    factId: 'augusta-outro-battlesong-of-the-unyielding',
    name: 'Outro — Battlesong of the Unyielding',
    section: 'OUTRO_SKILL',
    actionKind: 'OUTRO',
    damageClass: null,
    scalingStat: 'UNKNOWN',
    motionValue: null,
    motionValueContext: null,
    hitCount: null,
    conditional: false,
    notes: ['Outro identity is known from the parity rotation; its team-facing effect is not declared verified by this action fact.'],
  }),
] as const;

export const CHARACTER_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...AUGUSTA_CHARACTER_ACTION_FACTS,
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
 * Augusta is the mechanics architecture golden reference, but only its action
 * damage/event identities have been migrated into the generic fact layer so far.
 * Passives, resource semantics and S1-S6 remain explicit blockers rather than
 * being inferred from the rotation context.
 */
export const AUGUSTA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'augusta',
  verificationStatus: 'PARTIALLY_VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'VERIFIED' },
    { area: 'FORTE_RULES', status: 'PENDING', notes: 'Action values are known; Forte generation/state semantics still require raw-fact ingestion.' },
    { area: 'INHERENT_PASSIVES', status: 'PENDING' },
    { area: 'OUTRO_EFFECT', status: 'PENDING', notes: 'Outro identity exists, but the team-facing effect has not been promoted to a verified passive fact.' },
    { area: 'RESOURCE_RULES', status: 'PENDING' },
    { area: 'SEQUENCES', status: 'PENDING' },
  ],
  factIds: AUGUSTA_CHARACTER_ACTION_FACTS.map((fact) => fact.factId),
  provenance: {
    sourceLabels: ['V9.15 Augusta Standard', 'Bellibing exact Augusta parity regressions'],
    checkedAt: CHECKED_AT,
    notes: ['Coverage status is intentionally partial until non-action character mechanics are independently ingested and verified.'],
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
      if (fact.characterId !== profile.characterId) {
        throw new Error(`${profile.characterId} references mechanic fact owned by ${fact.characterId}: ${factId}`);
      }
    }
    map.set(profile.characterId, profile);
  }
  return map;
})();

export function getCharacterMechanicsProfile(characterId: string): CharacterMechanicsProfile | null {
  return CHARACTER_MECHANICS_PROFILE_BY_ID.get(characterId) ?? null;
}
