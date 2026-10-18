// Host-side S2 preparation. No account reader, persistence, ingress or evaluator.
import {SANDBOX_SCENARIO_CONTEXTS} from './sandboxScenarioContexts.mjs';
import standards from '../docs/ui-lab/v1.1/modules/sandbox-defaults.json' with {type:'json'};
import {CHARACTER_CATALOG} from './data/characters.ts';
import {WEAPON_CATALOG} from './data/weapons.ts';
import {startEchoSimulator} from './echoSimulatorSession.ts';
import {adaptUiSettingsV3,compileSimulationConfiguration,configurationValue,validateUiSimulationConfiguration} from './simulationConfigurationBridge.mjs';
const pending=reason=>({kind:'SANDBOX_BUILD',status:'PENDING',reasons:[reason],input:null});
export async function compileSandboxConfiguration(ui,engineContract,options){
 const captured=structuredClone(ui),build=captured?.buildContext;
 const validity=validateUiSimulationConfiguration(captured);
 if(validity.status!=='VALID_UI_CONFIGURATION')return {kind:'SANDBOX_BUILD',status:'REJECTED',reasons:validity.reasons,input:null};
 if(build?.kind!=='SANDBOX_BUILD'||build.schemaVersion!==1||build.version!=='BELLIBING_SANDBOX_BUILD_V1')return pending('EXPLICIT_SANDBOX_BUILD_REQUIRED');
 const standard=standards.characters.find(c=>c.characterId===captured.characterId),person=CHARACTER_CATALOG.find(c=>c.id===captured.characterId&&c.releaseStatus==='RELEASED');
 if(!standard||build.characterId!==captured.characterId||build.presetId!==standard.presetId)return pending('SANDBOX_CHARACTER_CONTEXT_MISMATCH');
 if(configurationValue(build.sourceBindings)!==configurationValue(standards.sourceBindings))return pending('SANDBOX_SOURCE_VERSION_MISMATCH');
 if(configurationValue(build.baseline)!==configurationValue(standard.baseline))return pending('SANDBOX_BASELINE_VERSION_MISMATCH');
 if(typeof build.id!=='string'||!build.id||!['revision','weaponRevision'].every(k=>Number.isSafeInteger(build[k])&&build[k]>=0))return pending('SANDBOX_OWNER_REVISION_REQUIRED');
 const weapon=WEAPON_CATALOG.find(w=>w.id===build.weaponId&&w.releaseStatus==='RELEASED'&&w.weaponType===person.weaponType);
 if(!weapon||!Number.isFinite(weapon.level90BaseAtk))return pending('CANONICAL_SANDBOX_WEAPON_REQUIRED');
 // Only explicit canonical source-context → preset joins bind this bounded trio.
 // Other templates remain Pending; Custom intent supplies missing Echo goals.
 const mapping=SANDBOX_SCENARIO_CONTEXTS[person.id];
 if(!mapping||standard.sourceId!==mapping.sourceId)return pending('SANDBOX_PRIVATE_PRESET_CONTEXT_MAPPING_PENDING');
 const adapted=await adaptUiSettingsV3({characterId:person.id,presetId:mapping.presetId,settings:captured.context.settings});
 if(adapted.status!=='VALID_SETTINGS_V3')return pending(adapted.reason);
 const buildState={weaponId:weapon.id,weaponRefinement:build.baseline.weaponRefinement,sequenceLevel:build.baseline.sequenceLevel,forte:structuredClone(build.baseline.forte),echoSets:{activeSetId:'sandbox',sets:{sandbox:{slots:Array(5).fill(null)}}}};
 const publicSession=startEchoSimulator(person.id,buildState,build.id+':'+captured.revisions.session);publicSession.selectedSlot=captured.selectedSlot;
 // Reuse the production compiler's *contract* with an explicit Sandbox host.
 // This detached v3 envelope is Sandbox intent, never persisted account Settings.
 const host={kind:'SANDBOX_HOST_CONTEXT',characterId:person.id,buildId:build.id,modeId:'default',presetId:mapping.presetId,buildState,publicSession,
  improvePolicyStorage:{version:3,characters:{[person.id]:adapted.state},pendingV2Characters:{},resourceInventory:captured.resourceInventory},
  revisions:{character:captured.revisions.context,build:build.revision+captured.revisions.configuration,settings:captured.revisions.settings,inventory:captured.revisions.inventory,session:captured.revisions.session}};
 const result=await compileSimulationConfiguration(captured,host,engineContract,options);
 return {...result,kind:'SANDBOX_BUILD',status:result.bindingStatus==='BOUND_TO_TRUSTED_HOST'?'BOUND_TO_SANDBOX_HOST':'PENDING',productionBinding:'NOT_APPLICABLE',
  freshnessRequirement:'Trusted host must re-read complete Sandbox owners before and after async work, on dispatch/cached retries and before presentation; captured browser assertions alone are not authority.'};
}
