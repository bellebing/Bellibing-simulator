// Loopback-only static app + data-only proxy to the separately licensed scanner.
// No private engine, guest capability, remote runtime or deployment is started.
import {spawn} from 'node:child_process';
import {resolve} from 'node:path';
import {startPreview} from './preview-simulator-v1.mjs';
const port=Number(process.env.IMPORT_PORT??8765),scannerPort=Number(process.env.SCANNER_PORT??8766);
if(!Number.isInteger(scannerPort)||scannerPort<1024||scannerPort>65535||scannerPort===port)throw Error('Invalid separate scanner port.');
const root=resolve('docs/ui-lab/scanner-poc');
const child=spawn(process.env.SCANNER_PYTHON??'python',[resolve(root,'serve.py'),'--port',String(scannerPort)],{env:{...process.env,TESSDATA_PREFIX:resolve(root,'tessdata'),...(process.env.SCANNER_PYTHONPATH?{PYTHONPATH:process.env.SCANNER_PYTHONPATH}:{})},stdio:['ignore','ignore','inherit']});
let scannerReady=false;child.on('exit',()=>{scannerReady=false;});child.on('error',()=>{scannerReady=false;});
const send=(res,status,value)=>{res.writeHead(status,{'Content-Type':'application/json','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(value));};
const server=await startPreview({port,reviewHandler:async(req,res,{origin})=>{
 const path=new URL(req.url,origin).pathname;
 if(path==='/sandbox/engine-release.json'){send(res,200,{version:1,status:'PENDING',files:[],reason:'LOCAL_IMPORT_REVIEW_ONLY'});return true;}
 if(!path.startsWith('/local-import/'))return false;
 if(req.headers.origin&&req.headers.origin!==origin){send(res,403,{error:'Same-origin local requests only.'});return true;}
 if(req.method!=='POST'||!['/local-import/scan','/local-import/validate'].includes(path)){send(res,404,{error:'Unknown import operation.'});return true;}
 const mime=req.headers['content-type']?.split(';')[0];
 if(path.endsWith('/scan')&&!['image/jpeg','image/png'].includes(mime)||path.endsWith('/validate')&&mime!=='application/json'){send(res,415,{error:'Unsupported input type.'});return true;}
 const declared=Number(req.headers['content-length']);if(!Number.isSafeInteger(declared)||declared<=0||declared>5*1024*1024){send(res,413,{error:'Choose a file up to 5 MiB.'});return true;}
 if(!scannerReady){send(res,503,{error:'Local scanner is starting or unavailable. Check its dependencies, then retry.'});return true;}
 const chunks=[];let size=0;for await(const chunk of req){size+=chunk.length;if(size>5*1024*1024){send(res,413,{error:'Input too large.'});return true;}chunks.push(chunk);}
 if(size!==declared){send(res,400,{error:'Incomplete input.'});return true;}
 try{const r=await fetch(`http://127.0.0.1:${scannerPort}/api/${path.endsWith('/scan')?'scan':'validate'}`,{method:'POST',headers:{'Content-Type':mime},body:Buffer.concat(chunks),signal:AbortSignal.timeout(45000)});const value=await r.json();send(res,r.status,value);}catch{send(res,503,{error:'Local scanner unavailable. Account remains unchanged.'});}
 return true;
}});
const interval=setInterval(async()=>{if(scannerReady)return;try{const r=await fetch(`http://127.0.0.1:${scannerPort}/api/catalog`,{signal:AbortSignal.timeout(1500)});scannerReady=r.ok;}catch{}},500);interval.unref();
const stop=()=>{clearInterval(interval);child.kill();server.close();};process.on('SIGINT',()=>{stop();process.exit(0);});process.on('SIGTERM',()=>{stop();process.exit(0);});
console.log(`Local Character Import: http://127.0.0.1:${server.address().port}/build/`);
