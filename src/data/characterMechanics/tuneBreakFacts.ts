import type { CharacterActionFact } from '../../characterMechanicsDomain.ts';

const CHECKED_AT = '2026-08-27';
const SOURCE_SNAPSHOT = 'https://github.com/DommyMM/wuwabuild/blob/5fa70b11f1d84fb644e4dbed47873708da0fe66f/public/Data/Characters.json';
const TUNE_BREAK_PATCH_NOTES = 'https://wutheringwaves.gg/patch-notes-for-version-3-0-we-who-see-the-stars/';
const AALTO_SOURCE = 'https://wuthering.gg/characters/aalto';
const AEMEATH_SOURCE = 'https://www.prydwen.gg/wuthering-waves/characters/aemeath';
const AUGUSTA_SOURCE = 'https://wuwa.incin.net/resonators/1306';
const BAIZHI_SOURCE = 'https://wuthering.gg/characters/baizhi';
const BRANT_SOURCE = 'https://wuthering.gg/characters/brant';
const CALCHARO_SOURCE = 'https://wuthering.gg/characters/calcharo';
const CAMELLYA_SOURCE = 'https://wuthering.gg/characters/camellya';
const CARLOTTA_SOURCE = 'https://wuthering.gg/characters/carlotta';
const CHANGLI_SOURCE = 'https://wuthering.gg/characters/changli';
const CHIXIA_SOURCE = 'https://wuthering.gg/characters/chixia';
const CIACCONA_SOURCE = 'https://wuthering.wiki/character_1407.html';
const ENCORE_SOURCE = 'https://wuthering.gg/characters/encore';
const JIANXIN_SOURCE = 'https://wuthering.wiki/character_1405.html';
const JINHSI_SOURCE = 'https://wuthering.wiki/character_1304.html';
const JIYAN_SOURCE = 'https://wuthering.gg/characters/jiyan';
const LINGYANG_SOURCE = 'https://wuthering.gg/characters/lingyang';
const LUMI_SOURCE = 'https://wuthering.wiki/character_1504.html';
const MORTEFI_SOURCE = 'https://wuthering.gg/characters/mortefi';
const PHOEBE_SOURCE = 'https://wuthering.wiki/character_1506.html';
const ROCCIA_SOURCE = 'https://wuthering.gg/characters/roccia';
const TAOQI_SOURCE = 'https://wuthering.gg/characters/taoqi';
const THE_SHOREKEEPER_SOURCE = 'https://wuthering.wiki/character_1505.html';
const VERINA_SOURCE = 'https://wuthering.gg/characters/verina';
const YANGYANG_SOURCE = 'https://wuthering.gg/characters/yangyang';
const YINLIN_SOURCE = 'https://wuthering.gg/characters/yinlin';
const YOUHU_SOURCE = 'https://wuthering.gg/characters/youhu';
const YUANWU_SOURCE = 'https://wuthering.gg/characters/yuanwu';
const ZHEZHI_SOURCE = 'https://wuthering.gg/characters/zhezhi';

const SYSTEM_CONTEXT = 'Current Version 3.x shared Tune Break combat-system damage. The Character source entry defines availability/variant semantics but exposes no Character Lv1-Lv10 motion-value table; the shared combat-system formula is intentionally not fabricated here.';

function tuneBreak(input: { characterId: string; factId: string; name: string; sourceLabel: string; sourceUrl: string; checkedAt?: string; notes?: readonly string[] }): CharacterActionFact {
  return {
    factId: input.factId,
    characterId: input.characterId,
    kind: 'ACTION',
    name: input.name,
    section: 'TUNE_BREAK',
    actionKind: 'TUNE_BREAK',
    actionRole: 'SHARED_SYSTEM_DAMAGE',
    damageClass: 'OTHER',
    scalingStat: 'SHARED_SYSTEM',
    motionValue: null,
    motionValueContext: SYSTEM_CONTEXT,
    hitCount: null,
    verificationStatus: 'VERIFIED',
    modelingStatus: 'PENDING_INTERPRETATION',
    conditional: true,
    provenance: {
      sourceLabels: ['wuwabuild normalized Character snapshot — exact pinned upstream commit', input.sourceLabel, 'Version 3.0 patch-notes mirror — shared Tune Break combat mechanic'],
      sourceUrls: [SOURCE_SNAPSHOT, input.sourceUrl, TUNE_BREAK_PATCH_NOTES],
      checkedAt: input.checkedAt ?? CHECKED_AT,
      notes: [
        'The pinned roster candidate exposes exactly one current Tune Break entry for this released Character.',
        'Version 3.0 introduced Tune Break as a shared combat mechanic: attacks build Off-Tune, a Mistune target can be hit by Tune Break for additional damage, and landing Tune Break resets Off-Tune. The character entry itself does not provide a Character skill-level damage curve.',
        'Bellibing therefore verifies the Character-owned access/variant semantics while keeping the unmodeled shared Tune Break damage formula outside Character motion-value fields.',
      ],
    },
    notes: input.notes,
  };
}

