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
    'Canonical execution still requires exact event timestamps so Convergent/Divergent/Decipher lifetime checks are not inferred.',
  ),
  primitiveAvailable(
    'character:sigrika:decipher-elucidated-eligibility-adapter',
    'character:sigrika-decipher-elucidated-eligibility',
    'sigrika-resource-state-v1',
    'Basic 4 -> Decipher for 5 seconds, switch-out termination and Elucidated availability are source-proven.',
    'sigrika-resource-state-v1 exposes timestamped Decipher entry and Elucidated eligibility; no five-second overlap is assumed without a caller timeline.',
  ),
  primitiveAvailable(
    'character:sigrika:runic-heavy-branch-selection-adapter',
    'character:sigrika-runic-heavy-branch-selection',
    'sigrika-resource-state-v1',
    'Current source explicitly maps Trust+Trust -> Runic Chain Whip, Trust+Answer -> Runic Outburst and Answer+Answer -> Runic Soliskin after consuming two Runes.',
    'The primitive resolves the exact two-Rune branch and keeps multiplier increase versus DMG Amplification as separate source semantics.',
    'The canonical profile still needs timestamped Rune-producing events; no branch is injected from the source-sequence label alone.',
  ),
  primitiveAvailable(
    'character:sigrika:learn-my-true-name-full-stop-adapter',
    'character:sigrika-learn-my-true-name-full-stop',
    'sigrika-resource-state-v1',
    'Schemata grants +50 Full Stop up to 100. At 100, Hold Skill consumes all Full Stop to cast Learn My True Name; current source lists a 25-second cooldown.',
    'The primitive models gain, exact eligibility, consume-all and cooldown state without assigning canonical timestamps.',
  ),
  primitiveAvailable(
    'character:sigrika:innate-gift-damage-amplification-adapter',
    'character:sigrika-innate-gift-damage-amplification',
    'sigrika-resource-state-v1',
    'At >=30 Soliskin Vitality, Schemata consumes 30, increases the current Runic multiplier by 50% and grants one Innate Gift stack; lower Vitality consumes all and grants 15% DMG Amplification per 10 consumed.',
    'Innate Gift remains max 2 at S0, grants 30% DMG Amplification per stack to the source-listed Runic/Learn actions, and clears on Learn My True Name or switch-out.',
    'The primitive preserves multiplier increase and DMG Amplification as different outputs and does not assume predecessor Echo-cast Vitality.',
  ),
  primitiveAvailable(
    'character:sigrika:blessing-of-runes-echo-skill-state-adapter',
    'character:sigrika-blessing-of-runes-state',
    'sigrika-resource-state-v1',
    'Nearby-team Echo Skill casts source-prove Soliskin Vitality +10 and Blessing of Runes +1 with same-name once-only records; Blessing caps at 6 and resets on lineup change, while the Vitality trigger record resets on Sigrika Outro.',
    'The primitive models the two trigger records separately, Blessing stack bonuses and the ER-over-125% conversion formula.',
    'No canonical predecessor Echo Skill event, Echo name or timing is invented; the profile still needs an executable team timeline.',
  ),
  primitiveAvailable(
    'weapon:solsworn-ciphers:SCIP-ECHO-AMP:echo-intro-cast-window-adapter',
    'weapon:solsworn-ciphers-echo-amplification-window',
    'weapon-cast-timed-self-window-v1',
    'SCIP-ECHO-AMP is source-exact at R1: +32% Echo Skill DMG Amplification for 15 seconds after Intro Skill or Echo Skill cast.',
    'weapon-cast-timed-self-window-v1 has an explicit SCIP-ECHO-AMP contract for INTRO_SKILL_CAST and ECHO_SKILL_CAST.',
    'Canonical Intro proves a valid trigger in sequence order, but no exact timestamp/window overlap is inferred.',
  ),
  primitiveAvailable(
    'weapon:solsworn-ciphers:SCIP-AERO-DEF:echo-skill-damage-window-adapter',
    'weapon:solsworn-ciphers-aero-def-ignore-window',
    'weapon-damage-timed-self-window-v1',
    'SCIP-AERO-DEF is source-exact at R1: Aero DMG ignores 10% DEF for 6 seconds after dealing Echo Skill DMG.',
    'weapon-damage-timed-self-window-v1 opens only from an explicit ECHO_SKILL_DAMAGE event and preserves the source Aero-only damage condition.',
    'An executable Echo Skill damage timestamp is still required; selecting the weapon does not authorize blanket uptime.',
  ),
  primitiveAvailable(
    'sonata:sonata-29:S29_5PC_ECHO_CR:echo-skill-damage-window-adapter',
    'sonata:sound-of-true-name-echo-skill-damage-window',
    'sonata-damage-timed-self-window-v1',
    'Sound of True Name 5P grants +20% Echo Skill CRIT Rate for 5 seconds after dealing Echo Skill DMG.',
    'sonata-damage-timed-self-window-v1 requires an explicit ECHO_SKILL_DAMAGE event; equipment selection alone grants no state.',
  ),
  primitiveAvailable(
    'sonata:sonata-29:S29_5PC_AERO:echo-skill-damage-window-adapter',
    'sonata:sound-of-true-name-echo-skill-damage-window',
    'sonata-damage-timed-self-window-v1',
    'Sound of True Name 5P grants +15% Aero DMG Bonus for the same 5-second Echo Skill damage-triggered state.',
    'sonata-damage-timed-self-window-v1 requires an explicit ECHO_SKILL_DAMAGE event; equipment selection alone grants no state.',
  ),
  primitiveAvailable(
    'team:qiuyuan:outro-echo-skill-amplification-incoming-state-adapter',
    'team:qiuyuan-sigrika-incoming-state',
    'character-outro-incoming-transfer-v1',
    'Qiuyuan Outro source-proves 50% Echo Skill DMG Amplification to the incoming Resonator for 14 seconds or until that Resonator switches out.',
    'character-outro-incoming-transfer-v1 models the source 14-second cap and explicit incoming switch-out termination without assuming a predecessor event.',
    'The Sigrika source sequence still contains no Qiuyuan predecessor timeline proving outgoing Qiuyuan, incoming Sigrika or the trigger time; Qiuyuan Bamboo\'s Shade remains a separate predecessor-state concern.',
  ),
  primitiveAvailable(
    'team:ciaccona:solo-concert-aero-bonus-incoming-state-adapter',
    'team:ciaccona-sigrika-incoming-state',
    'ciaccona-solo-concert-external-team-state-v1',
    'Ciaccona Solo Concert source-proves a non-stackable 24% Aero DMG Bonus for nearby team Resonators while raw durationSeconds remains null.',
    'ciaccona-solo-concert-external-team-state-v1 projects only an explicit point-in-time active snapshot supplied by the external Ciaccona execution owner; it does not create, persist, refresh or expire Solo Concert.',
    'The Sigrika source sequence still contains no Ciaccona predecessor timeline proving such a snapshot at Sigrika action times, so the dependency remains open and timeline-required without any Ciaccona engine modification.',
  ),
  blocked(
    'rotation:sigrika-standard-source-sequence:denominator-timeline-adapter',
    'rotation:sigrika-standard-denominator-timeline',
    'Prydwen preserves Chain Whip cancel on hit via Ultimate and Outburst cancel via Hold Skill as sequence semantics. Current Prydwen also says the Summon may be cast at any point, so it does not provide one fixed Echo timestamp.',
    'ArabWuwa publishes a tested 12.75s Sigrika action sequence, but it is an external tested rotation and not an exact timestamped canonical Qiuyuan+Ciaccona predecessor/rotation contract. Bellibing therefore keeps exact denominator/timestamps parked rather than silently treating the tested duration as a source-exact frame model.',
  ),
] as const);
