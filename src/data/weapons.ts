import type { VerificationStatus } from '../contentRegistry.ts';
import type {
  WeaponGameData,
  WeaponRarity,
  WeaponType,
} from '../gameDataDomain.ts';

type ReleaseStatus = WeaponGameData['releaseStatus'];

interface WeaponRow {
  id: string;
  name: string;
  type: WeaponType;
  rarity: WeaponRarity;
  atk: number | null;
  secondaryStat: string | null;
  secondaryValue: number | null;
  releaseStatus?: ReleaseStatus;
  verificationStatus?: VerificationStatus;
  sourceLabels?: readonly string[];
  sourceUrls?: readonly string[];
  notes?: readonly string[];
}

const CHECKED_AT = '2026-08-23';

function w(input: WeaponRow): WeaponGameData {
  if ((input.secondaryStat === null) !== (input.secondaryValue === null)) {
    throw new Error(`${input.id} must provide both secondary stat and value or neither.`);
  }

  return {
    kind: 'WEAPON',
    id: input.id,
    name: input.name,
    releaseStatus: input.releaseStatus ?? 'RELEASED',
    verificationStatus: input.verificationStatus ?? 'VERIFIED',
    integrationStatus: 'DATA_ONLY',
    provenance: {
      sourceLabels: input.sourceLabels ?? ['V9.15 Weapons', 'Prydwen', 'Wutheringlab'],
      sourceUrls: input.sourceUrls,
      checkedAt: CHECKED_AT,
      notes: input.notes,
    },
    weaponType: input.type,
    rarity: input.rarity,
    level90BaseAtk: input.atk,
    secondary: input.secondaryStat === null
      ? null
      : { stat: input.secondaryStat, value: input.secondaryValue! },
    effectIds: [],
  };
}

/**
 * Raw weapon identity + level-90 core stats only.
 *
 * Character recommendations/signature relationships and UI selectability are
 * deliberately excluded. Passive/effect mechanics belong to the separate
 * weapon-effect catalog and will populate effectIds as they are ported.
 *
 * The 120 V9.15 rows already carried a dedicated core-stat audit. Version 3.6
 * adds Glint of Clouds and Thousandfold Deliverance on top of that baseline.
 */
