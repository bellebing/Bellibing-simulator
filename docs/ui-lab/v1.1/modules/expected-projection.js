// Source-pinned Augusta/default Expected, independent of the UI Lab's sample
// equipped cards or illustrative result fixtures. Do not use for other Characters.
import characterData from '../../../ui-prototypes/assets/build-stats/runtime-data.json' with { type: 'json' };
import weaponData from '../../../ui-prototypes/assets/weapons/browser-data.json' with { type: 'json' };
import { projectStaticBuildStats } from '../../../ui-prototypes/assets/build-stats/projection.mjs';
import { acceptedEchoDistribution, expectedFiveEchoSubstats } from '../../../../src/expectedEchoStats.mjs';
import { ECHO_SETTING_STATS, ECHO_ROLL_WEIGHTS } from './settings-catalog.js';

// Reviewed Rank-5 +25 primary and secondary Main Stats from src/echoMainStats.ts.
// The 4/3/3/1/1 CR/Electro/Electro/ATK/ATK pattern is the approved
// Augusta DEFAULT preset, not an inference from simulated/equipped account cards.
const MAIN = Object.freeze([
  {cost:4,primary:'CRIT Rate',value:.22,secondary:'Flat ATK',flat:150},
  {cost:3,primary:'Electro DMG',value:.30,secondary:'Flat ATK',flat:100},
  {cost:3,primary:'Electro DMG',value:.30,secondary:'Flat ATK',flat:100},
  {cost:1,primary:'ATK%',value:.18,secondary:'Flat HP',flat:2280},
  {cost:1,primary:'ATK%',value:.18,secondary:'Flat HP',flat:2280},
]);
const EXAMPLE = Object.freeze([
  {name:'Flat HP',value:320},{name:'Flat ATK',value:30},{name:'Flat DEF',value:40},
  {name:'CRIT Rate',value:.063},{name:'CRIT DMG',value:.126}
]);
const STAT_COLUMNS = Object.freeze([
  ['TOTAL_HP','hp',true],['TOTAL_ATK','atk',true],['TOTAL_DEF','def',true],
  ['TOTAL_ENERGY_REGEN','energyRegen'],['TOTAL_CRIT_RATE','critRate'],['TOTAL_CRIT_DAMAGE','critDamage'],
  ['ELECTRO_DMG_BONUS','elementDamageBonus'],['BASIC_ATTACK_DMG_BONUS','basicAttackDamageBonus'],
  ['HEAVY_ATTACK_DMG_BONUS','heavyAttackDamageBonus'],['RESONANCE_SKILL_DMG_BONUS','resonanceSkillDamageBonus'],
  ['RESONANCE_LIBERATION_DMG_BONUS','resonanceLiberationDamageBonus'],['HEALING_BONUS','healingBonus'],
]);
const STAT_KEYS = Object.freeze({
  'HP%':['hp'], 'Flat HP':['hp'], 'ATK%':['atk'], 'Flat ATK':['atk'],
  'DEF%':['def'], 'Flat DEF':['def'], 'Energy Regen':['energyRegen'],
  'CRIT Rate':['critRate'], 'CRIT DMG':['critDamage'], 'Basic Attack DMG':['basicAttackDamageBonus'],
  'Heavy Attack DMG':['heavyAttackDamageBonus'], 'Skill DMG':['resonanceSkillDamageBonus'],
  'Liberation DMG':['resonanceLiberationDamageBonus'],
});
const stats=ECHO_SETTING_STATS.map(row=>({id:row.id,tiers:row.tiers,weights:ECHO_ROLL_WEIGHTS[row.id]}));
const character=characterData.characters.find(row=>row.id==='augusta');
const weapon=weaponData.weapons.find(row=>row.id==='thunderflare-dominion');
if(!character||!weapon||weapon.weaponType!=='Broadblade')throw Error('Canonical Augusta/default context unavailable');
// The verified projector validates exact +25 card fields; use a fixed canonical
// exemplar and replace ONLY its substat contributions with conditional means.
const exampleSlots=MAIN.map((slot,index)=>({
  echoId:'augusta-expected-'+index,cost:slot.cost,rank:5,level:25,
  mainStat:{name:slot.primary,value:slot.value},
  secondaryMainStat:{name:slot.secondary,value:slot.flat},
  substats:EXAMPLE.map(row=>({...row}))
}));
const echoStatContract={
  rank:5,levels:[0,5,10,15,20,25],maxSubstats:5,
  mainStatsByCostAndLevel:Object.fromEntries(MAIN.map(slot=>[String(slot.cost),{'25':[{name:slot.primary,value:slot.value}]}])),
  secondaryMainStatsByCostAndLevel:Object.fromEntries(MAIN.map(slot=>[String(slot.cost),{'25':{name:slot.secondary,value:slot.flat}}])),
  substats:stats.map(row=>({name:row.id,values:row.tiers}))
};
// One cost-3 and one cost-1 main-stat identity per cost; ensure both match.
const reference=projectStaticBuildStats({
  character,weapon,echoSlots:exampleSlots,echoStatContract,
  activeForteStats:character.intrinsicStats,activeWeaponStats:weapon.staticBuildStats
});
const anchor=Object.fromEntries(stats.map(row=>[row.id,EXAMPLE.find(s=>s.name===row.id)?.value*5||0]));
const scalar={hp:character.level90.hp,atk:character.level90.atk+weapon.level90BaseAtk,def:character.level90.def};
function format(value,whole){return whole?Math.round(value).toLocaleString('en-US'):`${(value*100).toFixed(1)}%`;}
function project(totals){
  const numeric={...reference};
  for(const [name,value] of Object.entries(totals)){
    const change=value-anchor[name];
    const key=STAT_KEYS[name][0];
    numeric[key]+=change*(['HP%','ATK%','DEF%'].includes(name)?scalar[key]:1);
  }
  return Object.fromEntries(STAT_COLUMNS.map(([id,key,whole])=>[id,format(numeric[key],whole)]));
}
function requirements(state) {
  const sections=state.statSections,minima=state.minima;
  const rows=section=>sections[section].map(stat=>{
    const catalog=ECHO_SETTING_STATS.find(row=>row.id===stat),index=minima[stat];
    if(!catalog||!Number.isInteger(index)||!Number.isFinite(catalog.tiers[index]))throw Error('Invalid stat tier');
    return {stat,minimum:catalog.tiers[index]};
  });
  return {hard:rows('hard'),flex:rows('flex'),flexCount:state.flexCount};
}
const cache=new Map();
export function augustaExpected(state) {
  if(state.id!=='augusta')return null;
  try{
    const rule=requirements(state);
    if(!Number.isInteger(rule.flexCount))return null;
    const key=JSON.stringify(rule);
    let distribution=cache.get(key);
    if(!distribution){distribution=acceptedEchoDistribution({stats,...rule});cache.set(key,distribution);}
    const accepted=expectedFiveEchoSubstats(distribution,{
      erEnabled:state.erTarget.enabled,
      erTargetPercent:state.erTarget.valuePercent,
      baseER:reference.energyRegen // The exemplar has no ER rolls.
    });
    if(accepted.status!=='READY')return null;
    return {values:project(accepted.totals),
      acceptanceProbability:accepted.acceptanceProbability,
      erConditionProbability:accepted.erConditionProbability,
      scope:'VERIFIED_STATIC_FIVE_ACCEPTED_ECHO_MEAN',
      omitted:['Sonata/conditional effects','private evaluator','resource budget']};
  }catch{return null;}
}
