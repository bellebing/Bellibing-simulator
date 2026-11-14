// Build-only preparation of existing SIFT descriptors with the same WASM
// OpenCV runtime. Does not read owner cards or change matching thresholds.
import {createServer} from 'node:http';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve,extname} from 'node:path';
import {createHash} from 'node:crypto';
import {chromium} from '@playwright/test';
const root=resolve('artifacts/browser-scanner'),cache=resolve('../.cache/browser-scanner');
const server=createServer(async(req,res)=>{try{const path=new URL(req.url,'http://local').pathname;if(path==='/'){res.setHeader('Content-Type','text/html');res.end('<!doctype html><title>Build-only SIFT preparation</title>');return;}const file=resolve(root,'.'+decodeURIComponent(path));if(!file.startsWith(root+'/'))throw Error();res.setHeader('Content-Type',({'.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.wasm':'application/wasm'})[extname(file)]??'application/octet-stream');res.end(await readFile(file));}catch{res.writeHead(404);res.end();}});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{const page=await browser.newPage();await page.goto('http://127.0.0.1:'+server.address().port);
 const encoded=await page.evaluate(async()=>{const {createBrowserScanner}=await import('/client.mjs');const scanner=createBrowserScanner();try{await scanner.status();return (await scanner.exportFeatures()).base64;}finally{scanner.close();}});
 const bytes=Buffer.from(encoded,'base64'),binding=JSON.parse(await readFile(root+'/binding.json','utf8'));
 await mkdir(cache,{recursive:true});await writeFile(cache+'/features.npz',bytes);await writeFile(cache+'/features-binding.json',JSON.stringify({...binding,sha256:createHash('sha256').update(bytes).digest('hex')}));console.log('Prepared source-bound WASM SIFT descriptors:',bytes.length,'bytes.');
}finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
