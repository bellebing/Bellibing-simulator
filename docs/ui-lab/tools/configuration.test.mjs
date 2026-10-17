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
function owner(id){const state=resetDemoState(id);state.configurationSession=createConfigurationSession(id);return state;}

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
  const state=createConfigurationSession('augusta'),valid=choice();configureSlot(state,0,valid);
  const before=structuredClone(state);
  for(const patch of [{echoId:'false-sovereign'},{cost:2},{rank:4},{mainStatName:'Electro DMG'},{selectedSonataSetId:'sonata-missing'},{substats:[]},{level:25}]){
    assert.throws(()=>configureSlot(state,0,{...valid,...patch}));assert.deepEqual(state,before);
  }
  const echo=catalog.echoes.find(row=>row.id===valid.echoId),incompatible=catalog.sonataSets.find(row=>!echo.sonataSetIds.includes(row.id));
  assert.throws(()=>configureSlot(state,0,{...valid,selectedSonataSetId:incompatible.id}));
  assert.throws(()=>configureSlot(state,5,valid));assert.throws(()=>activateConfigurationSlot(state,2,true));
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
