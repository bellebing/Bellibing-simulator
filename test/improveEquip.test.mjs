import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyAccount,saveReviewedScan,equipObservedEcho} from '../src/inventoryAccount.mjs';
import {catalog,scan} from './fixtures/inventory.mjs';
test('explicit Improve equip preserves replaced physical equipment and rejects stale or incomplete input',()=>{
 const observation=scan('augusta');observation.echoes.forEach(e=>{e.rank=5;e.level=25;});
 const account=saveReviewedScan(emptyAccount(),observation,catalog,{reviewed:true,assign:true});
 const build=account.characters.augusta.record.build,oldId=build.echoSets.sets[build.echoSets.activeSetId].slots[0];
 const item=account.items[oldId],candidate={...structuredClone(item.data),id:'recorded-new-echo',speciesId:item.catalogId};
 const before=structuredClone(account);
 const next=equipObservedEcho(account,'augusta',0,candidate,catalog,{expectedItemId:oldId});
 const saved=next.characters.augusta.record.build;
 assert.equal(saved.echoSets.sets[saved.echoSets.activeSetId].slots[0],'observed:recorded-new-echo');
 assert.deepEqual(next.items[oldId],account.items[oldId]);assert.deepEqual(next.userData,account.userData);
 assert.equal(saved.weaponInstanceId,build.weaponInstanceId);assert.deepEqual(account,before);
 assert.throws(()=>equipObservedEcho(account,'augusta',0,candidate,catalog,{expectedItemId:'stale'}),/changed/);
 assert.throws(()=>equipObservedEcho(account,'augusta',0,{...candidate,level:20},catalog,{expectedItemId:oldId}),/checkpoint/);
});


test('explicit Improve equip accepts +0 and partial checkpoints into empty slots without discarding inventory',()=>{
 const observation=scan('augusta');observation.echoes.forEach(e=>{e.rank=5;e.level=25;});
 const account=saveReviewedScan(emptyAccount(),observation,catalog,{reviewed:true,assign:true}),build=account.characters.augusta.record.build;
 const slotIds=build.echoSets.sets[build.echoSets.activeSetId].slots,original=account.items[slotIds[0]];slotIds[0]=null;
 for(const level of [0,5,20]){
  const card={...structuredClone(original.data),id:'checkpoint-'+level,speciesId:original.catalogId,level,substats:original.data.substats.slice(0,level/5)};
  card.mainStat=catalog.statEditor.mainStatsByCostAndLevel[card.cost][level].find(row=>row.name===card.mainStat.name);card.secondaryMainStat=catalog.statEditor.secondaryMainStatsByCostAndLevel[card.cost][level];
  const next=equipObservedEcho(account,'augusta',0,card,catalog,{expectedItemId:null});
  assert.equal(next.items['observed:'+card.id].data.level,level);assert.deepEqual(next.items[original.id],original);assert.equal(slotIds[0],null);
 }
});
