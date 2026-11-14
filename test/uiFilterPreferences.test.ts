import test from 'node:test';
import assert from 'node:assert/strict';
import {createUiPreferenceStore,UI_PREFERENCES_PREFIX} from '../src/uiFilterPreferences.mjs';
import {characterRecommendations,recommendedEchoSlot,recommendedEchoFilterSetIds} from '../src/characterRecommendations.mjs';

function memoryStorage(){
 const bytes=new Map<string,string>();
 return {bytes,getItem:(key:string)=>bytes.get(key)??null,setItem:(key:string,value:string)=>{bytes.set(key,value);},removeItem:(key:string)=>bytes.delete(key)};
}
test('Augusta and Cartethyia Build suggestions retain source slot order and legal Main Stats',()=>{
 const guides=[['augusta',[4,3,3,1,1]],['cartethyia',[4,4,1,1,1]]] as const;
 for(const [characterId,costs] of guides){
  const source=characterRecommendations(characterId);
  assert.ok(source);
  const proposed=costs.map((cost,slot)=>{
   const row=recommendedEchoSlot(characterId,slot);
   assert.ok(row);
   assert.equal(row.cost,cost);
   const reference=source.mainStats.find(m=>m.slotOrder===slot+1);
   assert.equal(row.sourceText,reference?.sourceText);
   assert.deepEqual(row.mainStats,reference?.names);
   assert.ok(row.mainStats.length>0);
   return row.cost;
  });
  assert.deepEqual(proposed,costs);
 }
 assert.deepEqual(recommendedEchoFilterSetIds('augusta'),['sonata-20','sonata-3']);
 assert.deepEqual(recommendedEchoFilterSetIds('cartethyia'),['sonata-17']);
});
test('missing or invalid recommendations remain Pending instead of creating a default',()=>{
 assert.equal(recommendedEchoSlot('no-such-character',0),null);
 assert.equal(recommendedEchoSlot('augusta',5),null);
 assert.equal(recommendedEchoSlot('augusta',-1),null);
 assert.equal(recommendedEchoSlot('augusta',1.5),null);
 assert.deepEqual(recommendedEchoFilterSetIds('no-such-character'),[]);
});
test('UI preferences restore explicit manual Cost All, Sonata All, searches and disclosure independently by account',()=>{
 const storage=memoryStorage(),accountA=createUiPreferenceStore(storage,'local','account-a');
 assert.deepEqual(accountA.read('build:augusta:echo-slot:2'),{});
 accountA.write('build:augusta:echo-slot:2',{cost:null});
 accountA.write('build:augusta:echo',{sets:[],query:'Nightmare',sonataOpen:true});
 accountA.write('build:augusta:weapon',{query:'Thunder'});
 accountA.write('build:character-browser',{element:'Electro',query:'Augu'});
 const reloaded=createUiPreferenceStore(storage,'local','account-a');
 assert.deepEqual(reloaded.read('build:augusta:echo-slot:2'),{cost:null});
 assert.deepEqual(reloaded.read('build:augusta:echo'),{sets:[],query:'Nightmare',sonataOpen:true});
 assert.deepEqual(reloaded.read('build:augusta:weapon'),{query:'Thunder'});
 assert.deepEqual(reloaded.read('build:character-browser'),{element:'Electro',query:'Augu'});
 assert.deepEqual(reloaded.read('build:cartethyia:echo-slot:2'),{});
 assert.deepEqual(createUiPreferenceStore(storage,'local','account-b').read('build:augusta:echo'),{});
 assert.equal([...storage.bytes.keys()].length,1,'No Build drafts or Inventory records were persisted');
 assert.ok([...storage.bytes.keys()][0].startsWith(UI_PREFERENCES_PREFIX));
 const detached=reloaded.read('build:augusta:echo');detached.sets.push('sonata-20');
 assert.deepEqual(reloaded.read('build:augusta:echo').sets,[]);
});
test('separate Build/Improve/Team panel writers never erase unrelated UI groups',()=>{
 const storage=memoryStorage();
 const build=createUiPreferenceStore(storage,'local','same-account');
 const improve=createUiPreferenceStore(storage,'local','same-account');
 build.write('build:augusta:echo',{sets:['sonata-20']});
 improve.write('improve:augusta:echo',{sets:['sonata-3']});
 build.write('build:augusta:echo-slot:2',{cost:1});
 assert.deepEqual(improve.read('build:augusta:echo-slot:2'),{cost:1});
 assert.deepEqual(build.read('improve:augusta:echo'),{sets:['sonata-3']});
});
test('invalid optional UI preference JSON fails open without overwriting original bytes',()=>{
 const storage=memoryStorage();
 const writer=createUiPreferenceStore(storage,'local','account-a');
 storage.bytes.set(writer.key,'{invalid json');
 const reader=createUiPreferenceStore(storage,'local','account-a');
 assert.deepEqual(reader.read('build:augusta:echo'),{});
 assert.equal(storage.bytes.get(writer.key),'{invalid json');
 assert.throws(()=>reader.write('__proto__',{value:true}),/Invalid/);
});
