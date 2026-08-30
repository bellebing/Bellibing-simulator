export type EchoSkillPendingAdapterKind =
  | 'CHARACTER_RESTRICTION'
  | 'LOADOUT_STATE_REPLACEMENT'
  | 'TRIGGER_STATE'
  | 'ECHO_SKILL_LOCAL_STATE'
  | 'TARGET_STATE_SCOPE';

export interface EchoSkillPendingAdapterFact {
  readonly echoId: string;
  readonly fact: string;
  readonly kind: EchoSkillPendingAdapterKind;
  readonly reason: string;
}

export const ECHO_SKILL_SOURCE_REVIEW_V36 = {
  patch: '3.6',
  checkedAt: '2026-08-29',
  sourceRepository: 'DommyMM/wuwabuild',
  sourceCommit: '5fa70b11f1d84fb644e4dbed47873708da0fe66f',
  sourceBlobSha: 'cca1563ce0491a3de80ac7359344112631329224',
  sourcePath: 'public/Data/Echoes.json',
  expectedReleasedEchoCount: 181,
  expectedEnglishDescriptionCount: 181,
  expectedFiveRankParamRecordCount: 181,
  expectedCooldownRecordCount: 181,
  expectedSkillNameFieldCount: 0,
  expectedDamageTextRecordCount: 170,
  expectedNoDamageTextRecordCount: 11,
  expectedMainSlotTextRecordCount: 36,
  expectedStructuredBonusEchoCount: 35,
  expectedStructuredBonusRowCount: 58,
  expectedCharacterConditionBonusRowCount: 3,
  expectedUnusedParamRecordCount: 3,
  expectedModeledEffectRowCount: 62,
  expectedModeledEffectEchoCount: 37,
  expectedAttackProfileCount: 3,
  expectedAttackFactCount: 4,
  notes: [
    'The upstream Echo record has no dedicated skill-name field. Bellibing therefore keeps the Echo identity plus source skill description and never invents a separate skill name.',
    'All 181 released Version 3.6 Echo records have English active-skill text, five rank parameter rows, and a source-explicit cooldown placeholder that resolves at Rank 5.',
    'Source review completeness does not imply executable combat coverage. Damage prose is not promoted to an attack profile when scaling, hit decomposition, variants, or state semantics cannot be proven in the current attack domain.',
    'Fallacy of No Return normal activation is a partial safe exception: Rank-5 source proves one 15.86% max-HP Spectro blast, while its hold/release variant remains explicitly outside exact execution coverage.',
    'Structured upstream bonuses are used only where their main-slot behavior is stable. Character-restricted or loadout-replaced rows remain pending until the corresponding adapter exists.',
  ],
} as const;

export const ECHO_SKILL_SOURCE_UNUSED_PARAM_RECORDS = [
  {
    echoId: 'echo-60001905',
    name: 'Reactor Husk',
    unusedRankParamIndexes: [2, 3],
    note: 'Rendered English skill text references parameters 0, 1, and 4; parameters 2 and 3 remain unused in that rendered text.',
  },
  {
    echoId: 'echo-60000555',
    name: 'Dwarf Cassowary',
    unusedRankParamIndexes: [3],
    note: 'Rendered English skill text does not consume the fourth source parameter.',
  },
  {
    echoId: 'echo-60001725',
    name: 'Nightmare: Dwarf Cassowary',
    unusedRankParamIndexes: [3],
    note: 'Rendered English skill text does not consume the fourth source parameter.',
  },
] as const;

export const ECHO_SKILL_PENDING_ADAPTER_FACTS: readonly EchoSkillPendingAdapterFact[] = [
  {
    echoId: 'echo-60002015',
    fact: '15% CRIT Rate when Reminiscence - Nightmare: Adam Smasher is main-slot equipped by Lucy or Rebecca',
    kind: 'CHARACTER_RESTRICTION',
    reason: 'The current Echo effect layer has no source-safe character-restriction key for this cross-character Echo behavior.',
  },
  {
    echoId: 'echo-60001065',
    fact: 'Additional 10% Aero DMG Bonus for Resonator: Aero or Cartethyia with Reminiscence: Fleurdelys equipped',
    kind: 'CHARACTER_RESTRICTION',
    reason: 'The source condition mixes a form label and a named Resonator; do not guess internal character IDs in the generic Echo effect layer.',
  },
  {
    echoId: 'echo-60001915',
    fact: '25% Resonance Liberation DMG Bonus when Sigillum is main-slot equipped by Aemeath',
    kind: 'CHARACTER_RESTRICTION',
    reason: 'The effect is source-explicit but requires a character-restriction adapter before it can be executable generically.',
  },
  {
    echoId: 'echo-60001809',
    fact: 'Twin Nova: Collapsar Blade main-slot 12% Electro DMG Bonus changes to 12% Spectro DMG Bonus when Twin Nova: Nebulous Cannon is equipped in another slot',
    kind: 'LOADOUT_STATE_REPLACEMENT',
    reason: 'A static permanent bonus row would be wrong for one of the source-explicit loadout states.',
  },
  {
    echoId: 'echo-60002215',
    fact: 'Additional 10% Aero DMG Bonus for 15s after inflicting Tune Strain - Shifting',
    kind: 'TRIGGER_STATE',
    reason: 'The current activation enum does not represent this non-cast target-state trigger without pretending automatic uptime.',
  },
  {
    echoId: 'echo-60000905',
    fact: 'Nightmare: Crownless Echo Skill DMG increases by 20% for 2s after the skill hits, non-stacking',
    kind: 'ECHO_SKILL_LOCAL_STATE',
    reason: 'This modifies the Echo skill itself rather than a generic Resonator stat and needs an Echo-skill state adapter.',
  },
  {
    echoId: 'echo-60000925',
    fact: 'DMG dealt to enemies inflicted by Spectro Frazzle is increased by 100%',
    kind: 'TARGET_STATE_SCOPE',
    reason: 'The source text is explicit about the target state but the current generic Echo effect layer cannot prove the exact affected damage scope safely.',
  },
];
