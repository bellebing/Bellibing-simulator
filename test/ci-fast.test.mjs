import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,mkdtempSync,mkdirSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createHash} from 'node:crypto';
import {planFast,completePrFiles} from '../scripts/ci-fast.mjs';
const hash=value=>createHash('sha256').update(value).digest('hex');
const job=(source,name)=>source.split('  '+name+':\n')[1]?.split(/\n  [a-z-]+:\n/)[0];
const condition=block=>block.split('\n').find(line=>line.startsWith('    if:')).slice(8);
const evaluate=(expression,{draft=true,labels=[],action='synchronize',event='pull_request',label,verification,privateRepo=true,number=365}={})=>new Function('github','inputs','contains','return ('+expression.replaceAll('.labels.*.name','.labels')+');')({event_name:event,event:{action,label:label?{name:label}:{},repository:{private:privateRepo},pull_request:{number,draft,labels:labels.map(name=>({name}))}}},{verification},(list,name)=>list.some(x=>x.name===name));
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
 // The imported Foundation adds its own exact, additive verification block.
 // Strip only that separately pinned block before checking the original FULL.
 const foundation=steps.slice(steps.indexOf('      - name: Foundation account, migration and recovery regression'),steps.indexOf('      - name: Tests\n'));
 assert.equal(hash(foundation),'75764dd9f9cedf81272c655ab298fc79f9fbab5c5c9690125aa23c3218df48da');
 assert.equal(hash(steps.replace(foundation,'').replace(extra,'')),'b299857d2082bc61b0b519405ad2a5ac4c879b591681ed29f71eb5f61eb7bafa');
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

test('Draft #365 runs only risk-based FAST by default; heavy gates remain available for full, Ready, and manual review',()=>{
 const gated=[
  ['.github/workflows/inventory-account-json-review.yml','portable-account',true],
  ['.github/workflows/filter-preferences-review.yml','chromium',true],
  ['.github/workflows/import-character-mechanics-source.yml','import',true],
  ['.github/workflows/character-import-pipeline.yml','import-gates',false]
 ];
 for(const [path,name,otherPr] of gated){
  const source=readFileSync(path,'utf8'),expr=condition(job(source,name));
  assert.equal(evaluate(expr,{number:365,draft:true}),false,path+' draft should skip');
  assert.equal(evaluate(expr,{number:365,draft:false,action:'ready_for_review'}),true,path+' ready should run');
  assert.equal(evaluate(expr,{number:365,draft:true,labels:['full-verification'],action:'labeled'}),true,path+' explicit full should run');
  assert.equal(evaluate(expr,{event:'workflow_dispatch'}),true,path+' manual should run');
  if(otherPr)assert.equal(evaluate(expr,{number:366,draft:true}),true,path+' other PR should retain existing checks');
 }
 assert.equal(evaluate(condition(fast),{draft:true,action:'unlabeled',label:'full-verification'}),false,'label-only events should not run FAST');
});

function metadataFixture({count=301,changeHead=false,truncate=false}={}){
 let reads=0;
 return {repo:'owner/repo',head:'a'.repeat(40),number:365,request:async url=>{
  if(!url.includes('/files?'))return {head:{sha:++reads>1&&changeHead?'b'.repeat(40):'a'.repeat(40)},changed_files:count};
  const page=Number(new URL(url).searchParams.get('page')),start=(page-1)*100;
  return Array.from({length:truncate&&page===4?0:Math.min(100,count-start)},(_,i)=>({filename:`src/file-${start+i}.mjs`,...(start+i===0?{previous_filename:'src/old.mjs'}:{})}));
 }};
}
test('large PR metadata includes every page and previous rename path',async()=>{
 const files=await completePrFiles(metadataFixture());assert.equal(files.length,302);assert.ok(files.includes('src/file-300.mjs'));assert.ok(files.includes('src/old.mjs'));
});
test('large PR metadata rejects a changed head during pagination',async()=>{await assert.rejects(completePrFiles(metadataFixture({changeHead:true})),/DIFF_HEAD_CHANGED/);});
test('large PR metadata rejects truncated results',async()=>{await assert.rejects(completePrFiles(metadataFixture({truncate:true})),/DIFF_METADATA_INCOMPLETE/);});
test('large PR metadata refuses API file limits rather than silently passing',async()=>{await assert.rejects(completePrFiles(metadataFixture({count:3001})),/DIFF_TOO_LARGE_FOR_FAST_METADATA/);});
