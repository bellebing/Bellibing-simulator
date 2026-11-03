import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium,firefox} from '@playwright/test';
import {scan} from './fixtures/inventory.mjs';

for(const [engineName,engine]of Object.entries({chromium,firefox}))test(engineName+': browser-local Python/SIFT and Tesseract WASM: startup, canonical review, invalid image and cancellation',async()=>{
 const root=resolve('artifacts/browser-scanner'),server=createServer(async(req,res)=>{try{
  const path=new URL(req.url,'http://local').pathname;if(path==='/'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Scanner verification</title>');return;}
  const file=resolve(root,'.'+decodeURIComponent(path));if(!file.startsWith(root+'/'))throw Error();
  res.setHeader('Content-Type',({'.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.wasm':'application/wasm'})[extname(file)]??'application/octet-stream');res.end(await readFile(file));
 }catch{res.writeHead(404);res.end();}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const url='http://127.0.0.1:'+server.address().port;
 const browser=await engine.launch({headless:true,timeout:20000,env:{...process.env,XDG_CACHE_HOME:resolve('artifacts/browser-cache'),MOZ_DISABLE_CONTENT_SANDBOX:'1'},args:engineName==='chromium'?['--no-sandbox']:[]});try{
  const page=await browser.newPage(),external=[];await page.route('**/*',route=>{if(!route.request().url().startsWith(url+'/')){external.push(route.request().url());return route.abort();}return route.continue();});
  await page.goto(url);
  const start=Date.now(),status=await page.evaluate(async()=>{const {createBrowserScanner}=await import('/client.mjs');window.scannerProgress=[];window.scanner=createBrowserScanner({onProgress:stage=>scannerProgress.push(stage)});return scanner.status();}).catch(async error=>{console.log('Scanner stages before failure:',await page.evaluate(()=>window.scannerProgress));throw error;});
  assert.equal(status.status,'READY');assert.equal(status.sift,true);console.log('Cold browser-local scanner startup ms:',Date.now()-start);
  const regression=await page.evaluate(()=>scanner.regressions());assert.deepEqual(regression.failures,[]);assert.ok(regression.passed>=21);console.log('Existing scanner regression cases in browser WASM:',regression.passed);
  const valid={...scan(),schemaVersion:1,kind:'bellibing-scanner-review'};
  assert.deepEqual(await page.evaluate(draft=>scanner.validate(draft),valid),{issues:[]});
  const rejected=await page.evaluate(async()=>{const c=document.createElement('canvas');c.width=1920;c.height=1080;const b=await new Promise(r=>c.toBlob(r));try{await scanner.scan(new File([b],'blank.png',{type:'image/png'}));return null;}catch(error){return error.message;}});
  assert.ok(rejected);assert.match(rejected,/card|chrome|layout/i);
  const elapsed=Date.now(),smoke=await page.evaluate(async()=>{const blob=await fetch('/ocr-crop.png').then(r=>r.blob());return scanner.diagnoseOCR(blob);});
  assert.match(smoke.main.join(' '),/CRIT Rate/i);assert.match(smoke.main.join(' '),/6\.3%/);assert.equal(smoke.batch.length,2);for(const text of smoke.batch)assert.match(text,/6\.3%/);console.log('Existing Python main-strip and batched browser OCR ms:',Date.now()-elapsed);
  const cancelled=await page.evaluate(async()=>{const abort=new AbortController();abort.abort();try{await scanner.status({signal:abort.signal});}catch(error){return error.message;}});assert.equal(cancelled,'SCANNER_ABORTED');
  assert.deepEqual(external,[]);await page.evaluate(()=>scanner.close());
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
});