export const AALTO_TUNE_BREAK_FACT = tuneBreak({ characterId: 'aalto', factId: 'aalto-tune-break-pistols', name: 'Tune Break — Pistols', sourceLabel: 'Wuthering.gg — current Aalto Tune Break entry', sourceUrl: AALTO_SOURCE, notes: ["When the target's Off-Tune Level is full, Aalto may cast Tune Break on the target. No Aalto-specific coefficient table is exposed."] });
export const AEMEATH_TUNE_BREAK_FACT = tuneBreak({ characterId: 'aemeath', factId: 'aemeath-tune-break-unlanded-melody', name: 'Tune Break — Unlanded Melody', sourceLabel: 'Prydwen — current Aemeath Tune Break entry', sourceUrl: AEMEATH_SOURCE, notes: ["When the target's Off-Tune Level is full, Aemeath can cast Tune Break. Pressing Normal Attack shortly afterward casts Basic Attack Stage 3.", 'When a team Resonator triggers Tune Break and causes Tune Rupture - Interfered, Aemeath triggers Tune Rupture Response - Starburst; the same target can be damaged by Starburst once every 8 seconds.', 'Starburst owns its existing source-verified Character damage fact separately. This Tune Break fact records the shared-system action and transition semantics without duplicating Starburst motion values.'] });
export const AUGUSTA_TUNE_BREAK_FACT = tuneBreak({ characterId: 'augusta', factId: 'augusta-tune-break-broadblade', name: 'Tune Break — Broadblade', sourceLabel: 'Wuthering Waves DB — current Augusta Tune Break entry', sourceUrl: AUGUSTA_SOURCE, notes: ["When the target's Off-Tune Level is full, Augusta may cast Tune Break on the target. No Augusta-specific coefficient table is exposed."] });
export const BAIZHI_TUNE_BREAK_FACT = tuneBreak({ characterId: 'baizhi', factId: 'baizhi-tune-break-rectifier', name: 'Tune Break — Rectifier', sourceLabel: 'Wuthering.gg — current Baizhi Tune Break entry', sourceUrl: BAIZHI_SOURCE, notes: ["When the target's Off-Tune Level is full, Baizhi may cast Tune Break on the target. No Baizhi-specific coefficient table is exposed."] });
export const BRANT_TUNE_BREAK_FACT = tuneBreak({ characterId: 'brant', factId: 'brant-tune-break-sword', name: 'Tune Break — Sword', sourceLabel: 'Wuthering.gg — current Brant Tune Break entry', sourceUrl: BRANT_SOURCE, notes: ["When the target's Off-Tune Level is full, Brant may cast Tune Break on the target. No Brant-specific coefficient table is exposed."] });
export const CALCHARO_TUNE_BREAK_FACT = tuneBreak({ characterId: 'calcharo', factId: 'calcharo-tune-break-broadblade', name: 'Tune Break — Broadblade', sourceLabel: 'Wuthering.gg — current Calcharo Tune Break entry', sourceUrl: CALCHARO_SOURCE, checkedAt: '2026-08-28', notes: ["When the target's Off-Tune Level is full, Calcharo may cast Tune Break on the target. No Calcharo-specific coefficient table is exposed."] });
export const CAMELLYA_TUNE_BREAK_FACT = tuneBreak({ characterId: 'camellya', factId: 'camellya-tune-break-sword', name: 'Tune Break — Sword', sourceLabel: 'Wuthering.gg — current Camellya Tune Break entry', sourceUrl: CAMELLYA_SOURCE, checkedAt: '2026-08-28', notes: ["When the target's Off-Tune Level is full, Camellya may cast Tune Break on the target. No Camellya-specific coefficient table is exposed."] });
export const CARLOTTA_TUNE_BREAK_FACT = tuneBreak({ characterId: 'carlotta', factId: 'carlotta-tune-break-pistols', name: 'Tune Break — Pistols', sourceLabel: 'Wuthering.gg — current Carlotta Tune Break entry', sourceUrl: CARLOTTA_SOURCE, checkedAt: '2026-08-28', notes: ["When the target's Off-Tune Level is full, Carlotta may cast Tune Break on the target. No Carlotta-specific coefficient table is exposed."] });
export const CHANGLI_TUNE_BREAK_FACT = tuneBreak({ characterId: 'changli', factId: 'changli-tune-break-sword', name: 'Tune Break — Sword', sourceLabel: 'Wuthering.gg — current Changli Tune Break entry', sourceUrl: CHANGLI_SOURCE, notes: ["When the target's Off-Tune Level is full, Changli may cast Tune Break on the target. No Changli-specific coefficient table is exposed."] });
export const CHIXIA_TUNE_BREAK_FACT = tuneBreak({ characterId: 'chixia', factId: 'chixia-tune-break-pistols', name: 'Tune Break — Pistols', sourceLabel: 'Wuthering.gg — current Chixia Tune Break entry', sourceUrl: CHIXIA_SOURCE, notes: ["When the target's Off-Tune Level is full, Chixia may cast Tune Break on the target. No Chixia-specific coefficient table is exposed."] });
export const CIACCONA_TUNE_BREAK_FACT = tuneBreak({ characterId: 'ciaccona', factId: 'ciaccona-tune-break-pistols', name: 'Tune Break — Pistols', sourceLabel: 'Wuthering.wiki — current Ciaccona Tune Break entry', sourceUrl: CIACCONA_SOURCE, checkedAt: '2026-08-28', notes: ["When the target's Off-Tune Level is full, Ciaccona may cast Tune Break on the target. No Ciaccona-specific coefficient table is exposed."] });
export const ENCORE_TUNE_BREAK_FACT = tuneBreak({ characterId: 'encore', factId: 'encore-tune-break-rectifier', name: 'Tune Break — Rectifier', sourceLabel: 'Wuthering.gg — current Encore Tune Break entry', sourceUrl: ENCORE_SOURCE, notes: ["When the target's Off-Tune Level is full, Encore may cast Tune Break on the target. No Encore-specific coefficient table is exposed."] });
export const JIANXIN_TUNE_BREAK_FACT = tuneBreak({ characterId: 'jianxin', factId: 'jianxin-tune-break-gauntlets', name: 'Tune Break — Gauntlets', sourceLabel: 'Wuthering.wiki — current Jianxin Tune Break entry', sourceUrl: JIANXIN_SOURCE, checkedAt: '2026-08-28', notes: ["When the target's Off-Tune Level is full, Jianxin may cast Tune Break on the target. No Jianxin-specific coefficient table is exposed."] });
export const JINHSI_TUNE_BREAK_FACT = tuneBreak({ characterId: 'jinhsi', factId: 'jinhsi-tune-break-broadblade', name: 'Tune Break — Broadblade', sourceLabel: 'Wuthering.wiki — current Jinhsi Tune Break entry', sourceUrl: JINHSI_SOURCE, checkedAt: '2026-08-28', notes: ["When the target's Off-Tune Level is full, Jinhsi may cast Tune Break on the target. No Jinhsi-specific coefficient table is exposed."] });
export const JIYAN_TUNE_BREAK_FACT = tuneBreak({ characterId: 'jiyan', factId: 'jiyan-tune-break-broadblade', name: 'Tune Break — Broadblade', sourceLabel: 'Wuthering.gg — current Jiyan Tune Break entry', sourceUrl: JIYAN_SOURCE, notes: ["When the target's Off-Tune Level is full, Jiyan may cast Tune Break on the target. No Jiyan-specific coefficient table is exposed."] });
export const LINGYANG_TUNE_BREAK_FACT = tuneBreak({ characterId: 'lingyang', factId: 'lingyang-tune-break-gauntlets', name: 'Tune Break — Gauntlets', sourceLabel: 'Wuthering.gg — current Lingyang Tune Break entry', sourceUrl: LINGYANG_SOURCE, checkedAt: '2026-08-28', notes: ["When the target's Off-Tune Level is full, Lingyang may cast Tune Break on the target. No Lingyang-specific coefficient table is exposed."] });
export const LUMI_TUNE_BREAK_FACT = tuneBreak({ characterId: 'lumi', factId: 'lumi-tune-break-broadblade', name: 'Tune Break — Broadblade', sourceLabel: 'Wuthering.wiki — current Lumi Tune Break entry', sourceUrl: LUMI_SOURCE, checkedAt: '2026-08-28', notes: ["When the target's Off-Tune Level is full, Lumi may cast Tune Break on the target. No Lumi-specific coefficient table is exposed."] });
export const MORTEFI_TUNE_BREAK_FACT = tuneBreak({ characterId: 'mortefi', factId: 'mortefi-tune-break-pistols', name: 'Tune Break — Pistols', sourceLabel: 'Wuthering.gg — current Mortefi Tune Break entry', sourceUrl: MORTEFI_SOURCE, notes: ["When the target's Off-Tune Level is full, Mortefi may cast Tune Break on the target. No Mortefi-specific coefficient table is exposed."] });
export const PHOEBE_TUNE_BREAK_FACT = tuneBreak({ characterId: 'phoebe', factId: 'phoebe-tune-break-rectifier', name: 'Tune Break — Rectifier', sourceLabel: 'Wuthering.wiki — current Phoebe Tune Break entry', sourceUrl: PHOEBE_SOURCE, checkedAt: '2026-08-28', notes: ["When the target's Off-Tune Level is full, Phoebe may cast Tune Break on the target. No Phoebe-specific coefficient table is exposed."] });
export const ROCCIA_TUNE_BREAK_FACT = tuneBreak({ characterId: 'roccia', factId: 'roccia-tune-break-gauntlets', name: 'Tune Break — Gauntlets', sourceLabel: 'Wuthering.gg — current Roccia Tune Break entry', sourceUrl: ROCCIA_SOURCE, checkedAt: '2026-08-28', notes: ["When the target's Off-Tune Level is full, Roccia may cast Tune Break on the target. No Roccia-specific coefficient table is exposed."] });
export const TAOQI_TUNE_BREAK_FACT = tuneBreak({ characterId: 'taoqi', factId: 'taoqi-tune-break-broadblade', name: 'Tune Break — Broadblade', sourceLabel: 'Wuthering.gg — current Taoqi Tune Break entry', sourceUrl: TAOQI_SOURCE, notes: ["When the target's Off-Tune Level is full, Taoqi may cast Tune Break on the target. No Taoqi-specific coefficient table is exposed."] });
export const THE_SHOREKEEPER_TUNE_BREAK_FACT = tuneBreak({ characterId: 'the-shorekeeper', factId: 'the-shorekeeper-tune-break-rectifier', name: 'Tune Break — Rectifier', sourceLabel: 'Wuthering.wiki — current The Shorekeeper Tune Break entry', sourceUrl: THE_SHOREKEEPER_SOURCE, checkedAt: '2026-08-28', notes: ["When the target's Off-Tune Level is full, The Shorekeeper may cast Tune Break on the target. No The Shorekeeper-specific coefficient table is exposed."] });
export const VERINA_TUNE_BREAK_FACT = tuneBreak({ characterId: 'verina', factId: 'verina-tune-break-rectifier', name: 'Tune Break — Rectifier', sourceLabel: 'Wuthering.gg — current Verina Tune Break entry', sourceUrl: VERINA_SOURCE, notes: ["When the target's Off-Tune Level is full, Verina may cast Tune Break on the target. No Verina-specific coefficient table is exposed."] });
export const YANGYANG_TUNE_BREAK_FACT = tuneBreak({ characterId: 'yangyang', factId: 'yangyang-tune-break-sword', name: 'Tune Break — Sword', sourceLabel: 'Wuthering.gg — current Yangyang Tune Break entry', sourceUrl: YANGYANG_SOURCE, notes: ["When the target's Off-Tune Level is full, Yangyang may cast Tune Break on the target. No Yangyang-specific coefficient table is exposed."] });
export const YINLIN_TUNE_BREAK_FACT = tuneBreak({ characterId: 'yinlin', factId: 'yinlin-tune-break-rectifier', name: 'Tune Break — Rectifier', sourceLabel: 'Wuthering.gg — current Yinlin Tune Break entry', sourceUrl: YINLIN_SOURCE, checkedAt: '2026-08-28', notes: ["When the target's Off-Tune Level is full, Yinlin may cast Tune Break on the target. No Yinlin-specific coefficient table is exposed."] });
export const YOUHU_TUNE_BREAK_FACT = tuneBreak({ characterId: 'youhu', factId: 'youhu-tune-break-gauntlets', name: 'Tune Break — Gauntlets', sourceLabel: 'Wuthering.gg — current Youhu Tune Break entry', sourceUrl: YOUHU_SOURCE, checkedAt: '2026-08-28', notes: ["When the target's Off-Tune Level is full, Youhu may cast Tune Break on the target. No Youhu-specific coefficient table is exposed."] });
export const YUANWU_TUNE_BREAK_FACT = tuneBreak({ characterId: 'yuanwu', factId: 'yuanwu-tune-break-gauntlets', name: 'Tune Break — Gauntlets', sourceLabel: 'Wuthering.gg — current Yuanwu Tune Break entry', sourceUrl: YUANWU_SOURCE, checkedAt: '2026-08-28', notes: ["When the target's Off-Tune Level is full, Yuanwu may cast Tune Break on the target. No Yuanwu-specific coefficient table is exposed."] });
export const ZHEZHI_TUNE_BREAK_FACT = tuneBreak({ characterId: 'zhezhi', factId: 'zhezhi-tune-break-rectifier', name: 'Tune Break — Rectifier', sourceLabel: 'Wuthering.gg — current Zhezhi Tune Break entry', sourceUrl: ZHEZHI_SOURCE, checkedAt: '2026-08-28', notes: ["When the target's Off-Tune Level is full, Zhezhi may cast Tune Break on the target. No Zhezhi-specific coefficient table is exposed."] });

