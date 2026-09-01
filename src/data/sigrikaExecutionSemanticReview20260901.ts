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

function implementationPending(pendingExecutionId: string, actionKey: string, ...notes: readonly string[]) {
  return {
    pendingExecutionId,
    status: 'SEMANTICALLY_REVIEWED_IMPLEMENTATION_PENDING' as const,
    actionKey,
    reviewedAt: REVIEWED_AT,
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
  blocked(
    'character:sigrika:rune-lifecycle-adapter',
    'character:sigrika-rune-lifecycle',
    'Rune: Trust/Answer identity, cap and left-shift behavior are source-proven raw facts.',
    'Current reviewed source does not expose one event-complete duration/consume/overwrite lifecycle sufficient for execution.',
  ),
  blocked(
    'character:sigrika:decipher-elucidated-eligibility-adapter',
    'character:sigrika-decipher-elucidated-eligibility',
    'Basic 4 -> Decipher for 5 seconds and Decipher enabling Elucidated are source-proven raw facts.',
    'Exact executable state entry/expiry/field-switch termination and Rune grant ordering remain unimplemented behind the broader Rune lifecycle.',
  ),
  blocked(
    'character:sigrika:runic-heavy-branch-selection-adapter',
    'character:sigrika-runic-heavy-branch-selection',
    'Runic Chain Whip and Runic Outburst have exact source motion-value curves.',
    'The canonical sequence names each branch, but source-complete Rune selection/consumption state must prove eligibility before the action can execute.',
  ),
  blocked(
    'character:sigrika:learn-my-true-name-full-stop-adapter',
    'character:sigrika-learn-my-true-name-full-stop',
    'Full Stop max 100 and Learn My True Name availability at 100 subject to cooldown are source-proven raw facts.',
    'The exact executable Full Stop gain/consume/cooldown lifecycle is not source-complete in the current raw state contract.',
  ),
  blocked(
    'character:sigrika:innate-gift-damage-amplification-adapter',
    'character:sigrika-innate-gift-damage-amplification',
    'Base Innate Gift max 2 and +30% DMG Amplification per stack for the source-listed Runic/Learn My True Name actions are source-proven raw facts.',
    'Stack creation and exact per-event lifetime state are not executable in the canonical timeline.',
  ),
  blocked(
    'character:sigrika:blessing-of-runes-echo-skill-state-adapter',
    'character:sigrika-blessing-of-runes-state',
    'Nearby-team Echo Skill casts, the 6-stack bonuses and the Energy Regen conversion clause are source-proven raw mechanics.',
    'The canonical Sigrika sequence does not provide the predecessor/team Echo Skill event timeline or a complete lifetime contract for this state.',
  ),
  primitiveAvailable(
    'weapon:solsworn-ciphers:SCIP-ECHO-AMP:echo-intro-cast-window-adapter',
    'weapon:solsworn-ciphers-echo-amplification-window',
    'weapon-cast-timed-self-window-v1',
    'SCIP-ECHO-AMP is source-exact at R1: +32% Echo Skill DMG Amplification for 15 seconds after Intro Skill or Echo Skill cast.',
    'weapon-cast-timed-self-window-v1 now has an explicit SCIP-ECHO-AMP contract for INTRO_SKILL_CAST and ECHO_SKILL_CAST.',
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
  implementationPending(
    'team:qiuyuan:outro-echo-skill-amplification-incoming-state-adapter',
    'team:qiuyuan-sigrika-incoming-state',
    'Qiuyuan Outro source-proves 50% Echo Skill DMG Amplification to the incoming Resonator for 14 seconds or until that Resonator switches out; his Forte also has a source-proven team Echo Skill bonus state.',
    'The current incoming-transfer-state-v1 primitive does not own Character-layer early switch-out termination, and the Sigrika source sequence contains no Qiuyuan predecessor timeline proving outgoing actor, incoming Sigrika, trigger time or Forte state.',
  ),
  implementationPending(
    'team:ciaccona:solo-concert-aero-bonus-incoming-state-adapter',
    'team:ciaccona-sigrika-incoming-state',
    'Ciaccona Solo Concert source-proves a non-stackable 24% Aero DMG Bonus for nearby team Resonators.',
    'The Sigrika source sequence contains no Ciaccona predecessor timeline proving Solo Concert state at Sigrika entry; Ciaccona execution ownership stays external.',
  ),
  blocked(
    'profile:sigrika-standard:energy-regen-hard-gate-adapter',
    'profile:sigrika-standard-energy-regen-hard-gate',
    'The canonical stat target preserves the current team-dependent 109%-119% Energy Regen guidance.',
    'Without the exact Sigrika/Qiuyuan/Ciaccona energy/predecessor timeline there is no source-backed single minimum to promote as a hard gate.',
  ),
  blocked(
    'rotation:sigrika-standard-source-sequence:denominator-timeline-adapter',
    'rotation:sigrika-standard-denominator-timeline',
    'The source preserves Chain Whip cancel on hit via Ultimate and Outburst cancel via Hold Skill as sequence semantics.',
    'No exact total duration or approved measurement-derived timestamps exist, so frames and the DPS denominator remain parked.',
  ),
] as const);
