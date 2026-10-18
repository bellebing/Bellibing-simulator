// Public, server/host-side configuration contract. No evaluator, network or storage writer.
import {projectSandboxEchoSettings} from './sandboxEchoSettings.mjs';
import {CHARACTER_CATALOG} from './data/characters.ts';
import {ECHO_CATALOG} from './data/echoes.ts';
import {SONATA_CATALOG} from './data/sonatas.ts';
import {SUBSTAT_TYPES,SUBSTAT_VALUE_TABLE} from './echoCoreRules.ts';
import {createEchoStatsEditorSelection,ECHO_STATS_EDITOR_RANK} from './echoStatEditor.ts';
import {validateEchoLoadout} from './loadoutValidator.ts';
import {readResourceInventory} from './resourceInventory.ts';
import {projectRecommendedImprovePolicy} from './improvePolicySources.ts';
import {createImprovePolicyState,resolveImprovePolicyState,readImprovePolicyState,updateImprovePolicyState} from './improvePolicyState.ts';
import {SIMPLE_GATES} from './improveSimpleSettings.mjs';
import {FINAL_ECHO_SUBSTAT_CAPACITY} from './echoRequirements.ts';
import {startEchoSimulator} from './echoSimulatorSession.ts';

export const CONFIGURATION_COMPILER_VERSION='BELLIBING_PUBLIC_CONFIGURATION_V1';
export const CANONICAL_CONFIGURATION_SOURCE='259f4881271b5cc84cec5bf2e7f085e6a106a8e3';
export const SIMULATION_TRANSPORT_PROTOCOL='BELLIBING_SIMULATION_TRANSPORT_V1';
const clone=value=>structuredClone(value);
export function configurationValue(value){
 if(typeof value==='number'&&!Number.isFinite(value))throw Error('NON_FINITE_OWNER_SNAPSHOT');
 if(value&&typeof value==='object'&&!Array.isArray(value)&&![Object.prototype,null].includes(Object.getPrototypeOf(value)))throw Error('NON_PLAIN_OWNER_SNAPSHOT');
 if(['function','symbol','bigint'].includes(typeof value))throw Error('NON_JSON_OWNER_SNAPSHOT');
 if(Array.isArray(value))return '['+value.map(configurationValue).join(',')+']';
 if(value&&typeof value==='object')return '{'+Object.keys(value).sort().filter(key=>value[key]!==undefined).map(key=>JSON.stringify(key)+':'+configurationValue(value[key])).join(',')+'}';
 return JSON.stringify(value);
}
const same=(a,b)=>configurationValue(a)===configurationValue(b);
const whole=(n,name)=>{if(!Number.isSafeInteger(n)||n<0)throw Error('INVALID_'+name);return n;};
const text=(s,name)=>{if(typeof s!=='string'||!s.length||s.length>256)throw Error('INVALID_'+name);return s;};
const requireThat=(ok,reason)=>{if(!ok)throw Error(reason);};
const pending=(reason)=>({compilerVersion:CONFIGURATION_COMPILER_VERSION,uiStatus:'VALID_UI_CONFIGURATION',bindingStatus:'PENDING',capability:'PENDING',reasons:[reason],input:null});
function template(value){
 requireThat(value&&typeof value==='object','INVALID_TEMPLATE');
 requireThat(Object.keys(value).every(key=>['echoId','cost','rank','mainStatName','selectedSonataSetId','templateId'].includes(key)),'ROLLED_OR_UNKNOWN_TEMPLATE_FIELDS');
 const echo=ECHO_CATALOG.find(e=>e.id===value.echoId&&e.releaseStatus==='RELEASED');
 requireThat(echo&&echo.cost===value.cost&&value.rank===ECHO_STATS_EDITOR_RANK,'INVALID_ECHO_IDENTITY_COST_RANK');
 requireThat(echo.sonataSetIds.includes(value.selectedSonataSetId)&&SONATA_CATALOG.some(s=>s.id===value.selectedSonataSetId&&s.releaseStatus==='RELEASED'),'INVALID_SONATA');
 createEchoStatsEditorSelection(value.cost,value.mainStatName,[]);
 return {echoId:echo.id,cost:echo.cost,rank:ECHO_STATS_EDITOR_RANK,mainStatName:value.mainStatName,selectedSonataSetId:value.selectedSonataSetId};
}
function uiSettings(ui){
 const s=ui.context?.settings;requireThat(s?.ownerCharacterId===ui.characterId,'SETTINGS_CHARACTER_MISMATCH');
 requireThat(['Recommended','Customize'].includes(s.mode)&&SIMPLE_GATES.includes(s.gate),'INVALID_SETTINGS_MODE_GATE');
 requireThat(Array.isArray(s.hard)&&Array.isArray(s.flex),'INVALID_HARD_FLEX');
 const all=[...s.hard,...s.flex];
 requireThat(new Set(all.map(r=>r.stat)).size===all.length,'HARD_FLEX_OVERLAP');
 all.forEach(r=>{requireThat(Object.keys(r).every(k=>['stat','minimum'].includes(k)),'UNKNOWN_REQUIREMENT_FIELDS');requireThat(SUBSTAT_TYPES.includes(r.stat)&&SUBSTAT_VALUE_TABLE[r.stat].includes(r.minimum),'INVALID_CANONICAL_MINIMUM_TIER');});
 requireThat(s.flexCount===null||Number.isSafeInteger(s.flexCount)&&s.flexCount>=1&&s.flexCount<=s.flex.length&&s.hard.length+s.flexCount<=FINAL_ECHO_SUBSTAT_CAPACITY,'INVALID_FLEX_COUNT');
 requireThat(s.hard.length<=FINAL_ECHO_SUBSTAT_CAPACITY,'INVALID_HARD_CAPACITY');
 requireThat(s.erTarget&&typeof s.erTarget.enabled==='boolean'&&(s.erTarget.valuePercent===null||Number.isFinite(s.erTarget.valuePercent)&&s.erTarget.valuePercent>=0),'INVALID_ER_TARGET');
 requireThat(Array.isArray(s.sonataPool)&&new Set(s.sonataPool).size===s.sonataPool.length&&s.sonataPool.every(id=>SONATA_CATALOG.some(row=>row.id===id&&row.releaseStatus==='RELEASED')),'INVALID_SONATA_POOL');
 return s;
}
/** Full UI validity, independent of production ownership and private capability. */
export function validateUiSimulationConfiguration(ui){
 try{
  requireThat(ui?.schemaVersion===1&&ui.kind==='PUBLIC_UI_SIMULATION_CONFIGURATION','INVALID_UI_SCHEMA');
  requireThat(CHARACTER_CATALOG.some(c=>c.id===ui.characterId&&c.releaseStatus==='RELEASED'),'UNKNOWN_CHARACTER');
  requireThat(ui.workspaceMode==='simulate','WORKSPACE_NOT_SIMULATE');
  requireThat(Number.isInteger(ui.selectedSlot)&&ui.selectedSlot>=1&&ui.selectedSlot<=5,'INVALID_SELECTED_SLOT');
  for(const key of ['context','configuration','session','selection','settings','inventory'])whole(ui.revisions?.[key],key.toUpperCase()+'_REVISION');
  const settings=uiSettings(ui),inventory=readResourceInventory(ui.resourceInventory);
  requireThat(Array.isArray(ui.slots)&&ui.slots.length===5,'FIVE_SLOTS_REQUIRED');
  const selectedSlots=[];
  ui.slots.forEach((slot,index)=>{
   requireThat(slot.slot===index+1&&typeof slot.active==='boolean','INVALID_SLOT_ASSIGNMENT');
   const choice=slot.configuration===null?null:template(slot.configuration);
   requireThat(!slot.active||choice,'ACTIVE_UNCONFIGURED_SLOT');
   if(slot.active)selectedSlots.push({slot:slot.slot,template:choice});
  });
  requireThat(selectedSlots.length>0,'NO_ACTIVE_CONFIGURED_SLOTS');
  const loadout=validateEchoLoadout(selectedSlots.map(s=>s.template));requireThat(loadout.valid,'INVALID_LOADOUT_'+loadout.status);
  return {status:'VALID_UI_CONFIGURATION',settings:clone(settings),inventory,selectedSlots};
 }catch(error){return {status:'INVALID_UI_CONFIGURATION',reasons:[error.message]};}
}
/** Detached v3 proposal through canonical state actions; never persists or invents provider requirements. */
export async function adaptUiSettingsV3({characterId,presetId,settings,sandboxEchoOnly=false}){
 uiSettings({characterId,context:{settings}});
 const recommended=sandboxEchoOnly?await projectSandboxEchoSettings(characterId):await projectRecommendedImprovePolicy({characterId,presetId});
 if(!recommended.applicability||recommended.sourceReviewStatus!=='CURRENT')return {status:'PENDING',reason:'CANONICAL_CHARACTER_SETTINGS_CONTEXT_UNAVAILABLE'};
 let state=createImprovePolicyState(characterId,recommended);
 state=updateImprovePolicyState(state,{type:'gate',value:settings.gate},recommended);
 if(settings.flex.length&&settings.flexCount===null)return {status:'PENDING',reason:'FLEX_COUNT_NOT_CONFIGURED'};
 if(settings.mode==='Customize'){
  state=updateImprovePolicyState(state,{type:'set',section:'echoRequirements',value:{requiredOnEveryEcho:settings.hard,
   groups:settings.flex.length?[{id:'selected-flex',minimumCount:settings.flexCount,members:settings.flex}]:[]}},recommended);
  state=updateImprovePolicyState(state,{type:'set',section:'echoPreferences',value:settings.flex.map((r,index)=>({...r,priorityGroup:index+1}))},recommended);
 }
 const resolved=resolveImprovePolicyState(state,recommended);
 if(resolved.compatibility.status!=='COMPATIBLE')return {status:'PENDING',reason:'SETTINGS_COMPATIBILITY_PENDING'};
 const req=resolved.policy.echoPolicy.requirements;
 if(!['VERIFIED','USER_DEFINED'].includes(req.status)||!req.value)return {status:'PENDING',reason:'CANONICAL_ECHO_REQUIREMENTS_PENDING'};
 const expected={hard:req.value.requiredOnEveryEcho,flex:req.value.groups?.[0]?.members??[],flexCount:req.value.groups?.[0]?.minimumCount??null};
 if(!same({hard:settings.hard,flex:settings.flex,flexCount:settings.flexCount},expected))return {status:'PENDING',reason:'UI_RECOMMENDED_DOES_NOT_MATCH_CANONICAL_SETTINGS'};
 return {status:'VALID_SETTINGS_V3',state,recommended,resolved};
}
const uiRevisionKeys=['context','configuration','session','selection','settings','inventory'];
const productionRevisionKeys=['character','build','settings','inventory','session'];
function revisions(ui,production){
 uiRevisionKeys.forEach(k=>whole(ui.revisions?.[k],'UI_'+k));
 productionRevisionKeys.forEach(k=>whole(production.revisions?.[k],'PRODUCTION_'+k));
 return {ui:Object.fromEntries(uiRevisionKeys.map(k=>[k,ui.revisions[k]])),production:Object.fromEntries(productionRevisionKeys.map(k=>[k,production.revisions[k]]))};
}
function selectedPolicy(state,recommended){
 const r=resolveImprovePolicyState(state,recommended);
 return {compatibility:r.compatibility,mode:state.mode,gate:state.gate,rollQuality:state.rollQuality,
  requirements:r.policy.echoPolicy.requirements,preferences:r.policy.echoPolicy.preferences};
}
/** The production argument comes from a trusted host reader, never an incoming browser assertion. */
export async function compileSimulationConfiguration(ui,production,engineContract,{seed}={}){
 ui=clone(ui);production=clone(production);
 const valid=validateUiSimulationConfiguration(ui);
 if(valid.status!=='VALID_UI_CONFIGURATION')return {compilerVersion:CONFIGURATION_COMPILER_VERSION,uiStatus:valid.status,bindingStatus:'REJECTED',capability:'PENDING',reasons:valid.reasons,input:null};
 if(!production)return pending('PRODUCTION_OWNER_NOT_CONNECTED');
 try{
  if(!production.buildId)return pending('PRODUCTION_BUILD_IDENTITY_UNAVAILABLE');
  if(!production.modeId)return pending('PRODUCTION_MODE_IDENTITY_UNAVAILABLE');
  if(!production.presetId)return pending('PRODUCTION_PRESET_CONTEXT_UNAVAILABLE');
  text(production.buildId,'BUILD_ID');text(production.modeId,'MODE_ID');text(production.presetId,'PRESET_ID');
  requireThat(production.characterId===ui.characterId,'PRODUCTION_CHARACTER_MISMATCH');
  const revisionBinding=revisions(ui,production);
  requireThat(engineContract?.protocol===SIMULATION_TRANSPORT_PROTOCOL&&engineContract.publicSourceRevision===CANONICAL_CONFIGURATION_SOURCE,'SOURCE_OR_TRANSPORT_CONTRACT_MISMATCH');
  text(engineContract.engineVersion,'ENGINE_VERSION');text(seed,'SEED');
  const adapted=await adaptUiSettingsV3({characterId:ui.characterId,presetId:production.presetId,settings:valid.settings,sandboxEchoOnly:production.kind==='SANDBOX_HOST_CONTEXT'&&production.echoOnlyContext===true});
  if(adapted.status!=='VALID_SETTINGS_V3')return pending(adapted.reason);
  const canonicalDefault=production.kind==='SANDBOX_HOST_CONTEXT'&&production.echoOnlyContext===true?await projectSandboxEchoSettings(ui.characterId):await projectRecommendedImprovePolicy({characterId:ui.characterId});
  requireThat(production.modeId==='default'?adapted.recommended.presetId===canonicalDefault.presetId:production.modeId===adapted.recommended.applicability.modeKey,'MODE_PRESET_CONTEXT_MISMATCH');
  const store=production.improvePolicyStorage;
  requireThat(store?.version===3&&store.characters?.[ui.characterId],'PERSISTED_SETTINGS_V3_OWNER_MISSING');
  const saved=readImprovePolicyState(store,ui.characterId,adapted.recommended);
  requireThat(saved.gate===store.characters[ui.characterId].gate&&saved.rollQuality===store.characters[ui.characterId].rollQuality,'PERSISTED_SETTINGS_NORMALIZATION_REQUIRES_REVIEW');
  requireThat(same(selectedPolicy(saved,adapted.recommended),selectedPolicy(adapted.state,adapted.recommended)),'UI_SETTINGS_NOT_COMMITTED_TO_PRODUCTION_OWNER');
  requireThat(saved.migration===null,'SETTINGS_MIGRATION_PENDING');
  requireThat(same(readResourceInventory(store.resourceInventory),valid.inventory),'UI_INVENTORY_NOT_COMMITTED_TO_PRODUCTION_OWNER');
  if(valid.settings.erTarget?.enabled&&!(production.kind==='SANDBOX_HOST_CONTEXT'&&production.totalBuildErAcceptance==='SOURCE_ROTATION_ER_V1'))return pending('ER_CONSTRAINT_ADAPTER_PENDING');
  const build=production.buildState;
  requireThat(build?.echoSets?.sets?.[build.echoSets.activeSetId]?.slots?.length===5,'STRUCTURED_REAL_BUILD_MISSING');
  const session=production.publicSession;
  requireThat(session?.source?.characterId===ui.characterId&&session.selectedSlot===ui.selectedSlot&&same(session.source.build,build),'CANONICAL_PUBLIC_SESSION_CONTEXT_MISMATCH');
  text(session.id,'PUBLIC_SESSION_ID');whole(session.buildRevision,'SIMULATED_BUILD_REVISION');
  // Start through the canonical detached owner, then explicitly allowlist non-Echo context.
  const sandbox=startEchoSimulator(ui.characterId,build,session.id).simulatedBuild;
  const buildState={echoSets:sandbox.echoSets};
  for(const key of ['weaponId','weaponRefinement','sequenceLevel','forte'])if(Object.hasOwn(sandbox,key))buildState[key]=clone(sandbox[key]);
  const input={...(adapted.recommended.sandboxEchoContext?{sandboxEchoContext:adapted.recommended.sandboxEchoContext}:{}),schemaVersion:1,publicSourceRevision:CANONICAL_CONFIGURATION_SOURCE,engineVersion:engineContract.engineVersion,
   characterId:ui.characterId,modeId:production.modeId,presetId:production.presetId,seed,
   revisions:{build:production.revisions.build,settings:production.revisions.settings,inventory:production.revisions.inventory,selection:ui.revisions.selection},
   buildState,improvePolicyStorage:{version:3,characters:{[ui.characterId]:clone(adapted.state)},pendingV2Characters:{},resourceInventory:valid.inventory},selectedSlots:valid.selectedSlots};
  return {compilerVersion:CONFIGURATION_COMPILER_VERSION,uiStatus:valid.status,bindingStatus:'BOUND_TO_TRUSTED_HOST',capability:'PENDING_PRIVATE_PREFLIGHT',reasons:[],
   binding:{characterId:ui.characterId,buildId:production.buildId,modeId:production.modeId,presetId:production.presetId,sessionId:session.id,revisions:revisionBinding},input};
 }catch(error){return pending(error.message);}
}
/** Short-lived leases. Full fresh values AND owner revisions gate use; a digest is never authority. */
export function createSimulationConfigurationBridge({readUiContext,readProductionContext}){
 requireThat(typeof readUiContext==='function'&&typeof readProductionContext==='function','TRUSTED_HOST_READERS_REQUIRED');
 const leases=new WeakMap();
 const capture=()=>{const ui=readUiContext(),production=readProductionContext();requireThat(!ui?.then&&!production?.then,'SYNCHRONOUS_TRUSTED_READERS_REQUIRED');return clone({ui,production});};
 const assertCurrent=lease=>{
  const record=leases.get(lease);requireThat(record&&!record.invalid,'UNKNOWN_OR_INVALIDATED_CONFIGURATION_LEASE');
  if(!same(record.captured,capture())){record.invalid=true;throw Error('STALE_CONFIGURATION_LEASE');}
  return clone(record.compiled);
 };
 return Object.freeze({
  async prepare(engineContract,options){
   const captured=capture(),compiled=await compileSimulationConfiguration(captured.ui,captured.production,engineContract,options);
   requireThat(same(captured,capture()),'CONTEXT_CHANGED_DURING_COMPILATION');
   if(compiled.bindingStatus!=='BOUND_TO_TRUSTED_HOST')return {result:compiled,lease:null};
   const lease=Object.freeze({id:crypto.randomUUID(),compilerVersion:CONFIGURATION_COMPILER_VERSION});leases.set(lease,{captured,compiled,invalid:false});return {result:clone(compiled),lease};
  },
  assertCurrent,
  guard(lease,operation){const compiled=assertCurrent(lease);const result=operation(compiled);requireThat(!result?.then,'ASYNCHRONOUS_EXECUTION_REQUIRES_ATOMIC_HOST_ADAPTER');assertCurrent(lease);return result;},
  async probe(lease,privatePreflight){
   const compiled=assertCurrent(lease);let result;
   try{result=await privatePreflight(clone(compiled.input));}catch{assertCurrent(lease);return {compilerVersion:CONFIGURATION_COMPILER_VERSION,status:'PENDING_PRIVATE_CAPABILITY',reason:'PRIVATE_PREFLIGHT_UNAVAILABLE'};}
   assertCurrent(lease);
   requireThat(['READY','PENDING','UNSUPPORTED'].includes(result?.status),'INVALID_PRIVATE_PREFLIGHT_RESULT');
   // No private diagnostics, policies, provider internals or raw engine object cross this public boundary.
   return {compilerVersion:CONFIGURATION_COMPILER_VERSION,status:result.status==='READY'?'PRIVATE_CONTRACT_ACCEPTED':'PENDING_PRIVATE_CAPABILITY'};
  }
 });
}
