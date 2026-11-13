import test from 'node:test';
import assert from 'node:assert/strict';
import { CHARACTER_CATALOG } from '../src/data/characters.ts';
import { CHARACTER_ORIGINAL_RELEASE, compareCharactersByOriginalRelease, sortCharactersByOriginalRelease } from '../src/characterOriginalRelease.mjs';

const released=CHARACTER_CATALOG.filter(c=>c.releaseStatus==='RELEASED');
const sorted=()=>sortCharactersByOriginalRelease(released);
const chronology=c=>CHARACTER_ORIGINAL_RELEASE[c.id];

test('all current released canonical identities have original release metadata, not catalog checkedAt',()=>{
 assert.equal(released.length,61);
 assert.equal(new Set(released.map(c=>c.id)).size,released.length);
 for(const c of released){
  const row=chronology(c);
  assert.ok(row, c.id+' original debut missing');
  assert.match(row.patch,/^\d+\.\d+$/,c.id);
  assert.match(row.date,/^\d{4}-\d\d-\d\d$/,c.id);
  assert.ok(!Object.hasOwn(row,'checkedAt'),c.id);
 }
 assert.equal(CHARACTER_CATALOG.find(c=>c.id==='suoming')?.releaseStatus,'RELEASED');
 assert.ok(CHARACTER_ORIGINAL_RELEASE.suoming,'actual debut metadata supports released selection');
 assert.ok(CHARACTER_ORIGINAL_RELEASE.lily,'actual release date drives new top-5-star sorting');
 assert.equal(CHARACTER_CATALOG.filter(c=>c.id==='lily').length,1,'Lily imported without duplicate identity');
});

test('5-star first, reverse original release patch then date, all 4-star after them',()=>{
 const original=[...released],output=sorted();
 assert.deepEqual(released,original,'catalog may not be mutated');
 assert.equal(output.length,61);
 const firstFour=output.findIndex(c=>c.rarity===4);
 assert.ok(firstFour>0,'5-star group exists');
 assert.ok(output.slice(0,firstFour).every(c=>c.rarity===5));
 assert.ok(output.slice(firstFour).every(c=>c.rarity===4));
 assert.deepEqual(output.slice(0,5).map(c=>c.id),['lily','suoming','hsin','jingran','qingxiao']);
 assert.deepEqual(output.slice(firstFour,firstFour+3).map(c=>c.id),['buling','lumi','youhu']);
 for(let i=1;i<output.length;i++){
  assert.ok(compareCharactersByOriginalRelease(output[i-1],output[i])<=0,output[i-1].id+' / '+output[i].id);
 }
 assert.ok(output.findIndex(c=>c.id==='lucilla')<output.findIndex(c=>c.id==='rebecca'), 'within 3.4 original debut date wins');
 assert.ok(output.findIndex(c=>c.id==='rebecca')<output.findIndex(c=>c.id==='denia'), 'newer patch wins');
 assert.ok(output.findIndex(c=>c.id==='jinhsi')<output.findIndex(c=>c.id==='jiyan'), 'original debut, not Jiyan rerun');
});

test('same-patch same-day ties use stable canonical ID, independent of input and names',()=>{
 const ids=['rebecca','lucy','lucilla'];
 assert.deepEqual(sortCharactersByOriginalRelease(ids.map(id=>({id,rarity:5,name:'Z'}))).map(x=>x.id),['lucilla','lucy','rebecca']);
 assert.deepEqual(sortCharactersByOriginalRelease(ids.reverse().map(id=>({id,rarity:5,name:'A'}))).map(x=>x.id),['lucilla','lucy','rebecca']);
});

test('unsourced future entries fail closed below known same-rarity releases; added Lily sorts above newest when selectable',()=>{
 const output=sortCharactersByOriginalRelease([
  {id:'made-up-future',rarity:5,name:'AAA',checkedAt:'2099-01-01'},
  {id:'hsin',rarity:5,name:'Z'},
  {id:'lily',rarity:5,name:'Lily'},
  {id:'new-4',rarity:4},
  {id:'buling',rarity:4}
 ]);
 assert.deepEqual(output.map(c=>c.id),['lily','hsin','made-up-future','buling','new-4']);
 assert.equal(CHARACTER_ORIGINAL_RELEASE.lily.patch,'3.8');
 assert.equal(CHARACTER_ORIGINAL_RELEASE.hsin.patch,'3.7');
});
