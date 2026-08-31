export const CHIXIA_STANDARD_EXECUTION_BLOCKER_ID = 'BUG-015';

export const CHIXIA_STANDARD_ROTATION_EXECUTION_REVIEW_20260831 = {
  reviewId: 'ROTATION-EXECUTION-CHIXIA-2026-08-31-01',
  rotationId: 'chixia-standard-rotation',
  checkedAt: '2026-08-31',
  disposition: 'SOURCE_SEMANTICS_BLOCKED',
  blockerId: CHIXIA_STANDARD_EXECUTION_BLOCKER_ID,
  rotationSeconds: null,
  reviewedPendingExecutionIds: [
    'weapon:the-last-dance:TLD-SKILL:trigger-uptime-adapter',
    'sonata:sonata-2:S02_5PC_FUSION:trigger-uptime-adapter',
    'echo:echo-60000915:nightmare-inferno-rider-active-skill-damage-adapter',
    'rotation:chixia-standard-rotation:engine-model',
  ],
  sourceLabels: [
    'Prydwen — Chixia current build/gameplay',
    'Bellibing canonical Character Mechanics — Chixia',
    'Bellibing audited The Last Dance / Molten Rift effects',
    'Arab Wuwa + raw damage mirror — Nightmare: Inferno Rider Rank-5 active data',
    'Bellibing canonical Character Mechanics — Lupa / Brant',
  ],
  sourceUrls: [
    'https://www.prydwen.gg/wuthering-waves/characters/chixia',
    'https://arabwuwa.com/echoes/nightmare-inferno-rider/',
    'https://wiki.bittopup.com/vi/wuthering/monsters/330000190',
  ],
  sourceEstablished: [
    'The canonical source sequence is Echo -> Intro -> 30-bullet DAKA DAKA -> Boom Boom -> Resonance Liberation -> 30-bullet DAKA DAKA -> Boom Boom -> Outro.',
    'Prydwen explicitly publishes 4 seconds for one full DAKA DAKA execution and instructs exactly 30 Thermobaric Bullets per channel; the supported Burst Combo contains two such channels.',
    'Numbingly Spicy! grants 1% ATK for 10 seconds per Thermobaric Bullet hit during DAKA DAKA, up to 30 stacks; the raw trigger/value/lifetime are verified while executable cross-action overlap is not.',
    'The Last Dance R1 opens a 5-second SELF Resonance Skill DMG window after Intro or Resonance Liberation; weapon-cast-timed-self-window-v1 already owns this generic mechanic.',
    'Molten Rift 5-piece opens a 15-second SELF Fusion DMG window after Resonance Skill; sonata-cast-timed-self-window-v1 already owns this generic mechanic.',
    'Nightmare: Inferno Rider has exact Rank-5 normal activation damage of one 405% ATK Fusion hit with a 25-second cooldown, while Hold Echo Skill enters the distinct Riding Mode and exits with 283.50% Fusion damage.',
    'The canonical Chixia source explicitly places Echo before Intro, but says to refer to the chosen Echo for exact specifics rather than selecting normal activation versus Hold/Riding Mode in the fixed sequence.',
    'Current Chixia source describes Brant as amplifying Chixia Fusion and Resonance Skill damage by 20% and 25% respectively and identifies Lupa + Brant as the newest best-team archetype.',
    'The exact chixia-standard stat target has gates=[]; no numeric Energy Regen gate is materialized for this S0 supported context.',
  ],
  unresolvedSemantics: [
    'No exact source-backed total duration exists for the complete canonical Burst Combo. Two known 4-second channels do not establish the duration of Echo, Intro, Boom Boom, Resonance Liberation, Outro, or the inter-action gaps, so a Personal Rotation DPS denominator cannot be derived.',
    'Exact event timing is still required to prove which Skill hits overlap The Last Dance 5-second windows and whether first-channel Numbingly Spicy! stacks remain active across Resonance Liberation and the second channel. Bellibing must not invent per-bullet frames or inter-action delays.',
    'The canonical Echo step does not resolve normal activation versus Hold/Riding Mode for Nightmare: Inferno Rider. Exact normal attack data therefore does not authorize profile active damage by itself.',
    'The canonical Chixia profile names Lupa + Brant but does not encode the predecessor execution timeline needed to prove exact 14-second Outro-transfer coverage, Lupa 35-second team-state coverage, or Lupa target-category-dependent Fusion bonuses for one combat benchmark.',
    'The source endgame recommendation shows 115%+ Energy Regen under general 4-star/free-character recommendation defaults, not an exact S0 Chixia + Lupa + Brant gate. No mandatory numeric ER threshold is promoted.',
  ],
  closesPendingExecutionIds: [],
} as const;

export const CHIXIA_NIGHTMARE_INFERNO_RIDER_ACTIVE_DAMAGE_SEMANTIC_REVIEW_20260831 = {
  pendingExecutionId: 'echo:echo-60000915:nightmare-inferno-rider-active-skill-damage-adapter',
  status: 'BLOCKED_SOURCE_SEMANTICS',
  actionKey: 'echo:nightmare-inferno-rider-cast-variant-resolution',
  reviewedAt: CHIXIA_STANDARD_ROTATION_EXECUTION_REVIEW_20260831.checkedAt,
  blockerId: CHIXIA_STANDARD_EXECUTION_BLOCKER_ID,
  notes: [
    'Exact Rank-5 normal ACTIVE_CAST damage is safe attack data and can use echo-active-damage-v1 after a rotation selects that variant.',
    'The supported Chixia source sequence only says Echo before combo and delegates exact Echo specifics; Nightmare: Inferno Rider separately supports normal activation and Hold/Riding Mode.',
    'No profile execution chooses normal activation until source truth or an explicitly approved supported variant rule resolves the cast mode.',
  ],
} as const;
