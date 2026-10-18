import { hasInactiveEchoes } from './echo-activation.js';
import { CHARACTER_TARGETS } from './targets.js';
import { characterCardModel } from './character-card.js';

// Canonical recommendation metrics, with explicit saved-stat row bindings.
// Unsupported element recommendations remain missing; never reuse Electro for another element.
export const RESULT_STATS = [
  ['TOTAL_HP',0], ['TOTAL_ATK',1], ['TOTAL_DEF',2], ['TOTAL_ENERGY_REGEN',3],
  ['TOTAL_CRIT_RATE',4], ['TOTAL_CRIT_DAMAGE',5], ['ELEMENT_DMG_BONUS',6],
  ['BASIC_ATTACK_DMG_BONUS',7], ['HEAVY_ATTACK_DMG_BONUS',8],
  ['RESONANCE_SKILL_DMG_BONUS',9], ['RESONANCE_LIBERATION_DMG_BONUS',10], ['HEALING_BONUS',11],
];
export const SETTING_METRICS = Object.freeze({
  'CRIT Rate':'TOTAL_CRIT_RATE', 'CRIT DMG':'TOTAL_CRIT_DAMAGE', 'Energy Regen':'TOTAL_ENERGY_REGEN',
  'ATK%':'TOTAL_ATK', 'Flat ATK':'TOTAL_ATK', 'Heavy Attack DMG':'HEAVY_ATTACK_DMG_BONUS',
});
export function simulationModel(person, saved, expected = {}) {
  const sandboxObserved=saved.sandboxBuild&&saved.sandboxStatProjection?.observed?.status==='SOURCE_BACKED_STATIC_COMPONENT';
  const incompleteProjection = saved.sandboxBuild?!sandboxObserved:hasInactiveEchoes(saved);
  const stats = characterCardModel(person, saved).stats;
  const target = CHARACTER_TARGETS.find(row => row.characterId === person.id);
  return { characterId:person.id, name:person.name, recorded:saved.sandboxBuild?!!sandboxObserved:saved.hasRecordedRun && !incompleteProjection, scopeLabel:saved.sandboxBuild?sandboxObserved?'Observed static stats · conditional effects Pending':'Awaiting five completed observed Echoes':null, pending:incompleteProjection ? 'ACTIVE_BUILD_PROJECTION_PENDING' : null,
    rows:RESULT_STATS.map(([id,index]) => {
      const metric = id === 'ELEMENT_DMG_BONUS' ? `${person.identityElement?.toUpperCase()}_DMG_BONUS` : id;
      const recommendation = target?.rows.find(row => row.metric === metric);
      const observed = saved.sandboxBuild?sandboxObserved?saved.sandboxStatProjection.observedValues[metric]??null:null:saved.hasRecordedRun && !incompleteProjection ? saved.stats[index]?.[1] : null;
      return { id:metric, label:stats[index][0], recommended:recommendation?.status === 'READY' ? recommendation.displayValue : null,
        source:recommendation?.sourceValue ?? null, expected:incompleteProjection ? null : expected[metric] ?? null,
        simulated:observed!==undefined&&observed!==null&&observed!=='—'?observed:null };
    }) };
}
// An external presentation producer must supply exact result IDs AND changed values.
// This guard never discovers dependencies through labels or assumes all settings affect stats.
export function changedResults(previous, next, affected) {
  return affected.filter(({id,role}) => ['recommended','expected','simulated'].includes(role)
    && previous.rows.some(row => row.id === id)
    && next.rows.some(row => row.id === id && row[role] !== null)
    && previous.rows.find(row => row.id === id)[role] !== next.rows.find(row => row.id === id)[role]);
}
