import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {planFast} from '../scripts/ci-fast.mjs';
const hash=value=>createHash('sha256').update(value).digest('hex');
const job=(source,name)=>source.split('  '+name+':\n')[1]?.split(/\n  [a-z-]+:\n/)[0];
const condition=block=>block.split('\n').find(line=>line.startsWith('    if:')).slice(8);
const evaluate=(expression,{draft=true,labels=[],action='synchronize',event='pull_request',label,verification,privateRepo=true}={})=>new Function('github','inputs','contains','return ('+expression.replaceAll('.labels.*.name','.labels')+');')({event_name:event,event:{action,label:label?{name:label}:{},repository:{private:privateRepo},pull_request:{draft,labels:labels.map(name=>({name}))}}},{verification},(list,name)=>list.some(x=>x.name===name));
function fixture(){const directory=mkdtempSync(join(tmpdir(),'bellibing-fast-'));for(const name of ['src','test'])mkdirSync(join(directory,name));const put=(name,body)=>writeFileSync(join(directory,name),body);put('src/a.mjs','export const a=1;');put('src/b.mjs','export const b=1;');put('test/a.test.mjs',"import {a} from '../src/a.mjs';");put('test/b.test.mjs',"import {b} from '../src/b.mjs';");put('test/pinned.test.mjs',"import '../.cache/pin/source.mjs';");return {directory,put,close:()=>rmSync(directory,{recursive:true,force:true})};}
test('FAST selects affected self-contained tests and explicitly defers pinned-source tests',()=>{const f=fixture();try{const plan=planFast(['src/a.mjs','test/pinned.test.mjs'],f);assert.deepEqual(plan.tests,['test/a.test.mjs']);assert.deepEqual(plan.deferred.map(x=>x.path),['test/pinned.test.mjs']);assert.equal(plan.fullRequiredForMerge,true);assert.equal(plan.level,'FAST');assert.ok(!plan.tests.includes('test/b.test.mjs'));}finally{f.close();}});
test('FAST budgets are bounded and overflow is reported rather than claimed as passed',()=>{const f=fixture();try{for(let i=0;i<8;i++)f.put('test/a'+i+'.test.mjs',"import {a} from '../src/a.mjs';");const plan=planFast(['src/a.mjs'],f);assert.equal(plan.tests.length,3);assert.equal(plan.deferred.length,6);assert.ok(plan.deferred.every(x=>x.reason==='FAST_TEST_BUDGET_FULL_STILL_REQUIRED'));}finally{f.close();}});
test('docs do not trigger unrelated domain suites; path traversal is rejected',()=>{const f=fixture();try{assert.deepEqual(planFast(['docs/note.md'],f).tests,[]);assert.throws(()=>planFast(['../secret.mjs'],f),/INVALID_CHANGED_PATH/);}finally{f.close();}});

const workflow=readFileSync('.github/workflows/verify.yml','utf8'),full=job(workflow,'verify'),fast=job(workflow,'fast'),reviewSource=readFileSync('.github/workflows/ui-lab-review.yml','utf8'),review=job(reviewSource,'review');
test('public FULL preserves every audited M0 step and adds the observed Improve regression; broad UI review is unchanged',()=>{
 const steps=full.slice(full.indexOf('    steps:\n')),extra=' test/observedImproveSession.test.mjs';
 // Admit only this explicit extra test, in the existing detached regression
 // command. The original hash still protects every other byte of FULL.
 assert.equal(steps.split(extra).length,2);
 assert.ok(steps.includes('test/interactiveEchoSession.test.mjs'+extra+'\n'));
 assert.equal(hash(steps.replace(extra,'')),'db2eaf2fedaab4a373c45a7219ead0ff21052a9aa29b16e3af6af80883743ba7');
 assert.equal(hash(review.split('    steps:\n')[1]),'4510003680fcb7dbdc66d4750983e0e1860681eaf2da03d099795d3ff6c690e4');
 assert.ok(workflow.includes('needs: verify'));assert.ok(workflow.includes("github.ref == 'refs/heads/main' && needs.verify.result == 'success'"));
});
test('public FAST no longer performs full build, artifact upload or broad source audit',()=>{assert.ok(fast.includes('scripts/ci-fast.mjs'));for(const broad of ['npm run build','npm install','upload-artifact','audit:'])assert.ok(!fast.includes(broad));assert.match(fast,/timeout-minutes: 3/);});
test('Draft pushes do not run Chromium/FULL; Ready and explicit review opt-in still do',()=>{
 for(const options of [{},{action:'opened'}]){assert.equal(evaluate(condition(full),options),false);assert.equal(evaluate(condition(fast),options),true);assert.equal(evaluate(condition(review),options),false);}
 for(const options of [{draft:false},{draft:false,action:'ready_for_review'},{labels:['full-verification'],action:'labeled',label:'full-verification'}]){assert.equal(evaluate(condition(full),options),true);assert.equal(evaluate(condition(review),options),true);}
 assert.equal(evaluate(condition(review),{event:'workflow_dispatch'}),true);assert.equal(evaluate(condition(full),{event:'push'}),true);
 for(const action of ['labeled','unlabeled'])for(const block of [full,fast,review])assert.equal(evaluate(condition(block),{action,label:'unrelated',draft:false}),false);
 assert.ok(reviewSource.includes('ready_for_review'));assert.ok(reviewSource.includes('labeled, unlabeled'));
});
