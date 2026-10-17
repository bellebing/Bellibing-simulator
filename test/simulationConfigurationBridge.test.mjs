import test from 'node:test';
import assert from 'node:assert/strict';
import {configurationFixture} from './helpers/simulationConfigurationFixture.mjs';
import {compileSimulationConfiguration,adaptUiSettingsV3,validateUiSimulationConfiguration,createSimulationConfigurationBridge} from '../src/simulationConfigurationBridge.mjs';
import {configureSlot,activateConfigurationSlot,selectConfigurationSlot,resetSimulationResults,settingsConfigurationChanged} from '../docs/ui-lab/v1.1/modules/simulation-configuration.js';
import {updateImprovePolicyState} from '../src/improvePolicyState.ts';
const options={seed:'explicit-offline-contract-test'};

test('canonical Augusta/default four-Flex settings and five templates bind without importing real equipment',async()=>{
 const f=await configurationFixture(),before=structuredClone(f.production);
 const {result,lease}=await f.bridge.prepare(f.contract,options);
 assert.equal(result.uiStatus,'VALID_UI_CONFIGURATION');assert.equal(result.bindingStatus,'BOUND_TO_TRUSTED_HOST');assert.equal(result.capability,'PENDING_PRIVATE_PREFLIGHT');
 assert.equal(result.input.characterId,'augusta');assert.equal(result.input.modeId,'default');assert.equal(result.input.presetId,'augusta-standard');
 assert.equal(result.input.selectedSlots.length,5);assert.deepEqual(result.input.selectedSlots.map(s=>s.template),f.state.configurationSession.configurations);
 assert.ok(Object.values(result.input.buildState.echoSets.sets).every(s=>s.slots.every(x=>x===null)));
 assert.equal(result.input.buildState.weaponId,f.production.buildState.weaponId);
 const s=await adaptUiSettingsV3({characterId:'augusta',presetId:'augusta-standard',settings:f.readUiContext().context.settings});
 assert.equal(s.resolved.userApprovedEchoDefault,true);assert.equal(s.resolved.policy.echoPolicy.requirements.status,'USER_DEFINED');
 assert.deepEqual(s.resolved.policy.echoPolicy.requirements.value.groups[0].members.map(r=>r.stat),['ATK%','Heavy Attack DMG','Energy Regen','Flat ATK']);
 assert.deepEqual(f.production,before);assert.ok(f.state.configurationSession.current.every(c=>c===null));assert.ok(lease);
});
test('Customize uses canonical v3 actions, exact minimum tiers/count and the actual persisted Settings owner',async()=>{
 const f=await configurationFixture();f.state.settingsMode='Customize';f.state.gate='+10';f.state.minima['CRIT Rate']=1;settingsConfigurationChanged(f.state);
 let attempt=await f.bridge.prepare(f.contract,options);assert.ok(attempt.result.reasons.includes('UI_SETTINGS_NOT_COMMITTED_TO_PRODUCTION_OWNER'));assert.equal(attempt.lease,null);
 const proposal=await adaptUiSettingsV3({characterId:'augusta',presetId:'augusta-standard',settings:f.readUiContext().context.settings});
 f.production.improvePolicyStorage.characters.augusta=proposal.state;f.production.revisions.settings++;
 attempt=await f.bridge.prepare(f.contract,options);assert.equal(attempt.result.bindingStatus,'BOUND_TO_TRUSTED_HOST');assert.equal(attempt.result.input.improvePolicyStorage.characters.augusta.mode,'MANUAL');
 const bad=f.readUiContext();bad.context.settings.hard[0].minimum=.000123;assert.equal(validateUiSimulationConfiguration(bad).status,'INVALID_UI_CONFIGURATION');
 await assert.rejects(adaptUiSettingsV3({characterId:'augusta',presetId:'augusta-standard',settings:bad.context.settings}),/INVALID_CANONICAL_MINIMUM/);
});
test('valid UI is distinct from missing production ownership, source context and private preflight',async()=>{
 const f=await configurationFixture();const noHost=await compileSimulationConfiguration(f.readUiContext(),null,f.contract,options);
 assert.equal(noHost.uiStatus,'VALID_UI_CONFIGURATION');assert.deepEqual(noHost.reasons,['PRODUCTION_OWNER_NOT_CONNECTED']);assert.equal(noHost.input,null);
 const bad=structuredClone(f.production);bad.modeId='unselected-imaginary-mode';assert.ok((await compileSimulationConfiguration(f.readUiContext(),bad,f.contract,options)).reasons.includes('MODE_PRESET_CONTEXT_MISMATCH'));
 const a=await configurationFixture('aalto');assert.equal(a.state.configurationSession.defaultRecommendation.sourceId,'PRYDWEN:aalto');
 const pending=await compileSimulationConfiguration(a.readUiContext(),a.production,a.contract,options);assert.equal(pending.capability,'PENDING');assert.equal(pending.input,null);assert.notEqual(pending.bindingStatus,'BOUND_TO_TRUSTED_HOST');
 const unknown=f.readUiContext();unknown.characterId='not-a-character';assert.equal(validateUiSimulationConfiguration(unknown).status,'INVALID_UI_CONFIGURATION');
 const unsupportedCharacter=await configurationFixture('hsin');const missing=await unsupportedCharacter.bridge.prepare(unsupportedCharacter.contract,options);assert.equal(missing.result.uiStatus,'VALID_UI_CONFIGURATION');assert.deepEqual(missing.result.reasons,['PRODUCTION_PRESET_CONTEXT_UNAVAILABLE']);assert.equal(missing.lease,null);
 const {lease}=await f.bridge.prepare(f.contract,options);
 // Unit stub tests projection only; actual private acceptance is tested offline separately.
 const unavailable=await f.bridge.probe(lease,async()=>{throw Error('SECRET_INTERNAL_DIAGNOSTIC');});assert.equal(unavailable.reason,'PRIVATE_PREFLIGHT_UNAVAILABLE');assert.ok(!JSON.stringify(unavailable).includes('SECRET'));
 assert.deepEqual(await f.bridge.probe(lease,async()=>({status:'PENDING',privatePolicy:'must not cross'})),{compilerVersion:'BELLIBING_PUBLIC_CONFIGURATION_V1',status:'PENDING_PRIVATE_CAPABILITY'});
});
test('all real UI/production owner changes invalidate leases, including cycles and changes without a counter bump',async()=>{
 const changes=[
  f=>{f.counters.context++;},
  f=>configureSlot(f.state.configurationSession,1,{...f.state.configurationSession.configurations[1],mainStatName:'ATK%'}),
  f=>activateConfigurationSlot(f.state.configurationSession,1,false),
  f=>selectConfigurationSlot(f.state,2),
  f=>{f.state.gate='+10';settingsConfigurationChanged(f.state);},
  f=>{f.inventory.echoes.count++;f.counters.inventory++;f.production.revisions.inventory++;},
  f=>resetSimulationResults(f.state.configurationSession),
  f=>{f.state.configurationSession.mode='current';f.counters.context++;f.state.configurationSession.mode='simulate';f.counters.context++;},
  f=>{f.production.characterId='aalto';},f=>{f.production.modeId='changed';},f=>{f.production.buildId='another-build';},f=>{f.production.publicSession.id='new-session';},f=>{f.production.revisions.character++;},f=>{f.production.revisions.build++;},f=>{f.production.revisions.settings++;},f=>{f.production.revisions.session++;},
  f=>{f.production.buildState.weaponId='changed-without-revision';},f=>{f.state.gate='+10';},
 ];
 for(const change of changes){const f=await configurationFixture();const {lease}=await f.bridge.prepare(f.contract,options);change(f);assert.throws(()=>f.bridge.guard(lease,()=>assert.fail('stale callback invoked')),/STALE/);assert.throws(()=>f.bridge.assertCurrent(lease),/INVALIDATED/);}
 const f=await configurationFixture();const {lease}=await f.bridge.prepare(f.contract,options);assert.throws(()=>f.bridge.assertCurrent({...lease}),/UNKNOWN/);
});
test('inactive slots retain template data but are excluded; invalid templates/costs never enter a bound input',async()=>{
 const f=await configurationFixture(),saved=structuredClone(f.state.configurationSession.configurations);
 activateConfigurationSlot(f.state.configurationSession,1,false);const {result}=await f.bridge.prepare(f.contract,options);
 assert.deepEqual(result.input.selectedSlots.map(s=>s.slot),[1,3,4,5]);assert.deepEqual(f.state.configurationSession.configurations,saved);
 for(const patch of [{cost:2},{rank:4},{mainStatName:'imaginary'},{selectedSonataSetId:'sonata-missing'},{substats:[]}]){
  const ui=f.readUiContext();Object.assign(ui.slots[0].configuration,patch);assert.equal(validateUiSimulationConfiguration(ui).status,'INVALID_UI_CONFIGURATION');
 }
 const bad=f.readUiContext();for(const row of bad.slots){row.active=true;row.configuration={...saved[0]};}assert.equal(validateUiSimulationConfiguration(bad).status,'INVALID_UI_CONFIGURATION');
});
test('async compilation/preflight races reject; synchronous transport guards never accept a changed host context',async()=>{
 const f=await configurationFixture();const inflight=f.bridge.prepare(f.contract,options);f.counters.inventory++;await assert.rejects(inflight,/CONTEXT_CHANGED/);
 const {lease}=await f.bridge.prepare(f.contract,options);let resolve;const probe=f.bridge.probe(lease,()=>new Promise(done=>{resolve=done;}));resetSimulationResults(f.state.configurationSession);resolve({status:'READY'});await assert.rejects(probe,/STALE/);
 const g=await configurationFixture();const next=await g.bridge.prepare(g.contract,options);assert.equal(g.bridge.guard(next.lease,()=>42),42);
 assert.throws(()=>g.bridge.guard(next.lease,()=>Promise.resolve(42)),/ATOMIC_HOST/);
});

