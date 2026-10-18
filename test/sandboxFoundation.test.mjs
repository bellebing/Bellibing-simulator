import test from 'node:test';
import assert from 'node:assert/strict';
import coverage from '../docs/ui-lab/v1.1/modules/sandbox-defaults.json' with {type:'json'};
import {CHARACTER_CATALOG} from '../src/data/characters.ts';
import {WEAPON_CATALOG} from '../src/data/weapons.ts';
import {ECHO_CATALOG} from '../src/data/echoes.ts';
import {SONATA_CATALOG} from '../src/data/sonatas.ts';
import {CHARACTER_SIGNATURE_ASSOCIATIONS,CHARACTER_GUIDE_RECOMMENDATIONS} from '../src/data/characterEquipmentAssociations.ts';
import {createEchoStatsEditorSelection} from '../src/echoStatEditor.ts';
import {validateEchoLoadout} from '../src/loadoutValidator.ts';
import {inspectSandboxSonata} from '../src/sandboxSonata.mjs';
import {createSandboxState,createSandboxWorkspace,setSandboxWeapon} from '../docs/ui-lab/v1.1/modules/sandbox-state.js';
import {configureSlot,activateConfigurationSlot,resetSimulationResults,settingsConfigurationChanged} from '../docs/ui-lab/v1.1/modules/simulation-configuration.js';
import {createLabResourceInventory} from '../docs/ui-lab/v1.1/modules/resource-state.js';
import {compileSandboxConfiguration} from '../src/sandboxConfigurationBridge.mjs';
import {CANONICAL_CONFIGURATION_SOURCE,SIMULATION_TRANSPORT_PROTOCOL} from '../src/simulationConfigurationBridge.mjs';
import {dpsConceptMarkup} from '../docs/ui-lab/v1.1/modules/dps-concept.js';
const catalog={echoes:ECHO_CATALOG,sonataSets:SONATA_CATALOG};
const contract={protocol:SIMULATION_TRANSPORT_PROTOCOL,publicSourceRevision:CANONICAL_CONFIGURATION_SOURCE,engineVersion:'UNIT_TEST_CONTRACT_ONLY'};
test('coverage gate: all 59 released identities have independent source-bound canonical standard configurations',()=>{
 const released=CHARACTER_CATALOG.filter(c=>c.releaseStatus==='RELEASED');assert.equal(released.length,59);assert.deepEqual(coverage.characters.map(c=>c.characterId),released.map(c=>c.id));
 assert.deepEqual(coverage.summary,{released:59,valid:59,echoComplete:59,weaponComplete:59,pending:0});
 for(const c of coverage.characters){
  assert.equal(c.configurationValidity,'VALID',c.characterId);assert.equal(c.slots.length,5);assert.deepEqual(c.unresolved,[]);
  const templates=c.slots.map(s=>s.configuration);assert.equal(validateEchoLoadout(templates).valid,true);assert.equal(new Set(templates.map(t=>t.echoId)).size,5);
  for(const s of c.slots){const t=s.configuration,e=ECHO_CATALOG.find(e=>e.id===t.echoId);assert.equal(e.releaseStatus,'RELEASED');assert.equal(e.cost,t.cost);assert.equal(t.rank,5);assert.ok(e.sonataSetIds.includes(t.selectedSonataSetId));createEchoStatsEditorSelection(t.cost,t.mainStatName,[]);assert.equal(t.substats,undefined);}
  assert.deepEqual(inspectSandboxSonata(templates,catalog),c.composition);assert.ok(c.composition.every(s=>s.eligiblePieceBonuses.length>0));
  const source=CHARACTER_GUIDE_RECOMMENDATIONS.find(g=>g.characterId===c.characterId);assert.equal(c.sourceLinesSha256,source.sourceLinesSha256);assert.equal(c.sourceUrl,source.sourceUrl);assert.equal(c.baseline.selectedContext.sourceOrder,source.echoSets.find(s=>s.usage==='PRIMARY'&&!c.rejectedSourceShells.some(r=>r.sourceOrder===s.sourceOrder)).sourceOrder);
  assert.match(c.simulationReadiness,/PENDING/);assert.match(c.dprReadiness,/PENDING/);assert.match(c.dpsReadiness,/PENDING/);
 }
});
test('signatures are distinct from reviewed alternatives, all weapon types and max baselines are canonical',()=>{
 let alternatives=0;
 for(const c of coverage.characters){
  const person=CHARACTER_CATALOG.find(p=>p.id===c.characterId),weapon=WEAPON_CATALOG.find(w=>w.id===c.weapon.weaponId),signature=CHARACTER_SIGNATURE_ASSOCIATIONS.find(s=>s.characterId===c.characterId);
  assert.equal(weapon.weaponType,person.weaponType);assert.equal(weapon.releaseStatus,'RELEASED');assert.ok(Number.isFinite(weapon.level90BaseAtk));
  if(signature.status==='VERIFIED_SIGNATURE'){assert.equal(c.weapon.basis,'SIGNATURE');assert.equal(weapon.id,signature.weaponId);}else{alternatives++;assert.equal(c.weapon.basis,'REVIEWED_ALTERNATIVE');assert.ok(CHARACTER_GUIDE_RECOMMENDATIONS.find(g=>g.characterId===c.characterId).weapons.some(w=>w.weaponId===weapon.id));}
  assert.equal(c.baseline.characterLevel,90);assert.equal(c.baseline.weaponLevel,90);assert.equal(c.baseline.sequenceLevel,0);assert.equal(c.baseline.weaponRefinement,1);
  assert.equal(c.baseline.forte.schemaVersion,1);assert.deepEqual(Object.keys(c.baseline.forte.levels).sort(),['circuit','intro','liberation','normal-attack','skill']);assert.ok(Object.values(c.baseline.forte.levels).every(v=>v===10));assert.equal(Object.keys(c.baseline.forte.enabled).length,10);
 }
 assert.ok(alternatives>0,'Never claim all Characters have signatures');
 assert.match(coverage.characters.find(c=>c.characterId==='hsin').baseline.fortePresentationStatus,/PENDING/);
});
test('set eligibility counts distinct species, not cards; never claims dynamic combat effects',()=>{
 const a=coverage.characters.find(c=>c.characterId==='augusta');assert.deepEqual(a.composition.map(s=>[s.setId,s.distinctCount,s.eligiblePieceBonuses]),[['sonata-20',3,[3]],['sonata-3',2,[2]]]);
 const cards=a.slots.slice(0,3).map(s=>s.configuration);cards[2]=structuredClone(cards[1]);const result=inspectSandboxSonata(cards,catalog)[0];assert.equal(result.equippedCount,3);assert.equal(result.distinctCount,2);assert.deepEqual(result.eligiblePieceBonuses,[]);assert.equal(result.effectExecution,'PENDING_COMBAT_CONTEXT');
 assert.throws(()=>inspectSandboxSonata([{...cards[0],selectedSonataSetId:'sonata-7'}],catalog));
 const lucy=coverage.characters.find(c=>c.characterId==='lucy');assert.deepEqual(lucy.composition.map(s=>s.distinctCount),[1,2,2]);
 for(const id of ['rover-electro','suisui','luuk-herssen']){const c=coverage.characters.find(c=>c.characterId===id);assert.equal(c.slots[0].configuration.cost,3);assert.equal(c.slots[1].configuration.cost,4);}
});
test('detached states preserve manual templates, activate/select independently, and never inherit Augusta data',()=>{
 const workspace=createSandboxWorkspace(),a=workspace.select('augusta');const original=structuredClone(a.configurationSession.configurations);
 const custom={...original[1],mainStatName:'ATK%'};configureSlot(a.configurationSession,1,custom);activateConfigurationSlot(a.configurationSession,1,false);
 for(const c of coverage.characters.filter(c=>c.characterId!=='augusta')){const s=workspace.select(c.characterId);assert.equal(s.sandboxBuild.characterId,c.characterId);assert.equal(s.sandboxBuild.kind,'SANDBOX_BUILD');assert.deepEqual(s.configurationSession.configurations,c.slots.map(s=>s.configuration));assert.ok(s.echoes.every(e=>e===null));assert.ok(s.configurationSession.current.every(e=>e===null));assert.equal(s.hasRecordedRun,false);assert.ok(s.stats.every(r=>r.every(v=>v==='—')));assert.deepEqual(s.sonataPool,[]);}
 assert.equal(workspace.select('augusta'),a);assert.deepEqual(a.configurationSession.configurations[1],custom);assert.equal(a.configurationSession.active[1],false);
 const before=structuredClone(a.configurationSession.configurations);resetSimulationResults(a.configurationSession);assert.deepEqual(a.configurationSession.configurations,before);assert.equal(a.configurationSession.active[1],false);
 assert.throws(()=>workspace.select('suoming'));assert.throws(()=>workspace.select('not-a-character'));assert.throws(()=>setSandboxWeapon(a,'the-last-dance'));
});
test('complete owner snapshots/revisions reject stale result contexts after all relevant actions and away/back cycles',()=>{
 const actions=[(w,s,r)=>{w.select('hsin');w.select('augusta');},(w,s)=>setSandboxWeapon(s,'verdant-summit'),(w,s)=>{configureSlot(s.configurationSession,0,{...s.configurationSession.configurations[0],mainStatName:'CRIT DMG'});},(w,s)=>activateConfigurationSlot(s.configurationSession,0,false),(w,s)=>{s.gate='+10';settingsConfigurationChanged(s);},(w,s,r)=>r.set('echoes','20'),(w,s)=>resetSimulationResults(s.configurationSession),(w,s)=>{s.configurationSession.mode='current';w.advanceContext();s.configurationSession.mode='simulate';w.advanceContext();}];
 for(const action of actions){const w=createSandboxWorkspace(),s=w.select('augusta'),r=createLabResourceInventory(),lease=w.capture(r.read(),r.revision());assert.equal(w.assertCurrent(lease,r.read(),r.revision()),true);action(w,s,r);assert.throws(()=>w.assertCurrent(lease,r.read(),r.revision()),/STALE/);}
 const w=createSandboxWorkspace(),a=w.select('augusta'),r=createLabResourceInventory();r.set('premium','Unlimited');w.select('iuno');assert.equal(r.read().tubes.premium.kind,'UNLIMITED');w.select('augusta');assert.equal(a.configurationSession.current.filter(Boolean).length,0);
});
test('Sandbox host compiler reuses Settings/production contract without requiring or observing an account',async()=>{
 const w=createSandboxWorkspace();w.select('augusta');const r=createLabResourceInventory(),ui=w.readContext(r.read(),r.revision()),before=structuredClone(ui);
 const result=await compileSandboxConfiguration(ui,contract,{seed:'s1-contract-test'});assert.equal(result.status,'BOUND_TO_SANDBOX_HOST');assert.equal(result.productionBinding,'NOT_APPLICABLE');assert.equal(result.input.selectedSlots.length,5);assert.deepEqual(ui,before);
 const req=result.input.improvePolicyStorage.characters.augusta;assert.ok(req);assert.equal(result.input.buildState.weaponId,'thunderflare-dominion');assert.ok(Object.values(result.input.buildState.echoSets.sets).every(set=>set.slots.every(x=>x===null)));
 const invalid=structuredClone(ui);invalid.buildContext.kind='ACCOUNT_BUILD';assert.match((await compileSandboxConfiguration(invalid,contract,{})).reasons[0],/EXPLICIT_SANDBOX/);
 const wrong=structuredClone(ui);wrong.buildContext.weaponId='the-last-dance';assert.match((await compileSandboxConfiguration(wrong,contract,{})).reasons[0],/WEAPON/);
 w.select('hsin');assert.match((await compileSandboxConfiguration(w.readContext(r.read(),r.revision()),contract,{})).reasons[0],/PRESET_CONTEXT_MAPPING_PENDING/);
});
test('DPS concept cannot misrepresent demonstration numbers as real results',()=>{
 const markup=dpsConceptMarkup({characterContributions:[2000000,650000,50000],teamTotal:2700000,calculationStatus:'VERIFIED'});assert.equal((markup.match(/<td/g)??[]).length,12);assert.ok(!markup.includes('2700000'));assert.match(markup,/data-status="PENDING"/);assert.match(markup,/team-total/);
});

test('Iuno and Shorekeeper bind their own canonical presets only with explicit Custom Echo requirements',async()=>{
 for(const id of ['iuno','the-shorekeeper']){
  const w=createSandboxWorkspace(),s=w.select(id),r=createLabResourceInventory();
  s.settingsMode='Customize';s.statSections={hard:[],flex:['ATK%'],other:Object.keys(s.minima).filter(id=>id!=='ATK%')};s.flexCount=1;
  settingsConfigurationChanged(s);
  const ui=w.readContext(r.read(),r.revision()),before=JSON.stringify(ui),out=await compileSandboxConfiguration(ui,contract,{seed:'explicit-custom-source-test'});
  assert.equal(out.status,'BOUND_TO_SANDBOX_HOST');assert.equal(out.input.characterId,id);assert.equal(out.input.presetId,id==='iuno'?'iuno-augusta-hybrid':'shorekeeper-augusta-support');
  assert.ok(!out.input.improvePolicyStorage.characters.augusta);assert.equal(JSON.stringify(ui),before);
 }
});
