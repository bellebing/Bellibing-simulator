import type {
  CharacterContent,
  WeaponContent,
} from './contentRegistry.ts';

export type Element =
  | 'Aero'
  | 'Electro'
  | 'Fusion'
  | 'Glacio'
  | 'Havoc'
  | 'Spectro';

export type WeaponType =
  | 'Broadblade'
  | 'Gauntlets'
  | 'Pistols'
  | 'Rectifier'
  | 'Sword';

export type CharacterRarity = 4 | 5;
export type WeaponRarity = 1 | 2 | 3 | 4 | 5;

export interface CharacterLevel90Stats {
  hp: number | null;
  atk: number | null;
  def: number | null;
  /**
   * Preserves the V9.15/Prydwen `Max Energy` field as raw game data.
   * Combat adapters must not reinterpret disputed/missing values silently.
   */
  maxEnergy: number | null;
}

export interface CharacterBaseCombatStats {
  critRate: number | null;
  critDamage: number | null;
  energyRegen: number | null;
}

export type CharacterIntrinsicStatName =
  | 'Aero DMG'
  | 'ATK%'
  | 'CRIT DMG'
  | 'CRIT Rate'
  | 'Healing Bonus'
  | 'HP%';

export interface CharacterIntrinsicStat {
  stat: CharacterIntrinsicStatName;
  value: number;
}

/**
 * Raw character data only.
 *
 * Deliberately DOES NOT contain:
 * - signature/default/recommended weapon
 * - recommended Echoes or substat targets
 * - default team
 * - sequence/build baseline
 * - rotation or action assumptions
 *
 * Those are product/profile relationships, not facts about the character.
 */
export interface CharacterGameData extends Omit<CharacterContent, 'element' | 'weaponType'> {
  element: Element | null;
  weaponType: WeaponType | null;
  rarity: CharacterRarity;
  level90: CharacterLevel90Stats;
  baseCombat: CharacterBaseCombatStats;
  intrinsicStats: readonly CharacterIntrinsicStat[];
}

export interface WeaponSecondaryStat {
  stat: string;
  value: number;
}

/** Raw weapon identity/stats. Character recommendations live elsewhere. */
export interface WeaponGameData extends Omit<WeaponContent, 'weaponType'> {
  weaponType: WeaponType;
  rarity: WeaponRarity;
  level90BaseAtk: number | null;
  secondary: WeaponSecondaryStat | null;
  /** IDs into a separately modeled weapon-effect catalog. */
  effectIds: readonly string[];
}

/**
 * Product defaults are pointers between independent data records.
 * Changing a recommendation must never mutate CharacterGameData itself.
 */
export interface CharacterDefaultProfile {
  characterId: string;
  defaultWeaponId?: string;
  recommendedEchoProfileId?: string;
  defaultTeamProfileId?: string;
  defaultRotationProfileId?: string;
}
