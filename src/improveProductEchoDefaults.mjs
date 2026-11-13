// Owner-selected product defaults for ordinary CRIT-damage Improve builds.
// Guide priorities are reviewed *relative preferences*, not per-Echo minimum
// thresholds, execution promises, or an invitation to force CRIT onto supports.
import {characterRecommendations} from './characterRecommendations.mjs';

// Explicit conservative product-scope review: omitting a Character means Pending,
// even if its source happens to mention CRIT. Do not infer DPS role from CRIT text.
export const CRIT_DPS_PRODUCT_SCOPE = Object.freeze([
 'aemeath','calcharo','camellya','carlotta','changli','chisa','chixia',
 'danjin','encore','galbrena','hsin','jinhsi','jiyan','lingyang',
 'lucilla','lucy','luuk-herssen','phoebe','phrolova','qingxiao',
 'qiuyuan','rebecca','roccia','rover-havoc','xiangli-yao','zani'
]);
const scope=new Set(CRIT_DPS_PRODUCT_SCOPE);
const hard=Object.freeze(['CRIT Rate','CRIT DMG']);
const eligible=new Set(['ATK%','Flat ATK','HP%','Flat HP','DEF%','Flat DEF',
 'Basic Attack DMG','Heavy Attack DMG','Skill DMG','Liberation DMG']);
export function improveProductEchoDefault(characterId){
 if(!scope.has(characterId))return null;
 const source=characterRecommendations(characterId),guidance=source?.priorities;
 if(!source||guidance?.kind!=='SOURCE_PRIORITY_GUIDANCE_ONLY'||guidance.unresolved.length) return null;
 if(!hard.every(name=>guidance.orderedStats.includes(name)))return null;
 // A conditional CRIT target (e.g. Hiyuki's until-75% guidance) is not
 // evidence that a CRIT roll belongs on every Echo in every build.
 if(guidance.entries.some(row=>row.condition&&row.stats.some(name=>hard.includes(name))))return null;
 // A CRIT main-stat source is corroboration of the narrow DPS presentation
 // scope. Non-CRIT main stat, hybrid/support/HP/DEF mechanics remain Pending.
 const main=source.mainStats?.find(row=>row.cost===4&&row.slotOrder===1)?.sourceText;
 if(!main||!/^CRIT Rate\s*\/\s*CRIT DMG$/i.test(main))return null;
 // Never turn a source's conditional whole-build ER goal into an unconditional
 // per-Echo minimum. Skip compound aliases (Qingxiao's three-way equal group)
 // rather than falsely choosing one member as better than its peers.
 const individual=new Set(guidance.entries.filter(row=>row.stats.length===1&&!row.condition).map(row=>row.stats[0]));
 const flex=guidance.orderedStats.filter(name=>eligible.has(name)&&individual.has(name)).slice(0,3);
 if(!flex.length||hard.some(name=>flex.includes(name)))return null;
 return {characterId,hard:[...hard],flex,flexCount:1,
  meaning:'OWNER_PRODUCT_DEFAULT_NOT_SOURCE_VERIFIED_PER_ECHO_REQUIREMENT',
  sourceUrl:source.sourceUrl,sourceLinesSha256:source.sourceLinesSha256,
  minimumPolicy:'LOWEST_EXISTING_CANONICAL_SUBSTAT_TIER',
  skipped:'CONDITIONAL_ENERGY_REGEN_AND_COMPOUND_GUIDE_PRIORITIES'};
}
