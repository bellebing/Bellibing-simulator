import test from 'node:test';
import assert from 'node:assert/strict';
import catalog from '../../ui-prototypes/assets/echoes/browser-data.json' with {type:'json'};
import {validateEchoTemplateConfiguration,templateSelectionCard} from '../../ui-prototypes/assets/echo-template-configuration.mjs';
import {createEchoStatsEditorSelection} from '../../../src/echoStatEditor.ts';
import {ECHO_CATALOG} from '../../../src/data/echoes.ts';
import {createConfigurationSession,configureSlot,activateConfigurationSlot,configurationSnapshot,configurationContext,resetSimulationResults,settingsConfigurationChanged,selectConfigurationSlot} from '../v1.1/modules/simulation-configuration.js';
import {resetDemoState} from '../v1.1/modules/lab-state.js';
import {emptyResourceInventory} from '../../assets/resourceInventory.js';

const choice=(cost=4)=>{
  const echo=catalog.echoes.find(row=>row.cost===cost);
  return {echoId:echo.id,cost,rank:5,mainStatName:catalog.statEditor.mainStatsByCostAndLevel[cost]['0'][0].name,selectedSonataSetId:echo.sonataSetIds[0]};
};
function owner(id){const state=resetDemoState(id);state.configurationSession=createConfigurationSession(id,{initializeDefaults:false});return state;}

test('all Workshop template identities, Main Stats and Sonatas reuse canonical catalog and Rank-5 rules',()=>{
  for(const echo of catalog.echoes){
    const source=ECHO_CATALOG.find(row=>row.id===echo.id);
    assert.equal(source.cost,echo.cost);assert.deepEqual(source.sonataSetIds,echo.sonataSetIds);
    for(const main of catalog.statEditor.mainStatsByCostAndLevel[echo.cost]['0'])for(const sonata of echo.sonataSetIds){
      const selected={echoId:echo.id,cost:echo.cost,rank:5,mainStatName:main.name,selectedSonataSetId:sonata};
      const card=templateSelectionCard(catalog,selected),canonical=createEchoStatsEditorSelection(echo.cost,main.name,[]);
      assert.deepEqual(card.mainStat,canonical.mainStat);assert.deepEqual(card.secondaryMainStat,canonical.secondaryMainStat);
      assert.equal(card.level,0);assert.deepEqual(card.substats,[]);assert.deepEqual(validateEchoTemplateConfiguration(catalog,selected),selected);
    }
  }
});
test('invalid identities, Cost, Rank, Main Stat, Sonata and rolled-card fields are rejected atomically',()=>{
  const state=createConfigurationSession('augusta',{initializeDefaults:false}),valid=choice();configureSlot(state,0,valid);
  const before=structuredClone(state);
  for(const patch of [{echoId:'false-sovereign'},{cost:2},{rank:4},{mainStatName:'Electro DMG'},{selectedSonataSetId:'sonata-missing'},{substats:[]},{level:25}]){
    assert.throws(()=>configureSlot(state,0,{...valid,...patch}));assert.deepEqual(state,before);
  }
  const echo=catalog.echoes.find(row=>row.id===valid.echoId),incompatible=catalog.sonataSets.find(row=>!echo.sonataSetIds.includes(row.id));
  assert.throws(()=>configureSlot(state,0,{...valid,selectedSonataSetId:incompatible.id}));
  assert.throws(()=>configureSlot(state,5,valid));activateConfigurationSlot(state,2,true);assert.equal(state.active[2],true);assert.equal(state.configurations[2],null);activateConfigurationSlot(state,2,false);
});
test('Selected, Configured, Active and actual Simulated Current remain four independent states',async()=>{
  const state=owner('augusta'),session=state.configurationSession,inventory=emptyResourceInventory();
  const original=structuredClone({echoes:state.echoes,stats:state.stats,histories:state.histories});
  state.selectedSlot=3;configureSlot(session,1,choice(3));
  assert.equal(state.selectedSlot,3);assert.equal(session.active[1],false);assert.equal(session.current[1],null);
  activateConfigurationSlot(session,1,true);const first=await configurationSnapshot(state,inventory);
  assert.equal(first.selectedSlot,4);assert.deepEqual(first.selectedSlots.map(row=>row.slot),[2]);
  assert.equal(first.slots[1].simulatedCurrent,null);assert.equal(first.validation.status,'VALID_TEMPLATE_SELECTION');assert.equal(first.capability.status,'PENDING');
  assert.match(first.slots[1].configuration.templateId,/^sha256:/);
  activateConfigurationSlot(session,1,false);assert.equal(session.configurations[1].echoId,choice(3).echoId);
  assert.deepEqual({echoes:state.echoes,stats:state.stats,histories:state.histories},original);
  const saved=structuredClone(session.configurations);resetSimulationResults(session);assert.deepEqual(session.configurations,saved);
  assert.deepEqual(session.current,Array(5).fill(null));assert.deepEqual(inventory,emptyResourceInventory());
});
test('Character-owned templates and Customize survive switching; context revisions detect stale settings',async()=>{
  const a=owner('augusta'),b=owner('aalto'),inventory=emptyResourceInventory();
  a.settingsMode='Customize';a.minima['CRIT Rate']=2;configureSlot(a.configurationSession,0,choice(4));activateConfigurationSlot(a.configurationSession,0,true);
  b.settingsMode='Customize';configureSlot(b.configurationSession,2,choice(1));activateConfigurationSlot(b.configurationSession,2,true);
  const before=configurationContext(a),snapshot=await configurationSnapshot(a,inventory),other=await configurationSnapshot(b,inventory);
  assert.equal(other.characterId,'aalto');assert.equal(other.slots[0].configuration,null);assert.equal(other.slots[2].configuration.cost,1);assert.deepEqual(other.context.settings.hard,[]);
  assert.equal(snapshot.context.settings.mode,'Customize');assert.equal(a.minima['CRIT Rate'],2);
  a.minima['CRIT Rate']=3;settingsConfigurationChanged(a);assert.notEqual(configurationContext(a),before);const after=await configurationSnapshot(a,inventory);
  assert.equal(after.revisions.settings,snapshot.revisions.settings+1);assert.deepEqual(other.slots[2].configuration,(await configurationSnapshot(b,inventory)).slots[2].configuration);
  snapshot.slots[0].configuration.echoId='tampered';assert.equal(a.configurationSession.configurations[0].echoId,choice(4).echoId);
});
test('canonical Cost limit blocks an invalid active selection without rewriting user intent or losing history',async()=>{
  const state=owner('augusta'),session=state.configurationSession;
  session.histories[0].push({id:'retained-observation'});
  for(let slot=0;slot<4;slot++){configureSlot(session,slot,choice(4));activateConfigurationSlot(session,slot,true);}
  const snapshot=await configurationSnapshot(state,emptyResourceInventory());
  assert.equal(snapshot.validation.status,'INVALID_CONFIGURATION');assert.ok(snapshot.validation.issues.includes('TOO_HIGH_COST'));assert.equal(snapshot.selectedSlots.length,4);
  assert.equal(session.histories[0][0].id,'retained-observation');assert.deepEqual(session.current,Array(5).fill(null));
});