test('existing production account records are observed read-only without synthesizing Build/mode/revision identity',async()=>{
 const {readProductionBuildRecord,PRODUCTION_BUILD_STORAGE_KEY}=await import('../src/productionBuildRecord.mjs');
 const f=await configurationFixture(),account={characters:['Augusta'],drafts:{Augusta:{character:'Augusta',build:structuredClone(f.production.buildState)}}};
 let bytes=JSON.stringify(account),reads=0;const storage={getItem(key){reads++;assert.equal(key,PRODUCTION_BUILD_STORAGE_KEY);return bytes;},setItem(){assert.fail('read-only observer wrote storage');}};
 const {readFileSync}=await import('node:fs');assert.ok(readFileSync(new URL('../docs/ui-prototypes/v34-functional.html',import.meta.url),'utf8').includes("const KEY='"+PRODUCTION_BUILD_STORAGE_KEY+"'"));
 const evidence=readProductionBuildRecord(storage,{id:'augusta',name:'Augusta'});assert.equal(evidence.status,'OBSERVED_PRODUCTION_BUILD_RECORD');assert.equal(evidence.buildId,null);assert.equal(evidence.modeId,null);assert.equal(evidence.revisions,null);
 evidence.buildState.echoSets.sets['test-account-set'].slots[0]=null;assert.equal(JSON.parse(bytes).drafts.Augusta.build.echoSets.sets['test-account-set'].slots[0],'echo-60001215');
 assert.equal(readProductionBuildRecord(storage,{id:'aalto',name:'Aalto'}).reason,'CHARACTER_NOT_OWNED_IN_PRODUCTION_ACCOUNT');
 bytes='{corrupt';assert.equal(readProductionBuildRecord(storage,{id:'augusta',name:'Augusta'}).status,'PENDING');assert.equal(bytes,'{corrupt');assert.equal(reads,3);
});
