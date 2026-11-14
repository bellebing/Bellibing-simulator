import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveBuildInvestmentDefaults,resolveEchoInvestment} from '../src/buildInvestmentDefaults.mjs';
import {accountProjection} from '../docs/ui-lab/v1.1/modules/account-projection.js';
import {CHARACTER_CATALOG} from '../docs/ui-lab/v1.1/modules/catalog.js';
import {normalizeForteState} from '../src/characterForteUi.mjs';
import {scan} from './fixtures/inventory.mjs';

test('defaults affect unknown fields without mutating source or confirmed choices',()=>{
 const tree={nodes:[{id:'a',kind:'stat',parents:[],stat:{stat:'ATK%',value:.02}}]};
 const source={weaponId:'test',weaponRefinement:null,minorForteUnknown:true,forte:{schemaVersion:1,levels:{},enabled:{a:false}}};
 const result=resolveBuildInvestmentDefaults(source,tree);
 assert.equal(result.weaponRefinement,1);assert.equal(result.forte.enabled.a,true);
 assert.equal(source.weaponRefinement,null);assert.equal(source.forte.enabled.a,false);
 const confirmed=resolveBuildInvestmentDefaults({...source,weaponRefinement:3,minorForteUnknown:false},tree);
 assert.equal(confirmed.weaponRefinement,3);assert.equal(confirmed.forte.enabled.a,false);
});
test('five rolls imply +25 and gold, but explicit lower rarity or level is preserved',()=>{
 assert.deepEqual(resolveEchoInvestment({rank:null,level:null,substats:Array(5).fill({})}),{rank:5,level:25,substats:Array(5).fill({})});
 assert.equal(resolveEchoInvestment({rank:4,level:20,substats:Array(4).fill({})}).rank,4);
 assert.equal(resolveEchoInvestment({rank:null,level:null,substats:[]}).level,null);
});
test('existing imported Chisa shows Current stats with owner defaults, independent of team',()=>{
 const person=CHARACTER_CATALOG.find(p=>p.id==='chisa'),observation=scan('chisa');
 const build={characterLevel:90,weaponId:observation.weapon.id,weaponLevel:90,weaponRefinement:null,sequenceLevel:0,minorForteUnknown:true,forte:normalizeForteState(person.forte),echoSets:{activeSetId:'a',sets:{a:{slots:observation.echoes.map(e=>({...e,selectedSonataSetId:e.sonataId}))}}}};
 const original=structuredClone(build),storage={getItem:()=>JSON.stringify({characters:[person.name],drafts:{[person.name]:{character:person.name,build}}})};
 const result=accountProjection(person,storage);
 assert.ok(result.current);assert.ok(Object.values(result.currentValues).every(v=>v!==null));
 assert.deepEqual(build,original);assert.equal(result.assumedBuildFacts.length,2);
});


test('empty Echo slots and an unequipped weapon still show Character stats without inventing gear',()=>{
 const person=CHARACTER_CATALOG.find(p=>p.id==='chisa');
 const build={characterLevel:90,weaponId:null,sequenceLevel:0,minorForteUnknown:false,forte:normalizeForteState(person.forte),echoSets:{activeSetId:'a',sets:{a:{slots:Array(5).fill(null)}}}};
 const before=structuredClone(build),storage={getItem:()=>JSON.stringify({characters:[person.name],drafts:{[person.name]:{character:person.name,build}}})};
 const result=accountProjection(person,storage);assert.ok(result.current,result.reason);assert.ok(Object.values(result.currentValues).every(value=>value!==null));assert.deepEqual(build,before);
});
