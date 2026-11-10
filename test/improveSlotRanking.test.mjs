import test from 'node:test';
import assert from 'node:assert/strict';
import {improveSlotRanking,improveRankMarkup,improveUpgradeMarkup} from '../docs/ui-lab/v1.1/modules/improve-slot-ranking.js';
const search=costs=>({status:'ESTIMATED',targetDps:101,scope:{goal:'INCREASE_TEAM_DPS'},slots:costs.map((cost,slot)=>({slot,status:'ESTIMATED',expectedCost:cost===null?null:{tuners:cost},probability:{successes:cost===null?0:10,samples:128,estimate:cost===null?0:10/128}}))});

test('rank 1 is hardest and 5 cheapest for a common whole-build DPS improvement',()=>{
 const input=search([500,100,1000,250,750]),before=structuredClone(input),rows=improveSlotRanking(input);
 assert.deepEqual(rows.map(r=>r.rank),[3,5,1,4,2]);
 assert.deepEqual(rows.filter(r=>r.start).map(r=>r.slot),[1]);assert.deepEqual(input,before);
 assert.match(improveUpgradeMarkup(rows[1]),/Tuners <strong>≈ 100<\/strong>/);
});

test('unresolved costs are not infinity, zero, or evidence for best rank',()=>{
 const rows=improveSlotRanking(search([500,null,100,300,200]));
 assert.equal(rows[1].rank,null);assert.equal(rows[1].cost,null);assert.equal(rows[1].start,false);
 assert.ok(rows.every(r=>r.rank===null));assert.equal(rows[2].start,true);
 assert.match(improveUpgradeMarkup(rows[1]),/<strong>Not estimated<\/strong>/);
 assert.doesNotMatch(improveRankMarkup(rows[2]),/improve-rank-number/);
});

test('ties share a rank but only one start is suggested; incomplete comparisons never show intervals',()=>{
 const tied=improveSlotRanking({...search([100,200,300,400,100]),recommendedSlot:4});
 assert.equal(tied[0].rank,5);assert.equal(tied[4].rank,5);
 assert.deepEqual(tied.filter(r=>r.start).map(r=>r.slot),[4]);
 const partial=improveSlotRanking(search([800,null,800,null,6400]));
 assert.ok(partial.every(r=>r.rank===null));assert.deepEqual(partial.filter(r=>r.start).map(r=>r.slot),[0]);
 assert.doesNotMatch(partial.map(improveRankMarkup).join(''),/2–5|1–3/);
 for(const input of [null,{...search([1,2,3,4,5]),status:'CALCULATING'},{...search([1,2,3,4,5]),scope:{goal:'RESTORE_ROTATION_ER'}},{...search([1,2,3,4,5]),slots:Array(5).fill(search([1,2,3,4,5]).slots[0])}]){
  const rows=improveSlotRanking(input);assert.ok(rows.every(r=>r.rank===null&&r.cost===null&&!r.start));
 }
 const invalid=search([1,2,3,4,5]);invalid.slots[0].expectedCost.tuners=Infinity;
 assert.equal(improveSlotRanking(invalid)[0].rank,null);
});
