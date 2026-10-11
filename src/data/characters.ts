import type { VerificationStatus } from '../contentRegistry.ts';
import type {
  CharacterGameData,
  CharacterRarity,
  Element,
  WeaponType,
} from '../gameDataDomain.ts';
import { getCharacterIntrinsicStats } from './characterIntrinsicStats.ts';

type ReleaseStatus = CharacterGameData['releaseStatus'];

interface CharacterRow {
  id: string;
  name: string;
  rarity: CharacterRarity;
  element: Element | null;
  weaponType: WeaponType | null;
  hp: number | null;
  atk: number | null;
  def: number | null;
  maxEnergy: number | null;
  releaseStatus?: ReleaseStatus;
  verificationStatus?: VerificationStatus;
  sourceLabels?: readonly string[];
  sourceUrls?: readonly string[];
  checkedAt?: string;
  notes?: readonly string[];
}

const CHECKED_AT = '2026-08-23';

function prydwenUrl(id: string): string {
  return `https://www.prydwen.gg/wuthering-waves/characters/${id}`;
}

function row(input: CharacterRow): CharacterGameData {
  const released = (input.releaseStatus ?? 'RELEASED') === 'RELEASED';
  return {
    kind: 'CHARACTER',
    id: input.id,
    name: input.name,
    releaseStatus: input.releaseStatus ?? 'RELEASED',
    verificationStatus: input.verificationStatus ?? 'PARTIALLY_VERIFIED',
    integrationStatus: 'DATA_ONLY',
    provenance: {
      sourceLabels: input.sourceLabels ?? ['V9.15 Characters', 'Prydwen'],
      sourceUrls: input.sourceUrls ?? [prydwenUrl(input.id)],
      checkedAt: input.checkedAt ?? CHECKED_AT,
      notes: input.notes,
    },
    rarity: input.rarity,
    element: input.element,
    weaponType: input.weaponType,
    level90: {
      hp: input.hp,
      atk: input.atk,
      def: input.def,
      maxEnergy: input.maxEnergy,
    },
    baseCombat: released
      ? { critRate: 0.05, critDamage: 1.5, energyRegen: 1 }
      : { critRate: null, critDamage: null, energyRegen: null },
    intrinsicStats: getCharacterIntrinsicStats(input.id) ?? [],
  };
}

/**
 * Character identity + raw level-90 data only.
 *
 * Static Minor-Forte totals are owned by `characterIntrinsicStats.ts`; this
 * roster consumes that fact base rather than duplicating the same nodes inline.
 * Signature/default weapons, Echo recommendations, teams and rotations remain
 * separate relationship/profile layers.
 *
 * Level-90 integer convention:
 * - Bellibing stores the published game-facing integer convention used by its
 *   benchmark/profile sources, led by the current Prydwen Lv90 roster table.
 * - structured decimal databases are cross-check/provenance sources; Bellibing
 *   does not invent an app-side rounding formula from those decimals.
 * - adjacent integers from a raw-decimal/flooring presentation are not by
 *   themselves a game-data conflict when the canonical published convention is
 *   source-backed. True semantic conflicts (especially Max Energy vs Liberation
 *   Resonance Cost) remain null/pending.
 *
 * Migration policy:
 * - V9.15 provides the baseline roster and raw values.
 * - Known stale release identities are patched from current sources.
 * - Source-conflicted numeric fields remain null instead of being guessed.
 * - Imported V9.15 rows stay PARTIALLY_VERIFIED until the full Character base
 *   audit is complete; Augusta remains the verified golden raw-data reference.
 */
