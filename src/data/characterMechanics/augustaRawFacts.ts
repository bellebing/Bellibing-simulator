import type {
  CharacterMechanicFact,
  CharacterPassiveFact,
  CharacterResourceFact,
  CharacterSequenceFact,
} from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-25';

const AUGUSTA_CURRENT_PROVENANCE = {
  sourceLabels: ['Prydwen — current Augusta kit', 'Wutheringlab — current Augusta kit'],
  sourceUrls: [
    'https://www.prydwen.gg/wuthering-waves/characters/augusta',
    'https://wutheringlab.com/character/augusta-build/',
  ],
  checkedAt: CHECKED_AT,
} as const;

function passive(
  input: Omit<
    CharacterPassiveFact,
    | 'characterId'
    | 'kind'
    | 'verificationStatus'
    | 'modelingStatus'
    | 'provenance'
  > & { modelingStatus?: CharacterPassiveFact['modelingStatus'] },
): CharacterPassiveFact {
  const { modelingStatus = 'RAW_ONLY', ...rest } = input;
  return {
    ...rest,
    characterId: 'augusta',
    kind: 'PASSIVE',
    verificationStatus: 'VERIFIED',
    modelingStatus,
    provenance: AUGUSTA_CURRENT_PROVENANCE,
  };
}

function resource(
  input: Omit<
    CharacterResourceFact,
    | 'characterId'
    | 'kind'
    | 'verificationStatus'
    | 'modelingStatus'
    | 'provenance'
  >,
): CharacterResourceFact {
  return {
    ...input,
    characterId: 'augusta',
    kind: 'RESOURCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: AUGUSTA_CURRENT_PROVENANCE,
  };
}

function sequence(
  input: Omit<
    CharacterSequenceFact,
    | 'characterId'
    | 'kind'
    | 'verificationStatus'
    | 'modelingStatus'
    | 'provenance'
  >,
): CharacterSequenceFact {
  return {
    ...input,
    characterId: 'augusta',
    kind: 'SEQUENCE',
    verificationStatus: 'VERIFIED',
    modelingStatus: 'RAW_ONLY',
    provenance: AUGUSTA_CURRENT_PROVENANCE,
  };
}

/** S0 resource/gauge rules. Sequence modifiers are stored separately below. */
export const AUGUSTA_RESOURCE_FACTS: readonly CharacterResourceFact[] = [
  resource({
    factId: 'augusta-resource-prowess',
    name: 'Prowess',
    section: 'FORTE_CIRCUIT',
    conditional: false,
    resourceName: 'Prowess',
    maxValue: 100,
    ruleSummary: 'Gained when specified Basic/Heavy/Mid-air/Skill/Dodge actions deal damage. Intro Skill — Stride of Goldenflare fully restores Prowess. Full Prowess enables enhanced Heavy Attack routes and those routes consume all Prowess.',
  }),
  resource({
    factId: 'augusta-resource-ascendancy',
    name: 'Ascendancy',
    section: 'FORTE_CIRCUIT',
    conditional: false,
    resourceName: 'Ascendancy',
    maxValue: 100,
    ruleSummary: 'Normal Attacks generate Ascendancy. Intro Skill restores 20%, Warrior’s Blade restores 10%, and Sword of Eternal Oath restores 40%. Full Ascendancy enables the Undying Sunlight enhanced Skill chain; Plunge consumes all Ascendancy.',
  }),
  resource({
    factId: 'augusta-resource-majesty',
    name: 'Majesty',
    section: 'FORTE_CIRCUIT',
    conditional: false,
    resourceName: 'Majesty',
    maxValue: 2,
    ruleSummary: 'At S0 Augusta holds up to 2 Majesty. Undying Sunlight: Plunge grants 1. Another team Resonator casting Outro while under Battlesong of the Unyielding grants 1. Sublime is the Sun requires and consumes 2 Majesty instead of Resonance Energy.',
  }),
  resource({
    factId: 'augusta-resource-crown-of-wills',
    name: 'Crown of Wills',
    section: 'OUTRO_SKILL',
    conditional: false,
    resourceName: 'Crown of Wills',
    maxValue: 1,
    ruleSummary: 'At S0 Crown of Wills holds up to 1 stack. A qualifying teammate Outro under Battlesong of the Unyielding grants 1 stack. Blazing Valor fully restores it out of combat. Everbright Protector removes all stacks. Sequence nodes can increase the cap and add acquisition routes.',
  }),
] as const;

