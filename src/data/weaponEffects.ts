import type {
  RankValues,
  WeaponEffectAppliesTo,
  WeaponEffectData,
  WeaponEffectMechanicsStatus,
  WeaponEffectSimulatorMode,
  WeaponEffectType,
  WeaponEffectValueUnit,
} from '../effectDomain.ts';

interface EffectRow {
  effectId: string;
  weaponId: string;
  statOrEffect: string;
  rankValues: RankValues;
  valueUnit?: WeaponEffectValueUnit;
  effectType: WeaponEffectType;
  trigger: string;
  durationSeconds: number | null;
  triggerCooldownSeconds?: number | null;
  maxStacks: number;
  stackIntervalSeconds?: number;
  appliesTo: WeaponEffectAppliesTo;
  conditions?: readonly string[];
  simulatorMode: WeaponEffectSimulatorMode;
  sourceEffectText?: string | null;
  notes: string;
  mechanicsStatus?: WeaponEffectMechanicsStatus;
  conditionalAudit?: boolean;
  sourceLabels?: readonly string[];
  sourceUrls?: readonly string[];
  checkedAt?: string;
  provenanceNotes?: readonly string[];
}

function e(row: EffectRow): WeaponEffectData {
  const {
    conditionalAudit = false,
    sourceLabels,
    sourceUrls,
    checkedAt,
    provenanceNotes,
    ...effect
  } = row;

  return {
    ...effect,
    valueUnit: effect.valueUnit ?? 'DECIMAL_MULTIPLIER',
    triggerCooldownSeconds: effect.triggerCooldownSeconds ?? null,
    stackIntervalSeconds: effect.stackIntervalSeconds ?? 0,
    conditions: effect.conditions ?? [],
    sourceEffectText: effect.sourceEffectText ?? null,
    mechanicsStatus: effect.mechanicsStatus
      ?? (conditionalAudit ? 'VERIFIED_CONDITIONAL' : 'VERIFIED_MODELED'),
    provenance: {
      sourceLabels: sourceLabels ?? (conditionalAudit
        ? ['V9.15 Weapon Effects', 'Prydwen', 'Wutheringlab']
        : ['V9.15 Weapon Effects', 'Maygi', 'Prydwen', 'Wutheringlab']),
      sourceUrls: sourceUrls ?? [
        'https://docs.google.com/spreadsheets/d/1E_6YNe3OED6kihXWK6IQ8D-DcwdkuuAXvlG3ZtgkbP0/edit',
      ],
      checkedAt: checkedAt ?? (conditionalAudit ? '2026-08-20' : '2026-07-18'),
      notes: provenanceNotes ?? [
        'Migrated from the V9.15 Weapon Effects audit. Trigger text is data, not an automatic uptime assumption.',
      ],
    },
  };
}

const R_12_24 = [.12, .15, .18, .21, .24] as const;
const R_24_48 = [.24, .30, .36, .42, .48] as const;

/**
 * Source-audited Weapon Effects only.
 *
 * The catalog began with the V9.15 modeled/conditional subset and is now being
 * completed against the full current released roster. A weapon missing here is
 * tracked explicitly by weaponEffectAudit.ts; absence never means zero passive.
 */
