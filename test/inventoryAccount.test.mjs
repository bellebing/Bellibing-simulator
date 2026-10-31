// Canonical-data ownership tests; no private images, builds or engine results.
import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
import {CHARACTER_CATALOG} from '../src/data/characters.ts';
import {emptyAccount,saveReviewedScan,legacyProjection,accountFromLegacy,validateAccount,exportAccount,parseBackup,moveItem,readJson} from '../src/inventoryAccount.mjs';
const echoData=JSON.parse(readFileSync(new URL('../docs/ui-prototypes/assets/echoes/browser-data.json',import.meta.url))),weaponData=JSON.parse(readFileSync(new URL('../docs/ui-prototypes/assets/weapons/browser-data.json',import.meta.url)));
const catalog={characters:CHARACTER_CATALOG.filter(c=>c.releaseStatus==='RELEASED'),echoes:echoData.echoes,statEditor:echoData.statEditor,weapons:weaponData.weapons.filter(w=>w.releaseStatus==='RELEASED'),sourceBinding:'CANONICAL_TEST_CATALOG'};
function scan(characterId='lupa'){
 const c=catalog.characters.find(c=>c.id===characterId),w=catalog.weapons.find(w=>w.weaponType===c.weaponType),used=new Set();
 const echoes=[4,3,3,1,1].map(cost=>{const e=catalog.echoes.find(e=>e.cost===cost&&!used.has(e.id));used.add(e.id);return {echoId:e.id,sonataId:e.sonataSetIds[0],cost,rank:null,level:null,mainStat:structuredClone(catalog.statEditor.mainStatsByCostAndLevel[cost][25][0]),secondaryMainStat:structuredClone(catalog.statEditor.secondaryMainStatsByCostAndLevel[cost][25]),substats:catalog.statEditor.substats.slice(0,5).map(r=>({name:r.name,value:r.values[0]}))};});
 return {character:{id:characterId,level:90},weapon:{id:w.id,level:90,refinement:null},sequence:0,skills:{basic:10,skill:10,circuit:10,intro:10,liberation:10},echoes};
}
test('scans require explicit review and assignment; preserve unknown observations and input',()=>{
 const a=emptyAccount(),d=scan(),before=structuredClone(d);assert.throws(()=>saveReviewedScan(a,d,catalog));
 const loose=saveReviewedScan(a,d,catalog,{reviewed:true});assert.equal(Object.keys(loose.items).length,6);assert.equal(loose.characters.lupa.record.build.weaponInstanceId,null);
 const saved=saveReviewedScan(a,d,catalog,{reviewed:true,assign:true});assert.equal(Object.keys(a.items).length,0);assert.deepEqual(d,before);
 const view=legacyProjection(saved);assert.equal(view.characters[0],'Lupa');assert.equal(view.drafts.Lupa.build.echoSets.sets['set-1'].slots[0].rank,null);assert.equal(view.drafts.Lupa.build.forte.levels['normal-attack'],10);assert.equal(view.drafts.Lupa.build.minorForteUnknown,true);
});
test('replacement and identical-looking items never silently deduplicate or delete previous items',()=>{
 const d=scan(),a=saveReviewedScan(emptyAccount(),d,catalog,{reviewed:true,assign:true});assert.throws(()=>saveReviewedScan(a,d,catalog,{reviewed:true,assign:true}));
 const b=saveReviewedScan(a,d,catalog,{reviewed:true,assign:true,replace:true});assert.equal(Object.keys(b.items).length,12);for(const itemId of Object.keys(a.items))assert.deepEqual(b.items[itemId],a.items[itemId]);
 const rebuilt=accountFromLegacy(legacyProjection(a),catalog,{current:a});assert.deepEqual(Object.keys(rebuilt.items).sort(),Object.keys(a.items).sort());
});
test('legacy conversion preserves fields and source recovery without writing or losing physical identity',()=>{
 const old=legacyProjection(saveReviewedScan(emptyAccount(),scan(),catalog,{reviewed:true,assign:true}));old.custom={untouched:7};old.drafts.Lupa.build.unrelated='keep';const before=structuredClone(old);
 const next=accountFromLegacy(old,catalog,{recovery:{'bellibing-ui-checkpoint-v34':JSON.stringify(old)}});assert.deepEqual(old,before);assert.equal(next.legacyRoot.custom.untouched,7);assert.equal(legacyProjection(next).drafts.Lupa.build.unrelated,'keep');assert.equal(next.legacyRecovery['bellibing-ui-checkpoint-v34'],JSON.stringify(old));
 assert.throws(()=>accountFromLegacy({characters:['Unknown'],drafts:{Unknown:{build:{}}}},catalog));
});
test('backup roundtrip preserves supported account data and rejects schema, source, unsafe and illegal data',()=>{
 const a=saveReviewedScan(emptyAccount(),scan(),catalog,{reviewed:true,assign:true});assert.deepEqual(parseBackup(JSON.stringify(exportAccount(a,catalog)),catalog),a);
 const b=exportAccount(a,catalog);b.schemaVersion=99;assert.throws(()=>parseBackup(JSON.stringify(b),catalog));
 assert.throws(()=>parseBackup(JSON.stringify({...exportAccount(a,catalog),catalogBinding:'OTHER'}),catalog));assert.throws(()=>readJson('{"__proto__":{}}'));
 const invalid=structuredClone(a);const e=Object.values(invalid.items).find(i=>i.kind==='echo');e.data.substats[1]=e.data.substats[0];assert.throws(()=>validateAccount(invalid,catalog));
});
test('explicit moves clear the former owner, retain replaced items and reject illegal double ownership',()=>{
 let a=saveReviewedScan(emptyAccount(),scan(),catalog,{reviewed:true,assign:true});a=saveReviewedScan(a,scan('chisa'),catalog,{reviewed:true,assign:true});
 const source=a.characters.lupa.record.build.echoSets.sets['set-1'].slots[0],replaced=a.characters.chisa.record.build.echoSets.sets['set-1'].slots[0],moved=moveItem(a,source,'chisa',0,catalog);
 assert.equal(moved.characters.lupa.record.build.echoSets.sets['set-1'].slots[0],null);assert.equal(moved.characters.chisa.record.build.echoSets.sets['set-1'].slots[0],source);assert.ok(moved.items[replaced]);assert.equal(Object.keys(moved.items).length,12);
 const bad=structuredClone(a);bad.characters.chisa.record.build.echoSets.sets['set-1'].id='forged';bad.characters.chisa.record.build.echoSets.sets['set-1'].slots[0]=source;assert.throws(()=>validateAccount(bad,catalog));
});
test('legacy identity-only slots preserve unknown observations; orphaned membership fails closed',()=>{
 const d=scan(),legacy={characters:['Lupa'],drafts:{Lupa:{character:'Lupa',build:{echoSets:{activeSetId:'set-1',sets:{'set-1':{id:'set-1',slots:d.echoes.map(e=>e.echoId)}}}}}}};
 const next=accountFromLegacy(legacy,catalog);const observed=legacyProjection(next).drafts.Lupa.build.echoSets.sets['set-1'].slots;
 assert.equal(observed[0].echoId,d.echoes[0].echoId);assert.equal(observed[0].rank,null);assert.equal(observed[0].level,null);assert.deepEqual(observed[0].substats,[]);
 assert.throws(()=>accountFromLegacy({characters:['Lupa'],drafts:{}},catalog));
});
test('unowned legacy drafts and templates survive migration without becoming physical Inventory',()=>{
 const known=legacyProjection(saveReviewedScan(emptyAccount(),scan(),catalog,{reviewed:true,assign:true}));known.characters=[];
 const migrated=accountFromLegacy(known,catalog);assert.equal(Object.keys(migrated.items).length,0);assert.equal(Object.keys(migrated.characters).length,0);assert.deepEqual(legacyProjection(migrated),known);
 assert.throws(()=>saveReviewedScan(migrated,scan(),catalog,{reviewed:true,assign:true}));
});
test('reviewed facts complete observations without replacing physical items or other Characters',async()=>{
 const {reviewBuildFacts}=await import('../src/inventoryAccount.mjs');
 const a=saveReviewedScan(emptyAccount(),scan(),catalog,{reviewed:true,assign:true});const slots=a.characters.lupa.record.build.echoSets.sets['set-1'].slots;
 const facts={characterLevel:90,weaponLevel:90,weaponRefinement:1,echoes:slots.map(id=>({id,rank:5,level:25}))};
 assert.throws(()=>reviewBuildFacts(a,'lupa',facts,catalog));
 const b=reviewBuildFacts(a,'lupa',facts,catalog,{reviewed:true});assert.deepEqual(Object.keys(b.items),Object.keys(a.items));assert.equal(b.characters.lupa.record.build.minorForteUnknown,true);
 assert.equal(b.items[slots[0]].data.rank,5);assert.equal(a.items[slots[0]].data.rank,null);
 assert.throws(()=>reviewBuildFacts(a,'lupa',{...facts,echoes:facts.echoes.toReversed()},catalog,{reviewed:true}));
 assert.throws(()=>reviewBuildFacts(a,'lupa',{...facts,echoes:facts.echoes.map(f=>({...f,level:10}))},catalog,{reviewed:true}));
});
test('review corrections retain immutable original Echo observations alongside corrected values',()=>{
 const original=scan(),corrected=structuredClone(original);corrected.echoes[0].substats[0].value=catalog.statEditor.substats[0].values.at(-1);
 const a=saveReviewedScan(emptyAccount(),corrected,catalog,{reviewed:true,assign:true,originalScan:original});const e=a.items[a.characters.lupa.record.build.echoSets.sets['set-1'].slots[0]];
 assert.deepEqual(e.provenance.evidence.originalObservation,original.echoes[0]);assert.equal(e.data.substats[0].value,corrected.echoes[0].substats[0].value);
});
