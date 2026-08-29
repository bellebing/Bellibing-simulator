import type { CharacterMechanicsProfile } from '../../characterMechanicsDomain.ts';
import { LUCY_CHARACTER_MECHANIC_FACTS, LUCY_PROVENANCE } from './lucyRawFacts.ts';
import { REBECCA_CHARACTER_MECHANIC_FACTS, REBECCA_PROVENANCE } from './rebeccaRawFacts.ts';
import { ZANI_CHARACTER_MECHANIC_FACTS, ZANI_PROVENANCE } from './zaniRawFacts.ts';
import { LUUK_HERSSEN_CHARACTER_MECHANIC_FACTS, LUUK_HERSSEN_PROVENANCE } from './luukHerssenRawFacts.ts';
import {
  LUCY_TUNE_BREAK_FACT,
  REBECCA_TUNE_BREAK_FACT,
  ZANI_TUNE_BREAK_FACT,
  LUUK_HERSSEN_TUNE_BREAK_FACT,
} from './finalFourTuneBreakFacts.ts';

function coverage(
  actions: string,
  forte: string,
  inherent: string,
  outro: string,
  resources: string,
): CharacterMechanicsProfile['coverage'] {
  return [
    { area: 'ACTIONS', status: 'VERIFIED', notes: actions },
    { area: 'FORTE_RULES', status: 'VERIFIED', notes: forte },
    { area: 'INHERENT_PASSIVES', status: 'VERIFIED', notes: inherent },
    { area: 'OUTRO_EFFECT', status: 'VERIFIED', notes: outro },
    { area: 'RESOURCE_RULES', status: 'VERIFIED', notes: resources },
    { area: 'SEQUENCES', status: 'VERIFIED', notes: 'Exact current S1-S6 raw source text and numeric parameter payloads are source-audited; unresolved placeholder position is preserved rather than guessed.' },
  ];
}

function provenanceNotes<T extends { notes: readonly string[] }>(provenance: T): readonly string[] {
  return [
    ...provenance.notes,
    'Source-level raw mechanics coverage is complete for all six required Character Mechanics areas, including one current shared-system Tune Break fact.',
    'HACK and SPECTRO_FRAZZLE are source-facing Character damage taxonomy only. Simultaneous damageClasses preserve source truth and do not imply additive execution of multiple damage-bonus buckets.',
    'Generated review artifacts remain transcription/numeric inputs only; semantic verification was performed against current kit sources before canonical promotion.',
    'MODEL_READY/RAW_ONLY/PENDING_INTERPRETATION remain independent from source VERIFIED coverage. No broad Character DPS, Hack/Frazzle combat system, shared Tune Break formula or UI behavior is added by this promotion.',
  ];
}

export const LUCY_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'lucy',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    'Locked Thread, Algorithm Compaction, Protocol Breach, Netrunner, Intro and Data Crash actions retain exact source representations. Thread Shredding/Protocol Interface damage-bucket overrides are explicit; Cripple Movement and Hack Response - Data Crash are source-explicit HACK damage. Shared Tune Break Data Crash remains a separate system-owned action without a fabricated Character coefficient.',
    'TCP, Root Access, SQL, RAM, Algorithm Compaction/Cloud Portal and Data Crash state/control rules are source-audited without assuming rotation cadence or Hack-system execution.',
    'Ghost Cyberware and Function Cracking are source-audited; Network Backdoor/Hack interactions remain raw effect semantics.',
    'Countermeasure Program preserves incoming 25% Basic Attack DMG Amplification plus source-conditional team branches; no uptime or switching model is inferred.',
    'TCP max 100 and Root Access max 100 are explicit; SQL/RAM source lifetimes are preserved without inventing unsupported persistent caps.',
  ),
  factIds: [...LUCY_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), LUCY_TUNE_BREAK_FACT.factId],
  provenance: { ...LUCY_PROVENANCE, notes: provenanceNotes(LUCY_PROVENANCE) },
};

