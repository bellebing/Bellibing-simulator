import type {
  RankValues,
  WeaponEffectAppliesTo,
  WeaponEffectData,
  WeaponEffectMechanicsStatus,
  WeaponEffectSimulatorMode,
  WeaponEffectType,
} from '../effectDomain.ts';

interface EffectRow {
  effectId: string;
  weaponId: string;
  statOrEffect: string;
  rankValues: RankValues;
  effectType: WeaponEffectType;
  trigger: string;
  durationSeconds: number | null;
  maxStacks: number;
  stackIntervalSeconds?: number;
  appliesTo: WeaponEffectAppliesTo;
  simulatorMode: WeaponEffectSimulatorMode;
  notes: string;
  mechanicsStatus?: WeaponEffectMechanicsStatus;
  conditionalAudit?: boolean;
}

function e(row: EffectRow): WeaponEffectData {
  const conditional = row.conditionalAudit ?? false;
  return {
    ...row,
    stackIntervalSeconds: row.stackIntervalSeconds ?? 0,
    mechanicsStatus: row.mechanicsStatus ?? (conditional ? 'VERIFIED_CONDITIONAL' : 'VERIFIED_MODELED'),
    provenance: {
      sourceLabels: conditional
        ? ['V9.15 Weapon Effects', 'Prydwen', 'Wutheringlab']
        : ['V9.15 Weapon Effects', 'Maygi', 'Prydwen', 'Wutheringlab'],
      sourceUrls: [
        'https://docs.google.com/spreadsheets/d/1E_6YNe3OED6kihXWK6IQ8D-DcwdkuuAXvlG3ZtgkbP0/edit',
      ],
      checkedAt: conditional ? '2026-08-20' : '2026-07-18',
      notes: [
        'Migrated from the V9.15 Weapon Effects audit. Trigger text is data, not an automatic uptime assumption.',
      ],
    },
  };
}

const R_12_24 = [.12, .15, .18, .21, .24] as const;
const R_24_48 = [.24, .30, .36, .42, .48] as const;

/**
 * Current V9.15 modeled/conditional Weapon Effects only.
 *
 * This is intentionally a PARTIAL effect catalog: a weapon missing here means
 * its passive has not been migrated into this independent layer yet. It does
 * NOT mean the weapon has no passive.
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
];
