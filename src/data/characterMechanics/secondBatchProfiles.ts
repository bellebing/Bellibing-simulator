import type { CharacterMechanicsProfile } from '../../characterMechanicsDomain.ts';
import {
  CHANGLI_CHARACTER_MECHANIC_FACTS,
  CHANGLI_PROVENANCE,
} from './changliRawFacts.ts';
import {
  JIYAN_CHARACTER_MECHANIC_FACTS,
  JIYAN_PROVENANCE,
} from './jiyanRawFacts.ts';
import {
  CHANGLI_TUNE_BREAK_FACT,
  JIYAN_TUNE_BREAK_FACT,
} from './tuneBreakFacts.ts';

export const CHANGLI_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'changli',
  verificationStatus: 'VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'Basic/Heavy/Mid-air/Dodge, Tripartite Flames/True Sight, Radiance of Fealty, Intro and Flaming Sacrifice carry exact current Lv1-Lv10 source representations. True Sight: Conquest/Charge and Flaming Sacrifice preserve the explicit Resonance Skill DMG bucket. Tune Break: Sword remains shared-system damage.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'True Sight acquisition/termination, Tripartite Flames charge rules, Enflamement max/gain/consume rules, Fiery Feather and Flaming Sacrifice gating are source-audited; executable state timing remains separate.' },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: 'Secret Strategist and Sweeping Force are source-audited without inventing unstated durations.' },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: 'Strategy of Duality 20% Fusion DMG Amplification + 25% Resonance Liberation DMG Amplification / 10s / switch-out termination is source-audited.' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: 'Enflamement max 4 and Tripartite Flames max 2 charges, recharge cadence, gain and Flaming Sacrifice consumption are source-audited.' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 raw mechanics are source-audited; sequence execution remains separate from raw coverage.' },
  ],
  factIds: [
    ...CHANGLI_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId),
    CHANGLI_TUNE_BREAK_FACT.factId,
  ],
  provenance: {
    ...CHANGLI_PROVENANCE,
    notes: [
      ...CHANGLI_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas. Tune Break carries independent shared-system provenance and no Changli-specific Tune Break coefficient is fabricated.',
      'Fiery Feather source text gives a 10-second window in which Flaming Sacrifice can trigger the 25% ATK increase, but does not separately state a post-trigger ATK-buff duration; that execution detail remains PENDING_INTERPRETATION instead of being guessed.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Changli rotation/DPS adapter or shared Tune Break damage formula is implied by this profile.',
    ],
  },
};

export const JIYAN_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'jiyan',
  verificationStatus: 'VERIFIED',
  coverage: [
    { area: 'ACTIONS', status: 'VERIFIED', notes: 'Lone Lance Basic/Heavy/Mid-air/Dodge branches, Windqueller, Lance of Qingloong, Intro, Emerald Storm: Finale, non-damaging Prelude and source-fixed Discipline are source-audited. Lance/Finale preserve explicit Heavy Attack DMG classification; Discipline preserves coordinated-attack semantics. Tune Break: Broadblade remains shared-system damage.' },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: 'Resolve max/gain/decay, 30-Resolve Windqueller/Finale branches and Qingloong-mode no-cost Windqueller branch are source-audited; executable combat-state timing remains separate.' },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: 'Heavenly Balance and Tempest Taming are source-audited.' },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: 'Discipline is source-audited as fixed 313.40% Jiyan ATK coordinated damage over an 8s window, triggered by incoming-character Heavy Attack hits once per 1s and at most twice.' },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: 'Resolve max 60, source-listed acquisition, 15-second no-hit decay trigger and conditional consumption rules are source-audited.' },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 raw mechanics are source-audited; Momentum execution and sequence-aware combat behavior remain separate from raw coverage.' },
  ],
  factIds: [
    ...JIYAN_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId),
    JIYAN_TUNE_BREAK_FACT.factId,
  ],
  provenance: {
    ...JIYAN_PROVENANCE,
    notes: [
      ...JIYAN_PROVENANCE.notes,
      'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas. Tune Break carries independent shared-system provenance and no Jiyan-specific Tune Break coefficient is fabricated.',
      'Emerald Storm: Prelude is source-verified as a state transition with no owned damage coefficient; Bellibing therefore keeps it NON_DAMAGE instead of conflating it with Emerald Storm: Finale.',
      'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage; no Jiyan rotation/DPS adapter or shared Tune Break damage formula is implied by this profile.',
    ],
  },
};

export const SECOND_BATCH_CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [
  CHANGLI_CHARACTER_MECHANICS_PROFILE,
  JIYAN_CHARACTER_MECHANICS_PROFILE,
] as const;
