import test from 'node:test';import assert from 'node:assert/strict';
import {createInteractiveEchoSession} from '../src/interactiveEchoSession.mjs';
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const context=()=>({owner:{characterId:'augusta',slot:0,record:'real-read-only'},template:{echoId:'test-eligible',cost:3,mainStatName:'Electro DMG',selectedSonataSetId:'sonata-3'},target:{hard:[{name:'CRIT Rate',minimum:0.063}],flex:[],flexCount:0},gate:5,inventory:{tuners:{kind:'UNLIMITED'},echoes:{kind:'UNLIMITED'}},pending:null});
test('five actual canonical reveals, Settings/Gate/resource changes without RNG and owner/reset isolation',async()=>{
 let input=context(),calls=0;const session=createInteractiveEchoSession({readContext:()=>input,seedFactory:()=>String(++calls),requestAdvice:async()=>({protocol:'BELLIBING_ECHO_ADVICE_V1',result:{status:'PENDING'}})});
 session.advance();const first=session.snapshot();assert.equal(first.candidate.level,5);assert.equal(first.candidate.substats.length,1);assert.equal(first.spent.tuners,10);
 input={...input,gate:15,target:{...input.target,hard:[{name:'CRIT DMG',minimum:0.126}]}};session.sync();assert.deepEqual(session.snapshot().candidate,first.candidate);assert.equal(calls,2);
 for(let i=2;i<=5;i++){session.advance();assert.equal(session.snapshot().candidate.level,i*5);}assert.equal(new Set(session.snapshot().candidate.substats.map(r=>r.name)).size,5);assert.equal(session.snapshot().spent.tuners,50);
 session.discard();assert.equal(session.snapshot().candidate.level,5);assert.equal(session.snapshot().spent.echoes,2);assert.equal(session.snapshot().spent.tuners,60);assert.ok(session.snapshot().history.some(e=>e.kind==='DISCARD'));
 input={...input,owner:{...input.owner,characterId:'iuno'}};session.sync();assert.equal(session.snapshot(),null);session.advance();session.abort();assert.ok(session.snapshot().aborted);assert.throws(()=>session.advance());session.reset();assert.equal(session.snapshot(),null);await delay(150);
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
