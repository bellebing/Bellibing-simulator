import test from 'node:test';import assert from 'node:assert/strict';
import {createInteractiveEchoSession} from '../src/interactiveEchoSession.mjs';
const input=()=>({owner:{characterId:'real-character',slot:0,record:'real-owned',team:'initial'},template:{echoId:'eligible',cost:3,mainStatName:'Electro DMG',selectedSonataSetId:'sonata-3'},target:{hard:[],flex:[],flexCount:0},gate:5,inventory:{version:1,tuners:{kind:'FINITE',count:100},echoes:{kind:'FINITE',count:4},tubes:Object.fromEntries(['premium','advanced','medium','basic'].map(id=>[id,{kind:'UNLIMITED'}]))},pending:null});
const rolls=[{name:'Flat DEF',value:70},{name:'CRIT Rate',value:0.069},{name:'ATK%',value:0.086},{name:'Heavy Attack DMG',value:0.094},{name:'CRIT DMG',value:0.198}];
test('Improve records exact observed values, preserves the prefix across actual team/resource changes and rejects invalid rolls atomically',()=>{
 const c=input(),account=structuredClone(c),s=createInteractiveEchoSession({readContext:()=>c,requestAdvice:async()=>({protocol:'BELLIBING_ECHO_ADVICE_V1',result:{status:'PENDING'}})});
 assert.throws(()=>s.advance());assert.equal(s.snapshot(),null);
 s.advance(rolls[0]);const before=s.snapshot();assert.throws(()=>s.advance({name:'CRIT Rate',value:0.067}));assert.throws(()=>s.advance(rolls[0]));assert.deepEqual(s.snapshot(),before);
 c.owner.team='new-actual-team';c.inventory.tuners.count=90;s.sync();assert.deepEqual(s.snapshot().candidate.substats,[rolls[0]]);
 for(const r of rolls.slice(1))s.advance(r);assert.equal(s.snapshot().candidate.level,25);assert.deepEqual(s.snapshot().candidate.substats,rolls);assert.equal(s.snapshot().spent.tuners,50);
 assert.ok(s.snapshot().history.every(e=>e.kind==='OBSERVATION'));assert.deepEqual(c.owner.record,account.owner.record);assert.equal(c.inventory.echoes.count,account.inventory.echoes.count);s.reset();
});
test('stale observed replies cannot install advice after owner changes',async()=>{
 const c=input();let resolve;const s=createInteractiveEchoSession({readContext:()=>c,requestAdvice:()=>new Promise(r=>{resolve=r;})});s.advance(rolls[0]);await new Promise(r=>setTimeout(r,130));
 c.owner.characterId='another';s.sync();resolve({protocol:'BELLIBING_ECHO_ADVICE_V1',result:{winner:'KEEP_TEMPORARY'}});await new Promise(r=>setTimeout(r,0));assert.equal(s.snapshot(),null);s.reset();
});

test('manual Restart applies one staged recovery, acquires only +0 and waits for the next real observation',async()=>{
 const c=input(),before=structuredClone(c);let recoveries=0;
 const s=createInteractiveEchoSession({readContext:()=>c,requestAdvice:async()=>({protocol:'BELLIBING_ECHO_ADVICE_V1',result:{status:'PENDING'}}),requestRecovery:async({recovery:r})=>{
  recoveries++;const after=structuredClone(r.inventory);after.tuners.count+=3;
  return {protocol:'BELLIBING_ECHO_ADVICE_V1',result:{status:'RECOVERY_PROPOSAL',method:'DATA_RECOVERY',donorId:r.donorId,state:{revision:r.revision+1,inventory:after,progress:{cumulativeEchoEXP:0,tunedThrough:0}},ledger:{before:structuredClone(r.inventory),after,returned:{echoes:0,tuners:3,tubes:{premium:0,advanced:1,medium:1,basic:1}}}}};
 }});
 s.advance(rolls[0]);const first=s.snapshot();await s.discard();const fresh=s.snapshot();assert.equal(recoveries,1);assert.equal(fresh.candidate.level,0);assert.deepEqual(fresh.candidate.substats,[]);assert.notEqual(fresh.candidate.id,first.candidate.id);assert.equal(fresh.revision,first.revision+1);assert.equal(fresh.spent.tuners,10);assert.equal(fresh.returned.tuners,3);assert.equal(fresh.spent.echoes,2);
 await assert.rejects(s.discard(),/OBSERVE_FIRST_CHECKPOINT/);assert.equal(recoveries,1);s.advance(rolls[1]);assert.deepEqual(s.snapshot().candidate.substats,[rolls[1]]);assert.deepEqual(c,before);s.reset();
});
