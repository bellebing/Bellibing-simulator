import {createBrowserSandboxClient} from './browser-client.js';
import {createSandboxState,setSandboxWeapon} from './sandbox-state.js';
import {configurationLiveContext,settingsSnapshot} from './simulation-configuration.js';
import {validateEchoTemplateConfiguration} from '../../../ui-prototypes/assets/echo-template-configuration.mjs';
import catalog from '../../../ui-prototypes/assets/echoes/browser-data.json' with {type:'json'};

const clone=value=>structuredClone(value);
// ACCOUNT_BUILD remains the real read-only owner. The existing worker receives
// a distinct detached Echo-target search, never the account as SANDBOX_BUILD.
// That search certifies generation goals/receipts, not account improvement cost.
export function createImproveCandidateSession({readOwner,onChange=()=>{},clientFactory=createBrowserSandboxClient}={}){
 let client=null,binding=null,search=null,run=null,generation=0;
 const read=()=>{const value=readOwner();if(value?.kind!=='ACCOUNT_BUILD')throw Error('ACCOUNT_BUILD_REQUIRED');return clone(value);};
 const identity=owner=>JSON.stringify(owner);
 function invalidate(){generation++;const previous=client;client=null;binding=null;search=null;run=null;previous?.invalidate();onChange(null);}
 function checkFresh(){if(binding!==null&&identity(read())!==binding){invalidate();return false;}return true;}
 function prepare(){
  const owner=read(),record=owner.record,settings=settingsSnapshot(owner.state);
  if(record?.status!=='OBSERVED_PRODUCTION_BUILD_RECORD'||record.characterId!==owner.state.id)throw Error('OWNED_BUILD_RECORD_REQUIRED');
  if(owner.state.accountSettingsPending)throw Error(owner.state.accountSettingsPending);
  // The reused search's ER gate has a different (fresh full-set) scope.
  if(settings.erTarget.enabled)throw Error('ACCOUNT_REPLACEMENT_ER_POLICY_PENDING');
  const build=record.buildState,cards=build.echoSets.sets[build.echoSets.activeSetId].slots;
  const selected=owner.state.configurationSession.active.map(Boolean);
  if(!selected.some(Boolean))throw Error('NO_ACTIVE_CONFIGURED_SLOTS');
  const fresh=createSandboxState(owner.state.id);
  setSandboxWeapon(fresh,build.weaponId);
  fresh.configurationSession.configurations=cards.map((card,index)=>{
   if(!selected[index])return null;
   if(!card)throw Error('OWNED_ECHO_SLOT_REQUIRED');
   return validateEchoTemplateConfiguration(catalog,{echoId:card.echoId,cost:card.cost,rank:card.rank,selectedSonataSetId:card.selectedSonataSetId,mainStatName:card.mainStat?.name});
  });
  fresh.configurationSession.active=selected;
  fresh.selectedSlot=owner.state.selectedSlot;
  for(const key of ['statSections','minima','flexCount','settingsMode','gate','erTarget','canonicalSettingsSource'])fresh[key]=clone(owner.state[key]);
  fresh.sonataPool=[];
  // IDs here belong only to this separate, memory-only search. Account identity,
  // revisions and persistence are untouched and are not fabricated for the engine.
  const context={...configurationLiveContext(fresh,owner.inventory,{inventoryRevision:owner.inventoryRevision,contextRevision:0}),buildContext:clone(fresh.sandboxBuild)};
  return {owner,context,selected};
 }
 function attach(prepared){
  const g=++generation;const previous=client;client=null;previous?.invalidate();
  binding=identity(prepared.owner);search=prepared;run=null;
  client=clientFactory({readContext:()=>{if(!checkFresh())throw Error('STALE_ACCOUNT_CANDIDATE');return clone(search.context);},onChange:value=>{
   if(g!==generation||!checkFresh())return;
   if(value?.view&&value.view.characterId&&value.view.characterId!==prepared.owner.state.id)throw Error('FOREIGN_CANDIDATE_CHARACTER');
   run=value?{status:value.status,runId:value.runId??null,view:clone(value.view??null),simulatedCost:clone(value.simulatedCost??null),reasons:clone(value.reasons??[]),
    ownerKind:'ACCOUNT_BUILD',purpose:'OBSERVED_REPLACEMENT_CANDIDATE',improvementExpectedCost:{status:'PENDING',reason:'REPLACEMENT_SUCCESS_POLICY_NOT_CERTIFIED'},ranking:{status:'PENDING'},dps:{status:'PENDING'}}:null;
   onChange(clone(run));
  }});
 }
 return {
  kind:'ACCOUNT_BUILD',checkFresh,invalidate,snapshot:()=>clone(run),isBusy:()=>client?.isBusy()??false,
  async metrics(){try{const p=prepare();if(binding!==identity(p.owner)||!client)attach(p);const g=generation,result=await client.metrics();if(g!==generation||!checkFresh())throw Error('STALE_ACCOUNT_CANDIDATE');return {status:result.status,reasons:result.reasons??[]};}catch(error){return {status:'PENDING',reasons:[error.message]};}},
  async start(){const p=prepare();attach(p);await client.start();return clone(run);},
  async step(){if(!client||!checkFresh())throw Error('STALE_ACCOUNT_CANDIDATE');await client.step();return clone(run);},
  async abort(){if(!client||!checkFresh())throw Error('STALE_ACCOUNT_CANDIDATE');await client.abort();return clone(run);},
  reset(){invalidate();},
  async export(){if(!client||!run?.runId||!checkFresh())throw Error('ACCOUNT_CANDIDATE_RUN_REQUIRED');const g=generation,data=await client.export();if(g!==generation||!checkFresh())throw Error('STALE_ACCOUNT_CANDIDATE');return {schemaVersion:1,kind:'BELLIBING_ACCOUNT_CANDIDATE_EXPORT_V1',owner:{kind:'ACCOUNT_BUILD',characterId:search.owner.state.id,ownerRecord:clone(search.owner.record.ownerRecord),buildId:null,revisions:null},purpose:'OBSERVED_REPLACEMENT_CANDIDATE',improvementExpectedCost:{status:'PENDING'},ranking:{status:'PENDING'},search:data};}
 };
}
