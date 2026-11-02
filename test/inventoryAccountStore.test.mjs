import test from 'node:test';
import assert from 'node:assert/strict';
import {IDBFactory,IDBObjectStore} from 'fake-indexeddb';
import {catalog,scan} from './fixtures/inventory.mjs';
import {emptyAccount,saveReviewedScan,withUserData,exportAccount,parseBackup} from '../src/inventoryAccount.mjs';
import {openAccountStore} from '../src/inventoryAccountStore.mjs';
const account=()=>saveReviewedScan(emptyAccount(),scan(),catalog,{reviewed:true,assign:true});
const open=(indexedDB,profile='default')=>openAccountStore({catalog,indexedDB,profile,BroadcastChannel:null});

test('save, close and reopen preserves account and the atomic sync outbox',async()=>{
 const db=new IDBFactory(),a=await open(db),input=account();
 const saved=await a.commit(input);assert.equal(input.revision,0);
 assert.deepEqual((await a.pendingSync()).account,saved);a.close();
 const b=await open(db);try{assert.deepEqual(b.snapshot(),saved);assert.deepEqual((await b.pendingSync()).account,saved);}finally{b.close();}
});
test('two tabs cannot overwrite stale account or settings, and profile data stays isolated',async()=>{
 const db=new IDBFactory(),a=await open(db),b=await open(db),other=await open(db,'other');
 try{
  await a.commit(account());await b.refresh();const stale=b.snapshot();
  await a.saveUserData('bellibing.improve.policy.v3','{"version":3}');
  await assert.rejects(b.commit(stale),/another tab/);assert.deepEqual(other.snapshot(),null);
  await b.refresh();assert.equal(b.snapshot().userData.storage['bellibing.improve.policy.v3'],'{"version":3}');
  assert.equal(Object.keys(b.snapshot().items).length,6);
 }finally{a.close();b.close();other.close();}
});
test('outbox quota failure aborts account and recovery together; next save can recover',async()=>{
 const db=new IDBFactory(),a=await open(db);const put=IDBObjectStore.prototype.put;
 try{
  const before=await a.commit(account()),points=await a.recovery(),pending=await a.pendingSync();
  IDBObjectStore.prototype.put=function(...args){if(this.name==='outbox')throw new DOMException('Quota full','QuotaExceededError');return put.apply(this,args);};
  await assert.rejects(a.commit(before),/Quota full/);IDBObjectStore.prototype.put=put;
  await a.refresh();assert.deepEqual(a.snapshot(),before);assert.deepEqual(await a.recovery(),points);assert.deepEqual(await a.pendingSync(),pending);
  assert.equal((await a.commit(before)).revision,before.revision+1);
 }finally{IDBObjectStore.prototype.put=put;a.close();}
});
test('ten ordinary recovery points are retained without pruning another profile or protected restore',async()=>{
 const db=new IDBFactory(),a=await open(db),b=await open(db,'other');
 try{
  await a.commit(account());await b.commit(account());
  const restored=parseBackup(JSON.stringify(exportAccount(a.snapshot(),catalog)),catalog);
  await a.commit(restored,{reason:'EXPLICIT_JSON_RESTORE'});
  for(let i=0;i<15;i++)await a.commit(a.snapshot());
  const points=await a.recovery();assert.equal(points.filter(p=>!p.protected).length,10);assert.equal(points.filter(p=>p.protected).length,1);assert.equal((await b.recovery()).length,1);
  const point=points.find(p=>p.protected),before=a.snapshot();
  await a.rollback({...point,previous:account()});assert.equal(a.snapshot().id,point.previous.id);assert.ok(a.snapshot().revision>before.revision);
  await assert.rejects(a.rollback({...point,key:99999}),/no longer exists/);
 }finally{a.close();b.close();}
});
test('upgrade of actual version-1 database leaves old account and recovery bytes intact until explicit save',async()=>{
 const db=new IDBFactory(),old=account();delete old.userData;
 const connection=await new Promise((resolve,reject)=>{const r=db.open('bellibing-owned-inventory',1);r.onupgradeneeded=()=>{r.result.createObjectStore('accounts');r.result.createObjectStore('recovery',{autoIncrement:true});};r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});
 await new Promise((resolve,reject)=>{const tx=connection.transaction(['accounts','recovery'],'readwrite');tx.objectStore('accounts').put(old,'default');tx.objectStore('recovery').add({profile:'default',reason:'OLD',previous:null});tx.oncomplete=resolve;tx.onabort=()=>reject(tx.error);});connection.close();
 const a=await open(db);try{
  assert.deepEqual(a.snapshot(),old);assert.equal(await a.pendingSync(),null);
  await a.commit(withUserData(old,{storage:{'bellibing.improve.policy.v3':'{"version":3}'}}));
  const migration=(await a.recovery()).find(p=>p.protected);assert.deepEqual(migration.previous,old);
  await a.rollback(migration);assert.deepEqual(a.snapshot().items,old.items);assert.equal(a.snapshot().userData,undefined);
 }finally{a.close();}
});
test('unknown future account version fails closed and remains in the database',async()=>{
 const db=new IDBFactory(),a=await open(db);await a.commit(account());a.close();
 const connection=await new Promise(resolve=>{const r=db.open('bellibing-owned-inventory');r.onsuccess=()=>resolve(r.result);});
 const future={schemaVersion:999,id:'future',characters:{keep:true}};
 await new Promise(resolve=>{const tx=connection.transaction('accounts','readwrite');tx.objectStore('accounts').put(future,'default');tx.oncomplete=resolve;});connection.close();
 const blocked=await open(db);assert.equal(blocked.status().writable,false);assert.deepEqual(blocked.rawRecovery().account,future);await assert.rejects(blocked.commit(account()),/Unsupported account schema/);assert.throws(()=>blocked.storage({getItem:()=>null}).getItem('anything'),/Unsupported/);blocked.close();
 const read=await new Promise(resolve=>{const r=db.open('bellibing-owned-inventory');r.onsuccess=()=>resolve(r.result);});
 try{const stored=await new Promise(resolve=>{const r=read.transaction('accounts').objectStore('accounts').get('default');r.onsuccess=()=>resolve(r.result);});assert.deepEqual(stored,future);}finally{read.close();}
});