export const CHARACTER_TUNE_BREAK_FACTS: readonly CharacterActionFact[] = [
  AALTO_TUNE_BREAK_FACT,
  AEMEATH_TUNE_BREAK_FACT,
  AUGUSTA_TUNE_BREAK_FACT,
  BAIZHI_TUNE_BREAK_FACT,
  BRANT_TUNE_BREAK_FACT,
  CALCHARO_TUNE_BREAK_FACT,
  CAMELLYA_TUNE_BREAK_FACT,
  CARLOTTA_TUNE_BREAK_FACT,
  CHANGLI_TUNE_BREAK_FACT,
  CHIXIA_TUNE_BREAK_FACT,
  CIACCONA_TUNE_BREAK_FACT,
  ENCORE_TUNE_BREAK_FACT,
  JIANXIN_TUNE_BREAK_FACT,
  JINHSI_TUNE_BREAK_FACT,
  JIYAN_TUNE_BREAK_FACT,
  LINGYANG_TUNE_BREAK_FACT,
  LUMI_TUNE_BREAK_FACT,
  MORTEFI_TUNE_BREAK_FACT,
  PHOEBE_TUNE_BREAK_FACT,
  ROCCIA_TUNE_BREAK_FACT,
  TAOQI_TUNE_BREAK_FACT,
  THE_SHOREKEEPER_TUNE_BREAK_FACT,
  VERINA_TUNE_BREAK_FACT,
  YANGYANG_TUNE_BREAK_FACT,
  YINLIN_TUNE_BREAK_FACT,
  YOUHU_TUNE_BREAK_FACT,
  YUANWU_TUNE_BREAK_FACT,
  ZHEZHI_TUNE_BREAK_FACT,
] as const;
