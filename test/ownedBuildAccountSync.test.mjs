import test from 'node:test';
import assert from 'node:assert/strict';
import {IDBFactory} from 'fake-indexeddb';
import {catalog,scan} from './fixtures/inventory.mjs';
import {emptyAccount,saveReviewedScan,validateAccount,moveItem,exportAccount,parseBackup} from '../src/inventoryAccount.mjs';
import {openAccountStore} from '../src/inventoryAccountStore.mjs';
import {productDraftFromAccount,applyOwnedProductDraft} from '../src/productBuildDraft.mjs';

// All stats and item identities below come from the existing canonical editor.
function exampleAccount(){
 const source=catalog.echoes.find(e=>e.name==='The False Sovereign');
 assert.ok(source,'Expected released The False Sovereign identity');
 const stats=catalog.statEditor.mainStatsByCostAndLevel[source.cost][25];
 const hp=stats.find(s=>s.name==='HP%'),crit=stats.find(s=>s.name==='CRIT DMG');
 assert.ok(hp&&crit,'Use exact catalog values for two different Main Stats');
 const secondary=catalog.statEditor.secondaryMainStatsByCostAndLevel[source.cost][25];
 const substats=catalog.statEditor.substats.slice(0,5).map(s=>({name:s.name,value:s.values[0]}));
 const data=mainStat=>({rank:5,level:25,cost:source.cost,selectedSonataSetId:source.sonataSetIds[0],mainStat:structuredClone(mainStat),secondaryMainStat:structuredClone(secondary),substats:structuredClone(substats)});
 const account=saveReviewedScan(emptyAccount(),scan('augusta'),catalog,{reviewed:true,assign:true});
 const slots=account.characters.augusta.record.build.echoSets.sets['set-1'].slots;
 slots.fill(null); // Former gear becomes unequipped, never deleted.
 account.items['physical-echo-A']={id:'physical-echo-A',kind:'echo',catalogId:source.id,data:data(hp),provenance:{kind:'MANUAL_BUILD'}};
 account.items['physical-echo-B']={id:'physical-echo-B',kind:'echo',catalogId:source.id,data:data(crit),provenance:{kind:'MANUAL_BUILD'}};
 return validateAccount(account,catalog);
}

