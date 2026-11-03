import test from 'node:test';
import assert from 'node:assert/strict';
import {IDBFactory} from 'fake-indexeddb';
import {catalog,scan} from './fixtures/inventory.mjs';
import {emptyAccount,saveReviewedScan,saveOwnedTeam,exportAccount,parseBackup,validateAccount} from '../src/inventoryAccount.mjs';
import {openAccountStore} from '../src/inventoryAccountStore.mjs';
const ids=['augusta','iuno','the-shorekeeper'];
const fixture=()=>ids.reduce((account,id)=>saveReviewedScan(account,scan(id),catalog,{reviewed:true,assign:true}),emptyAccount());
test('team references survive save/reload and JSON restore without copying or changing equipment',async()=>{
 const indexedDB=new IDBFactory(),store=await openAccountStore({catalog,indexedDB,BroadcastChannel:null});
 const account=await store.commit(fixture()),items=structuredClone(account.items),characters=structuredClone(account.characters);
 const saved=await store.commit(saveOwnedTeam(account,{name:' Actual team ',characterIds:ids},catalog),{expectedRevision:account.revision,reason:'EXPLICIT_TEAM_SAVE'});
 assert.equal(saved.userData.teams[0].name,'Actual team');assert.deepEqual(saved.items,items);assert.deepEqual(saved.characters,characters);
 store.close();const reopened=await openAccountStore({catalog,indexedDB,BroadcastChannel:null});assert.deepEqual(reopened.snapshot(),saved);
 const restored=parseBackup(JSON.stringify(exportAccount(saved,catalog)),catalog);assert.deepEqual(restored.userData.teams,saved.userData.teams);assert.deepEqual(restored.items,items);
 const before=reopened.snapshot();await assert.rejects(reopened.commit(saveOwnedTeam(before,{...before.userData.teams[0],name:'Stale'},catalog),{expectedRevision:account.revision}),/changed/);assert.deepEqual(reopened.snapshot(),before);reopened.close();
});
test('invalid teams and forged backups fail closed; edits preserve saved identity',()=>{
 const account=fixture(),saved=saveOwnedTeam(account,{name:'Team',characterIds:ids},catalog),team=saved.userData.teams[0];
 assert.equal(account.userData.teams,undefined);
 const changed=saveOwnedTeam(saved,{...team,name:'Renamed'},catalog);assert.equal(changed.userData.teams.length,1);assert.equal(changed.userData.teams[0].id,team.id);
 for(const characterIds of [[ids[0],ids[0],ids[2]],[...ids.slice(0,2),'missing'],ids.slice(0,2)])assert.throws(()=>saveOwnedTeam(saved,{name:'Bad',characterIds},catalog));
 assert.throws(()=>saveOwnedTeam(saved,{name:' ',characterIds:ids},catalog));assert.throws(()=>saveOwnedTeam(saved,{id:'foreign',name:'Bad',characterIds:ids},catalog));
 const forged=structuredClone(saved);forged.userData.teams.push({...team});assert.throws(()=>validateAccount(forged,catalog));
});