test('revision owners preserve edit cycles and count shared inventory mutations, not snapshot reads',async()=>{
  const {createLabResourceInventory}=await import('../v1.1/modules/resource-state.js');
  const state=owner('augusta'),inventory=createLabResourceInventory(),before=configurationContext(state);
  selectConfigurationSlot(state,2);selectConfigurationSlot(state,0);assert.notEqual(configurationContext(state),before);
  const revision=inventory.revision();inventory.set('echoes','7');inventory.set('echoes','0');assert.equal(inventory.revision(),revision+2);
  assert.throws(()=>inventory.set('echoes','-1'));assert.equal(inventory.revision(),revision+2);
  const a=await configurationSnapshot(state,inventory.read(),{inventoryRevision:inventory.revision()}),b=await configurationSnapshot(state,inventory.read(),{inventoryRevision:inventory.revision()});
  assert.deepEqual(a.revisions,b.revisions);assert.equal(a.revisions.inventory,revision+2);
});

test('all 59 source-bound defaults validate independently and do not fabricate missing alternatives or execution',async()=>{
  const {default:defaults}=await import('../v1.1/modules/default-loadouts.json',{with:{type:'json'}});
  const {configuredCard}=await import('../v1.1/modules/configured-card.js');
  const {echoCard}=await import('../v1.1/modules/echo-card.js');
  assert.equal(defaults.characters.length,59);
  for(const row of defaults.characters){
    const session=createConfigurationSession(row.characterId);
    assert.equal(session.defaultRecommendation.sourceId,row.sourceId);
    assert.deepEqual(session.configurations,row.slots.map(s=>s.configuration));
    assert.deepEqual(session.active,row.slots.map(s=>!!s.configuration));
    assert.ok(session.current.every(c=>c===null));assert.ok(session.histories.every(h=>h.length===0));
    for(const [index,template] of session.configurations.entries())if(template){
      assert.deepEqual(validateEchoTemplateConfiguration(catalog,template),template);
      assert.equal(session.provenance[index].kind,'RECOMMENDED_DEFAULT');
      const card=configuredCard(template),html=echoCard(card);
      assert.equal(card.main,template.mainStatName);assert.deepEqual(card.stats,[]);assert.equal(card.value,'—');
      assert.ok(html.includes('CONFIGURED'));assert.ok(html.includes('class="level">CONFIGURED</span>'));assert.ok(html.includes('Not rolled'));
      assert.equal(session.provenance[index].identityBasis,index===0?'SOURCE_MAIN_ECHO':'CANONICAL_COMPATIBLE_EXAMPLE');
    }
    if(row.context.required)assert.ok(session.configurations.every(c=>!c));
  }
  assert.equal(defaults.summary.complete,1);assert.equal(defaults.characters.find(r=>r.complete).characterId,'augusta');
  const a=createConfigurationSession('augusta'),b=createConfigurationSession('aalto');
  assert.ok(a.configurations.every(Boolean));assert.equal(b.configurations[0],null);assert.equal(b.defaultRecommendation.sourceId,'PRYDWEN:aalto');
  assert.ok(b.defaultRecommendation.pending.some(p=>p.includes('MAIN_STAT_ALTERNATIVES_REQUIRE_CHOICE')));
  const edited={...a.configurations[1],mainStatName:'ATK%'};configureSlot(a,1,edited);assert.equal(a.provenance[1].kind,'CUSTOM_OVERRIDE');
  resetSimulationResults(a);assert.deepEqual(a.configurations[1],edited);assert.equal(a.provenance[1].kind,'CUSTOM_OVERRIDE');
  const i=createConfigurationSession('iuno');assert.equal(i.defaultRecommendation.sourceId,'PRYDWEN:iuno');
  assert.ok(i.defaultRecommendation.context.reviewedProfileReferences.every(p=>!p.selected));
});