test('AccountStore: one Current Build, Equip/Unequip, same-ID Edit, automatic item tracking and JSON restore',async()=>{
 const factory=new IDBFactory();
 const first=await openAccountStore({catalog,indexedDB:factory,BroadcastChannel:null,profile:'augusta-account'});
 const second=await openAccountStore({catalog,indexedDB:factory,BroadcastChannel:null,profile:'augusta-account'});
 const destination=await openAccountStore({catalog,indexedDB:factory,BroadcastChannel:null,profile:'augusta-restored'});
 try{
  const start=await first.commit(exampleAccount(),{reason:'EXPLICIT_REVIEWED_CHARACTER_IMPORT'});
  const weaponId=start.characters.augusta.record.build.weaponInstanceId;
  assert.ok(start.items[weaponId]&&start.items['physical-echo-A']&&start.items['physical-echo-B']);
  await second.refresh(); // A distinct stale tab with its own revision.
  const stale=second.snapshot();
  const withA=await first.commit(moveItem(start,'physical-echo-A','augusta',0,catalog),{expectedRevision:start.revision,expectedAccountId:start.id});
  assert.equal(withA.characters.augusta.record.build.echoSets.sets['set-1'].slots[0],'physical-echo-A');
  const withB=await first.commit(moveItem(withA,'physical-echo-B','augusta',0,catalog),{expectedRevision:withA.revision,expectedAccountId:withA.id});
  assert.equal(withB.characters.augusta.record.build.echoSets.sets['set-1'].slots[0],'physical-echo-B');
  assert.deepEqual(withB.items['physical-echo-A'],start.items['physical-echo-A'],'uninstalled A remains an owned physical item');
  const draft=productDraftFromAccount(withB,'augusta',{nodes:[]});
  assert.equal(draft.echoes[0].instanceId,'physical-echo-B');
  assert.deepEqual(draft.echoes[0].mainStat,withB.items['physical-echo-B'].data.mainStat,'Build displays canonical Inventory');
  const row=catalog.statEditor.substats.find(s=>s.name===draft.echoes[0].substats[0].name);
  const alternate=row.values.find(value=>value!==draft.echoes[0].substats[0].value);
  assert.ok(Number.isFinite(alternate));
  draft.echoes[0].substats[0].value=alternate;
  const edited=applyOwnedProductDraft(withB,draft,catalog);
  assert.equal(edited.characters.augusta.record.build.echoSets.sets['set-1'].slots[0],'physical-echo-B');
  assert.deepEqual(Object.keys(edited.items).sort(),Object.keys(withB.items).sort());
  assert.equal(edited.items['physical-echo-B'].data.substats[0].value,alternate);
  const saved=await first.commit(edited,{expectedRevision:withB.revision,expectedAccountId:withB.id,reason:'EXPLICIT_PRODUCT_BUILD_SAVE'});
  assert.deepEqual(productDraftFromAccount(saved,'augusta',{nodes:[]}).echoes[0].mainStat,saved.items['physical-echo-B'].data.mainStat);
  assert.equal(saved.items[weaponId].id,weaponId);

  // Build a Character only edits Current. Switching species creates an
  // internal identity; the previously worn Echo remains in the account.
  const nextSpecies=catalog.echoes.find(e=>e.cost===saved.items['physical-echo-B'].data.cost&&e.id!==saved.items['physical-echo-B'].catalogId);
  assert.ok(nextSpecies);
  const changed=productDraftFromAccount(saved,'augusta',{nodes:[]});
  changed.echoes[0]={...changed.echoes[0],instanceId:'replacement-echo',speciesId:nextSpecies.id,selectedSonataSetId:nextSpecies.sonataSetIds[0]};
  const replaced=applyOwnedProductDraft(saved,changed,catalog);
  assert.ok(replaced.items['replacement-echo'],'new species receives an internal ID');
  assert.deepEqual(replaced.items['physical-echo-B'],saved.items['physical-echo-B'],'old physical Echo is not destroyed');
  assert.equal(replaced.characters.augusta.record.build.echoSets.sets['set-1'].slots[0],'replacement-echo');
  assert.deepEqual(first.snapshot(),saved,'no write occurs without a successful AccountStore commit');

  await assert.rejects(second.commit(stale,{expectedRevision:stale.revision,expectedAccountId:stale.id}),/another tab/);
  assert.deepEqual(first.snapshot(),saved,'stale-tab save cannot erase newer equipment');
  const invalid=structuredClone(saved);invalid.items['physical-echo-B'].data.mainStat.value=123456;
  await assert.rejects(first.commit(invalid),/Illegal main stat/);
  assert.deepEqual(first.snapshot(),saved,'invalid stat did not reach durable account');

  const backup=exportAccount(saved,catalog);
  const restored=parseBackup(JSON.stringify(backup),catalog);
  assert.deepEqual(restored,saved);
  const separate=await destination.commit(restored,{reason:'EXPLICIT_JSON_RESTORE'});
  assert.deepEqual(separate,saved,'empty profile restore preserves all account bytes');
  assert.deepEqual(separate.items['physical-echo-A'],saved.items['physical-echo-A']);
  assert.deepEqual(separate.items['physical-echo-B'],saved.items['physical-echo-B']);
  assert.equal(separate.characters.augusta.record.build.weaponInstanceId,weaponId);
  assert.equal(separate.characters.augusta.record.build.echoSets.sets['set-1'].slots[0],'physical-echo-B');
 }finally{first.close();second.close();destination.close();}
});

test('changing a physical item owner moves only that ID and never duplicates an item',()=>{
 let account=exampleAccount();
 account=saveReviewedScan(account,scan('iuno'),catalog,{reviewed:true,assign:true});
 const next=moveItem(account,'physical-echo-B','augusta',0,catalog);
 const draft=productDraftFromAccount(next,'iuno',{nodes:[]});
 draft.echoes[0]={instanceId:'physical-echo-B',speciesId:next.items['physical-echo-B'].catalogId,...structuredClone(next.items['physical-echo-B'].data)};
 // In case another Iuno slot already owns that species, make the replacement
 // deterministic while keeping its other physical Echoes in Inventory.
 for(let i=1;i<5;i++)if(draft.echoes[i]?.speciesId===draft.echoes[0].speciesId)draft.echoes[i]=null;
 const moved=applyOwnedProductDraft(next,draft,catalog);
 assert.equal(moved.characters.augusta.record.build.echoSets.sets['set-1'].slots[0],null);
 assert.equal(moved.characters.iuno.record.build.echoSets.sets['set-1'].slots[0],'physical-echo-B');
 assert.ok(moved.items['physical-echo-A']);
 assert.ok(moved.items['physical-echo-B']);
 assert.equal(Object.keys(moved.items).length,Object.keys(next.items).length);
});
