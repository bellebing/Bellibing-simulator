// Owner-selected product defaults for ordinary CRIT-damage Improve builds.
// Guide priorities are reviewed *relative preferences*, not per-Echo minimum
// thresholds, execution promises, or an invitation to force CRIT onto supports.
import {characterRecommendations} from './characterRecommendations.mjs';
import {IMPROVE_DPR_SUBSTAT_SENSITIVITIES} from './data/improveDprSubstatSensitivities.mjs';

// Explicit conservative product-scope review: omitting a Character means Pending,
// even if its source happens to mention CRIT. Do not infer DPS role from CRIT text.
export const CRIT_DPS_PRODUCT_SCOPE = Object.freeze([
 'aemeath','calcharo','camellya','carlotta','changli','chisa','chixia',
 'danjin','encore','galbrena','hsin','jinhsi','jiyan','lingyang',
 'lucilla','lucy','luuk-herssen','phoebe','phrolova','qingxiao',
 'qiuyuan','rebecca','roccia','rover-havoc','xiangli-yao','zani'
]);

/** Existing reviewed guide is the source of rank, not this table. The table
 * marks owner-approved product roles: support/hybrid => no mandatory CRIT,
 * and the subset of guide stats appropriate to the support's scaling.
 * Never assign a source-absent stat or manufacture a total-ER requirement. */
