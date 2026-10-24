import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {prepareServerRelease} from '../scripts/prepare-server-release.mjs';
import {validateSandboxRelease} from '../scripts/sandbox-release.mjs';
import {checkRuntimeRelease} from '../scripts/check-runtime-release.mjs';
import {createBrowserSandboxClient} from '../docs/ui-lab/v1.1/modules/browser-client.js';
import {sandboxPendingCopy} from '../docs/ui-lab/v1.1/modules/sandbox-pending.js';
const plan=JSON.parse(readFileSync('scripts/sandbox-server-release-plan.json'));
const record=prepareServerRelease(plan,'owner-go:unit-test-only');
const ready=()=>new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':'https://bellebing.github.io','Access-Control-Allow-Methods':'POST','Access-Control-Allow-Headers':'Content-Type, Authorization'}});

test('prepared release remains separate from active approval and cannot carry secrets/files',()=>{
 const before=readFileSync('scripts/sandbox-release-approval.json','utf8');
 assert.equal(plan.status,'PENDING_RELEASE_GO');assert.equal(plan.candidate.review,null);
 assert.throws(()=>prepareServerRelease(plan),/OWNER_RELEASE_GO_REQUIRED/);
 assert.deepEqual(record.files,[]);assert.equal(record.endpoint,plan.candidate.endpoint);
 for(const change of [{token:'secret'},{files:[{path:'private.worker.js'}]},{review:null},{endpoint:'https://name:secret@host.invalid/runtime/v1/'},{endpoint:record.endpoint+'?token=secret'}])assert.throws(()=>validateSandboxRelease({...record,...change}));
 assert.throws(()=>validateSandboxRelease({version:1,status:'PENDING_REVIEW',review:null,files:[],token:'secret'}));
 assert.equal(readFileSync('scripts/sandbox-release-approval.json','utf8'),before);
});
test('Pending release performs no network work; active release readiness uses OPTIONS without admission',async()=>{
 await checkRuntimeRelease({version:1,status:'PENDING_REVIEW',review:null,files:[]},{fetchImpl(){throw Error('NO_NETWORK');}});
 let count=0;
 await checkRuntimeRelease(record,{fetchImpl:async(url,options)=>{count++;assert.equal(String(url),record.endpoint+'guest');assert.equal(options.method,'OPTIONS');assert.equal(options.credentials,'omit');assert.equal(options.redirect,'error');assert.equal(options.body,undefined);assert.equal(options.headers.Authorization,undefined);return ready();}});
 assert.equal(count,1);
});
test('offline, expired or wrong-CORS runtime blocks release without retries',async()=>{
 for(const response of [new Response(null,{status:503}),new Response(null,{status:404}),new Response(null,{status:204}),new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':'https://wrong.invalid'}})])await assert.rejects(checkRuntimeRelease(record,{fetchImpl:async()=>response}),/RUNTIME_RELEASE_NOT_READY/);
 let count=0;await assert.rejects(checkRuntimeRelease(record,{fetchImpl:async()=>{count++;throw Error('NETWORK_DOWN');}}),/NETWORK_DOWN/);assert.equal(count,1);
});
test('server shutdown produces Pending in browser facade without a completed run or private download',async()=>{
 const original=globalThis.fetch,calls=[];
 globalThis.fetch=async url=>{calls.push(String(url));return String(url).endsWith('engine-release.json')?{json:async()=>record}:{ok:false,json:async()=>({protocol:'BELLIBING_RUNTIME_V1',reason:'RUNTIME_UNAVAILABLE'})};};
 try{const client=createBrowserSandboxClient({readContext:()=>({characterId:'baizhi'})});const result=await client.metrics();assert.equal(result.status,'PENDING');assert.deepEqual(result.reasons,['RUNTIME_UNAVAILABLE']);assert.equal(client.snapshot(),null);await assert.rejects(client.start(),/RUNTIME_UNAVAILABLE/);assert.equal(client.snapshot().status,'PENDING');assert.equal(client.snapshot().runId,null);await assert.rejects(client.export(),/SANDBOX_RUN_REQUIRED/);assert.ok(!calls.some(p=>p.endsWith('.worker.js')));client.invalidate();}finally{globalThis.fetch=original;}
 for(const reason of ['RUNTIME_UNAVAILABLE','RUNTIME_BETA_EXPIRED','BETA_BUDGET_EXHAUSTED'])assert.match(sandboxPendingCopy([reason]).text,/unavailable/);
});
test('network failure is a stable unavailable reason rather than stale executable state',async()=>{
 const original=globalThis.fetch;
 globalThis.fetch=async url=>{if(String(url).endsWith('engine-release.json'))return {json:async()=>record};throw new TypeError('browser-specific network text');};
 try{const client=createBrowserSandboxClient({readContext:()=>({characterId:'baizhi'})});assert.deepEqual((await client.metrics()).reasons,['RUNTIME_UNAVAILABLE']);await assert.rejects(client.start(),TypeError);assert.deepEqual(client.snapshot().reasons,['RUNTIME_UNAVAILABLE']);client.invalidate();}finally{globalThis.fetch=original;}
});
test('Pages retains FULL/artifact/main gates and checks runtime before both package and deploy',()=>{
 const workflow=readFileSync('.github/workflows/deploy-pages.yml','utf8'),verify=readFileSync('.github/workflows/verify.yml','utf8');
 assert.match(verify,/needs: verify/);assert.ok(verify.includes("needs.verify.result == 'success'"));
 assert.ok(workflow.indexOf('Require configured runtime')<workflow.indexOf('Upload Pages artifact'));
 assert.ok(workflow.indexOf('Recheck configured runtime')<workflow.indexOf('Deploy to GitHub Pages'));
 const deploy=workflow.split('\n  deploy:\n')[1].split('\n  smoke:\n')[0];assert.ok(deploy.indexOf('Recheck configured runtime')<deploy.indexOf('Require current main revision'));
 assert.ok(workflow.includes('needs.package.outputs.runtime-release'));assert.ok(workflow.includes('build.headSha !== revision'));assert.ok(workflow.includes('Refusing to deploy an obsolete main revision'));
});
