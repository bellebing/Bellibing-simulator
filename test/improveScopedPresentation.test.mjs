import test from 'node:test';
import assert from 'node:assert/strict';
import {createStatTargetCost} from '../docs/ui-lab/v1.1/modules/stat-target-cost.js';
import {dpsValueDirection} from '../docs/ui-lab/v1.1/modules/improve-comparison-basis.js';
const tick=()=>new Promise(resolve=>setImmediate(resolve));
const reply=cost=>({result:{status:'BEFORE_GATE',certificate:{exactFixedPoint:true},continue:{tuners:{approximate:cost}}}});
test('fresh stat costs share a request and retire results across settings and mode changes',async()=>{
 const calls=[],pending=[];
 const client=createStatTargetCost({request:body=>{calls.push(body);return new Promise(resolve=>pending.push(resolve));}});
 const c={owner:{characterId:'chisa'},target:{hard:[{name:'CRIT Rate',minimum:6.7}],flex:[],flexCount:0},gate:5,dpsPlan:{dpsEnabled:false}};
 client.sync(c);client.sync(c);await tick();assert.equal(calls.length,1);assert.deepEqual(calls[0].rolls,[]);
 pending.shift()(reply(500));await tick();assert.equal(client.read(c).tuners,500);
 const changed={...c,gate:10};assert.equal(client.read(changed),null);client.sync(changed);await tick();
 const on={...changed,dpsPlan:{dpsEnabled:true}};client.sync(on);pending.shift()(reply(800));await tick();assert.equal(client.read(on),null);
 client.sync(changed);await tick();pending.shift()(reply(900));await tick();assert.equal(client.read(changed).tuners,900);
 const minimum={...changed,target:{...c.target,hard:[{name:'CRIT Rate',minimum:8.1}]}};assert.equal(client.read(minimum),null);
});
test('each DPS column compares both directions and keeps ties and missing cells neutral',()=>{
 assert.equal(dpsValueDirection(120,100),'up');assert.equal(dpsValueDirection(100,120),'down');
 for(const pair of [[100,100],[100,100+1e-8],[null,100],[100,undefined],[NaN,0]])assert.equal(dpsValueDirection(...pair),'equal');
});
