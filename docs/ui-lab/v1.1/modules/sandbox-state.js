import defaults from './sandbox-defaults.json' with {type:'json'};
import {CHARACTER_CATALOG,WEAPON_CATALOG} from './catalog.js';
import {initialSettings} from './settings-state.js';
import {initializeCanonicalSettings} from './canonical-settings.js';
import {createConfigurationSession,configurationLiveContext} from './simulation-configuration.js';
import {STAT_LABELS} from './lab-state.js';
const clone=v=>structuredClone(v);
export const SANDBOX_VERSION='BELLIBING_SANDBOX_BUILD_V1';
export const SANDBOX_WEAPONS=defaults.weapons;
export function sandboxStandard(characterId){return clone(defaults.characters.find(c=>c.characterId===characterId)??null);}
export function createSandboxState(characterId){
 const standard=sandboxStandard(characterId);if(!standard)throw Error('UNKNOWN_RELEASED_SANDBOX_CHARACTER');
 const configurationSession=createConfigurationSession(characterId,{initializeDefaults:false});
 configurationSession.configurations=Array.from({length:5},(_,i)=>clone(standard.slots[i]?.configuration??null));
 configurationSession.active=configurationSession.configurations.map(Boolean);
 configurationSession.provenance=standard.slots.map(s=>({kind:'SANDBOX_STANDARD',sourceId:standard.sourceId,sourceUrl:standard.sourceUrl,sourceLinesSha256:standard.sourceLinesSha256,identityBasis:s.identityBasis,selectionRule:defaults.policy.mainStats,context:clone(standard.baseline.selectedContext)}));
 configurationSession.defaultRecommendation={sourceId:standard.sourceId,sonataSetIds:standard.sonataSetIds,context:standard.baseline.selectedContext,pending:standard.unresolved,complete:standard.validEchoConfiguration,sourceBindings:defaults.sourceBindings};
 const build={kind:'SANDBOX_BUILD',schemaVersion:1,version:SANDBOX_VERSION,id:crypto.randomUUID(),characterId,presetId:standard.presetId,
  revision:0,weaponRevision:0,baseline:clone(standard.baseline),weaponId:standard.weapon?.weaponId??null,sourceBindings:clone(defaults.sourceBindings)};
 const weapon=WEAPON_CATALOG.find(w=>w.id===build.weaponId);
 const state={id:characterId,onAccount:false,selectedSlot:0,echoActive:Array(5).fill(false),echoes:Array(5).fill(null),scenarioEchoes:Array(5).fill(null),
  feedbackScenario:'ready',hasRecordedRun:false,materials:[],candidates:Array(5).fill(null),histories:Array.from({length:5},()=>[]),
  stats:STAT_LABELS.map(()=>['—','—']),weapon:weapon?.name??'Weapon Pending',sequenceLevel:build.baseline.sequenceLevel,forte:clone(build.baseline.forte),gate:'+5',
  ...initialSettings(characterId),configurationSession,sandboxBuild:build};
 initializeCanonicalSettings(state);state.sonataPool=[]; // Retain legacy schema, no hidden filter/commit owner.
 return state;
}
export function setSandboxWeapon(state,weaponId){
 const person=CHARACTER_CATALOG.find(p=>p.id===state.id),weapon=SANDBOX_WEAPONS.find(w=>w.id===weaponId&&w.weaponType===person?.weaponType);
 if(!state.sandboxBuild||!weapon)throw Error('INVALID_SANDBOX_WEAPON');
 if(state.sandboxBuild.weaponId===weaponId)return;
 state.sandboxBuild.weaponId=weaponId;state.sandboxBuild.weaponRevision++;state.sandboxBuild.revision++;state.configurationSession.revision++;
 state.weapon=weapon.name;
}
export function createSandboxWorkspace(){
 const states=new Map();let current=null,contextRevision=0;
 const select=id=>{if(!defaults.characters.some(c=>c.characterId===id))throw Error('UNKNOWN_RELEASED_SANDBOX_CHARACTER');if(current!==id)contextRevision++;current=id;if(!states.has(id))states.set(id,createSandboxState(id));return states.get(id);};
 const readContext=(inventory,inventoryRevision)=>{
  if(!current)throw Error('SANDBOX_CHARACTER_NOT_SELECTED');const state=states.get(current);
  return {...configurationLiveContext(state,inventory,{inventoryRevision,contextRevision}),buildContext:clone(state.sandboxBuild)};
 };
 // One-use/future provider outputs must match a complete current owner snapshot.
 // No results are produced in S1; keeping a payload here does not certify it.
 const leases=new WeakMap();
 return {select,readContext,advanceContext(){contextRevision++;},
  capture(inventory,inventoryRevision){const token=Object.freeze({id:crypto.randomUUID()});leases.set(token,JSON.stringify(readContext(inventory,inventoryRevision)));return token;},
  assertCurrent(token,inventory,inventoryRevision){const saved=leases.get(token);if(!saved||saved!==JSON.stringify(readContext(inventory,inventoryRevision))){leases.delete(token);throw Error('STALE_SANDBOX_CONTEXT');}return true;},
  preview(id){const state=states.get(id),standard=sandboxStandard(id),weapon=WEAPON_CATALOG.find(w=>w.id===(state?.sandboxBuild.weaponId??standard?.weapon?.weaponId));return {onAccount:false,hasBuild:!!standard,slots:standard?.slots.length??0,weapon:weapon?.name??'Weapon Pending',stats:['—','—','—']};}
 };
}
