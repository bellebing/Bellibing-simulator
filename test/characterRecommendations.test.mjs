import test from 'node:test';
import assert from 'node:assert/strict';
import {CHARACTER_GUIDE_RECOMMENDATIONS as guides} from '../src/data/characterEquipmentAssociations.ts';
import {characterRecommendations,recommendedMainStats,recommendedSetIds,recommendedWeaponIds,recommendationOrder} from '../src/characterRecommendations.mjs';
import catalog from '../docs/ui-prototypes/assets/echoes/browser-data.json' with {type:'json'};

test('all reviewed Characters retain legal recommended main alternatives and source evidence',()=>{
 assert.equal(guides.length,59);
 for(const source of guides){
  const result=characterRecommendations(source.characterId);assert.equal(result.sourceLinesSha256,source.sourceLinesSha256);assert.deepEqual(result.weapons,source.weapons);assert.deepEqual(result.sets,source.echoSets);
  for(const cost of [4,3,1]){const allowed=catalog.statEditor.mainStatsByCostAndLevel[cost][0].map(row=>row.name),names=recommendedMainStats(source.characterId,cost);assert.equal(names.length>0,source.mainStats.some(row=>row.cost===cost),source.characterId+' Cost '+cost);assert.ok(names.every(name=>allowed.includes(name)),source.characterId+': '+names);}
 }
});
test('Augusta and Aemeath alternatives survive normalization instead of the single-template shortcut',()=>{
 assert.deepEqual(recommendedMainStats('augusta',4),['CRIT Rate','CRIT DMG']);assert.deepEqual(recommendedMainStats('augusta',3),['Electro DMG','ATK%']);
 assert.deepEqual(recommendedMainStats('aemeath',4),['CRIT Rate','CRIT DMG']);assert.deepEqual(recommendedMainStats('aemeath',3),['Fusion DMG','ATK%']);
});
test('source order, context and nonrecommended alternatives are preserved without modifying source data',()=>{
 const before=JSON.stringify(guides),ids=recommendedWeaponIds('chisa');assert.equal(ids[0],'kumokiri');assert.ok(recommendedSetIds('chisa').includes('sonata-23'));
 const detached=characterRecommendations('chisa');assert.ok(detached.sets.some(s=>s.conditionExcerpt?.includes('third slot')));detached.sets[0].conditionExcerpt='changed';assert.equal(JSON.stringify(guides),before);
 const items=[{id:'other'},{id:ids[1]},{id:ids[0]}];assert.deepEqual(recommendationOrder(items,ids).map(r=>r.id),[ids[0],ids[1],'other']);assert.equal(items[0].id,'other');assert.equal(characterRecommendations('unknown'),null);
});
