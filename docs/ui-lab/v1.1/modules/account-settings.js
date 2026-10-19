import {loadImprovePolicyStorage,readImprovePolicyState,resolveImprovePolicyState,IMPROVE_POLICY_STORAGE_KEY,IMPROVE_POLICY_V2_KEY} from '../../../assets/improvePolicyState.js';
import source from './production-settings.json' with {type:'json'};
import {ECHO_SETTING_STATS} from './settings-catalog.js';
const missing={status:'PENDING',origin:'PROFILE',value:null};
// Observe saved intent through its existing schema/compatibility resolver.
// Never migrate, persist, round minima, reset Custom or invent source defaults.
export function restoreOwnedSettings(state,storage){
 let bytes;try{bytes=[storage.getItem(IMPROVE_POLICY_STORAGE_KEY),storage.getItem(IMPROVE_POLICY_V2_KEY)];}catch{state.accountSettingsPending='ACCOUNT_SETTINGS_UNREADABLE';state.accountHasSavedSettings=true;return;}
 const binding=JSON.stringify(bytes);
 if(state.accountPolicyBinding===binding)return;
 state.accountPolicyBinding=binding;state.accountSettingsPending=null;state.accountHasSavedSettings=bytes.some(b=>b!==null);
 try{
  const store=loadImprovePolicyStorage(storage);
  if(store.pendingV2Characters[state.id])throw Error('ACCOUNT_SETTINGS_MIGRATION_PENDING');
  if(!store.characters[state.id]){state.accountHasSavedSettings=false;return;}
  const row=source.characters.find(r=>r.characterId===state.id);
  if(!row)throw Error('ACCOUNT_SETTINGS_SOURCE_PENDING');
  const recommended={characterId:row.characterId,presetId:row.presetId,applicability:row.applicability,sourceReviewStatus:row.sourceReviewStatus,
   characterTarget:{numericTargets:missing,priorities:missing},echoPolicy:{requirements:row.requirements,preferences:row.preferences}};
  const saved=readImprovePolicyState(store,state.id,recommended),resolved=resolveImprovePolicyState(saved,recommended);
  if(resolved.compatibility.status!=='COMPATIBLE'||saved.migration&&saved.migration.status!=='MIGRATED')throw Error('ACCOUNT_SETTINGS_CONTEXT_PENDING');
  const req=resolved.policy.echoPolicy.requirements;
  if(!['VERIFIED','USER_DEFINED'].includes(req.status)||!req.value||req.value.groups.length!==1)throw Error('ACCOUNT_SETTINGS_REQUIREMENTS_PENDING');
  const hard=req.value.requiredOnEveryEcho,group=req.value.groups[0],flex=group.members;
  if(![5,10,15,20,25].includes(saved.gate)||saved.rollQuality!=='All Rolls')throw Error('ACCOUNT_GATE_OR_TIER_POLICY_PENDING');
  const tier=rule=>{const i=ECHO_SETTING_STATS.find(s=>s.id===rule.stat)?.tiers.indexOf(rule.minimum);if(i===undefined||i<0)throw Error('ACCOUNT_MINIMUM_SOURCE_PENDING');return i;};
  const minima=Object.fromEntries(ECHO_SETTING_STATS.map(s=>[s.id,0]));
  for(const rule of [...hard,...flex])minima[rule.stat]=tier(rule);
  const sections={hard:hard.map(r=>r.stat),flex:flex.map(r=>r.stat),other:ECHO_SETTING_STATS.map(s=>s.id).filter(id=>![...hard,...flex].some(r=>r.stat===id))};
  if(saved.echoLayout){
   const same=(a,b)=>JSON.stringify([...a].sort())===JSON.stringify([...b].sort());
   if(!same(saved.echoLayout.every,sections.hard)||!same(saved.echoLayout.flex,sections.flex))throw Error('ACCOUNT_LAYOUT_REQUIREMENTS_PENDING');
   sections.hard=[...saved.echoLayout.every];sections.flex=[...saved.echoLayout.flex];sections.other=[...saved.echoLayout.other];
   for(const [stat,minimum]of Object.entries(saved.echoLayout.minimums))minima[stat]=tier({stat,minimum});
  }
  Object.assign(state,{statSections:sections,minima,gate:'+'+saved.gate,flexCount:group.minimumCount,settingsMode:saved.mode==='MANUAL'?'Customize':'Recommended',sourcePreferenceGuidance:null});
 }catch(error){state.accountSettingsPending=error.message;}
}
export function readOwnedResourceBudget(storage){try{return loadImprovePolicyStorage(storage).resourceInventory;}catch{return undefined;}}
