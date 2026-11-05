import test from 'node:test';
import assert from 'node:assert/strict';
import {GoogleAuthProvider,signInWithCredential} from 'firebase/auth';
import {createFirebaseAccountClient} from '../src/firebaseAccountClient.mjs';
import {packAccount,unpackAccount} from '../src/accountSync.mjs';
import {emptyAccount,saveReviewedScan} from '../src/inventoryAccount.mjs';
import {catalog,scan} from './fixtures/inventory.mjs';

test('Google-provider credentials in Auth emulator identify the same user on a second device and isolate another user',async()=>{
 if(!process.env.FIREBASE_AUTH_EMULATOR_HOST||!process.env.FIRESTORE_EMULATOR_HOST)throw Error('Use both local emulators.');
 const make=()=>createFirebaseAccountClient({config:{apiKey:'demo-api-key',projectId:'demo-bellibing-foundation',authDomain:'localhost'},emulators:{host:'127.0.0.1',authPort:9099,firestorePort:8085}});
 const token=sub=>['e30',Buffer.from(JSON.stringify({iss:'https://accounts.google.com',aud:'demo-api-key',sub,email:sub+'@example.test',email_verified:true})).toString('base64url'),''].join('.');
 const login=(client,sub)=>signInWithCredential(client.auth,GoogleAuthProvider.credential(token(sub)));
 const a=make(),second=make(),other=make();try{
  assert.equal(a.uid(),null);await login(a,'foundation-user');const uid=a.uid();assert.ok(uid);
  const account=saveReviewedScan(emptyAccount(),scan(),catalog,{reviewed:true,assign:true}),packed=await packAccount(account,catalog);
  assert.equal((await a.remote.publish(uid,{accountId:account.id,operationId:'google-provider-snapshot',expectedRevision:0,...packed})).status,'SYNCED');
  await login(second,'foundation-user');assert.equal(second.uid(),uid);const cloud=await second.remote.read(uid);assert.deepEqual(await unpackAccount(cloud.manifest,cloud.chunks,catalog),account);
  await login(other,'different-user');assert.notEqual(other.uid(),uid);await assert.rejects(other.remote.read(uid));
  await a.signOut();assert.equal(a.uid(),null);await assert.rejects(a.remote.read(uid));
 }finally{await Promise.all([a.close(),second.close(),other.close()]);}
});
