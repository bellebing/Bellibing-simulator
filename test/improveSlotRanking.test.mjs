import test from 'node:test';
import assert from 'node:assert/strict';
import {improveSlotRanking,improveRankMarkup,improveUpgradeMarkup} from '../docs/ui-lab/v1.1/modules/improve-slot-ranking.js';
const search=()=>({status:'ESTIMATED',targetDps:101,scope:{goal:'INCREASE_TEAM_DPS'},recommendedSlot:1,ranking:{status:'START_RESOLVED',slots:[3,1,5,2,4].map((rank,slot)=>({rank,slot}))},slots:[500,100,1000,250,750].map((cost,slot)=>({slot,status:'ESTIMATED',expectedCost:{tuners:cost},costBounds:{tuners:{lower:cost*.9,upper:cost*1.1}},estimation:{status:'RESOLVED',samples:8192},probability:{successes:1000,samples:8192,estimate:1000/8192}}))});
test('private confidence-backed rank uses 1 as best start; browser does not recalculate it',()=>{
 const input=search(),before=structuredClone(input),rows=improveSlotRanking(input);
 assert.deepEqual(rows.map(r=>r.rank),[3,1,5,2,4]);assert.deepEqual(rows.filter(r=>r.start).map(r=>r.slot),[1]);assert.deepEqual(input,before);
 assert.match(improveUpgradeMarkup(rows[1]),/Tuners <strong>≈ 100<\/strong>/);
});
test('unresolved competitors and overlapping costs remain visible without invented ranks',()=>{
 const input=search();input.ranking={status:'ORDER_UNCERTAIN',slots:input.slots.map(r=>({slot:r.slot,rank:null}))};input.recommendedSlot=null;
 const missing=input.slots[1];missing.expectedCost=null;missing.estimation.status='RARE_EVENT_UNRESOLVED';missing.probability.successes=0;missing.probability.estimate=0;missing.costBounds.tuners={lower:20000,upper:null};
 const rows=improveSlotRanking(input);assert.ok(rows.every(r=>r.rank===null&&!r.start));assert.match(improveUpgradeMarkup(rows[1]),/≥ 20,000/);assert.match(improveUpgradeMarkup(rows[1]),/Uncertain/);assert.doesNotMatch(improveRankMarkup(rows[0]),/improve-rank-number/);
});
test('old 128-sample responses never establish a start or ranking',()=>{
 const input=search();delete input.ranking;input.slots.forEach(r=>delete r.estimation);
 assert.ok(improveSlotRanking(input).every(r=>r.rank===null&&!r.start));
 for(const input of [null,{...search(),status:'CALCULATING'},{...search(),scope:{goal:'RESTORE_ROTATION_ER'}},{...search(),slots:Array(5).fill(search().slots[0])}])assert.ok(improveSlotRanking(input).every(r=>r.rank===null&&r.cost===null&&!r.start));
});
