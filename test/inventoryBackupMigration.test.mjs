import test from 'node:test';
import assert from 'node:assert/strict';
import {catalog,scan} from './fixtures/inventory.mjs';
import {emptyAccount,saveReviewedScan,exportAccount,parseBackup,withUserData,validateAccount} from '../src/inventoryAccount.mjs';
const account=()=>saveReviewedScan(emptyAccount(),scan(),catalog,{reviewed:true,assign:true});

test('new backups survive additive catalog updates and retain every physical ID and raw observation',()=>{
 const a=account(),next=structuredClone(catalog);next.sourceBinding='NEXT_RELEASE';
 next.characters.push({id:'future-character',name:'Future',weaponType:'Sword'});
 assert.deepEqual(parseBackup(JSON.stringify(exportAccount(a,catalog)),next),a);
 assert.deepEqual(a,parseBackup(JSON.stringify(exportAccount(a,catalog)),catalog));
});
test('changed or missing physical source identity blocks restore, preserving the original document',()=>{
 const a=account(),text=JSON.stringify(exportAccount(a,catalog)),next=structuredClone(catalog);next.sourceBinding='NEXT';
 const echo=Object.values(a.items).find(i=>i.kind==='echo');next.echoes=next.echoes.filter(e=>e.id!==echo.catalogId);
 assert.throws(()=>parseBackup(text,next));assert.equal(JSON.stringify(exportAccount(a,catalog)).replace(/"exportedAt":"[^"]+"/,''),text.replace(/"exportedAt":"[^"]+"/,''));
 assert.deepEqual(parseBackup(text,catalog),a);
});
test('old backup version remains readable on the original catalog and future format fails closed',()=>{
 const a=account(),old={format:'bellibing-inventory',schemaVersion:1,catalogBinding:catalog.sourceBinding,account:a};
 delete old.account.userData;
 const migrated=withUserData(parseBackup(JSON.stringify(old),catalog));
 assert.equal(migrated.id,a.id);assert.deepEqual(migrated.items,a.items);
 assert.deepEqual(parseBackup(JSON.stringify(exportAccount(migrated,catalog)),catalog),migrated);
 assert.throws(()=>parseBackup(JSON.stringify({...old,schemaVersion:999}),catalog));
 assert.throws(()=>parseBackup(JSON.stringify(old),{...catalog,sourceBinding:'OTHER'}));
});
test('live settings and observations survive roundtrip without allowing arbitrary storage/token keys',()=>{
 const a=account();a.userData.storage['bellibing.improve.policy.v3']=JSON.stringify({version:3,resourceInventory:{tuners:{kind:'FINITE',count:123}}});
 a.userData.observations={lupa:{version:1,rolls:[{name:'CRIT DMG',value:.174}]}};
 assert.deepEqual(parseBackup(JSON.stringify(exportAccount(a,catalog)),catalog),a);
 const bad=structuredClone(a);bad.userData.storage.googleToken='secret';assert.throws(()=>validateAccount(bad,catalog));
});
test('export refuses a document beyond import size limits rather than delivering an unrestorable file',()=>{
 const a=account();a.legacyRoot.large='x'.repeat(5*1024*1024);assert.throws(()=>exportAccount(a,catalog),/5 MiB/);
});
