import type {
  CharacterContent,
  EchoContent,
  EchoSetContent,
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
 * Those live in profileDomain.ts as independent, composable relationship bases.
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

export type EchoCost = 1 | 3 | 4;
export type EchoThreatClass = 'COMMON' | 'ELITE' | 'OVERLORD' | 'CALAMITY';

/**
 * Raw Echo species identity only.
 *
 * It deliberately does not contain:
 * - whether a character should equip the Echo
 * - recommended main/substats
 * - build slot position
 * - modeled Echo Skill damage/buffs/triggers
 *
 * `threatClass` may remain null when the source proves COST 4 but does not
 * safely distinguish Overlord from Calamity.
 */
export interface EchoGameData extends EchoContent {
  /** Stable upstream 5-star item/entity id used to trace the raw record. */
  sourceId: number;
  cost: EchoCost;
  threatClass: EchoThreatClass | null;
  /** Independent Sonata records this species may roll on capture. */
  sonataSetIds: readonly string[];
  /** Pointer reserved for the separately modeled active Echo Skill layer. */
  skillEffectId?: string;
}

export interface SonataPieceEffectRaw {
  pieces: number;
  description: string;
}

/**
 * Raw Sonata identity + source text. Text is not equivalent to a combat model;
 * triggers/stacks/uptime are interpreted later by a separate effect adapter.
 */
export interface SonataGameData extends EchoSetContent {
  sourceId: number;
  activationPieces: readonly number[];
  rawPieceEffects: readonly SonataPieceEffectRaw[];
}
