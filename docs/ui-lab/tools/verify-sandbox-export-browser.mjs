// Focused real-Chromium regression of the public export freshness boundary.
// HTTP responses are controlled: this does not execute the private local host.
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {chromium} from 'playwright';

const clientSource=await readFile(new URL('../v1.1/modules/sandbox-client.js',import.meta.url),'utf8');
let browser;
try{
 browser=await chromium.launch({executablePath:process.env.UI_LAB_CHROME_PATH??'/usr/bin/chromium',headless:true,args:['--no-sandbox']});
 const page=await browser.newPage();
 const errors=[];
 page.on('pageerror',error=>errors.push(error.message));
 const checks=await page.evaluate(async(source)=>{
  // Import the exact checked-out module as an ES module, not a JS reimplementation.
  const moduleURL=URL.createObjectURL(new Blob([source],{type:'text/javascript'}));
  const {createSandboxClient,SANDBOX_HTTP_PROTOCOL:protocol}=await import(moduleURL);
  URL.revokeObjectURL(moduleURL);
  const envelope={schemaVersion:1,kind:'BELLIBING_SANDBOX_HTTP_EXPORT_V1',run:{kind:'BELLIBING_SANDBOX_RUN_EXPORT_V1'}};
  let count=0,revision=0;
  const exportsPending=[];
  const fetcher=async(url,options)=>{
   if(url.endsWith('/guest'))return {ok:true,json:async()=>({protocol,csrfToken:'token',expiresAt:'2099-01-01T00:00:00Z'})};
   if(url.endsWith('/export')){
    if(options.method!=='GET'||options.headers['X-CSRF-Token']!=='token')throw Error('INVALID_EXPORT_REQUEST');
    return {ok:true,json:()=>new Promise(resolve=>exportsPending.push(resolve))};
   }
   const body=JSON.parse(options.body);
   if(url.endsWith('/runs')){count++;revision=0;}
   else if(url.endsWith('/step'))revision++;
   else if(url.endsWith('/reset'))revision++;
   return {ok:true,json:async()=>({protocol,runId:`run-${count}`,serverRevision:revision,
    clientGeneration:body.clientGeneration??'generation',status:'RUNNING',view:{slots:[]}})};
  };
  const client=createSandboxClient({readContext:()=>({characterId:'augusta'}),fetcher,id:()=> 'generation'});
  const finish=async data=>{
   for(let n=0;n<100&&!exportsPending.length;n++)await new Promise(resolve=>setTimeout(resolve,0));
   if(!exportsPending.length)throw Error('EXPORT_NOT_REQUESTED');
   exportsPending.shift()(data);
  };
  const rejects=async(promise,expected)=>{
   let actual;
   try{await promise;}catch(error){actual=error.message;}
   if(actual!==expected)throw Error(`Expected ${expected}, got ${actual??'resolved export'}`);
  };
  const checks=[];
  await client.start();
  let exportPromise=client.export();
  await client.step();
  await finish(envelope);
  await rejects(exportPromise,'STALE_SANDBOX_RESPONSE');
  checks.push('Step rejects older revision');

  exportPromise=client.export();
  await client.reset();
  await finish(envelope);
  await rejects(exportPromise,'STALE_SANDBOX_RESPONSE');
  if(client.snapshot()!==null)throw Error('RESET_RETAINED_RUN');
  checks.push('Reset rejects retired run');

  await client.start();
  exportPromise=client.export();
  const oldRunId=client.snapshot().runId;
  await client.start(); // Same owner snapshot and generation, different run identity.
  if(client.snapshot().runId===oldRunId)throw Error('RUN_ID_NOT_CHANGED');
  await finish(envelope);
  await rejects(exportPromise,'STALE_SANDBOX_RESPONSE');
  checks.push('New run rejects old run ID');

  exportPromise=client.export();
  await finish({...envelope,kind:'INVALID_EXPORT'});
  await rejects(exportPromise,'INVALID_SANDBOX_EXPORT');
  checks.push('Malformed envelope rejected');

  exportPromise=client.export();
  await finish(envelope);
  const received=await exportPromise;
  if(JSON.stringify(received)!==JSON.stringify(envelope))throw Error('VALID_EXPORT_MISMATCH');
  checks.push('Current export succeeds');
  return checks;
 },clientSource);
 assert.deepEqual(errors,[]);
 assert.equal(checks.length,5);
 console.log('Sandbox export Chromium PASS',JSON.stringify({chromium:browser.version(),checks}));
}finally{
 await browser?.close();
}