export const AUGUSTA_PASSIVE_FACTS: readonly CharacterPassiveFact[] = [
  passive({
    factId: 'augusta-inherent-glorys-favor',
    name: "Inherent Skill — Glory's Favor",
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'When Augusta deals damage; trigger interval 0.5s.',
    effectSummary: 'Grants Augusta an unstackable shield equal to 350 + 2.5% of Max HP for 5s. The shield is not passed to the incoming Resonator.',
    durationSeconds: 5,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
    notes: ['The existing Augusta parity engine has shield-event assumptions used by downstream buffs, but this full trigger/shield lifecycle is not represented by a generic passive adapter yet.'],
  }),
  passive({
    factId: 'augusta-inherent-blazing-valor',
    name: 'Inherent Skill — Blazing Valor',
    section: 'INHERENT_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'After Augusta has been out of combat for over 4s; the effect can trigger once every 4s.',
    effectSummary: 'If Majesty is below 1, restore 1 Majesty. Fully restore Crown of Wills.',
    durationSeconds: null,
    maxStacks: null,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'augusta-outro-battlesong-effect',
    name: 'Outro Skill — Battlesong of the Unyielding',
    section: 'OUTRO_SKILL',
    conditional: true,
    scope: 'NEXT_CHARACTER',
    triggerSummary: 'Augusta casts Outro and switches to the next Resonator.',
    effectSummary: 'The next Resonator gains 15% DMG Amplification for all Attributes for 14s; it ends immediately if that Resonator switches out. If that affected Resonator casts Outro during the effect, Augusta gains 1 Majesty and 1 Crown of Wills.',
    durationSeconds: 14,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
    notes: ['The resource grant belongs to the affected next Resonator casting Outro; it is not an immediate Majesty grant when Augusta casts her own Outro.'],
  }),
  passive({
    factId: 'augusta-crown-of-wills-effect',
    name: 'Crown of Wills — S0 effect',
    section: 'OUTRO_SKILL',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'While Augusta has Crown of Wills stacks.',
    effectSummary: 'Each S0 stack grants 15% Electro DMG Bonus, up to 1 stack. All stacks are removed when Sublime is the Sun: Everbright Protector ends.',
    durationSeconds: null,
    maxStacks: 1,
    modelingStatus: 'PENDING_INTERPRETATION',
    notes: ['The Augusta parity context already contains a 15% Crown Electro-DMG term, but generic stack acquisition/removal is not yet modeled as a reusable effect lifecycle.'],
  }),
  passive({
    factId: 'augusta-liberation-sworn-allegiance-state',
    name: 'Sublime is the Sun — Sworn Allegiance',
    section: 'RESONANCE_LIBERATION',
    conditional: true,
    scope: 'SELF',
    triggerSummary: 'Hold Resonance Liberation at 2 Majesty to cast Sublime is the Sun; it consumes 2 Majesty and no Resonance Energy.',
    effectSummary: 'Generates Ruler’s Realm and enters Sworn Allegiance for 7s. Time is temporarily stopped and Resonator switching is disabled. Only Sunborne, Everbright Protector, Dodge and permitted movement/mid-air actions are available. Nine Sunborne attacks unlock the normal finisher route; Everbright can be cast early by holding Liberation and is automatically cast when the state ends normally.',
    durationSeconds: 7,
    maxStacks: null,
    modelingStatus: 'PENDING_INTERPRETATION',
  }),
  passive({
    factId: 'augusta-liberation-rulers-realm',
    name: 'Ruler’s Realm',
    section: 'RESONANCE_LIBERATION',
    conditional: true,
    scope: 'TEAM',
    triggerSummary: 'Generated when Augusta casts Sublime is the Sun.',
    effectSummary: 'Ruler’s Realm lasts 30s. A team Resonator casting Intro within it gains an unstackable shield equal to 650 + 5% of Augusta’s Max HP for 10s; the shield is not passed to the incoming Resonator.',
    durationSeconds: 30,
    maxStacks: 1,
    modelingStatus: 'RAW_ONLY',
  }),
] as const;

