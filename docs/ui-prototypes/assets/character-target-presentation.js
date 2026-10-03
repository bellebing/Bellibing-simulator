/**
 * UI-only projection contract for a future canonical Character recommendation adapter.
 * This is not source truth and must never be used by settings persistence or evaluation.
 *
 * @typedef {{ metric: string, label: string, status: 'READY', displayValue: string }
 *   | { metric: string, label: string, status: 'PENDING', displayValue?: never }} RecommendedCharacterStat
 */

// Explicit PENDING visual scaffold only. No recommendation values exist in this prototype.
const AUGUSTA_PENDING_SCAFFOLD = Object.freeze([
  ['TOTAL_HP', 'HP'],
  ['TOTAL_DEF', 'DEF'],
  ['TOTAL_ATK', 'ATK'],
  ['TOTAL_CRIT_RATE', 'CRIT Rate'],
  ['TOTAL_CRIT_DAMAGE', 'CRIT DMG'],
  ['TOTAL_ENERGY_REGEN', 'Energy Regen'],
  ['ELECTRO_DMG_BONUS', 'Electro DMG Bonus'],
].map(([metric, label]) => Object.freeze({ metric, label, status: 'PENDING' })));

/**
 * Replace this adapter when the dedicated canonical recommendation profile exists.
 * Deliberately accepts no ER gates, Build Priorities, Echo Policy or user settings.
 * @param {string} characterId
 * @returns {ReadonlyArray<RecommendedCharacterStat>}
 */
export function recommendedCharacterStatsPresentation(characterId) {
  return characterId === 'augusta' ? AUGUSTA_PENDING_SCAFFOLD : [];
}
