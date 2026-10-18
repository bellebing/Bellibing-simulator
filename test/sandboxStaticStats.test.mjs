import test from 'node:test';
import assert from 'node:assert/strict';
import {sandboxStats} from '../docs/ui-lab/v1.1/modules/sandbox-stats.js';
import {createSandboxWorkspace} from '../docs/ui-lab/v1.1/modules/sandbox-state.js';
import {simulationModel} from '../docs/ui-lab/v1.1/modules/simulation-model.js';
import {CHARACTER_CATALOG} from '../docs/ui-lab/v1.1/modules/catalog.js';
import echoData from '../docs/ui-prototypes/assets/echoes/browser-data.json' with {type:'json'};
import sources from '../docs/ui-lab/v1.1/modules/sandbox-stat-sources.json' with {type:'json'};
import weapons from '../docs/ui-prototypes/assets/weapons/browser-data.json' with {type:'json'};
import {projectSandboxStaticStats} from '../src/sandboxStaticStats.mjs';

// Canonical card fixtures exercise projection only, not private rolling or a
// claim of actual browser observations. All numeric pairs come from the editor.
function fixture(state){return {view:{slots:state.configurationSession.configurations.map((t,i)=>({slot:i+1,complete:true,current:{id:'projection-fixture-'+i,speciesId:t.echoId,selectedSonataSetId:t.selectedSonataSetId,rank:t.rank,cost:t.cost,level:25,
 mainStat:echoData.statEditor.mainStatsByCostAndLevel[t.cost]['25'].find(s=>s.name===t.mainStatName),secondaryMainStat:echoData.statEditor.secondaryMainStatsByCostAndLevel[t.cost]['25'],
 substats:echoData.statEditor.substats.slice(0,5).map(s=>({name:s.name,value:s.values[0]}))}}))}};}
test('all 59 baselines expose sourced static fields while an absent loadout stays Pending',()=>{
 const w=createSandboxWorkspace();
 for(const c of sources.characters){const s=w.select(c.id),p=sandboxStats(s);assert.equal(p.baseline.status,'SOURCE_BACKED_STATIC_COMPONENT',c.id);assert.equal(Object.keys(p.baseline.values).length,12);assert.equal(p.observed,null);assert.deepEqual(p.observedValues,{});assert.equal(p.baseline.authorizesDps,false);}
 const jingran=sandboxStats(w.select('jingran'));assert.equal(jingran.baseline.values.TOTAL_DEF,0);assert.equal(jingran.baselineValues.TOTAL_DEF,'0');
});
test('observed complete fixture uses canonical card values and unconditional distinct-species Sonata facts',()=>{
 const s=createSandboxWorkspace().select('augusta'),p=sandboxStats(s,fixture(s));
 assert.equal(p.observed.status,'SOURCE_BACKED_STATIC_COMPONENT');assert.equal(p.observed.sources.echoIds.length,5);
 assert.ok(p.observed.sources.sonataEffectIds.includes('VT_2PC_ELECTRO'));
 assert.ok(p.observed.pending.sonata.length>0,'Conditional Crown effects stay Pending');
 assert.equal(p.observed.values.ELECTRO_DMG_BONUS,.7);
 s.sandboxStatProjection=p;
 const model=simulationModel(CHARACTER_CATALOG.find(c=>c.id==='augusta'),s);
 assert.equal(model.rows.find(r=>r.id==='ELECTRO_DMG_BONUS').simulated,'70%');
 assert.equal(model.rows.find(r=>r.id==='BASIC_ATTACK_DMG_BONUS').simulated,'0%');
 assert.ok(model.rows.every(r=>r.expected===null));
});
test('missing, candidate-only, incomplete or mismatched cards never fill Simulated stats',()=>{
 const s=createSandboxWorkspace().select('augusta');
 for(const mutate of [r=>r.view.slots.pop(),r=>r.view.slots[0].complete=false,r=>r.view.slots[0].current=null,r=>r.view.slots[0].current.speciesId='unknown',r=>r.view.slots[1].current.id=r.view.slots[0].current.id,r=>r.view.slots[0].current.substats[0].value=12345]){
  const r=fixture(s);mutate(r);const p=sandboxStats(s,r);assert.ok(p.observed===null||p.observed.status==='PENDING');assert.deepEqual(p.observedValues,{});
 }
});
test('static projection rejects unsupported investment rather than borrowing a default',()=>{
 const s=createSandboxWorkspace().select('augusta'),c=sources.characters.find(c=>c.id===s.id),weapon=weapons.weapons.find(w=>w.id===s.sandboxBuild.weaponId);
 const input={character:c,weapon,baseline:s.sandboxBuild.baseline,echoStatContract:echoData.statEditor};
 assert.equal(projectSandboxStaticStats({...input,baseline:{...input.baseline,sequenceLevel:1}}).status,'PENDING');
 assert.equal(projectSandboxStaticStats({...input,baseline:{...input.baseline,forte:{levels:{},enabled:{}}}}).status,'PENDING');
});