export const REBECCA_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'rebecca',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    "Huntress/Guts, Tactical Dodge, Tactical Tweaks, Party 'til Dawn!, Intro and Forte actions retain exact source structures. Heavy Attack - Huntress and Forte Heavy replacements are source-explicit Basic Attack DMG; Eat Lead!: Huntress remains Heavy Attack DMG from the reviewed source row. Hack Response - Meltdown is HACK damage. The fixed 2.5% ATK Outro turret hit is separate from its bond/amplification state.",
    "Fervor/Hot Hand, Huntress/Guts switching, A Girl Gets What She Wants!, Overload and Hack - Shifting rules are source-audited without inferring state uptime or turret cadence.",
    'Tag, You’re It! and Left an Opening! are source-audited; Tune Break Boost and team-ATK effects remain raw effect semantics.',
    'Preem Choom / Edgerunner Bonds preserves the 14s turret and incoming 15% All DMG Amplification/Overlimit behavior; each fixed turret hit remains a separate Character ACTION fact.',
    'Fervor max 120, Hot Hand max 120 and Overload max 90 plus source generation/consumption rules are explicit.',
  ),
  factIds: [...REBECCA_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), REBECCA_TUNE_BREAK_FACT.factId],
  provenance: { ...REBECCA_PROVENANCE, notes: provenanceNotes(REBECCA_PROVENANCE) },
};

export const ZANI_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'zani',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    'Routine Negotiation, Restless Watch, Between Dawn and Dusk, Intro and Forte actions retain exact source representations. Targeted Action/Forcible Riposte are source-explicit Spectro Frazzle DMG. Inferno Heavy Slash forms preserve simultaneous HEAVY + SPECTRO_FRAZZLE classification without inventing a primary class, and Beacon For the Future preserves its source-fixed 150% ATK Spectro Frazzle hit. Shared Tune Break: Gauntlets remains separate.',
    'Redundant Energy, Blaze, Heliacal Ember, Sunburst and Inferno Mode/Heavy Slash rules are source-audited. Basic Attack Multiplier Increase and Additional Multiplier Per Blaze remain modifiers rather than duplicated damage actions.',
    'Quick Response and Fear No Pain are source-audited without executable state/uptime assumptions.',
    'Beacon For the Future keeps its fixed Spectro Frazzle damage action separate from the 20% team Spectro amplification against the marked target.',
    'Redundant Energy max 100, Blaze max 150 in Inferno Mode and Heliacal Ember max 60 are explicit; source conversion/consumption semantics remain raw.',
  ),
  factIds: [...ZANI_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), ZANI_TUNE_BREAK_FACT.factId],
  provenance: { ...ZANI_PROVENANCE, notes: provenanceNotes(ZANI_PROVENANCE) },
};

export const LUUK_HERSSEN_CHARACTER_MECHANICS_PROFILE: CharacterMechanicsProfile = {
  characterId: 'luuk-herssen',
  verificationStatus: 'VERIFIED',
  coverage: coverage(
    "Such is Light, Golden Reflux/Aureole, Rewritten in Winter's Margins, Intro, Gavel and Outro retain exact source representations. Aureole-derived hits, Golden Impale, Ichor Deposit, Liberation and Gavel keep source-explicit Basic Attack DMG classification. Ichor Blade is literal fixed 10 damage with FIXED scaling and no fabricated ATK coefficient; Bow to the Last Light is source-fixed 500% ATK. Shared Silent Debate of Light Tune Break remains separate.",
    'Ichor Flow, Aureate Judge, Endnotes, Golden Rule, Radiant Reave/Ichor Blade and Dawnlit Keep transitions are source-audited without inferring airborne, cooldown or resource cadence.',
    'Pulses Under the Snow and Uncaused Diagnosis are source-audited; Tune Strain/Tune Break interactions remain raw shared-system semantics.',
    'Bow to the Last Light preserves its fixed 500% ATK Character hit; no talent-level curve is fabricated.',
    'Ichor Flow max 300, Endnotes max 3, Dawnlit Keep max 1 and Perpetuating Daytime max 2 are explicit with current source gain/consume rules.',
  ),
  factIds: [...LUUK_HERSSEN_CHARACTER_MECHANIC_FACTS.map((fact) => fact.factId), LUUK_HERSSEN_TUNE_BREAK_FACT.factId],
  provenance: { ...LUUK_HERSSEN_PROVENANCE, notes: provenanceNotes(LUUK_HERSSEN_PROVENANCE) },
};

export const FINAL_FOUR_CHARACTER_MECHANICS_PROFILES: readonly CharacterMechanicsProfile[] = [
  LUCY_CHARACTER_MECHANICS_PROFILE,
  REBECCA_CHARACTER_MECHANICS_PROFILE,
  ZANI_CHARACTER_MECHANICS_PROFILE,
  LUUK_HERSSEN_CHARACTER_MECHANICS_PROFILE,
] as const;