const GUIDE_FALLBACK_PRODUCT_POLICY=Object.freeze({
 'aalto':{hard:[],supportStats:['CRIT Rate','CRIT DMG','ATK%']},
 'baizhi':{hard:[],supportStats:['HP%','Flat HP']},
 'brant':{hard:['CRIT Rate','CRIT DMG']},
 'cantarella':{hard:['CRIT Rate','CRIT DMG']},
 'jianxin':{hard:[],supportStats:['CRIT Rate','CRIT DMG','ATK%']},
 'lumi':{hard:['CRIT Rate','CRIT DMG']},
 'mortefi':{hard:[],supportStats:['CRIT Rate','CRIT DMG','ATK%']},
 'rover-aero':{hard:[],supportStats:['CRIT Rate','CRIT DMG','ATK%']},
 'rover-electro':{hard:['CRIT Rate','CRIT DMG']},
 'rover-spectro':{hard:[],supportStats:['CRIT Rate','CRIT DMG','ATK%']},
 'sanhua':{hard:[],supportStats:['CRIT Rate','CRIT DMG','ATK%']},
 'taoqi':{hard:[],supportStats:['DEF%','Flat DEF']},
 'the-shorekeeper':{hard:[],supportStats:['CRIT DMG','Liberation DMG','HP%']},
 'verina':{hard:[],supportStats:['ATK%','Flat ATK']},
 'yangyang':{hard:[],supportStats:['CRIT Rate','CRIT DMG','ATK%']},
 'yinlin':{hard:['CRIT Rate','CRIT DMG']},
 'youhu':{hard:[],supportStats:['ATK%','Flat ATK','Skill DMG']},
 'yuanwu':{hard:[],supportStats:['DEF%','Flat DEF']},
 'zhezhi':{hard:['CRIT Rate','CRIT DMG']}
});
const DPR_HARD_PRODUCT_POLICY=Object.freeze({
 'buling':['CRIT Rate','CRIT DMG'],
 'cartethyia':['CRIT Rate'], // HP% outvalues CRIT DMG in selected scenario.
 'ciaccona':['CRIT Rate','CRIT DMG'],
 'denia':['CRIT Rate','CRIT DMG'],
 'hiyuki':['CRIT Rate','CRIT DMG'],
 'iuno':['CRIT Rate','CRIT DMG'],
 'jingran':['CRIT Rate','CRIT DMG'], // HP until 50k is a separate build goal.
 'lupa':['CRIT Rate','CRIT DMG'],
 'lynae':['CRIT Rate','CRIT DMG'],
 'mornye':[], // DEF/Liberation/ER support; no universal per-Echo CRIT.
 'sigrika':['CRIT Rate','CRIT DMG'],
 'suisui':['CRIT DMG'], // HP% precedes CRIT Rate in guide; mixed scaling.
 'yangyang-xuanling':['CRIT Rate','CRIT DMG']
});
export const ADDITIONAL_PRODUCT_DEFAULT_IDS=Object.freeze([
 ...Object.keys(DPR_HARD_PRODUCT_POLICY),...Object.keys(GUIDE_FALLBACK_PRODUCT_POLICY)
]);
const oneFlex=({characterId,hard,flex,sourceKind,sourceUrl,...provenance})=>({
 characterId,hard,flex,flexCount:1,
 sourceKind,sourceUrl,...provenance,
 meaning:'OWNER_PRODUCT_DEFAULT_NOT_SOURCE_VERIFIED_PER_ECHO_REQUIREMENT',
 minimumPolicy:'LOWEST_EXISTING_CANONICAL_SUBSTAT_TIER',
 erPolicy:'WHOLE_BUILD_ENERGY_REGEN_SEPARATE_FROM_ECHO_REQUIREMENTS'
});
function newProductDefault(characterId){
 const dpr=IMPROVE_DPR_SUBSTAT_SENSITIVITIES[characterId];
 if(dpr){
  const hard=DPR_HARD_PRODUCT_POLICY[characterId];
  if(!hard)return null;
  // Read exactly the DPR Substat Value marginal percentages. Do not consume
  // 'General Stat Recommendation' or 'Stats used for Calcs' total stats.
  const ranked=Object.entries(dpr.valuePercent)
   .filter(([name,pct])=>name!=='Energy Regen'&&!hard.includes(name)&&Number.isFinite(pct)&&pct>0)
   .sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0]));
  // Sigrika's third non-ER option contributes only 0.14% in this scenario;
  // retain the two meaningful guide-compatible Flex options instead.
  const flex=ranked.slice(0,characterId==='sigrika'?2:3).map(([name])=>name);
  if(!flex.length||hard.some(name=>!Number.isFinite(dpr.valuePercent[name])||dpr.valuePercent[name]<=0))return null;
  return oneFlex({characterId,hard:[...hard],flex,
   sourceKind:'DPR_SUBSTAT_VALUE',sourceUrl:dpr.sourceUrl,
   sourceSheetTitle:dpr.sheetName,sourceRange:dpr.sourceRange,
   sourceReviewStatus:dpr.reviewStatus,
   scenarioScope:'DPR_SCENARIO_SPECIFIC_MARGINAL_VALUE_NOT_TOTAL_STAT',
   selectedValuePercent:Object.fromEntries([...hard,...flex].map(name=>[name,dpr.valuePercent[name]]))});
 }
 const rules=GUIDE_FALLBACK_PRODUCT_POLICY[characterId];
 if(!rules)return null;
 const source=characterRecommendations(characterId),guidance=source?.priorities;
 if(!source||guidance?.kind!=='SOURCE_PRIORITY_GUIDANCE_ONLY')return null;
 const hard=[...rules.hard],allowed=rules.supportStats??null;
 if(hard.some(name=>!guidance.orderedStats.includes(name)))return null;
 const priorityNames=guidance.entries.filter(row=>!row.condition&&row.stats.length===1)
  .flatMap(row=>row.stats);
 const flex=[...new Set(priorityNames)]
  .filter(name=>name!=='Energy Regen'&&!hard.includes(name)&&(eligible.has(name)||allowed&&['CRIT Rate','CRIT DMG'].includes(name))&&(!allowed||allowed.includes(name))).slice(0,3);
 if(!flex.length)return null;
 return oneFlex({characterId,hard,flex,
  sourceKind:'PRYDWEN_GUIDE_PRIORITY',sourceUrl:source.sourceUrl,
  sourceLinesSha256:source.sourceLinesSha256,
  sourceReviewStatus:'REVIEWED_GUIDE_RELATIVE_PRIORITY',
  unresolvedSourceTokens:guidance.unresolved.map(row=>row.sourceToken)});
}

const scope=new Set(CRIT_DPS_PRODUCT_SCOPE);
const hard=Object.freeze(['CRIT Rate','CRIT DMG']);
const eligible=new Set(['ATK%','Flat ATK','HP%','Flat HP','DEF%','Flat DEF',
 'Basic Attack DMG','Heavy Attack DMG','Skill DMG','Liberation DMG']);
export function improveProductEchoDefault(characterId){
 if(!scope.has(characterId))return newProductDefault(characterId);
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
