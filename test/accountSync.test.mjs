import test from 'node:test';
import assert from 'node:assert/strict';
import {IDBFactory} from 'fake-indexeddb';
import {catalog,scan} from './fixtures/inventory.mjs';
import {emptyAccount,saveReviewedScan} from '../src/inventoryAccount.mjs';
import {openAccountStore} from '../src/inventoryAccountStore.mjs';
import {createAccountSync,packAccount,unpackAccount} from '../src/accountSync.mjs';
const account=()=>saveReviewedScan(emptyAccount(),scan(),catalog,{reviewed:true,assign:true});
async function store(){const s=await openAccountStore({catalog,indexedDB:new IDBFactory(),BroadcastChannel:null});await s.commit(account());return s;}

test('large Unicode account splits below document limits and verifies complete content before restore',async()=>{
 const a=account();a.legacyRoot.notes='🍃'.repeat(60000);const packed=await packAccount(a,catalog);
 assert.ok(packed.chunks.length>1);assert.ok(packed.chunks.every(p=>new TextEncoder().encode(p).length<=180000));
 const manifest={version:1,count:packed.chunks.length,...packed};assert.deepEqual(await unpackAccount(manifest,packed.chunks,catalog),a);
 await assert.rejects(unpackAccount(manifest,packed.chunks.slice(1),catalog),/Incomplete/);
 await assert.rejects(unpackAccount(manifest,[packed.chunks[0]+'x',...packed.chunks.slice(1)],catalog));
});
test('authentication alone never uploads an unlinked local account',async()=>{
 const s=await store();try{let calls=0;const sync=createAccountSync({store:s,catalog,readUid:()=> 'A',remote:{publish(){calls++;}}});
  assert.deepEqual(await sync.run(),{status:'UNLINKED'});assert.equal(calls,0);await assert.rejects(s.bindSync('A'),/Explicit/);
 }finally{s.close();}
});
test('quota/network failures and conflicts preserve local account and durable outbox',async()=>{
 const s=await store();try{await s.bindSync('A',{approved:true});const before=s.snapshot(),pending=await s.pendingSync();
  const sync=createAccountSync({store:s,catalog,readUid:()=> 'A',remote:{publish(){throw Error('QUOTA_EXCEEDED');}}});
  await assert.rejects(sync.run(),/QUOTA/);assert.deepEqual(s.snapshot(),before);assert.deepEqual(await s.pendingSync(),pending);
  const conflict=createAccountSync({store:s,catalog,readUid:()=> 'A',remote:{publish:async()=>({status:'CONFLICT',head:{revision:2}})}});
  assert.equal((await conflict.run()).status,'CONFLICT');assert.deepEqual(await s.pendingSync(),pending);
 }finally{s.close();}
});
test('a local edit during remote publication cannot be cleared by the earlier acknowledgement',async()=>{
 const s=await store();try{await s.bindSync('A',{approved:true});let release;const waiting=new Promise(r=>{release=r;});
  const sync=createAccountSync({store:s,catalog,readUid:()=> 'A',remote:{publish:async()=>{await waiting;return {status:'SYNCED',revision:1};}}});
  const running=sync.run();await new Promise(r=>setTimeout(r,20));await s.saveUserData('bellibing.improve.policy.v3','{"version":3}');const latest=await s.pendingSync();release();
  assert.equal((await running).status,'SYNCED');assert.deepEqual(await s.pendingSync(),latest);assert.equal((await s.syncBinding()).remoteRevision,1);
 }finally{s.close();}
});
test('Google account switch or logout cannot acknowledge a previous user upload',async()=>{
 const s=await store();try{await s.bindSync('A',{approved:true});let uid='A';
  const sync=createAccountSync({store:s,catalog,readUid:()=>uid,remote:{publish:async()=>{uid='B';return {status:'SYNCED',revision:1};}}});
  await assert.rejects(sync.run(),/ACCOUNT_CHANGED/);assert.ok(await s.pendingSync());assert.equal((await s.syncBinding()).remoteRevision,0);
  await assert.rejects(s.bindSync('B',{approved:true}),/another Google/);assert.equal((await sync.run()).status,'UNLINKED');
 }finally{s.close();}
});
test('a linked second device atomically downloads newer cloud state and keeps a recovery point',async()=>{
 const a=await store(),b=await openAccountStore({catalog,indexedDB:new IDBFactory(),BroadcastChannel:null});
 let current=null,revision=0;
 const remote={head:async()=>current?{revision,accountId:current.accountId}:null,
  publish:async(uid,value)=>{if(value.expectedRevision!==revision)return {status:'CONFLICT',head:{revision}};current=value;return {status:'SYNCED',revision:++revision};},
  read:async()=>({head:{revision,accountId:current.accountId},manifest:{version:1,count:current.chunks.length,...current},chunks:current.chunks})};
 try{
  await a.bindSync('A',{approved:true});const syncA=createAccountSync({store:a,catalog,remote,readUid:()=> 'A'});await syncA.run();
  const syncB=createAccountSync({store:b,catalog,remote,readUid:()=> 'A'}),first=await syncB.download();
  await b.applyCloud({uid:'A',account:first.account,remoteRevision:first.head.revision,approved:true});assert.equal(await b.pendingSync(),null);
  await a.saveUserData('bellibing.improve.policy.v3','{"version":3,"tuners":123}');await syncA.run();
  assert.equal((await syncB.run()).status,'DOWNLOADED');assert.deepEqual(b.snapshot().items,a.snapshot().items);assert.deepEqual(b.snapshot().userData,a.snapshot().userData);assert.ok((await b.recovery()).length>0);
  // Local pending edits win protection even if a download was already requested.
  const before=b.snapshot();await b.saveUserData('bellibing.improve.policy.v3','{"version":3,"tuners":456}');
  await assert.rejects(b.applyCloud({uid:'A',account:first.account,remoteRevision:3,expectedRevision:before.revision}),/another tab|Local changes/);
  assert.equal(b.snapshot().userData.storage['bellibing.improve.policy.v3'],'{"version":3,"tuners":456}');
 }finally{a.close();b.close();}
});

test('reviewed conflict choices preserve both versions and reject stale review',async()=>{
 for(const choice of ['LOCAL','CLOUD']){
  const s=await store();try{
   await s.bindSync('A',{approved:true});const original=s.snapshot(),cloud=structuredClone(original);
   cloud.userData.storage['bellibing.improve.policy.v3']='{"version":3,"tuners":777}';
   const packed=await packAccount(cloud,catalog);let revision=2;
   const remote={read:async()=>({head:{revision,accountId:cloud.id},manifest:{version:1,count:packed.chunks.length,...packed},chunks:packed.chunks})};
   const sync=createAccountSync({store:s,catalog,remote,readUid:()=> 'A'}),pending=await s.pendingSync();
   const review={choice,remoteRevision:2,localOperationId:pending.operationId,approved:true};
   await assert.rejects(sync.resolveConflict({...review,approved:false}),/EXPLICIT/);
   revision=3;await assert.rejects(sync.resolveConflict(review),/STALE/);assert.deepEqual(s.snapshot(),original);
   revision=2;await sync.resolveConflict(review);
   if(choice==='LOCAL'){assert.deepEqual(s.snapshot(),original);assert.deepEqual(await s.pendingSync(),pending);assert.equal((await s.syncBinding()).remoteRevision,2);}
   else{assert.deepEqual(s.snapshot().userData,cloud.userData);assert.equal(await s.pendingSync(),null);assert.ok((await s.recovery()).some(point=>point.previous?.id===original.id));}
  }finally{s.close();}
 }
});