export const WEAPON_CATALOG: readonly WeaponGameData[] = [
  // 5★ Broadblades
  w({ id: 'ages-of-harvest', name: 'Ages of Harvest', type: 'Broadblade', rarity: 5, atk: 587, secondaryStat: 'CRIT Rate', secondaryValue: 0.243 }),
  w({ id: 'kumokiri', name: 'Kumokiri', type: 'Broadblade', rarity: 5, atk: 500, secondaryStat: 'CRIT Rate', secondaryValue: 0.36 }),
  w({ id: 'lustrous-razor', name: 'Lustrous Razor', type: 'Broadblade', rarity: 5, atk: 587, secondaryStat: 'ATK%', secondaryValue: 0.3645 }),
  w({ id: 'radiance-cleaver', name: 'Radiance Cleaver', type: 'Broadblade', rarity: 5, atk: 587, secondaryStat: 'CRIT DMG', secondaryValue: 0.486 }),
  w({ id: 'starfield-calibrator', name: 'Starfield Calibrator', type: 'Broadblade', rarity: 5, atk: 412, secondaryStat: 'Energy Regen', secondaryValue: 0.77 }),
  w({ id: 'thunderflare-dominion', name: 'Thunderflare Dominion', type: 'Broadblade', rarity: 5, atk: 675, secondaryStat: 'CRIT Rate', secondaryValue: 0.1215 }),
  w({ id: 'verdant-summit', name: 'Verdant Summit', type: 'Broadblade', rarity: 5, atk: 587, secondaryStat: 'CRIT DMG', secondaryValue: 0.486 }),
  w({ id: 'wildfire-mark', name: 'Wildfire Mark', type: 'Broadblade', rarity: 5, atk: 587, secondaryStat: 'CRIT DMG', secondaryValue: 0.486 }),
  w({ id: 'thousandfold-deliverance', name: 'Thousandfold Deliverance', type: 'Broadblade', rarity: 5, atk: 413, secondaryStat: 'HP%', secondaryValue: 0.722, releaseStatus: 'CONFIRMED_UPCOMING', verificationStatus: 'PARTIALLY_VERIFIED', sourceLabels: ['Kuro Games Version 3.6 announcement', 'LDShop', 'current 3.6 weapon sources'], sourceUrls: ['https://www.ldshop.gg/blog/wuthering-waves/jingran-build.html'], notes: ['Official 3.6 weapon identity/name is confirmed; level-90 core stats are current pre-release/phase-2 source data and remain PARTIALLY_VERIFIED until the weapon is live.'] }),

  // 5★ Gauntlets
  w({ id: 'abyss-surges', name: 'Abyss Surges', type: 'Gauntlets', rarity: 5, atk: 587, secondaryStat: 'ATK%', secondaryValue: 0.3645 }),
  w({ id: 'blazing-justice', name: 'Blazing Justice', type: 'Gauntlets', rarity: 5, atk: 587, secondaryStat: 'CRIT DMG', secondaryValue: 0.486 }),
  w({ id: 'daybreakers-spine', name: "Daybreaker's Spine", type: 'Gauntlets', rarity: 5, atk: 587, secondaryStat: 'CRIT Rate', secondaryValue: 0.243 }),
  w({ id: 'moongazers-sigil', name: "Moongazer's Sigil", type: 'Gauntlets', rarity: 5, atk: 500, secondaryStat: 'CRIT Rate', secondaryValue: 0.36 }),
  w({ id: 'pulsation-bracer', name: 'Pulsation Bracer', type: 'Gauntlets', rarity: 5, atk: 587, secondaryStat: 'CRIT Rate', secondaryValue: 0.243 }),
  w({ id: 'solsworn-ciphers', name: 'Solsworn Ciphers', type: 'Gauntlets', rarity: 5, atk: 587, secondaryStat: 'CRIT DMG', secondaryValue: 0.486 }),
  w({ id: 'tragicomedy', name: 'Tragicomedy', type: 'Gauntlets', rarity: 5, atk: 587, secondaryStat: 'CRIT Rate', secondaryValue: 0.243 }),
  w({ id: 'veritys-handle', name: "Verity's Handle", type: 'Gauntlets', rarity: 5, atk: 587, secondaryStat: 'CRIT Rate', secondaryValue: 0.243 }),

  // 5★ Pistols
  w({ id: 'lux-and-umbra', name: 'Lux & Umbra', type: 'Pistols', rarity: 5, atk: 587, secondaryStat: 'CRIT DMG', secondaryValue: 0.486 }),
  w({ id: 'phasic-homogenizer', name: 'Phasic Homogenizer', type: 'Pistols', rarity: 5, atk: 587, secondaryStat: 'CRIT DMG', secondaryValue: 0.486 }),
  w({ id: 'skull-thrasher', name: 'Skull Thrasher', type: 'Pistols', rarity: 5, atk: 500, secondaryStat: 'CRIT DMG', secondaryValue: 0.72 }),
  w({ id: 'spectral-trigger', name: 'Spectral Trigger', type: 'Pistols', rarity: 5, atk: 587, secondaryStat: 'CRIT DMG', secondaryValue: 0.486 }),
  w({ id: 'spectrum-blaster', name: 'Spectrum Blaster', type: 'Pistols', rarity: 5, atk: 587, secondaryStat: 'CRIT Rate', secondaryValue: 0.243, notes: ['V9.15 audit explicitly replaced stale 500 ATK / 36% CR data with the current 587 / 24.3% profile.'] }),
  w({ id: 'static-mist', name: 'Static Mist', type: 'Pistols', rarity: 5, atk: 587, secondaryStat: 'CRIT Rate', secondaryValue: 0.243 }),
  w({ id: 'the-last-dance', name: 'The Last Dance', type: 'Pistols', rarity: 5, atk: 500, secondaryStat: 'CRIT DMG', secondaryValue: 0.72 }),
  w({ id: 'woodland-aria', name: 'Woodland Aria', type: 'Pistols', rarity: 5, atk: 500, secondaryStat: 'CRIT Rate', secondaryValue: 0.36 }),

  // 5★ Rectifiers
  w({ id: 'boson-astrolabe', name: 'Boson Astrolabe', type: 'Rectifier', rarity: 5, atk: 525, secondaryStat: 'Energy Regen', secondaryValue: 0.388 }),
  w({ id: 'cosmic-ripples', name: 'Cosmic Ripples', type: 'Rectifier', rarity: 5, atk: 500, secondaryStat: 'ATK%', secondaryValue: 0.54 }),
  w({ id: 'firstlights-herald', name: "Firstlight's Herald", type: 'Rectifier', rarity: 5, atk: 413, secondaryStat: 'Energy Regen', secondaryValue: 0.77, notes: ['V9.15 audit corrected release status to live for Version 3.5.'] }),
  w({ id: 'forged-dwarf-star', name: 'Forged Dwarf Star', type: 'Rectifier', rarity: 5, atk: 500, secondaryStat: 'CRIT Rate', secondaryValue: 0.36 }),
  w({ id: 'freeze-frame', name: 'Freeze Frame', type: 'Rectifier', rarity: 5, atk: 587, secondaryStat: 'CRIT Rate', secondaryValue: 0.243 }),
  w({ id: 'lethean-elegy', name: 'Lethean Elegy', type: 'Rectifier', rarity: 5, atk: 587, secondaryStat: 'CRIT Rate', secondaryValue: 0.243 }),
  w({ id: 'luminous-hymn', name: 'Luminous Hymn', type: 'Rectifier', rarity: 5, atk: 500, secondaryStat: 'CRIT Rate', secondaryValue: 0.36 }),
  w({ id: 'rime-draped-sprouts', name: 'Rime-Draped Sprouts', type: 'Rectifier', rarity: 5, atk: 500, secondaryStat: 'CRIT DMG', secondaryValue: 0.72 }),
  w({ id: 'stellar-symphony', name: 'Stellar Symphony', type: 'Rectifier', rarity: 5, atk: 412, secondaryStat: 'Energy Regen', secondaryValue: 0.77 }),
  w({ id: 'stringmaster', name: 'Stringmaster', type: 'Rectifier', rarity: 5, atk: 500, secondaryStat: 'CRIT Rate', secondaryValue: 0.36 }),
  w({ id: 'whispers-of-sirens', name: 'Whispers of Sirens', type: 'Rectifier', rarity: 5, atk: 500, secondaryStat: 'CRIT DMG', secondaryValue: 0.72 }),

  // 5★ Swords
  w({ id: 'azure-oath', name: 'Azure Oath', type: 'Sword', rarity: 5, atk: 588, secondaryStat: 'CRIT Rate', secondaryValue: 0.243, notes: ['V9.15 audit replaced an outdated 500 ATK / 72% CRIT DMG profile with the live Version 3.5 CRIT Rate profile.'] }),
  w({ id: 'blazing-brilliance', name: 'Blazing Brilliance', type: 'Sword', rarity: 5, atk: 587, secondaryStat: 'CRIT DMG', secondaryValue: 0.486 }),
  w({ id: 'bloodpacts-pledge', name: "Bloodpact's Pledge", type: 'Sword', rarity: 5, atk: 587, secondaryStat: 'Energy Regen', secondaryValue: 0.388 }),
  w({ id: 'defiers-thorn', name: "Defier's Thorn", type: 'Sword', rarity: 5, atk: 412, secondaryStat: 'HP%', secondaryValue: 0.722 }),
  w({ id: 'emerald-sentence', name: 'Emerald Sentence', type: 'Sword', rarity: 5, atk: 587, secondaryStat: 'CRIT Rate', secondaryValue: 0.243 }),
  w({ id: 'emerald-of-genesis', name: 'Emerald of Genesis', type: 'Sword', rarity: 5, atk: 587, secondaryStat: 'CRIT Rate', secondaryValue: 0.243 }),
  w({ id: 'everbright-polestar', name: 'Everbright Polestar', type: 'Sword', rarity: 5, atk: 587, secondaryStat: 'CRIT Rate', secondaryValue: 0.243 }),
  w({ id: 'frostburn', name: 'Frostburn', type: 'Sword', rarity: 5, atk: 587, secondaryStat: 'CRIT Rate', secondaryValue: 0.243 }),
  w({ id: 'laser-shearer', name: 'Laser Shearer', type: 'Sword', rarity: 5, atk: 587, secondaryStat: 'Energy Regen', secondaryValue: 0.388 }),
  w({ id: 'red-spring', name: 'Red Spring', type: 'Sword', rarity: 5, atk: 587, secondaryStat: 'CRIT Rate', secondaryValue: 0.243 }),
  w({ id: 'unflickering-valor', name: 'Unflickering Valor', type: 'Sword', rarity: 5, atk: 412, secondaryStat: 'Energy Regen', secondaryValue: 0.77 }),
  w({ id: 'glint-of-clouds', name: 'Glint of Clouds', type: 'Sword', rarity: 5, atk: 500, secondaryStat: 'CRIT Rate', secondaryValue: 0.36, sourceLabels: ['Kuro Games Version 3.6 announcement', 'Wutheringlab', 'Wuthering.gg'], sourceUrls: ['https://wutheringlab.com/character/qingxiao-build/', 'https://wuthering.gg/characters/qingxiao'], notes: ['Released Version 3.6 phase-1 weapon. Core stats are independently current-source cross-checked. Passive/effect modeling remains separate.'] }),

  // 4★ Broadblades
  w({ id: 'aureate-zenith', name: 'Aureate Zenith', type: 'Broadblade', rarity: 4, atk: 413, secondaryStat: 'CRIT DMG', secondaryValue: 0.405 }),
  w({ id: 'autumntrace', name: 'Autumntrace', type: 'Broadblade', rarity: 4, atk: 413, secondaryStat: 'CRIT Rate', secondaryValue: 0.2025 }),
  w({ id: 'broadblade-41', name: 'Broadblade#41', type: 'Broadblade', rarity: 4, atk: 413, secondaryStat: 'Energy Regen', secondaryValue: 0.324 }),
  w({ id: 'dauntless-evernight', name: 'Dauntless Evernight', type: 'Broadblade', rarity: 4, atk: 338, secondaryStat: 'DEF%', secondaryValue: 0.6156 }),
  w({ id: 'discord', name: 'Discord', type: 'Broadblade', rarity: 4, atk: 338, secondaryStat: 'Energy Regen', secondaryValue: 0.5184 }),
  w({ id: 'helios-cleaver', name: 'Helios Cleaver', type: 'Broadblade', rarity: 4, atk: 413, secondaryStat: 'ATK%', secondaryValue: 0.3038 }),
  w({ id: 'meditations-on-mercy', name: 'Meditations on Mercy', type: 'Broadblade', rarity: 4, atk: 462, secondaryStat: 'ATK%', secondaryValue: 0.1823 }),
  w({ id: 'waning-redshift', name: 'Waning Redshift', type: 'Broadblade', rarity: 4, atk: 462, secondaryStat: 'ATK%', secondaryValue: 0.1823 }),

  // 4★ Gauntlets
  w({ id: 'aether-strike', name: 'Aether Strike', type: 'Gauntlets', rarity: 4, atk: 413, secondaryStat: 'CRIT DMG', secondaryValue: 0.405 }),
  w({ id: 'amity-accord', name: 'Amity Accord', type: 'Gauntlets', rarity: 4, atk: 338, secondaryStat: 'DEF%', secondaryValue: 0.6156 }),
  w({ id: 'celestial-spiral', name: 'Celestial Spiral', type: 'Gauntlets', rarity: 4, atk: 462, secondaryStat: 'ATK%', secondaryValue: 0.1823 }),
  w({ id: 'gauntlets-21d', name: 'Gauntlets#21D', type: 'Gauntlets', rarity: 4, atk: 388, secondaryStat: 'Energy Regen', secondaryValue: 0.3888 }),
  w({ id: 'hollow-mirage', name: 'Hollow Mirage', type: 'Gauntlets', rarity: 4, atk: 413, secondaryStat: 'ATK%', secondaryValue: 0.3038 }),
  w({ id: 'legend-of-drunken-hero', name: 'Legend of Drunken Hero', type: 'Gauntlets', rarity: 4, atk: 462, secondaryStat: 'ATK%', secondaryValue: 0.1823 }),
  w({ id: 'marcato', name: 'Marcato', type: 'Gauntlets', rarity: 4, atk: 338, secondaryStat: 'Energy Regen', secondaryValue: 0.5184 }),
  w({ id: 'stonard', name: 'Stonard', type: 'Gauntlets', rarity: 4, atk: 413, secondaryStat: 'CRIT Rate', secondaryValue: 0.2025 }),

  // 4★ Pistols
  w({ id: 'cadenza', name: 'Cadenza', type: 'Pistols', rarity: 4, atk: 338, secondaryStat: 'Energy Regen', secondaryValue: 0.5184 }),
  w({ id: 'novaburst', name: 'Novaburst', type: 'Pistols', rarity: 4, atk: 413, secondaryStat: 'ATK%', secondaryValue: 0.3038 }),
  w({ id: 'pistols-26', name: 'Pistols#26', type: 'Pistols', rarity: 4, atk: 388, secondaryStat: 'ATK%', secondaryValue: 0.3645 }),
  w({ id: 'relativistic-jet', name: 'Relativistic Jet', type: 'Pistols', rarity: 4, atk: 462, secondaryStat: 'ATK%', secondaryValue: 0.1823 }),
  w({ id: 'romance-in-farewell', name: 'Romance in Farewell', type: 'Pistols', rarity: 4, atk: 462, secondaryStat: 'ATK%', secondaryValue: 0.1823 }),
  w({ id: 'solar-flame', name: 'Solar Flame', type: 'Pistols', rarity: 4, atk: 413, secondaryStat: 'CRIT Rate', secondaryValue: 0.2025 }),
  w({ id: 'thunderbolt', name: 'Thunderbolt', type: 'Pistols', rarity: 4, atk: 388, secondaryStat: 'ATK%', secondaryValue: 0.3645 }),
  w({ id: 'undying-flame', name: 'Undying Flame', type: 'Pistols', rarity: 4, atk: 413, secondaryStat: 'ATK%', secondaryValue: 0.3038 }),

  // 4★ Rectifiers
  w({ id: 'augment', name: 'Augment', type: 'Rectifier', rarity: 4, atk: 413, secondaryStat: 'CRIT Rate', secondaryValue: 0.2025 }),
  w({ id: 'call-of-the-abyss', name: 'Call of the Abyss', type: 'Rectifier', rarity: 4, atk: 413, secondaryStat: 'Energy Regen', secondaryValue: 0.324 }),
  w({ id: 'comet-flare', name: 'Comet Flare', type: 'Rectifier', rarity: 4, atk: 413, secondaryStat: 'HP%', secondaryValue: 0.3038 }),
  w({ id: 'fusion-accretion', name: 'Fusion Accretion', type: 'Rectifier', rarity: 4, atk: 462, secondaryStat: 'ATK%', secondaryValue: 0.1823 }),
  w({ id: 'jinzhou-keeper', name: 'Jinzhou Keeper', type: 'Rectifier', rarity: 4, atk: 388, secondaryStat: 'ATK%', secondaryValue: 0.3645 }),
  w({ id: 'oceans-gift', name: "Ocean's Gift", type: 'Rectifier', rarity: 4, atk: 462, secondaryStat: 'ATK%', secondaryValue: 0.1823 }),
  w({ id: 'radiant-dawn', name: 'Radiant Dawn', type: 'Rectifier', rarity: 4, atk: 413, secondaryStat: 'CRIT DMG', secondaryValue: 0.405 }),
  w({ id: 'rectifier-25', name: 'Rectifier#25', type: 'Rectifier', rarity: 4, atk: 338, secondaryStat: 'Energy Regen', secondaryValue: 0.5184 }),
  w({ id: 'variation', name: 'Variation', type: 'Rectifier', rarity: 4, atk: 338, secondaryStat: 'Energy Regen', secondaryValue: 0.5184 }),
  w({ id: 'waltz-in-masquerade', name: 'Waltz in Masquerade', type: 'Rectifier', rarity: 4, atk: 462, secondaryStat: 'ATK%', secondaryValue: 0.1823 }),

  // 4★ Swords
  w({ id: 'commando-of-conviction', name: 'Commando of Conviction', type: 'Sword', rarity: 4, atk: 413, secondaryStat: 'ATK%', secondaryValue: 0.3038 }),
  w({ id: 'endless-collapse', name: 'Endless Collapse', type: 'Sword', rarity: 4, atk: 462, secondaryStat: 'ATK%', secondaryValue: 0.1823 }),
  w({ id: 'fables-of-wisdom', name: 'Fables of Wisdom', type: 'Sword', rarity: 4, atk: 462, secondaryStat: 'ATK%', secondaryValue: 0.1823 }),
  w({ id: 'feather-edge', name: 'Feather Edge', type: 'Sword', rarity: 4, atk: 413, secondaryStat: 'CRIT Rate', secondaryValue: 0.2025 }),
  w({ id: 'lumingloss', name: 'Lumingloss', type: 'Sword', rarity: 4, atk: 388, secondaryStat: 'ATK%', secondaryValue: 0.3645 }),
  w({ id: 'lunar-cutter', name: 'Lunar Cutter', type: 'Sword', rarity: 4, atk: 413, secondaryStat: 'ATK%', secondaryValue: 0.3038 }),
  w({ id: 'overture', name: 'Overture', type: 'Sword', rarity: 4, atk: 338, secondaryStat: 'Energy Regen', secondaryValue: 0.5184 }),
  w({ id: 'somnoire-anchor', name: 'Somnoire Anchor', type: 'Sword', rarity: 4, atk: 462, secondaryStat: 'ATK%', secondaryValue: 0.1823 }),
  w({ id: 'sword-18', name: 'Sword#18', type: 'Sword', rarity: 4, atk: 388, secondaryStat: 'ATK%', secondaryValue: 0.3645 }),

  // 3★ Broadblades
  w({ id: 'beguiling-melody', name: 'Beguiling Melody', type: 'Broadblade', rarity: 3, atk: 325, secondaryStat: 'ATK%', secondaryValue: 0.243 }),
  w({ id: 'broadblade-of-night', name: 'Broadblade of Night', type: 'Broadblade', rarity: 3, atk: 325, secondaryStat: 'ATK%', secondaryValue: 0.243 }),
  w({ id: 'broadblade-of-voyager', name: 'Broadblade of Voyager', type: 'Broadblade', rarity: 3, atk: 300, secondaryStat: 'Energy Regen', secondaryValue: 0.324 }),
  w({ id: 'guardian-broadblade', name: 'Guardian Broadblade', type: 'Broadblade', rarity: 3, atk: 325, secondaryStat: 'ATK%', secondaryValue: 0.243 }),
  w({ id: 'originite-type-i', name: 'Originite: Type I', type: 'Broadblade', rarity: 3, atk: 300, secondaryStat: 'DEF%', secondaryValue: 0.3848 }),

  // 3★ Gauntlets
  w({ id: 'gauntlets-of-night', name: 'Gauntlets of Night', type: 'Gauntlets', rarity: 3, atk: 325, secondaryStat: 'ATK%', secondaryValue: 0.243 }),
  w({ id: 'gauntlets-of-voyager', name: 'Gauntlets of Voyager', type: 'Gauntlets', rarity: 3, atk: 325, secondaryStat: 'DEF%', secondaryValue: 0.3078 }),
  w({ id: 'guardian-gauntlets', name: 'Guardian Gauntlets', type: 'Gauntlets', rarity: 3, atk: 300, secondaryStat: 'DEF%', secondaryValue: 0.3848 }),
  w({ id: 'originite-type-iv', name: 'Originite: Type IV', type: 'Gauntlets', rarity: 3, atk: 300, secondaryStat: 'CRIT DMG', secondaryValue: 0.405 }),

  // 3★ Pistols
  w({ id: 'guardian-pistols', name: 'Guardian Pistols', type: 'Pistols', rarity: 3, atk: 300, secondaryStat: 'ATK%', secondaryValue: 0.3038 }),
  w({ id: 'originite-type-iii', name: 'Originite: Type III', type: 'Pistols', rarity: 3, atk: 325, secondaryStat: 'ATK%', secondaryValue: 0.243 }),
  w({ id: 'pistols-of-night', name: 'Pistols of Night', type: 'Pistols', rarity: 3, atk: 325, secondaryStat: 'ATK%', secondaryValue: 0.243 }),
  w({ id: 'pistols-of-voyager', name: 'Pistols of Voyager', type: 'Pistols', rarity: 3, atk: 300, secondaryStat: 'ATK%', secondaryValue: 0.3038 }),

  // 3★ Rectifiers
  w({ id: 'guardian-rectifier', name: 'Guardian Rectifier', type: 'Rectifier', rarity: 3, atk: 325, secondaryStat: 'ATK%', secondaryValue: 0.243 }),
  w({ id: 'originite-type-v', name: 'Originite: Type V', type: 'Rectifier', rarity: 3, atk: 300, secondaryStat: 'HP%', secondaryValue: 0.3038 }),
  w({ id: 'rectifier-of-night', name: 'Rectifier of Night', type: 'Rectifier', rarity: 3, atk: 325, secondaryStat: 'ATK%', secondaryValue: 0.243 }),
  w({ id: 'rectifier-of-voyager', name: 'Rectifier of Voyager', type: 'Rectifier', rarity: 3, atk: 300, secondaryStat: 'Energy Regen', secondaryValue: 0.324 }),

  // 3★ Swords
  w({ id: 'guardian-sword', name: 'Guardian Sword', type: 'Sword', rarity: 3, atk: 300, secondaryStat: 'HP%', secondaryValue: 0.3038 }),
  w({ id: 'originite-type-ii', name: 'Originite: Type II', type: 'Sword', rarity: 3, atk: 325, secondaryStat: 'ATK%', secondaryValue: 0.243 }),
  w({ id: 'sword-of-night', name: 'Sword of Night', type: 'Sword', rarity: 3, atk: 325, secondaryStat: 'ATK%', secondaryValue: 0.243 }),
  w({ id: 'sword-of-voyager', name: 'Sword of Voyager', type: 'Sword', rarity: 3, atk: 300, secondaryStat: 'Energy Regen', secondaryValue: 0.324 }),

  // 2★
  w({ id: 'tyro-broadblade', name: 'Tyro Broadblade', type: 'Broadblade', rarity: 2, atk: 275, secondaryStat: 'ATK%', secondaryValue: 0.1485 }),
  w({ id: 'tyro-gauntlets', name: 'Tyro Gauntlets', type: 'Gauntlets', rarity: 2, atk: 275, secondaryStat: 'ATK%', secondaryValue: 0.1485 }),
  w({ id: 'tyro-pistols', name: 'Tyro Pistols', type: 'Pistols', rarity: 2, atk: 275, secondaryStat: 'ATK%', secondaryValue: 0.1485 }),
  w({ id: 'tyro-rectifier', name: 'Tyro Rectifier', type: 'Rectifier', rarity: 2, atk: 275, secondaryStat: 'ATK%', secondaryValue: 0.1485 }),
  w({ id: 'tyro-sword', name: 'Tyro Sword', type: 'Sword', rarity: 2, atk: 275, secondaryStat: 'ATK%', secondaryValue: 0.1485 }),

  // 1★
  w({ id: 'training-broadblade', name: 'Training Broadblade', type: 'Broadblade', rarity: 1, atk: 250, secondaryStat: 'ATK%', secondaryValue: 0.1148 }),
  w({ id: 'training-gauntlets', name: 'Training Gauntlets', type: 'Gauntlets', rarity: 1, atk: 250, secondaryStat: 'ATK%', secondaryValue: 0.1148 }),
  w({ id: 'training-pistols', name: 'Training Pistols', type: 'Pistols', rarity: 1, atk: 250, secondaryStat: 'ATK%', secondaryValue: 0.1148 }),
  w({ id: 'training-rectifier', name: 'Training Rectifier', type: 'Rectifier', rarity: 1, atk: 250, secondaryStat: 'ATK%', secondaryValue: 0.1148 }),
  w({ id: 'training-sword', name: 'Training Sword', type: 'Sword', rarity: 1, atk: 250, secondaryStat: 'ATK%', secondaryValue: 0.1148 }),
] as const;

export const WEAPON_BY_ID: ReadonlyMap<string, WeaponGameData> = (() => {
  const map = new Map<string, WeaponGameData>();
  for (const weapon of WEAPON_CATALOG) {
    if (map.has(weapon.id)) throw new Error(`Duplicate weapon id: ${weapon.id}`);
    map.set(weapon.id, weapon);
  }
  return map;
})();

export function getWeaponGameData(id: string): WeaponGameData | null {
  return WEAPON_BY_ID.get(id) ?? null;
}