export const CHARACTER_CATALOG: readonly CharacterGameData[] = [
  row({ id: 'aalto', name: 'Aalto', rarity: 4, element: 'Aero', weaponType: 'Pistols', hp: 9850, atk: 263, def: 1075, maxEnergy: 150 }),
  row({ id: 'aemeath', name: 'Aemeath', rarity: 5, element: 'Fusion', weaponType: 'Sword', hp: 11025, atk: 425, def: 1149, maxEnergy: 125 }),
  row({ id: 'augusta', name: 'Augusta', rarity: 5, element: 'Electro', weaponType: 'Broadblade', hp: 10300, atk: 463, def: 1112, maxEnergy: 125, verificationStatus: 'VERIFIED', sourceLabels: ['V9.15 Characters', 'Prydwen', 'Augusta parity fixtures'], notes: ['Golden-reference character; exact app DPS parity is tracked separately from raw data.'] }),
  row({ id: 'baizhi', name: 'Baizhi', rarity: 4, element: 'Glacio', weaponType: 'Rectifier',
    hp: 12813, atk: 213, def: 1002, maxEnergy: 175,
    verificationStatus: 'VERIFIED',
    sourceLabels: [
      'Prydwen Lv90 Stats roster — 2026-10-08, game-facing integer convention and explicit Max Energy',
      'Prydwen Baizhi profile — released identity, labelled energy cap, base CRIT and permanent Minor Fortes',
      'Wuwa Wiki Baizhi codex — raw Lv90 cross-check and base 100% Energy Regen',
      'Bellibing characterIntrinsicStats.ts — reviewed permanent Minor Forte nodes',
    ],
    sourceUrls: [
      'https://www.prydwen.gg/wuthering-waves/stats',
      'https://www.prydwen.gg/wuthering-waves/characters/baizhi',
      'https://wuwa.wiki/en/codex/resonators/1103',
    ],
    checkedAt: '2026-10-11',
    notes: [
      'Raw source sign-off: released identity, rarity, element, weapon, Lv90 HP/ATK/DEF, actual Max Energy cap (not Liberation Cost), base 5% CRIT Rate, 150% CRIT DMG, 100% Energy Regen and independently reviewed permanent Minor Forte nodes.',
      'The current Prydwen Lv90 Stats roster and individual Baizhi card agree on 12813 HP, 213 ATK, 1002 DEF and 175 explicitly labelled Max Energy. Wuwa Wiki separately supports HP/ATK/DEF and base 100% Energy Regen / 5% CRIT Rate / 150% CRIT DMG; canonical independently VERIFIED Minor Fortes give HP% 12% and Healing Bonus 12%.',
      'Status VERIFIED is raw data only; DATA_ONLY remains unchanged. No DPS, mechanics, profiles, team effects or recommendations are promoted.',
    ],
  }),
  row({ id: 'brant', name: 'Brant', rarity: 5, element: 'Fusion', weaponType: 'Sword', hp: 11675, atk: 375, def: 1308, maxEnergy: 125 }),
  row({ id: 'buling', name: 'Buling', rarity: 4, element: 'Electro', weaponType: 'Rectifier', hp: 10625, atk: 225, def: 1259, maxEnergy: 125 }),
  row({ id: 'calcharo', name: 'Calcharo', rarity: 5, element: 'Electro', weaponType: 'Broadblade', hp: 10500, atk: 438, def: 1185, maxEnergy: 125 }),
  row({ id: 'camellya', name: 'Camellya', rarity: 5, element: 'Havoc', weaponType: 'Sword', hp: 10325, atk: 450, def: 1161, maxEnergy: 125 }),
  row({ id: 'cantarella', name: 'Cantarella', rarity: 5, element: 'Havoc', weaponType: 'Rectifier', hp: 11600, atk: 400, def: 1100, maxEnergy: 125 }),
  row({ id: 'carlotta', name: 'Carlotta', rarity: 5, element: 'Glacio', weaponType: 'Pistols', hp: 12450, atk: 463, def: 1198, maxEnergy: 125 }),
  row({ id: 'cartethyia', name: 'Cartethyia', rarity: 5, element: 'Aero', weaponType: 'Sword',
    hp: 14800, atk: 313, def: 611, maxEnergy: 125,
    verificationStatus: 'VERIFIED',
    sourceLabels: [
      'Prydwen Lv90 Stats roster — 2026-10-08, published integer and named Max Energy cap',
      'Prydwen Cartethyia profile — identity, baseline CRIT, Minor Fortes and labelled Max Energy',
      'Wuwa Wiki Cartethyia codex — Lv90 raw, base 100% Energy Regen and CRIT',
      'Bellibing characterIntrinsicStats.ts — separately VERIFIED permanent Minor Forte nodes',
    ],
    sourceUrls: [
      'https://www.prydwen.gg/wuthering-waves/stats',
      'https://www.prydwen.gg/wuthering-waves/characters/cartethyia',
      'https://wuwa.wiki/en/codex/resonators/1409',
    ],
    checkedAt: '2026-10-11',
    notes: [
      '2026-10-11 full raw source sign-off: released 5-star identity, element, weapon, Lv90 HP/ATK/DEF, separately labelled Max Energy cap 125, CRIT Rate 5%, CRIT DMG 150%, base Energy Regen 100% and pre-verified permanent intrinsic nodes.',
      'Prydwen roster/profile agree; Wuwa Wiki confirms base ER 100% and CRIT 5%/150%; reviewed Minor Fortes CRIT Rate 8%, HP 12%.',
      'Only Character raw VERIFIED + DATA_ONLY; does not promote Character Mechanics, recommendations, execution, rotations or DPS.',
    ],
  }),
  row({ id: 'changli', name: 'Changli', rarity: 5, element: 'Fusion', weaponType: 'Sword', hp: 10388, atk: 463, def: 1100, maxEnergy: 125,
    verificationStatus: 'VERIFIED',
    sourceLabels: ['Prydwen Level90 Stats roster — game-facing integers and explicit Max Energy', 'Prydwen Changli kit — identity, base CRIT and Minor Fortes', 'Bellibing canonical independently VERIFIED permanent Minor Forte nodes'],
    sourceUrls: ['https://www.prydwen.gg/wuthering-waves/stats', 'https://www.prydwen.gg/wuthering-waves/characters/changli', 'https://wuwa.wiki/en/codex/resonators/1205'],
    checkedAt: '2026-10-11',
    notes: ['Current Prydwen Level90 roster and individual character profile cross-check the existing unchanged raw HP/ATK/DEF/Max Energy and base CRIT Rate 5% / CRIT DMG 150%.', 'Original permanent Minor Forte +8% CRIT Rate / +12% ATK is independently VERIFIED in characterIntrinsicStats.ts.', 'Wuwa Wiki codex 3.7.12 independently shows base Energy Regen 100%, CRIT Rate 5% and CRIT DMG 150%. Skill-level coefficients and modeled mechanics remain separate.'],
  }),
  row({ id: 'chisa', name: 'Chisa', rarity: 5, element: 'Havoc', weaponType: 'Broadblade',
    hp: 10775, atk: 438, def: 1136, maxEnergy: 125,
    verificationStatus: 'VERIFIED',
    sourceLabels: [
      'Prydwen Lv90 Stats roster — 2026-10-08, published integer and named Max Energy cap',
      'Prydwen Chisa profile — identity, baseline CRIT, Minor Fortes and labelled Max Energy',
      'Wuwa Wiki Chisa codex — Lv90 raw, base 100% Energy Regen and CRIT',
      'Bellibing characterIntrinsicStats.ts — separately VERIFIED permanent Minor Forte nodes',
    ],
    sourceUrls: [
      'https://www.prydwen.gg/wuthering-waves/stats',
      'https://www.prydwen.gg/wuthering-waves/characters/chisa',
      'https://wuwa.wiki/en/codex/resonators/1508',
    ],
    checkedAt: '2026-10-11',
    notes: [
      '2026-10-11 full raw source sign-off: released 5-star identity, element, weapon, Lv90 HP/ATK/DEF, separately labelled Max Energy cap 125, CRIT Rate 5%, CRIT DMG 150%, base Energy Regen 100% and pre-verified permanent intrinsic nodes.',
      'Published Prydwen Stats roster DEF 1136 governs game-facing integers. Profile and Wuwa Wiki show adjacent 1137; do not infer a global rounding rule. Wuwa Wiki confirms base ER 100% and CRIT 5%/150%; Minor Fortes CRIT Rate 8%, ATK 12%.',
      'Only Character raw VERIFIED + DATA_ONLY; does not promote Character Mechanics, recommendations, execution, rotations or DPS.',
    ],
  }),
  row({ id: 'chixia', name: 'Chixia', rarity: 4, element: 'Fusion', weaponType: 'Pistols', hp: 9088, atk: 300, def: 953, maxEnergy: 150 }),
  row({ id: 'ciaccona', name: 'Ciaccona', rarity: 5, element: 'Aero', weaponType: 'Pistols',
    hp: 12238, atk: 375, def: 1198, maxEnergy: 125,
    verificationStatus: 'VERIFIED',
    sourceLabels: [
      'Prydwen Lv90 Stats roster — 2026-10-08, published integer and named Max Energy cap',
      'Prydwen Ciaccona profile — identity, baseline CRIT, Minor Fortes and labelled Max Energy',
      'Wuwa Wiki Ciaccona codex — Lv90 raw, base 100% Energy Regen and CRIT',
      'Bellibing characterIntrinsicStats.ts — separately VERIFIED permanent Minor Forte nodes',
    ],
    sourceUrls: [
      'https://www.prydwen.gg/wuthering-waves/stats',
      'https://www.prydwen.gg/wuthering-waves/characters/ciaccona',
      'https://wuwa.wiki/en/codex/resonators/1407',
    ],
    checkedAt: '2026-10-11',
    notes: [
      '2026-10-11 full raw source sign-off: released 5-star identity, element, weapon, Lv90 HP/ATK/DEF, separately labelled Max Energy cap 125, CRIT Rate 5%, CRIT DMG 150%, base Energy Regen 100% and pre-verified permanent intrinsic nodes.',
      'Prydwen roster/profile agree; Wuwa Wiki confirms base ER 100% and CRIT 5%/150%; reviewed Minor Fortes CRIT DMG 16%, ATK 12%.',
      'Only Character raw VERIFIED + DATA_ONLY; does not promote Character Mechanics, recommendations, execution, rotations or DPS.',
    ],
  }),
  row({ id: 'danjin', name: 'Danjin', rarity: 4, element: 'Havoc', weaponType: 'Sword', hp: 9438, atk: 263, def: 1149, maxEnergy: 100 }),
  row({ id: 'denia', name: 'Denia', rarity: 5, element: 'Fusion', weaponType: 'Rectifier', hp: 11025, atk: 425, def: 1149, maxEnergy: 125, sourceLabels: ['V9.15 Characters', 'Prydwen', 'Wutheringlab', 'Wuwa Wiki'], notes: ['V9.15 profile identity was live while core stats were blank; current source cross-check supplies the level-90 core stats.'] }),
  row({ id: 'encore', name: 'Encore', rarity: 5, element: 'Fusion', weaponType: 'Rectifier', hp: 10513, atk: 425, def: 1246, maxEnergy: 125, verificationStatus: 'VERIFIED', sourceLabels: ['Prydwen Lv90 Stats roster (2026-10-08)', 'Prydwen Character profile', 'Wuwa Wiki Resonator codex', 'Wuthering Waves Wiki Max Resonance Energy', 'ArabWuwa/Wuthering.gg conflicting energy labels reviewed'], sourceUrls: ["https://www.prydwen.gg/wuthering-waves/stats","https://www.prydwen.gg/wuthering-waves/characters/encore","https://wuwa.wiki/en/codex/resonators/1203","https://wutheringwaves.fandom.com/wiki/Resonance_Energy","https://wutheringwaves.fandom.com/wiki/Encore/Combat","https://arabwuwa.com/characters/encore/","https://wuthering.gg/characters/encore"], checkedAt: '2026-10-11', notes: ["Raw source review 2026-10-11: Prydwen Lv90 Stats roster 10513/425/1246/125 is the canonical published integer layer. Individual Prydwen/Wuwa Wiki show DEF 1247, while Wuthering.gg displays HP 10512 and DEF 1246; decimal progression gives HP 10512.50 / DEF 1246.64, adjacent integer presentation differences, not a change to the roster convention.","Max Energy 125 is explicitly named on both Prydwen surfaces and the independent Max Resonance Energy table; ArabWuwa instead labels 100 Max Energy and Wuthering.gg labels 140 Max Resonance Energy. The latter disagrees but is not adopted without corroboration; no Liberation cost was used. Base 5% CRIT Rate/150% CRIT DMG/100% Energy Regen and permanent Minor Fortes were separately reviewed."] }),
  row({ id: 'galbrena', name: 'Galbrena', rarity: 5, element: 'Fusion', weaponType: 'Pistols', hp: 10300, atk: 463, def: 1112, maxEnergy: 125 }),
  row({ id: 'hiyuki', name: 'Hiyuki', rarity: 5, element: 'Glacio', weaponType: 'Sword', hp: 10300, atk: 463, def: 1112, maxEnergy: 125 }),
  row({ id: 'hsin', name: 'Hsin', rarity: 5, element: 'Electro', weaponType: 'Rectifier', hp: null, atk: null, def: null, maxEnergy: null, releaseStatus: 'RELEASED', verificationStatus: 'PARTIALLY_VERIFIED', sourceLabels: ['Kuro Version 3.7 patch notes', 'Kuro Version 3.7 phase-I Convene'], sourceUrls: ['https://wutheringwaves.kurogames.com/zh-tw/main/news/detail/5562', 'https://wutheringwaves.kurogames.com/zh-tw/main/news/detail/5528'], checkedAt: '2026-10-06', notes: ['Released in Version 3.7 on 2026-09-30; phase-I Convene confirms live availability. Identity/release review only; HP, ATK, DEF and Max Energy remain null pending a separate level-90 convention review. Mechanics and progression are not promoted.'] }),
  row({ id: 'iuno', name: 'Iuno', rarity: 5, element: 'Aero', weaponType: 'Gauntlets',
    hp: 10525, atk: 450, def: 1124, maxEnergy: 125,
    verificationStatus: 'VERIFIED',
    sourceLabels: [
      'Prydwen Lv90 Stats roster — 2026-10-08, published integer and named Max Energy cap',
      'Prydwen Iuno profile — identity, baseline CRIT, Minor Fortes and labelled Max Energy',
      'Wuwa Wiki Iuno codex — Lv90 raw, base 100% Energy Regen and CRIT',
      'Bellibing characterIntrinsicStats.ts — separately VERIFIED permanent Minor Forte nodes',
    ],
    sourceUrls: [
      'https://www.prydwen.gg/wuthering-waves/stats',
      'https://www.prydwen.gg/wuthering-waves/characters/iuno',
      'https://wuwa.wiki/en/codex/resonators/1410',
    ],
    checkedAt: '2026-10-11',
    notes: [
      '2026-10-11 full raw source sign-off: released 5-star identity, element, weapon, Lv90 HP/ATK/DEF, separately labelled Max Energy cap 125, CRIT Rate 5%, CRIT DMG 150%, base Energy Regen 100% and pre-verified permanent intrinsic nodes.',
      'Prydwen roster/profile agree; Wuwa Wiki confirms base ER 100% and CRIT 5%/150%; reviewed Minor Fortes CRIT Rate 8%, ATK 12%; mode-specific recommendations remain separate.',
      'Only Character raw VERIFIED + DATA_ONLY; does not promote Character Mechanics, recommendations, execution, rotations or DPS.',
    ],
  }),
  row({ id: 'jianxin', name: 'Jianxin', rarity: 5, element: 'Aero', weaponType: 'Gauntlets', hp: 14113, atk: 338, def: 1124, maxEnergy: 150 }),
  row({ id: 'jingran', name: 'Jingran', rarity: 5, element: 'Fusion', weaponType: 'Broadblade', hp: null, atk: null, def: null, maxEnergy: null, releaseStatus: 'RELEASED', sourceLabels: ['Kuro Version 3.6 patch notes', 'Version 3.6 phase-II live release report'], sourceUrls: ['https://wutheringwaves.kurogames.com/zh-tw/main/news/detail/5340', 'https://www.theouterhaven.net/wuthering-waves-version-3-6-update-lamplight-in-mirage-swords-resolve-in-heart-part-two-is-live/'], checkedAt: '2026-10-06', notes: ['Released in Version 3.6 phase II in September 2026; the end of the debut Convene does not make a released Character upcoming. HP, ATK, DEF and Max Energy remain null. Provider DEF 0 and Max Resonance Energy 140 are not promoted; Liberation cost does not prove Max Energy. Mechanics remain separately reviewed.'] }),
  row({ id: 'jinhsi', name: 'Jinhsi', rarity: 5, element: 'Spectro', weaponType: 'Broadblade', hp: 10825, atk: 413, def: 1259, maxEnergy: 125,
    verificationStatus: 'VERIFIED',
    sourceLabels: ['Prydwen Level90 Stats roster — game-facing integers and explicit Max Energy', 'Prydwen Jinhsi kit — identity, base CRIT and Minor Fortes', 'Bellibing canonical independently VERIFIED permanent Minor Forte nodes'],
    sourceUrls: ['https://www.prydwen.gg/wuthering-waves/stats', 'https://www.prydwen.gg/wuthering-waves/characters/jinhsi', 'https://wuwa.wiki/en/codex/resonators/1304'],
    checkedAt: '2026-10-11',
    notes: ['Current Prydwen Level90 roster and individual character profile cross-check the existing unchanged raw HP/ATK/DEF/Max Energy and base CRIT Rate 5% / CRIT DMG 150%.', 'Original permanent Minor Forte +8% CRIT Rate / +12% ATK is independently VERIFIED in characterIntrinsicStats.ts.', 'Wuwa Wiki codex 3.7.12 independently shows base Energy Regen 100%, CRIT Rate 5% and CRIT DMG 150%. Skill-level coefficients and modeled mechanics remain separate.'],
  }),
  row({ id: 'jiyan', name: 'Jiyan', rarity: 5, element: 'Aero', weaponType: 'Broadblade', hp: 10488, atk: 438, def: 1185, maxEnergy: 125,
    verificationStatus: 'VERIFIED',
    sourceLabels: ['Prydwen Level90 Stats roster — game-facing integers and explicit Max Energy', 'Prydwen Jiyan kit — identity, base CRIT and Minor Fortes', 'Bellibing canonical independently VERIFIED permanent Minor Forte nodes'],
    sourceUrls: ['https://www.prydwen.gg/wuthering-waves/stats', 'https://www.prydwen.gg/wuthering-waves/characters/jiyan', 'https://wuwa.wiki/en/codex/resonators/1404'],
    checkedAt: '2026-10-11',
    notes: ['Current Prydwen Level90 roster and individual character profile cross-check the existing unchanged raw HP/ATK/DEF/Max Energy and base CRIT Rate 5% / CRIT DMG 150%.', 'Original permanent Minor Forte +8% CRIT Rate / +12% ATK is independently VERIFIED in characterIntrinsicStats.ts.', 'Jiyan DEF is 1185 in the comparable Prydwen roster and 1186 in the individual character card; do not apply unreviewed rounding or overwrite canonical integer.', 'Wuwa Wiki codex 3.7.12 independently shows base Energy Regen 100%, CRIT Rate 5% and CRIT DMG 150%. Skill-level coefficients and modeled mechanics remain separate.'],
  }),
  row({ id: 'lingyang', name: 'Lingyang', rarity: 5, element: 'Glacio', weaponType: 'Gauntlets', hp: 10388, atk: 438, def: 1210, maxEnergy: 125 }),
  row({ id: 'lucilla', name: 'Lucilla', rarity: 5, element: 'Glacio', weaponType: 'Rectifier', hp: 12238, atk: 375, def: 1198, maxEnergy: 150 }),
  row({ id: 'lucy', name: 'Lucy', rarity: 5, element: 'Spectro', weaponType: 'Pistols', hp: 11025, atk: 425, def: 1149, maxEnergy: 150 }),
  row({ id: 'lumi', name: 'Lumi', rarity: 4, element: 'Electro', weaponType: 'Broadblade', hp: 8500, atk: 338, def: 880, maxEnergy: 125 }),
  row({ id: 'lupa', name: 'Lupa', rarity: 5, element: 'Fusion', weaponType: 'Broadblade', hp: 11913, atk: 388, def: 1185, maxEnergy: 125, notes: ['Current Prydwen Lv90 table uses DEF 1185; CYZED exposes the underlying decimal 1185.55, explaining why another integer presentation may show 1186.'] }),
  row({ id: 'luuk-herssen', name: 'Luuk Herssen', rarity: 5, element: 'Spectro', weaponType: 'Gauntlets', hp: 10300, atk: 463, def: 1112, maxEnergy: 125 }),
  row({ id: 'lynae', name: 'Lynae', rarity: 5, element: 'Spectro', weaponType: 'Pistols', hp: 12238, atk: 375, def: 1198, maxEnergy: 125 }),
  row({ id: 'mornye', name: 'Mornye', rarity: 5, element: 'Fusion', weaponType: 'Broadblade', hp: 15375, atk: 288, def: 1356, maxEnergy: 125, notes: ['Current Prydwen Lv90 table uses DEF 1356; CYZED exposes the underlying decimal 1356.66, explaining why another integer presentation may show 1357.'] }),
  row({ id: 'mortefi', name: 'Mortefi', rarity: 4, element: 'Fusion', weaponType: 'Pistols', hp: 10025, atk: 250, def: 1136, maxEnergy: 125, verificationStatus: 'VERIFIED', sourceLabels: ['Prydwen Lv90 Stats roster (2026-10-08)', 'Prydwen Character profile', 'Wuwa Wiki Resonator codex', 'Wuthering Waves Wiki Max Resonance Energy', 'ArabWuwa/Wuthering.gg conflicting energy labels reviewed'], sourceUrls: ["https://www.prydwen.gg/wuthering-waves/stats","https://www.prydwen.gg/wuthering-waves/characters/mortefi","https://wuwa.wiki/en/codex/resonators/1204","https://wutheringwaves.fandom.com/wiki/Resonance_Energy","https://wutheringwaves.fandom.com/wiki/Mortefi/Combat","https://arabwuwa.com/characters/mortefi/","https://wuthering.gg/characters/mortefi"], checkedAt: '2026-10-11', notes: ["Raw source review 2026-10-11: Prydwen Lv90 Stats roster 10025/250/1136/125 is the canonical published integer layer. Individual Prydwen/Wuwa Wiki show DEF 1137; decimal progression gives DEF 1136.65, an adjacent integer presentation difference, not a change to the roster convention.","Max Energy 125 is explicitly named on both Prydwen surfaces and the independent Max Resonance Energy table; ArabWuwa instead labels 100 Max Energy, while Wuthering.gg labels 140 Max Resonance Energy. Conflicting provider labels are documented rather than silently substituted; no Liberation cost was used. Base 5% CRIT Rate/150% CRIT DMG/100% Energy Regen and permanent Minor Fortes were separately reviewed."] }),
  row({ id: 'phoebe', name: 'Phoebe', rarity: 5, element: 'Spectro', weaponType: 'Rectifier', hp: 10825, atk: 413, def: 1259, maxEnergy: 125 }),
  row({ id: 'phrolova', name: 'Phrolova', rarity: 5, element: 'Havoc', weaponType: 'Rectifier', hp: 10775, atk: 438, def: 1136, maxEnergy: 125 }),
  row({ id: 'qingxiao', name: 'Qingxiao', rarity: 5, element: 'Aero', weaponType: 'Sword', hp: 10300, atk: 462, def: 1112, maxEnergy: null, verificationStatus: 'PARTIALLY_VERIFIED', sourceLabels: ['Prydwen', 'Kuro Games', 'Wuthering.gg', 'current build databases'], checkedAt: '2026-08-25', notes: ['Release status patched from stale V9.15 upcoming state: Qingxiao released in Version 3.6 phase 1.', 'Current sources agree on HP 10300 / ATK 462 / DEF 1112.', 'Max Energy remains null because current sources disagree on a 140 max-energy label versus 125 energy/Liberation semantics; Resonance Cost must not be silently substituted for Max Energy.'] }),
  row({ id: 'qiuyuan', name: 'Qiuyuan', rarity: 5, element: 'Aero', weaponType: 'Sword', hp: 12238, atk: 375, def: 1198, maxEnergy: 125 }),
  row({ id: 'rebecca', name: 'Rebecca', rarity: 5, element: 'Electro', weaponType: 'Pistols', hp: 11600, atk: 400, def: 1173, maxEnergy: 150 }),
  row({ id: 'roccia', name: 'Roccia', rarity: 5, element: 'Havoc', weaponType: 'Gauntlets', hp: 12250, atk: 375, def: 1198, maxEnergy: 125 }),
  row({ id: 'rover-aero', name: 'Rover (Aero)', rarity: 5, element: 'Aero', weaponType: 'Sword', hp: 10775, atk: 438, def: 1136, maxEnergy: 125 }),
  row({ id: 'rover-electro', name: 'Rover (Electro)', rarity: 5, element: 'Electro', weaponType: 'Sword', hp: 10775, atk: 438, def: 1136, maxEnergy: null, verificationStatus: 'PARTIALLY_VERIFIED', sourceLabels: ['CYZED', 'Wuthering.gg', 'Wutheringlab', 'Wuwa Wiki'], checkedAt: '2026-08-25', notes: ['Level-90 HP/ATK/DEF are now resolved. CYZED exposes 10775.00 / 437.50 / 1136.66, the same raw stat family used by released Prydwen/Bellibing characters represented as 10775 / 438 / 1136.', 'Max Energy remains null: current sources disagree between 125 and 140, and Wuthering.gg separately reports a 125 Resonance Liberation cost. Liberation cost is not treated as proof of Max Energy.'] }),
  row({ id: 'rover-havoc', name: 'Rover (Havoc)', rarity: 5, element: 'Havoc', weaponType: 'Sword', hp: 10825, atk: 413, def: 1259, maxEnergy: 125 }),
  row({ id: 'rover-spectro', name: 'Rover (Spectro)', rarity: 5, element: 'Spectro', weaponType: 'Sword', hp: 11400, atk: 375, def: 1369, maxEnergy: 125 }),
  row({ id: 'sanhua', name: 'Sanhua', rarity: 4, element: 'Glacio', weaponType: 'Sword',
    hp: 10063, atk: 275, def: 941, maxEnergy: 100,
    verificationStatus: 'VERIFIED',
    sourceLabels: [
      'Prydwen Lv90 Stats roster — 2026-10-08, game-facing integer convention and explicit Max Energy',
      'Prydwen Sanhua profile — released identity, labelled energy cap, base CRIT and permanent Minor Fortes',
      'Wuwa Wiki Sanhua codex — raw Lv90 cross-check and base 100% Energy Regen',
      'Bellibing characterIntrinsicStats.ts — reviewed permanent Minor Forte nodes',
    ],
    sourceUrls: [
      'https://www.prydwen.gg/wuthering-waves/stats',
      'https://www.prydwen.gg/wuthering-waves/characters/sanhua',
      'https://wuwa.wiki/en/codex/resonators/1102',
    ],
    checkedAt: '2026-10-11',
    notes: [
      'Raw source sign-off: released identity, rarity, element, weapon, Lv90 HP/ATK/DEF, actual Max Energy cap (not Liberation Cost), base 5% CRIT Rate, 150% CRIT DMG, 100% Energy Regen and independently reviewed permanent Minor Forte nodes.',
      'Current Prydwen Lv90 Stats roster and Sanhua card agree on 10063 HP, 275 ATK, 941 DEF and 100 expressly labelled Max Energy. Wuwa Wiki confirms HP/ATK/DEF and 100% base Energy Regen / 5% CRIT Rate / 150% CRIT DMG. Reviewed permanent Minor Fortes give Glacio DMG 12% and ATK% 12%.',
      'Status VERIFIED is raw data only; DATA_ONLY remains unchanged. No DPS, mechanics, profiles, team effects or recommendations are promoted.',
    ],
  }),
  row({ id: 'sigrika', name: 'Sigrika', rarity: 5, element: 'Aero', weaponType: 'Gauntlets', hp: 10775, atk: 438, def: 1136, maxEnergy: 125 }),
  row({ id: 'suisui', name: 'Suisui', rarity: 5, element: 'Glacio', weaponType: 'Rectifier', hp: 16713, atk: 288, def: 1100, maxEnergy: null, verificationStatus: 'PARTIALLY_VERIFIED', sourceLabels: ['Wuwa Wiki', 'Wutheringlab', 'Wuthering.gg', 'ArabWuwa'], checkedAt: '2026-08-25', notes: ['Level-90 HP/ATK/DEF are now resolved to Bellibing’s published integer convention: current Wuwa Wiki reports 16713 / 288 / 1100, while other raw/display sources differ by presentation on HP/ATK but support the same stat family.', 'Max Energy remains null. One current source explicitly labels 175 Max Energy and the Liberation costs 175, while other current databases expose 125 or 140 in energy-labelled fields; Bellibing will not equate those fields without a clean semantic source.'] }),
  row({ id: 'suoming', name: 'Suoming', rarity: 5, element: 'Electro', weaponType: 'Sword', hp: null, atk: null, def: null, maxEnergy: null, releaseStatus: 'CONFIRMED_UPCOMING', verificationStatus: 'PARTIALLY_VERIFIED', sourceLabels: ['Kuro Version 3.7 patch notes', 'Current Version 3.7 banner schedule'], sourceUrls: ['https://wutheringwaves.kurogames.com/zh-tw/main/news/detail/5562', 'https://www.wuwabuild.com/banners'], checkedAt: '2026-10-06', notes: ['Official Version 3.7 identity confirmed; the current phase-I Convene features Hsin, and the current schedule places Suoming in upcoming phase II. No current live/playable release is proved as of this review. Freshness-sensitive until released-build review. HP, ATK, DEF and Max Energy remain null; mutable kit, skills, Sequences and mechanics are not promoted.'] }),
  row({ id: 'taoqi', name: 'Taoqi', rarity: 4, element: 'Havoc', weaponType: 'Broadblade', hp: 8950, atk: 225, def: 1564, maxEnergy: 125, verificationStatus: 'VERIFIED', sourceLabels: ['Prydwen Lv90 Stats roster (2026-10-08)', 'Prydwen Character profile', 'Wuwa Wiki Resonator codex', 'Wuthering Waves Wiki Max Resonance Energy', 'ArabWuwa/Wuthering.gg conflicting energy labels reviewed'], sourceUrls: ["https://www.prydwen.gg/wuthering-waves/stats","https://www.prydwen.gg/wuthering-waves/characters/taoqi","https://wuwa.wiki/en/codex/resonators/1601","https://wutheringwaves.fandom.com/wiki/Resonance_Energy","https://arabwuwa.com/characters/taoqi/","https://wuthering.gg/characters/taoqi"], checkedAt: '2026-10-11', notes: ["Raw source review 2026-10-11: Prydwen Lv90 Stats roster and individual profile both show 8950/225/1564/125; Wuwa Wiki corroborates HP/ATK/DEF and the base 5% CRIT Rate/150% CRIT DMG/100% Energy Regen.","Max Energy 125 is separately labeled on Prydwen and in the independent Max Resonance Energy table; ArabWuwa instead labels 100 Max Energy and Wuthering.gg labels 140 Max Resonance Energy, not adopted without corroboration. No Liberation cost or guide Energy Regen target was substituted. Permanent Minor Fortes remain owned by the verified intrinsic catalog."] }),
  row({ id: 'the-shorekeeper', name: 'The Shorekeeper', rarity: 5, element: 'Spectro', weaponType: 'Rectifier', hp: 16713, atk: 288, def: 1100, maxEnergy: 125 }),
  row({ id: 'verina', name: 'Verina', rarity: 5, element: 'Spectro', weaponType: 'Rectifier',
    hp: 14238, atk: 338, def: 1100, maxEnergy: 175,
    verificationStatus: 'VERIFIED',
    sourceLabels: [
      'Prydwen Lv90 Stats roster — 2026-10-08, game-facing integer convention and explicit Max Energy',
      'Prydwen Verina profile — released identity, labelled energy cap, base CRIT and permanent Minor Fortes',
      'Wuwa Wiki Verina codex — raw Lv90 cross-check and base 100% Energy Regen',
      'Bellibing characterIntrinsicStats.ts — reviewed permanent Minor Forte nodes',
    ],
    sourceUrls: [
      'https://www.prydwen.gg/wuthering-waves/stats',
      'https://www.prydwen.gg/wuthering-waves/characters/verina',
      'https://wuwa.wiki/en/codex/resonators/1503',
    ],
    checkedAt: '2026-10-11',
    notes: [
      'Raw source sign-off: released identity, rarity, element, weapon, Lv90 HP/ATK/DEF, actual Max Energy cap (not Liberation Cost), base 5% CRIT Rate, 150% CRIT DMG, 100% Energy Regen and independently reviewed permanent Minor Forte nodes.',
      'Current Prydwen Lv90 Stats roster and Verina card agree on 14238 HP, 338 ATK, 1100 DEF and 175 explicitly labelled Max Energy. Wuwa Wiki confirms HP/ATK/DEF and 100% base Energy Regen / 5% CRIT Rate / 150% CRIT DMG. Reviewed permanent Minor Fortes give ATK% 12% and Healing Bonus 12%.',
      'Status VERIFIED is raw data only; DATA_ONLY remains unchanged. No DPS, mechanics, profiles, team effects or recommendations are promoted.',
    ],
  }),
  row({ id: 'xiangli-yao', name: 'Xiangli Yao', rarity: 5, element: 'Electro', weaponType: 'Gauntlets', hp: 10625, atk: 425, def: 1222, maxEnergy: 125 }),
  row({ id: 'yangyang', name: 'Yangyang', rarity: 4, element: 'Aero', weaponType: 'Sword',
    hp: 10200, atk: 250, def: 1100, maxEnergy: 100,
    verificationStatus: 'VERIFIED',
    sourceLabels: [
      'Prydwen Lv90 Stats roster — 2026-10-08, game-facing integer convention and explicit Max Energy',
      'Prydwen Yangyang profile — released identity, labelled energy cap, base CRIT and permanent Minor Fortes',
      'Wuwa Wiki Yangyang codex — raw Lv90 cross-check and base 100% Energy Regen',
      'Bellibing characterIntrinsicStats.ts — reviewed permanent Minor Forte nodes',
    ],
    sourceUrls: [
      'https://www.prydwen.gg/wuthering-waves/stats',
      'https://www.prydwen.gg/wuthering-waves/characters/yangyang',
      'https://wuwa.wiki/en/codex/resonators/1402',
    ],
    checkedAt: '2026-10-11',
    notes: [
      'Raw source sign-off: released identity, rarity, element, weapon, Lv90 HP/ATK/DEF, actual Max Energy cap (not Liberation Cost), base 5% CRIT Rate, 150% CRIT DMG, 100% Energy Regen and independently reviewed permanent Minor Forte nodes.',
      'Current Prydwen Lv90 Stats roster and individual Yangyang card agree on 10200 HP, 250 ATK, 1100 DEF and 100 explicitly labelled Max Energy. Wuwa Wiki confirms HP/ATK/DEF and 100% base Energy Regen / 5% CRIT Rate / 150% CRIT DMG. Reviewed permanent Minor Fortes give Aero DMG 12% and ATK% 12%.',
      'Status VERIFIED is raw data only; DATA_ONLY remains unchanged. No DPS, mechanics, profiles, team effects or recommendations are promoted.',
    ],
  }),
  row({ id: 'yangyang-xuanling', name: 'Yangyang: Xuanling', rarity: 5, element: 'Havoc', weaponType: 'Sword', hp: 11025, atk: 425, def: 1149, maxEnergy: 125, sourceLabels: ['V9.15 Characters', 'Prydwen', 'Wutheringlab', 'Wuthering.gg'], notes: ['V9.15 profile identity was live while core stats were blank.', 'Bellibing retains the current Prydwen-family published integer convention for the verified profile; adjacent raw-database integers are tracked as presentation differences rather than silently replacing the benchmark value.'] }),
  row({ id: 'yinlin', name: 'Yinlin', rarity: 5, element: 'Electro', weaponType: 'Rectifier', hp: 11000, atk: 400, def: 1283, maxEnergy: 125 }),
  row({ id: 'youhu', name: 'Youhu', rarity: 4, element: 'Glacio', weaponType: 'Gauntlets', hp: 9975, atk: 263, def: 1051, maxEnergy: 125 }),
  row({ id: 'yuanwu', name: 'Yuanwu', rarity: 4, element: 'Electro', weaponType: 'Gauntlets', hp: 8525, atk: 225, def: 1637, maxEnergy: 125 }),
  row({ id: 'zani', name: 'Zani', rarity: 5, element: 'Spectro', weaponType: 'Gauntlets', hp: 10775, atk: 438, def: 1136, maxEnergy: 125 }),
  row({ id: 'zhezhi', name: 'Zhezhi', rarity: 5, element: 'Glacio', weaponType: 'Rectifier', hp: 12250, atk: 375, def: 1198, maxEnergy: 125, verificationStatus: 'VERIFIED', sourceLabels: ['Prydwen Lv90 Stats roster (2026-10-08)', 'Prydwen Character profile', 'Wuwa Wiki Resonator codex', 'Wuthering Waves Wiki Max Resonance Energy', 'ArabWuwa/Wuthering.gg conflicting energy labels reviewed'], sourceUrls: ["https://www.prydwen.gg/wuthering-waves/stats","https://www.prydwen.gg/wuthering-waves/characters/zhezhi","https://wuwa.wiki/es/codex/resonators/1105","https://wutheringwaves.fandom.com/wiki/Resonance_Energy","https://wutheringwaves.fandom.com/wiki/Zhezhi/Combat","https://arabwuwa.com/characters/zhezhi/","https://wuthering.gg/characters/zhezhi"], checkedAt: '2026-10-11', notes: ["Raw source review 2026-10-11: Prydwen Lv90 Stats roster and individual profile both show 12250/375/1198/125; Wuwa Wiki corroborates HP/ATK/DEF and the base 5% CRIT Rate/150% CRIT DMG/100% Energy Regen. Fandom progression exposes DEF 1197.76; Wuthering.gg's DEF 1197 display is a documented adjacent integer convention.","Max Energy 125 is separately labeled on Prydwen and in the independent Max Resonance Energy table; ArabWuwa instead labels 100 Max Energy and Wuthering.gg labels 140 Max Resonance Energy, not adopted without corroboration. No Liberation cost or guide Energy Regen target was substituted. Permanent Minor Fortes remain owned by the verified intrinsic catalog."] }),
] as const;

export const CHARACTER_BY_ID: ReadonlyMap<string, CharacterGameData> = (() => {
  const map = new Map<string, CharacterGameData>();
  for (const character of CHARACTER_CATALOG) {
    if (map.has(character.id)) throw new Error(`Duplicate character id: ${character.id}`);
    map.set(character.id, character);
  }
  return map;
})();

export function getCharacterGameData(id: string): CharacterGameData | null {
  return CHARACTER_BY_ID.get(id) ?? null;
}
