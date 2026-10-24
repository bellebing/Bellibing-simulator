import {readProductionBuildRecord} from '../../../../src/productionBuildRecord.mjs';
import {projectStaticBuildStats} from '../../../../src/buildStatProjection.mjs';
import {normalizeForteState,forteStats} from '../../../../src/characterForteUi.mjs';
import facts from './sandbox-stat-sources.json' with {type:'json'};
import weapons from '../../../ui-prototypes/assets/weapons/browser-data.json' with {type:'json'};
import catalog from '../../../ui-prototypes/assets/echoes/browser-data.json' with {type:'json'};
import {STATIC_STAT_FIELDS,staticSonataRows} from '../../../../src/sandboxStaticStats.mjs';

export function statValues(projection,person){return Object.fromEntries(STATIC_STAT_FIELDS.map(([id,key,whole])=>{const value=projection?.[key],metric=id==='ELEMENT_DMG_BONUS'?person.identityElement.toUpperCase()+'_DMG_BONUS':id;return [metric,Number.isFinite(value)?whole?Math.round(value).toLocaleString('en-US'):`${Number((value*100).toFixed(1))}%`:null];}));}

// Bounded actual-stat comparison only. No scalar weights, private policy or
// invented cost/utility ranking. Identity-changing effects and ER trades stay Pending.
export function assessStaticReplacement(current,candidate,oldCard,newCard){
 const base={scope:'STATIC_BUILD_STATS_ONLY',authorizesUpgradeVerdict:false,authorizesAutomaticEquip:false,authorizesDps:false,authorizesCostRanking:false};
 if(!current||!candidate)return {...base,status:'PENDING',reason:'COMPLETE_CURRENT_AND_CANDIDATE_REQUIRED'};
 if(!oldCard?.echoId||!oldCard?.selectedSonataSetId||oldCard.echoId!==newCard?.echoId||oldCard?.selectedSonataSetId!==newCard?.selectedSonataSetId)return {...base,status:'PENDING',reason:'ECHO_EFFECT_CONTEXT_CHANGED'};
 const changes=STATIC_STAT_FIELDS.map(([,key])=>({key,value:candidate[key]-current[key]}));
 if(changes.some(row=>!Number.isFinite(row.value)))return {...base,status:'PENDING',reason:'STATIC_COMPONENT_UNAVAILABLE'};
 const epsilon=1e-10;
 if(Math.abs(changes.find(row=>row.key==='energyRegen').value)>epsilon)return {...base,status:'PENDING',reason:'FUNCTIONAL_ER_COMPARISON_PENDING'};
 const gains=changes.filter(row=>row.value>epsilon).map(row=>row.key),losses=changes.filter(row=>row.value< -epsilon).map(row=>row.key);
 return {...base,status:gains.length&&losses.length?'PENDING':gains.length?'STATIC_DOMINANCE':losses.length?'STATIC_INFERIOR':'EQUAL',reason:gains.length&&losses.length?'CROSS_STAT_TRADES_PENDING':null,gains,losses};
}
// Read-only ACCOUNT_BUILD projection. Four unchanged owned slots + one observed
// candidate use the same canonical projector and identical investment inputs.
export function accountProjection(person,storage,{candidate=null,slot=0}={}){
 const record=readProductionBuildRecord(storage,person),result={kind:'ACCOUNT_BUILD',record,current:null,candidate:null,currentValues:{},candidateValues:{},delta:{},status:'PENDING',reason:record.reason??null};
 if(record.status!=='OBSERVED_PRODUCTION_BUILD_RECORD')return result;
 const build=record.buildState,slots=build.echoSets.sets[build.echoSets.activeSetId].slots;
 const character=facts.characters.find(c=>c.id===person.id),weapon=weapons.weapons.find(w=>w.id===build.weaponId);
 result.slots=structuredClone(slots);result.build=build;result.weapon=weapon;
 if(!character||!weapon||weapon.weaponType!==person.weaponType||!person.forte||build.forte?.schemaVersion!==1||!Number.isInteger(build.sequenceLevel)||build.sequenceLevel<0||build.sequenceLevel>6||!person.sequences?.length){result.reason='ACCOUNT_INVESTMENT_SOURCE_PENDING';return result;}
 if(person.forte.nodes.some(n=>n.kind==='skill'?!(Number.isInteger(build.forte.levels?.[n.role])&&build.forte.levels[n.role]>=0&&build.forte.levels[n.role]<=10):n.kind!=='outro'&&typeof build.forte.enabled?.[n.id]!=='boolean')){result.reason='ACCOUNT_INVESTMENT_SOURCE_PENDING';return result;}
 const input={character,weapon,echoSlots:slots,echoStatContract:catalog.statEditor,
  activeForteStats:forteStats(person.forte,normalizeForteState(person.forte,build.forte)),
  activeSequenceStats:person.sequences.filter(c=>c.sequence<=build.sequenceLevel&&c.buildStatClassification==='STATIC_BUILD_STAT').flatMap(c=>c.staticBuildStats),activeWeaponStats:weapon.staticBuildStats??[]};
 const valid=card=>{const echo=catalog.echoes.find(e=>e.id===card?.echoId);return echo&&echo.cost===card.cost&&echo.sonataSetIds.includes(card.selectedSonataSetId);};
 try{
  if(slots.reduce((n,c)=>n+(c?.cost??0),0)>12||!slots.every(valid))throw Error('FIVE_OWNED_ECHOES_REQUIRED');
  const project=cards=>projectStaticBuildStats({...input,echoSlots:cards,activeWeaponStats:[...input.activeWeaponStats,...staticSonataRows(cards,{echoes:catalog.echoes,sonataSets:catalog.sonataSets,sonataEffects:facts.sonataEffects}).rows]});
  result.current=project(slots);result.currentValues=statValues(result.current,person);result.reason='OBSERVED_CANDIDATE_REQUIRED';
  if(candidate){
   if(!Number.isInteger(slot)||slot<0||slot>4||!valid(candidate))throw Error('INVALID_OBSERVED_CANDIDATE');
   const next=structuredClone(slots);next[slot]=structuredClone(candidate);if(next.reduce((n,c)=>n+c.cost,0)>12)throw Error('CANDIDATE_LOADOUT_COST_EXCEEDED');
   result.candidate=project(next);result.candidateValues=statValues(result.candidate,person);
   for(const [,key]of STATIC_STAT_FIELDS)result.delta[key]=result.candidate[key]-result.current[key];
   result.status='STATIC_COMPARISON';result.reason=null;result.comparison=assessStaticReplacement(result.current,result.candidate,slots[slot],candidate);
  }
 }catch(error){result.reason=error.message;}
 return result;
}
