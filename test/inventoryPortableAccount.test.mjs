import test from 'node:test';
import assert from 'node:assert/strict';
import {IDBFactory} from 'fake-indexeddb';
import {catalog,scan} from './fixtures/inventory.mjs';
import {emptyAccount,saveReviewedScan,saveOwnedTeam,exportAccount,parseBackup,validateAccount} from '../src/inventoryAccount.mjs';
import {openAccountStore} from '../src/inventoryAccountStore.mjs';

const open=(indexedDB,profile)=>openAccountStore({catalog,indexedDB,profile,BroadcastChannel:null});
function fullFixture(){
 let account=emptyAccount();
 for(const characterId of ['augusta','iuno','the-shorekeeper'])account=saveReviewedScan(account,scan(characterId),catalog,{reviewed:true,assign:true});
 // A second reviewed scan adds individual unequipped physical items; never dedupe.
 account=saveReviewedScan(account,scan('augusta'),catalog,{reviewed:true,replace:true,assign:false});
 account.characters.augusta.record.build.sequenceLevel=2;
 account.characters.iuno.record.build.characterLevel=80;
 account.userData.workspaceSettings={augusta:{gate:'+15',view:'CUSTOM'}};
 account.userData.storage['bellibing.improve.policy.v3']=JSON.stringify({version:3,resourceInventory:{tuners:{kind:'FINITE',count:321}}});
 account.userData.storage['bellibing.improve.simple-settings.v2']=JSON.stringify({version:2,prefs:{augusta:{custom:true}}});
 account.userData.observations={augusta:{version:1,observed:[{checkpoint:5,stat:'CRIT Rate',value:0.063}]}};
 account.legacyRoot={oldSettings:{preserve:'yes'}};
 account=saveOwnedTeam(account,{name:'Actual owned team',characterIds:['augusta','iuno','the-shorekeeper']},catalog);
 return validateAccount(account,catalog);
}
test('complete JSON backup restores an identical multi-Character account in an isolated empty profile',async()=>{
 const indexedDB=new IDBFactory(),donor=await open(indexedDB,'json-donor'),recipient=await open(indexedDB,'json-empty');
 try{
  const original=await donor.commit(fullFixture()),text=JSON.stringify(exportAccount(original,catalog));
  const imported=parseBackup(text,catalog);
  assert.equal(Object.keys(original.characters).length,3);
  assert.equal(Object.values(original.items).filter(x=>x.kind==='weapon').length,4);
  assert.equal(Object.values(original.items).filter(x=>x.kind==='echo').length,20);
  assert.equal(new Set(Object.keys(original.items)).size,24);
  assert.deepEqual(imported,original);
  assert.equal(recipient.snapshot(),null);
  const restored=await recipient.commit(imported,{reason:'EXPLICIT_JSON_RESTORE'});
  assert.deepEqual(restored,original); // includes IDs, assignments, Forte, Sequence, settings, Teams, revisions
  recipient.close();
  const reopened=await open(indexedDB,'json-empty');
  try{assert.deepEqual(reopened.snapshot(),original);assert.equal(reopened.snapshot().userData.teams[0].characterIds.length,3);}
  finally{reopened.close();}
 }finally{donor.close();}
});
test('invalid JSON, unsupported version, broken equipment and secret fields never overwrite saved data',async()=>{
 const indexedDB=new IDBFactory(),store=await open(indexedDB,'json-safe');
 try{
  const before=await store.commit(fullFixture()),base=exportAccount(before,catalog);
  const badMissing=structuredClone(base);
  delete badMissing.account.items[badMissing.account.characters.augusta.record.build.weaponInstanceId];
  const invalid=['{invalid',JSON.stringify({...base,schemaVersion:999}),JSON.stringify(badMissing)];
  for(const text of invalid){
   assert.throws(()=>parseBackup(text,catalog));
   assert.deepEqual(store.snapshot(),before);
  }
  const withSecret=structuredClone(before);withSecret.userData.observations.augusta.accessToken='must-not-export';
  assert.throws(()=>exportAccount(withSecret,catalog),/sensitive authentication field/);
  const rawSecret=structuredClone(before);rawSecret.legacyRecovery['bellibing-ui-checkpoint-v34']='{"authToken":"must-not-export"}';
  assert.throws(()=>exportAccount(rawSecret,catalog),/sensitive authentication field/);
  assert.throws(()=>parseBackup(JSON.stringify({...base,account:withSecret}),catalog),/sensitive authentication field/);
  assert.deepEqual(store.snapshot(),before);
 }finally{store.close();}
});
test('explicit replacement records a recoverable before-state and breaks the prior cloud binding',async()=>{
 const indexedDB=new IDBFactory(),owner=await open(indexedDB,'json-replace');
 try{
  const before=await owner.commit(fullFixture());
  await owner.bindSync('old-google-uid',{approved:true});
  assert.equal((await owner.syncBinding()).accountId,before.id);
  const different=await open(indexedDB,'json-other');
  let candidate;
  try{candidate=await different.commit(fullFixture());}finally{different.close();}
  const replaced=await owner.commit(parseBackup(JSON.stringify(exportAccount(candidate,catalog)),catalog),{reason:'EXPLICIT_JSON_RESTORE',expectedRevision:before.revision,expectedAccountId:before.id});
  assert.equal(replaced.id,candidate.id);assert.ok(replaced.revision>before.revision);
  assert.deepEqual(replaced.items,candidate.items);
  assert.equal(await owner.syncBinding(),null);
  const point=(await owner.recovery()).find(x=>x.reason==='EXPLICIT_JSON_RESTORE');
  assert.ok(point?.protected);assert.deepEqual(point.previous,before);
  await owner.rollback(point);assert.deepEqual(owner.snapshot().items,before.items);
 }finally{owner.close();}
});
