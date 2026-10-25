import test from 'node:test';import assert from 'node:assert/strict';
import {createInteractiveEchoSession} from '../src/interactiveEchoSession.mjs';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const context=()=>({owner:{characterId:'augusta',slot:0,record:'real-read-only'},template:{echoId:'test-eligible',cost:3,mainStatName:'Electro DMG',selectedSonataSetId:'sonata-3'},target:{hard:[{name:'CRIT Rate',minimum:0.063}],flex:[],flexCount:0},gate:5,inventory:{version:1,tuners:{kind:'UNLIMITED'},echoes:{kind:'UNLIMITED'},tubes:Object.fromEntries(['premium','advanced','medium','basic'].map(id=>[id,{kind:'UNLIMITED'}]))},pending:null});
// Explicit +25 receipt fixture: this checks owner/RPC application, not another
// implementation of the recovery formula or Tube denomination algorithm.
const recovery=async({recovery:r})=>({protocol:'BELLIBING_ECHO_ADVICE_V1',result:{status:'RECOVERY_PROPOSAL',method:r.method,donorId:r.donorId,
 state:{revision:r.revision+1,inventory:structuredClone(r.inventory),progress:{cumulativeEchoEXP:0,tunedThrough:0}},
 ledger:{before:structuredClone(r.inventory),after:structuredClone(r.inventory),returned:{echoes:0,tuners:15,tubes:{premium:21,advanced:0,medium:1,basic:1}}}}});
test('five actual canonical reveals, Settings/Gate/resource changes without RNG and owner/reset isolation',async()=>{
 let input=context(),calls=0;const session=createInteractiveEchoSession({readContext:()=>input,seedFactory:()=>String(++calls),requestRecovery:recovery,requestAdvice:async()=>({protocol:'BELLIBING_ECHO_ADVICE_V1',result:{status:'PENDING'}})});
 session.advance();const first=session.snapshot();assert.equal(first.candidate.level,5);assert.equal(first.candidate.substats.length,1);assert.equal(first.spent.tuners,10);
 input={...input,gate:15,target:{...input.target,hard:[{name:'CRIT DMG',minimum:0.126}]}};session.sync();assert.deepEqual(session.snapshot().candidate,first.candidate);assert.equal(calls,2);
 for(let i=2;i<=5;i++){session.advance();assert.equal(session.snapshot().candidate.level,i*5);}assert.equal(new Set(session.snapshot().candidate.substats.map(r=>r.name)).size,5);assert.equal(session.snapshot().spent.tuners,50);
 await session.discard();assert.equal(session.snapshot().candidate.level,5);assert.equal(session.snapshot().spent.echoes,2);assert.equal(session.snapshot().spent.tuners,60);assert.equal(session.snapshot().returned.tuners,15);assert.ok(session.snapshot().history.some(e=>e.kind==='DISCARD'&&e.recovery));
 input={...input,owner:{...input.owner,characterId:'iuno'}};session.sync();assert.equal(session.snapshot(),null);session.advance();session.abort();assert.ok(session.snapshot().aborted);assert.throws(()=>session.advance());session.reset();assert.equal(session.snapshot(),null);await delay(150);
});
test('slots retain canonical prefixes while sharing one finite detached budget',()=>{
 const input=context();input.inventory.tuners={kind:'FINITE',count:20};const before=structuredClone(input);
 const s=createInteractiveEchoSession({readContext:()=>input,seedFactory:()=>String(input.owner.slot),requestAdvice:async()=>({protocol:'BELLIBING_ECHO_ADVICE_V1',result:{status:'PENDING'}})});
 s.advance();const first=s.snapshot().candidate;input.owner.slot=1;s.advance();const second=s.snapshot().candidate;
 assert.notEqual(first.id,second.id);assert.equal(s.snapshot().workspaceSpent.tuners,20);assert.throws(()=>s.advance(),/INSUFFICIENT_TUNERS/);
 input.owner.slot=0;s.sync();assert.deepEqual(s.snapshot().candidate,first);assert.throws(()=>s.advance(),/INSUFFICIENT_TUNERS/);
 assert.deepEqual(input.inventory,before.inventory);s.reset();
});
test('a stale recovery response cannot destroy a different owner or spend budget',async()=>{
 const input=context();let release;const s=createInteractiveEchoSession({readContext:()=>input,requestAdvice:async()=>({protocol:'BELLIBING_ECHO_ADVICE_V1',result:{status:'PENDING'}}),requestRecovery:body=>new Promise(resolve=>{release=()=>recovery(body).then(resolve);})});
 s.advance();const wait=s.discard();input.owner.characterId='iuno';s.sync();release();await assert.rejects(wait,/STALE_RECOVERY/);assert.equal(s.snapshot(),null);s.reset();
});
test('late responses cannot repopulate a retired owner or overwrite a new Settings/Gate context',async()=>{
 let input=context(),resolve;const session=createInteractiveEchoSession({readContext:()=>input,requestAdvice:()=>new Promise(r=>resolve=r)});session.advance();await delay(140);
 input={...input,gate:20};session.sync();resolve({protocol:'BELLIBING_ECHO_ADVICE_V1',result:{status:'VERIFIED',winner:'OBSOLETE'}});await delay(0);assert.equal(session.snapshot().advice,null);
 session.reset();await delay(150);assert.equal(session.snapshot(),null);
});
test('finite Tuner/Echo caps block before RNG and never spend account inventory',()=>{
 const input=context();input.inventory.tuners={kind:'FINITE',count:10};const raw=structuredClone(input);let seeds=0;
 const s=createInteractiveEchoSession({readContext:()=>input,seedFactory:()=>String(++seeds),requestAdvice:async()=>({})});s.advance();assert.throws(()=>s.advance(),/INSUFFICIENT_TUNERS/);assert.equal(seeds,2);assert.deepEqual(input,raw);s.reset();
});
test('feed commits only the exact destination identity named in the proposal',async()=>{
 for(const wrongDestination of [true,false]){
  const input=context();let captured;const s=createInteractiveEchoSession({readContext:()=>input,seedFactory:()=>String(wrongDestination),requestAdvice:async()=>({protocol:'BELLIBING_ECHO_ADVICE_V1',result:{kind:'CURRENT_BOUND_ECHO_ADVICE',status:'EXPERIMENTAL',winner:'DISCARD',recoveryMethod:'FEED'}}),requestRecovery:async body=>{
   captured=body.recovery;const response=await recovery(body);response.result.destinationId=wrongDestination?'a-different-physical-echo':captured.destinationId;
   response.result.state.progress.cumulativeEchoEXP=3000;response.result.ledger.returned={echoes:0,tuners:3,tubes:{premium:0,advanced:0,medium:0,basic:0}};return response;
  }});
  s.advance();await delay(150);const before=s.snapshot();
  if(wrongDestination){await assert.rejects(s.discard(),/INVALID_RECOVERY_REPLY/);assert.equal(s.snapshot().candidate.id,before.candidate.id);assert.deepEqual(s.snapshot().spent,before.spent);}
  else{await s.discard();assert.equal(s.snapshot().candidate.id,captured.destinationId);assert.notEqual(s.snapshot().candidate.id,captured.donorId);assert.equal(s.snapshot().returned.tuners,3);assert.equal(s.snapshot().progress.tunedThrough,5);}
  s.reset();
 }
});