export const WEAPON_EFFECT_CATALOG: readonly WeaponEffectData[] = [
  e({ effectId: 'FF-ATK', weaponId: 'freeze-frame', statOrEffect: 'ATK%', rankValues: R_12_24, effectType: 'PERMANENT', trigger: 'Passive', durationSeconds: null, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'ALWAYS', notes: 'Permanent ATK increase.' }),
  e({ effectId: 'FF-GLACIO', weaponId: 'freeze-frame', statOrEffect: 'Glacio DMG', rankValues: [.30, .375, .45, .525, .60], effectType: 'TRIGGERED', trigger: 'Inflict Glacio Chafe', durationSeconds: 12, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'RECOMMENDED', notes: 'Recommended rotation assumes this activates.' }),
  e({ effectId: 'FF-TEAM-ATK', weaponId: 'freeze-frame', statOrEffect: 'ATK%', rankValues: R_24_48, effectType: 'TRIGGERED', trigger: 'Inflict Glacio Chafe', durationSeconds: 30, maxStacks: 1, appliesTo: 'TEAM', simulatorMode: 'RECOMMENDED', notes: 'Same-name team effect does not stack.' }),

  e({ effectId: 'AO-ATTR', weaponId: 'azure-oath', statOrEffect: 'All Attribute DMG', rankValues: R_12_24, effectType: 'PERMANENT', trigger: 'Passive', durationSeconds: null, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'ALWAYS', notes: "Applies to the wielder's attribute damage." }),
  e({ effectId: 'AO-HEAVY-AMP', weaponId: 'azure-oath', statOrEffect: 'Heavy Attack DMG Amplification', rankValues: [.36, .45, .54, .63, .72], effectType: 'TRIGGERED', trigger: 'Havoc Bane', durationSeconds: 8, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'RECOMMENDED', notes: 'Recommended Xuanling rotation assumption.' }),
  e({ effectId: 'AO-DEF', weaponId: 'azure-oath', statOrEffect: 'DEF Ignore', rankValues: R_12_24, effectType: 'TRIGGERED', trigger: 'Havoc Bane', durationSeconds: 8, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'RECOMMENDED', notes: 'Recommended Xuanling rotation assumption.' }),

  e({ effectId: 'SM-ATTR', weaponId: 'stringmaster', statOrEffect: 'All Attribute DMG', rankValues: R_12_24, effectType: 'PERMANENT', trigger: 'Passive', durationSeconds: null, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'ALWAYS', notes: 'Permanent attribute damage bonus.' }),
  e({ effectId: 'SM-ATK', weaponId: 'stringmaster', statOrEffect: 'ATK%', rankValues: R_12_24, effectType: 'STACKING', trigger: 'Resonance Skill', durationSeconds: 5, maxStacks: 2, appliesTo: 'SELF', simulatorMode: 'RECOMMENDED', notes: 'Recommended assumes two active stacks.' }),

  e({ effectId: 'LE-ATK', weaponId: 'lethean-elegy', statOrEffect: 'ATK%', rankValues: R_12_24, effectType: 'PERMANENT', trigger: 'Passive', durationSeconds: null, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'ALWAYS', notes: 'Permanent ATK increase.' }),
  e({ effectId: 'LE-SKILL', weaponId: 'lethean-elegy', statOrEffect: 'Resonance Skill DMG', rankValues: [.32, .40, .48, .56, .64], effectType: 'TRIGGERED', trigger: 'Deal Echo Skill DMG', durationSeconds: 12, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'RECOMMENDED', notes: 'Counted when the recommended rotation activates it.' }),
  e({ effectId: 'LE-ECHO', weaponId: 'lethean-elegy', statOrEffect: 'Echo Skill DMG Amplification', rankValues: [.32, .40, .48, .56, .64], effectType: 'TRIGGERED', trigger: 'Deal Echo Skill DMG', durationSeconds: 12, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'RECOMMENDED', notes: 'Amplification is stored separately from normal DMG Bonus.' }),
  e({ effectId: 'LE-DEF', weaponId: 'lethean-elegy', statOrEffect: 'DEF Ignore', rankValues: [.08, .10, .12, .14, .16], effectType: 'TRIGGERED', trigger: 'Deal Echo Skill DMG', durationSeconds: 12, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'RECOMMENDED', notes: 'Counted when the recommended rotation activates it.' }),

  e({ effectId: 'WS-ATK', weaponId: 'whispers-of-sirens', statOrEffect: 'ATK%', rankValues: R_12_24, effectType: 'PERMANENT', trigger: 'Passive', durationSeconds: null, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'ALWAYS', notes: 'Permanent ATK increase.' }),
  e({ effectId: 'WS-BASIC', weaponId: 'whispers-of-sirens', statOrEffect: 'Basic Attack DMG', rankValues: [.40, .50, .60, .70, .80], effectType: 'TRIGGERED', trigger: 'Gentle Dream — 1 stack', durationSeconds: 10, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'RECOMMENDED', notes: 'Lucilla Glacio Chafe mode reaches the useful first stack.' }),
  e({ effectId: 'WS-HAVOC-RES', weaponId: 'whispers-of-sirens', statOrEffect: 'Havoc RES Ignore', rankValues: R_12_24, effectType: 'TRIGGERED', trigger: 'Gentle Dream — 2 stacks', durationSeconds: 10, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'MANUAL', notes: 'Excluded from neutral Expected unless explicitly modeled for a Havoc target.' }),

  e({ effectId: 'RDS-ATK', weaponId: 'rime-draped-sprouts', statOrEffect: 'ATK%', rankValues: R_12_24, effectType: 'PERMANENT', trigger: 'Passive', durationSeconds: null, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'ALWAYS', notes: 'Permanent ATK increase.' }),
  e({ effectId: 'RDS-BASIC-STACK', weaponId: 'rime-draped-sprouts', statOrEffect: 'Basic Attack DMG', rankValues: R_12_24, effectType: 'STACKING', trigger: 'Resonance Skill', durationSeconds: 6, maxStacks: 3, appliesTo: 'SELF', simulatorMode: 'RECOMMENDED', notes: 'Value is per stack; recommended mode assumes three stacks only where the character can obtain them.' }),
  e({ effectId: 'RDS-OFFFIELD', weaponId: 'rime-draped-sprouts', statOrEffect: 'Basic Attack DMG', rankValues: [.52, .65, .78, .91, 1.04], effectType: 'TRIGGERED', trigger: 'Outro at 3 stacks', durationSeconds: 27, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'MANUAL', notes: 'Off-field-only effect; excluded from neutral Expected.' }),

  e({ effectId: 'FDS-ATK', weaponId: 'forged-dwarf-star', statOrEffect: 'ATK%', rankValues: R_12_24, effectType: 'PERMANENT', trigger: 'Passive', durationSeconds: null, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'ALWAYS', notes: 'Permanent ATK increase.' }),
  e({ effectId: 'FDS-LIB', weaponId: 'forged-dwarf-star', statOrEffect: 'Resonance Liberation DMG', rankValues: [.36, .45, .54, .63, .72], effectType: 'TRIGGERED', trigger: 'Fusion Burst or Tune Strain condition', durationSeconds: 5, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'RECOMMENDED', notes: 'Recommended rotation assumption.' }),
  e({ effectId: 'FDS-TEAM', weaponId: 'forged-dwarf-star', statOrEffect: 'ATK%', rankValues: R_24_48, effectType: 'TRIGGERED', trigger: 'Fusion Burst or Tune Strain condition', durationSeconds: 15, maxStacks: 1, appliesTo: 'TEAM', simulatorMode: 'RECOMMENDED', notes: 'Team-wide ATK effect; same-name effects do not stack.' }),

  e({ effectId: 'WM-ATK', weaponId: 'wildfire-mark', statOrEffect: 'ATK%', rankValues: R_12_24, effectType: 'PERMANENT', trigger: 'Passive', durationSeconds: null, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'ALWAYS', notes: 'Permanent ATK increase.' }),
  e({ effectId: 'WM-LIB', weaponId: 'wildfire-mark', statOrEffect: 'Resonance Liberation DMG', rankValues: R_24_48, effectType: 'TRIGGERED', trigger: 'Intro Skill or Resonance Liberation', durationSeconds: 6, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'RECOMMENDED', notes: 'Calcharo gains this for part of his Liberation window.' }),
  e({ effectId: 'WM-FUSION', weaponId: 'wildfire-mark', statOrEffect: 'Fusion DMG', rankValues: R_24_48, effectType: 'TRIGGERED', trigger: 'Extended team effect', durationSeconds: 30, maxStacks: 1, appliesTo: 'TEAM', simulatorMode: 'MANUAL', notes: 'Not applied to Calcharo because his element is Electro.' }),

  e({ effectId: 'LR-ER', weaponId: 'lustrous-razor', statOrEffect: 'Energy Regen', rankValues: [.128, .16, .192, .224, .256], effectType: 'PERMANENT', trigger: 'Passive', durationSeconds: null, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'ALWAYS', notes: 'Permanent Energy Regen.' }),
  e({ effectId: 'LR-LIB', weaponId: 'lustrous-razor', statOrEffect: 'Resonance Liberation DMG', rankValues: [.07, .088, .105, .123, .14], effectType: 'STACKING', trigger: 'Resonance Skill', durationSeconds: 12, maxStacks: 3, appliesTo: 'SELF', simulatorMode: 'RECOMMENDED', notes: 'Value is per stack; recommended assumes three stacks.' }),

  e({ effectId: 'AH-ATTR', weaponId: 'ages-of-harvest', statOrEffect: 'All Attribute DMG', rankValues: R_12_24, effectType: 'PERMANENT', trigger: 'Passive', durationSeconds: null, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'ALWAYS', notes: 'Permanent attribute damage bonus.' }),
  e({ effectId: 'AH-INTRO', weaponId: 'ages-of-harvest', statOrEffect: 'Resonance Skill DMG', rankValues: R_24_48, effectType: 'TRIGGERED', trigger: 'Intro Skill', durationSeconds: 12, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'RECOMMENDED', notes: 'Ageless Marking.' }),
  e({ effectId: 'AH-SKILL', weaponId: 'ages-of-harvest', statOrEffect: 'Resonance Skill DMG', rankValues: R_24_48, effectType: 'TRIGGERED', trigger: 'Resonance Skill', durationSeconds: 12, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'RECOMMENDED', notes: 'Ethereal Endowment.' }),

  e({ effectId: 'VS-ATTR', weaponId: 'verdant-summit', statOrEffect: 'All Attribute DMG', rankValues: R_12_24, effectType: 'PERMANENT', trigger: 'Passive', durationSeconds: null, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'ALWAYS', notes: 'Permanent attribute damage bonus.' }),
  e({ effectId: 'VS-HEAVY', weaponId: 'verdant-summit', statOrEffect: 'Heavy Attack DMG', rankValues: R_24_48, effectType: 'STACKING', trigger: 'Intro Skill or Resonance Liberation', durationSeconds: 14, maxStacks: 2, appliesTo: 'SELF', simulatorMode: 'RECOMMENDED', notes: 'Value is per stack; recommended assumes two stacks where attainable.' }),

  e({ effectId: 'AT-ATK', weaponId: 'autumntrace', statOrEffect: 'ATK%', rankValues: [.04, .062, .084, .106, .128], effectType: 'STACKING', trigger: 'Basic Attack or Heavy Attack', durationSeconds: 7, maxStacks: 5, appliesTo: 'SELF', simulatorMode: 'RECOMMENDED', notes: 'Value is per stack; recommended assumes five stacks.' }),
  e({ effectId: 'HC-ATK', weaponId: 'helios-cleaver', statOrEffect: 'ATK%', rankValues: [.03, .038, .045, .053, .06], effectType: 'STACKING', trigger: 'Resonance Skill', durationSeconds: 12, maxStacks: 4, appliesTo: 'SELF', simulatorMode: 'RECOMMENDED', notes: 'Value is per stack. Reaching four stacks resets the cycle; this is a simplified peak assumption.' }),

  e({ effectId: 'KUMO-TEAM', weaponId: 'kumokiri', statOrEffect: 'All Attribute DMG', rankValues: R_24_48, effectType: 'TRIGGERED', trigger: 'Weapon passive at 3 stacks; team Resonator inflicts Negative Status', durationSeconds: 15, maxStacks: 1, appliesTo: 'TEAM', simulatorMode: 'RECOMMENDED', notes: 'Conditional team bonus. Aemeath Fusion Burst qualifies after applying its Negative Status; exact activation point belongs to event-state modeling.', conditionalAudit: true }),
  e({ effectId: 'SB-TEAM', weaponId: 'spectrum-blaster', statOrEffect: 'All DMG', rankValues: [.08, .10, .12, .14, .16], effectType: 'STACKING', trigger: 'Wielder inflicts Tune Rupture - Shifting or Tune Strain - Shifting during Basic Attacks', durationSeconds: 30, maxStacks: 3, appliesTo: 'TEAM', simulatorMode: 'RECOMMENDED', notes: 'Value is per stack. R1 reaches up to +24% team All DMG at 3 stacks; exact stack count before Aemeath window remains event-state until timing is modeled.', conditionalAudit: true }),
  e({ effectId: 'SC-TEAM-CD', weaponId: 'starfield-calibrator', statOrEffect: 'CRIT DMG', rankValues: [.20, .25, .30, .35, .40], effectType: 'TRIGGERED', trigger: 'Wielder heals Resonators', durationSeconds: 4, maxStacks: 1, appliesTo: 'TEAM', simulatorMode: 'RECOMMENDED', notes: "Mornye S0R1 benchmark can provide +20% team CRIT DMG. Mornye heals repeatedly, but exact overlap with Aemeath's damage window remains timing-state until the team event adapter is proven.", conditionalAudit: true }),

  // Current released-roster audit — Pistol batch 1 (2026-08-25).
  e({
    effectId: 'RJ-ENERGY',
    weaponId: 'relativistic-jet',
    statOrEffect: 'Resonance Energy',
    rankValues: [6, 7, 8, 9, 10],
    valueUnit: 'FLAT_AMOUNT',
    effectType: 'INSTANT',
    trigger: 'Cast Resonance Skill',
    durationSeconds: null,
    triggerCooldownSeconds: 20,
    maxStacks: 1,
    appliesTo: 'SELF',
    simulatorMode: 'MANUAL',
    mechanicsStatus: 'VERIFIED_CONDITIONAL',
    sourceEffectText: 'Skill cast immediately grants Resonance Energy; the passive trigger can occur once every 20 seconds.',
    notes: 'Instant resource gain is modeled separately from the paired 16s ATK buff. No automatic skill-cast timing is assumed.',
    sourceLabels: ['Prydwen', 'Game8', 'Wuthering Waves Wiki'],
    sourceUrls: [
      'https://www.prydwen.gg/wuthering-waves/weapons?search=Relativistic+Jet',
      'https://game8.co/games/Wuthering-Waves/archives/474513',
      'https://wutheringwaves.fandom.com/wiki/Relativistic_Jet',
    ],
    checkedAt: '2026-08-25',
    provenanceNotes: ['R1-R5 Energy values, skill-cast trigger and 20s trigger cooldown agree across the current cross-check sources.'],
  }),
  e({
    effectId: 'RJ-ATK',
    weaponId: 'relativistic-jet',
    statOrEffect: 'ATK%',
    rankValues: [.10, .125, .15, .175, .20],
    effectType: 'TRIGGERED',
    trigger: 'Cast Resonance Skill',
    durationSeconds: 16,
    triggerCooldownSeconds: 20,
    maxStacks: 1,
    appliesTo: 'SELF',
    simulatorMode: 'MANUAL',
    mechanicsStatus: 'VERIFIED_CONDITIONAL',
    sourceEffectText: 'Skill cast grants a timed ATK increase for 16 seconds; the passive trigger has a 20-second cooldown.',
    notes: 'The rotation must decide whether the 16s ATK window overlaps a modeled action.',
    sourceLabels: ['Prydwen', 'Game8', 'Wuthering Waves Wiki'],
    sourceUrls: [
      'https://www.prydwen.gg/wuthering-waves/weapons?search=Relativistic+Jet',
      'https://game8.co/games/Wuthering-Waves/archives/474513',
      'https://wutheringwaves.fandom.com/wiki/Relativistic_Jet',
    ],
    checkedAt: '2026-08-25',
    provenanceNotes: ['R1-R5 ATK values, 16s duration and 20s trigger cooldown agree across the current cross-check sources.'],
  }),

  e({
    effectId: 'WA-ATK',
    weaponId: 'woodland-aria',
    statOrEffect: 'ATK%',
    rankValues: R_12_24,
    effectType: 'PERMANENT',
    trigger: 'Passive',
    durationSeconds: null,
    maxStacks: 1,
    appliesTo: 'SELF',
    simulatorMode: 'ALWAYS',
    sourceEffectText: 'Permanent ATK increase; Aero-Erosion interactions separately grant Aero DMG and reduce the affected target’s Aero RES.',
    notes: 'Unconditional component of Lingering Summer Tune.',
    sourceLabels: ['Prydwen', 'Game8', 'Wutheringlab', 'Wuthering Waves Wiki'],
    sourceUrls: [
      'https://www.prydwen.gg/wuthering-waves/characters/ciaccona',
      'https://game8.co/games/Wuthering-Waves/archives/514610',
      'https://wutheringlab.com/weapon/woodland-aria/',
      'https://wutheringwaves.fandom.com/wiki/Woodland_Aria',
    ],
    checkedAt: '2026-08-25',
    provenanceNotes: ['R1-R5 ATK values agree across the current cross-check sources.'],
  }),
  e({
    effectId: 'WA-AERO',
    weaponId: 'woodland-aria',
    statOrEffect: 'Aero DMG',
    rankValues: [.24, .30, .36, .42, .48],
    effectType: 'TRIGGERED',
    trigger: 'Inflict Aero Erosion on target',
    durationSeconds: 10,
    maxStacks: 1,
    appliesTo: 'SELF',
    simulatorMode: 'MANUAL',
    mechanicsStatus: 'VERIFIED_CONDITIONAL',
    sourceEffectText: 'Inflicting Aero Erosion grants the wielder a 10-second Aero DMG bonus.',
    notes: 'No uptime is assumed; the character/rotation must prove Aero Erosion application.',
    sourceLabels: ['Prydwen', 'Game8', 'Wutheringlab', 'Wuthering Waves Wiki'],
    sourceUrls: [
      'https://www.prydwen.gg/wuthering-waves/characters/ciaccona',
      'https://game8.co/games/Wuthering-Waves/archives/514610',
      'https://wutheringlab.com/weapon/woodland-aria/',
      'https://wutheringwaves.fandom.com/wiki/Woodland_Aria',
    ],
    checkedAt: '2026-08-25',
    provenanceNotes: ['R1-R5 Aero DMG values and 10s duration agree across the current cross-check sources.'],
  }),
  e({
    effectId: 'WA-AERO-RES',
    weaponId: 'woodland-aria',
    statOrEffect: 'Aero RES Reduction',
    rankValues: [.10, .115, .13, .145, .16],
    effectType: 'TRIGGERED',
    trigger: 'Hit target affected by Aero Erosion',
    durationSeconds: 20,
    maxStacks: 1,
    appliesTo: 'TARGET',
    conditions: ['Target is affected by Aero Erosion'],
    simulatorMode: 'MANUAL',
    mechanicsStatus: 'VERIFIED_CONDITIONAL',
    sourceEffectText: 'Hitting an Aero-Eroded target reduces that target’s Aero RES for 20 seconds; same-name effects do not stack.',
    notes: 'Positive rank values store reduction magnitude. TARGET scope prevents this enemy debuff from being misread as a SELF/TEAM stat.',
    sourceLabels: ['Prydwen', 'Game8', 'Wutheringlab', 'Wuthering Waves Wiki'],
    sourceUrls: [
      'https://www.prydwen.gg/wuthering-waves/characters/ciaccona',
      'https://game8.co/games/Wuthering-Waves/archives/514610',
      'https://wutheringlab.com/weapon/woodland-aria/',
      'https://wutheringwaves.fandom.com/wiki/Woodland_Aria',
    ],
    checkedAt: '2026-08-25',
    provenanceNotes: ['R1-R5 Aero RES-reduction magnitudes, 20s duration and same-name non-stacking agree across the current cross-check sources.'],
  }),

  // Current released-roster audit — Pistol batch 2 (2026-08-25).
  e({ effectId: 'CAD-CONCERTO', weaponId: 'cadenza', statOrEffect: 'Concerto Energy', rankValues: [8, 10, 12, 14, 16], valueUnit: 'FLAT_AMOUNT', effectType: 'INSTANT', trigger: 'Cast Resonance Skill', durationSeconds: null, triggerCooldownSeconds: 20, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'MANUAL', mechanicsStatus: 'VERIFIED_CONDITIONAL', sourceEffectText: 'Casting Resonance Skill restores Concerto Energy; this passive can trigger once every 20 seconds.', notes: 'Flat Concerto gain is an event fact. The rotation must decide whether and when the skill cast occurs.', sourceLabels: ['Prydwen', 'Game8', 'Wutheringlab'], sourceUrls: ['https://www.prydwen.gg/wuthering-waves/weapons?search=Cadenza', 'https://game8.co/games/Wuthering-Waves/archives/453299', 'https://wutheringlab.com/character/mortefi-build/'], checkedAt: '2026-08-25', provenanceNotes: ['Current sources agree on R1-R5 8/10/12/14/16 Concerto Energy and a 20s trigger cooldown.'] }),
  e({ effectId: 'POV-ENERGY', weaponId: 'pistols-of-voyager', statOrEffect: 'Resonance Energy', rankValues: [8, 9, 10, 11, 12], valueUnit: 'FLAT_AMOUNT', effectType: 'INSTANT', trigger: 'Cast Resonance Skill', durationSeconds: null, triggerCooldownSeconds: 20, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'MANUAL', mechanicsStatus: 'VERIFIED_CONDITIONAL', sourceEffectText: 'Casting Resonance Skill restores Resonance Energy; this passive can trigger once every 20 seconds.', notes: 'Flat Resonance Energy gain is not Energy Regen% and is kept separate from rotation timing.', sourceLabels: ['Game8', 'Wutheringlab', 'PlayAware'], sourceUrls: ['https://game8.co/games/Wuthering-Waves/archives/455896', 'https://wutheringlab.com/character/mortefi-build/', 'https://playaware.gg/games/wuthering-waves/wiki/weapons'], checkedAt: '2026-08-25', provenanceNotes: ['R1-R5 8/9/10/11/12 Resonance Energy and 20s trigger cooldown agree across current cross-check sources.'] }),
  e({ effectId: 'PON-ATK', weaponId: 'pistols-of-night', statOrEffect: 'ATK%', rankValues: [.08, .10, .12, .14, .16], effectType: 'TRIGGERED', trigger: 'Cast Intro Skill', durationSeconds: 10, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'MANUAL', mechanicsStatus: 'VERIFIED_CONDITIONAL', sourceEffectText: 'Casting Intro Skill increases ATK for 10 seconds.', notes: 'Intro timing remains rotation state; no automatic uptime is assumed.', sourceLabels: ['Game8', 'Pocket Tactics', 'PlayAware'], sourceUrls: ['https://game8.co/games/Wuthering-Waves/archives/455897', 'https://www.pockettactics.com/wuthering-waves/aalto', 'https://playaware.gg/games/wuthering-waves/wiki/weapons'], checkedAt: '2026-08-25', provenanceNotes: ['Game8, Pocket Tactics and PlayAware support the Intro Skill trigger and R1-R5 scaling. A lower-priority Slyraf page currently labels the R5 trigger as Outro; Bellibing records that as an upstream conflict rather than changing the higher-confidence trigger.'] }),
  e({ effectId: 'GP-SKILL', weaponId: 'guardian-pistols', statOrEffect: 'Resonance Skill DMG', rankValues: [.12, .15, .18, .21, .24], effectType: 'PERMANENT', trigger: 'Passive', durationSeconds: null, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'ALWAYS', sourceEffectText: 'Permanently increases Resonance Skill DMG Bonus.', notes: 'Unconditional weapon passive.', sourceLabels: ['Game8', 'PlayAware'], sourceUrls: ['https://game8.co/games/Wuthering-Waves/archives/455899', 'https://playaware.gg/games/wuthering-waves/wiki/weapons'], checkedAt: '2026-08-25', provenanceNotes: ['R1-R5 12/15/18/21/24% Resonance Skill DMG agrees across current cross-check sources.'] }),
  e({ effectId: 'O3-HEAL', weaponId: 'originite-type-iii', statOrEffect: 'HP Restore (Max HP)', rankValues: [.016, .02, .024, .028, .032], effectType: 'INSTANT', trigger: 'Cast Dodge Counter', durationSeconds: null, triggerCooldownSeconds: 6, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'MANUAL', mechanicsStatus: 'VERIFIED_CONDITIONAL', sourceEffectText: 'Casting Dodge Counter heals the wielder for a percentage of Max HP; this passive can trigger once every 6 seconds.', notes: 'Rank values are Max-HP fractions, not a generic Healing Bonus stat.', sourceLabels: ['Game8', 'Wuthering Waves Wiki', 'PlayAware'], sourceUrls: ['https://game8.co/games/Wuthering-Waves/archives/455898', 'https://wutheringwaves.fandom.com/wiki/Originite%3A_Type_III', 'https://playaware.gg/games/wuthering-waves/wiki/weapons'], checkedAt: '2026-08-25', provenanceNotes: ['R1-R5 1.6/2/2.4/2.8/3.2% Max-HP healing and 6s trigger cooldown agree across current cross-check sources.'] }),
  e({ effectId: 'TYRO-P-ATK', weaponId: 'tyro-pistols', statOrEffect: 'ATK%', rankValues: [.05, .0625, .075, .0875, .10], effectType: 'PERMANENT', trigger: 'Passive', durationSeconds: null, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'ALWAYS', sourceEffectText: 'Permanently increases ATK.', notes: 'Unconditional low-rarity weapon passive.', sourceLabels: ['Game8', 'Wuthering Waves Wiki', 'PlayAware'], sourceUrls: ['https://game8.co/games/Wuthering-Waves/archives/455895', 'https://wutheringwaves.fandom.com/wiki/Tyro_Pistols', 'https://playaware.gg/games/wuthering-waves/wiki/weapons'], checkedAt: '2026-08-25', provenanceNotes: ['R1-R5 5/6.25/7.5/8.75/10% ATK agrees across current cross-check sources.'] }),
  e({ effectId: 'TRAIN-P-ATK', weaponId: 'training-pistols', statOrEffect: 'ATK%', rankValues: [.04, .05, .06, .07, .08], effectType: 'PERMANENT', trigger: 'Passive', durationSeconds: null, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'ALWAYS', sourceEffectText: 'Permanently increases ATK.', notes: 'Unconditional training-weapon passive.', sourceLabels: ['Game8', 'Wuthering Waves Wiki', 'PlayAware'], sourceUrls: ['https://game8.co/games/Wuthering-Waves/archives/455894', 'https://wutheringwaves.fandom.com/wiki/Training_Pistols', 'https://playaware.gg/games/wuthering-waves/wiki/weapons'], checkedAt: '2026-08-25', provenanceNotes: ['R1-R5 4/5/6/7/8% ATK agrees across current cross-check sources.'] }),
  e({ effectId: 'UF-SKILL', weaponId: 'undying-flame', statOrEffect: 'Resonance Skill DMG', rankValues: [.20, .25, .30, .35, .40], effectType: 'TRIGGERED', trigger: 'Cast Intro Skill', durationSeconds: 15, maxStacks: 1, appliesTo: 'SELF', simulatorMode: 'MANUAL', mechanicsStatus: 'VERIFIED_CONDITIONAL', sourceEffectText: 'Casting Intro Skill increases Resonance Skill DMG Bonus for 15 seconds.', notes: 'The rotation decides whether the Intro-triggered window overlaps modeled Resonance Skill damage.', sourceLabels: ['Game8', 'Wutheringlab', 'PlayAware'], sourceUrls: ['https://game8.co/games/Wuthering-Waves/archives/455900', 'https://wutheringlab.com/character/carlotta-build/', 'https://playaware.gg/games/wuthering-waves/wiki/weapons'], checkedAt: '2026-08-25', provenanceNotes: ['R1-R5 20/25/30/35/40% Resonance Skill DMG and 15s duration agree across current cross-check sources.'] }),
  e({ effectId: 'NB-ATK', weaponId: 'novaburst', statOrEffect: 'ATK%', rankValues: [.04, .05, .06, .07, .08], effectType: 'STACKING', trigger: 'Dash or Dodge', durationSeconds: 8, maxStacks: 3, appliesTo: 'SELF', simulatorMode: 'MANUAL', mechanicsStatus: 'VERIFIED_CONDITIONAL', sourceEffectText: 'Dashing or dodging grants a stacking ATK increase for 8 seconds, up to 3 stacks.', notes: 'No dash/dodge count or stack uptime is assumed by the effect catalog.', sourceLabels: ['Game8', 'Wutheringlab', 'PlayAware'], sourceUrls: ['https://game8.co/games/Wuthering-Waves/archives/455902', 'https://wutheringlab.com/character/chixia-build/', 'https://playaware.gg/games/wuthering-waves/wiki/weapons'], checkedAt: '2026-08-25', provenanceNotes: ['R1-R5 4/5/6/7/8% ATK per stack, 3-stack cap and 8s duration agree across current cross-check sources.'] }),
  e({ effectId: 'TB-SKILL', weaponId: 'thunderbolt', statOrEffect: 'Resonance Skill DMG', rankValues: [.07, .11, .15, .19, .23], effectType: 'STACKING', trigger: 'Hit target with Basic Attack or Heavy Attack', durationSeconds: 10, triggerCooldownSeconds: 1, maxStacks: 3, stackIntervalSeconds: 1, appliesTo: 'SELF', simulatorMode: 'MANUAL', mechanicsStatus: 'VERIFIED_CONDITIONAL', sourceEffectText: 'Basic or Heavy Attack hits grant stacking Resonance Skill DMG Bonus for 10 seconds, up to 3 stacks; the trigger can occur once per second.', notes: 'Value is per stack. Rotation/event state must prove stack count and overlap before applying it.', sourceLabels: ['Game8', 'Wutheringlab', 'PlayAware'], sourceUrls: ['https://game8.co/games/Wuthering-Waves/archives/455901', 'https://wutheringlab.com/character/chixia-build/', 'https://playaware.gg/games/wuthering-waves/wiki/weapons'], checkedAt: '2026-08-25', provenanceNotes: ['R1-R5 7/11/15/19/23% per stack, 3-stack cap, 10s duration and 1s trigger interval agree across current cross-check sources.'] }),
];