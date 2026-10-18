import {CHARACTER_CATALOG} from '../../src/data/characters.ts';
import {WEAPON_CATALOG} from '../../src/data/weapons.ts';
// Explicit detached TEST owner, never a production bootstrap or account fallback.
import {projectRecommendedImprovePolicy} from '../../src/improvePolicySources.ts';
import {createImprovePolicyState} from '../../src/improvePolicyState.ts';
import {startEchoSimulator} from '../../src/echoSimulatorSession.ts';
import {emptyResourceInventory} from '../../src/resourceInventory.ts';
import {resetDemoState} from '../../docs/ui-lab/v1.1/modules/lab-state.js';
import {createConfigurationSession,configurationLiveContext} from '../../docs/ui-lab/v1.1/modules/simulation-configuration.js';
import {initializeCanonicalSettings} from '../../docs/ui-lab/v1.1/modules/canonical-settings.js';
import {CANONICAL_CONFIGURATION_SOURCE,SIMULATION_TRANSPORT_PROTOCOL,createSimulationConfigurationBridge} from '../../src/simulationConfigurationBridge.mjs';
export async function configurationFixture(characterId='augusta'){
 const state=resetDemoState(characterId);state.configurationSession=createConfigurationSession(characterId);initializeCanonicalSettings(state);
 const inventory=emptyResourceInventory();inventory.echoes={kind:'FINITE',count:200};inventory.tuners={kind:'FINITE',count:10000};inventory.tubes.premium={kind:'FINITE',count:200};
 const source=await projectRecommendedImprovePolicy({characterId}),policy=createImprovePolicyState(characterId,source);
 const person=CHARACTER_CATALOG.find(c=>c.id===characterId);
 const weaponId=characterId==='augusta'?'thunderflare-dominion':WEAPON_CATALOG.find(w=>w.releaseStatus==='RELEASED'&&w.weaponType===person.weaponType).id;
 const build={weaponId,sequenceLevel:0,echoSets:{activeSetId:'test-account-set',sets:{'test-account-set':{slots:['echo-60001215',null,null,null,null]}}}};
 // The actual account build IDs/revision service are absent from the Lab. These
 // explicit fixture IDs prove the host contract only, never a live player binding.
 const production={characterId,buildId:'test-build:'+characterId,modeId:'default',presetId:source.presetId,
  buildState:build,publicSession:startEchoSimulator(characterId,build,'test-public-session:'+characterId),
  improvePolicyStorage:{version:3,characters:{[characterId]:policy},pendingV2Characters:{},resourceInventory:inventory},
  revisions:{character:0,build:0,settings:0,inventory:0,session:0}};
 const counters={context:0,inventory:0};
 const readUiContext=()=>configurationLiveContext(state,inventory,{inventoryRevision:counters.inventory,contextRevision:counters.context});
 const readProductionContext=()=>production;
 const bridge=createSimulationConfigurationBridge({readUiContext,readProductionContext});
 const contract={protocol:SIMULATION_TRANSPORT_PROTOCOL,engineVersion:'UNIT_TEST_ONLY_NOT_PRIVATE_CAPABILITY',publicSourceRevision:CANONICAL_CONFIGURATION_SOURCE};
 return {state,inventory,source,policy,production,counters,readUiContext,readProductionContext,bridge,contract};
}
