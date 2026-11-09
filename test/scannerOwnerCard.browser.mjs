// Owner originals stay outside Git. Opt in with BELLIBING_CARTETHYIA_CARD.
import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {chromium} from '@playwright/test';
import {isInside} from '../scripts/local-paths.mjs';

test('Cartethyia original and WebP retain five Echoes and exact visible rolls', {skip:!process.env.BELLIBING_CARTETHYIA_CARD},async()=>{
 const root=resolve('artifacts/browser-scanner');
 const server=createServer(async(req,res)=>{try{
  const path=new URL(req.url,'http://local').pathname;
  if(path==='/'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Local OCR regression</title>');return;}
  const file=resolve(root,'.'+decodeURIComponent(path));if(!isInside(root,file))throw Error();
  res.setHeader('Content-Type',({'.mjs':'text/javascript','.js':'text/javascript','.json':'application/json','.wasm':'application/wasm'})[extname(file)]??'application/octet-stream');res.end(await readFile(file));
 }catch{res.writeHead(404);res.end();}});
 await new Promise(ok=>server.listen(0,'127.0.0.1',ok));
 let browser;
 try{
  browser=await chromium.launch({headless:true,...(process.env.BELLIBING_CHROMIUM_PATH?{executablePath:process.env.BELLIBING_CHROMIUM_PATH}:{})});
  const page=await browser.newPage();await page.goto('http://127.0.0.1:'+server.address().port);
  await page.evaluate(async()=>{const {createBrowserScanner}=await import('/client.mjs');globalThis.scanner=createBrowserScanner();});
  const bytes=[...await readFile(process.env.BELLIBING_CARTETHYIA_CARD)];
  for(const type of ['image/jpeg','image/webp']){
   const result=await page.evaluate(async({bytes,type})=>{
    let file=new File([new Uint8Array(bytes)],'card.jpeg',{type:'image/jpeg'});
    if(type==='image/webp'){
     const bitmap=await createImageBitmap(file),canvas=document.createElement('canvas');canvas.width=bitmap.width;canvas.height=bitmap.height;canvas.getContext('2d').drawImage(bitmap,0,0);bitmap.close();
     const webp=await new Promise(ok=>canvas.toBlob(ok,'image/webp',.95));const decoded=await createImageBitmap(webp);canvas.getContext('2d').drawImage(decoded,0,0);decoded.close();
     file=new File([await new Promise(ok=>canvas.toBlob(ok,'image/png'))],'decoded.png',{type:'image/png'});
    }
    return scanner.scan(file);
   },{bytes,type});
   const d=result.draft;
   assert.equal(d.character.id,'cartethyia');assert.equal(d.sequence,3);assert.equal(d.weapon.id,'defiers-thorn');
   assert.deepEqual(d.echoes.map(e=>e.echoId),['echo-60001065','echo-60001135','echo-60001035','echo-60001095','echo-60001105']);
   assert.deepEqual(d.echoes.map(e=>e.mainStat.value),[.44,.22,.228,.228,.228]);
   assert.deepEqual(d.echoes.map(e=>e.substats.map(s=>s.value)),[[.063,.109,.15,.079,.1],[.071,.174,.108,.069,50],[.087,.071,.118,.162,.079],[.086,.162,390,.075,.09],[.086,.174,.063,.101,50]]);
   assert.equal(d.echoes[2].substats[2].observedValue,.119);assert.equal(d.echoes[2].substats[2].needsReview,true);
   assert.deepEqual(result.issues,[]);
  }
  const regressions=await page.evaluate(()=>scanner.regressions());assert.deepEqual(regressions.failures,[]);assert.ok(regressions.passed>=21);
 }finally{await browser?.close();await new Promise(ok=>server.close(ok));}
});
