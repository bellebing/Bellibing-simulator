import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {initializeTestEnvironment,assertFails} from '@firebase/rules-unit-testing';
import {doc,getDoc,setDoc,deleteDoc} from 'firebase/firestore';
import {firebaseAccountRemote} from '../src/firebaseAccountRemote.mjs';
import {packAccount,unpackAccount} from '../src/accountSync.mjs';
import {emptyAccount,saveReviewedScan} from '../src/inventoryAccount.mjs';
import {catalog,scan} from './fixtures/inventory.mjs';

test('real Firestore emulator: UID isolation, immutable history, CAS, retry and second-device restore',async()=>{
 if(!process.env.FIRESTORE_EMULATOR_HOST)throw Error('Run with the local Firebase emulator; never a production project.');
 const env=await initializeTestEnvironment({projectId:'demo-bellibing-foundation',firestore:{rules:await readFile('firestore.rules','utf8')}});
 try{
  await env.clearFirestore();const db=env.authenticatedContext('owner-a').firestore(),b=env.authenticatedContext('owner-b').firestore(),guest=env.unauthenticatedContext().firestore();
  const remote=firebaseAccountRemote(db),a=saveReviewedScan(emptyAccount(),scan(),catalog,{reviewed:true,assign:true});
  const packed=await packAccount(a,catalog),input={operationId:'snapshot-one',accountId:a.id,expectedRevision:0,...packed};
  assert.deepEqual(await remote.publish('owner-a',input),{status:'SYNCED',revision:1});
  assert.deepEqual(await remote.publish('owner-a',input),{status:'SYNCED',revision:1});
  const second=firebaseAccountRemote(env.authenticatedContext('owner-a').firestore()),download=await second.read('owner-a');
  assert.deepEqual(await unpackAccount(download.manifest,download.chunks,catalog),a);
  for(const client of [b,guest]){
   await assertFails(getDoc(doc(client,'accounts','owner-a')));
   await assertFails(getDoc(doc(client,'accounts','owner-a','snapshots','snapshot-one')));
   await assertFails(getDoc(doc(client,'accounts','owner-a','snapshots','snapshot-one','chunks','0')));
   await assertFails(setDoc(doc(client,'accounts','owner-a'),{version:1}));
  }
  const changes={...input,operationId:'snapshot-two'};
  assert.equal((await remote.publish('owner-a',changes)).status,'CONFLICT');
  const sameBase={...changes,expectedRevision:1},other={...sameBase,operationId:'snapshot-three'};
  const results=await Promise.all([remote.publish('owner-a',sameBase),remote.publish('owner-a',other)]);
  assert.equal(results.filter(r=>r.status==='SYNCED').length,1);assert.equal(results.filter(r=>r.status==='CONFLICT').length,1);
  await assertFails(setDoc(doc(db,'accounts','owner-a','snapshots','snapshot-one','chunks','0'),{data:'overwrite'}));
  await assertFails(deleteDoc(doc(db,'accounts','owner-a','snapshots','snapshot-one')));
  await assertFails(setDoc(doc(db,'accounts','owner-a'),{version:1,revision:99,snapshotId:'missing',accountId:a.id,updatedAt:new Date()}));
  assert.equal((await remote.head('owner-a')).revision,2);
 }finally{await env.cleanup();}
});
