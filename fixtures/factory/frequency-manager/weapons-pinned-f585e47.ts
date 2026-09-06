/**
 * Bounded offline fixture excerpt from Voruzhu/FrequencyManager
 * pinned upstream f585e47a868cb2b65845367b976a1781f130c758.
 * Only the two already-reviewed Factory Milestone 01/03 weapon rows are retained.
 */
export const WEAPONS = [
  { id: "abyss-surges", name: "Abyss Surges", weaponType: "Gauntlets", rarity: 5, baseAtk: 588, secondaryStat: "ATK%", secondaryValue: 36.5, passive: "fixture", selfBuffs: [{"stat":"energyRegen","label":"Energy Regen","value":12.8,"conditional":false}], icon: "icons/weapons/abyss-surges.webp" },
  { id: "ages-of-harvest", name: "Ages of Harvest", weaponType: "Broadblade", rarity: 5, baseAtk: 588, secondaryStat: "CRIT Rate", secondaryValue: 24.3, passive: "fixture", selfBuffs: [{"stat":"elemDmg","label":"DMG Bonus","value":12,"conditional":false},{"stat":"dmgBonus","label":"Res. Skill DMG","value":24,"conditional":true,"appliesTo":["skill"]}], icon: "icons/weapons/ages-of-harvest.webp" },
];
