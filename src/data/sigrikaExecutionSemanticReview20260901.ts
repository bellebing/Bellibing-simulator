const BLOCKER_ID = 'BUG-018';
const REVIEWED_AT = '2026-09-01';

function blocked(pendingExecutionId: string, actionKey: string, ...notes: readonly string[]) {
  return {
    pendingExecutionId,
    status: 'BLOCKED_SOURCE_SEMANTICS' as const,
    actionKey,
    reviewedAt: REVIEWED_AT,
    blockerId: BLOCKER_ID,
    notes,
  };
}

function primitiveAvailable(
  pendingExecutionId: string,
  actionKey: string,
  primitiveId: string,
  ...notes: readonly string[]
) {
  return {
    pendingExecutionId,
    status: 'PRIMITIVE_AVAILABLE_REQUIRES_TIMELINE' as const,
    actionKey,
    reviewedAt: REVIEWED_AT,
    primitiveId,
    notes,
  };
}

export const SIGRIKA_EXECUTION_SEMANTIC_REVIEWS = Object.freeze([
  primitiveAvailable(
    'character:sigrika:rune-lifecycle-adapter',
    'character:sigrika-rune-lifecycle',
    'sigrika-resource-state-v1',
    'Current source proves Trust/Answer direct-hit creation, base capacity 2, capacity 4 at >=50 Full Stop and left-shift overwrite at cap.',
    'sigrika-resource-state-v1 models these transitions event-by-event and deliberately fails closed when Schemata is presented with more than two stored Runes because current reviewed text does not state a >2 selection order.',
    'Canonical action checkpoint identity is source-closed separately, but generic Rune history, Convergent/Divergent lifetime and arbitrary off-sequence state still require a real event timeline.',
  ),
  primitiveAvailable(
    'character:sigrika:innate-gift-damage-amplification-adapter',
    'character:sigrika-innate-gift-damage-amplification',
    'sigrika-resource-state-v1',
    'At >=30 Soliskin Vitality, Schemata consumes 30, increases the current Runic multiplier by 50% and grants one Innate Gift stack; lower Vitality consumes all and grants 15% DMG Amplification per 10 consumed.',
    'Innate Gift remains max 2 at S0, grants 30% DMG Amplification per stack to the source-listed Runic/Learn actions, and clears on Learn My True Name or switch-out.',
    'Canonical predecessor review now source-bounds Sigrika entry to 40–50 Soliskin Vitality, so the first Schemata high-Vitality path and one gained Innate Gift stack are guaranteed.',
    'Exact later Innate Gift amplification remains unresolved because Ciaccona support-Echo uniqueness and Sigrika own flexible Echo timing can change whether the second Schemata reaches >=30 Vitality; the primitive does not collapse that interval.',
    'Current source wording also does not provide a separate event-order statement proving that the Innate Gift stack obtained while consuming Runes amplifies the same Runic hit that grants it; Bellibing does not assume same-event application.',
  ),
  primitiveAvailable(
    'character:sigrika:blessing-of-runes-echo-skill-state-adapter',
    'character:sigrika-blessing-of-runes-state',
    'sigrika-resource-state-v1',
    'Nearby-team Echo Skill casts source-prove Soliskin Vitality +10 and Blessing of Runes +1 with same-name once-only records; Blessing caps at 6 and resets on lineup change, while the Vitality trigger record resets on Sigrika Outro.',
    'The primitive models the two trigger records separately, Blessing stack bonuses and the ER-over-125% conversion formula.',
    'Current exact-team predecessor sources prove Qiuyuan contributes four valid distinct gauge triggers before Outro to Sigrika and describe one Ciaccona Echo cast, bounding canonical Sigrika entry at 4–5 Blessing stacks and 40–50 Soliskin Vitality.',
    'The exact point cannot be selected without a canonical Ciaccona support-Echo identity binding, and Prydwen leaves Sigrika own Nameless Explorer cast timing flexible; no sixth trigger or later gauge state is invented.',
  ),
  primitiveAvailable(
    'weapon:solsworn-ciphers:SCIP-ECHO-AMP:echo-intro-cast-window-adapter',
    'weapon:solsworn-ciphers-echo-amplification-window',
    'weapon-cast-timed-self-window-v1',
    'SCIP-ECHO-AMP is source-exact at R1: +32% Echo Skill DMG Amplification for 15 seconds after Intro Skill or Echo Skill cast.',
    'weapon-cast-timed-self-window-v1 has an explicit SCIP-ECHO-AMP contract for INTRO_SKILL_CAST and ECHO_SKILL_CAST.',
    'sigrika-standard-source-event-skeleton-v1 now source-binds the canonical Intro Skill cast to fixed zero-based step index 0 and deliberately binds no equipped-Echo cast to a fixed step.',
    'The trigger event is therefore fixed in action order, but no seconds-elapsed value exists to resolve the 15-second overlap against later damage checkpoints.',
  ),
  primitiveAvailable(
    'weapon:solsworn-ciphers:SCIP-AERO-DEF:echo-skill-damage-window-adapter',
    'weapon:solsworn-ciphers-aero-def-ignore-window',
    'weapon-damage-timed-self-window-v1',
    'SCIP-AERO-DEF is source-exact at R1: Aero DMG ignores 10% DEF for 6 seconds after dealing Echo Skill DMG.',
    'weapon-damage-timed-self-window-v1 opens only from an explicit ECHO_SKILL_DAMAGE event and preserves the source Aero-only damage condition.',
    'sigrika-standard-source-event-skeleton-v1 proves the first fixed ECHO_SKILL_DAMAGE event is the first Elucidated at zero-based step index 4 and proves six fixed Echo Skill DMG checkpoints at indexes 4/5/6/10/11/12.',
    'Those trigger checkpoints are source-ordered but timestamp-free; the 6-second overlap remains unresolved and equipment selection does not authorize blanket uptime.',
  ),
  primitiveAvailable(
    'sonata:sonata-29:S29_5PC_ECHO_CR:echo-skill-damage-window-adapter',
    'sonata:sound-of-true-name-echo-skill-damage-window',
    'sonata-damage-timed-self-window-v1',
    'Sound of True Name 5P grants +20% Echo Skill CRIT Rate for 5 seconds after dealing Echo Skill DMG.',
    'sonata-damage-timed-self-window-v1 requires an explicit ECHO_SKILL_DAMAGE event; equipment selection alone grants no state.',
    'sigrika-standard-source-event-skeleton-v1 source-binds the first fixed trigger to Elucidated at zero-based step index 4 and the fixed Echo Skill DMG checkpoints to indexes 4/5/6/10/11/12, but assigns no timestamps.',
    'The 5-second state can therefore be opened from a real canonical damage event once a timeline exists, but current source order alone cannot resolve its action coverage.',
  ),
  primitiveAvailable(
    'sonata:sonata-29:S29_5PC_AERO:echo-skill-damage-window-adapter',
    'sonata:sound-of-true-name-echo-skill-damage-window',
    'sonata-damage-timed-self-window-v1',
    'Sound of True Name 5P grants +15% Aero DMG Bonus for the same 5-second Echo Skill damage-triggered state.',
    'sonata-damage-timed-self-window-v1 requires an explicit ECHO_SKILL_DAMAGE event; equipment selection alone grants no state.',
    'sigrika-standard-source-event-skeleton-v1 source-binds the first fixed trigger to Elucidated at zero-based step index 4 and the fixed Echo Skill DMG checkpoints to indexes 4/5/6/10/11/12, but assigns no timestamps.',
    'The shared 5-second state can therefore be opened from a real canonical damage event once a timeline exists, but current source order alone cannot resolve its action coverage.',
  ),
  primitiveAvailable(
    'team:qiuyuan:outro-echo-skill-amplification-incoming-state-adapter',
    'team:qiuyuan-sigrika-incoming-state',
    'character-outro-incoming-transfer-v1',
    'Qiuyuan Outro source-proves 50% Echo Skill DMG Amplification to the incoming Resonator for 14 seconds or until that Resonator switches out.',
    'Current named-team rotation sources prove Qiuyuan switches to Sigrika via Outro, so the transfer is source-proven active at Sigrika entry.',
    'sigrika-standard-source-event-skeleton-v1 now provides fixed Sigrika action order after entry but no seconds-elapsed values; exact 14-second action coverage therefore remains unresolved.',
    'Entry proof plus event order does not authorize blanket full-rotation coverage.',
  ),
  blocked(
    'rotation:sigrika-standard-source-sequence:denominator-timeline-adapter',
    'rotation:sigrika-standard-denominator-timeline',
    'Prydwen preserves Chain Whip cancel on hit via Ultimate and Outburst cancel via Hold Skill as sequence semantics. Current Prydwen also says the Summon may be cast at any point, so it does not provide one fixed Echo timestamp.',
    'ArabWuwa publishes a tested 12.75s Sigrika block, but its measured/calculation action set fixes an Echo step and exposes only one explicit Enhanced Basic/Elucidated while Prydwen canonical contains two Elucidated checkpoints. The measured 12.75s block is therefore neither the exact canonical action set nor a safe canonical upper bound for 14s/15s window coverage.',
    'sigrika-standard-source-event-skeleton-v1 closes event identity/order only: all exactTimestampSeconds remain null and Bellibing still lacks a source-backed denominator.',
  ),
] as const);
