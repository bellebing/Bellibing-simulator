import test from 'node:test';
import assert from 'node:assert/strict';
import defaults from '../docs/ui-lab/v1.1/modules/sandbox-defaults.json' with {type:'json'};
import {createSandboxWorkspace} from '../docs/ui-lab/v1.1/modules/sandbox-state.js';
import {createLabResourceInventory} from '../docs/ui-lab/v1.1/modules/resource-state.js';
import {compileSandboxConfiguration} from '../src/sandboxConfigurationBridge.mjs';
import {SIMULATION_TRANSPORT_PROTOCOL,CANONICAL_CONFIGURATION_SOURCE} from '../src/simulationConfigurationBridge.mjs';
import {costScopeMarkup} from '../docs/ui-lab/v1.1/modules/cost-scope.js';
const contract={protocol:SIMULATION_TRANSPORT_PROTOCOL,engineVersion:'GENERAL_ECHO_SIMULATION_V1',publicSourceRevision:CANONICAL_CONFIGURATION_SOURCE};
test('all 59 source shells bind explicit Custom goals with their own Character and no borrowed recommendation',async()=>{
 for(const c of defaults.characters){const w=createSandboxWorkspace(),s=w.select(c.characterId),r=createLabResourceInventory();s.settingsMode='Customize';s.statSections={hard:[],flex:['ATK%'],other:Object.keys(s.minima).filter(id=>id!=='ATK%')};s.flexCount=1;
 const out=await compileSandboxConfiguration(w.readContext(r.read(),r.revision()),contract,{seed:'source-contract'});assert.equal(out.status,'BOUND_TO_SANDBOX_HOST',c.characterId);assert.equal(out.input.characterId,c.characterId);assert.ok(out.input.improvePolicyStorage.characters[c.characterId]);assert.equal(Object.keys(out.input.improvePolicyStorage.characters).length,1);
 if(out.input.sandboxEchoContext)assert.equal(out.input.presetId,'sandbox-echo-only:'+c.characterId);
 }
});
test('variance requires a complete matching unbounded Echo-goal scope; finite and incomplete runs remain Pending',()=>{
 const dto={version:'BELLIBING_COST_COMPARISON_V1',status:'COMPARABLE',scope:{goal:'ECHO_TARGETS_ONLY',start:'EMPTY_SELECTED_SLOTS',costBasis:'GROSS_RECEIPTS'},resourceScope:'UNCONSTRAINED',completion:'ECHO_GOAL_MET',rows:{echoes:{expected:20,simulated:18,delta:-2},tuners:{expected:2000,simulated:2300,delta:300}}};
 assert.match(costScopeMarkup(dto),/2 under expected.*300 over expected/);
 assert.match(costScopeMarkup({...dto,status:'PENDING',reason:'FINITE_BUDGET_EXPECTATION_PENDING'}),/finite-budget expectation is Pending/);
 assert.match(costScopeMarkup({...dto,completion:'INCOMPLETE'}),/scope mismatch/);
 assert.match(costScopeMarkup({...dto,rows:{echoes:{expected:20,simulated:18,delta:100}}}),/difference Pending/);
});
