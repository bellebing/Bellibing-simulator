import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyResourceInventory} from '../src/resourceInventory.ts';
import {aggregateSimulatedResources,simulatedCostPresentation} from '../src/simulatedResourceCost.mjs';
// Explicit synthetic receipt-contract fixtures, not proof of engine integration.
const fixture=()=>{
 const before=emptyResourceInventory();before.echoes.count=2;before.tuners.count=20;before.tubes.premium.count=3;
 const after=structuredClone(before);after.echoes.count--;after.tuners.count-=10;after.tubes.premium.count--;after.tubes.basic.count++;
 const tubeBefore=structuredClone(before),tubeAfter=structuredClone(after);
 return {sessionId:'unit-contract-only',initialInventory:before,status:'RUNNING',selectedSlots:[1],events:[{sequence:1,resources:{before,after:before,ledger:null}},{sequence:2,resources:{before,after,ledger:{echoes:1,tuners:10,recovery:'NONE',tubes:{before:tubeBefore,after:tubeAfter,spent:{premium:1,advanced:0,medium:0,basic:0},returned:{premium:0,advanced:0,medium:0,basic:1},expBefore:0,suppliedEXP:5000,expAfter:4400,overflowEXP:600,unrepresentableEXP:100,crossed:[5],eligibleThrough:5}}}}]};
};
test('observed cost keeps gross/returns/signed denomination net/remaining and Gold-equivalent separate',()=>{
 const f=fixture(),copy=structuredClone(f),r=aggregateSimulatedResources(f);assert.deepEqual(f,copy);assert.equal(r.gross.tubes.premium,1);assert.equal(r.returned.tubes.basic,1);assert.equal(r.net.tubes.basic,-1);assert.equal(r.goldEquivalent.net,.9);assert.equal(r.remaining.echoes.count,1);assert.equal(r.expected,null);assert.equal(simulatedCostPresentation(r).tuners,10);
});
test('Unlimited changes balance feasibility, never actual gross spend; no paid ledger stays zero actual rather than Expected',()=>{
 const f=fixture();for(const state of [f.initialInventory,...f.events.flatMap(e=>[e.resources.before,e.resources.after,e.resources.ledger?.tubes.before,e.resources.ledger?.tubes.after].filter(Boolean))])state.echoes={kind:'UNLIMITED'};
 assert.equal(aggregateSimulatedResources(f).gross.echoes,1);
 const empty=fixture();empty.events=empty.events.slice(0,1);assert.equal(aggregateSimulatedResources(empty).gross.tuners,0);assert.equal(aggregateSimulatedResources(empty).expected,null);
});
test('replayed events, gaps, wrong inventories and private/unknown ledger expansion reject',()=>{
 const mutations=[f=>f.events.push(structuredClone(f.events[1])),f=>f.events[1].sequence=3,f=>f.events[1].resources.after.echoes.count=0,f=>f.events[1].resources.ledger.policy='private',f=>f.events[1].resources.ledger.tubes.spent.premium=-1,f=>f.events[1].resources.ledger.recovery='INFERRED',f=>f.events[0].resources.after.tubes.basic.count=2];
 for(const change of mutations){const f=fixture();change(f);assert.throws(()=>aggregateSimulatedResources(f));}
});