export const AUGUSTA_SEQUENCE_FACTS: readonly CharacterSequenceFact[] = [
  sequence({
    factId: 'augusta-s1-stained-in-scorched-earth',
    name: 'S1 — Stained in Scorched Earth',
    section: 'RESONANCE_CHAIN',
    sequence: 1,
    conditional: true,
    triggerSummary: 'Active when Augusta is at Sequence 1 or higher.',
    effectSummary: 'Each Crown of Wills stack additionally grants 15% Crit DMG; Crown cap becomes 2; casting Intro grants 1 Crown; Undying Sunlight Strike/Leap/Plunge become immune to interruption.',
  }),
  sequence({
    factId: 'augusta-s2-cleansed-in-crimson-war',
    name: 'S2 — Cleansed in Crimson War',
    section: 'RESONANCE_CHAIN',
    sequence: 2,
    conditional: true,
    triggerSummary: 'Active when Augusta is at Sequence 2 or higher.',
    effectSummary: 'Each Crown of Wills stack additionally grants 20% Crit Rate. For every 1% Crit Rate over 100%, Augusta gains 2% Crit DMG, capped at +100% Crit DMG.',
  }),
  sequence({
    factId: 'augusta-s3-forged-in-rot-and-ruin',
    name: 'S3 — Forged in Rot and Ruin',
    section: 'RESONANCE_CHAIN',
    sequence: 3,
    conditional: true,
    triggerSummary: 'Active when Augusta is at Sequence 3 or higher.',
    effectSummary: 'Increases DMG Multiplier by 25% for Thunderoar Backstep (including Dodge Counter variant), Spinslash, Uppercut, Undying Sunlight: Plunge, Sunborne and Everbright Protector.',
  }),
  sequence({
    factId: 'augusta-s4-ascent-in-sun-and-glory',
    name: 'S4 — Ascent in Sun and Glory',
    section: 'RESONANCE_CHAIN',
    sequence: 4,
    conditional: true,
    triggerSummary: 'Casting Intro Skill — Stride of Goldenflare.',
    effectSummary: 'Increases the ATK of all Resonators in the team by 20% for 30s.',
  }),
  sequence({
    factId: 'augusta-s5-unshaken-in-wrathful-tides',
    name: 'S5 — Unshaken in Wrathful Tides',
    section: 'RESONANCE_CHAIN',
    sequence: 5,
    conditional: true,
    triggerSummary: "Applies to the shield provided by Glory's Favor.",
    effectSummary: "Increases the shield provided by Glory's Favor by 50%.",
  }),
  sequence({
    factId: 'augusta-s6-engraved-in-radiant-light',
    name: 'S6 — Engraved in Radiant Light',
    section: 'RESONANCE_CHAIN',
    sequence: 6,
    conditional: true,
    triggerSummary: 'Active at Sequence 6; additional triggers occur when Spinslash or Uppercut is performed.',
    effectSummary: 'Crown of Wills cap becomes 4. For every 1% Crit Rate over 150%, Augusta gains another 2% Crit DMG, capped at +50%. Spinslash or Uppercut grants 2 Crown stacks at most once per 1s. Those attacks also trigger Thunder Rage at the location: two Electro-DMG instances, each equal to 100% ATK and considered Heavy Attack DMG.',
    notes: ['S6 adds the over-150% Crit conversion; it does not erase the separate S2 over-100% rule in the raw sequence text.'],
  }),
] as const;

export const AUGUSTA_NON_ACTION_MECHANIC_FACTS: readonly CharacterMechanicFact[] = [
  ...AUGUSTA_RESOURCE_FACTS,
  ...AUGUSTA_PASSIVE_FACTS,
  ...AUGUSTA_SEQUENCE_FACTS,
] as const;
