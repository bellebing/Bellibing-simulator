import {readResourceInventory} from '../../../assets/resourceInventory.js';
import catalog from '../../../ui-prototypes/assets/echoes/browser-data.json' with {type:'json'};
import {validateEchoTemplateConfiguration} from '../../../ui-prototypes/assets/echo-template-configuration.mjs';
import {ECHO_SETTING_STATS,validateEchoLoadout} from './settings-catalog.js';
import {CHARACTER_CATALOG} from './catalog.js';

const clone=value=>structuredClone(value);
const indexOf=slot=>{if(!Number.isInteger(slot)||slot<0||slot>=5)throw Error('Slot must be 1–5.');return slot;};
export function createConfigurationSession(characterId) {
  if(!CHARACTER_CATALOG.some(row=>row.id===characterId))throw Error('Unknown canonical Character.');
  return {characterId,mode:'simulate',revision:0,sessionRevision:0,settingsRevision:0,selectionRevision:0,
    configurations:Array(5).fill(null),active:Array(5).fill(false),current:Array(5).fill(null),candidates:Array(5).fill(null),histories:Array.from({length:5},()=>[])};
}
export function configureSlot(session,slot,input) {
  indexOf(slot);
  const template=validateEchoTemplateConfiguration(catalog,input);
  if(JSON.stringify(session.configurations[slot])!==JSON.stringify(template)){
    session.configurations[slot]=template;session.revision++;
  }
  return clone(template); // Never equip, activate, roll or replace Current/history.
}
export function activateConfigurationSlot(session,slot,active) {
  indexOf(slot);if(typeof active!=='boolean')throw Error('Invalid activation.');
  if(!session.configurations[slot])throw Error('Configure this Echo before activation.');
  validateEchoTemplateConfiguration(catalog,session.configurations[slot]);
  if(session.active[slot]!==active){session.active[slot]=active;session.revision++;}
}
export function resetSimulationResults(session) {
  // Explicit session reset retains user template/activation choices and Settings.
  session.current=Array(5).fill(null);session.candidates=Array(5).fill(null);session.histories=Array.from({length:5},()=>[]);
  session.sessionRevision++;session.revision++;
}
export function configurationContext(state) {
  const s=state.configurationSession;
  return JSON.stringify({characterId:state.id,slot:state.selectedSlot,mode:s.mode,revision:s.revision,session:s.sessionRevision,
    settingsRevision:s.settingsRevision,selectionRevision:s.selectionRevision,settings:settingsSnapshot(state)});
}
export function settingsSnapshot(state) {
  const rows=section=>state.statSections[section].map(stat=>{
    const source=ECHO_SETTING_STATS.find(row=>row.id===stat),tier=state.minima[stat];
    if(!source||!Number.isInteger(tier)||!Number.isFinite(source.tiers[tier]))throw Error('Invalid canonical stat minimum.');
    return {stat,minimum:source.tiers[tier]};
  });
  return {ownerCharacterId:state.id,mode:state.settingsMode,gate:Number(state.gate.replace('+','')),hard:rows('hard'),flex:rows('flex'),flexCount:state.flexCount,
    erTarget:clone(state.erTarget),sonataPool:clone(state.sonataPool),bindingStatus:'UI_LAB_CONTEXT_NOT_PRODUCTION_POLICY_V3'};
}
export function selectConfigurationSlot(state,slot){
  indexOf(slot);if(state.selectedSlot!==slot){state.selectedSlot=slot;if(state.configurationSession)state.configurationSession.selectionRevision++;}
}
export function settingsConfigurationChanged(state){if(state.configurationSession)state.configurationSession.settingsRevision++;}
async function digest(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(JSON.stringify(value)));return 'sha256:'+Array.from(new Uint8Array(bytes),byte=>byte.toString(16).padStart(2,'0')).join('');}
const sourceBinding=digest(catalog);
export async function configurationSnapshot(state,inventory,{inventoryRevision=null}={}) {
  const session=state.configurationSession;
  if(inventoryRevision!==null&&(!Number.isSafeInteger(inventoryRevision)||inventoryRevision<0))throw Error('Invalid inventory revision.');
  if(!session||session.characterId!==state.id)throw Error('Character/context mismatch.');
  const settings=settingsSnapshot(state),detached=clone(session),resources=readResourceInventory(inventory),selectedSlot=state.selectedSlot;
  const revisions={build:null,configuration:detached.revision,session:detached.sessionRevision,selection:detached.selectionRevision,settings:detached.settingsRevision,inventory:inventoryRevision};
  const selected=detached.configurations.flatMap((template,index)=>detached.active[index]&&template?[{slot:index+1,template:validateEchoTemplateConfiguration(catalog,template)}]:[]);
  const loadout=validateEchoLoadout(selected.map(row=>row.template));
  const issues=[];
  if(!selected.length)issues.push('NO_ACTIVE_CONFIGURED_SLOTS');
  if(!loadout.valid)issues.push(loadout.status);
  if(detached.active.some((active,index)=>active&&!detached.configurations[index]))issues.push('ACTIVE_SLOT_NOT_CONFIGURED');
  const slots=await Promise.all(detached.configurations.map(async(template,index)=>({slot:index+1,active:detached.active[index],
    configuration:template?{...validateEchoTemplateConfiguration(catalog,template),templateId:await digest(template)}:null,
    simulatedCurrent:detached.current[index],candidate:detached.candidates[index],history:detached.histories[index]})));
  return {schemaVersion:1,kind:'PUBLIC_UI_SIMULATION_CONFIGURATION',characterId:state.id,
    context:{buildId:null,buildStatus:'PENDING_VERIFIED_BUILD_CONTEXT',modeId:null,modeStatus:'PENDING_CHARACTER_BUILD_MODE_BINDING',settings},
    source:{catalog:'docs/ui-prototypes/assets/echoes/browser-data.json',binding:await sourceBinding},
    revisions,
    selectedSlot:selectedSlot+1,slots,selectedSlots:selected,resourceInventory:resources,
    validation:{status:issues.length?'INVALID_CONFIGURATION':'VALID_TEMPLATE_SELECTION',issues,loadout},
    capability:{status:'PENDING',reasons:['PRODUCTION_BUILD_AND_POLICY_BINDING_PENDING','PRIVATE_EXECUTION_ADAPTER_NOT_CONNECTED']}};
}

export function configuredSlotTitle(state,index){
  const template=state.configurationSession?.configurations[index];if(!template)return 'Choose an Echo template';
  const echo=catalog.echoes.find(row=>row.id===template.echoId),sonata=catalog.sonataSets.find(row=>row.id===template.selectedSonataSetId);
  return `${echo.name} · Cost ${template.cost} · ${template.mainStatName} · ${sonata.name}`;
}
